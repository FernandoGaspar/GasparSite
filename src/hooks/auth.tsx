import axios from 'axios';
import React, { createContext, useEffect, useState, useContext, PropsWithChildren  } from 'react';
import { URL_API } from '../repositories/baseAPI';
import {
    AUTH_SESSION_CHANGED,
    AUTH_STORAGE,
    clearStoredSession,
    hasStoredSession,
    writeStoredSession,
} from '../utils/session';

interface IAuthContext {
    logged: boolean;
    email: string;
    senha: string;
    signIn(email: string, password: string): Promise<boolean>;
    signOut(): void;
    setEmail(email: string): void;
    setSenha(senha: string): void;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {

    // The legacy boolean is not an authentication proof. A usable local session
    // requires both the bearer token and the user identifier; the API remains
    // authoritative and will invalidate this state on the first 401 response.
    const [logged, setLogged] = useState<boolean>(() => hasStoredSession());

    const [email, setEmail] = useState<string>(() => {
        const isEmail = localStorage.getItem(AUTH_STORAGE.email);
        let retorno = ""
        if (isEmail){
            retorno = isEmail
        }
        return retorno
    });

    const [senha, setSenha] = useState<string>('');

    useEffect(() => {
        const synchronize = () => setLogged(hasStoredSession());
        window.addEventListener('storage', synchronize);
        window.addEventListener(AUTH_SESSION_CHANGED, synchronize);
        return () => {
            window.removeEventListener('storage', synchronize);
            window.removeEventListener(AUTH_SESSION_CHANGED, synchronize);
        };
    }, []);


    const signIn = async (email: string, password: string) : Promise<boolean> => {
        localStorage.setItem(AUTH_STORAGE.email, email);

        const { data } = await axios.post(URL_API + '/login', {
            email: email,
            senha: password
        });

        const records = typeof data === 'string' ? JSON.parse(data) : data;
        const account = Array.isArray(records) ? records[0] : undefined;
        const token = account?.Token;
        const idUsuario = account?.idUsuario;
        const apelido = account?.Apelido;

        if(token && String(token) !== "0" && idUsuario){
            writeStoredSession({
                token: String(token),
                userId: String(idUsuario),
                displayName: apelido ? String(apelido) : undefined,
            });
            setEmail(email);
            setLogged(true);

            return true;
        }else{
            clearStoredSession();

            return false;
        }                    
    }

    const signOut = () => {
        clearStoredSession();

        setLogged(false);
        setEmail("");
        setSenha("");
    }

    return (
        <AuthContext.Provider value={{logged, email, senha, signIn, signOut, setEmail, setSenha}}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth(): IAuthContext {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth, AuthContext };
