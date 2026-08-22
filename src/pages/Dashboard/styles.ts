import styled from 'styled-components';

export const Container = styled.div`
    max-width: 1440px;
    margin: 0 auto;

    .dashboard-hero {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 32px;
        padding: 12px 0 32px;
        border-bottom: 1px solid ${props => props.theme.colors.tertiary};
    }

    .eyebrow { color: ${props => props.theme.colors.success}; font-size: 11px; font-weight: 700; letter-spacing: .13em; }
    .dashboard-hero h1 { color: ${props => props.theme.colors.white}; font-size: clamp(28px, 3vw, 42px); letter-spacing: -.045em; line-height: 1.05; margin: 8px 0 10px; }
    .dashboard-hero p { max-width: 520px; color: ${props => props.theme.colors.gray}; font-size: 14px; line-height: 1.55; }
    .period-picker { min-width: 230px; padding: 13px 14px; border: 1px solid ${props => props.theme.colors.tertiary}; border-radius: 12px; background: ${props => props.theme.colors.secondary}; }
    .period-picker > span { display: block; color: ${props => props.theme.colors.gray}; font-size: 11px; font-weight: 700; margin: 0 0 7px 7px; text-transform: uppercase; letter-spacing: .08em; }
    .period-picker > div { display: flex; }
    .period-picker select { color: ${props => props.theme.colors.white}; background: ${props => props.theme.colors.tertiary}; font-weight: 600; }

    @media(max-width: 600px) {
        .dashboard-hero { align-items: flex-start; flex-direction: column; padding-bottom: 22px; }
        .period-picker { width: 100%; }
    }
`;

export const Content = styled.main`
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 26px 0 48px;

    > div, > section { min-width: 0; }

    /* Summary cards */
    .summary-cards {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
    }
    .summary-cards > div { min-width: 0; }

    /* Budget planning module */
    .budget-section { padding: 18px 20px; background: ${props => props.theme.colors.secondary}; border: 1px solid ${props => props.theme.colors.tertiary}; border-radius: 14px; }
    .budget-section > div { width: 100%; margin: 0; }

    /* Cost trend module */
    .trend-section { border: 1px solid ${props => props.theme.colors.tertiary}; border-radius: 14px; overflow: hidden; }
    .trend-section > div { width: 100%; margin: 0; }

    /* Investment evolution module */
    .investment-section > div { width: 100%; margin: 0; border-radius: 14px; }

    /* Paired insight cards */
    .insights-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; padding: 18px; background: ${props => props.theme.colors.secondary}; border: 1px solid ${props => props.theme.colors.tertiary}; border-radius: 14px; }
    .insights-row > div { width: 100%; margin: 0; border-radius: 10px; }
    .insights-row > div > h2 { display: none; }

    .investment-pie-section { padding: 18px; background: ${props => props.theme.colors.secondary}; border: 1px solid ${props => props.theme.colors.tertiary}; border-radius: 14px; }
    .investment-pie-section > div { width: 100%; margin: 0; border-radius: 10px; }
    .investment-pie-section > div > h2 { display: none; }

    .message-section > div { width: 100%; min-height: 180px; margin: 0; border-radius: 14px; }

    .alerts { padding: 22px 24px; background: linear-gradient(110deg, ${props => props.theme.colors.secondary}, ${props => props.theme.colors.tertiary}); border-radius: 14px; }
    .alerts-heading { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
    .alerts-heading h2 { color: ${props => props.theme.colors.white}; font-size: 20px; margin-top: 5px; letter-spacing: -.025em; }
    .alerts-heading > span { color: ${props => props.theme.colors.gray}; font-size: 12px; }
    .alerts-meta { display:flex; align-items:center; gap:12px; }
    .alerts-meta a { color:#8fc4ff; font-size:12px; font-weight:700; text-decoration:none; }
    .alerts-meta a:hover { text-decoration:underline; }
    .alerts-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .alert { display: flex; gap: 11px; min-height: 90px; padding: 14px; border-radius: 10px; background: ${props => props.theme.colors.secondary}; border: 1px solid rgba(148,163,184,.18); }
    .alert-icon { display: grid; place-items: center; flex: 0 0 25px; height: 25px; border-radius: 50%; font-size: 14px; font-weight: 700; }
    .alert h3 { color: ${props => props.theme.colors.white}; font-size: 13px; line-height: 1.35; margin-bottom: 5px; }
    .alert p { color: ${props => props.theme.colors.gray}; font-size: 12px; line-height: 1.45; }
    .alert.warning .alert-icon { color: #ffcc66; background: rgba(255, 209, 102, .16); }
    .alert.attention .alert-icon { color: #ff7c99; background: rgba(239, 71, 111, .14); }
    .alert.info .alert-icon { color: #06D6A0; background: rgba(6, 214, 160, .14); }

    .recurring-bills { padding: 20px; background: ${props => props.theme.colors.secondary}; border: 1px solid ${props => props.theme.colors.tertiary}; border-radius: 14px; }
    .recurring-bills-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
    .recurring-bills-heading h2 { margin-top: 5px; color: ${props => props.theme.colors.white}; font-size: 20px; letter-spacing: -.025em; }
    .recurring-bills-heading > span { color: ${props => props.theme.colors.gray}; font-size: 12px; }
    .recurring-bills-list { display: grid; gap: 8px; }
    .recurring-bills-list > p { padding: 16px 0; color: ${props => props.theme.colors.gray}; font-size: 13px; }
    .recurring-bill { display: grid; grid-template-columns: minmax(180px, 1.5fr) minmax(120px, .55fr) minmax(130px, .7fr) minmax(100px, .4fr); align-items: center; gap: 14px; min-height: 66px; padding: 12px 14px; border: 1px solid rgba(148,163,184,.15); border-radius: 9px; background: rgba(15, 23, 42, .35); }
    .recurring-bill-main { display: grid; gap: 4px; }
    .recurring-bill strong, .recurring-bill b { color: ${props => props.theme.colors.white}; font-size: 13px; }
    .recurring-bill-main span, .recurring-bill small { color: ${props => props.theme.colors.gray}; font-size: 11px; }
    .recurring-status { justify-self: start; padding: 4px 7px; border-radius: 999px; font-size: 10px; font-weight: 700; }
    .recurring-bill.pago .recurring-status { color: #65d7ab; background: rgba(6,214,160,.13); }
    .recurring-bill.a_vencer .recurring-status, .recurring-bill.pendente .recurring-status { color: #9ecfff; background: rgba(57,148,235,.14); }
    .recurring-bill.vence_hoje .recurring-status, .recurring-bill.divergente .recurring-status { color: #ffcf6b; background: rgba(255,209,102,.13); }
    .recurring-bill.atrasado .recurring-status { color: #ff91a8; background: rgba(239,71,111,.14); }

    @media(max-width: 900px) {
        .summary-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .insights-row { grid-template-columns: 1fr; }
        .alerts-list { grid-template-columns: 1fr; }
        .alerts-meta { align-items:flex-end; flex-direction:column; gap:4px; }
        .recurring-bill { grid-template-columns: 1.5fr .7fr; }
        .recurring-bill small { display: none; }
    }

    @media(max-width: 600px) {
        gap: 16px;
        padding-top: 20px;
        .summary-cards { grid-template-columns: 1fr; }
        .alerts, .insights-row, .investment-pie-section { padding: 14px; }
        .recurring-bills { padding: 14px; }
        .recurring-bills-heading { align-items: flex-start; flex-direction: column; gap: 6px; }
        .recurring-bill { grid-template-columns: 1fr; gap: 7px; }
        .recurring-bill b, .recurring-status { justify-self: start; }
    }
`;
