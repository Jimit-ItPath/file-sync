import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';

type UserProfileType = {
  email: string;
  first_name: string;
  last_name: string;
  profile: string | File;
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

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
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

export default userSlice.reducer;
