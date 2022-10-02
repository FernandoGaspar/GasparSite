import styled, {keyframes} from 'styled-components';

export const Container = styled.div`
    
    > .divRow {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-top: 7px;
    }
    > .divLine {
        border-bottom: 1.5px solid white;
    }
    > .switch {
        margin-left: 160px;
    }
    > .collapse {
    }
    > .doubleArrow {
        font-size: 23px;
        float: right;
        margin-left: 500% !important;
    }

    > div Button {
        color: ${props => props.theme.colors.white};   
    }
`;

