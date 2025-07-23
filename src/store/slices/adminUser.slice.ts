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

type AuthState = {
  users: UserType[];
  pagination: PaginationType | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
};

const initialState: AuthState = {
  users: [],
  pagination: null,
  loading: false,
  error: null,
  searchTerm: '',
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

const adminUserSlice = createSlice({
  name: 'adminUser',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
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
      });
  },
});

export const { setSearchTerm } = adminUserSlice.actions;

export default adminUserSlice.reducer;
