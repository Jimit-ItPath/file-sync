import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api';

type PaginationType = {
  total: number;
  total_pages: number;
  page_no: number;
  page_length: number;
  page_limit: number;
};

export type ContactUsType = {
  id: number;
  name: string;
  email: string;
  contact_number: string;
  subject: string;
  message: string;
  status: string;
  ip_address: string;
  user_agent: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserType = {
  UserConnectedAccounts: [
    {
      id: string;
      account_name: string;
      account_type: string;
      createdAt: string;
      updatedAt: string;
      sequence_number: null | number;
    },
  ];
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  profile: string | null;
  verified: boolean;
  is_blocked: boolean;
  createdAt: string;
  updatedAt: string;
  is_sfd_enabled: boolean;
  last_login: null | string;
};

export type AuditLogType = {
  action_type: string;
  createdAt: string;
  error_message: string | null;
  id: string;
  name: string;
  success: boolean;
  type: string;
  updatedAt: string;
  user_id: string;
};

type UserAnalyticsType = {
  total_users: string;
  active_users: string;
  blocked_users: string;
};

type ConnectedAccountAnalyticsType = {
  total_accounts: string;
  active_google_drive_accounts: string;
  active_dropbox_accounts: string;
  active_onedrive_accounts: string;
  re_authentication_required: string;
  inactive_accounts: string;
};

type ContactUsAccountAnalyticsType = {
  total_submissions: string;
  new: string;
  in_progress: string;
  resolved: string;
  rejected: string;
};

type AllAnalyticsType = {
  user_analytics: UserAnalyticsType;
  account_analytics: ConnectedAccountAnalyticsType;
  contact_us_analytics: ContactUsAccountAnalyticsType;
};

type AdminUserState = {
  users: UserType[];
  pagination: PaginationType | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  auditLogs: AuditLogType[];
  auditLogsPagination: PaginationType | null;
  auditLogLoading: boolean;
  auditLogError: string | null;
  auditLogSearchTerm: string;
  types: Record<string, string> | null;
  actionTypes: Record<string, string> | null;
  contactUs: {
    loading: boolean;
    data: ContactUsType[];
    pagination: PaginationType | null;
    searchTerm?: string;
    error: string | null;
  };
  userAnalytics: {
    loading: boolean;
    data: UserAnalyticsType | null;
    error: string | null;
  };
  connectedAccountAnalytics: {
    loading: boolean;
    data: ConnectedAccountAnalyticsType | null;
    error: string | null;
  };
  allAnalytics: {
    loading: boolean;
    data: AllAnalyticsType | null;
    error: string | null;
  };
};

const initialState: AdminUserState = {
  users: [],
  pagination: null,
  loading: false,
  error: null,
  searchTerm: '',
  auditLogs: [],
  auditLogsPagination: null,
  auditLogLoading: false,
  auditLogError: null,
  auditLogSearchTerm: '',
  types: null,
  actionTypes: null,
  contactUs: {
    loading: true,
    data: [],
    pagination: null,
    searchTerm: '',
    error: null,
  },
  userAnalytics: {
    loading: true,
    data: null,
    error: null,
  },
  connectedAccountAnalytics: {
    loading: true,
    data: null,
    error: null,
  },
  allAnalytics: {
    loading: true,
    data: null,
    error: null,
  },
};

export const fetchUsers = createAsyncThunk(
  'adminUser/fetchUsers',
  async (
    data: { searchTerm?: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.adminUsers.getUsers(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch users');
    }
  }
);

export const blockUser = createAsyncThunk(
  'adminUser/blockUser',
  async (data: { id: number; is_blocked: boolean }) => {
    try {
      const response = await api.adminUsers.blockUser({ data });
      return response.data;
    } catch (error: any) {
      return error;
    }
  }
);

export const inviteUser = createAsyncThunk(
  'adminUser/inviteUser',
  async (data: { emails: string[] }) => {
    try {
      const response = await api.adminUsers.inviteUser({ data });
      return response.data;
    } catch (error: any) {
      return error;
    }
  }
);

export const fetchAuditLogs = createAsyncThunk(
  'adminUser/fetchAuditLogs',
  async (
    data: {
      searchTerm?: string;
      page?: number;
      limit?: number;
      user_id?: string | number;
      action_types?: string;
      types?: string;
      success?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.adminUsers.getAuditLogs(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch audit logs');
    }
  }
);

export const exportLogs = createAsyncThunk(
  'adminUser/exportLogs',
  async (data: {
    user_id?: string | null;
    searchTerm?: string;
    action_types?: string;
    types?: string;
    success?: boolean;
  }) => {
    try {
      const response = await api.adminUsers.exportLogs(data);
      return response;
    } catch (error: any) {
      return error;
    }
  }
);

export const fetchTypes = createAsyncThunk('adminUser/fetchTypes', async () => {
  try {
    const response = await api.adminUsers.getTypes();
    return response.data;
  } catch (error: any) {
    return error;
  }
});

export const fetchActionTypes = createAsyncThunk(
  'adminUser/fetchActionTypes',
  async () => {
    try {
      const response = await api.adminUsers.getActionTypes();
      return response.data;
    } catch (error: any) {
      return error;
    }
  }
);

export const fetchContactUs = createAsyncThunk(
  'adminUser/fetchContactUs',
  async (
    data: {
      searchTerm?: string;
      page?: number;
      limit?: number;
      status?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.adminUsers.getContactUs(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch contact us');
    }
  }
);

export const updateContactUs = createAsyncThunk(
  'adminUser/updateContactUs',
  async (data: { id: number; status: string; notes?: string }) => {
    try {
      const response = await api.adminUsers.updateContactUs({ data });
      return response.data;
    } catch (error: any) {
      return error;
    }
  }
);

export const fetchUserAnalytics = createAsyncThunk(
  'adminUser/fetchUserAnalytics',
  async () => {
    try {
      const response = await api.adminUsers.getUserAnalytics();
      return response.data;
    } catch (error: any) {
      return error;
    }
  }
);

export const fetchConnectedAccountAnalytics = createAsyncThunk(
  'adminUser/fetchConnectedAccountAnalytics',
  async () => {
    try {
      const response = await api.adminUsers.getConnectedAccountAnalytics();
      return response.data;
    } catch (error: any) {
      return error;
    }
  }
);

export const fetchAllAnalytics = createAsyncThunk(
  'adminUser/fetchAllAnalytics',
  async () => {
    try {
      const response = await api.adminUsers.getAllAnalytics();
      return response.data;
    } catch (error: any) {
      return error;
    }
  }
);

const adminUserSlice = createSlice({
  name: 'adminUser',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setAuditLogSearchTerm: (state, action) => {
      state.auditLogSearchTerm = action.payload;
    },
    resetAdminUserState: state => {
      state.users = [];
      state.pagination = null;
      state.searchTerm = '';
    },
    resetAdminLogsState: state => {
      state.auditLogs = [];
      state.auditLogsPagination = null;
      state.auditLogSearchTerm = '';
      state.types = null;
      state.actionTypes = null;
    },
    setContactUsSearchTerm: (state, action) => {
      state.contactUs.searchTerm = action.payload;
    },
    resetContactUsState: state => {
      state.contactUs = {
        loading: true,
        data: [],
        pagination: null,
        searchTerm: '',
        error: null,
      };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUsers.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.pagination = action.payload?.data?.paging || null;
        state.users = action.payload?.data?.data || [];
        // if (action.meta.arg.page && action.meta.arg.page > 1) {
        //   state.users = [...state.users, ...(action.payload?.data?.data || [])];
        // } else {
        //   state.users = action.payload?.data?.data || [];
        // }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.users = [];
        state.pagination = null;
      })
      .addCase(fetchAuditLogs.pending, state => {
        state.auditLogLoading = true;
        state.auditLogError = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogLoading = false;
        state.auditLogsPagination = action.payload?.data?.paging || null;
        state.auditLogs = action.payload?.data?.data || [];
        // if (action.meta.arg.page && action.meta.arg.page > 1) {
        //   state.auditLogs = [
        //     ...state.auditLogs,
        //     ...(action.payload?.data?.data || []),
        //   ];
        // } else {
        //   state.auditLogs = action.payload?.data?.data || [];
        // }
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.auditLogLoading = false;
        state.auditLogError = action.payload as string;
        state.auditLogs = [];
        state.auditLogsPagination = null;
      })
      .addCase(fetchTypes.fulfilled, (state, action) => {
        state.types = action.payload?.data;
      })
      .addCase(fetchTypes.rejected, state => {
        state.types = null;
      })
      .addCase(fetchActionTypes.fulfilled, (state, action) => {
        state.actionTypes = action.payload?.data;
      })
      .addCase(fetchActionTypes.rejected, state => {
        state.actionTypes = null;
      })
      .addCase(fetchContactUs.pending, state => {
        state.contactUs.loading = true;
      })
      .addCase(fetchContactUs.fulfilled, (state, action) => {
        state.contactUs = {
          loading: false,
          data: action.payload?.data?.data || [],
          pagination: action.payload?.data?.paging || null,
          error: null,
        };
      })
      .addCase(fetchContactUs.rejected, state => {
        state.contactUs = {
          loading: false,
          data: [],
          pagination: null,
          error: null,
        };
      })
      .addCase(fetchUserAnalytics.pending, state => {
        state.userAnalytics.loading = true;
      })
      .addCase(fetchUserAnalytics.fulfilled, (state, action) => {
        state.userAnalytics = {
          loading: false,
          data: action.payload?.data || null,
          error: null,
        };
      })
      .addCase(fetchUserAnalytics.rejected, state => {
        state.userAnalytics = {
          loading: false,
          data: null,
          error: null,
        };
      })
      .addCase(fetchConnectedAccountAnalytics.pending, state => {
        state.connectedAccountAnalytics.loading = true;
      })
      .addCase(fetchConnectedAccountAnalytics.fulfilled, (state, action) => {
        state.connectedAccountAnalytics = {
          loading: false,
          data: action.payload?.data || null,
          error: null,
        };
      })
      .addCase(fetchConnectedAccountAnalytics.rejected, state => {
        state.connectedAccountAnalytics = {
          loading: false,
          data: null,
          error: null,
        };
      })
      .addCase(fetchAllAnalytics.pending, state => {
        state.allAnalytics.loading = true;
      })
      .addCase(fetchAllAnalytics.fulfilled, (state, action) => {
        state.allAnalytics = {
          loading: false,
          data: action.payload?.data || null,
          error: null,
        };
      })
      .addCase(fetchAllAnalytics.rejected, state => {
        state.allAnalytics = {
          loading: false,
          data: null,
          error: null,
        };
      });
  },
});

export const {
  setSearchTerm,
  setAuditLogSearchTerm,
  resetAdminLogsState,
  resetAdminUserState,
  setContactUsSearchTerm,
  resetContactUsState,
} = adminUserSlice.actions;

export default adminUserSlice.reducer;
