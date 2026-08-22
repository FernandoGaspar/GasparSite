import styled, { keyframes } from 'styled-components';

interface ITitleContainerProps { lineColor: string }

const animate = keyframes`
    from { transform: translateY(8px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
`;

export const Container = styled.div`
    display: grid;
    grid-template-columns: minmax(230px, .82fr) minmax(300px, 1.18fr);
    min-height: 292px;
    overflow: hidden;
    color: ${props => props.theme.colors.white};
    background: ${props => props.theme.colors.tertiary};
    border-radius: 10px;
    animation: ${animate} .35s ease-out;

    .pie-summary {
        display: flex;
        flex-direction: column;
        min-width: 0;
        padding: 18px;
        border-right: 1px solid rgba(148, 163, 184, .18);
    }
    .pie-summary header > span {
        display: block;
        color: ${props => props.theme.colors.white};
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -.02em;
    }
    .pie-summary header > small {
        display: block;
        margin-top: 5px;
        color: ${props => props.theme.colors.gray};
        font-size: 11px;
    }
    .pie-summary main {
        display: grid;
        gap: 4px;
        margin-top: 16px;
        overflow: auto;
    }
    .pie-chart-area { position: relative; min-height: 292px; }
    .pie-total-caption {
        position: absolute;
        top: calc(50% + 22px);
        left: 50%;
        width: 135px;
        transform: translateX(-50%);
        color: ${props => props.theme.colors.gray};
        font-size: 10px;
        line-height: 1.25;
        text-align: center;
    }
    .pie-total-value { fill: ${props => props.theme.colors.white}; font-size: 13px; font-weight: 700; }
    .pie-empty { display: grid; place-items: center; height: 100%; color: ${props => props.theme.colors.gray}; font-size: 13px; }

    @media (max-width: 740px) {
        grid-template-columns: 1fr;
        .pie-summary { padding: 16px; border-right: 0; border-bottom: 1px solid rgba(148, 163, 184, .18); }
        .pie-summary main { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .pie-chart-area { min-height: 270px; }
    }
    @media (max-width: 420px) { .pie-summary main { grid-template-columns: 1fr; } }
`;

export const TituloGrupo = styled.button<ITitleContainerProps>`
    display: grid;
    grid-template-columns: 8px minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 8px;
    width: 100%;
    padding: 7px 8px;
    border: 1px solid transparent;
    border-radius: 7px;
    color: inherit;
    background: transparent;
    cursor: pointer;
    font: inherit;
    text-align: left;
    &:hover, &.selected { border-color: ${props => props.lineColor}88; background: ${props => props.lineColor}16; }
    > i {
        grid-row: span 2;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${props => props.lineColor};
        box-shadow: 0 0 0 3px ${props => props.lineColor}24;
    }
    > span {
        overflow: hidden;
        color: ${props => props.theme.colors.white};
        font-size: 11px;
        font-weight: 650;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    > strong { color: ${props => props.lineColor}; font-size: 11px; }
    > em {
        grid-column: 2 / 4;
        margin-top: 2px;
        color: ${props => props.theme.colors.gray};
        font-size: 10px;
        font-style: normal;
    }
`;
