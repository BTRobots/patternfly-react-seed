import {
  GoogleToken,
  AuthActionTypes,
  LOGIN_FAILURE,
  LOGIN_SUCCESS,
  START_LOGIN
} from './types';

export const login = (): AuthActionTypes =>  ({
  type: START_LOGIN,
});

export const loginFailure = (error: string): AuthActionTypes => ({
  error,
  type: LOGIN_FAILURE,
})
export const loginSuccess = (payload: GoogleToken): AuthActionTypes => ({
  payload,
  type: LOGIN_SUCCESS,
})
