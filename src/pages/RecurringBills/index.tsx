import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { MdAdd, MdEdit, MdPause, MdPlayArrow, MdRefresh, MdSave } from 'react-icons/md';
import { URL_API } from '../../repositories/baseAPI';
import { Container } from './styles';

type Rule = { id: number; idContaContabil: number; valor: number; variacao: number; descricao: string; recorrencia: string; dia: number; anoMesInicio: string; anoMesFim: string; ativo: boolean };
type Occurrence = { idContaRecorrente: number; descricao: string; competencia: string; vencimento: string; valorPrevisto: number; valorEncontrado: number | null; status: 'pago' | 'a_vencer' | 'vence_hoje' | 'atrasado' | 'divergente' | 'pendente'; diasParaVencimento: number; idTransacao: number | null };
type Account = { id: number; grupo: string; subgrupo: string; nome: string };
type Form = { descricao: string; idContaContabil: string; valor: string; variacao: string; dia: string; anoMesInicio: string; anoMesFim: string };
const month = () => new Date().toISOString().slice(0, 7);
const blank = (): Form => ({ descricao: '', idContaContabil: '', valor: '', variacao: '5', dia: '10', anoMesInicio: month(), anoMesFim: '' });

export default function RecurringBills() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<Rule | null>(null);
  const [form, setForm] = useState<Form>(blank);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [trackingMonth, setTrackingMonth] = useState(month);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const expenseAccounts = useMemo(() => accounts.filter(item => item.grupo === 'Custo'), [accounts]);
  const visibleRules = useMemo(() => showAll ? rules : rules.filter(item => item.ativo), [rules, showAll]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<{ items: Rule[]; accounts: Account[] }>(`${URL_API}/contas-recorrentes`);
      setRules(data.items);
      setAccounts(data.accounts);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Não foi possível carregar as contas recorrentes.');
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
      variacao: String(rule.variacao), dia: String(rule.dia),
      anoMesInicio: `${rule.anoMesInicio.slice(0, 4)}-${rule.anoMesInicio.slice(4, 6)}`,
      anoMesFim: rule.anoMesFim ? `${rule.anoMesFim.slice(0, 4)}-${rule.anoMesFim.slice(4, 6)}` : '',
    } : blank());
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage('');
    const payload = { ...form, idContaContabil: Number(form.idContaContabil), valor: -Math.abs(Number(form.valor)), variacao: Number(form.variacao), dia: Number(form.dia) };
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
  const planned = occurrences.reduce((total, item) => total + Math.abs(item.valorPrevisto), 0);
  const realized = occurrences.filter(item => item.status === 'pago').reduce((total, item) => total + Math.abs(item.valorEncontrado || 0), 0);
  const attention = occurrences.filter(item => ['atrasado', 'vence_hoje', 'divergente'].includes(item.status)).length;
  const statusLabel: Record<Occurrence['status'], string> = { pago: 'Pago', a_vencer: 'A vencer', vence_hoje: 'Vence hoje', atrasado: 'Em atraso', divergente: 'Conferir valor', pendente: 'Programada' };

  return <Container>
    <header><div><span>PLANEJAMENTO FINANCEIRO</span><h1>Contas recorrentes</h1><p>Cadastre os compromissos que se repetem. O pagamento é identificado automaticamente pelas transações importadas.</p></div><div className="actions"><button onClick={() => open()}><MdAdd /> Nova conta</button><button onClick={load}><MdRefresh /> Atualizar</button></div></header>
    {message && <div className="notice">{message}</div>}
    <section className="tracking" aria-label="Planejado versus realizado">
      <div className="tracking-head"><div><span>ACOMPANHAMENTO</span><h2>Planejado x realizado</h2></div><label>Competência<input type="month" value={trackingMonth} onChange={e => setTrackingMonth(e.target.value)} /></label></div>
      <div className="tracking-summary"><div><small>Planejado</small><strong>{planned.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div><div><small>Realizado</small><strong>{realized.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div><div className={attention ? 'needs-attention' : ''}><small>Para conferir</small><strong>{attention}</strong></div></div>
      <div className="tracking-list">{occurrences.length ? occurrences.map(item => <article key={`${item.idContaRecorrente}-${item.competencia}`}><div><strong>{item.descricao}</strong><span>Vencimento: {new Date(`${item.vencimento}T12:00:00`).toLocaleDateString('pt-BR')}</span></div><b>{Math.abs(item.valorPrevisto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b><span className={`tracking-status ${item.status}`}>{statusLabel[item.status]}</span>{item.status === 'pago' && <small>Pago: {Math.abs(item.valorEncontrado || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</small>}</article>) : <p>Não há contas recorrentes previstas nesta competência.</p>}</div>
    </section>
    <main>
      <section className="rule-list"><div className="section-heading"><div><h2>Suas contas</h2><span>{rules.filter(item => item.ativo).length} ativas</span></div><button className="show-all" onClick={() => setShowAll(!showAll)}>{showAll ? 'Mostrar ativas' : 'Visualizar tudo'}</button></div>
        {loading ? <p className="empty">Carregando…</p> : visibleRules.map(rule => <article className={!rule.ativo ? 'inactive' : ''} key={rule.id}>
          <button className="rule-select" onClick={() => open(rule)}><strong>{rule.descricao}</strong><span>Todo dia {rule.dia} · {Math.abs(rule.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span><small>{rule.ativo ? 'Ativa' : 'Pausada'} · tolerância de {rule.variacao}%</small></button>
          <div className="rule-actions"><button title="Editar" onClick={() => open(rule)}><MdEdit /></button><button title={rule.ativo ? 'Desativar conta' : 'Ativar conta'} aria-label={rule.ativo ? 'Desativar conta' : 'Ativar conta'} className={rule.ativo ? 'deactivate' : 'activate'} onClick={() => toggle(rule)}>{rule.ativo ? <><MdPause /> Desativar</> : <><MdPlayArrow /> Ativar</>}</button></div>
        </article>)}
        {!loading && !visibleRules.length && <p className="empty">Nenhuma conta ativa. Use “Visualizar tudo” para conferir as contas pausadas.</p>}
      </section>
      <section className="editor"><div className="section-heading"><h2>{selected ? 'Editar conta' : 'Nova conta'}</h2>{selected && <button className="text-button" onClick={() => open()}>Limpar seleção</button>}</div>
        <form onSubmit={save}>
          <label>Nome da conta<input required maxLength={200} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex.: Conta de luz" /></label>
          <label>Categoria contábil<select required value={form.idContaContabil} onChange={e => setForm({ ...form, idContaContabil: e.target.value })}><option value="">Selecione uma categoria</option>{expenseAccounts.map(account => <option key={account.id} value={account.id}>{account.subgrupo} · {account.nome}</option>)}</select></label>
          <div className="two-columns"><label>Valor esperado<input required type="number" min="0.01" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></label><label>Tolerância (%)<input required type="number" min="0" max="100" step="0.01" value={form.variacao} onChange={e => setForm({ ...form, variacao: e.target.value })} /></label></div>
          <p className="hint">Use a tolerância para contas variáveis, como água e energia. Um pagamento fora dessa faixa será marcado para conferência.</p>
          <div className="two-columns"><label>Dia de vencimento<input required type="number" min="1" max="31" value={form.dia} onChange={e => setForm({ ...form, dia: e.target.value })} /></label><label>Recorrência<select disabled><option>Mensal</option></select></label></div>
          <div className="two-columns"><label>Começa em<input required type="month" value={form.anoMesInicio} onChange={e => setForm({ ...form, anoMesInicio: e.target.value })} /></label><label>Termina em <small>(opcional)</small><input type="month" min={form.anoMesInicio} value={form.anoMesFim} onChange={e => setForm({ ...form, anoMesFim: e.target.value })} /></label></div>
          <button className="save" type="submit"><MdSave /> {selected ? 'Salvar alterações' : 'Cadastrar conta'}</button>
        </form>
      </section>
    </main>
  </Container>;
}
