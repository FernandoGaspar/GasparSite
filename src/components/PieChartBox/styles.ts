import styled, { keyframes } from 'styled-components';

interface ITitleContainerProps {
    lineColor: string;
}

const animate = keyframes`
    0% {
        transform: translateX(100px);
        opacity: 0;
    }
    50%{
        opacity: .3;
    }
    100%{
        transform: translateX(0px);
        opacity: 1;
    }
`;


export const Container = styled.div`
    width: 100%;
    height: 260px;
    margin: 10px 0px 0px 0;

    background-color: ${props => props.theme.colors.tertiary};
    color: ${props => props.theme.colors.white};
    border-radius: 7px;
    animation: ${animate} .5s;
    display: flex;
    overflow-y: visible;

    > section {
        display: flex;
        width: 120px;
        flex-wrap: wrap;
        flex-direction: row;
        margin: 10px 15px;
    }

    > section span {
        font-weight: bold;
        overflow: visible!important;
        margin: 0px -90px 0px 0px;
    }

    > section main {
        margin: 65px 0px;

        height: 150px;
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;

        padding-bottom: 0;
        overflow-x: scroll;

        ::-webkit-scrollbar {
            width: 10px;
        }
    
        ::-webkit-scrollbar-thumb {
            background-color: ${props => props.theme.colors.secondary};
            border-radius: 10px;
        }
    
        ::-webkit-scrollbar-track {
            background-color: ${props => props.theme.colors.tertiary};
        }
    }
`;

export const TituloGrupo = styled.div<ITitleContainerProps>`
    margin: 3px; 
    
    > footer {
        border-top: 5px solid ${props => props.lineColor};
        width: 55px;
        font-size: 12px;
        margin: 0px;
        content: '';
    }
    > h1 {
        font-size: 10px;
        margin: 0px;
    }
    @media(max-width: 420px){
        > footer {
                &::after {
                content: '';
                display: block;
                width: 35px;
                margin: 0px;
                border-top: 3px solid ${props => props.lineColor};
            }
        }
    }

`;
