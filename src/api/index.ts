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
    completeProfile: (data: {
      first_name: string;
      last_name: string;
      email?: string;
      password: string;
      validation_code: string;
    }) =>
      client({
        url: `/auth/complete-profile`,
        method: METHODS.POST,
        data,
      }),
    updateSequence: ({
      data,
      ...configs
    }: {
      data: {
        id: number;
        sequence_number: number;
      }[];
      [key: string]: any;
    }) =>
      client({
        url: `/connected-account/update-sequence`,
        method: METHODS.PUT,
        data,
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
    updateSFDPreference: ({
      data,
      ...configs
    }: {
      data: {
        is_sfd_enabled: boolean;
      };
      [key: string]: any;
    }) =>
      client({
        url: `/user/sfd-status`,
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
    moveFiles: ({
      data,
      ...configs
    }: {
      data: { ids: string[]; destination_id: string | null };
      [key: string]: any;
    }) =>
      client({
        url: `/cloud-storage/move`,
        method: METHODS.POST,
        data,
        ...configs,
      }),
    syncStorage: ({
      data,
      ...configs
    }: {
      data: { account_id?: number | string; directory_id?: number | string };
    }) =>
      client({
        url: `/cloud-storage/sync`,
        method: METHODS.POST,
        data,
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
    moveFiles: ({
      data,
      ...configs
    }: {
      data: { ids: string[]; destination_id: string | null };
      [key: string]: any;
    }) =>
      client({
        url: `/cloud-storage/move`,
        method: METHODS.POST,
        data,
        ...configs,
      }),
    syncStorage: ({
      data,
      ...configs
    }: {
      data: { account_id?: number | string; directory_id?: number | string };
    }) =>
      client({
        url: `/cloud-storage/sync`,
        method: METHODS.POST,
        data,
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
    moveFiles: ({
      data,
      ...configs
    }: {
      data: { ids: string[]; destination_id: string | null };
      [key: string]: any;
    }) =>
      client({
        url: `/cloud-storage/move`,
        method: METHODS.POST,
        data,
        ...configs,
      }),
    syncStorage: ({
      data,
      ...configs
    }: {
      data: { account_id?: number | string; directory_id?: number | string };
    }) =>
      client({
        url: `/cloud-storage/sync`,
        method: METHODS.POST,
        data,
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
      type?: string;
      start_date?: string;
      end_date?: string;
      is_breadcrumb?: boolean;
    }) =>
      client({
        url: '/cloud-storage',
        method: METHODS.GET,
        params,
      }),
    getRecentFiles: (params: {
      account_id?: number | string;
      page?: number;
      limit?: number;
      type?: string;
      start_date?: string;
      end_date?: string;
    }) =>
      client({
        url: '/cloud-storage/recent-files',
        method: METHODS.GET,
        params,
      }),
    createFolder: ({
      data,
      ...configs
    }: {
      data: { name: string; id?: string | null; account_id?: string };
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
    moveFiles: ({
      data,
      ...configs
    }: {
      data: { ids: string[]; destination_id: string | null };
      [key: string]: any;
    }) =>
      client({
        url: `/cloud-storage/move`,
        method: METHODS.POST,
        data,
        ...configs,
      }),
    syncStorage: ({
      data,
      ...configs
    }: {
      data: { account_id?: number | string; directory_id?: number | string };
    }) =>
      client({
        url: `/cloud-storage/sync`,
        method: METHODS.POST,
        data,
        ...configs,
      }),
    uploadFilesV2: ({
      data,
      ...configs
    }: {
      data: {
        account_id?: string | undefined;
        id?: string | undefined;
        files: {
          fileName: string;
          fileSize: number;
          mimeType: string;
        }[];
      };
      [key: string]: any;
    }) =>
      client({
        url: '/cloud-storage/upload-file-v2',
        method: METHODS.POST,
        data,
        ...configs,
      }),
    uploadFileInChunksFn: ({
      chunk,
      headers,
      signal,
    }: {
      chunk: Blob;
      headers: Record<string, string>;
      signal?: AbortSignal;
    }) =>
      client({
        url: '/cloud-storage/upload-file-chunk',
        method: METHODS.PUT,
        data: chunk,
        headers,
        signal,
      }),
  },
  adminUsers: {
    getUsers: (params: {
      searchTerm?: string;
      page?: number;
      limit?: number;
    }) =>
      client({
        url: `/admin/users`,
        method: METHODS.GET,
        params,
      }),
    blockUser: ({
      data,
      ...configs
    }: {
      data: { id: number; is_blocked: boolean };
      [key: string]: any;
    }) =>
      client({
        url: `/admin/block-user`,
        method: METHODS.POST,
        data,
        ...configs,
      }),
    inviteUser: ({
      data,
      ...configs
    }: {
      data: { emails: string[] };
      [key: string]: any;
    }) =>
      client({
        url: `/admin/invite-user`,
        method: METHODS.POST,
        data,
        ...configs,
      }),
    getAuditLogs: (params: {
      user_id?: number | string;
      page?: number;
      limit?: number;
      searchTerm?: string;
      action_types?: string;
      types?: string;
      success?: boolean;
    }) =>
      client({
        url: `/user/audit-logs`,
        method: METHODS.GET,
        params,
      }),
    exportLogs: (data: {
      user_id?: string | null;
      searchTerm?: string;
      action_types?: string;
      types?: string;
      success?: boolean;
    }) =>
      client({
        url: `/user/export-logs`,
        method: METHODS.POST,
        data,
        responseType: 'blob',
      }),
    getActionTypes: () =>
      client({
        url: `/admin/action-type`,
        method: METHODS.GET,
      }),
    getTypes: () =>
      client({
        url: `/admin/types`,
        method: METHODS.GET,
      }),
  },
};
