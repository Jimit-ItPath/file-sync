import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import { getLocalStorage, setLocalStorage } from '../../utils/helper';

interface GoogleDriveState {
  hasAccess: boolean;
  isLoading: boolean;
  error: string | null;
  files: any[];
  pageToken: string | null;
  currentFolderId: string | null;
  currentPath: Array<{ id?: string; name: string }>;
}

const initialState: GoogleDriveState = {
  hasAccess: false,
  isLoading: false,
  error: null,
  files: [],
  pageToken: null,
  currentFolderId: null,
  currentPath: [],
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
  async (
    params: { pageToken?: string; folderId?: string | null },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as { googleDrive: GoogleDriveState };
      const folderId = params.folderId ?? state.googleDrive.currentFolderId;
      const response = await api.googleDrive.getFiles({
        pageToken: params.pageToken,
        folderId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch Google Drive files');
    }
  }
);

export const navigateToFolder = createAsyncThunk(
  'googleDrive/navigateToFolder',
  async (folder: { id: string; name: string } | null, { dispatch }) => {
    if (folder === null) {
      dispatch(resetGDriveFolder());
      await dispatch(fetchGoogleDriveFiles({}));
      return { folderId: null, folderName: 'My Drive', isRoot: true };
    } else {
      await dispatch(fetchGoogleDriveFiles({ folderId: folder.id }));
      return { folderId: folder.id, folderName: folder.name, isRoot: false };
    }
  }
);

export const initializeGoogleDriveFromStorage = createAsyncThunk(
  'googleDrive/initializeGoogleDriveFromStorage',
  async (_, { dispatch }) => {
    const savedPath = getLocalStorage('googleDrivePath');
    if (savedPath && savedPath.length > 0) {
      // Navigate to the last folder in the path
      const lastFolder = savedPath[savedPath.length - 1];
      if (lastFolder.id) {
        await dispatch(
          navigateToFolder({
            id: lastFolder.id,
            name: lastFolder.name,
          })
        );
      }
    } else {
      // Load root if no saved path
      await dispatch(fetchGoogleDriveFiles({}));
    }
  }
);

export const createGoogleDriveFolder = createAsyncThunk(
  'googleDrive/createGoogleDriveFolder',
  async (
    data: { folder_name: string; folderId?: string | null },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.googleDrive.createFolder({ data });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to create Google Drive folder');
    }
  }
);

export const renameGoogleDriveFile = createAsyncThunk(
  'googleDrive/renameGoogleDriveFile',
  async (data: { file_id: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await api.googleDrive.renameFile({ data });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to rename Google Drive file');
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
  reducers: {
    resetGDriveFolder: state => {
      state.currentFolderId = null;
      state.currentPath = [];
    },
  },
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
        const { files, pageToken } = action.payload?.data;
        state.isLoading = false;
        if (action.meta.arg.pageToken) {
          state.files = [...state.files, ...files];
        } else {
          state.files = files;
        }
        state.pageToken = pageToken;
      })
      .addCase(fetchGoogleDriveFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.files = [];
        state.pageToken = null;
      })
      .addCase(navigateToFolder.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(navigateToFolder.fulfilled, (state, action) => {
        const { folderId, folderName, isRoot } = action.payload;
        state.currentFolderId = folderId;

        if (isRoot) {
          state.currentPath = [];
        } else {
          // Check if we're navigating deeper or to a sibling folder
          const existingIndex = state.currentPath.findIndex(
            f => f.id === folderId
          );
          if (existingIndex >= 0) {
            // Navigated back to a previous folder
            state.currentPath = state.currentPath.slice(0, existingIndex + 1);
          } else {
            // Navigated to a new folder
            state.currentPath = [
              ...state.currentPath,
              { id: folderId ? String(folderId) : undefined, name: folderName },
            ];
          }
        }
        setLocalStorage('googleDrivePath', state.currentPath);
      })
      .addCase(navigateToFolder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.currentFolderId = null;
        state.currentPath = [];
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

export const { resetGDriveFolder } = googleDriveSlice.actions;

export default googleDriveSlice.reducer;
