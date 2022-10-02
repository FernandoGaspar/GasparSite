import React, { useMemo, useState } from 'react';
import Toggle from '../Toggle';

import emojis from '../../utils/emojis';
import eye from '../../assets/eye-16.svg';
import eyeHiddeen from '../../assets/eye-hidden-16-gray.svg';


import { useTheme } from '../../hooks/theme';
import { useShowNumber } from '../../hooks/showNumber';

import { 
    Container, 
    Profile, 
    Welcome, 
    UserName, 
}  from './styles';


const MainHeader: React.FC = () => {
    const { toggleTheme, theme } = useTheme();
    const { buttonShowNumber, showNumber } = useShowNumber();

    const [darkTheme, setDarkTheme] = useState(() => theme.title === 'dark' ? true : false);
    const [showNumberVision, setShowNumberVision] = useState(() => showNumber ? true : false);
    const usuarioNome = localStorage.getItem('@minha-carteira:nomeUsuario');

    const handleChangeTheme = () => {
        setDarkTheme(!darkTheme);
        toggleTheme();
    }

    const handleShowNumbers = () => {
        setShowNumberVision(!showNumberVision);
        buttonShowNumber();
    }

    const emoji = useMemo(() => {
        const indice = Math.floor(Math.random() * emojis.length);
        return emojis[indice];
    },[]);

    const logoEye = useMemo(() => {
        return (showNumberVision ? eye : eyeHiddeen)
    },[showNumberVision]);

    return (
        <Container>
            <Toggle
                labelLeft="Light"
                labelRight="Dark"
                checked={darkTheme}
                onChange={handleChangeTheme}
            />
            <img 
                src={logoEye}  
                style={{ 
                    margin: "2%",
                    marginLeft: "auto",
                    height: 25,
                }}
                onClick={handleShowNumbers}
            />
            <Profile>
                <Welcome>Olá, {emoji}</Welcome>
                <UserName>{usuarioNome}</UserName>

            </Profile>
        </Container>
    );
}

export default MainHeader;