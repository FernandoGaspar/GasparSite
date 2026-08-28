import React, {useState} from 'react';
import Toggle from '../Toggle';

import {
    MdDashboard,
    MdArrowDownward,
    MdArrowUpward,
    MdExitToApp,
    MdClose,
    MdMenu,
    MdTrendingUp,
    MdDirectionsBike,
    MdHome,
    MdSettingsInputAntenna,
    MdSettings,
    MdChatBubble,
    MdDateRange,
    MdLandscape,
    MdPlaylistAddCheck,
} from 'react-icons/md';

import logoImg from '../../assets/logo.svg';

import { useAuth } from '../../hooks/auth';
import { useTheme } from '../../hooks/theme';

import {
    Container,
    Header,
    LogImg,
    Title,
    MenuContainer,
    MenuItemLink,
    MenuItemAnchor,
    MenuFooter,
    MenuItemButton,
    ToggleMenu,
    ThemeToggleFooter,
}  from './styles';

const menuItems = [
    { to: '/', label: 'Dashboard', icon: MdDashboard, exact: true },
    { to: '/list/entry-balance', label: 'Entradas', icon: MdArrowUpward },
    { to: '/list/exit-balance', label: 'Saídas', icon: MdArrowDownward },
    { to: '/investment', label: 'Investimentos', icon: MdTrendingUp },
    { to: '/home', label: 'Casa', icon: MdHome },
    { to: '/tracker', label: 'Rastreador', icon: MdSettingsInputAntenna },
    { to: '/assistant', label: 'Assistente', icon: MdChatBubble },
    { to: '/planning', label: 'Planejamento', icon: MdDateRange },
    { to: '/activities', label: 'Atividades', icon: MdPlaylistAddCheck },
    { to: '/settings', label: 'Configurações', icon: MdSettings },
    { to: '/health', label: 'Saúde', icon: MdDirectionsBike },
];

// Enabled by default so routine builds cannot silently remove the module.
// It remains explicitly removable with REACT_APP_SITIOS_ENABLED=false.
const sitiosEnabled = process.env.REACT_APP_SITIOS_ENABLED !== 'false';
const sitiosUrl = process.env.REACT_APP_SITIOS_WEB_URL || '/sitios/';

const Aside: React.FC = () => {
    const { signOut } = useAuth();
    const { toggleTheme, theme } = useTheme();

    const [toggleMenuIsOpened, setToggleMenuIsOpened ] = useState(false);
    const [darkTheme, setDarkTheme] = useState(() => theme.title === 'dark' ? true : false);


    const handleToggleMenu = () => {
        setToggleMenuIsOpened(!toggleMenuIsOpened);
    }


    const handleChangeTheme = () => {
        setDarkTheme(!darkTheme);
        toggleTheme();
    }


    return (
        <Container menuIsOpen={toggleMenuIsOpened}>
            <Header>
                <ToggleMenu onClick={handleToggleMenu}>
                { toggleMenuIsOpened ? <MdClose /> : <MdMenu /> }
                </ToggleMenu>

                <LogImg src={logoImg} alt="Logo Minha Carteira" />
                <Title>Minha Carteira</Title>
            </Header>

            <MenuContainer>
                {menuItems.map(item => (
                    <MenuItemLink
                        key={item.to}
                        to={item.to}
                        exact={item.exact}
                        activeClassName="active"
                        onClick={() => setToggleMenuIsOpened(false)}
                    >
                        <item.icon />
                        {item.label}
                    </MenuItemLink>
                ))}
                {sitiosEnabled && (
                    <MenuItemAnchor href={sitiosUrl} onClick={() => setToggleMenuIsOpened(false)}>
                        <MdLandscape />
                        Sítios
                    </MenuItemAnchor>
                )}
            </MenuContainer>

            <MenuFooter>
                <MenuItemButton onClick={signOut}>
                    <MdExitToApp />
                    Sair
                </MenuItemButton>
            </MenuFooter>

            <ThemeToggleFooter menuIsOpen={toggleMenuIsOpened}>
                <Toggle
                    labelLeft="Light"
                    labelRight="Dark"
                    checked={darkTheme}
                    onChange={handleChangeTheme}
                />
            </ThemeToggleFooter>
        </Container>
    );
}

export default Aside;
