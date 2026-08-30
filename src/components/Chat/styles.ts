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
    .chat-window header button { border:0; color:${({ theme }) => theme.colors.gray}; background:transparent; cursor:pointer; font:inherit; }
    .team { display:flex; align-items:center; }
    .team span { display:grid; width:28px; height:28px; margin-left:-7px; place-items:center; border:2px solid ${({ theme }) => theme.colors.secondary}; border-radius:50%; color:#b9cbff; background:#203c66; font-size:14px; }
    .team span:nth-child(2) { color:#6de2ba; background:#17463a; }
    .team span:nth-child(3) { color:#9dbbff; background:#2d3f71; }
    .chat-body {
      flex:1; overflow-y:auto; padding:18px; display:flex; flex-direction:column; gap:16px; scroll-behavior:smooth;
    }
    .empty-state { display:flex; align-items:flex-start; gap:10px; padding:12px; border:1px solid ${({ theme }) => theme.colors.tertiary}; border-radius:14px; color:${({ theme }) => theme.colors.white}; background:rgba(38, 75, 119, .18); }
    .empty-state strong { display:block; font-size:13px; }
    .empty-state p { margin:4px 0 0; color:${({ theme }) => theme.colors.gray}; font-size:12px; line-height:1.45; }
    .message {
      max-width:100%; padding:11px 13px; border-radius:4px 14px 14px; line-height:1.5; font-size:13px; white-space:pre-wrap;
    }
    .message.user { align-self:flex-end; max-width:78%; color:#fff; border-radius:14px 4px 14px 14px; background:linear-gradient(135deg,#3978f5,#6256e8); }
    .message.bot { color:${({ theme }) => theme.colors.white}; background:${({ theme }) => theme.colors.tertiary}; }
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
    @media(max-width: 520px) { .chat { right:12px; bottom:12px; } .chat-window { width:calc(100vw - 24px); height:calc(100vh - 100px); } .chat-window header { padding:14px; } .message.user { max-width:86%; } .agent-message { max-width:96%; } }
`;

export const Chat = styled.div`

`;
