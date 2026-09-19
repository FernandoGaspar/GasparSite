import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  max-width: 1120px;
  min-width: 0;
  margin: 14px auto 60px;
  overflow-x: hidden;
  color: #dce8fa;

  *, *::before, *::after {
    box-sizing: border-box;
  }

  h1, h2, h3, p { margin: 0; }
  button, input, textarea { font: inherit; }
  button { cursor: pointer; }
  button:disabled { cursor: not-allowed; opacity: .56; }

  .panel {
    border: 1px solid #223b57;
    border-radius: 18px;
    background: #0d1b2e;
    box-shadow: 0 14px 38px rgba(2, 10, 24, .18);
  }

  .hero {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 28px;
    padding: 26px 0 22px;
  }
  .hero > div:first-child { min-width: 0; max-width: 700px; }
  .hero span,
  .account span,
  .organizer > div > span,
  .connect span,
  .composer header span {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #58e6b3;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .13em;
  }
  .hero h1 {
    margin: 8px 0 10px;
    color: #fff;
    font-size: clamp(30px, 4vw, 46px);
    line-height: 1.04;
    letter-spacing: -.05em;
  }
  .hero p { max-width: 660px; color: #96a8c1; font-size: 15px; line-height: 1.6; }
  .scope-nav { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; margin-bottom: 12px; padding: 5px; border-radius: 14px; background: #0b1829; }
  .scope-nav button { display:flex;align-items:center;justify-content:center;gap:7px;min-height:46px;border:1px solid transparent;border-radius:10px;color:#8095b0;background:transparent;font-size:12px;font-weight:850; }
  .scope-nav button.personal.active { border-color:#28705f;color:#effff9;background:#133c32; }
  .scope-nav button.work.active { border-color:#4c48a1;color:#f3f0ff;background:#282456; }
  .context-note { display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:13px 16px;border:1px solid #24425e;border-radius:12px;background:#0d1c30; }
  .context-note strong { flex:none;color:#eef5ff;font-size:12px; }
  .context-note span { color:#8da2bd;font-size:11px;line-height:1.45; }
  .context-note.personal { border-left:3px solid #50d6a7; }.context-note.work { border-left:3px solid #7464ff; }
  .hero-actions { display: flex; flex: none; gap: 10px; }
  .hero-actions button,
  .connect > button,
  .organizer > button,
  .composer footer button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 44px;
    padding: 0 18px;
    border: 1px solid #6d5cf0;
    border-radius: 11px;
    color: #fff;
    background: #715ef6;
    font-size: 13px;
    font-weight: 800;
  }
  .hero-actions .secondary,
  .mail-actions .secondary {
    border-color: #34506d;
    color: #d4e4f7;
    background: #12263e;
  }

  .banner {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    margin-bottom: 16px;
    padding: 14px 16px;
    border: 1px solid;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.45;
  }
  .banner > svg { flex: none; }
  .banner.error { border-color: #723246; color: #ff9eb0; background: #41182a; }
  .banner.success { border-color: #236a5a; color: #8be2c0; background: #12372f; }
  .banner button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-left: auto;
    padding: 6px 9px;
    border: 0;
    border-radius: 8px;
    color: inherit;
    background: rgba(255, 255, 255, .08);
    font-size: 12px;
    font-weight: 800;
  }

  .connect {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 20px;
    padding: 25px;
  }
  .google-mark {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 15px;
    color: #fff;
    background: linear-gradient(145deg, #4285f4, #34a853);
    font-size: 24px;
    font-weight: 900;
  }
  .connect h2, .account h2, .organizer h2, .composer h2 {
    margin: 6px 0;
    color: #f5f8ff;
    font-size: 21px;
    line-height: 1.2;
  }
  .connect p, .account p, .organizer p { color: #91a4bd; font-size: 13px; line-height: 1.55; }
  .connect small { display: block; margin-top: 8px; color: #ffc472; line-height: 1.45; }

  .account {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 22px 24px;
  }
  .account > div { min-width: 0; }
  .account h2, .account p { overflow-wrap: anywhere; }
  .danger-link {
    flex: none;
    padding: 9px 11px;
    border: 0;
    border-radius: 8px;
    color: #ff7893;
    background: transparent;
    font-weight: 800;
  }
  .manage-link { flex:none;padding:9px 11px;border:1px solid #34506d;border-radius:8px;color:#bfd4ec;background:#13263d;font-size:11px;font-weight:800; }

  .metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin: 16px 0;
  }
  .metrics article {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 12px;
    padding: 16px;
    border: 1px solid #213a56;
    border-radius: 15px;
    background: #0d1b2e;
  }
  .metrics article > svg { flex: none; color: #84aef0; font-size: 20px; }
  .metrics article > span { min-width: 0; color: #8da0ba; font-size: 11px; }
  .metrics strong { display: block; margin-top: 2px; color: #fff; font-size: 23px; }

  .organizer {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 18px;
    padding: 22px 24px;
  }
  .organizer > div:first-child { min-width: 0; }
  .preferences {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid #20364f;
  }
  .preferences label {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
    color: #a9b9ce;
    font-size: 12px;
    line-height: 1.4;
  }
  .preferences input { flex: none; margin-top: 2px; accent-color: #6655e8; }

  .filters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin: 16px 0;
  }
  .filters button {
    flex: none;
    min-height: 38px;
    padding: 0 13px;
    border: 1px solid #2b4561;
    border-radius: 10px;
    color: #a9bad0;
    background: #102238;
    font-size: 12px;
    font-weight: 750;
  }
  .filters button.active { border-color: #725fff; color: #fff; background: #31265f; }
  .filters input {
    flex: 1;
    min-width: 260px;
    height: 40px;
    padding: 0 13px;
    border: 1px solid #2b4561;
    border-radius: 10px;
    outline: 0;
    color: #e0eaff;
    background: #0c192a;
    font-size: 12px;
  }
  .filters input:focus { border-color: #6655e8; }

  .history { margin-bottom: 16px; padding: 0 18px; }
  .history > summary {
    padding: 15px 0;
    color: #cbd9eb;
    cursor: pointer;
    font-size: 12px;
    font-weight: 800;
  }
  .history > div { border-top: 1px solid #20364f; }
  .history article {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 12px;
    padding: 11px 0;
    color: #a6b7cb;
    font-size: 11px;
  }
  .history article + article { border-top: 1px solid #182d44; }
  .history article span { min-width: 0; overflow-wrap: anywhere; text-transform: capitalize; }
  .history time { color: #7087a4; }
  .history b { color: #6fc8a8; }
  .history button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    border: 1px solid #37526f;
    border-radius: 7px;
    color: #bcd2eb;
    background: #13263c;
    font-size: 10px;
  }

  .mail-list { display: grid; gap: 12px; }
  .mail {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: start;
    gap: 15px;
    min-width: 0;
    padding: 18px;
  }
  .mail.unread { border-color: #356a69; box-shadow: inset 3px 0 #45d5a5; }
  .mail-icon {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    color: #9dc1f0;
    background: #172e49;
  }
  .mail-copy { min-width: 0; }
  .mail-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .mail-top span {
    min-width: 0;
    overflow: hidden;
    color: #eff5ff;
    font-size: 13px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mail-top time { flex: none; color: #7188a4; font-size: 10px; }
  .mail h3 { margin: 5px 0; overflow-wrap: anywhere; color: #dfeafb; font-size: 14px; }
  .mail p { color: #859ab5; font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .tags b, .tags span {
    padding: 4px 7px;
    border-radius: 999px;
    color: #91afcf;
    background: #162b43;
    font-size: 9px;
  }
  .tags b { color: #73dcb5; background: #12382f; }
  .tags b.suspect { color: #ff9cb0; background: #3d1d2a; }
  .mail-copy > details { margin-top: 10px; color: #8da4bf; font-size: 11px; }
  .mail-copy > details summary { cursor: pointer; }
  .mail-copy > details p { margin-top: 5px; }
  .mail-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    width: 192px;
  }
  .mail-actions button, .mail-actions a {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-width: 0;
    min-height: 34px;
    padding: 0 8px;
    border: 1px solid #31506f;
    border-radius: 8px;
    color: #c9ddf5;
    background: #142b44;
    text-decoration: none;
    font-size: 10px;
    font-weight: 750;
  }
  .mail-actions button:first-child { border-color: #29785f; color: #8ae0be; background: #133b31; }

  .empty {
    padding: 44px 20px;
    color: #8298b5;
    text-align: center;
  }
  .empty svg { font-size: 32px; }
  .empty h2 { margin: 9px 0 4px; color: #cfdbec; font-size: 17px; }

  .modal-backdrop {
    position: fixed;
    z-index: 50;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(2, 8, 19, .78);
    backdrop-filter: blur(5px);
  }
  .composer {
    width: min(620px, 100%);
    max-height: calc(100dvh - 40px);
    overflow-y: auto;
    padding: 22px;
  }
  .composer header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 16px; }
  .icon-button {
    display: grid;
    flex: none;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1px solid #304a66;
    border-radius: 9px;
    color: #bed1e7;
    background: #13253a;
  }
  .composer > label { display: grid; gap: 6px; margin-top: 11px; color: #9fb0c5; font-size: 11px; font-weight: 800; }
  .composer input, .composer textarea {
    width: 100%;
    min-width: 0;
    padding: 11px 12px;
    border: 1px solid #2d4762;
    border-radius: 9px;
    outline: 0;
    color: #eef5ff;
    background: #091728;
    resize: vertical;
  }
  .composer input:focus, .composer textarea:focus { border-color: #6a59ec; }
  .safety { margin: 13px 0; color: #7f95b1; font-size: 11px; line-height: 1.5; }
  .composer footer { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
  .composer footer span { margin-right: auto; color: #64d7aa; font-size: 12px; font-weight: 800; }

  .loading {
    padding: 40px;
    color: #849ab7;
    text-align: center;
  }

  @media (max-width: 820px) {
    .hero { align-items: flex-start; flex-direction: column; gap: 16px; }
    .hero-actions { width: 100%; }
    .hero-actions button { flex: 1; }
    .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .preferences { grid-template-columns: 1fr; }
    .filters { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .filters button { width: 100%; padding-inline: 8px; }
    .filters input { grid-column: 1 / -1; width: 100%; min-width: 0; }
    .mail { grid-template-columns: auto minmax(0, 1fr); }
    .mail-actions { grid-column: 1 / -1; width: 100%; grid-template-columns: repeat(5, minmax(0, 1fr)); }
  }

  @media (max-width: 560px) {
    margin-top: 0;
    padding-bottom: 24px;

    .hero { padding: 18px 0 16px; }
    .hero h1 { font-size: 31px; line-height: 1.08; }
    .hero p { font-size: 13px; line-height: 1.55; }
    .context-note { align-items:flex-start;flex-direction:column;gap:4px;padding:12px; }
    .hero-actions button { min-width: 0; padding-inline: 10px; }
    .banner { align-items: flex-start; padding: 12px; }
    .banner button { flex: none; }

    .connect { grid-template-columns: auto minmax(0, 1fr); gap: 14px; padding: 18px; }
    .connect > button { grid-column: 1 / -1; width: 100%; }
    .google-mark { width: 44px; height: 44px; }
    .connect h2, .account h2, .organizer h2 { font-size: 18px; }

    .account { align-items: flex-start; flex-direction: column; padding: 18px; }
    .danger-link { width: 100%; border: 1px solid #673649; background: #2a1823; }

    .metrics { gap: 8px; margin: 12px 0; }
    .metrics article { gap: 9px; padding: 13px 11px; }
    .metrics article > svg { font-size: 18px; }
    .metrics strong { font-size: 20px; }

    .organizer { grid-template-columns: 1fr; padding: 18px; }
    .organizer > button { width: 100%; }
    .preferences { grid-column: auto; }

    .filters { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
    .filters input { grid-column: 1 / -1; }

    .history article { grid-template-columns: minmax(0, 1fr) auto; gap: 7px; }
    .history time { grid-column: 1; grid-row: 2; }
    .history article button, .history article b { grid-column: 2; grid-row: 1 / span 2; }

    .mail { grid-template-columns: 34px minmax(0, 1fr); gap: 11px; padding: 14px 12px; }
    .mail-icon { width: 34px; height: 34px; border-radius: 10px; }
    .mail-top { align-items: flex-start; flex-direction: column; gap: 3px; }
    .mail-top span { max-width: 100%; }
    .mail h3 { font-size: 13px; }
    .mail-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .mail-actions a { grid-column: 1 / -1; }

    .modal-backdrop { align-items: end; padding: 0; }
    .composer {
      width: 100%;
      max-height: 92dvh;
      padding: 18px 16px calc(18px + env(safe-area-inset-bottom));
      border-radius: 20px 20px 0 0;
    }
    .composer textarea { min-height: 150px; }
    .composer footer { align-items: stretch; flex-direction: column; }
    .composer footer span { margin-right: 0; }
    .composer footer button { width: 100%; }
  }
`;
