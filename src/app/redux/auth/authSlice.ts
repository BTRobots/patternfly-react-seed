import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const googleLogin = createAsyncThunk(
  'auth/login',
  async () => {

    return ''
  }
)

const initLogin = createAsyncThunk(
  'auth/logininit',
  async () => {

    return ''
  }
)

const initialState = {
  token: null,
  loggingIn: false,
  error: null,
};

const authSlice = createSlice({
  initialState,
  name: 'auth',
  reducers: {
    startLogin(state, action) {
      if (!state.loggingIn && state.token === null) {
        state = {
          ...initialState,
          loggingIn: true,
        }
        state.loggingIn = true;
        state.error = null;
      }
    },
    loginSuccess(state, action) {
      state = {
        ...initialState,
        token: action.payload,
      }
    },
    loginFailure(state, action) {
      state = {
        ...initialState,
        error: action.payload,
      }
    }
  }
});

export const {
  startLogin,
  loginSuccess,
  loginFailure,
} = authSlice.actions;

export default authSlice.reducer
