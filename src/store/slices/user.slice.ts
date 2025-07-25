import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';

type UserProfileType = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  profile: null | string;
  verified: boolean;
  is_blocked: boolean;
  createdAt: string;
  updatedAt: string;
  is_sfd_enabled: boolean;
};

interface UserState {
  isLoading: boolean;
  error: string | null;
  userProfile: UserProfileType | null;
}

const initialState: UserState = {
  isLoading: false,
  error: null,
  userProfile: null,
};

export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.user.fetchProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch user profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await api.user.updateProfile({ data });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to update user profile');
    }
  }
);

export const removeStorageAccess = createAsyncThunk(
  'user/removeStorageAccess',
  async (
    data: { type: 'drive' | 'dropbox' | 'onedrive' },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.user.removeAccess({ data });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to remove storage access');
    }
  }
);

export const removeProfileImage = createAsyncThunk(
  'user/removeProfileImage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.user.removeProfileImage();
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to remove profile image');
    }
  }
);

export const updateSFDPreference = createAsyncThunk(
  'user/updateSFDPreference',
  async (data: { is_sfd_enabled: boolean }) => {
    try {
      const response = await api.user.updateSFDPreference({ data });
      return response;
    } catch (error) {
      return error;
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    resetUserProfile: state => {
      state.userProfile = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userProfile = action.payload?.data;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.userProfile = null;
      })
      .addCase(updateProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userProfile = action.payload?.data;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetUserProfile } = userSlice.actions;

export default userSlice.reducer;
