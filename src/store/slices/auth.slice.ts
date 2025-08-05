import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api';

export type AccountType = 'google_drive' | 'dropbox' | 'onedrive';

type ConnectedAccountType = {
  id: number;
  user_id: string;
  account_name: string;
  account_type: AccountType;
  state_token: string;
  token_expires: null;
  createdAt: string;
  updatedAt: string;
  email: string;
  sequence_number: number | null;
  external_account_id: string | null;
  re_authentication_required: boolean;
};

type StorageDetailsType = {
  total: number;
  used: number;
};

type CheckStorageDetailsType = {
  id: string;
  user_id: string;
  email: string;
  account_name: string;
  account_type: AccountType;
  storage_details: {
    used: string;
    total: string;
  };
};

type UserType = {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  iat: number;
  exp: number;
};

type AuthState = {
  isLoggedIn: boolean;
  user: UserType | null;
  isTemporary: boolean;
  activeUI: string;
  connectedAccounts: ConnectedAccountType[];
  loading: boolean;
  error: string | null;
  checkStorageDetails: {
    result: CheckStorageDetailsType[];
    storage_details: StorageDetailsType;
  } | null;
};

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  isTemporary: false,
  activeUI: '',
  connectedAccounts: [],
  checkStorageDetails: null,
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

export const fetchStorageDetails = createAsyncThunk(
  'auth/fetchStorageDetails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.auth.checkStorageDetails();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || 'Failed to check storage details'
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

export const completeProfile = createAsyncThunk(
  'auth/completeProfile',
  async (
    data: {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
      validation_code: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.auth.completeProfile(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to complete profile');
    }
  }
);

export const updateSequence = createAsyncThunk(
  'auth/updateSequence',
  async (
    data: {
      id: number;
      sequence_number: number;
    }[]
  ) => {
    try {
      const response = await api.auth.updateSequence({ data });
      return response.data;
    } catch (error: any) {
      return error;
    }
  }
);

const authSlice = createSlice({
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
    resetUser: state => {
      state.user = null;
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
      })
      // .addCase(fetchStorageDetails.pending, state => {
      //   state.loading = true;
      //   state.error = null;
      // })
      .addCase(fetchStorageDetails.fulfilled, (state, action) => {
        // state.loading = false;
        state.checkStorageDetails = action.payload?.data || null;
      })
      .addCase(fetchStorageDetails.rejected, (state, action) => {
        // state.loading = false;
        state.error = action.payload as string;
        state.checkStorageDetails = null;
      });
  },
});

export const { logout, updateUser, resetUser } = authSlice.actions;
export default authSlice.reducer;
