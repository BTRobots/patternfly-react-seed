import * as React from 'react';
import { GoogleLogin as GoogleLoginButton } from 'react-google-login';
import { LoginPage } from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';
import './tank.jpg';
import './tank2.jpg';
import './tank3.jpg';
import './tank4.jpg';

const GoogleLogin = ({ onSuccess }) => {
  return (<GoogleLoginButton
  clientId={GOOGLE_LOGIN_CLIENT_ID}
  onSuccess={onSuccess}
  onFailure={(...args) => console.log('fail!', args)}
  cookiePolicy={'single_host_origin'}
/>);
};

export const Login = ({ onSuccess }) => (<LoginPage
  backgroundImgSrc='images/tank4.jpg'
  textContent="Login to BTRobots"
  loginTitle="Beyond T Robots"
  buttonText="Login with Google Organization"
  signUpForAccountMessage="Sign up you learning institution"
  textContent="An assembly language tank battle simulator"
  socialMediaLoginContent={<GoogleLogin onSuccess={onSuccess} />}
  />);
