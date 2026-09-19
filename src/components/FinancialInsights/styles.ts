import styled from 'styled-components';

export const Container = styled.section`
  padding: 22px 24px; border: 1px solid ${p => p.theme.colors.tertiary}; border-radius: 14px; background: ${p => p.theme.colors.secondary};
  .insight-heading { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:16px; }
  .insight-heading span { color:#6fa8ff; font-size:11px; font-weight:800; letter-spacing:.12em; }
  h2 { color:${p => p.theme.colors.white}; font-size:20px; margin-top:5px; }
  a,.details-toggle { color:#8fc4ff; font-size:12px; font-weight:700; text-decoration:none; }
  .details-toggle { padding:0; border:0; background:transparent; cursor:pointer; }
  .insight-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
  article { display:flex; gap:12px; padding:15px; border:1px solid rgba(148,163,184,.16); border-radius:11px; background:rgba(15,23,42,.35); }
  article > svg { flex:0 0 auto; width:22px; height:22px; color:#6fa8ff; }
  article.warning > svg { color:#ffd166; } article.positive > svg { color:#06d6a0; }
  h3 { color:${p => p.theme.colors.white}; font-size:14px; margin-bottom:6px; }
  p { color:${p => p.theme.colors.gray}; font-size:12px; line-height:1.5; margin-bottom:8px; }
  article.expanded { grid-column:1/-1; }
  .duplicate-list { display:grid; gap:7px; margin-top:13px; padding-top:12px; border-top:1px solid rgba(148,163,184,.16); }
  .duplicate { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:4px 12px; padding:10px; border-radius:8px; background:rgba(8,15,30,.35); }
  .duplicate strong,.duplicate b { color:${p => p.theme.colors.white}; font-size:12px; }
  .duplicate small,.duplicate em { color:${p => p.theme.colors.gray}; font-size:10px; font-style:normal; }
  .duplicate-link { width:fit-content; margin-top:4px; }
  .empty { grid-column:1/-1; margin:8px 0; }
  @media(max-width:700px) { padding:16px; .insight-list { grid-template-columns:1fr; } }
`;
