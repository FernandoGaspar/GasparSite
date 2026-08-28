import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MdDateRange, MdShowChart, MdTrendingDown, MdTrendingUp } from 'react-icons/md';
import { URL_API } from '../../repositories/baseAPI';
import { deduplicatedRequest } from '../../repositories/requestCache';
import { Container } from './styles';

interface Event { id:string; date:string; description:string; value:number; type:string; status:string; category:string; }
interface Point { date:string; balance:number; }
interface Summary { openingBalance:number; projectedBalance:number; scheduledIncome:number; scheduledExpenses:number; scheduledInvestments:number; scheduledInvestmentIncome:number; lowestBalance:number; lowestBalanceDate:string; horizonDays:number; }
interface Data { summary:Summary; events:Event[]; forecast:Point[]; }
const money = (value:number) => value.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
const shortDate = (value:string) => new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' });
const eventLabel: Record<string, string> = { recurring_income:'Receita prevista', recurring_expense:'Despesa prevista', scheduled_investment:'Custo de investimento', scheduled_investment_income:'Receita de investimento', credit_card_invoice:'Fatura consolidada do cartão' };

const Planning: React.FC = () => {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('@minha-carteira:usuarioId');
  useEffect(() => {
    deduplicatedRequest(
      `financial-planning:${userId}:90`,
      () => axios.get(`${URL_API}/financial-planning`, { params:{ idUsuario:userId, days:90 } }),
    )
      .then(response => setData(response.data)).catch(() => setError('Não foi possível carregar a projeção agora.'));
  }, [userId]);
  const grouped = useMemo(() => (data?.events || []).reduce((result, item) => {
    (result[item.date] ||= []).push(item); return result;
  }, {} as Record<string, Event[]>), [data]);

  return <Container>
    <header><span>PLANEJAMENTO</span><h1>Seu dinheiro nos próximos 90 dias</h1><p>Uma projeção baseada no saldo atual, receitas, despesas e investimentos programados, além das faturas estimadas dos cartões em cada mês.</p></header>
    {error && <div className="state">{error}</div>}
    {!data && !error && <div className="state">Montando sua previsão…</div>}
    {data && <>
      <section className="summary">
        <article><small>Saldo atual</small><strong>{money(data.summary.openingBalance)}</strong></article>
        <article><small>Saldo projetado</small><strong>{money(data.summary.projectedBalance)}</strong></article>
        <article className="income"><MdTrendingUp/><div><small>Entradas previstas</small><strong>{money(data.summary.scheduledIncome)}</strong></div></article>
        <article className="expense"><MdTrendingDown/><div><small>Saídas previstas</small><strong>{money(data.summary.scheduledExpenses)}</strong></div></article>
        <article className="investment"><MdShowChart/><div><small>Custos de investimentos</small><strong>{money(data.summary.scheduledInvestments)}</strong></div></article>
        <article className="investment-income"><MdTrendingUp/><div><small>Receitas de investimentos</small><strong>{money(data.summary.scheduledInvestmentIncome)}</strong></div></article>
      </section>
      <section className="chart-card"><div><span>PROJEÇÃO CONSERVADORA</span><h2>Evolução do saldo</h2></div>
        <div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.forecast}><defs><linearGradient id="planning" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6674ff" stopOpacity={.55}/><stop offset="95%" stopColor="#6674ff" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.12)"/><XAxis dataKey="date" tickFormatter={shortDate} stroke="#8290a8" fontSize={11}/><YAxis stroke="#8290a8" fontSize={11} tickFormatter={v => `${Math.round(v/1000)}k`}/><Tooltip labelFormatter={shortDate} formatter={(v:number) => money(v)}/><Area type="monotone" dataKey="balance" stroke="#7483ff" fill="url(#planning)" strokeWidth={3}/></AreaChart></ResponsiveContainer></div>
        <p>Menor saldo previsto: <strong>{money(data.summary.lowestBalance)}</strong> em {shortDate(data.summary.lowestBalanceDate)}.</p>
      </section>
      <section className="calendar"><div className="calendar-title"><MdDateRange/><div><span>CALENDÁRIO FINANCEIRO</span><h2>Próximos compromissos</h2></div></div>
        {Object.keys(grouped).length === 0 && <p className="empty">Nenhum fluxo programado pendente ou próxima fatura projetada.</p>}
        {Object.entries(grouped).map(([date, events]) => <div className="day" key={date}><time>{shortDate(date)}</time><div>{events.map(event => <article key={event.id}><div><strong>{event.description}</strong><small>{eventLabel[event.type] || event.category} · {event.status.replace('_',' ')}</small></div><b className={event.type === 'scheduled_investment' ? 'investment' : event.value >= 0 ? 'positive' : ''}>{money(event.value)}</b></article>)}</div></div>)}
      </section>
      <p className="disclaimer">Compras e parcelas do cartão não são projetadas individualmente. Para cada cartão e competência, usamos o maior valor entre a fatura já registrada e a média das duas competências anteriores. O dia exibido representa a competência, não o vencimento.</p>
    </>}
  </Container>;
};
export default Planning;
