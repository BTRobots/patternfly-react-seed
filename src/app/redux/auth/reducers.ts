import {
  GoogleToken,
  AuthActionTypes,
  LOGIN_FAILURE,
  LOGIN_SUCCESS,
  START_LOGIN,
  AuthState,
} from './types';

const initialState: AuthState = {
  token: null,
  loggingIn: false,
  error: null,
};


export const authReducer = (state = initialState, action: AuthActionTypes): AuthState => {
  switch (action.type) {
    case START_LOGIN:
      // only initiate if not logged in and not already attempting to log in
      return !state.loggingIn && state.token === null
        ? {
          ...initialState,
          loggingIn: true,
        }
        : state;
    case LOGIN_SUCCESS:
      return {
        ...initialState,
        token: action.payload,
      };
    case LOGIN_FAILURE: {
      return {
        ...initialState,
        error: action.error,
      };

    }
    default:
      return state;
  }
};
