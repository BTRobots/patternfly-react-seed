import React, { useState, useEffect } from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';
import { RobotListItem, getRobotList } from './storage';
import { useGoogleLogin } from 'react-google-login';
import { Login } from '@app/Login/Login';

const App: React.FunctionComponent = () => {
  const [ isSignedIn, setIsSignedIn ] = useState(false);
  const [ auth, setAuth ] = useState({})
  const [ currentRobot, setCurrentRobot ] = useState(getRobotList());
  const [ robotList, setRobotList] = useState()


  


/*
  const onFailure = () => {
    setIsSignedIn(false);
  };

  const logout = () => {
    gapi.auth2.signOut()
      .then(() => gapi.auth2.disconnect())
      .then(() => setIsSignedIn(false))
  }

  const { signIn, loaded } = useGoogleLogin({
    onFailure,
    clientId: GOOGLE_LOGIN_CLIENT_ID,
    onSuccess: () => location.href = '/',
  });
  if (loaded) {
    window.gapi.load('auth2', () => {
      const auth2Promise = gapi.auth2.init({
        client_id: GOOGLE_LOGIN_CLIENT_ID,
      });
      auth2Promise.then(() => {
        console.log('on init');
        const _isSignedIn = auth2Promise.auth2.isSignedIn.get();
        setAuth(auth2);
        setIsSignedIn(_isSignedIn);
      })
    });
  }
  if (!loaded) {
    return (<div>Loading...</div>);
  } else {
  return !isSignedIn
    ? <Login onSuccess={() => setIsSignedIn(true)}/>
    : (<Router>
          <AppLayout logout={logout}>
            <AppRoutes />
          </AppLayout>
        </Router>);
  }

  */
  return (<Router>
    <AppLayout logout={() => {}}>
      <AppRoutes />
    </AppLayout>
  </Router>);
};

export { App };
