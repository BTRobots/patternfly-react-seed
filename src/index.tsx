import React from "react";
import ReactDOM from "react-dom";
import { App } from '@app/index';
import { Provider } from 'react-redux';
import { configureAppStore } from '@app/redux/store';

if (process.env.NODE_ENV !== "production") {
  const config = {
    rules: [
      {
        id: 'color-contrast',
        enabled: false
      }
    ]
  };
  // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
  const axe = require("react-axe");
  axe(React, ReactDOM, 1000, config);
}

const store = configureAppStore({});

const render = () => {
  // const { App } = require('@app/index')
  ReactDOM.render(
    <Provider store={store} >
      <App />
    </Provider>,
    document.getElementById("root") as HTMLElement);
}

render();

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('@app/index', render);
}

