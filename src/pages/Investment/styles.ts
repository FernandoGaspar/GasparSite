import styled from 'styled-components';

export const Container = styled.div`
    max-width: 1440px;
    margin: 0 auto;

    .investment-hero {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 32px;
        padding: 12px 0 32px;
        border-bottom: 1px solid ${props => props.theme.colors.tertiary};
    }

    .eyebrow { color: ${props => props.theme.colors.success}; font-size: 11px; font-weight: 700; letter-spacing: .13em; }
    .investment-hero h1 { color: ${props => props.theme.colors.white}; font-size: clamp(28px, 3vw, 42px); letter-spacing: -.045em; line-height: 1.05; margin: 8px 0 10px; }
    .investment-hero p { max-width: 520px; color: ${props => props.theme.colors.gray}; font-size: 14px; line-height: 1.55; }

    .hero-controls { display: flex; align-items: center; gap: 12px; }
    .period-picker { min-width: 190px; padding: 13px 14px; border: 1px solid ${props => props.theme.colors.tertiary}; border-radius: 12px; background: ${props => props.theme.colors.secondary}; }
    .period-picker > span { display: block; color: ${props => props.theme.colors.gray}; font-size: 11px; font-weight: 700; margin: 0 0 7px 7px; text-transform: uppercase; letter-spacing: .08em; }
    .period-picker select { color: ${props => props.theme.colors.white}; background: ${props => props.theme.colors.tertiary}; font-weight: 600; }

    .add-asset-button {
        display: flex; align-items: center; gap: 8px;
        padding: 13px 18px; height: fit-content;
        border: none; border-radius: 12px;
        background: ${props => props.theme.colors.success};
        color: ${props => props.theme.colors.primary};
        font-weight: 700; font-size: 13px;
        cursor: pointer;
        transition: transform .15s ease, box-shadow .15s ease;
    }
    .add-asset-button:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(6,214,160,.25); }

    @media(max-width: 600px) {
        .investment-hero { align-items: flex-start; flex-direction: column; padding-bottom: 22px; }
        .hero-controls { width: 100%; flex-direction: column; align-items: stretch; }
        .period-picker { width: 100%; }
    }
`;

export const Content = styled.main`
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 26px 0 48px;

    > div, > section { min-width: 0; }

    .summary-cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
    .summary-cards > div { min-width: 0; }

    .section-card { padding: 18px 20px; background: ${props => props.theme.colors.secondary}; border: 1px solid ${props => props.theme.colors.tertiary}; border-radius: 14px; }
    .section-heading { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-heading h2 { color: ${props => props.theme.colors.white}; font-size: 18px; letter-spacing: -.02em; }
    .section-heading span { color: ${props => props.theme.colors.gray}; font-size: 12px; }

    .allocation-evolution-row { display: grid; grid-template-columns: 1fr 1.4fr; gap: 16px; }
    .allocation-evolution-row .section-card > div { width: 100%; margin: 0; }
    .allocation-evolution-row .section-card > div > h2 { display: none; }

    .holdings-grid { display: flex; flex-wrap: wrap; justify-content: space-between; }
    .holdings-empty, .chart-placeholder-text { color: ${props => props.theme.colors.gray}; font-size: 13px; padding: 24px 0; text-align: center; }

    .ticker-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .ticker-chip {
        padding: 8px 14px; border-radius: 999px; cursor: pointer;
        font-size: 12px; font-weight: 700; letter-spacing: .02em;
        border: 1px solid ${props => props.theme.colors.tertiary};
        background: ${props => props.theme.colors.tertiary};
        color: ${props => props.theme.colors.gray};
    }
    .ticker-chip.active { background: ${props => props.theme.colors.success}; border-color: ${props => props.theme.colors.success}; color: ${props => props.theme.colors.primary}; }

    .asset-detail-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; }
    .asset-price-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; }
    .asset-price-header h3 { color: ${props => props.theme.colors.white}; font-size: 20px; }
    .asset-price-header .price { font-weight: 700; font-size: 18px; }
    .chart-placeholder { height: 220px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: ${props => props.theme.colors.tertiary}; }

    .suggestion-card { padding: 16px; border-radius: 10px; background: ${props => props.theme.colors.tertiary}; margin-bottom: 16px; }
    .suggestion-card .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; margin-bottom: 8px; }
    .suggestion-card .badge.buy { background: rgba(6,214,160,.16); color: ${props => props.theme.colors.success}; }
    .suggestion-card .badge.sell { background: rgba(239,71,111,.16); color: ${props => props.theme.colors.warning}; }
    .suggestion-card .badge.hold { background: rgba(255,209,102,.16); color: ${props => props.theme.colors.info}; }
    .suggestion-card p { color: ${props => props.theme.colors.gray}; font-size: 13px; line-height: 1.5; }

    .alerts-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .alert { display: flex; gap: 11px; min-height: 70px; padding: 14px; border-radius: 10px; background: ${props => props.theme.colors.tertiary}; }
    .alert-icon { display: grid; place-items: center; flex: 0 0 25px; height: 25px; border-radius: 50%; font-size: 14px; font-weight: 700; }
    .alert h3 { color: ${props => props.theme.colors.white}; font-size: 13px; line-height: 1.35; margin-bottom: 5px; }
    .alert p { color: ${props => props.theme.colors.gray}; font-size: 12px; line-height: 1.45; }
    .alert.warning .alert-icon { color: #ffcc66; background: rgba(255, 209, 102, .16); }
    .alert.attention .alert-icon { color: #ff7c99; background: rgba(239, 71, 111, .14); }
    .alert.info .alert-icon { color: #06D6A0; background: rgba(6, 214, 160, .14); }

    .market-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
    .market-card { padding: 14px; border-radius: 10px; background: ${props => props.theme.colors.tertiary}; text-align: center; }
    .market-card .label { display: block; color: ${props => props.theme.colors.gray}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; }
    .market-card .value { font-size: 18px; font-weight: 700; color: ${props => props.theme.colors.white}; }

    @media(max-width: 1100px) {
        .summary-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .allocation-evolution-row { grid-template-columns: 1fr; }
        .asset-detail-grid { grid-template-columns: 1fr; }
        .market-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .alerts-list { grid-template-columns: 1fr; }
    }

    @media(max-width: 600px) {
        gap: 16px;
        padding-top: 20px;
        .summary-cards { grid-template-columns: 1fr; }
        .section-card { padding: 14px; }
    }
`;
