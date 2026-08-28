import React from 'react';
import { Link } from 'react-router-dom';
import { MdAutorenew, MdChevronRight, MdMemory, MdSettings } from 'react-icons/md';
import { Container } from './styles';

export default function SettingsHome() {
  return <Container>
    <header><span><MdSettings /> CONFIGURAÇÕES</span><h1>Escolha o que deseja configurar</h1><p>Organize as regras e rotinas que mantêm sua vida financeira funcionando no automático.</p></header>
    <main>
      <Link to="/settings/contas-recorrentes" className="setting-card recurring"><div className="icon"><MdAutorenew /></div><div><small>PLANEJAMENTO FINANCEIRO</small><h2>Fluxos programados</h2><p>Cadastre receitas, despesas e investimentos para projetar o saldo e acompanhar cada realização.</p></div><MdChevronRight className="arrow" /></Link>
      <Link to="/settings/automations" className="setting-card"><div className="icon"><MdSettings /></div><div><small>SISTEMA</small><h2>Automações</h2><p>Crie rotinas, ajuste agendas e acompanhe as execuções da sua API.</p></div><MdChevronRight className="arrow" /></Link>
      <Link to="/ai-context" className="setting-card memory"><div className="icon"><MdMemory /></div><div><small>INTELIGÊNCIA ARTIFICIAL</small><h2>IA e memória</h2><p>Gerencie memórias, contextos, agentes e a importação controlada do histórico.</p></div><MdChevronRight className="arrow" /></Link>
    </main>
  </Container>;
}
