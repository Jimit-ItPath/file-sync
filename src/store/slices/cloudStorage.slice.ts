import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api';
import { getLocalStorage, setLocalStorage } from '../../utils/helper';

export type AccountType = 'google_drive' | 'dropbox' | 'onedrive';

type CloudStorageType = {
  id: string;
  account_id: string;
  account_type: string;
  external_id: string;
  parent_id: null | string;
  name: string;
  entry_type: 'folder' | 'file';
  mime_type: string;
  file_extension: null | string;
  size: null | string;
  path: null | string;
  created_at: string;
  modified_at: string;
  download_url: null | string;
  createdAt: string;
  updatedAt: string;
};

type CloudStorageState = {
  cloudStorage: CloudStorageType[];
  pagination: {
    total: number;
    total_pages: number;
    page_no: number;
    page_length: number;
    page_limit: number;
  } | null;
  loading: boolean;
  error: string | null;
  currentFolderId: string | null;
  currentPath: Array<{ id?: string; name: string }>;
};

const initialState: CloudStorageState = {
  cloudStorage: [],
  pagination: null,
  loading: false,
  error: null,
  currentFolderId: null,
  currentPath: localStorage.getItem('cloudStoragePath')
    ? JSON.parse(localStorage.getItem('cloudStoragePath') || '')
    : [],
};

export const fetchCloudStorageFiles = createAsyncThunk(
  'cloudStorage/fetchCloudStorageFiles',
  async (
    params: {
      account_id?: number | string;
      account_type?: 'google_drive' | 'dropbox' | 'onedrive';
      id?: string;
      searchTerm?: string;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.cloudStorage.getFiles(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to connect account');
    }
  }
);

export const navigateToFolder = createAsyncThunk(
  'cloudStorage/navigateToFolder',
  async (
    data: {
      id: string;
      account_type?: AccountType;
      account_id?: number | string;
      name: string;
    } | null,
    { dispatch }
  ) => {
    if (data === null) {
      dispatch(resetCloudStorageFolder());
      await dispatch(fetchCloudStorageFiles({}));
      return { folderId: null, folderName: 'All Files', isRoot: true };
    } else {
      await dispatch(
        fetchCloudStorageFiles({
          id: data.id,
          account_type: data.account_type,
          account_id: data.account_id,
        })
      );
      return {
        folderId: data.id,
        accountType: data.account_type,
        folderName: data.name,
        isRoot: false,
      };
    }
  }
);

export const initializeCloudStorageFromStorage = createAsyncThunk(
  'cloudStorage/initializeCloudStorageFromStorage',
  async (_, { dispatch }) => {
    const savedPath = getLocalStorage('cloudStoragePath');
    if (savedPath && savedPath.length > 0) {
      // Navigate to the last folder in the path
      const lastFolder = savedPath[savedPath.length - 1];
      if (lastFolder.id) {
        await dispatch(
          navigateToFolder({
            id: lastFolder.id,
            account_type: lastFolder.account_type,
            account_id: lastFolder.account_id,
            name: lastFolder.name,
          })
        );
      }
    } else {
      // Load root if no saved path
      await dispatch(fetchCloudStorageFiles({}));
    }
  }
);

export const createCloudStorageFolder = createAsyncThunk(
  'cloudStorage/createCloudStorageFolder',
  async (data: { name: string; id?: string | null }, { rejectWithValue }) => {
    try {
      const response = await api.cloudStorage.createFolder({ data });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || 'Failed to create Google Drive folder'
      );
    }
  }
);

export const renameCloudStorageFile = createAsyncThunk(
  'cloudStorage/renameCloudStorageFile',
  async (data: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await api.cloudStorage.renameFile({ data });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || 'Failed to rename Google Drive file'
      );
    }
  }
);

export const uploadCloudStorageFiles = createAsyncThunk(
  'cloudStorage/uploadCloudStorageFiles',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await api.cloudStorage.uploadFiles({ data });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || 'Failed to upload Google Drive files'
      );
    }
  }
);

export const removeCloudStorageFiles = createAsyncThunk(
  'cloudStorage/removeCloudStorageFiles',
  async (data: { ids: string[] }, { rejectWithValue }) => {
    try {
      const response = await api.cloudStorage.deleteFile({ data });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || 'Failed to remove Google Drive files'
      );
    }
  }
);

export const cloudStorageSlice = createSlice({
  name: 'cloudStorage',
  initialState,
  reducers: {
    resetCloudStorageFolder: state => {
      state.currentFolderId = null;
      state.currentPath = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCloudStorageFiles.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCloudStorageFiles.fulfilled, (state, action) => {
        //   state.cloudStorage = action.payload?.data?.data || [];
        //   state.pagination = action.payload?.data?.paging || null;
        const { data = [], pagination = null } = action.payload?.data;
        state.loading = false;
        if (action.meta.arg.page) {
          state.cloudStorage = [...state.cloudStorage, ...data];
        } else {
          state.cloudStorage = data;
        }
        state.pagination = pagination;
      })
      .addCase(fetchCloudStorageFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.cloudStorage = [];
        state.pagination = null;
      })
      .addCase(navigateToFolder.pending, state => {
        state.loading = true;
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
        setLocalStorage('cloudStoragePath', state.currentPath);
        setLocalStorage('folderId', state.currentFolderId);
      })
      .addCase(navigateToFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentFolderId = null;
        state.currentPath = [];
      })
      //   .addCase(createGoogleDriveFolder.pending, state => {
      //     state.isLoading = true;
      //   })
      .addCase(createCloudStorageFolder.fulfilled, (state, action) => {
        // state.isLoading = false;
        state.cloudStorage = [
          ...state.cloudStorage,
          { ...(action.payload?.data || []) },
        ];
      })
      .addCase(createCloudStorageFolder.rejected, (state, action) => {
        // state.isLoading = false;
        state.error = action.payload as string;
      })
      // .addCase(uploadGoogleDriveFiles.pending, state => {
      //   state.isLoading = true;
      // })
      .addCase(uploadCloudStorageFiles.fulfilled, (state, action) => {
        // state.isLoading = false;
        state.cloudStorage = [
          ...state.cloudStorage,
          { ...(action.payload?.data || []) },
        ];
      })
      .addCase(uploadCloudStorageFiles.rejected, (state, action) => {
        // state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetCloudStorageFolder } = cloudStorageSlice.actions;

export default cloudStorageSlice.reducer;
