import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginRequest, registerRequest, resetPasswordRequest } from '../services/authService';
import { clearSession, getStoredUser, saveSession, STORAGE_KEYS } from '../utils/storage';

const initialState = {
  user: getStoredUser(),
  accessToken: localStorage.getItem(STORAGE_KEYS.accessToken) || null,
  refreshToken: localStorage.getItem(STORAGE_KEYS.refreshToken) || null,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk('auth/login', async (payload, thunkAPI) => {
  try {
    const response = await loginRequest(payload);
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (payload, thunkAPI) => {
  try {
    const response = await registerRequest(payload);
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (payload, thunkAPI) => {
  try {
    const response = await resetPasswordRequest(payload);
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Password reset failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      clearSession();
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;

        saveSession({
          user: action.payload.user,
          accessToken: action.payload.tokens.accessToken,
          refreshToken: action.payload.tokens.refreshToken,
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
