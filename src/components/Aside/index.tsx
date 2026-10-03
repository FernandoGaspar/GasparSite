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
    MdPlaylistAddCheck,
    MdEmail,
    MdDeviceHub,
    MdLink,
} from 'react-icons/md';

import logoImg from '../../assets/gaspar-mark.png';

import { useAuth } from '../../hooks/auth';
import { useTheme } from '../../hooks/theme';

import {
    Container,
    Header,
    LogImg,
    Title,
    MenuContainer,
    MenuItemLink,
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
    { to: '/connections', label: 'Conexões', icon: MdLink },
    { to: '/assistant', label: 'Agentes', icon: MdChatBubble },
    { to: '/planning', label: 'Planejamento', icon: MdDateRange },
    { to: '/activities', label: 'Atividades', icon: MdPlaylistAddCheck },
    { to: '/agenda', label: 'Agenda', icon: MdDateRange },
    { to: '/communications', label: 'Comunicação', icon: MdEmail },
    { to: '/second-brain', label: 'Segundo cérebro', icon: MdDeviceHub },
    { to: '/settings', label: 'Configurações', icon: MdSettings },
    { to: '/health', label: 'Saúde', icon: MdDirectionsBike },
];

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

                <LogImg src={logoImg} alt="" aria-hidden="true" />
                <Title>Gaspar</Title>
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
