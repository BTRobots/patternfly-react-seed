export const START_LOGIN = 'auth/START_LOGIN';
export const LOGIN_SUCCESS = 'auth/LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'auth/LOGIN_FAILURE';

export interface GoogleToken {

} 

export interface AuthState {
  token: GoogleToken | null;
  loggingIn: boolean;
  error: string | null;
}

interface StartLoginAction {
  type: typeof START_LOGIN,
}

interface LoginSuccessAction {
  type: typeof LOGIN_SUCCESS,
  payload: GoogleToken,
}

interface LoginFailureAction {
  type: typeof LOGIN_FAILURE,
  error: string,
}

export type AuthActionTypes = StartLoginAction | LoginSuccessAction | LoginFailureAction;
