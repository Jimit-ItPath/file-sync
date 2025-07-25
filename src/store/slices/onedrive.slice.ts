import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import { getLocalStorage, setLocalStorage } from '../../utils/helper';

type AccountType = 'google_drive' | 'dropbox' | 'onedrive';

type OneDriveStorageType = {
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

interface OneDriveState {
  oneDriveFiles: OneDriveStorageType[];
  pagination: {
    total: number;
    total_pages: number;
    page_no: number;
    page_length: number;
    page_limit: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  currentFolderId: string | null;
  currentPath: Array<{ id?: string; name: string }>;
  uploadLoading: boolean;
  searchTerm: string;
  navigateLoading: boolean;
}

const initialState: OneDriveState = {
  oneDriveFiles: [],
  pagination: null,
  isLoading: false,
  error: null,
  currentFolderId: null,
  currentPath: localStorage.getItem('oneDrivePath')
    ? JSON.parse(localStorage.getItem('oneDrivePath') || '')
    : [],
  uploadLoading: false,
  searchTerm: '',
  navigateLoading: false,
};

export const fetchOneDriveFiles = createAsyncThunk(
  'onedrive/fetchOneDriveFiles',
  async (
    params: {
      account_id: number | string;
      account_type?: 'google_drive' | 'dropbox' | 'onedrive';
      id?: string;
      searchTerm?: string;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.oneDrive.getFiles(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch files');
    }
  }
);

export const navigateToFolder = createAsyncThunk(
  'onedrive/navigateToFolder',
  async (
    data: {
      id?: string;
      account_type?: AccountType;
      account_id: number | string;
      name?: string;
      page?: number;
      limit?: number;
      searchTerm?: string;
    },
    { dispatch }
  ) => {
    const defaultPage = 1;
    const defaultLimit = 20;
    if (!data?.id) {
      dispatch(resetOneDriveFolder());
      await dispatch(
        fetchOneDriveFiles({
          page: defaultPage,
          limit: defaultLimit,
          account_id: data.account_id,
        })
      );
      return { folderId: null, folderName: 'All Files', isRoot: true };
    } else {
      await dispatch(
        fetchOneDriveFiles({
          id: data.id,
          account_type: data.account_type,
          account_id: data.account_id,
          page: data.page ?? defaultPage,
          limit: data.limit ?? defaultLimit,
          searchTerm: data.searchTerm,
        })
      );
      return {
        folderId: data.id,
        folderName: data.name,
        isRoot: false,
      };
    }
  }
);

export const initializeOneDriveFromStorage = createAsyncThunk(
  'onedrive/initializeOneDriveFromStorage',
  async (
    data: {
      page?: number;
      limit?: number;
      id?: string;
      searchTerm?: string;
      account_type?: string;
      account_id: number | string;
    },
    { dispatch }
  ) => {
    const savedPath = getLocalStorage('oneDrivePath');
    const defaultPage = 1;
    const defaultLimit = 20;
    if (savedPath && savedPath.length > 0) {
      // Navigate to the last folder in the path
      const lastFolder = savedPath[savedPath.length - 1];
      if (lastFolder.id) {
        await dispatch(
          navigateToFolder({
            id: lastFolder.id,
            account_id: lastFolder.account_id,
            name: lastFolder.name,
            page: data.page ?? defaultPage,
            limit: data.limit ?? defaultLimit,
            account_type: lastFolder.account_type,
            searchTerm: data.searchTerm,
          })
        );
      }
    } else {
      // Load root if no saved path
      await dispatch(
        fetchOneDriveFiles({
          id: data.id,
          page: data.page ?? defaultPage,
          limit: data.limit ?? defaultLimit,
          account_type: data.account_type as AccountType,
          searchTerm: data.searchTerm,
          account_id: data.account_id,
        })
      );
    }
  }
);

export const createOneDriveFolder = createAsyncThunk(
  'onedrive/createOneDriveFolder',
  async (
    data: { name: string; id?: string | null; account_id: number | string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.oneDrive.createFolder({ data });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || 'Failed to create OneDrive folder'
      );
    }
  }
);

export const renameOneDriveFile = createAsyncThunk(
  'onedrive/renameOneDriveFile',
  async (data: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await api.oneDrive.renameFile({ data });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || 'Failed to rename OneDrive file'
      );
    }
  }
);

export const uploadOneDriveFiles = createAsyncThunk(
  'onedrive/uploadOneDriveFiles',
  async (
    {
      data,
      onUploadProgress,
    }: {
      data: FormData;
      onUploadProgress?: (progressEvent: ProgressEvent) => void;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.oneDrive.uploadFiles({
        data,
        onUploadProgress,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || 'Failed to upload OneDrive files'
      );
    }
  }
);

export const removeOneDriveFiles = createAsyncThunk(
  'onedrive/removeOneDriveFiles',
  async (data: { ids: string[] }) => {
    try {
      const response = await api.oneDrive.deleteFile({ data });
      return response;
    } catch (error: any) {
      return error;
    }
  }
);

export const downloadOneDriveFiles = createAsyncThunk(
  'onedrive/downloadOneDriveFiles',
  async (data: { ids: string[] }) => {
    try {
      const response = await api.oneDrive.downloadFiles({ data });
      return response;
    } catch (error: any) {
      return error;
      // return rejectWithValue(error?.message || 'Failed to download files');
    }
  }
);

export const moveOneDriveFiles = createAsyncThunk(
  'onedrive/moveOneDriveFiles',
  async (data: { ids: string[]; destination_id: string | null }) => {
    try {
      const response = await api.oneDrive.moveFiles({ data });
      return response;
    } catch (error: any) {
      return error;
    }
  }
);

export const syncOneDrive = createAsyncThunk(
  'onedrive/syncOneDrive',
  async (data: { account_id?: string | number; directory_id?: string | number }) => {
    try {
      const response = await api.oneDrive.syncStorage({ data });
      return response;
    } catch (error: any) {
      return error;
    }
  }
);

const onedriveSlice = createSlice({
  name: 'onedrive',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    resetOneDriveFolder: state => {
      state.currentFolderId = null;
      state.currentPath = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchOneDriveFiles.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOneDriveFiles.fulfilled, (state, action) => {
        const { data = [], paging = null } = action.payload?.data;
        state.isLoading = false;

        // Get the folder id from the action
        const newFolderId = action.meta.arg?.id ?? null;

        // If folder id changed, replace data; if same, append for pagination
        if (state.currentFolderId !== newFolderId) {
          state.oneDriveFiles = data;
          state.currentFolderId = newFolderId;
        } else if (action.meta.arg.page && action.meta.arg.page > 1) {
          state.oneDriveFiles = [...state.oneDriveFiles, ...data];
        } else {
          state.oneDriveFiles = data;
        }
        state.pagination = paging;
      })
      .addCase(fetchOneDriveFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.oneDriveFiles = [];
        state.pagination = null;
      })
      .addCase(navigateToFolder.pending, state => {
        state.navigateLoading = true;
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
              {
                id: folderId ? String(folderId) : undefined,
                name: String(folderName),
              },
            ];
          }
        }
        state.navigateLoading = false;
        setLocalStorage('oneDrivePath', state.currentPath);
        setLocalStorage('oneDriveFolderId', state.currentFolderId);
      })
      .addCase(navigateToFolder.rejected, (state, action) => {
        state.navigateLoading = false;
        state.error = action.payload as string;
        state.currentFolderId = null;
        state.currentPath = [];
      })
      .addCase(createOneDriveFolder.fulfilled, (state, action) => {
        // state.isLoading = false;
        state.oneDriveFiles = [
          ...state.oneDriveFiles,
          { ...(action.payload?.data || []) },
        ];
      })
      .addCase(createOneDriveFolder.rejected, (state, action) => {
        // state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadOneDriveFiles.fulfilled, (state, action) => {
        // state.isLoading = false;
        state.oneDriveFiles = [
          ...state.oneDriveFiles,
          { ...(action.payload?.data || []) },
        ];
      })
      .addCase(uploadOneDriveFiles.rejected, (state, action) => {
        // state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetOneDriveFolder, setSearchTerm } = onedriveSlice.actions;

export default onedriveSlice.reducer;
