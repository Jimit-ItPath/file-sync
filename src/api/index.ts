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
  },
  user: {
    get: ({ id, ...configs }: { id: string; [key: string]: any }) =>
      client({
        url: `/users/${id}`,
        method: METHODS.GET,
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
    getFiles: (params: { pageToken?: string; folderId?: string }) =>
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
};
