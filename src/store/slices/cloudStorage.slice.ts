import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api';
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from '../../utils/helper';

export type AccountType = 'google_drive' | 'dropbox' | 'onedrive';

export type CloudStorageType = {
  UserConnectedAccount: {
    id: string;
    account_name: string;
    account_type: string;
  };
  id: string;
  account_id: string;
  account_type: string;
  external_id: string;
  parent_id: null | string;
  external_parent_id?: null | string;
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
  web_view_url: null | string;
};

type CloudStorageState = {
  cloudStorage: CloudStorageType[];
  recentFiles: CloudStorageType[];
  pagination: {
    total: number;
    total_pages: number;
    page_no: number;
    page_length: number;
    page_limit: number;
  } | null;
  hasPaginationData: boolean;
  loading: boolean;
  error: string | null;
  currentFolderId: string | null;
  currentPath: Array<{ id?: string; name: string }>;
  uploadLoading: boolean;
  accountId: string;
  searchTerm: string;
  navigateLoading: boolean;
  moveModal: {
    folders: CloudStorageType[];
    loading: boolean;
    error: string | null;
    currentPath: Array<{ id?: string; name: string }>;
    pagination?: {
      total: number;
      total_pages: number;
      page_no: number;
      page_limit: number;
    } | null;
  };
};

const initialState: CloudStorageState = {
  cloudStorage: [],
  recentFiles: [],
  pagination: null,
  hasPaginationData: false,
  loading: false,
  error: null,
  currentFolderId: null,
  currentPath: localStorage.getItem('cloudStoragePath')
    ? JSON.parse(localStorage.getItem('cloudStoragePath') || '')
    : [],
  uploadLoading: false,
  accountId: 'all',
  searchTerm: '',
  navigateLoading: false,
  moveModal: {
    folders: [],
    loading: false,
    error: null,
    currentPath: [],
    pagination: null,
  },
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
      type?: string;
      start_date?: string;
      end_date?: string;
      is_breadcrumb?: boolean;
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

export const fetchRecentFiles = createAsyncThunk(
  'cloudStorage/fetchRecentFiles',
  async (
    params: {
      account_id?: number | string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.cloudStorage.getRecentFiles(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch recent files');
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
      type?: string;
      start_date?: string;
      end_date?: string;
      is_breadcrumb?: boolean;
    } | null,
    { dispatch }
  ) => {
    const defaultPage = 1;
    const defaultLimit = 20;
    if (data === null) {
      dispatch(resetCloudStorageFolder());
      await dispatch(
        fetchCloudStorageFiles({
          page: defaultPage,
          limit: defaultLimit,
        })
      );
      return {
        folderId: null,
        folderName: 'All Files',
        isRoot: true,
        breadcrumb: [],
      };
    } else {
      const res = await dispatch(
        fetchCloudStorageFiles({
          id: data.id,
          account_type: data.account_type,
          account_id: data.account_id,
          page: data.page ?? defaultPage,
          limit: data.limit ?? defaultLimit,
          searchTerm: data.searchTerm,
          type: data.type,
          start_date: data.start_date,
          end_date: data.end_date,
          is_breadcrumb: data.is_breadcrumb,
        })
      );
      const breadcrumb = res?.payload?.data?.breadcrumb || [];
      return {
        folderId: data.id,
        accountType: data.account_type,
        folderName: data.name,
        isRoot: false,
        breadcrumb,
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
      type?: string;
      start_date?: string;
      end_date?: string;
    },
    { dispatch }
  ) => {
    const savedPath = getLocalStorage('cloudStoragePath');
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
            searchTerm: data.searchTerm,
            type: data.type,
            start_date: data.start_date,
            end_date: data.end_date,
          })
        );
      }
    } else {
      // Load root if no saved path
      await dispatch(
        fetchCloudStorageFiles({
          id: data.id,
          page: data.page ?? defaultPage,
          limit: data.limit ?? defaultLimit,
          account_id: data.account_id,
          searchTerm: data.searchTerm,
          type: data.type,
          start_date: data.start_date,
          end_date: data.end_date,
        })
      );
    }
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

export const fetchMoveModalFolders = createAsyncThunk(
  'cloudStorage/fetchMoveModalFolders',
  async (
    params: {
      account_id?: number | string;
      account_type?: 'google_drive' | 'dropbox' | 'onedrive';
      id?: string;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.cloudStorage.getFiles(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch folders');
    }
  }
);

export const uploadCloudStorageFilesV2 = createAsyncThunk(
  'cloudStorage/uploadCloudStorageFilesV2',
  async (
    {
      files,
      id,
      account_id,
    }: {
      files: File[];
      id?: string;
      account_id?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const payload = {
        files: files.map(file => ({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        })),
        ...(id && { id }),
        ...(account_id && { account_id }),
      };

      const response = await api.cloudStorage.uploadFilesV2({ data: payload });
      return { response: response.data, originalFiles: files };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to get upload URLs');
    }
  }
);

export const uploadFileChunk = createAsyncThunk(
  'cloudStorage/uploadFileChunk',
  async (
    {
      uploadUrl,
      chunk,
      headers,
      onProgress,
    }: {
      uploadUrl: string;
      chunk: Blob;
      headers: Record<string, string>;
      onProgress?: (progress: number) => void;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.cloudStorage.uploadChunk({
        uploadUrl,
        chunk,
        headers,
        onProgress,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to upload chunk');
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
      state.cloudStorage = [];
      state.pagination = null;
      state.searchTerm = '';
      state.moveModal = {
        folders: [],
        loading: false,
        error: null,
        currentPath: [],
        pagination: null,
      };
      state.recentFiles = [];
      state.accountId = 'all';
    },
    resetPagination: state => {
      if (state.pagination) {
        state.pagination.page_no = 1;
      }
    },
    setMoveModalPath: (state, action) => {
      state.moveModal.currentPath = action.payload;
    },
    resetMoveModalState: state => {
      state.moveModal = {
        folders: [],
        loading: false,
        error: null,
        currentPath: [],
      };
    },
    resetRecentFiles: state => {
      state.recentFiles = [];
    },
    updateFileUploadProgress: (state, action) => {
      const { fileId, progress } = action.payload;
      // This will be handled in the component state
    },
    setFileUploadStatus: (state, action) => {
      const { fileId, status } = action.payload;
      // This will be handled in the component state
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCloudStorageFiles.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        if (action?.meta?.arg?.page === 1) {
          state.hasPaginationData = true;
        }
      })
      .addCase(fetchCloudStorageFiles.fulfilled, (state, action) => {
        const { data = [], paging = null } = action.payload?.data;
        state.loading = false;
        state.hasPaginationData = false;

        // Get the folder id from the action
        const newFolderId = action.meta.arg?.id ?? null;

        // If folder id changed, replace data; if same, append for pagination
        if (
          state.currentFolderId !== newFolderId &&
          action.meta.arg.page === 1
        ) {
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
        state.hasPaginationData = false;
      })
      .addCase(fetchRecentFiles.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.recentFiles = action.payload?.data?.rows || [];
      })
      .addCase(fetchRecentFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.recentFiles = [];
      })
      .addCase(navigateToFolder.pending, state => {
        state.navigateLoading = true;
        state.error = null;
      })
      .addCase(navigateToFolder.fulfilled, (state, action) => {
        const { folderId, folderName, isRoot, breadcrumb } = action.payload;
        state.currentFolderId = folderId;

        if (isRoot || !folderId) {
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
        if (Array.isArray(breadcrumb) && breadcrumb.length > 0) {
          const normalized = [...breadcrumb].reverse();
          state.currentPath = [
            ...state.currentPath.slice(0, -1),
            ...normalized,
            state.currentPath[state.currentPath.length - 1],
          ];
        }
        state.navigateLoading = false;
        setLocalStorage('cloudStoragePath', state.currentPath);
        if (state.currentFolderId) {
          setLocalStorage('folderId', state.currentFolderId);
        } else {
          removeLocalStorage('folderId');
        }
      })
      .addCase(navigateToFolder.rejected, (state, action) => {
        state.navigateLoading = false;
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
      })
      .addCase(fetchMoveModalFolders.pending, state => {
        state.moveModal.loading = true;
        state.moveModal.error = null;
      })
      .addCase(fetchMoveModalFolders.fulfilled, (state, action) => {
        const { data = [], paging = null } = action.payload?.data;
        state.moveModal.loading = false;
        if (action.meta.arg.page && action.meta.arg.page > 1) {
          state.moveModal.folders = [
            ...state.moveModal.folders,
            ...data.filter(
              (item: CloudStorageType) => item.entry_type === 'folder'
            ),
          ];
        } else {
          state.moveModal.folders = data.filter(
            (item: CloudStorageType) => item.entry_type === 'folder'
          );
        }
        state.moveModal.pagination = paging;
      })
      .addCase(fetchMoveModalFolders.rejected, (state, action) => {
        state.moveModal.loading = false;
        state.moveModal.error = action.payload as string;
        state.moveModal.folders = [];
      });
  },
});

export const {
  resetCloudStorageFolder,
  setAccountId,
  setSearchTerm,
  resetPagination,
  resetMoveModalState,
  setMoveModalPath,
  resetRecentFiles,
  setFileUploadStatus,
  updateFileUploadProgress,
} = cloudStorageSlice.actions;

export default cloudStorageSlice.reducer;
