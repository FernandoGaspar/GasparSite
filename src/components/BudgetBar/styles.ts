import styled, { keyframes } from 'styled-components';

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
    overflow-x: auto;
    width: 48%;
    height: 530px;
    margin: 10px 0;
    border-radius: 7px;
    background-color: ${props => props.theme.colors.tertiary};
    color: ${props => props.theme.colors.white};


    padding: 20px 20px;


    display: flex;
    justify-content: start;
    flex-wrap: wrap;

    animation: ${animate} .5s;

    @media(max-width: 770px){
       width: 100%;
       display: flex;
       justify-content: space-between;
       flex-wrap: wrap;
    }

    overflow-y: scroll;

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
`;
