import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html, body, #root {
        height: 100%;
    }

    body {
        background: #f8fafc;
        color: #0f172a;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    *, button, input {
        border: 0;
        outline: 0;
        font-family: 'Roboto', sans-serif;
    }

    button {
        cursor: pointer;
    }

    button:disabled {
        cursor: not-allowed;
    }

    /* react-st-modal theming (library exposes its chrome via CSS custom properties) */
    :root {
        --st-overlay-color: rgba(2, 6, 23, .6);
        --st-modal-backgroundColor: ${props => props.theme.colors.secondary};
        --st-modal-titleTextColor: ${props => props.theme.colors.white};
        --st-modal-secondColor: ${props => props.theme.colors.tertiary};
        --st-modal-borderRadius: 14px;
        --st-modal-border: 1px solid ${props => props.theme.colors.tertiary};
        --st-modal-boxShadow: 0 24px 60px rgba(0,0,0,.5);
        --st-dialog-maxWidth: 900px;
        --st-dialog-contentColor: ${props => props.theme.colors.white};
        --st-button-primaryColor: ${props => props.theme.colors.success};
        --st-button-lightColor: ${props => props.theme.colors.tertiary};
        --st-button-lightTextColor: ${props => props.theme.colors.white};
        --st-button-darkColor: ${props => props.theme.colors.tertiary};
        --st-button-darkTextColor: ${props => props.theme.colors.white};
    }

    .stf__dialogClose svg {
        fill: ${props => props.theme.colors.gray};
    }

    /* O react-st-modal é renderizado em um portal fora do #root. As regras
       estruturais abaixo garantem que o chrome e a área rolável acompanhem o
       tema mesmo quando os defaults da biblioteca forem injetados depois. */
    .stf__modalDialogsPlace [role='dialog'] {
        background: ${props => props.theme.colors.secondary} !important;
        color: ${props => props.theme.colors.white};
        border-color: ${props => props.theme.colors.tertiary} !important;
        color-scheme: ${props => props.theme.title};
    }

    .stf__modalDialogsPlace [role='dialog'] > h3 {
        background: ${props => props.theme.colors.secondary};
        color: ${props => props.theme.colors.white};
        border-bottom-color: ${props => props.theme.colors.tertiary};
    }

    .stf__modalDialogsPlace [role='dialog'] > div[id^='content_'] {
        background: ${props => props.theme.colors.secondary};
        color: ${props => props.theme.colors.white};
        scrollbar-color: ${props => props.theme.colors.tertiary} ${props => props.theme.colors.secondary};
        scrollbar-width: thin;
    }

    .stf__modalDialogsPlace [role='dialog'] > div[id^='content_']::-webkit-scrollbar {
        width: 10px;
    }

    .stf__modalDialogsPlace [role='dialog'] > div[id^='content_']::-webkit-scrollbar-track {
        background: ${props => props.theme.colors.secondary};
    }

    .stf__modalDialogsPlace [role='dialog'] > div[id^='content_']::-webkit-scrollbar-thumb {
        background: ${props => props.theme.colors.tertiary};
        border: 2px solid ${props => props.theme.colors.secondary};
        border-radius: 999px;
    }
`;
