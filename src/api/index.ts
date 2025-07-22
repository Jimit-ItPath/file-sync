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
    getFiles: (params: {
      account_id: number | string;
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
      data: { name: string; id?: string | null; account_id: number | string };
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
  dropbox: {
    getFiles: (params: {
      account_id: number | string;
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
      data: { name: string; id?: string | null; account_id: number | string };
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
  oneDrive: {
    getFiles: (params: {
      account_id: number | string;
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
      data: { name: string; id?: string | null; account_id: number | string };
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
