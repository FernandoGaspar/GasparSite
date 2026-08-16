import styled from "styled-components";

export const Container = styled.div`
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;

  .floor-backdrop {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: rgba(2, 8, 18, 0.84);
    backdrop-filter: blur(7px);
  }

  .floor-modal {
    position: relative;
    display: flex;
    width: min(1500px, 96vw);
    max-height: 94vh;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid ${({ theme }) => theme.colors.tertiary};
    border-radius: 20px;
    background: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);
  }

  .floor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 17px 20px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.tertiary};
    background: ${({ theme }) => theme.colors.secondary};
  }
  .floor-header > div,
  .floor-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .floor-header > div > span {
    display: grid;
    width: 42px;
    height: 42px;
    place-items: center;
    border-radius: 12px;
    color: ${({ theme }) => theme.colors.success};
    background: ${({ theme }) => theme.colors.tertiary};
  }
  .floor-header small { color: ${({ theme }) => theme.colors.gray}; font-size: 9px; font-weight: 800; letter-spacing: .13em; }
  .floor-header h2 { margin: 2px 0; color: ${({ theme }) => theme.colors.white}; font-size: 18px; }
  .floor-header p { color: ${({ theme }) => theme.colors.gray}; font-size: 11px; }
  .floor-actions button {
    display: flex;
    min-height: 36px;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 12px;
    border: 1px solid ${({ theme }) => theme.colors.success};
    border-radius: 9px;
    color: ${({ theme }) => theme.colors.black};
    background: ${({ theme }) => theme.colors.success};
    font: inherit;
    font-size: 11px;
    font-weight: 800;
  }
  .floor-actions button.secondary { color: ${({ theme }) => theme.colors.white}; background: ${({ theme }) => theme.colors.tertiary}; border-color: ${({ theme }) => theme.colors.gray}; }
  .floor-actions button.icon-button { width: 36px; padding: 0; color: ${({ theme }) => theme.colors.white}; background: transparent; border-color: ${({ theme }) => theme.colors.tertiary}; }
  .floor-actions button:disabled { opacity: .5; }

  .floor-message { padding: 9px 18px; color: #ffd6a8; background: #3b291c; font-size: 11px; text-align: center; }
  .floor-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 16px; border-bottom: 1px solid ${({ theme }) => theme.colors.tertiary}; background: ${({ theme }) => theme.colors.secondary}; }
  .floor-toolbar > div { display: flex; align-items: center; gap: 6px; }
  .floor-toolbar button { display: inline-flex; min-width: 34px; height: 32px; align-items: center; justify-content: center; gap: 5px; padding: 0 9px; border: 1px solid ${({ theme }) => theme.colors.tertiary}; border-radius: 8px; color: ${({ theme }) => theme.colors.white}; background: ${({ theme }) => theme.colors.primary}; font: inherit; font-size: 10px; cursor: pointer; }
  .floor-toolbar strong { min-width: 42px; color: ${({ theme }) => theme.colors.gray}; font-size: 10px; text-align: center; }
  .floor-content { display: grid; min-height: 0; overflow: auto; }
  .floor-content.is-editing { grid-template-columns: minmax(0, 1fr) 330px; }
  .floor-canvas-wrap { min-width: 0; padding: 16px; overflow: hidden; }
  .floor-scroll { position: relative; width: 100%; max-height: 67vh; overflow: scroll; overscroll-behavior: contain; touch-action: pan-x pan-y pinch-zoom; -webkit-overflow-scrolling: touch; }
  .floor-canvas {
    position: relative;
    width: 100%;
    min-width: 100%;
    overflow: hidden;
    border: 1px solid ${({ theme }) => theme.colors.tertiary};
    border-radius: 14px;
    background: #fff;
  }
  .floor-canvas.landscape { aspect-ratio: 1000 / 593; }
  .floor-canvas.portrait { aspect-ratio: 593 / 1000; }
  .floor-canvas img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: fill; user-select: none; pointer-events: none; }
  .floor-canvas.portrait img { top: 50%; left: 50%; width: 168.64%; height: 59.3%; transform: translate(-50%, -50%) rotate(90deg); }
  .floor-canvas svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .floor-canvas svg.navigating { touch-action: pan-x pan-y pinch-zoom; }
  .floor-canvas svg.editing { touch-action: none; }
  .touch-help { margin: 8px 0 0; color: ${({ theme }) => theme.colors.gray}; font-size: 10px; text-align: center; }
  .floor-room { cursor: pointer; }
  .floor-room polygon { fill: rgba(57, 107, 154, .08); stroke: rgba(50, 101, 148, .7); stroke-width: 2; vector-effect: non-scaling-stroke; transition: .18s ease; }
  .floor-room:hover polygon,
  .floor-room.selected polygon { fill: rgba(46, 139, 230, .23); stroke: #1686e8; stroke-width: 3; }
  .floor-room.state-on > polygon { fill: rgba(255, 244, 176, .05); stroke: #d7ab24; }
  .floor-room.state-partial > polygon { fill: rgba(255, 225, 135, .035); stroke: #c88c24; }
  .floor-room.state-off polygon { fill: rgba(18, 57, 91, .1); }
  .floor-room.state-unavailable polygon { fill: rgba(90, 98, 110, .25); stroke: #737b85; }
  .floor-room.busy { opacity: .55; pointer-events: none; }
  .room-light-pools { pointer-events: none; mix-blend-mode: multiply; }
  .state-on .room-light-pools { opacity: .94; filter: drop-shadow(0 0 9px rgba(255, 209, 66, .72)); }
  .state-partial .room-light-pools { opacity: .52; filter: drop-shadow(0 0 5px rgba(255, 193, 55, .42)); }
  .room-label { pointer-events: none; }
  .room-label rect { fill: rgba(5, 20, 35, .88); stroke: rgba(126, 183, 228, .52); stroke-width: 1; vector-effect: non-scaling-stroke; }
  .room-label text { fill: #f2f7ff; font-size: 11px; font-weight: 800; }
  .room-label .room-status { fill: #9eb6ce; font-size: 8px; font-weight: 600; }
  .state-on .room-status { fill: #ffe37a; }
  .edit-point { fill: #24a1ff; stroke: white; stroke-width: 3; vector-effect: non-scaling-stroke; cursor: move; }
  .floor-loading { display: flex; min-height: 420px; align-items: center; justify-content: center; gap: 8px; color: ${({ theme }) => theme.colors.gray}; }
  .floor-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; padding: 12px 4px 0; color: ${({ theme }) => theme.colors.gray}; font-size: 10px; }
  .floor-legend span { display: flex; align-items: center; gap: 5px; }
  .floor-legend i { width: 10px; height: 10px; border-radius: 3px; border: 1px solid #365674; background: #17324b; }
  .floor-legend i.on { border-color: #d9a900; background: #ffd33d; }
  .floor-legend i.partial { border-color: #d78618; background: #eea63a; }
  .floor-legend i.empty { border-style: dashed; background: transparent; }

  .floor-editor { min-height: 0; padding: 16px; overflow: auto; border-left: 1px solid ${({ theme }) => theme.colors.tertiary}; background: ${({ theme }) => theme.colors.secondary}; }
  .editor-title,
  .entity-title { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .editor-title { margin-bottom: 16px; color: ${({ theme }) => theme.colors.success}; }
  .editor-title small,
  .editor-title strong { display: block; }
  .editor-title small { color: ${({ theme }) => theme.colors.gray}; font-size: 8px; letter-spacing: .12em; }
  .editor-title strong { margin-top: 3px; color: ${({ theme }) => theme.colors.white}; font-size: 15px; }
  .floor-editor > label { display: block; margin-bottom: 12px; color: ${({ theme }) => theme.colors.gray}; font-size: 10px; font-weight: 700; }
  .floor-editor > label input,
  .floor-editor > label select { width: 100%; height: 38px; box-sizing: border-box; margin-top: 6px; padding: 0 10px; border: 1px solid ${({ theme }) => theme.colors.tertiary}; border-radius: 8px; outline: 0; color: ${({ theme }) => theme.colors.white}; background: ${({ theme }) => theme.colors.primary}; font: inherit; }
  .floor-editor > label input:focus,
  .floor-editor > label select:focus { border-color: ${({ theme }) => theme.colors.success}; }
  .floor-editor > label small { display: block; margin-top: 6px; color: ${({ theme }) => theme.colors.gray}; font-size: 9px; font-weight: 500; line-height: 1.4; }
  .area-selector { padding-bottom: 12px; border-bottom: 1px solid ${({ theme }) => theme.colors.tertiary}; }
  .association-selector { padding: 11px; border: 1px solid rgba(74, 196, 125, .5); border-radius: 9px; background: rgba(74, 196, 125, .08); }
  .vertex-help { display: flex; gap: 7px; margin: 12px 0 18px; padding: 10px; border-radius: 9px; color: ${({ theme }) => theme.colors.gray}; background: ${({ theme }) => theme.colors.tertiary}; font-size: 10px; line-height: 1.4; }
  .vertex-help svg { flex: none; color: ${({ theme }) => theme.colors.success}; }
  .entity-title { margin-bottom: 9px; }
  .entity-title strong,
  .entity-title small { display: block; }
  .entity-title strong { color: ${({ theme }) => theme.colors.white}; font-size: 12px; }
  .entity-title small { margin-top: 2px; color: ${({ theme }) => theme.colors.gray}; font-size: 9px; }
  .entity-title b { display: grid; width: 25px; height: 25px; place-items: center; border-radius: 8px; color: ${({ theme }) => theme.colors.success}; background: ${({ theme }) => theme.colors.tertiary}; font-size: 10px; }
  .entity-list { display: grid; max-height: 310px; gap: 6px; overflow: auto; }
  .entity-list > label { display: grid; grid-template-columns: 0 29px minmax(0, 1fr) auto; align-items: center; gap: 7px; padding: 9px; border: 1px solid ${({ theme }) => theme.colors.tertiary}; border-radius: 9px; color: ${({ theme }) => theme.colors.gray}; background: ${({ theme }) => theme.colors.primary}; cursor: pointer; }
  .entity-list > label.checked { border-color: ${({ theme }) => theme.colors.success}; background: ${({ theme }) => theme.colors.tertiary}; }
  .entity-list > label.disabled { cursor: not-allowed; opacity: .52; }
  .entity-list input { width: 0; opacity: 0; }
  .entity-list label > span { display: grid; width: 29px; height: 29px; place-items: center; border-radius: 8px; background: ${({ theme }) => theme.colors.tertiary}; }
  .entity-list label.checked > span { color: #ffe36c; }
  .entity-list strong,
  .entity-list small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .entity-list strong { color: ${({ theme }) => theme.colors.white}; font-size: 10px; }
  .entity-list small { margin-top: 2px; color: ${({ theme }) => theme.colors.gray}; font-size: 8px; }
  .entity-list em { color: ${({ theme }) => theme.colors.gray}; font-size: 8px; font-style: normal; }
  .no-lights { padding: 16px; color: ${({ theme }) => theme.colors.gray}; font-size: 10px; line-height: 1.5; }
  .delete-button { display: flex; width: 100%; height: 36px; align-items: center; justify-content: center; gap: 6px; margin-top: 16px; border: 1px solid #824552; border-radius: 8px; color: #ffb9c2; background: #351d26; font: inherit; font-size: 10px; font-weight: 700; }
  .select-room { display: grid; min-height: 360px; place-items: center; align-content: center; gap: 8px; color: ${({ theme }) => theme.colors.gray}; text-align: center; }
  .select-room svg { font-size: 28px; color: ${({ theme }) => theme.colors.success}; }
  .select-room strong { color: ${({ theme }) => theme.colors.white}; }
  .select-room p { max-width: 230px; font-size: 10px; line-height: 1.5; }
  .spin { animation: floor-spin 1s linear infinite; }
  @keyframes floor-spin { to { transform: rotate(360deg); } }

  @media (max-width: 900px) {
    padding: 0;
    .floor-modal { width: 100vw; height: 100vh; max-height: none; border: 0; border-radius: 0; }
    .floor-header { align-items: flex-start; flex-direction: column; }
    .floor-actions { width: 100%; flex-wrap: wrap; }
    .floor-actions button { flex: 1; }
    .floor-actions button.icon-button { flex: none; }
    .floor-content.is-editing { grid-template-columns: 1fr; }
    .floor-editor { border-top: 1px solid ${({ theme }) => theme.colors.tertiary}; border-left: 0; }
    .floor-canvas-wrap { padding: 10px; }
    .floor-scroll { max-height: 58vh; border-radius: 12px; }
    .floor-canvas.landscape { min-width: 700px; }
    .floor-canvas.portrait { min-width: 100%; }
    .floor-toolbar { position: sticky; top: 0; z-index: 5; padding: 7px 10px; }
    .floor-toolbar .toolbar-text { white-space: nowrap; }
    .floor-editor { overflow: visible; }
  }
`;
