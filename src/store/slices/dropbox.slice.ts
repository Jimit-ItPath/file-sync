import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';

interface DropboxState {
  hasAccess: boolean;
  isLoading: boolean;
  error: string | null;
  files: any[];
  cursor: string | null;
  hasMore: boolean;
}

const initialState: DropboxState = {
  hasAccess: false,
  isLoading: false,
  error: null,
  files: [],
  cursor: null,
  hasMore: false,
};

export const checkDropboxAccess = createAsyncThunk(
  'dropbox/checkDropboxAccess',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.dropbox.hasAccess();
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to check Dropbox access');
    }
  }
);

export const authenticateDropbox = createAsyncThunk(
  'dropbox/authenticateDropbox',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.dropbox.auth();
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to authenticate Dropbox');
    }
  }
);

export const fetchDropboxFiles = createAsyncThunk(
  'dropbox/fetchDropboxFiles',
  async (params: { cursor?: string }, { rejectWithValue }) => {
    try {
      const response = await api.dropbox.getFiles({ cursor: params.cursor });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch Dropbox files');
    }
  }
);

export const createDropboxFolder = createAsyncThunk(
  'dropbox/createDropboxFolder',
  async (data: { folder_name: string }, { rejectWithValue }) => {
    try {
      const response = await api.dropbox.createFolder({ data });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to create Dropbox folder');
    }
  }
);

export const uploadDropboxFiles = createAsyncThunk(
  'dropbox/uploadDropboxFiles',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await api.dropbox.uploadFiles({ data });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to upload Dropbox files');
    }
  }
);

export const renameDropboxFile = createAsyncThunk(
  'dropbox/renameDropboxFile',
  async (data: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await api.dropbox.renameFile({ data });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to rename Dropbox file');
    }
  }
);

export const removeDropboxFiles = createAsyncThunk(
  'dropbox/removeDropboxFiles',
  async (data: { id: string }, { rejectWithValue }) => {
    try {
      const response = await api.dropbox.deleteFile({ data });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to remove Dropbox files');
    }
  }
);

export const dropboxSlice = createSlice({
  name: 'dropbox',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(checkDropboxAccess.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkDropboxAccess.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasAccess = action.payload.data?.hasAccess;
      })
      .addCase(checkDropboxAccess.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(authenticateDropbox.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authenticateDropbox.fulfilled, state => {
        state.isLoading = false;
        state.hasAccess = true;
      })
      .addCase(authenticateDropbox.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDropboxFiles.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDropboxFiles.fulfilled, (state, action) => {
        const { entries, cursor, has_more } = action.payload?.data;
        state.isLoading = false;
        if (action.meta.arg.cursor) {
          state.files = [...state.files, ...entries];
        } else {
          state.files = entries;
        }
        state.cursor = cursor;
        state.hasMore = has_more;
      })
      .addCase(fetchDropboxFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.files = [];
        state.cursor = null;
        state.hasMore = false;
      })
      //   .addCase(createDropboxFolder.pending, state => {
      //     state.isLoading = true;
      //   })
      .addCase(createDropboxFolder.fulfilled, (state, action) => {
        // state.isLoading = false;
        state.files = [
          ...state.files,
          { ...(action.payload?.data?.metadata || []) },
        ];
      })
      .addCase(createDropboxFolder.rejected, (state, action) => {
        // state.isLoading = false;
        state.error = action.payload as string;
      })
      //   .addCase(uploadDropboxFiles.pending, state => {
      //     state.isLoading = true;
      //   })
      .addCase(uploadDropboxFiles.fulfilled, (state, action) => {
        // state.isLoading = false;
        state.files = [...state.files, { ...(action.payload?.data || []) }];
      })
      .addCase(uploadDropboxFiles.rejected, (state, action) => {
        // state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default dropboxSlice.reducer;
