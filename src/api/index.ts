import client, { METHODS } from './client';

export const api = {
  auth: {
    register: ({ data, ...configs }: { data: any; [key: string]: any }) =>
      client({
        url: '/auth/register',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    login: ({ data, ...configs }: { data: any; [key: string]: any }) =>
      client({
        url: '/auth/login',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    forgotPassword: ({ data, ...configs }: { data: any; [key: string]: any }) =>
      client({
        url: '/auth/forgot-password',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    restPassword: ({ data, ...configs }: { data: any; [key: string]: any }) =>
      client({
        url: '/auth/reset-password',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    verifyUser: ({ data, ...configs }: { data: any; [key: string]: any }) =>
      client({
        url: '/auth/verify-email',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    getAuthToken: ({ data, ...configs }: { data?: any; [key: string]: any }) =>
      client({
        url: '/auth/verify-email',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    googleSignIn: () =>
      client({
        url: '/google/auth',
        method: METHODS.GET,
      }),
    connectAccount: ({
      data,
      ...configs
    }: {
      data: {
        id: number;
        account_type: 'google_drive' | 'dropbox' | 'onedrive';
        account_name: string;
      };
      [key: string]: any;
    }) =>
      client({
        url: '/auth/connect-account',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    getConnectedAccount: () =>
      client({
        url: '/connected-account',
        method: METHODS.GET,
      }),
    checkStorageDetails: () =>
      client({
        url: `/connected-account/with-storage`,
        method: METHODS.GET,
      }),
    removeAccount: ({
      data,
      ...configs
    }: {
      data: {
        id: number;
      };
      [key: string]: any;
    }) =>
      client({
        url: `/connected-account/${data.id}`,
        method: METHODS.DELETE,
        ...configs,
      }),
  },
  user: {
    get: ({ id, ...configs }: { id: string; [key: string]: any }) =>
      client({
        url: `/users/${id}`,
        method: METHODS.GET,
        ...configs,
      }),
    fetchProfile: () =>
      client({
        url: `/user/profile`,
        method: METHODS.GET,
      }),
    updateProfile: ({
      data,
      ...configs
    }: {
      data: FormData;
      [key: string]: any;
    }) =>
      client({
        url: `/user/profile`,
        method: METHODS.PUT,
        data,
        ...configs,
      }),
    removeProfileImage: () =>
      client({
        url: `/user/remove-profile-pic`,
        method: METHODS.DELETE,
      }),
    removeAccess: ({
      data,
      ...configs
    }: {
      data: { type: 'drive' | 'dropbox' | 'onedrive' };
      [key: string]: any;
    }) =>
      client({
        url: `/user/remove-storage-access`,
        method: METHODS.PATCH,
        data,
        ...configs,
      }),
  },
  googleDrive: {
    hasAccess: () =>
      client({
        url: `/google-drive/has-access`,
        method: METHODS.GET,
      }),
    auth: () =>
      client({
        url: '/google/drive/auth',
        method: METHODS.GET,
      }),
    getFiles: (params: { pageToken?: string; folderId?: string | null }) =>
      client({
        url: '/google-drive/files',
        method: METHODS.GET,
        params,
      }),
    createFolder: ({
      data,
      ...configs
    }: {
      data: { folder_name: string };
      [key: string]: any;
    }) =>
      client({
        url: '/google-drive/create-folder',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    renameFile: ({
      data,
      ...configs
    }: {
      data: { file_id: string; name: string };
      [key: string]: any;
    }) =>
      client({
        url: '/google-drive/rename-file-or-folder',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    uploadFiles: ({
      data,
      ...configs
    }: {
      data: FormData;
      [key: string]: any;
    }) =>
      client({
        url: '/google-drive/upload-file',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    deleteFile: ({
      data,
      ...configs
    }: {
      data: { field: string };
      [key: string]: any;
    }) =>
      client({
        url: `/google-drive/delete-file/${data.field}`,
        method: METHODS.DELETE,
        ...configs,
      }),
  },
  dropbox: {
    hasAccess: () =>
      client({
        url: `/dropbox/has-access`,
        method: METHODS.GET,
      }),
    auth: () =>
      client({
        url: '/dropbox/auth',
        method: METHODS.GET,
      }),
    getFiles: (params: { cursor?: string }) =>
      client({
        url: '/dropbox/list',
        method: METHODS.GET,
        params,
      }),
    createFolder: ({
      data,
      ...configs
    }: {
      data: { folder_name: string };
      [key: string]: any;
    }) =>
      client({
        url: '/dropbox/create-folder',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    renameFile: ({
      data,
      ...configs
    }: {
      data: { id: string; name: string };
      [key: string]: any;
    }) =>
      client({
        url: '/dropbox/rename-item',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    uploadFiles: ({
      data,
      ...configs
    }: {
      data: FormData;
      [key: string]: any;
    }) =>
      client({
        url: '/dropbox/upload-file',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    deleteFile: ({
      data,
      ...configs
    }: {
      data: { id: string };
      [key: string]: any;
    }) =>
      client({
        url: `/dropbox/delete-item/${data.id}`,
        method: METHODS.DELETE,
        ...configs,
      }),
  },
  oneDrive: {
    hasAccess: () =>
      client({
        url: `/onedrive/has-access`,
        method: METHODS.GET,
      }),
    auth: () =>
      client({
        url: '/onedrive/auth',
        method: METHODS.GET,
      }),
    getFiles: (params: { nextLink?: string; parentId?: string }) =>
      client({
        url: '/onedrive/list',
        method: METHODS.GET,
        params,
      }),
    createFolder: ({
      data,
      ...configs
    }: {
      data: { folder_name: string };
      [key: string]: any;
    }) =>
      client({
        url: '/onedrive/create-folder',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    renameFile: ({
      data,
      ...configs
    }: {
      data: { id: string; name: string };
      [key: string]: any;
    }) =>
      client({
        url: '/onedrive/rename-item',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    uploadFiles: ({
      data,
      ...configs
    }: {
      data: FormData;
      [key: string]: any;
    }) =>
      client({
        url: '/onedrive/upload-file',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    deleteFile: ({
      data,
      ...configs
    }: {
      data: { id: string };
      [key: string]: any;
    }) =>
      client({
        url: `/onedrive/delete-item/${data.id}`,
        method: METHODS.DELETE,
        ...configs,
      }),
  },
  cloudStorage: {
    getFiles: (params: {
      account_id?: number | string;
      account_type?: 'google_drive' | 'dropbox' | 'onedrive';
      id?: string;
      searchTerm?: string;
      page?: number;
      limit?: number;
    }) =>
      client({
        url: '/cloud-storage',
        method: METHODS.GET,
        params,
      }),
    createFolder: ({
      data,
      ...configs
    }: {
      data: { name: string; id?: string | null };
      [key: string]: any;
    }) =>
      client({
        url: '/cloud-storage/create-folder',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    renameFile: ({
      data,
      ...configs
    }: {
      data: { id: string; name: string };
      [key: string]: any;
    }) =>
      client({
        url: '/cloud-storage/rename',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    uploadFiles: ({
      data,
      ...configs
    }: {
      data: FormData;
      [key: string]: any;
    }) =>
      client({
        url: '/cloud-storage/upload-file',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    deleteFile: ({
      data,
      ...configs
    }: {
      data: { ids: string[] };
      [key: string]: any;
    }) =>
      client({
        url: `/cloud-storage/delete`,
        method: METHODS.DELETE,
        data,
        ...configs,
      }),
    downloadFiles: ({
      data,
      ...configs
    }: {
      data: { ids: string[] };
      [key: string]: any;
    }) =>
      client({
        url: `/cloud-storage/download`,
        method: METHODS.POST,
        data,
        responseType: 'blob',
        ...configs,
      }),
  },
};
