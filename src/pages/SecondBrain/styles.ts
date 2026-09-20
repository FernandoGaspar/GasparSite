import styled from 'styled-components';

export const Container = styled.section`
  --bg: ${p=>p.theme.colors.primary};
  --panel: ${p=>p.theme.colors.secondary};
  --line: ${p=>p.theme.title==='light'?'#d8dee8':p.theme.colors.tertiary};
  --text: ${p=>p.theme.colors.white};
  --muted: ${p=>p.theme.title==='light'?'#53627a':p.theme.colors.gray};
  --accent: ${p=>p.theme.title==='light'?'#4354ce':'#8da7ff'};
  --hover: ${p=>p.theme.title==='light'?'#edf0ff':'rgba(108,124,255,.14)'};
  --soft: ${p=>p.theme.title==='light'?'#f6f8fc':'rgba(8,15,30,.16)'};
  color-scheme: ${p=>p.theme.title==='light'?'light':'dark'};
`;
