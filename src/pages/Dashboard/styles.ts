import styled from 'styled-components';

export const Container = styled.div``;

export const Content = styled.div`
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    > section {
        width: 50%;

        @media(max-width: 770px){
            width: 100%;
        }
    }
    
`;
