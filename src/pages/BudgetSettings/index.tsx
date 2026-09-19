import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { MdArrowBack, MdArrowForward, MdCheckCircle, MdContentCopy, MdSearch, MdStars, MdTrendingUp } from 'react-icons/md';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from 'styled-components';
import { URL_API } from '../../repositories/baseAPI';
import './styles.css';

type BudgetHistory = { competence: string; label: string; budget: number; actual: number };
type BudgetGroup = {
  group: string;
  color: string;
  currentBudget: number;
  average12Months: number;
  previousYearBudget: number;
  history: BudgetHistory[];
};
type BudgetAccount = Omit<BudgetGroup, 'history'> & { accountId: number; account: string; code: string; history: BudgetHistory[] };
type EditorItem = {
  key: string;
  title: string;
  group: string;
  color: string;
  currentBudget: number;
  average12Months: number;
  previousYearBudget: number;
  history: BudgetHistory[];
  accountId?: number;
};
type BudgetData = {
  competence: string;
  competenceLabel: string;
  groups: BudgetGroup[];
  accounts: BudgetAccount[];
  totals: { currentBudget: number; average12Months: number; previousYearBudget: number };
};

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const number = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const currentCompetence = () => {
  const today = new Date();
  return `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
};
const inputValue = (value: number) => number.format(Number(value || 0));
const amount = (value: string) => {
  const clean = String(value || '').replace(/R\$|\s/g, '');
  const normalized = clean.includes(',') ? clean.replace(/\./g, '').replace(',', '.') : clean;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};
const shiftMonth = (value: string, offset: number) => {
  const date = new Date(Number(value.slice(0, 4)), Number(value.slice(4, 6)) - 1 + offset, 1);
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
};
const monthInput = (value: string) => `${value.slice(0, 4)}-${value.slice(4, 6)}`;
const toCompetence = (value: string) => value.replace('-', '');
const competenceLabel = (value: string) => new Date(`${value.slice(0, 4)}-${value.slice(4)}-01T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

export default function BudgetSettings() {
  const theme = useTheme() as any;
  const [competence, setCompetence] = useState(currentCompetence);
  const [data, setData] = useState<BudgetData | null>(null);
  const [mode, setMode] = useState<'group' | 'account'>('group');
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [replicating, setReplicating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const setFromData = (next: BudgetData) => {
    setData(next);
    setDraft(Object.fromEntries([
      ...next.groups.map(item => [`group:${item.group}`, inputValue(item.currentBudget)] as const),
      ...(next.accounts || []).map(item => [`account:${item.accountId}`, inputValue(item.currentBudget)] as const),
    ]));
  };
  const load = useCallback(async () => {
    setLoading(true); setError(''); setMessage('');
    try {
      const response = await axios.get<BudgetData>(`${URL_API}/budget-planning`, { params: { competencia: competence } });
      setFromData(response.data);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Não foi possível carregar o budget.');
    } finally { setLoading(false); }
  }, [competence]);
  useEffect(() => { void load(); }, [load]);

  const editingItems = useMemo<EditorItem[]>(() => {
    if (!data) return [];
    if (mode === 'group') return data.groups.map(item => ({ ...item, key: `group:${item.group}`, title: item.group }));
    return (data.accounts || []).map(item => ({ ...item, key: `account:${item.accountId}`, title: item.account }));
  }, [data, mode]);
  const changed = useMemo(() => editingItems.filter(item => Math.abs(amount(draft[item.key]) - item.currentBudget) >= .005), [editingItems, draft]);
  const totalDraft = useMemo(() => editingItems.reduce((sum, item) => sum + amount(draft[item.key]), 0), [editingItems, draft]);
  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return editingItems.filter(item => !term || `${item.title} ${item.group}`.toLocaleLowerCase('pt-BR').includes(term));
  }, [editingItems, search]);
  const accountGroups = useMemo(() => {
    if (!data || mode !== 'account') return [];
    const order = new Map(data.groups.map((item, index) => [item.group, index]));
    const grouped = new Map<string, EditorItem[]>();
    visible.forEach(item => grouped.set(item.group, [...(grouped.get(item.group) || []), item]));
    return Array.from(grouped, ([group, items]) => ({
      group,
      color: items[0]?.color || '#7c6cff',
      items: items.sort((left, right) => left.title.localeCompare(right.title, 'pt-BR', { sensitivity: 'base' })),
    })).sort((left, right) => (order.get(left.group) ?? Number.MAX_SAFE_INTEGER) - (order.get(right.group) ?? Number.MAX_SAFE_INTEGER));
  }, [data, mode, visible]);
  const applyAll = (source: 'average12Months' | 'previousYearBudget') => {
    if (!editingItems.length) return;
    setDraft(current => ({ ...current, ...Object.fromEntries(editingItems.map(item => [item.key, inputValue(item[source])])) }));
    setMessage(source === 'average12Months' ? 'A média dos últimos 12 meses foi aplicada. Revise antes de salvar.' : 'O budget do ano anterior foi copiado. Revise antes de salvar.');
  };
  const applyReference = (item: EditorItem, value: number) => setDraft(current => ({ ...current, [item.key]: inputValue(value) }));
  const reset = () => { if (data) setFromData(data); setMessage('Alterações descartadas.'); };
  const save = async () => {
    if (!changed.length) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const response = await axios.put(`${URL_API}/budget-planning`, {
        competence,
        mode,
        items: changed.map(item => mode === 'group'
          ? { group: item.group, amount: amount(draft[item.key]) }
          : { accountId: item.accountId, amount: amount(draft[item.key]) }),
      }, { headers: { 'Idempotency-Key': window.crypto.randomUUID() } });
      setFromData(response.data);
      setMessage(response.data.message || 'Budget atualizado com sucesso.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Não foi possível salvar o budget.');
    } finally { setSaving(false); }
  };
  const replicate = async () => {
    if (!data) return;
    const first = shiftMonth(competence, 1);
    const last = shiftMonth(competence, 12);
    const confirmed = window.confirm(
      `Copiar os valores em edição para os próximos 12 meses?\n\nPeríodo: ${competenceLabel(first)} a ${competenceLabel(last)}.\nBudgets já cadastrados nesse período serão substituídos.`,
    );
    if (!confirmed) return;
    setReplicating(true); setError(''); setMessage('');
    try {
      const response = await axios.post(`${URL_API}/budget-planning/replicate`, {
        competence,
        months: 12,
        mode,
        items: editingItems.map(item => mode === 'group'
          ? { group: item.group, amount: amount(draft[item.key]) }
          : { accountId: item.accountId, amount: amount(draft[item.key]) }),
      }, { headers: { 'Idempotency-Key': window.crypto.randomUUID() } });
      setFromData(response.data);
      setMessage(response.data.message || 'Budget replicado para os próximos 12 meses.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Não foi possível replicar o budget.');
    } finally { setReplicating(false); }
  };

  const themeVariables = {
    '--budget-white': theme.colors.white,
    '--budget-gray': theme.colors.gray,
    '--budget-secondary': theme.colors.secondary,
    '--budget-tertiary': theme.colors.tertiary,
  } as React.CSSProperties;

  const renderCard = (item: EditorItem) => {
    const budget = amount(draft[item.key]);
    const comparison = item.average12Months > 0 ? (budget / item.average12Months - 1) * 100 : null;
    return <article className="group-card" key={item.key} style={{ '--group-color': item.color } as React.CSSProperties}>
      <div className="group-head"><span className="color" /><div><small>{mode === 'group' ? 'GRUPO CONTÁBIL' : item.group.toLocaleUpperCase('pt-BR')}</small><h2>{item.title}</h2></div>{comparison !== null && <em className={comparison < 0 ? 'below' : ''}><MdTrendingUp /> {Math.abs(comparison).toFixed(0)}% {comparison >= 0 ? 'acima' : 'abaixo'} da média</em>}</div>
      <label className="budget-input"><span>Budget deste mês</span><div><b>R$</b><input inputMode="decimal" value={draft[item.key] || ''} onChange={event => setDraft(current => ({ ...current, [item.key]: event.target.value }))} onBlur={event => setDraft(current => ({ ...current, [item.key]: inputValue(amount(event.target.value)) }))} onFocus={event => event.currentTarget.select()} /></div></label>
      <div className="references">
        <div><span>Média mensal dos últimos 12 meses</span><strong>{currency.format(item.average12Months)}</strong><button onClick={() => applyReference(item, item.average12Months)}>Usar este valor</button></div>
        <div><span>Budget no mesmo mês do ano passado</span><strong>{currency.format(item.previousYearBudget)}</strong><button onClick={() => applyReference(item, item.previousYearBudget)}>Copiar este valor</button></div>
      </div>
      <section className="trend" aria-label={`Evolução do budget e dos gastos de ${item.title}`}>
        <header><span>EVOLUÇÃO · 12 MESES</span><div><i className="budget-dot" /> Budget <i className="actual-dot" /> Realizado</div></header>
        <div className="trend-chart"><ResponsiveContainer width="100%" height="100%">
          <LineChart data={item.history.map(point => point.competence === competence ? { ...point, budget } : point)} margin={{ top: 12, right: 4, bottom: 0, left: 4 }}>
            <XAxis dataKey="label" axisLine={false} tickLine={false} interval="preserveStartEnd" tick={{ fill: '#94a3b8', fontSize: 9 }} />
            <YAxis hide domain={[0, 'auto']} />
            <Tooltip formatter={(value: any, name: any) => [currency.format(Number(value || 0)), name === 'budget' ? 'Budget' : 'Realizado']} contentStyle={{ background: '#101d33', border: '1px solid #334155', borderRadius: 10, fontSize: 11 }} />
            <Line type="monotone" dataKey="budget" stroke="#9b8cff" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="actual" stroke="#72d8b3" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer></div>
      </section>
    </article>;
  };

  return <div className="budget-settings" style={themeVariables}>
    <header className="page-head"><div><span>PLANEJAMENTO FINANCEIRO</span><h1>Ajustar budget</h1><p>Edite por grupo ou detalhe o planejamento em cada conta contábil.</p></div></header>
    <section className="period-panel">
      <button aria-label="Mês anterior" onClick={() => setCompetence(value => shiftMonth(value, -1))}><MdArrowBack /></button>
      <label><small>COMPETÊNCIA</small><input type="month" value={monthInput(competence)} onChange={event => { if (event.target.value) setCompetence(toCompetence(event.target.value)); }} /></label>
      <button aria-label="Próximo mês" onClick={() => setCompetence(value => shiftMonth(value, 1))}><MdArrowForward /></button>
    </section>
    {loading ? <div className="state">Carregando seu planejamento…</div> : error && !data ? <div className="state error"><p>{error}</p><button onClick={load}>Tentar novamente</button></div> : data && <>
      <div className="mode-switch" role="group" aria-label="Nível de edição do budget"><button className={mode === 'group' ? 'active' : ''} onClick={() => { setMode('group'); setSearch(''); setMessage(''); }}>Por grupo</button><button className={mode === 'account' ? 'active' : ''} onClick={() => { setMode('account'); setSearch(''); setMessage(''); }}>Por conta contábil</button></div>
      <section className="summary">
        <article className="primary"><small>BUDGET EM EDIÇÃO · {mode === 'group' ? 'POR GRUPO' : 'POR CONTA'}</small><strong>{currency.format(totalDraft)}</strong><span>{data.competenceLabel}</span></article>
        <article><small>MÉDIA MENSAL · 12 MESES</small><strong>{currency.format(data.totals.average12Months)}</strong><span>Gasto real anterior à competência</span></article>
        <article><small>MESMO MÊS · ANO ANTERIOR</small><strong>{currency.format(data.totals.previousYearBudget)}</strong><span>Referência do planejamento anterior</span></article>
      </section>
      <section className="replicate-panel">
        <div><small>PLANEJAMENTO CONTÍNUO</small><strong>Repetir este budget nos próximos 12 meses</strong><span>Copia os valores em edição para cada um dos 12 meses seguintes.</span></div>
        <button disabled={replicating} onClick={replicate}><MdContentCopy /> {replicating ? 'Repetindo…' : 'Repetir por 12 meses'}</button>
      </section>
      <section className="toolbar">
        <div className="search"><MdSearch /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={mode === 'group' ? 'Buscar grupo contábil' : 'Buscar conta ou grupo'} /></div>
        <div className="bulk"><button onClick={() => applyAll('average12Months')}><MdStars /> Usar média em todos</button><button onClick={() => applyAll('previousYearBudget')}>Copiar ano anterior</button></div>
      </section>
      {message && <div className="notice"><MdCheckCircle /> {message}</div>}
      {error && <div className="notice error">{error}</div>}
      <main className={`groups ${mode === 'account' ? 'account-groups' : ''}`}>
        {mode === 'group' ? visible.map(renderCard) : accountGroups.map(section => <section className="account-group" key={section.group} style={{ '--group-color': section.color } as React.CSSProperties}>
          <header className="account-group-head"><span /><div><small>GRUPO CONTÁBIL</small><h2>{section.group}</h2><p>{section.items.length} {section.items.length === 1 ? 'conta' : 'contas'}</p></div></header>
          <div className="account-grid">{section.items.map(renderCard)}</div>
        </section>)}
        {!visible.length && <div className="state">Nenhum {mode === 'group' ? 'grupo' : 'conta'} encontrado.</div>}
      </main>
      <div className="save-bar"><div><strong>{changed.length ? `${changed.length} ${mode === 'group' ? `grupo${changed.length === 1 ? '' : 's'}` : `conta${changed.length === 1 ? '' : 's'}`} alterado${changed.length === 1 ? '' : 's'}` : 'Tudo atualizado'}</strong><span>{changed.length ? `Novo total: ${currency.format(totalDraft)}` : 'Faça um ajuste ou use uma das sugestões.'}</span></div>{changed.length > 0 && <button className="discard" onClick={reset}>Descartar</button>}<button className="save" disabled={!changed.length || saving} onClick={save}>{saving ? 'Salvando…' : 'Salvar budget'}</button></div>
    </>}
  </div>;
}
