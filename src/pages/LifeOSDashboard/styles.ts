import React from 'react';
import styled from 'styled-components';

export const Container = styled.div`
    max-width: 1480px; margin: 0 auto; color: #e7eefb; padding-bottom: 28px;
    button { font: inherit; } small { display: block; color: #93a5c0; } .mint-text, .mint { color: #20d997 !important; } .amber-text, .amber { color: #f6a723 !important; } .violet { color: #9867ff !important; }
`;
export const Header = styled.header`
    display:flex; justify-content:space-between; align-items:center; gap:18px; margin-bottom:20px;
    .search { width:min(455px, 42vw); height:48px; padding:0 15px; display:flex; align-items:center; gap:11px; color:#8292ad; background:#0e1b2d; border:1px solid #243650; border-radius:11px; font-size:13px; }
    .header-actions { display:flex; align-items:center; gap:16px; } button { color:#dbe7fa; background:transparent; } .period { display:flex; align-items:center; gap:10px; padding:13px 15px; border:1px solid #243650; border-radius:10px; font-size:13px; } .notification { position:relative; font-size:21px; } .notification b { position:absolute; top:-9px; right:-9px; display:grid; place-items:center; width:17px; height:17px; border-radius:50%; background:#087cff; font-size:10px; } .profile { display:flex; align-items:center; gap:9px; font-size:13px; } .profile small { font-size:11px; } .avatar { display:grid; place-items:center; width:39px; height:39px; border-radius:50%; background:linear-gradient(135deg,#f1c39b,#573420); color:#112; font-weight:800; }
    @media(max-width:700px) { .search { display:none; } .period { font-size:11px; padding:10px; } .profile div:last-child { display:none; } }
`;
export const MetricCard = styled.article`
    min-height:162px; padding:21px; position:relative; overflow:hidden; border:1px solid #21344c; border-radius:12px; background:#0d1a2a; span { font-size:13px; color:#d8e4f7; } span b { margin-right:7px; font-size:17px; } > strong { display:block; margin:16px 0 7px; font-size:27px; letter-spacing:-.04em; } > small { font-size:12px; } .progress { position:absolute; left:21px; right:21px; bottom:24px; height:7px; border-radius:7px; overflow:hidden; background:#1c2d43; } .progress i { display:block; width:78%; height:100%; border-radius:inherit; background:#19cf91; } .amber-progress i { width:72%; background:#f39a13; }.violet-progress i { width:55%; background:#8764fa; }
    &.wealth { border-color:#075ac3; background:radial-gradient(circle at 85% 100%,rgba(8,103,255,.28),transparent 35%),#091d35; } &.wealth > strong { font-size:29px; } &.wealth > small { color:#20d997; font-weight:700; }
`;
export const Trend = styled.div`
    position:absolute; right:19px; bottom:21px; display:flex; align-items:flex-end; gap:4px; height:44px; width:45%; border-bottom:2px solid #087cff; i { width:11%; border-radius:7px 7px 0 0; background:linear-gradient(#1b8dff,#0b4aa8); } i:nth-child(1){height:15%} i:nth-child(2){height:28%} i:nth-child(3){height:22%} i:nth-child(4){height:43%} i:nth-child(5){height:35%} i:nth-child(6){height:65%} i:nth-child(7){height:58%} i:nth-child(8){height:88%;background:#21d997}
`;
export const QuickAction = styled.button`
    height:55px; display:flex; align-items:center; justify-content:center; gap:9px; border:1px solid #263b55; border-radius:10px; color:#c9d8ec; background:#0d1a2a; font-size:13px; font-weight:700; svg { font-size:19px; color:#8ea5c5; } &.primary { color:#fff; border-color:#087cff; background:linear-gradient(90deg,#075ed9,#0987ff); } &.primary b { font-size:25px; font-weight:400; }
`;
export const Panel = styled.section`
    min-width:0; padding:17px; border:1px solid #21344c; border-radius:12px; background:#0d1a2a; .link { margin:12px 0 0 auto; display:flex; align-items:center; gap:4px; color:#1685ff; background:transparent; font-size:12px; }
`;
const SectionHeaderContainer = styled.header`
    display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; color:#f1f5fd; font-size:16px; font-weight:700; button { padding:7px 9px; border:1px solid #30435c; border-radius:7px; color:#b8c9e3; background:#112139; font-size:11px; } > span { color:#1685ff; font-size:11px; font-weight:600; }
`;

interface SectionHeaderProps {
    title: string;
    action?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action }) =>
    React.createElement(
        SectionHeaderContainer,
        null,
        React.createElement('strong', null, title),
        action && React.createElement(action === 'Mês' ? 'button' : 'span', action === 'Mês' ? { type: 'button' } : null, action),
    );
