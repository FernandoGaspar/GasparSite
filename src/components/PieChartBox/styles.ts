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
    align-items: stretch;
    overflow-y: visible;

    > .recharts-responsive-container {
        flex: 1 1 0;
        min-width: 0;
    }

    > section {
        display: flex;
        width: 120px;
        flex: 0 0 120px;
        min-width: 0;
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

    /* Abaixo de ~640px o layout lado-a-lado (legenda fixa em 120px + gráfico
       flex) não cabe: a pizza é empurrada para fora do card. Empilha tudo
       verticalmente em vez de tentar espremer o layout desktop. */
    @media (max-width: 640px) {
        flex-direction: column;
        height: auto;
        overflow: hidden;

        > .recharts-responsive-container {
            width: 100% !important;
            flex: 0 0 auto;
        }

        > section {
            box-sizing: border-box;
            width: 100%;
            flex: 0 0 auto;
            margin: 0;
            padding: 16px 16px 0;
        }

        > section span {
            margin: 0;
            width: 100%;
            font-size: 16px;
        }

        > section main {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px 12px;
            width: 100%;
            margin: 12px 0 0;
            height: auto;
            max-height: none;
            overflow: visible;
        }

        > .recharts-responsive-container { height: 230px !important; }
        .recharts-pie-labels { display: none; }
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
        min-width: 0;
        margin: 0;

        > footer {
            width: auto;
            overflow: hidden;
            font-size: 10px;
            line-height: 1.3;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        > h1 { margin-top: 3px; }
    }

`;
