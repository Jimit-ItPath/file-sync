import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import { getLocalStorage, setLocalStorage } from '../../utils/helper';

type AccountType = 'google_drive' | 'dropbox' | 'onedrive';

type DropboxStorageType = {
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

interface DropboxState {
  dropboxFiles: DropboxStorageType[];
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
}

const initialState: DropboxState = {
  dropboxFiles: [],
  pagination: null,
  isLoading: false,
  error: null,
  currentFolderId: null,
  currentPath: localStorage.getItem('dropboxPath')
    ? JSON.parse(localStorage.getItem('dropboxPath') || '')
    : [],
  uploadLoading: false,
  searchTerm: '',
};

export const fetchDropboxFiles = createAsyncThunk(
  'dropbox/fetchDropboxFiles',
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
      const response = await api.dropbox.getFiles(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch files');
    }
  }
);

export const navigateToFolder = createAsyncThunk(
  'dropbox/navigateToFolder',
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
    const defaultLimit = 10;
    if (!data?.id) {
      dispatch(resetDropboxFolder());
      await dispatch(
        fetchDropboxFiles({
          page: defaultPage,
          limit: defaultLimit,
          account_id: data.account_id,
        })
      );
      return { folderId: null, folderName: 'All Files', isRoot: true };
    } else {
      await dispatch(
        fetchDropboxFiles({
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

export const initializeDropboxFromStorage = createAsyncThunk(
  'dropbox/initializeDropboxFromStorage',
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
    const savedPath = getLocalStorage('dropboxPath');
    const defaultPage = 1;
    const defaultLimit = 10;
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
        fetchDropboxFiles({
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

export const createDropboxFolder = createAsyncThunk(
  'dropbox/createDropboxFolder',
  async (
    data: { name: string; id?: string | null; account_id: number | string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.dropbox.createFolder({ data });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || 'Failed to create Dropbox folder'
      );
    }
  }
);

export const renameDropboxFile = createAsyncThunk(
  'dropbox/renameDropboxFile',
  async (data: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await api.dropbox.renameFile({ data });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to rename Dropbox file');
    }
  }
);

export const uploadDropboxFiles = createAsyncThunk(
  'dropbox/uploadDropboxFiles',
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
      const response = await api.dropbox.uploadFiles({
        data,
        onUploadProgress,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || 'Failed to upload Dropbox files'
      );
    }
  }
);

export const removeDropboxFiles = createAsyncThunk(
  'dropbox/removeDropboxFiles',
  async (data: { ids: string[] }) => {
    try {
      const response = await api.dropbox.deleteFile({ data });
      return response;
    } catch (error: any) {
      return error;
    }
  }
);

export const downloadDropboxFiles = createAsyncThunk(
  'dropbox/downloadDropboxFiles',
  async (data: { ids: string[] }) => {
    try {
      const response = await api.dropbox.downloadFiles({ data });
      return response;
    } catch (error: any) {
      return error;
      // return rejectWithValue(error?.message || 'Failed to download files');
    }
  }
);

export const dropboxSlice = createSlice({
  name: 'dropbox',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    resetDropboxFolder: state => {
      state.currentFolderId = null;
      state.currentPath = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchDropboxFiles.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDropboxFiles.fulfilled, (state, action) => {
        const { data = [], paging = null } = action.payload?.data;
        state.isLoading = false;

        // Get the folder id from the action
        const newFolderId = action.meta.arg?.id ?? null;

        // If folder id changed, replace data; if same, append for pagination
        if (state.currentFolderId !== newFolderId) {
          state.dropboxFiles = data;
          state.currentFolderId = newFolderId;
        } else if (action.meta.arg.page && action.meta.arg.page > 1) {
          state.dropboxFiles = [...state.dropboxFiles, ...data];
        } else {
          state.dropboxFiles = data;
        }
        state.pagination = paging;
      })
      .addCase(fetchDropboxFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.dropboxFiles = [];
        state.pagination = null;
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
              {
                id: folderId ? String(folderId) : undefined,
                name: String(folderName),
              },
            ];
          }
        }
        setLocalStorage('dropboxPath', state.currentPath);
        setLocalStorage('dropboxFolderId', state.currentFolderId);
      })
      .addCase(navigateToFolder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.currentFolderId = null;
        state.currentPath = [];
      })
      .addCase(createDropboxFolder.fulfilled, (state, action) => {
        // state.isLoading = false;
        state.dropboxFiles = [
          ...state.dropboxFiles,
          { ...(action.payload?.data || []) },
        ];
      })
      .addCase(createDropboxFolder.rejected, (state, action) => {
        // state.isLoading = false;
        state.error = action.payload as string;
      })
      // .addCase(uploadGoogleDriveFiles.pending, state => {
      //   state.isLoading = true;
      // })
      .addCase(uploadDropboxFiles.fulfilled, (state, action) => {
        // state.isLoading = false;
        state.dropboxFiles = [
          ...state.dropboxFiles,
          { ...(action.payload?.data || []) },
        ];
      })
      .addCase(uploadDropboxFiles.rejected, (state, action) => {
        // state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetDropboxFolder, setSearchTerm } = dropboxSlice.actions;

export default dropboxSlice.reducer;
