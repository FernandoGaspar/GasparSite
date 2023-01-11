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
    width: 100%;
    height: 260px;

    margin: 10px 0;

    > h2 {
        margin-bottom: 20px;
        margin: 4%;
    }
    > span {
        margin: 4px 4px 4px 4px;
        font-size: 18px;
        font-weight: 500;
    }

    background-color: ${props => props.theme.colors.tertiary};
    color: ${props => props.theme.colors.white};

    border-radius: 7px;

    animation: ${animate} .5s;

`;