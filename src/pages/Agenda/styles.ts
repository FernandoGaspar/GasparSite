import styled from 'styled-components';

export const Container=styled.div`
  max-width:1120px;margin:18px auto 48px;min-width:0;
  >header{max-width:720px;margin-bottom:24px}>header span{display:flex;align-items:center;gap:7px;color:#68a9ff;font-size:10px;font-weight:800;letter-spacing:.13em}>header h1{margin:8px 0 10px;color:${p=>p.theme.colors.white};font-size:clamp(28px,4vw,40px)}>header p{color:${p=>p.theme.colors.gray};font-size:14px;line-height:1.6}
  .today{display:grid;grid-template-columns:1fr auto;gap:15px 24px;margin-bottom:20px;padding:20px;border:1px solid ${p=>p.theme.colors.tertiary};border-radius:16px;background:${p=>p.theme.colors.secondary}}
  .today small{color:#68a9ff;font-size:10px;font-weight:800;letter-spacing:.1em}.today h2{margin:6px 0;color:${p=>p.theme.colors.white};font-size:20px}.today>button{align-self:center;display:flex;align-items:center;gap:7px;padding:10px 14px;border:1px solid #397fc2;border-radius:9px;background:transparent;color:#9ccaff;font-weight:700;cursor:pointer}.today-list{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}.today-list article{display:grid;gap:5px;padding:13px;border-radius:10px;background:rgba(255,255,255,.035)}.today-list strong{color:${p=>p.theme.colors.white};font-size:13px}.today-list span,.empty{color:${p=>p.theme.colors.gray};font-size:11px}.empty{grid-column:1/-1;margin:0}
  @media(max-width:650px){margin:12px auto 32px;.today{grid-template-columns:1fr}.today>button{justify-self:start}.today-list{grid-template-columns:1fr}}
`;
