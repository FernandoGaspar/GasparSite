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

    width: 100%;
    height: 150px;

    border-radius: 7px;

    margin: 5px 0;
    padding: 20px 20px;

    /* position: relative; */
    overflow: hidden;
    
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    animation: ${animate} .5s;
    .divSwitch  {


    }
    > header h1 {
        font-size: 20px;
    }
    > div span {
        margin: 3px 3px;
        display: flex;
        justify-content: space-between; 
    }

    > Switch {
        display: flex;
    }
`;