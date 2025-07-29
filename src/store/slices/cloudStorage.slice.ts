import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api';

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
  currentFolderName: string;
  uploadLoading: boolean;
  accountId: string;
  searchTerm: string;
  navigateLoading: boolean;
};

const initialState: CloudStorageState = {
  cloudStorage: [],
  pagination: null,
  loading: false,
  error: null,
  currentFolderId: null,
  currentFolderName: '',
  // currentPath: localStorage.getItem('cloudStoragePath')
  //   ? JSON.parse(localStorage.getItem('cloudStoragePath') || '')
  //   : [],
  currentPath: [],
  uploadLoading: false,
  accountId: 'all',
  searchTerm: '',
  navigateLoading: false,
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
      return rejectWithValue(error?.message || 'Failed to fetch files');
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
      page?: number;
      limit?: number;
      searchTerm?: string;
    } | null
    // { dispatch }
  ) => {
    // const defaultPage = 1;
    // const defaultLimit = 20;
    if (data === null) {
      // dispatch(resetCloudStorageFolder());
      // await dispatch(
      //   fetchCloudStorageFiles({
      //     page: defaultPage,
      //     limit: defaultLimit,
      //   })
      // );
      return { folderId: null, folderName: 'All Files', isRoot: true };
    } else {
      // await dispatch(
      //   fetchCloudStorageFiles({
      //     id: data.id,
      //     account_type: data.account_type,
      //     account_id: data.account_id,
      //     page: data.page ?? defaultPage,
      //     limit: data.limit ?? defaultLimit,
      //     searchTerm: data.searchTerm,
      //   })
      // );
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
  async (
    data: {
      page?: number;
      limit?: number;
      id?: string;
      searchTerm?: string;
      account_id?: string;
    },
    { dispatch }
  ) => {
    // const savedPath = getLocalStorage('cloudStoragePath');
    const defaultPage = 1;
    const defaultLimit = 20;
    await dispatch(
      fetchCloudStorageFiles({
        id: data.id,
        account_id: data.account_id,
        page: data.page ?? defaultPage,
        limit: data.limit ?? defaultLimit,
        searchTerm: data.searchTerm,
      })
    );
    // if (savedPath && savedPath.length > 0) {
    //   // Navigate to the last folder in the path
    //   const lastFolder = savedPath[savedPath.length - 1];
    //   if (lastFolder.id) {
    //     await dispatch(
    //       navigateToFolder({
    //         id: lastFolder.id,
    //         account_id: lastFolder.account_id,
    //         name: lastFolder.name,
    //         page: data.page ?? defaultPage,
    //         limit: data.limit ?? defaultLimit,
    //         searchTerm: data.searchTerm,
    //       })
    //     );
    //   }
    // } else {
    //   // Load root if no saved path
    //   await dispatch(
    //     fetchCloudStorageFiles({
    //       id: data.id,
    //       page: data.page ?? defaultPage,
    //       limit: data.limit ?? defaultLimit,
    //       account_id: data.account_id,
    //       searchTerm: data.searchTerm,
    //     })
    //   );
    // }
  }
);

export const createCloudStorageFolder = createAsyncThunk(
  'cloudStorage/createCloudStorageFolder',
  async (
    data: { name: string; id?: string | null; account_id?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.cloudStorage.createFolder({ data });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to create folder');
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
      return rejectWithValue(error?.message || 'Failed to rename file');
    }
  }
);

export const uploadCloudStorageFiles = createAsyncThunk(
  'cloudStorage/uploadCloudStorageFiles',
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
      const response = await api.cloudStorage.uploadFiles({
        data,
        onUploadProgress,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to upload files');
    }
  }
);

export const removeCloudStorageFiles = createAsyncThunk(
  'cloudStorage/removeCloudStorageFiles',
  async (data: { ids: string[] }) => {
    try {
      const response = await api.cloudStorage.deleteFile({ data });
      return response.data;
    } catch (error: any) {
      return error;
    }
  }
);

export const downloadFiles = createAsyncThunk(
  'cloudStorage/downloadFiles',
  async (data: { ids: string[] }) => {
    try {
      const response = await api.cloudStorage.downloadFiles({ data });
      return response;
    } catch (error: any) {
      return error;
      // return rejectWithValue(error?.message || 'Failed to download files');
    }
  }
);

export const moveCloudStorageFiles = createAsyncThunk(
  'cloudStorage/moveCloudStorageFiles',
  async (data: { ids: string[]; destination_id: string | null }) => {
    try {
      const response = await api.cloudStorage.moveFiles({ data });
      return response;
    } catch (error: any) {
      return error;
    }
  }
);

export const syncCloudStorage = createAsyncThunk(
  'cloudStorage/syncCloudStorage',
  async (data: {
    account_id?: string | number;
    directory_id?: string | number;
  }) => {
    try {
      const response = await api.cloudStorage.syncStorage({ data });
      return response;
    } catch (error: any) {
      return error;
    }
  }
);

const cloudStorageSlice = createSlice({
  name: 'cloudStorage',
  initialState,
  reducers: {
    setAccountId: (state, action) => {
      state.accountId = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    resetCloudStorageFolder: state => {
      state.currentFolderId = null;
      state.currentPath = [];
    },
    updateCurrentPath: (state, action) => {
      const { id: folderId, name: folderName, isRoot } = action.payload;
      state.currentFolderId = folderId;

      if (isRoot) {
        state.currentPath = [];
        state.currentFolderName = '';
      } else if (folderId) {
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
            { id: folderId, name: folderName },
          ];
        }
        state.currentFolderName = folderName;
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCloudStorageFiles.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCloudStorageFiles.fulfilled, (state, action) => {
        const { data = [], paging = null } = action.payload?.data;
        state.loading = false;

        // Get the folder id from the action
        const newFolderId = action.meta.arg?.id ?? null;

        // If folder id changed, replace data; if same, append for pagination
        if (state.currentFolderId !== newFolderId) {
          state.cloudStorage = data;
          state.currentFolderId = newFolderId;
        } else if (action.meta.arg.page && action.meta.arg.page > 1) {
          state.cloudStorage = [...state.cloudStorage, ...data];
        } else {
          state.cloudStorage = data;
        }
        state.pagination = paging;
      })
      .addCase(fetchCloudStorageFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.cloudStorage = [];
        state.pagination = null;
      })
      .addCase(navigateToFolder.pending, state => {
        state.navigateLoading = true;
        state.error = null;
      })
      .addCase(navigateToFolder.fulfilled, (state, action) => {
        const { folderId, folderName, isRoot } = action.payload;
        // state.currentFolderId = folderId;

        if (isRoot) {
          state.currentPath = [];
          state.currentFolderId = null;
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
            // state.currentPath = [
            //   ...state.currentPath,
            //   { id: folderId ? String(folderId) : undefined, name: folderName },
            // ];
            const isAlreadyInPath = state.currentPath.some(
              f => f.id === folderId
            );
            if (!isAlreadyInPath) {
              state.currentPath = [
                ...state.currentPath,
                {
                  id: folderId ? String(folderId) : undefined,
                  name: folderName,
                },
              ];
            }
          }
          state.currentFolderId = folderId;
        }
        state.navigateLoading = false;
        // setLocalStorage('cloudStoragePath', state.currentPath);
        // setLocalStorage('folderId', state.currentFolderId);
      })
      .addCase(navigateToFolder.rejected, (state, action) => {
        state.navigateLoading = false;
        state.error = action.payload as string;
        // state.currentFolderId = null;
        // state.currentPath = [];
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
      .addCase(uploadCloudStorageFiles.pending, state => {
        state.uploadLoading = true;
      })
      .addCase(uploadCloudStorageFiles.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.cloudStorage = [
          ...state.cloudStorage,
          { ...(action.payload?.data || []) },
        ];
      })
      .addCase(uploadCloudStorageFiles.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  resetCloudStorageFolder,
  setAccountId,
  setSearchTerm,
  updateCurrentPath,
} = cloudStorageSlice.actions;

export default cloudStorageSlice.reducer;
