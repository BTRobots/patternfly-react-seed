import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './rootReducer';

export const configureAppStore = (preloadeState) => {
  const store = configureStore({
    reducer: rootReducer,
  });

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./rootReducer', () => store.replaceReducer(rootReducer));
  }

  return store;
}

