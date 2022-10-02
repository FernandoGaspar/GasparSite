import React from 'react';
import ReactDOM from 'react-dom';

import { ThemeProvider } from './hooks/theme';
import { AuthProvider } from './hooks/auth';
import { ShowNumberProvider } from './hooks/showNumber';

import App from './App';

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