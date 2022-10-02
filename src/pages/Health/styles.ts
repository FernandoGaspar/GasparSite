import styled from 'styled-components';

export const Container = styled.div`
    > div {
        > table {
        
            border-collapse:collapse;   
            border-spacing:0;   
            empty-cells:show;   
            border:1px solid #cbcbcb;

            font-size:inherit;   
            margin:0;   
            overflow:visible;   
            
            > thead{   
                background:#e0e0e0;   
                color:#000;   
                text-align:left;   
                vertical-align:bottom;
            }

        }
    } 

    .iniciar {
        width: 130px;
        height: 130px;
        background: green;
        -moz-border-radius: 70px;
        -webkit-border-radius: 70px;
        border-radius: 70px;
        
        overflow: hidden;
        margin-left: auto;
        margin-right: auto;

        display: flex;
        align-items: center;
        justify-content: center;
        
        &:hover{
            opacity: 0.7;
        }
    }
    .finalizar {
        width: 130px;
        height: 130px;
        background: grey;
        -moz-border-radius: 70px;
        -webkit-border-radius: 70px;
        border-radius: 70px;
        
        overflow: hidden;
        margin-left: auto;
        margin-right: auto;

        display: flex;
        align-items: center;
        justify-content: center;
        
        &:hover{
            opacity: 0.7;
        }
    }
    .resultado {       
        overflow: hidden;
        margin-left: auto;
        margin-right: auto;

        display: flex;
        align-items: center;
        justify-content: center;
        
        &:hover{
            opacity: 0.7;
        }
    }
    .tabela {
        display: flex;
        align-items: center;
        justify-content: center;
    }

`;
