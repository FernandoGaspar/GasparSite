import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../hooks/auth';

import App from './app.routes';
import Auth from './auth.routes';

const Routes: React.FC = () => {
    const { logged, signIn, email, senha } = useAuth();

    if ( logged === false && email !== "" ){
        signIn(email, senha)    
    }

    return (
        <BrowserRouter>
            { logged ? <App/> : <Auth/> }
        </BrowserRouter>
    );
}

export default Routes;