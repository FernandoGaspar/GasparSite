import axios from 'axios';
import React, { createContext, useState, useContext, PropsWithChildren  } from 'react';
import { URL_API } from '../repositories/baseAPI';

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

    const [logged, setLogged] = useState<boolean>(() => {
        const isLogged = localStorage.getItem('@minha-carteira:logged');
        return !!isLogged;
    });

    const [email, setEmail] = useState<string>(() => {
        const isEmail = localStorage.getItem('@minha-carteira:email');
        let retorno = ""
        if (isEmail){
            retorno = isEmail
        }
        return retorno
    });

    const [senha, setSenha] = useState<string>(() => {
        const isSenha = localStorage.getItem('@minha-carteira:senha');
        let retorno = ""
        if (isSenha){
            retorno = isSenha
        }
        return retorno
    });


    const signIn = async (email: string, password: string) : Promise<boolean> => {
        localStorage.setItem('@minha-carteira:email', email);
        localStorage.setItem('@minha-carteira:senha', password);

        const { data } = await axios.post(URL_API + '/login', {
            headers: {"Access-Control-Allow-Origin": "*"},
            email: email,
            senha: password
        });

        let token = JSON.parse(data)[0].Token
        let idUsuario = JSON.parse(data)[0].idUsuario
        let apelido =  JSON.parse(data)[0].Apelido

        if(token !== "0"){
            setLogged(true)
            localStorage.setItem('@minha-carteira:logged', 'true');
            localStorage.setItem('@minha-carteira:usuarioId', idUsuario);
            localStorage.setItem('@minha-carteira:nomeUsuario', apelido);
            localStorage.setItem('@minha-carteira:token', token);

            return true;
        }else{
            localStorage.removeItem('@minha-carteira:logged');
            localStorage.removeItem('@minha-carteira:usuarioId');
            localStorage.removeItem('@minha-carteira:nomeUsuario');
            localStorage.removeItem('@minha-carteira:token');

            localStorage.removeItem('@minha-carteira:email');
            localStorage.removeItem('@minha-carteira:senha');

            alert('Usuário ou senha incorretos!');

            return false;
        }                    
    }

    const signOut = () => {
        localStorage.removeItem('@minha-carteira:logged');
        localStorage.removeItem('@minha-carteira:usuarioId');
        localStorage.removeItem('@minha-carteira:nomeUsuario');
        localStorage.removeItem('@minha-carteira:token');

        localStorage.removeItem('@minha-carteira:email');
        localStorage.removeItem('@minha-carteira:senha');

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