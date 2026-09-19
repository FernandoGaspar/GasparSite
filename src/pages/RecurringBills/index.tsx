import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useHistory, useLocation } from 'react-router-dom';
import { MdAdd, MdEdit, MdPause, MdPlayArrow, MdRefresh, MdSave } from 'react-icons/md';
import { URL_API } from '../../repositories/baseAPI';
import { Container } from './styles';

type FlowType = 'income' | 'expense' | 'investment';
type FlowDirection = 'income' | 'expense';
type Recurrence = 'Mensal' | 'Semanal';
type Status = 'pago' | 'a_vencer' | 'vence_hoje' | 'em_conciliacao' | 'atrasado' | 'divergente' | 'pendente';
type Rule = { id: number; idContaContabil: number; valor: number; variacao: number; descricao: string; recorrencia: Recurrence; dia: number; anoMesInicio: string; anoMesFim: string; ativo: boolean; tipoFluxo: FlowType; direcaoFluxo?: FlowDirection };
type Occurrence = { idContaRecorrente: number; descricao: string; competencia: string; vencimento: string; valorPrevisto: number; valorEncontrado: number | null; status: Status; diasParaVencimento: number; idTransacao: number | null; tipoFluxo: FlowType; direcaoFluxo?: FlowDirection; recorrencia?: Recurrence };
type Account = { id: number; grupo: string; subgrupo: string; nome: string };
type Form = { descricao: string; idContaContabil: string; valor: string; variacao: string; dia: string; anoMesInicio: string; anoMesFim: string; tipoFluxo: FlowType; direcaoFluxo: FlowDirection; recorrencia: Recurrence };

const month = () => new Date().toISOString().slice(0, 7);
const blank = (): Form => ({ descricao: '', idContaContabil: '', valor: '', variacao: '5', dia: '10', anoMesInicio: month(), anoMesFim: '', tipoFluxo: 'expense', direcaoFluxo: 'expense', recorrencia: 'Mensal' });
const money = (value: number) => Math.abs(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const weekdays = ['', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];
const flowInfo: Record<FlowType, { label: string; short: string; group: string; name: string; placeholder: string; date: string; hint: string }> = {
  expense: { label: 'Despesa prevista', short: 'Despesa', group: 'custo', name: 'Nome da despesa', placeholder: 'Ex.: Conta de luz', date: 'Dia de vencimento', hint: 'Use a tolerância para despesas variáveis, como água e energia. Um pagamento fora dessa faixa será marcado para conferência.' },
  income: { label: 'Receita prevista', short: 'Receita', group: 'receita', name: 'Nome da receita', placeholder: 'Ex.: Salário', date: 'Dia de recebimento', hint: 'A tolerância permite conciliar recebimentos com pequenas diferenças em relação ao valor previsto.' },
  investment: { label: 'Investimento programado', short: 'Investimento', group: 'investimento', name: 'Nome do investimento', placeholder: 'Ex.: Aporte mensal', date: 'Dia do investimento', hint: 'O investimento reduz o saldo disponível na projeção, mas aparece separado das despesas do mês.' },
};

const statusText = (item: Occurrence) => {
  const labels: Record<FlowType, Record<Status, string>> = {
    expense: { pago: 'Pago', a_vencer: 'A vencer', vence_hoje: 'Vence hoje', em_conciliacao: 'Aguardando pagamento', atrasado: 'Em atraso', divergente: 'Conferir valor', pendente: 'Programada' },
    income: { pago: 'Recebida', a_vencer: 'A receber', vence_hoje: 'Prevista hoje', em_conciliacao: 'Aguardando recebimento', atrasado: 'Não recebida', divergente: 'Conferir valor', pendente: 'Programada' },
    investment: { pago: 'Investido', a_vencer: 'A investir', vence_hoje: 'Programado hoje', em_conciliacao: 'Aguardando realização', atrasado: 'Não realizado', divergente: 'Conferir valor', pendente: 'Programado' },
  };
  const statusType = item.tipoFluxo === 'investment' && item.direcaoFluxo === 'income' ? 'income' : item.tipoFluxo || 'expense';
  return labels[statusType][item.status];
};

export default function RecurringBills() {
  const location = useLocation();
  const history = useHistory();
  const pendingOnly = new URLSearchParams(location.search).get('filter') === 'pending';
  const [rules, setRules] = useState<Rule[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<Rule | null>(null);
  const [form, setForm] = useState<Form>(blank);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [trackingMonth, setTrackingMonth] = useState(month);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const compatibleAccounts = useMemo(() => accounts.filter(item => item.grupo.trim().toLowerCase() === flowInfo[form.tipoFluxo].group), [accounts, form.tipoFluxo]);
  const visibleRules = useMemo(() => showAll ? rules : rules.filter(item => item.ativo), [rules, showAll]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<{ items: Rule[]; accounts: Account[] }>(`${URL_API}/contas-recorrentes`);
      setRules(data.items);
      setAccounts(data.accounts);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Não foi possível carregar os fluxos programados.');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    axios.get<{ items: Occurrence[] }>(`${URL_API}/contas-recorrentes/status`, { params: { mes: trackingMonth } })
      .then(response => setOccurrences(response.data.items.filter(item => item.competencia === trackingMonth)))
      .catch(() => setOccurrences([]));
  }, [trackingMonth]);

  const open = (rule?: Rule) => {
    setMessage('');
    setSelected(rule || null);
    setForm(rule ? {
      descricao: rule.descricao, idContaContabil: String(rule.idContaContabil), valor: String(Math.abs(rule.valor)),
      variacao: String(rule.variacao), dia: String(rule.dia), tipoFluxo: rule.tipoFluxo || (rule.valor > 0 ? 'income' : 'expense'),
      direcaoFluxo: rule.direcaoFluxo || (rule.valor > 0 ? 'income' : 'expense'),
      recorrencia: rule.recorrencia === 'Semanal' ? 'Semanal' : 'Mensal',
      anoMesInicio: `${rule.anoMesInicio.slice(0, 4)}-${rule.anoMesInicio.slice(4, 6)}`,
      anoMesFim: rule.anoMesFim ? `${rule.anoMesFim.slice(0, 4)}-${rule.anoMesFim.slice(4, 6)}` : '',
    } : blank());
  };
  const selectFlowType = (tipoFluxo: FlowType) => setForm(current => ({ ...current, tipoFluxo, idContaContabil: '', direcaoFluxo: tipoFluxo === 'income' ? 'income' : 'expense' }));
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage('');
    const payload = { ...form, idContaContabil: Number(form.idContaContabil), valor: Math.abs(Number(form.valor)), variacao: Number(form.variacao), dia: Number(form.dia) };
    try {
      const response = selected
        ? await axios.put(`${URL_API}/contas-recorrentes/${selected.id}`, payload)
        : await axios.post(`${URL_API}/contas-recorrentes`, payload);
      setMessage(response.data.message); await load();
      if (!selected) open();
    } catch (error: any) { setMessage(error.response?.data?.message || 'Não foi possível salvar.'); }
  };
  const toggle = async (rule: Rule) => {
    try { const { data } = await axios.patch(`${URL_API}/contas-recorrentes/${rule.id}`, { ativo: !rule.ativo }); setMessage(data.message); await load(); }
    catch (error: any) { setMessage(error.response?.data?.message || 'Não foi possível alterar o status.'); }
  };

  const totals = occurrences.reduce((result, item) => {
    const type = item.tipoFluxo || (item.valorPrevisto > 0 ? 'income' : 'expense');
    const direction = item.direcaoFluxo || (item.valorPrevisto > 0 ? 'income' : 'expense');
    const key = type === 'investment' ? (direction === 'income' ? 'investmentIncome' : 'investmentExpense') : type;
    result[key] += Math.abs(item.valorPrevisto);
    return result;
  }, { income: 0, expense: 0, investmentIncome: 0, investmentExpense: 0 } as Record<'income' | 'expense' | 'investmentIncome' | 'investmentExpense', number>);
  const attention = occurrences.filter(item => ['atrasado', 'vence_hoje', 'divergente'].includes(item.status)).length;
  const visibleOccurrences = pendingOnly ? occurrences.filter(item => item.status !== 'pago') : occurrences;
  const investmentIncome = form.tipoFluxo === 'investment' && form.direcaoFluxo === 'income';
  const formHint = investmentIncome ? 'Essa receita aumenta o saldo projetado e continua classificada dentro dos investimentos.' : flowInfo[form.tipoFluxo].hint;
  const formDate = investmentIncome ? 'Dia do recebimento' : flowInfo[form.tipoFluxo].date;

  return <Container>
    <header><div><span>PLANEJAMENTO FINANCEIRO</span><h1>Fluxos programados</h1><p>Cadastre receitas, despesas e investimentos recorrentes. Cada realização é identificada automaticamente nas transações importadas.</p></div><div className="actions"><button onClick={() => open()}><MdAdd /> Novo fluxo</button><button onClick={load}><MdRefresh /> Atualizar</button></div></header>
    {message && <div className="notice">{message}</div>}
    {pendingOnly && <div className="active-filter"><div><span>AÇÃO DO ALERTA</span><strong>Fluxos pendentes de conferência</strong><small>{visibleOccurrences.length} {visibleOccurrences.length===1?'fluxo encontrado':'fluxos encontrados'} nesta competência</small></div><button onClick={()=>history.replace('/settings/contas-recorrentes')}>Limpar filtro</button></div>}
    <section className="tracking" aria-label="Acompanhamento dos fluxos programados">
      <div className="tracking-head"><div><span>ACOMPANHAMENTO</span><h2>Previsto x realizado</h2></div><label>Competência<input type="month" value={trackingMonth} onChange={e => setTrackingMonth(e.target.value)} /></label></div>
      <div className="tracking-summary"><div className="income"><small>Receitas previstas</small><strong>{money(totals.income)}</strong></div><div className="expense"><small>Despesas previstas</small><strong>{money(totals.expense)}</strong></div><div className="investment"><small>Custos de investimentos</small><strong>{money(totals.investmentExpense)}</strong></div><div className="investment-income"><small>Receitas de investimentos</small><strong>{money(totals.investmentIncome)}</strong></div><div className={attention ? 'needs-attention' : ''}><small>Para conferir</small><strong>{attention}</strong></div></div>
      <div className="tracking-list">{visibleOccurrences.length ? visibleOccurrences.map(item => { const direction = item.direcaoFluxo || (item.valorPrevisto > 0 ? 'income' : 'expense'); return <article className={`${item.tipoFluxo} ${direction}-direction`} key={`${item.idContaRecorrente}-${item.vencimento}`}><div><span className={`flow-badge ${item.tipoFluxo}`}>{flowInfo[item.tipoFluxo || 'expense'].short}{item.tipoFluxo === 'investment' ? ` · ${direction === 'income' ? 'Receita' : 'Custo'}` : ''}</span><strong>{item.descricao}</strong><span>Data prevista: {new Date(`${item.vencimento}T12:00:00`).toLocaleDateString('pt-BR')}</span></div><b>{direction === 'income' ? '+' : '−'} {money(item.valorPrevisto)}</b><span className={`tracking-status ${item.status}`}>{statusText(item)}</span>{item.status === 'pago' && <small>{direction === 'income' ? 'Recebido' : item.tipoFluxo === 'investment' ? 'Investido' : 'Pago'}: {money(item.valorEncontrado || 0)}</small>}</article>; }) : <p>{pendingOnly?'Nenhum fluxo pendente nesta competência.':'Não há fluxos programados nesta competência.'}</p>}</div>
    </section>
    <main>
      <section className="rule-list"><div className="section-heading"><div><h2>Seus fluxos</h2><span>{rules.filter(item => item.ativo).length} ativos</span></div><button className="show-all" onClick={() => setShowAll(!showAll)}>{showAll ? 'Mostrar ativos' : 'Visualizar tudo'}</button></div>
        {loading ? <p className="empty">Carregando…</p> : visibleRules.map(rule => <article className={!rule.ativo ? 'inactive' : ''} key={rule.id}>
          <button className="rule-select" onClick={() => open(rule)}><span className={`flow-badge ${rule.tipoFluxo || 'expense'}`}>{flowInfo[rule.tipoFluxo || 'expense'].label}{rule.tipoFluxo === 'investment' ? ` · ${(rule.direcaoFluxo || (rule.valor > 0 ? 'income' : 'expense')) === 'income' ? 'Receita' : 'Custo'}` : ''}</span><strong>{rule.descricao}</strong><span>{rule.recorrencia === 'Semanal' ? `Semanal · ${weekdays[rule.dia]}` : `Todo dia ${rule.dia}`} · {money(rule.valor)}</span><small>{rule.ativo ? 'Ativo' : 'Pausado'} · tolerância de {rule.variacao}%</small></button>
          <div className="rule-actions"><button title="Editar" onClick={() => open(rule)}><MdEdit /></button><button title={rule.ativo ? 'Desativar fluxo' : 'Ativar fluxo'} aria-label={rule.ativo ? 'Desativar fluxo' : 'Ativar fluxo'} className={rule.ativo ? 'deactivate' : 'activate'} onClick={() => toggle(rule)}>{rule.ativo ? <><MdPause /> Desativar</> : <><MdPlayArrow /> Ativar</>}</button></div>
        </article>)}
        {!loading && !visibleRules.length && <p className="empty">Nenhum fluxo ativo. Use “Visualizar tudo” para conferir os fluxos pausados.</p>}
      </section>
      <section className="editor"><div className="section-heading"><h2>{selected ? 'Editar fluxo' : 'Novo fluxo'}</h2>{selected && <button className="text-button" onClick={() => open()}>Limpar seleção</button>}</div>
        <form onSubmit={save}>
          <fieldset className="flow-type"><legend>Tipo de fluxo</legend><div>{(Object.keys(flowInfo) as FlowType[]).map(type => <button key={type} type="button" aria-pressed={form.tipoFluxo === type} className={form.tipoFluxo === type ? `selected ${type}` : type} onClick={() => selectFlowType(type)}><strong>{flowInfo[type].short}</strong><span>{type === 'income' ? 'Entrada no saldo' : type === 'investment' ? 'Aporte planejado' : 'Saída de consumo'}</span></button>)}</div></fieldset>
          {form.tipoFluxo === 'investment' && <fieldset className="investment-direction"><legend>Este investimento é</legend><div><button type="button" className={form.direcaoFluxo === 'expense' ? 'selected expense' : 'expense'} aria-pressed={form.direcaoFluxo === 'expense'} onClick={() => setForm({ ...form, direcaoFluxo: 'expense' })}><strong>Custo</strong><span>Ex.: parcela do imóvel</span></button><button type="button" className={form.direcaoFluxo === 'income' ? 'selected income' : 'income'} aria-pressed={form.direcaoFluxo === 'income'} onClick={() => setForm({ ...form, direcaoFluxo: 'income' })}><strong>Receita</strong><span>Ex.: aluguel recebido</span></button></div></fieldset>}
          <label>{flowInfo[form.tipoFluxo].name}<input required maxLength={200} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder={flowInfo[form.tipoFluxo].placeholder} /></label>
          <label>Categoria contábil<select required value={form.idContaContabil} onChange={e => setForm({ ...form, idContaContabil: e.target.value })}><option value="">Selecione uma categoria de {flowInfo[form.tipoFluxo].short.toLowerCase()}</option>{compatibleAccounts.map(account => <option key={account.id} value={account.id}>{account.subgrupo} · {account.nome}</option>)}</select></label>
          <div className="two-columns"><label>Valor esperado<input required type="number" min="0.01" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></label><label>Tolerância (%)<input required type="number" min="0" max="100" step="0.01" value={form.variacao} onChange={e => setForm({ ...form, variacao: e.target.value })} /></label></div>
          <p className="hint">{formHint}</p>
          <div className="two-columns"><label>Recorrência<select value={form.recorrencia} onChange={e => { const recorrencia = e.target.value as Recurrence; setForm({ ...form, recorrencia, dia: recorrencia === 'Semanal' ? '1' : '10' }); }}><option>Mensal</option><option>Semanal</option></select></label>{form.recorrencia === 'Semanal' ? <label>Dia da semana<select value={form.dia} onChange={e => setForm({ ...form, dia: e.target.value })}>{weekdays.slice(1).map((day, index) => <option key={day} value={index + 1}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>)}</select></label> : <label>{formDate}<input required type="number" min="1" max="31" value={form.dia} onChange={e => setForm({ ...form, dia: e.target.value })} /></label>}</div>
          <div className="two-columns"><label>Começa em<input required type="month" value={form.anoMesInicio} onChange={e => setForm({ ...form, anoMesInicio: e.target.value })} /></label><label>Termina em <small>(opcional)</small><input type="month" min={form.anoMesInicio} value={form.anoMesFim} onChange={e => setForm({ ...form, anoMesFim: e.target.value })} /></label></div>
          <button className="save" type="submit"><MdSave /> {selected ? 'Salvar alterações' : `Cadastrar ${flowInfo[form.tipoFluxo].short.toLowerCase()}`}</button>
        </form>
      </section>
    </main>
  </Container>;
}
