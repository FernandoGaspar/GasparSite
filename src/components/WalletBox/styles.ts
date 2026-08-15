import styled, {keyframes} from 'styled-components';

interface IContainerProps {
    color: string;
}

const animate = keyframes`
    0%{
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

export const Container = styled.div<IContainerProps>`
    position: relative;
    width: 100%;
    min-height: 148px;

    margin: 0;
    padding: 22px 24px;

    background: ${props => props.theme.colors.secondary};
    border: 1px solid ${props => props.theme.colors.tertiary};
    border-radius: 14px;
    color: ${props => props.theme.colors.white};

    overflow: hidden;

    animation: ${animate} .5s;
    transition: transform .2s ease, box-shadow .2s ease;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: ${props => props.color};
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 28px rgba(0,0,0,.12);
    }

    .icon-chip {
        position: absolute;
        top: 22px;
        right: 22px;

        display: flex;
        align-items: center;
        justify-content: center;

        width: 40px;
        height: 40px;

        border-radius: 10px;
        background: ${props => props.color}22;
    }

    .icon-chip i {
        display: block;
        width: 18px;
        height: 18px;

        background-color: ${props => props.color};

        mask-size: contain;
        mask-repeat: no-repeat;
        mask-position: center;
        -webkit-mask-size: contain;
        -webkit-mask-repeat: no-repeat;
        -webkit-mask-position: center;
    }

    > span.label {
        display: block;
        color: ${props => props.theme.colors.gray};
        font-size: 12px;
        font-weight: 700;
        letter-spacing: .07em;
        text-transform: uppercase;
        padding-right: 50px;
    }

    > h1 {
        margin-top: 12px;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -.02em;
        color: ${props => props.color};
        word-wrap: break-word;

        strong {
            font-size: 15px;
            font-weight: 600;
            opacity: .75;
            margin-right: 1px;
        }
    }

    > small {
        display: block;
        margin-top: 16px;
        color: ${props => props.theme.colors.gray};
        font-size: 12px;
    }

    @media(max-width: 770px){
        > h1 {
            font-size: 24px;
        }
    }
`;
