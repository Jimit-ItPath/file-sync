import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  user: {},
  isTemporary: false,
  activeUI: '',
};

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
});

export const { logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
