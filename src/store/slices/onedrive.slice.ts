import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';

export type OneDriveData = {
  items: {
    '@microsoft.graph.downloadUrl': string;
    createdDateTime: string;
    eTag: string;
    id: string;
    lastModifiedDateTime: string;
    name: string;
    webUrl: string;
    cTag: string;
    size: number;
    createdBy: {
      application: {
        id: string;
        displayName: string;
      };
      user: {
        email: string;
        id: string;
        displayName: string;
      };
    };
    lastModifiedBy: {
      application: {
        id: string;
        displayName: string;
      };
      user: {
        email: string;
        id: string;
        displayName: string;
      };
    };
    parentReference: {
      driveType: string;
      driveId: string;
      id: string;
      name: string;
      path: string;
      siteId: string;
    };
    file: {
      mimeType: string;
      hashes: {
        quickXorHash: string;
      };
    };
    fileSystemInfo: {
      createdDateTime: string;
      lastModifiedDateTime: string;
    };
  }[];
  nextLink: null | string;
};

interface OneDriveState {
  hasAccess: boolean;
  isLoading: boolean;
  error: string | null;
  files: OneDriveData['items'];
  nextLink: string | null;
}

const initialState: OneDriveState = {
  hasAccess: false,
  isLoading: false,
  error: null,
  files: [],
  nextLink: null,
};

export const checkOneDriveAccess = createAsyncThunk(
  'onedrive/checkOneDriveAccess',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.oneDrive.hasAccess();
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to check OneDrive access');
    }
  }
);

export const authenticateOneDrive = createAsyncThunk(
  'onedrive/authenticateOneDrive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.oneDrive.auth();
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to authenticate OneDrive');
    }
  }
);

export const fetchOneDriveFiles = createAsyncThunk(
  'onedrive/fetchOneDriveFiles',
  async (
    params: { nextLink?: string; parentId?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = params.nextLink
        ? await api.oneDrive.getFiles({ nextLink: params.nextLink })
        : await api.oneDrive.getFiles({});

      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch OneDrive files');
    }
  }
);

export const createOneDriveFolder = createAsyncThunk(
  'onedrive/createOneDriveFolder',
  async (data: { folder_name: string }, { rejectWithValue }) => {
    try {
      const response = await api.oneDrive.createFolder({ data });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to create OneDrive folder');
    }
  }
);

export const uploadOneDriveFiles = createAsyncThunk(
  'onedrive/uploadOneDriveFiles',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await api.oneDrive.uploadFiles({ data });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to upload OneDrive files');
    }
  }
);

export const renameOneDriveFile = createAsyncThunk(
  'onedrive/renameOneDriveFile',
  async (data: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await api.oneDrive.renameFile({ data });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to rename OneDrive file');
    }
  }
);

export const removeOneDriveFiles = createAsyncThunk(
  'onedrive/removeOneDriveFiles',
  async (data: { id: string }, { rejectWithValue }) => {
    try {
      const response = await api.oneDrive.deleteFile({ data });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to remove OneDrive files');
    }
  }
);

export const onedriveSlice = createSlice({
  name: 'onedrive',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(checkOneDriveAccess.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkOneDriveAccess.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasAccess = action.payload.data?.hasAccess;
      })
      .addCase(checkOneDriveAccess.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(authenticateOneDrive.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authenticateOneDrive.fulfilled, state => {
        state.isLoading = false;
        state.hasAccess = true;
      })
      .addCase(authenticateOneDrive.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOneDriveFiles.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        if (!action.meta.arg?.nextLink) {
          state.files = [];
          state.nextLink = null;
        }
      })
      .addCase(fetchOneDriveFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        const newItems = action.payload?.data?.items || [];

        if (action.meta.arg?.nextLink) {
          state.files = [...state.files, ...newItems];
        } else {
          state.files = newItems;
        }

        state.nextLink = action.payload?.data?.nextLink || null;
      })
      .addCase(fetchOneDriveFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        if (!action.meta.arg?.nextLink) {
          state.files = [];
          state.nextLink = null;
        }
      })
      //   .addCase(createOneDriveFolder.pending, state => {
      //     state.isLoading = true;
      //   })
      .addCase(createOneDriveFolder.fulfilled, (state, action) => {
        // state.isLoading = false;
        const newFolder = action.payload?.data?.items?.[0];
        if (newFolder) {
          state.files = [...state.files, newFolder];
        }
      })
      .addCase(createOneDriveFolder.rejected, (state, action) => {
        // state.isLoading = false;
        state.error = action.payload as string;
      })
      //   .addCase(uploadOneDriveFiles.pending, state => {
      //     state.isLoading = true;
      //   })
      .addCase(uploadOneDriveFiles.fulfilled, (state, action) => {
        // state.isLoading = false;
        const newFiles = action.payload?.data?.items || [];
        state.files = [...state.files, ...newFiles];
      })
      .addCase(uploadOneDriveFiles.rejected, (state, action) => {
        // state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default onedriveSlice.reducer;
