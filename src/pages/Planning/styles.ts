import styled from 'styled-components';
export const Container = styled.div`
  box-sizing:border-box; width:100%; max-width:1200px; min-width:0; margin:0 auto; padding-bottom:48px; overflow:hidden;
  > header { padding:12px 0 28px; border-bottom:1px solid ${p=>p.theme.colors.tertiary}; }
  > header span,.chart-card span,.calendar-title span { color:#6fa8ff; font-size:11px; font-weight:800; letter-spacing:.12em; }
  h1 { color:${p=>p.theme.colors.white}; font-size:clamp(28px,4vw,42px); margin:7px 0 9px; letter-spacing:-.04em; }
  header p,.disclaimer { color:${p=>p.theme.colors.gray}; line-height:1.5; }
  .state { margin-top:24px; padding:25px; border-radius:14px; background:${p=>p.theme.colors.secondary}; color:${p=>p.theme.colors.gray}; }
  .summary { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:12px; margin:24px 0; }
  .summary article { box-sizing:border-box; display:flex; gap:10px; align-items:center; min-width:0; min-height:104px; padding:17px; border:1px solid ${p=>p.theme.colors.tertiary}; border-radius:13px; background:${p=>p.theme.colors.secondary}; }
  .summary article:not(.income):not(.expense):not(.investment):not(.investment-income) { align-items:flex-start; flex-direction:column; }
  .summary svg { flex:0 0 auto; width:25px; height:25px; color:#06d6a0; }.summary .expense svg{color:#ef476f}.summary .investment svg{color:#a78bfa}.summary .investment-income svg{color:#65d7ab}
  small { color:${p=>p.theme.colors.gray}; font-size:11px; text-transform:uppercase; letter-spacing:.04em; }
  strong,b { color:${p=>p.theme.colors.white}; }.summary strong{font-size:19px;overflow-wrap:anywhere}.summary article>div{min-width:0}
  .chart-card,.calendar { box-sizing:border-box; min-width:0; padding:22px; margin-bottom:18px; overflow:hidden; border:1px solid ${p=>p.theme.colors.tertiary}; border-radius:14px; background:${p=>p.theme.colors.secondary}; }
  h2 { color:${p=>p.theme.colors.white}; font-size:20px; margin-top:5px; }.chart{height:300px;margin:22px 0 10px}.chart-card p{color:${p=>p.theme.colors.gray};font-size:12px}
  .calendar-title{display:flex;gap:11px;align-items:center;margin-bottom:16px}.calendar-title>svg{color:#6fa8ff;width:24px;height:24px}
  .day{display:grid;grid-template-columns:75px 1fr;gap:14px;padding:13px 0;border-top:1px solid rgba(148,163,184,.14)}.day time{color:#8fc4ff;font-weight:700;font-size:12px;padding-top:12px}.day>div{display:grid;gap:7px}
  .day article{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:11px 13px;border-radius:9px;background:rgba(15,23,42,.38)}.day article div{display:grid;gap:4px}.day article strong{font-size:13px}.day article b{font-size:13px;color:#ff91a8}.day article b.positive{color:#65d7ab}.day article b.investment{color:#c4b5fd}.empty{color:${p=>p.theme.colors.gray};padding:18px 0}
  .disclaimer{font-size:11px;text-align:center}
  @media(max-width:1050px){.summary{grid-template-columns:repeat(3,minmax(0,1fr))}}
  @media(max-width:750px){.summary{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:600px){
    > header{padding-top:4px} h1{font-size:clamp(27px,9vw,36px)}
    .summary{grid-template-columns:1fr;gap:10px}.summary article{min-height:0;padding:15px}.summary article:not(.income):not(.expense):not(.investment):not(.investment-income){gap:5px}
    .summary strong{font-size:18px}.chart-card,.calendar{padding:15px}.chart{width:100%;height:235px;margin-inline:0}.day{grid-template-columns:1fr;gap:5px}.day time{padding-top:0}.day article{align-items:flex-start;flex-direction:column;gap:8px}
  }
`;
