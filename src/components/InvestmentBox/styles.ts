import styled, {keyframes} from 'styled-components';

const animate = keyframes`
    0% {
        transform: translateX(-100px);
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
    background-color: ${props => props.theme.colors.tertiary};
    color: ${props => props.theme.colors.white};

    width: 32%;
    height: 150px;

    border-radius: 7px;

    margin: 5px 0;
    padding: 20px 20px;

    position: relative;
    overflow: hidden;
    
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    animation: ${animate} .5s;

    > header img {
        width: 35px;
        margin-left: 7px;
    }

    > header p {
        font-size: 18px;
    }

    > header h1 {
        font-size: 20px;
    }
    > footer small {
        font-size: 10px;
    }

    > header section p {
        font-size: 13px;
        text-align: right;
        margin: 1%;
    }

    @media(max-width: 420px){
        width: 100%;

        > h1 {
            display: flex;
            
            strong {
                position: initial;        
                width: auto;
                font-size: 22px;
            }

            strong:after {
                display: inline-block;
                content: '';
                width: 1px;                
            }
        }
    }
`;