import styled from 'styled-components';

export const Container = styled.div`
    width: 100%;
    height: 260px;

    background-color: ${props => props.theme.colors.tertiary};
    color: ${props => props.theme.colors.white};

    border-radius: 7px;

    margin: 10px 0;
    padding: 7px 10px;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    > div {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    
    > div span {
        font-weight: bold!important;
        overflow: visible!important;
        margin: 3px 0px 0px 8px;
    }
`;

export const FiltrHeader = styled.div`
    
    .tag-filter {
        font-size: 15px;
        background: none;
        color: ${props => props.theme.colors.white};
        margin: 10px 10px;
        opacity: .4;
        transition: opacity .3s;
        &:hover {
            opacity: .7;
    
    }

    .tag-filter-recurrent::after {
        content: '';
        margin: 0 auto;
    }

    .tag-filter-eventual::after {
        content: '';
        margin: 0 auto;
    }

    .tag-actived {
       opacity: 1;
    }

    .tipoValor {
        float: right !important;        
    }
    
`;