import styled, { css } from 'styled-components';
import { NavLink } from 'react-router-dom';


interface IContainerProps {
    menuIsOpen: boolean;
}


interface IThemeToggleFooterProps {
    menuIsOpen: boolean;
}


export const Container = styled.div<IContainerProps>`
    grid-area: AS;

    display: flex;
    flex-direction: column;

    background-color: ${props => props.theme.colors.secondary};
    padding: 24px 16px;

    border-right: 1px solid ${props => props.theme.colors.tertiary};

    position: relative;

    @media(max-width: 900px){
        position: fixed;
        z-index: 2;
        top: 0;
        left: 0;

        width: 220px;
        padding: 16px;

        height: ${props => props.menuIsOpen ? '100vh' : '70px'};
        overflow: hidden;

        ${props => !props.menuIsOpen && css`
            border: none;
            border-bottom: 1px solid ${props => props.theme.colors.tertiary};
        `};
    }
`;

export const Header = styled.header`
    height: 46px;
    display: flex;
    align-items: center;
    gap: 10px;

    padding-bottom: 20px;
    margin-bottom: 16px;
    border-bottom: 1px solid ${props => props.theme.colors.tertiary};
`;

export const LogImg = styled.img`
    height: 34px;
    width: 34px;

    @media(max-width: 900px){
        display: none;
    }
`;

export const Title = styled.h3`
    color: ${props => props.theme.colors.white};
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -.01em;

    @media(max-width: 900px){
        display: none;
    }
`;


export const MenuContainer = styled.nav`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;

    overflow-y: auto;
`;

const menuItemBase = css`
    color: ${props => props.theme.colors.gray};
    text-decoration: none;

    display: flex;
    align-items: center;
    gap: 12px;

    width: 100%;
    padding: 10px 12px;
    border: none;
    border-radius: 10px;
    background: none;

    font-size: 14px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;

    transition: background .15s ease, color .15s ease;

    > svg {
        font-size: 19px;
        flex-shrink: 0;
    }

    &:hover {
        background: ${props => props.theme.colors.tertiary};
        color: ${props => props.theme.colors.white};
    }
`;

export const MenuItemLink = styled(NavLink)`
    ${menuItemBase}

    &.active {
        background: rgba(6, 214, 160, .14);
        color: ${props => props.theme.colors.success};
    }
`;

export const MenuFooter = styled.div`
    padding-top: 16px;
    margin-top: 8px;
    border-top: 1px solid ${props => props.theme.colors.tertiary};
`;

export const MenuItemButton = styled.button`
    ${menuItemBase}

    &:hover {
        background: rgba(239, 71, 111, .12);
        color: ${props => props.theme.colors.warning};
    }
`;

export const ToggleMenu = styled.button`
    width: 40px;
    height: 40px;

    border: none;
    border-radius: 10px;
    font-size: 22px;

    background-color: ${props => props.theme.colors.tertiary};
    color: ${props => props.theme.colors.white};

    transition: opacity .3s;

    &:hover{
        opacity: 0.8;
    }

    display: none;

    @media(max-width: 900px){
        display: flex;
        justify-content: center;
        align-items: center;
    }
`;

export const ThemeToggleFooter = styled.footer<IThemeToggleFooterProps>`
    display: none;
    position: absolute;
    bottom: 30px;

    @media(max-width: 900px){
        display: ${props => props.menuIsOpen ? 'flex' : 'none'};
    }

`;
