import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  min-width: 0;

  .page-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 18px;
  }
  .page-heading > div { min-width: 0; }
  .page-heading > div > span,
  .prompt-modal header span {
    color: #6fa8ff;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .12em;
  }
  .page-heading h1 {
    max-width: 850px;
    margin: 6px 0;
    color: ${p => p.theme.colors.white};
    font-size: clamp(25px, 3vw, 38px);
    line-height: 1.08;
    letter-spacing: -.035em;
  }
  .page-heading p {
    max-width: 800px;
    margin: 0;
    color: ${p => p.theme.colors.gray};
    line-height: 1.5;
  }
  .refresh {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    flex: 0 0 auto;
    min-height: 40px;
    padding: 10px 13px;
    border: 1px solid ${p => p.theme.colors.tertiary};
    border-radius: 10px;
    color: ${p => p.theme.colors.white};
    background: ${p => p.theme.colors.secondary};
    cursor: pointer;
  }
  .refresh:disabled { opacity: .6; }
  .refresh svg { flex: 0 0 auto; font-size: 18px; }

  .agents {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(185px, 100%), 1fr));
    gap: 8px;
    margin-bottom: 14px;
  }
  .agents button {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    min-width: 0;
    min-height: 88px;
    padding: 12px;
    border: 1px solid ${p => p.theme.colors.tertiary};
    border-radius: 12px;
    color: ${p => p.theme.colors.white};
    background: ${p => p.theme.colors.secondary};
    text-align: left;
    cursor: pointer;
    transition: transform .18s ease, border-color .18s ease;
  }
  .agents button:hover { transform: translateY(-1px); border-color: #4d6184; }
  .agents button.selected {
    border-color: #6674ff;
    background: linear-gradient(135deg, rgba(57,120,245,.2), rgba(109,93,252,.2));
    box-shadow: 0 0 0 1px rgba(102,116,255,.25);
  }
  .agents button > svg { flex: 0 0 auto; color: #79aaff; font-size: 20px; }
  .agents button > span { display: grid; gap: 4px; min-width: 0; }
  .agents strong { font-size: 11px; line-height: 1.25; }
  .agents small {
    display: -webkit-box;
    overflow: hidden;
    color: ${p => p.theme.colors.gray};
    font-size: 9px;
    line-height: 1.3;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .agents em { color: #65d7ab; font-size: 8px; font-style: normal; font-weight: 700; }
  .agents em.warning { color: #ffd166; }
  .agents em.on-demand { color: #8dbaff; }

  .workspace {
    display: grid;
    grid-template-columns: minmax(240px, 280px) minmax(440px, 1fr);
    gap: 14px;
    align-items: stretch;
    min-width: 0;
  }
  .agent-profile {
    min-width: 0;
    padding: 18px;
    border: 1px solid ${p => p.theme.colors.tertiary};
    border-radius: 16px;
    color: ${p => p.theme.colors.white};
    background: ${p => p.theme.colors.secondary};
  }
  .identity { display: flex; gap: 11px; align-items: center; min-width: 0; }
  .identity i {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 12px;
    color: #8dbaff;
    background: rgba(66,111,224,.18);
    font-size: 23px;
  }
  .identity > div { min-width: 0; }
  .identity span { color: #6fa8ff; font-size: 9px; font-weight: 800; letter-spacing: .12em; }
  .identity h2 { margin: 3px 0 0; font-size: 17px; line-height: 1.2; overflow-wrap: anywhere; }
  .agent-profile > p { margin: 15px 0; color: ${p => p.theme.colors.gray}; font-size: 13px; line-height: 1.5; }
  .memory-note {
    display: flex;
    gap: 9px;
    margin: 0 0 16px;
    padding: 10px;
    border: 1px solid rgba(98,121,255,.25);
    border-radius: 10px;
    color: #b9c8ff;
    background: rgba(83,97,206,.1);
    font-size: 11px;
    line-height: 1.4;
  }
  .memory-note svg { flex: 0 0 auto; margin-top: 2px; }
  .profile-details { display: block; }
  .profile-details section { min-width: 0; }
  .agent-profile h3 { margin: 16px 0 8px; color: ${p => p.theme.colors.gray}; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chips span { padding: 5px 7px; border-radius: 7px; color: #bcd2ff; background: rgba(56,104,196,.18); font-size: 10px; }
  .agent-profile ul { display: grid; gap: 5px; margin: 0; padding-left: 17px; color: ${p => p.theme.colors.gray}; font-size: 11px; }
  .details-toggle { display: none; }
  .prompt-button {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 7px;
    margin-top: 18px;
    padding: 9px;
    border: 1px solid #536ca1;
    border-radius: 9px;
    color: #c9d8ff;
    background: transparent;
    cursor: pointer;
    font: inherit;
    font-size: 11px;
    font-weight: 700;
  }
  .run-info {
    display: flex;
    gap: 9px;
    margin-top: 16px;
    padding-top: 15px;
    border-top: 1px solid ${p => p.theme.colors.tertiary};
    color: #8dbaff;
  }
  .run-info > svg { flex: 0 0 auto; margin-top: 1px; }
  .run-info strong { display: block; color: ${p => p.theme.colors.white}; font-size: 11px; }
  .run-info small { display: block; margin-top: 5px; color: ${p => p.theme.colors.gray}; font-size: 9px; line-height: 1.5; }
  .agent-chat { min-width: 0; }
  .cadence-note { margin: 12px 2px 0; color: ${p => p.theme.colors.gray}; font-size: 10px; line-height: 1.45; }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(2,7,18,.72);
    backdrop-filter: blur(5px);
  }
  .prompt-modal {
    width: min(760px, 100%);
    max-height: min(780px, 90dvh);
    overflow: auto;
    padding: 22px;
    border: 1px solid #42547b;
    border-radius: 18px;
    color: ${p => p.theme.colors.white};
    background: ${p => p.theme.colors.secondary};
    box-shadow: 0 28px 90px rgba(0,0,0,.5);
  }
  .prompt-modal header { display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; }
  .prompt-modal h2 { margin: 4px 0 0; font-size: 22px; }
  .prompt-modal header button {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid ${p => p.theme.colors.tertiary};
    border-radius: 9px;
    color: ${p => p.theme.colors.white};
    background: transparent;
    cursor: pointer;
    font-size: 20px;
  }
  .prompt-modal > p { color: ${p => p.theme.colors.gray}; font-size: 12px; line-height: 1.5; }
  .prompt-modal pre {
    margin: 16px 0 0;
    padding: 18px;
    overflow: auto;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    border: 1px solid ${p => p.theme.colors.tertiary};
    border-radius: 12px;
    color: #dfe7fa;
    background: ${p => p.theme.colors.primary};
    font: 12px/1.65 Consolas, monospace;
  }

  /* The side menu still consumes 250px above 900px, so stack sooner. */
  @media (max-width: 1120px) {
    .workspace { grid-template-columns: minmax(0, 1fr); }
    .agent-profile { padding: 16px; }
    .profile-details { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 22px; align-items: start; }
    .profile-details .prompt-button { align-self: end; }
    .profile-details .run-info { margin-top: 18px; }
  }

  @media (max-width: 720px) {
    .page-heading { display: grid; gap: 12px; }
    .page-heading h1 { font-size: 27px; }
    .refresh { width: 100%; }
    .agents {
      display: flex;
      gap: 9px;
      margin-right: -20px;
      padding: 1px 20px 9px 0;
      overflow-x: auto;
      scroll-snap-type: x proximity;
      scrollbar-width: thin;
    }
    .agents button { flex: 0 0 min(78vw, 230px); min-height: 82px; scroll-snap-align: start; }
    .details-toggle {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 12px;
      padding: 9px 10px;
      border: 1px solid ${p => p.theme.colors.tertiary};
      border-radius: 9px;
      color: #bcd2ff;
      background: ${p => p.theme.colors.primary};
      cursor: pointer;
      font: inherit;
      font-size: 11px;
      font-weight: 700;
    }
    .profile-details { display: none; }
    .agent-profile.expanded .profile-details { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0; }
    .agent-profile.expanded .prompt-button { margin-top: 17px; }
    .agent-profile.expanded .run-info { margin-top: 16px; }
    .modal-backdrop { align-items: end; padding: 10px; }
    .prompt-modal { max-height: 88dvh; padding: 17px; border-radius: 16px; }
    .prompt-modal pre { padding: 13px; font-size: 11px; }
    .cadence-note { font-size: 9px; }
  }

  @media (max-width: 480px) {
    .page-heading h1 { font-size: 24px; }
    .page-heading p { font-size: 13px; }
    .agents { margin-right: -16px; padding-right: 16px; }
    .agent-profile { padding: 14px; border-radius: 14px; }
    .memory-note { margin-bottom: 12px; }
  }
`;
