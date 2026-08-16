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
    .chat-window header { display:flex; align-items:center; justify-content:space-between; padding:18px 20px; border-bottom:1px solid ${({ theme }) => theme.colors.tertiary}; }
    .chat-window header span { display:block; color:#6fa8ff; font-size:10px; font-weight:800; letter-spacing:.12em; }
    .chat-window header strong { display:block; margin-top:4px; font-size:16px; }
    .chat-window header button { border:0; color:${({ theme }) => theme.colors.gray}; background:transparent; cursor:pointer; font:inherit; }
    .chat-body {
      flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:12px;
    }
    .chat-body > p { margin:0; color:${({ theme }) => theme.colors.gray}; line-height:1.45; }
    .message {
      max-width:86%; padding:12px 14px; border-radius:14px; line-height:1.45; font-size:13px;
    }
    .message.user { align-self:flex-end; color:#fff; background:linear-gradient(135deg,#3978f5,#6256e8); border-bottom-right-radius:4px; }
    .message.bot { align-self:flex-start; color:${({ theme }) => theme.colors.white}; background:${({ theme }) => theme.colors.tertiary}; border-bottom-left-radius:4px; }
    .confirm { display:block; margin-top:10px; padding:8px 10px; border:0; border-radius:8px; color:#072d20; background:#5be0ad; font-weight:800; cursor:pointer; }
    form { display:flex; gap:8px; padding:14px; border-top:1px solid ${({ theme }) => theme.colors.tertiary}; }
    form input { flex:1; min-width:0; height:42px; padding:0 13px; border:1px solid ${({ theme }) => theme.colors.tertiary}; border-radius:11px; outline:0; color:${({ theme }) => theme.colors.white}; background:${({ theme }) => theme.colors.primary}; font:inherit; }
    form button { width:42px; border:0; border-radius:11px; color:#fff; background:#315baf; font-size:18px; cursor:pointer; }
    form button[type="submit"] { background:#5a5be8; }
    @media(max-width: 520px) { .chat { right:12px; bottom:12px; } .chat-window { width:calc(100vw - 24px); height:calc(100vh - 100px); } }
`;

export const Chat = styled.div`

`;
