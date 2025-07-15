import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api';

type ConnectedAccountTyoe = {
  id: number;
  user_id: string;
  account_name: string;
  account_type: string;
  state_token: string;
  access_token: null;
  refresh_token: null;
  token_expires: null;
  createdAt: string;
  updatedAt: string;
};

type AuthState = {
  isLoggedIn: boolean;
  user: {};
  isTemporary: boolean;
  activeUI: string;
  connectedAccounts: ConnectedAccountTyoe[];
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  isLoggedIn: false,
  user: {},
  isTemporary: false,
  activeUI: '',
  connectedAccounts: [],
  loading: false,
  error: null,
};

export const connectCloudAccount = createAsyncThunk(
  'auth/connectCloudAccount',
  async (
    data: {
      id: number;
      account_type: 'google_drive' | 'dropbox' | 'onedrive';
      account_name: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.auth.connectAccount({ data });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to connect account');
    }
  }
);

export const getConnectedAccount = createAsyncThunk(
  'auth/getConnectedAccount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.auth.getConnectedAccount();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || 'Failed to get connected account'
      );
    }
  }
);

export const removeAccountAccess = createAsyncThunk(
  'auth/removeAccountAccess',
  async (
    data: {
      id: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.auth.removeAccount({ data });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to remove account');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateUser: (state, action) => {
      const data = { ...action.payload };
      return {
        ...state,
        ...data,
      };
    },
    logout: () => {
      return { ...initialState };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getConnectedAccount.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConnectedAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.connectedAccounts = action.payload?.data || [];
      })
      .addCase(getConnectedAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.connectedAccounts = [];
      });
  },
});

export const { logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
