import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import { ThemeProvider } from './hooks/theme';
import { AuthProvider } from './hooks/auth';
import { ShowNumberProvider } from './hooks/showNumber';

import App from './App';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('@minha-carteira:token');
  const userId = localStorage.getItem('@minha-carteira:usuarioId');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (userId) config.headers['X-User-Id'] = userId;
  return config;
});

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
