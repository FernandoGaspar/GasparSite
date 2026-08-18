import styled from 'styled-components';
export const Container = styled.div`
  header { display:flex; align-items:center; justify-content:space-between; gap:20px; margin-bottom:22px; } header span,.detail-head span { display:flex; gap:6px; align-items:center; color:#68a9ff; font-size:10px; font-weight:800; letter-spacing:.12em; } h1 { margin:6px 0; } h2 { margin:0; font-size:17px; } p { color:${({theme})=>theme.colors.gray}; font-size:13px; } button { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:38px; padding:9px 13px; border:1px solid ${({theme})=>theme.colors.tertiary}; border-radius:9px; color:${({theme})=>theme.colors.white}; background:${({theme})=>theme.colors.secondary}; font:inherit; cursor:pointer; } button:hover { filter:brightness(1.12); } .header-actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; } .notice { margin-bottom:14px; padding:11px 14px; border-radius:9px; color:#ffe1a7; background:#44341d; } .summary { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:18px; } .summary article,.job-list,.details { border:1px solid ${({theme})=>theme.colors.tertiary}; border-radius:14px; background:${({theme})=>theme.colors.secondary}; } .summary article { padding:16px; } small { display:block; color:${({theme})=>theme.colors.gray}; font-size:11px; } .summary strong { display:block; margin-top:6px; font-size:26px; } main { display:grid; grid-template-columns:minmax(280px,.9fr) minmax(0,1.6fr); gap:16px; } .section-title { display:flex; justify-content:space-between; padding:16px; border-bottom:1px solid ${({theme})=>theme.colors.tertiary}; } .job { display:flex; width:100%; align-items:center; gap:10px; padding:14px 16px; border:0; border-radius:0; border-bottom:1px solid ${({theme})=>theme.colors.tertiary}; background:transparent; text-align:left; } .job.selected { background:${({theme})=>theme.colors.tertiary}; } .job div { flex:1; min-width:0; } .job strong { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; } .job em { color:${({theme})=>theme.colors.gray}; font-size:10px; font-style:normal; } .dot { width:9px; height:9px; border-radius:50%; background:#7b8492; } .dot.Sucesso { background:#50d49a; } .dot.Falhou { background:#f36479; } .dot.Em-andamento { background:#e9c054; } .details { min-height:480px; padding:22px; } .detail-head { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; } .detail-head span { display:block; } .run { color:#082c22; background:#5be0ad; border:0; white-space:nowrap; } .meta { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin:20px 0; } .meta div { padding:12px; border-radius:10px; background:${({theme})=>theme.colors.primary}; } .meta b { display:block; margin-top:5px; font-size:13px; } h3 { display:flex; align-items:center; gap:7px; font-size:14px; } .history { max-height:300px; overflow:auto; } .history article { margin-bottom:8px; padding:12px; border-left:3px solid #4f8cff; background:${({theme})=>theme.colors.primary}; } .history article b { margin-right:8px; font-size:12px; } .history article span { color:${({theme})=>theme.colors.gray}; font-size:11px; } .history article p { margin:6px 0 0; font-size:11px; } .empty { display:grid; min-height:430px; place-content:center; text-align:center; } .empty svg { margin:auto; color:#68a9ff; font-size:32px; } .editor { display:grid; gap:14px; } .editor label { display:grid; gap:6px; color:${({theme})=>theme.colors.gray}; font-size:12px; font-weight:700; } .editor input,.editor select,.editor textarea { width:100%; box-sizing:border-box; padding:10px 11px; border:1px solid ${({theme})=>theme.colors.tertiary}; border-radius:8px; color:${({theme})=>theme.colors.white}; background:${({theme})=>theme.colors.primary}; font:inherit; } .editor textarea { min-height:240px; resize:vertical; font-family:Consolas,monospace; font-size:13px; line-height:1.5; } .schedule { display:grid; grid-template-columns:1fr 1fr; gap:12px; } .editor-actions { display:flex; justify-content:flex-end; gap:8px; padding-top:4px; } @media(max-width:850px) { main { grid-template-columns:1fr; } } @media(max-width:520px) { header,.detail-head { align-items:flex-start; flex-direction:column; } .summary,.meta,.schedule { grid-template-columns:1fr; } .header-actions { width:100%; } .header-actions button { flex:1; } }
  .code-editor { position:relative; min-height:280px; overflow:hidden; border:1px solid ${({theme})=>theme.colors.tertiary}; border-radius:8px; background:#111827; } .code-editor pre,.code-editor textarea { position:absolute; inset:0; width:100%; height:100%; min-height:280px; margin:0; padding:14px 16px; box-sizing:border-box; overflow:auto; border:0; border-radius:0; font:13px/1.55 Consolas,monospace; white-space:pre-wrap; word-break:break-word; } .code-editor pre { pointer-events:none; color:#d9e1f2; } .code-editor textarea { color:transparent; caret-color:#fff; background:transparent; resize:vertical; } .py-keyword { color:#c792ea; font-weight:700; } .py-string { color:#c3e88d; } .py-number { color:#f78c6c; } .py-comment { color:#6b7b93; font-style:italic; }
  .code-editor { height:360px; min-height:360px; } .code-editor pre,.code-editor textarea { height:360px; min-height:360px; } .code-editor textarea { position:relative; z-index:1; display:block; }
  .code-editor pre { display:block; } .code-editor textarea { z-index:3; color:transparent; background:transparent; }
  .python-editor { min-height:360px; overflow:auto; border:1px solid ${({theme})=>theme.colors.tertiary}; border-radius:8px; color:#d9e1f2; background:#111827; } .python-editor textarea { outline:0; color:#d9e1f2!important; } .token.keyword { color:#c792ea; font-weight:700; } .token.string { color:#c3e88d; } .token.number { color:#f78c6c; } .token.comment { color:#6b7b93; font-style:italic; }
  .history article p { white-space:pre-wrap; overflow-wrap:anywhere; font-family:Consolas,monospace; font-size:11px; line-height:1.45; }
  @keyframes job-spin { to { transform:rotate(360deg); } }
  .job-spinner { flex:0 0 auto; width:13px; height:13px; box-sizing:border-box; border:2px solid rgba(91,224,173,.28); border-top-color:#5be0ad; border-radius:50%; animation:job-spin .75s linear infinite; }
  .job.running { background:rgba(91,224,173,.07); }
  .job.running em { color:#5be0ad; font-weight:700; }

  @media(max-width:850px) {
    main { grid-template-columns:1fr; }
    .job-list { max-height:360px; overflow:auto; }
    .details { min-height:360px; }
  }
  @media(max-width:600px) {
    & { width:100%; min-width:0; overflow-x:hidden; }
    header { align-items:stretch; flex-direction:column; margin-bottom:14px; }
    header h1 { font-size:24px; }
    header p { margin-bottom:0; }
    .header-actions { display:grid; grid-template-columns:1fr 1fr; width:100%; }
    header > .header-actions .run { grid-column:1/-1; }
    .header-actions button { width:100%; min-width:0; padding:9px 8px; }
    main { gap:12px; }
    .job-list { max-height:320px; border-radius:11px; }
    .job { min-width:0; padding:13px 12px; }
    .job strong,.job small { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .job em { flex:0 0 auto; max-width:82px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .details { min-width:0; min-height:300px; padding:15px; border-radius:11px; }
    .detail-head { align-items:stretch; flex-direction:column; }
    .detail-head .header-actions { display:grid; grid-template-columns:1fr 1fr; }
    .detail-head .header-actions .run { grid-column:1/-1; }
    .meta { grid-template-columns:1fr; }
    .schedule { grid-template-columns:1fr; }
    .editor,.editor label,.python-editor { min-width:0; max-width:100%; }
    .python-editor { min-height:280px!important; }
    .editor-actions { display:grid; grid-template-columns:1fr 1fr; }
    .history { max-height:380px; }
    .history article { overflow:hidden; }
    .history article span { display:block; margin-top:4px; overflow-wrap:anywhere; }
  }
  @media(max-width:380px) {
    .job em { display:none; }
    .header-actions { grid-template-columns:1fr; }
    header > .header-actions .run,.detail-head .header-actions .run { grid-column:auto; }
    .detail-head .header-actions { grid-template-columns:1fr; }
  }
`;
