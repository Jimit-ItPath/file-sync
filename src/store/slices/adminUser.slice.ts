import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api';

type PaginationType = {
  total: number;
  total_pages: number;
  page_no: number;
  page_length: number;
  page_limit: number;
};

export type UserType = {
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
};

export type AuditLogType = {
  id: string;
  user_id: string;
  action_type: string;
  object_type: string;
  object_name: string;
  success: boolean;
  error_message: string | null;
  createdAt: string;
  updatedAt: string;
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
  async (data: { email: string }) => {
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
        if (action.meta.arg.page && action.meta.arg.page > 1) {
          state.users = [...state.users, ...(action.payload?.data?.data || [])];
        } else {
          state.users = action.payload?.data?.data || [];
        }
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
        if (action.meta.arg.page && action.meta.arg.page > 1) {
          state.auditLogs = [
            ...state.auditLogs,
            ...(action.payload?.data?.data || []),
          ];
        } else {
          state.auditLogs = action.payload?.data?.data || [];
        }
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.auditLogLoading = false;
        state.auditLogError = action.payload as string;
        state.auditLogs = [];
        state.auditLogsPagination = null;
      });
  },
});

export const { setSearchTerm, setAuditLogSearchTerm } = adminUserSlice.actions;

export default adminUserSlice.reducer;
