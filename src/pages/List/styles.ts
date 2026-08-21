import styled from 'styled-components';

export const Container = styled.div`
    max-width: 1440px;
    margin: 0 auto;
    padding-bottom: 40px;
`;

export const Toolbar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    margin-bottom: 16px;
    padding: 10px 14px;

    background: ${props => props.theme.colors.secondary};
    border: 1px solid ${props => props.theme.colors.tertiary};
    border-radius: 12px;

    .search-box {
        display: flex;
        align-items: center;
        gap: 8px;

        color: ${props => props.theme.colors.gray};
        font-size: 20px;

        svg {
            flex-shrink: 0;
            cursor: pointer;
            transition: color .2s ease;
        }

        svg:hover {
            color: ${props => props.theme.colors.white};
        }
    }

    .refresh-status {
        margin-left: auto;
        color: ${props => props.theme.colors.gray};
        font-size: 12px;
        text-align: right;
    }

    > input {
        min-width: 0;
        border: 1px solid transparent;
        border-radius: 20px;

        background: ${props => props.theme.colors.tertiary};
        color: ${props => props.theme.colors.white};
        font-size: 14px;

        outline: none;
        transition: width .25s ease, padding .25s ease, opacity .2s ease, border-color .2s ease;

        &:focus {
            border-color: ${props => props.theme.colors.success};
        }
    }

    .tag-search-open {
        width: 220px;
        padding: 9px 16px;
        opacity: 1;
    }

    .tag-search-close {
        width: 0;
        padding: 0;
        opacity: 0;
    }

    @media(max-width: 600px){
        .tag-search-open { width: 140px; }
    }
`;

export const RefreshButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    width: 38px;
    height: 38px;

    background: ${props => props.theme.colors.tertiary};
    color: ${props => props.theme.colors.gray};
    border: none;
    border-radius: 10px;

    cursor: pointer;
    transition: color .2s ease, background .2s ease;

    &:hover {
        color: ${props => props.theme.colors.white};
    }

    &:disabled {
        cursor: wait;
        opacity: .65;
    }

    svg {
        font-size: 16px;
    }

    .tag-refresh-sim {
        -webkit-animation: spin 1s linear infinite;
        -moz-animation: spin 1s linear infinite;
        animation: spin 1s linear infinite;

        @-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
        @-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
        @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform: rotate(360deg); } }
    }
`;

export const Filters = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    overflow-x: auto;
    margin-bottom: 16px;
    padding: 14px 20px;

    background: ${props => props.theme.colors.secondary};
    border: 1px solid ${props => props.theme.colors.tertiary};
    border-radius: 12px;

    .tag-filter {
        flex: 0 0 auto;

        font-size: 18px;
        font-weight: 500;

        background: none;
        color: ${props => props.theme.colors.white};

        margin: 10px 10px;
        padding: 0 0 8px;
        border: none;

        opacity: .4;
        transition: opacity .2s ease;

        &:hover {
            opacity: .7;
        }
    }

    .tag-actived {
       opacity: 1;
    }
`;

export const Content = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 10px;

    list-style: none;
    margin: 0 0 20px;
    padding: 0;
`;

export const SummaryBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;

    padding: 16px 20px;

    background: ${props => props.theme.colors.secondary};
    border: 1px solid ${props => props.theme.colors.tertiary};
    border-radius: 12px;
`;

export const ToggleButton = styled.button`
    padding: 10px 18px;

    background: ${props => props.theme.colors.tertiary};
    color: ${props => props.theme.colors.white};
    border: 1px solid transparent;
    border-radius: 8px;

    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color .2s ease;

    &:hover {
        border-color: ${props => props.theme.colors.success};
    }
`;

export const TotalValue = styled.div`
    display: flex;
    align-items: baseline;
    gap: 8px;

    span.label {
        color: ${props => props.theme.colors.gray};
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .05em;
    }

    span.value {
        color: ${props => props.theme.colors.white};
        font-size: 20px;
        font-weight: 700;
    }
`;
