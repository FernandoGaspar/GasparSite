import styled from 'styled-components';

export const Card = styled.section`
  display:grid;
  gap:12px;
  width:100%;
  margin-top:12px;
  padding:14px;
  border:1px solid #36506f;
  border-radius:14px;
  color:#eaf2ff;
  background:#0d1f33;
  white-space:normal;

  * { box-sizing:border-box; }
  h3,h4,p { margin:0; }
  button,input,select,textarea { font:inherit; }
  button { cursor:pointer; }
  button:disabled { cursor:default; opacity:.52; }

  .schedule-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
  .schedule-heading>div { min-width:0; }
  .schedule-kicker { display:flex; align-items:center; gap:5px; color:#68dfb0; font-size:9px; font-weight:900; letter-spacing:.09em; text-transform:uppercase; }
  .schedule-heading h3 { margin-top:4px; font-size:14px; line-height:1.35; }
  .schedule-state { flex:none; padding:5px 7px; border:1px solid #365779; border-radius:999px; color:#a9c8f0; background:#142b45; font-size:9px; font-weight:800; text-transform:uppercase; }
  .schedule-state.success { color:#83e0bc; border-color:#2e765e; background:#12372d; }
  .schedule-state.warning { color:#f4ce7a; border-color:#725a2c; background:#362b14; }
  .schedule-state.danger { color:#ff9baa; border-color:#783a47; background:#371a22; }

  .schedule-error,.schedule-note { padding:9px 10px; border-radius:9px; font-size:10px; line-height:1.45; }
  .schedule-error { color:#ffadba; border:1px solid #6f3341; background:#301820; }
  .schedule-note { color:#a9bdd4; border:1px solid #29435f; background:#10253b; }
  .schedule-note strong { color:#dbe9fb; }
  .delivery-outcome-alert { display:grid; gap:7px; padding:11px; border:1px solid #8a6429; border-radius:10px; color:#e8c780; background:#372a13; font-size:10px; line-height:1.5; }
  .delivery-outcome-alert strong { color:#ffe0a0; font-size:11px; }
  .delivery-outcome-alert p { color:#d5bd8c; }
  .delivery-outcome-alert a { display:inline-flex; align-items:center; gap:5px; justify-self:start; color:#bcd5ff; font-weight:800; text-decoration:none; }
  .delivery-outcome-alert label { display:flex; align-items:flex-start; gap:7px; padding-top:6px; border-top:1px solid rgba(255,224,160,.2); color:#f0dbad; }
  .delivery-outcome-alert input { margin-top:3px; accent-color:#e7b955; }

  .schedule-section { display:grid; gap:8px; padding-top:11px; border-top:1px solid #243c57; }
  .schedule-section>header { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:0; border:0; }
  .schedule-section h4 { color:#c9dcf3; font-size:11px; }
  .schedule-copy { color:#9cb0c7; font-size:10px; line-height:1.5; }
  .schedule-request { color:#e8f0fb; font-size:11px; line-height:1.5; }

  .candidate-list { display:grid; gap:7px; }
  .candidate { display:grid; grid-template-columns:auto minmax(0,1fr); gap:9px; padding:9px; border:1px solid #2a4562; border-radius:10px; color:#dce9f8; background:#10243a; }
  .candidate.selected { border-color:#48b88c; background:#12352d; }
  .candidate input { margin-top:3px; accent-color:#56dfa8; }
  .candidate strong,.candidate small { display:block; }
  .candidate strong { font-size:11px; }
  .candidate small { margin-top:3px; color:#8fa6be; font-size:9px; line-height:1.4; }

  .draft-preview { width:100%; min-height:92px; resize:vertical; padding:10px; border:1px solid #31506f; border-radius:10px; outline:0; color:#eef5ff; background:#0a192a; line-height:1.5; }
  .draft-preview:focus,.field input:focus,.field select:focus,.field textarea:focus { border-color:#5c91df; box-shadow:0 0 0 2px rgba(92,145,223,.16); }

  .constraint-summary { display:flex; flex-wrap:wrap; gap:6px; }
  .constraint-summary span { padding:5px 7px; border-radius:7px; color:#aac0d8; background:#142b43; font-size:9px; }
  .constraint-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
  .field { display:grid; gap:4px; min-width:0; color:#91a8c1; font-size:9px; font-weight:700; }
  .field.wide { grid-column:1/-1; }
  .field input,.field select,.field textarea { width:100%; min-width:0; padding:8px 9px; border:1px solid #2c4865; border-radius:8px; outline:0; color:#ecf4ff; background:#0c1c2e; }
  .field textarea { min-height:62px; resize:vertical; }
  .weekday-list { display:flex; flex-wrap:wrap; gap:5px; }
  .weekday-list label { display:flex; align-items:center; gap:4px; padding:5px 6px; border:1px solid #2c4865; border-radius:7px; color:#a9bfd6; background:#0c1c2e; font-size:9px; }
  .weekday-list input { accent-color:#55dba6; }

  .mode-options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:7px; }
  .mode-option { display:flex; align-items:flex-start; gap:7px; padding:8px; border:1px solid #2b4764; border-radius:9px; color:#bdcfe3; background:#102338; font-size:9px; line-height:1.35; }
  .mode-option input { margin-top:2px; accent-color:#55dba6; }
  .mode-option strong { display:block; color:#eef5ff; font-size:10px; }

  .appointment { display:grid; gap:5px; padding:10px; border:1px solid #2c7059; border-radius:10px; background:#123329; }
  .appointment strong { color:#80e2ba; font-size:11px; }
  .appointment span { color:#c3ded3; font-size:10px; line-height:1.45; }

  .timeline { display:grid; gap:7px; max-height:180px; overflow:auto; }
  .timeline article { display:grid; grid-template-columns:7px minmax(0,1fr); gap:7px; color:#aabdd2; font-size:9px; line-height:1.45; }
  .timeline i { width:7px; height:7px; margin-top:4px; border-radius:50%; background:#4e91dd; }
  .timeline time { display:block; margin-top:2px; color:#7189a4; font-size:8px; }

  .intervention { display:grid; gap:7px; }
  .intervention textarea { width:100%; min-height:72px; resize:vertical; padding:9px; border:1px solid #34516e; border-radius:9px; outline:0; color:#edf4ff; background:#0a1929; }
  .schedule-actions { display:flex; flex-wrap:wrap; gap:7px; }
  .schedule-actions button,.schedule-actions a,.small-action { display:inline-flex; align-items:center; justify-content:center; gap:5px; min-height:32px; padding:7px 9px; border:1px solid #386084; border-radius:8px; color:#c7daf0; background:#132b43; font-size:9px; font-weight:800; text-decoration:none; }
  .schedule-actions .primary { color:#08251b; border-color:#55d7a4; background:#59e0aa; }
  .schedule-actions .danger { color:#ffacb8; border-color:#6e3541; background:#311923; }
  .small-action { min-height:26px; padding:4px 7px; }
  .expiry { color:#778da6; font-size:8px; }

  @media(max-width:520px){
    padding:11px;
    .constraint-grid,.mode-options { grid-template-columns:1fr; }
    .field.wide { grid-column:auto; }
    .schedule-heading { display:grid; }
    .schedule-state { justify-self:start; }
    .schedule-actions { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); }
    .schedule-actions a { text-align:center; }
  }
`;
