import styled from 'styled-components';

export const Container = styled.div<{ page?: boolean }>`
    .chat {
      position: ${({ page }) => page ? 'relative' : 'fixed'};
      bottom: ${({ page }) => page ? 'auto' : '24px'};
      right: ${({ page }) => page ? 'auto' : '24px'};
      z-index: 9999;
    }
    .chat-button {
      width: 54px; height: 54px; border: 0; border-radius: 18px; color: #fff;
      background: linear-gradient(135deg, #3978f5, #6d5dfc); box-shadow: 0 14px 32px rgba(41, 91, 200, .4);
      font-size: 23px; display: grid; place-items: center; cursor: pointer;
    }
    .chat-window {
      width: ${({ page }) => page ? '100%' : '390px'}; height: ${({ page }) => page ? 'calc(100vh - 172px)' : '560px'};
      min-height: ${({ page }) => page ? '560px' : '0'}; display: flex; flex-direction: column;
      overflow: hidden; border: 1px solid ${({ theme }) => theme.colors.tertiary}; border-radius: 18px;
      color: ${({ theme }) => theme.colors.white}; background: ${({ theme }) => theme.colors.secondary};
      box-shadow: 0 24px 70px rgba(0, 0, 0, .28);
    }
    .chat-window header { display:flex; align-items:center; gap:12px; padding:16px 18px; border-bottom:1px solid ${({ theme }) => theme.colors.tertiary}; }
    .chat-window header > div:first-child { min-width:0; flex:1; }
    .chat-window header span { display:block; color:#6fa8ff; font-size:10px; font-weight:800; letter-spacing:.12em; }
    .chat-window header strong { display:block; margin-top:4px; font-size:16px; }
    .chat-window header small { display:block; max-width:620px; margin-top:3px; color:${({ theme }) => theme.colors.gray}; font-size:10px; line-height:1.35; }
    .chat-window header button { border:0; color:${({ theme }) => theme.colors.gray}; background:transparent; cursor:pointer; font:inherit; }
    .team { display:flex; align-items:center; }
    .team span { display:grid; width:28px; height:28px; margin-left:-7px; place-items:center; border:2px solid ${({ theme }) => theme.colors.secondary}; border-radius:50%; color:#b9cbff; background:#203c66; font-size:14px; }
    .team span:nth-child(2) { color:#6de2ba; background:#17463a; }
    .team span:nth-child(3) { color:#9dbbff; background:#2d3f71; }
    .chat-body {
      flex:1; overflow-y:auto; padding:18px; display:flex; flex-direction:column; gap:16px; scroll-behavior:smooth;
      overscroll-behavior:contain;
    }
    .agent-alerts { display:grid; gap:8px; margin-bottom:4px; }
    .alerts-toggle { width:100%; display:flex; align-items:center; justify-content:space-between; padding:9px 11px; border:1px solid rgba(241,184,74,.28); border-radius:10px; color:#f5ce7d; background:rgba(133,91,19,.12); cursor:pointer; font:inherit; font-size:11px; font-weight:800; }
    .alerts-toggle span { display:flex; align-items:center; gap:7px; }
    .alerts-list { display:grid; gap:7px; }
    .agent-alert { display:grid; gap:8px; padding:11px 12px; border:1px solid rgba(92,137,212,.28); border-left:3px solid #5d91e3; border-radius:10px; color:${({ theme }) => theme.colors.white}; background:rgba(46,74,128,.1); }
    .agent-alert.warning { border-left-color:#e8ad42; background:rgba(139,93,17,.09); }
    .agent-alert.critical { border-left-color:#ed6674; background:rgba(150,41,55,.09); }
    .agent-alert.positive { border-left-color:#58c99d; background:rgba(32,128,91,.08); }
    .agent-alert>div>span { display:block; color:#83aaf0; font-size:8px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
    .agent-alert strong { display:block; margin-top:3px; font-size:12px; }
    .agent-alert p { margin:4px 0 0; color:${({ theme }) => theme.colors.gray}; font-size:10px; line-height:1.45; }
    .agent-alert footer { display:flex; flex-wrap:wrap; gap:7px; }
    .agent-alert footer button,.agent-alert footer a { padding:5px 7px; border:1px solid #4c6492; border-radius:7px; color:#c5d6fa; background:transparent; cursor:pointer; font:inherit; font-size:9px; font-weight:700; text-decoration:none; }
    .agent-alert footer button:disabled { opacity:.5; cursor:default; }
    .empty-state { display:flex; align-items:flex-start; gap:10px; padding:12px; border:1px solid ${({ theme }) => theme.colors.tertiary}; border-radius:14px; color:${({ theme }) => theme.colors.white}; background:rgba(38, 75, 119, .18); }
    .empty-state strong { display:block; font-size:13px; }
    .empty-state p { margin:4px 0 0; color:${({ theme }) => theme.colors.gray}; font-size:12px; line-height:1.45; }
    .message {
      max-width:100%; padding:11px 13px; border-radius:4px 14px 14px; line-height:1.5; font-size:13px; white-space:pre-wrap;
    }
    .message.user { align-self:flex-end; max-width:78%; color:#fff; border-radius:14px 4px 14px 14px; background:linear-gradient(135deg,#3978f5,#6256e8); }
    .message.bot { color:${({ theme }) => theme.colors.white}; background:${({ theme }) => theme.colors.tertiary}; }
    .delegation { display:block; margin-bottom:7px; color:#8eb6ff; font-size:9px; font-weight:800; letter-spacing:.04em; text-transform:uppercase; }
    .message-content { display:flex; flex-direction:column; gap:7px; }
    .message-content p, .message-content h2, .message-content h3 { margin:0; }
    .message-content h2 { margin-top:5px; color:#8dbaff; font-size:16px; line-height:1.35; }
    .message-content h3 { margin-top:5px; color:#8dbaff; font-size:14px; line-height:1.4; }
    .message-content strong { color:#fff; font-weight:800; }
    .message-space { height:3px; }
    .message-bullet { display:grid; grid-template-columns:7px minmax(0, 1fr); gap:8px; align-items:start; }
    .message-bullet i { width:5px; height:5px; margin-top:8px; border-radius:50%; background:#73a9ff; }
    .agent-message { display:flex; align-items:flex-start; gap:9px; max-width:90%; }
    .agent-message-content { min-width:0; flex:1; }
    .agent-meta { display:flex; align-items:baseline; gap:7px; margin:0 0 5px 2px; }
    .agent-meta strong { color:${({ theme }) => theme.colors.white}; font-size:12px; }
    .agent-meta span { overflow:hidden; color:${({ theme }) => theme.colors.gray}; font-size:10px; text-overflow:ellipsis; white-space:nowrap; }
    .agent-avatar { display:grid; width:30px; height:30px; flex:0 0 30px; place-items:center; border-radius:10px; color:#c7d9ff; background:#203c66; font-size:15px; }
    .agent-avatar.home { color:#a8c5ff; background:#2d3f71; }
    .agent-avatar.guardian, .agent-avatar.organizer, .agent-avatar.planner, .agent-avatar.economist, .agent-avatar.investor { color:#71e1bc; background:#17463a; }
    .thinking { display:flex; align-items:center; gap:9px; color:${({ theme }) => theme.colors.gray}; font-size:12px; }
    .thinking .agent-avatar { width:26px; height:26px; flex-basis:26px; animation:pulse 1.25s ease-in-out infinite; }
    @keyframes pulse { 50% { opacity:.45; transform:scale(.92); } }
    .confirm { display:block; margin-top:10px; padding:8px 10px; border:0; border-radius:8px; color:#072d20; background:#5be0ad; font-weight:800; cursor:pointer; }
    form { display:flex; gap:8px; padding:14px; border-top:1px solid ${({ theme }) => theme.colors.tertiary}; }
    form input { flex:1; min-width:0; height:42px; padding:0 13px; border:1px solid ${({ theme }) => theme.colors.tertiary}; border-radius:11px; outline:0; color:${({ theme }) => theme.colors.white}; background:${({ theme }) => theme.colors.primary}; font:inherit; }
    form button { width:42px; border:0; border-radius:11px; color:#fff; background:#315baf; font-size:18px; cursor:pointer; }
    form button[type="submit"] { background:#5a5be8; }
    @media(max-width: 1120px) {
      ${({ page }) => page && `.chat-window { height:600px; min-height:500px; }`}
    }
    @media(max-width: 720px) {
      ${({ page }) => page && `.chat-window { height:clamp(460px,70dvh,600px); min-height:0; border-radius:14px; }`}
      .chat-window header { padding:15px 16px; }
      .chat-body { padding:16px; }
    }
    @media(max-width: 520px) {
      .chat { right:12px; bottom:12px; }
      .chat-window { width:calc(100vw - 24px); height:calc(100dvh - 100px); }
      .chat-window header { padding:14px 16px; }
      .chat-body { padding:16px; }
      .message.user { max-width:86%; }
      .agent-message { max-width:96%; }
      form { padding:10px; }
      ${({ page }) => page && `.chat-window { width:100%; height:clamp(430px,72dvh,580px); min-height:0; border-radius:14px; }`}
    }
    @media(max-width: 380px) {
      .chat-window header small { display:none; }
      form { gap:6px; }
      form input { padding:0 10px; }
      form button { width:39px; flex:0 0 39px; }
      .agent-alert footer { display:grid; grid-template-columns:1fr; }
      .agent-alert footer button,.agent-alert footer a { text-align:center; }
    }
`;

export const Chat = styled.div`

`;
