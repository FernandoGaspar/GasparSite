import React from 'react';
import Chat from '../../components/Chat';

const Assistant: React.FC = () => <div>
  <div style={{ marginBottom: 18 }}>
    <span style={{ color: '#6fa8ff', fontSize: 11, fontWeight: 800, letterSpacing: '.12em' }}>CONVERSAS</span>
    <h1 style={{ margin: '6px 0' }}>Seu assistente pessoal</h1>
    <p style={{ margin: 0 }}>Pergunte sobre finanças, investimentos e sua casa, ou use o microfone para falar.</p>
  </div>
  <Chat page />
</div>;

export default Assistant;
