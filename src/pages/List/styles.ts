import styled from 'styled-components';

export const Container = styled.div`
    > input {
        border-radius: 10px;
        margin-left: 10px;
        text-align: center;
    }
    
    .tag-search-open {
        font-size: 21px;
        width: auto;
        height: 30px;
    }
    .tag-search-close {
        font-size: 0px;
    }
`;

export const Content = styled.main``;

export const Filters = styled.div`
    overflow-x: auto;
    width: 100%;
    height: 70px;

    display: flex;
    justify-content: space-between; //verificar

    margin-bottom: 0px;

    .tag-filter {
        font-size: 18px;
        font-weight: 500;

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
        display: block;
        width: 55px;
        margin: 0 auto;
        border-bottom: 10px solid ${props => props.theme.colors.success};
    }

    .tag-filter-eventual::after {
        content: '';
        display: block;
        width: 55px;
        margin: 0 auto;
        /* border-bottom: 10px solid ${props => props.theme.colors.success}; */
    }

    .tag-actived {
       opacity: 1;
    }

`;

export const Refresh =  styled.div `
    float: right;
    font-size: 30px;

    .tag-refresh-sim {
        float: right;
        font-size: 30px;

        -webkit-animation:spin 4s linear;
        -moz-animation:spin 4s linear;
        animation:spin 4s linear;
        animation-iteration-count: 100;

        @-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
        @-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
        @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
    }

`;