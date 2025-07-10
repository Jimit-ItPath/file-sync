import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';

interface GoogleDriveState {
  hasAccess: boolean;
  isLoading: boolean;
  error: string | null;
  files: any[];
}

const initialState: GoogleDriveState = {
  hasAccess: false,
  isLoading: false,
  error: null,
  files: [],
};

export const checkGoogleDriveAccess = createAsyncThunk(
  'googleDrive/checkGoogleDriveAccess',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.googleDrive.hasAccess();
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to check Google Drive access');
    }
  }
);

export const authenticateGoogleDrive = createAsyncThunk(
  'googleDrive/authenticateGoogleDrive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.googleDrive.auth();
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to authenticate Google Drive');
    }
  }
);

export const fetchGoogleDriveFiles = createAsyncThunk(
  'googleDrive/fetchGoogleDriveFiles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.googleDrive.getFiles();
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch Google Drive files');
    }
  }
);

export const createGoogleDriveFolder = createAsyncThunk(
  'googleDrive/createGoogleDriveFolder',
  async (data: { folder_name: string }, { rejectWithValue }) => {
    try {
      const response = await api.googleDrive.createFolder({ data });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to create Google Drive folder');
    }
  }
);

export const uploadGoogleDriveFiles = createAsyncThunk(
  'googleDrive/uploadGoogleDriveFiles',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await api.googleDrive.uploadFiles({ data });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to upload Google Drive files');
    }
  }
);

export const removeGoogleDriveFiles = createAsyncThunk(
  'googleDrive/removeGoogleDriveFiles',
  async (data: { field: string }, { rejectWithValue }) => {
    try {
      const response = await api.googleDrive.deleteFile({ data });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to remove Google Drive files');
    }
  }
);

export const googleDriveSlice = createSlice({
  name: 'googleDrive',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(checkGoogleDriveAccess.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkGoogleDriveAccess.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasAccess = action.payload.data?.hasAccess;
      })
      .addCase(checkGoogleDriveAccess.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(authenticateGoogleDrive.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authenticateGoogleDrive.fulfilled, state => {
        state.isLoading = false;
        state.hasAccess = true;
      })
      .addCase(authenticateGoogleDrive.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchGoogleDriveFiles.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGoogleDriveFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.files = action.payload?.data?.files || [];
      })
      .addCase(fetchGoogleDriveFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.files = [];
      })
      //   .addCase(createGoogleDriveFolder.pending, state => {
      //     state.isLoading = true;
      //   })
      .addCase(createGoogleDriveFolder.fulfilled, (state, action) => {
        // state.isLoading = false;
        state.files = [...state.files, { ...(action.payload?.data || []) }];
      })
      .addCase(createGoogleDriveFolder.rejected, (state, action) => {
        // state.isLoading = false;
        state.error = action.payload as string;
      })
      // .addCase(uploadGoogleDriveFiles.pending, state => {
      //   state.isLoading = true;
      // })
      .addCase(uploadGoogleDriveFiles.fulfilled, (state, action) => {
        // state.isLoading = false;
        state.files = [...state.files, { ...(action.payload?.data || []) }];
      })
      .addCase(uploadGoogleDriveFiles.rejected, (state, action) => {
        // state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default googleDriveSlice.reducer;
