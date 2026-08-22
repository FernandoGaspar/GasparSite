import React from 'react';
import { Link } from 'react-router-dom';
import { MdAutorenew, MdChevronRight, MdSettings } from 'react-icons/md';
import { Container } from './styles';

export default function SettingsHome() {
  return <Container>
    <header><span><MdSettings /> CONFIGURAÇÕES</span><h1>Escolha o que deseja configurar</h1><p>Organize as regras e rotinas que mantêm sua vida financeira funcionando no automático.</p></header>
    <main>
      <Link to="/settings/contas-recorrentes" className="setting-card recurring"><div className="icon"><MdAutorenew /></div><div><small>PLANEJAMENTO FINANCEIRO</small><h2>Contas recorrentes</h2><p>Cadastre vencimentos, valores e períodos para receber avisos de pagamentos esquecidos.</p></div><MdChevronRight className="arrow" /></Link>
      <Link to="/settings/automations" className="setting-card"><div className="icon"><MdSettings /></div><div><small>SISTEMA</small><h2>Automações</h2><p>Crie rotinas, ajuste agendas e acompanhe as execuções da sua API.</p></div><MdChevronRight className="arrow" /></Link>
    </main>
  </Container>;
}
