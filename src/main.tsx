import { createRoot } from 'react-dom/client';
import './index.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/dropzone/styles.css';
import App from './App.tsx';
import { Provider } from 'react-redux';
import { persistor, store } from './store/index.ts';
import { PersistGate } from 'redux-persist/integration/react';

createRoot(document.getElementById('root')!, {
  onCaughtError: (error, componentStack) => {
    // global error caught in a boundary
    console.log('Global onCaughtError:', error, componentStack);
  },
  onUncaughtError: error => {
    // error not caught by any boundary
    console.log('Global onUncaughtError:', error);
  },
}).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);
