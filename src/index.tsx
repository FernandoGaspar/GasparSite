import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import { ThemeProvider } from './hooks/theme';
import { AuthProvider } from './hooks/auth';
import { ShowNumberProvider } from './hooks/showNumber';
import { clearStoredSession, readStoredSession } from './utils/session';

import App from './App';

axios.interceptors.request.use((config) => {
  const session = readStoredSession();
  if (session) {
    config.headers.Authorization = `Bearer ${session.token}`;
    // Compatibility header only. The API must derive/validate the effective
    // user from the bearer token and never trust this client-provided value.
    config.headers['X-User-Id'] = session.userId;
  }
  return config;
});

axios.interceptors.response.use(
  response => response,
  error => {
    const requestUrl = String(error?.config?.url || '');
    const isLoginRequest = /\/login(?:\?|$)/.test(requestUrl);
    if (error?.response?.status === 401 && !isLoginRequest && readStoredSession()) {
      clearStoredSession({ preserveEmail: true });
    }
    return Promise.reject(error);
  },
);

ReactDOM.render(
  <React.StrictMode>    
    <ThemeProvider>
      <ShowNumberProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ShowNumberProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
