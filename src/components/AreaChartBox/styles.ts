import styled, { keyframes } from 'styled-components';

interface ILegendProps {
    color: string;
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

    margin: 10px 0;

    > h2 {
        margin-bottom: 20px;
        margin: 4%;
    }

    background-color: ${props => props.theme.colors.tertiary};
    color: ${props => props.theme.colors.white};

    border-radius: 7px;

    display: flex;
    flex-direction: column;
    animation: ${animate} .5s;

    @media(max-width: 770px){
        display: flex;
        width: 100%;

    }
`;
export const FiltersFooter = styled.div`
    .tag-filter {
        font-size: 19px;
        background: none;
        color: ${props => props.theme.colors.white};
        margin: 10px 10px;
        opacity: .4;
        transition: opacity .3s;
        &:hover {
            opacity: .7;
        }
    }

    .tag-filter-recurrent::after {
        content: '';
        // display: block;
        margin: 0 auto;
    }

    .tag-filter-eventual::after {
        content: '';
        // display: block;
        margin: 0 auto;
    }

    .tag-actived {
       opacity: 1;
    }

    .tipoValor {
        float: right !important;
    }

`;