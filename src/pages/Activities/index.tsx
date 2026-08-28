import React, { DragEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  MdAdd, MdArchive, MdArrowForward, MdCheck, MdClose, MdToday,
  MdHome, MdInbox, MdLoop, MdMoreHoriz, MdPeople, MdPerson, MdPlayArrow,
  MdSchedule, MdShoppingCart, MdTune, MdWork,
} from 'react-icons/md';
import { URL_API } from '../../repositories/baseAPI';
import { Container } from './styles';

type View = 'focus' | 'board' | 'people' | 'routines';
type Status = 'inbox' | 'next' | 'doing' | 'waiting' | 'done' | 'cancelled';
type ItemType = 'task' | 'follow_up' | 'maintenance' | 'purchase';
interface Activity {
  id:number; title:string; notes:string; itemType:ItemType; area:'work'|'personal';
  status:Status; priority:'low'|'medium'|'high'; dueDate:string|null; personName:string;
  projectName:string; recurrence:'none'|'weekly'|'monthly'|'quarterly'|'yearly';
  recurrenceInterval:number; createdAt:string; completedAt:string|null;
}
interface Summary { open:number; inbox:number; doing:number; waiting:number; overdue:number; dueToday:number; }
interface FormState {
  title:string; notes:string; itemType:ItemType; area:'work'|'personal'; status:Status;
  priority:'low'|'medium'|'high'; dueDate:string; personName:string; projectName:string;
  recurrence:'none'|'weekly'|'monthly'|'quarterly'|'yearly'; recurrenceInterval:number;
}
interface DraftInfo { kind:'ai'|'fallback'; message:string; details:string; }
interface ActivityAnalysisResponse {
  suggestion: Partial<Omit<FormState,'dueDate'>> & { dueDate?:string|null; steps?:string[]; confidence?:number; summary?:string };
  analysis: { usedAI:boolean; usedContext:boolean; selectedDomains:string[]; memoryCount:number; estimatedContextTokens:number; model:string };
}

const blank: FormState = { title:'', notes:'', itemType:'task', area:'work', status:'inbox', priority:'medium', dueDate:'', personName:'', projectName:'', recurrence:'none', recurrenceInterval:1 };
const statusLabels: Record<Status,string> = { inbox:'Entrada', next:'Próximas', doing:'Em andamento', waiting:'Aguardando', done:'Concluídas', cancelled:'Canceladas' };
const typeLabels: Record<ItemType,string> = { task:'Tarefa', follow_up:'Follow-up', maintenance:'Manutenção', purchase:'Compra' };
const recurrenceLabels: Record<string,string> = { none:'Não se repete', weekly:'Semanal', monthly:'Mensal', quarterly:'Trimestral', yearly:'Anual' };
const boardStatuses: Status[] = ['inbox','next','doing','waiting','done'];
const refreshIntervalMs = 30000;
const localIso = (value:Date) => `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`;
const todayIso = () => localIso(new Date());

const dateLabel = (value:string|null) => {
  if (!value) return '';
  const today = new Date(`${todayIso()}T12:00:00`);
  const target = new Date(`${value}T12:00:00`);
  const days = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanhã';
  if (days === -1) return 'Ontem';
  return target.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' });
};
const isClosed = (item:Activity) => item.status === 'done' || item.status === 'cancelled';
const isOverdue = (item:Activity) => !isClosed(item) && !!item.dueDate && item.dueDate < todayIso();

const TypeIcon = ({ type }:{type:ItemType}) => type === 'follow_up' ? <MdPerson/> : type === 'maintenance' ? <MdHome/> : type === 'purchase' ? <MdShoppingCart/> : <MdCheck/>;

const Activities: React.FC = () => {
  const [items, setItems] = useState<Activity[]>([]);
  const [summary, setSummary] = useState<Summary>({open:0,inbox:0,doing:0,waiting:0,overdue:0,dueToday:0});
  const [view, setView] = useState<View>('focus');
  const [area, setArea] = useState<'all'|'work'|'personal'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [draftInfo, setDraftInfo] = useState<DraftInfo|null>(null);
  const [editing, setEditing] = useState<Activity|null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [composerOpen, setComposerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggedId, setDraggedId] = useState<number|null>(null);
  const [dropTarget, setDropTarget] = useState('');
  const [movingIds, setMovingIds] = useState<number[]>([]);
  const suppressCardClick = useRef(false);
  const loadSequence = useRef(0);

  const load = useCallback(async (silent=true) => {
    const sequence = ++loadSequence.current;
    if (!silent) setLoading(true);
    try {
      const { data } = await axios.get(`${URL_API}/activities`);
      if (sequence !== loadSequence.current) return;
      setItems(data.items || []); setSummary(data.summary || {});
      setError('');
    } catch (requestError:any) {
      if (!silent && sequence === loadSequence.current) setError(requestError.response?.data?.message || 'Não foi possível carregar as atividades.');
    } finally { if (sequence === loadSequence.current) setLoading(false); }
  }, []);
  useEffect(() => {
    void load(false);
    const refresh = () => void load(true);
    const onVisibilityChange = () => { if (document.visibilityState === 'visible') refresh(); };
    const interval = window.setInterval(refresh, refreshIntervalMs);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      loadSequence.current += 1;
    };
  }, [load]);

  const visible = useMemo(() => items.filter(item => area === 'all' || item.area === area), [items, area]);
  const open = visible.filter(item => !isClosed(item));
  const focusItems = open.filter(item => item.status === 'doing' || item.priority === 'high' || (!!item.dueDate && item.dueDate <= localIso(new Date(Date.now()+7*86400000)))).slice(0,8);
  const focus = focusItems.length ? focusItems : open.slice(0,6);
  const people = useMemo(() => {
    const grouped:Record<string,Activity[]> = {};
    visible.filter(item => item.itemType === 'follow_up' && !isClosed(item)).forEach(item => (grouped[item.personName || 'Sem pessoa'] ||= []).push(item));
    return Object.entries(grouped).sort((a,b) => a[0].localeCompare(b[0]));
  }, [visible]);

  const openNew = (preset:Partial<FormState>={}) => {
    setEditing(null); setDraftInfo(null); setForm({...blank, area:area === 'all' ? 'work' : area, ...preset}); setComposerOpen(true);
  };
  const openEdit = (item:Activity) => {
    setEditing(item);
    setDraftInfo(null);
    setForm({title:item.title,notes:item.notes,itemType:item.itemType,area:item.area,status:item.status,priority:item.priority,dueDate:item.dueDate||'',personName:item.personName,projectName:item.projectName,recurrence:item.recurrence,recurrenceInterval:item.recurrenceInterval});
    setComposerOpen(true);
  };
  const save = async (event:FormEvent) => {
    event.preventDefault(); setSaving(true);
    try {
      const payload = {...form, dueDate:form.dueDate || null};
      const {data:saved} = editing
        ? await axios.patch<Activity>(`${URL_API}/activities/${editing.id}`, payload)
        : await axios.post<Activity>(`${URL_API}/activities`, payload);
      if (saved?.id) setItems(current => editing
        ? current.map(item => item.id === saved.id ? saved : item)
        : [saved, ...current.filter(item => item.id !== saved.id)]);
      setComposerOpen(false); setEditing(null); setDraftInfo(null); await load(true);
    } catch (requestError:any) { setError(requestError.response?.data?.message || 'Não foi possível salvar.'); }
    finally { setSaving(false); }
  };
  const quickAdd = async (event:FormEvent) => {
    event.preventDefault();
    const capture = quickTitle.trim();
    if (!capture || analyzing) return;
    const defaultArea = area === 'all' ? 'work' : area;
    setAnalyzing(true); setError('');
    try {
      const {data} = await axios.post<ActivityAnalysisResponse>(`${URL_API}/activities/analyze`, {text:capture,area:defaultArea});
      const suggestion = data.suggestion || {};
      setEditing(null);
      setForm({
        title:suggestion.title || capture,
        notes:suggestion.notes || '',
        itemType:suggestion.itemType || 'task',
        area:suggestion.area || defaultArea,
        status:suggestion.status || 'inbox',
        priority:suggestion.priority || 'medium',
        dueDate:suggestion.dueDate || '',
        personName:suggestion.personName || '',
        projectName:suggestion.projectName || '',
        recurrence:suggestion.recurrence || 'none',
        recurrenceInterval:suggestion.recurrenceInterval || 1,
      });
      const contextDetails = [
        suggestion.summary || '',
        data.analysis?.selectedDomains?.length ? `Contextos: ${data.analysis.selectedDomains.join(', ')}` : '',
        data.analysis?.memoryCount ? `${data.analysis.memoryCount} ${data.analysis.memoryCount===1?'memória relacionada':'memórias relacionadas'}` : '',
      ].filter(Boolean).join(' · ');
      setDraftInfo({
        kind:'ai',
        message:data.analysis?.usedContext ? 'A IA organizou esta atividade usando seu contexto persistente.' : 'A IA organizou o texto, mas o contexto persistente não estava disponível.',
        details:contextDetails || 'Revise os campos sugeridos antes de salvar.',
      });
      setQuickTitle(''); setComposerOpen(true);
    } catch (requestError:any) {
      setEditing(null);
      setForm({...blank,title:capture,area:defaultArea});
      setDraftInfo({
        kind:'fallback',
        message:'A IA não respondeu, então mantive sua captura como rascunho manual.',
        details:requestError.response?.data?.message || 'Revise os campos e salve normalmente.',
      });
      setQuickTitle(''); setComposerOpen(true);
    } finally { setAnalyzing(false); }
  };
  const patchItem = async (item:Activity, changes:Partial<Activity>) => {
    try { await axios.patch(`${URL_API}/activities/${item.id}`, changes); await load(); }
    catch (requestError:any) { setError(requestError.response?.data?.message || 'Não foi possível atualizar.'); }
  };
  const moveItem = async (item:Activity, changes:Partial<Activity>) => {
    if (movingIds.includes(item.id)) return;
    setError('');
    setMovingIds(current => [...current, item.id]);
    setItems(current => current.map(currentItem => currentItem.id === item.id ? {...currentItem,...changes} : currentItem));
    try {
      await axios.patch(`${URL_API}/activities/${item.id}`, changes);
      await load();
    } catch (requestError:any) {
      setItems(current => current.map(currentItem => currentItem.id === item.id ? item : currentItem));
      setError(requestError.response?.data?.message || 'Não foi possível mover a atividade.');
    } finally {
      setMovingIds(current => current.filter(id => id !== item.id));
    }
  };
  const startDragging = (event:DragEvent<HTMLElement>, item:Activity) => {
    if ((event.target as HTMLElement).closest('button') || movingIds.includes(item.id)) {
      event.preventDefault(); return;
    }
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(item.id));
    suppressCardClick.current = true;
    setDraggedId(item.id);
  };
  const stopDragging = () => {
    setDraggedId(null); setDropTarget('');
    window.setTimeout(() => { suppressCardClick.current = false; }, 0);
  };
  const allowDrop = (event:DragEvent<HTMLElement>, target:string) => {
    if (draggedId === null) return;
    event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDropTarget(target);
  };
  const dropOnStatus = (event:DragEvent<HTMLElement>, status:Status) => {
    event.preventDefault();
    const item = items.find(current => current.id === draggedId);
    stopDragging();
    if (item && item.status !== status) void moveItem(item, {status});
  };
  const dropOnPerson = (event:DragEvent<HTMLElement>, personName:string) => {
    event.preventDefault();
    const item = items.find(current => current.id === draggedId);
    stopDragging();
    if (item && item.itemType === 'follow_up' && item.personName !== personName) void moveItem(item, {personName});
  };
  const archive = async () => {
    if (!editing) return;
    try { await axios.delete(`${URL_API}/activities/${editing.id}`); setComposerOpen(false); setEditing(null); await load(); }
    catch { setError('Não foi possível arquivar a atividade.'); }
  };

  const ActivityCard = ({item,compact=false,draggable=false}:{item:Activity,compact?:boolean,draggable?:boolean}) => <article
    className={`activity-card ${compact?'compact':''} ${isClosed(item)?'closed':''} ${draggable?'draggable':''} ${draggedId===item.id?'dragging':''} ${movingIds.includes(item.id)?'moving':''}`}
    draggable={draggable && !movingIds.includes(item.id)}
    aria-grabbed={draggable ? draggedId === item.id : undefined}
    title={draggable?'Arraste este card para outra coluna':undefined}
    onDragStart={event=>startDragging(event,item)}
    onDragEnd={stopDragging}
    onClick={()=>{if(!suppressCardClick.current)openEdit(item)}}
  >
    <button className="check" aria-label={isClosed(item)?'Reabrir':'Concluir'} onClick={event=>{event.stopPropagation();patchItem(item,{status:item.status==='done'?'next':'done'} as Partial<Activity>)}}>{item.status==='done'&&<MdCheck/>}</button>
    <div className="card-copy">
      <strong>{item.title}</strong>
      {!compact && item.notes && <p>{item.notes}</p>}
      <div className="meta">
        <span className={`kind ${item.itemType}`}><TypeIcon type={item.itemType}/>{typeLabels[item.itemType]}</span>
        {item.personName && <span><MdPerson/>{item.personName}</span>}
        {item.projectName && <span>#{item.projectName}</span>}
        {item.dueDate && <span className={isOverdue(item)?'late':''}><MdToday/>{dateLabel(item.dueDate)}</span>}
        {item.recurrence!=='none' && <span><MdLoop/>{recurrenceLabels[item.recurrence]}</span>}
      </div>
    </div>
    <span className={`priority ${item.priority}`} title={`Prioridade ${item.priority}`}/>
  </article>;

  return <Container>
    <header className="page-header">
      <div><span className="eyebrow">ACTIVITY HUB</span><h1>O que merece sua atenção?</h1><p>Tarefas, follow-ups e rotinas organizados pelo contexto — não pelo quadro onde foram criados.</p></div>
      <button className="primary" onClick={()=>openNew()}><MdAdd/> Nova atividade</button>
    </header>

    <section className="pulse">
      <article><div className="pulse-icon blue"><MdPlayArrow/></div><span>Em andamento<strong>{summary.doing || 0}</strong></span></article>
      <article><div className="pulse-icon coral"><MdSchedule/></div><span>Pedem atenção<strong>{(summary.overdue || 0)+(summary.dueToday || 0)}</strong></span></article>
      <article><div className="pulse-icon gold"><MdInbox/></div><span>Na entrada<strong>{summary.inbox || 0}</strong></span></article>
      <article><div className="pulse-icon violet"><MdMoreHoriz/></div><span>Aguardando<strong>{summary.waiting || 0}</strong></span></article>
    </section>

    <section className="toolbar">
      <nav>
        <button className={view==='focus'?'active':''} onClick={()=>setView('focus')}><MdTune/>Foco</button>
        <button className={view==='board'?'active':''} onClick={()=>setView('board')}><MdMoreHoriz/>Quadro</button>
        <button className={view==='people'?'active':''} onClick={()=>setView('people')}><MdPeople/>Pessoas</button>
        <button className={view==='routines'?'active':''} onClick={()=>setView('routines')}><MdLoop/>Rotinas</button>
      </nav>
      <div className="area-filter"><button className={area==='all'?'active':''} onClick={()=>setArea('all')}>Tudo</button><button className={area==='work'?'active':''} onClick={()=>setArea('work')}><MdWork/>Trabalho</button><button className={area==='personal'?'active':''} onClick={()=>setArea('personal')}><MdHome/>Pessoal</button></div>
    </section>

    <form className={`quick-capture ${analyzing?'busy':''}`} onSubmit={quickAdd} aria-busy={analyzing}><MdAdd/><input disabled={analyzing} value={quickTitle} onChange={e=>setQuickTitle(e.target.value)} placeholder={analyzing?'A IA está organizando sua atividade…':'Descreva naturalmente: pessoa, prazo, projeto ou resultado esperado…'}/><span>{analyzing?'IA…':'ENTER'}</span></form>
    {error && <div className="error"><strong>Não deu certo desta vez.</strong><span>{error}</span><button onClick={()=>load(false)}>Tentar novamente</button></div>}
    {loading && <div className="state">Organizando suas atividades…</div>}

    {!loading && view==='focus' && <div className="focus-layout">
      <main className="panel"><div className="section-head"><div><span>AGORA</span><h2>Seu foco</h2></div><small>{focus.length} itens selecionados</small></div>
        <div className="activity-list">{focus.map(item=><ActivityCard key={item.id} item={item}/>)}</div>
        {!focus.length && <div className="empty"><MdCheck/><h3>Tudo sob controle</h3><p>Capture uma atividade ou aproveite o espaço livre.</p></div>}
      </main>
      <aside>
        <section className="panel attention"><div className="section-head"><div><span>TRIAGEM</span><h2>Caixa de entrada</h2></div><b>{open.filter(item=>item.status==='inbox').length}</b></div>
          {open.filter(item=>item.status==='inbox').slice(0,4).map(item=><ActivityCard key={item.id} item={item} compact/>)}
          <button className="text-button" onClick={()=>setView('board')}>Organizar entrada <MdArrowForward/></button>
        </section>
        <section className="panel people-peek"><div className="section-head"><div><span>PRÓXIMAS CONVERSAS</span><h2>Follow-ups</h2></div></div>
          {people.slice(0,4).map(([person,topics])=><button key={person} onClick={()=>setView('people')}><span className="avatar">{person.charAt(0).toUpperCase()}</span><span>{person}<small>{topics.length} {topics.length===1?'tema':'temas'}</small></span><MdArrowForward/></button>)}
          {!people.length && <p className="mini-empty">Nenhum tema de follow-up aberto.</p>}
        </section>
      </aside>
    </div>}

    {!loading && view==='board' && <div className="board">{boardStatuses.map(status=>{const target=`status:${status}`;return <section className={`board-column ${dropTarget===target?'drop-target':''}`} key={status} onDragOver={event=>allowDrop(event,target)} onDragEnter={event=>allowDrop(event,target)} onDrop={event=>dropOnStatus(event,status)}><header><span className={`dot ${status}`}/><h2>{statusLabels[status]}</h2><b>{visible.filter(item=>item.status===status).length}</b></header><div>{visible.filter(item=>item.status===status).map(item=><ActivityCard key={item.id} item={item} compact draggable/>)}</div><button onClick={()=>openNew({status})}><MdAdd/>Adicionar</button></section>})}</div>}

    {!loading && view==='people' && <div className="people-view">
      <div className="section-head page-section-head"><div><span>AGENDA DE 1:1</span><h2>Conversas por pessoa</h2><p>Um lugar para guardar assuntos enquanto ainda estão frescos.</p></div><button className="secondary" onClick={()=>openNew({itemType:'follow_up',status:'next'})}><MdAdd/> Novo follow-up</button></div>
      <div className="people-grid">{people.map(([person,topics])=>{const target=`person:${person}`;return <section className={`person-card ${dropTarget===target?'drop-target':''}`} key={person} onDragOver={event=>allowDrop(event,target)} onDragEnter={event=>allowDrop(event,target)} onDrop={event=>dropOnPerson(event,person)}><header><span className="avatar large">{person.charAt(0).toUpperCase()}</span><div><h3>{person}</h3><p>{topics.length} {topics.length===1?'assunto aberto':'assuntos abertos'}</p></div></header><div>{topics.map(item=><ActivityCard key={item.id} item={item} compact draggable/>)}</div><button onClick={()=>openNew({itemType:'follow_up',personName:person,status:'next'})}><MdAdd/>Adicionar assunto</button></section>})}</div>
      {!people.length && <div className="empty panel"><MdPeople/><h3>Suas agendas aparecerão aqui</h3><p>Crie um follow-up e associe a uma pessoa.</p></div>}
    </div>}

    {!loading && view==='routines' && <div className="routines-view">
      <div className="section-head page-section-head"><div><span>RECORRÊNCIAS</span><h2>Rotinas que não dependem da memória</h2><p>Ao concluir, a próxima ocorrência é criada automaticamente.</p></div><button className="secondary" onClick={()=>openNew({itemType:'maintenance',area:'personal',status:'next',recurrence:'monthly'})}><MdAdd/> Nova rotina</button></div>
      <div className="routine-grid">{visible.filter(item=>item.recurrence!=='none'&&!isClosed(item)).map(item=><ActivityCard key={item.id} item={item}/>)}</div>
      {!visible.some(item=>item.recurrence!=='none'&&!isClosed(item)) && <div className="empty panel"><MdLoop/><h3>Nenhuma rotina ativa</h3><p>Ideal para filtros, seguros, revisões e manutenções da casa.</p></div>}
    </div>}

    {composerOpen && <div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setComposerOpen(false)}}><form className="composer" onSubmit={save}>
      <header><div><span>{editing?'EDITAR ATIVIDADE':draftInfo?.kind==='ai'?'RASCUNHO ORGANIZADO PELA IA':'NOVA ATIVIDADE'}</span><h2>{editing?'Ajuste os detalhes':draftInfo?'Revise antes de salvar':'Tire da cabeça. Organize depois.'}</h2></div><button type="button" onClick={()=>setComposerOpen(false)}><MdClose/></button></header>
      {draftInfo && <div className={`ai-draft ${draftInfo.kind}`}><b><span>IA</span>{draftInfo.message}</b><small>{draftInfo.details}</small></div>}
      <label className="title-field"><span>Título</span><input autoFocus required maxLength={180} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="O que precisa acontecer?"/></label>
      <div className="form-grid">
        <label><span>Tipo</span><select value={form.itemType} onChange={e=>setForm({...form,itemType:e.target.value as ItemType})}>{Object.entries(typeLabels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
        <label><span>Área</span><select value={form.area} onChange={e=>setForm({...form,area:e.target.value as 'work'|'personal'})}><option value="work">Trabalho</option><option value="personal">Pessoal</option></select></label>
        <label><span>Status</span><select value={form.status} onChange={e=>setForm({...form,status:e.target.value as Status})}>{boardStatuses.map(value=><option value={value} key={value}>{statusLabels[value]}</option>)}</select></label>
        <label><span>Prioridade</span><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value as any})}><option value="low">Baixa</option><option value="medium">Normal</option><option value="high">Alta</option></select></label>
        <label><span>Data</span><input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></label>
        <label><span>{form.itemType==='follow_up'?'Pessoa *':'Pessoa'}</span><input required={form.itemType==='follow_up'} value={form.personName} onChange={e=>setForm({...form,personName:e.target.value})} placeholder="Com quem?"/></label>
        <label><span>Projeto ou contexto</span><input value={form.projectName} onChange={e=>setForm({...form,projectName:e.target.value})} placeholder="Ex.: Q3, Casa"/></label>
        <label><span>Repetição</span><select value={form.recurrence} onChange={e=>setForm({...form,recurrence:e.target.value as any})}>{Object.entries(recurrenceLabels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
      </div>
      <label><span>Notas</span><textarea rows={4} maxLength={2000} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Contexto, decisão esperada ou próximo passo…"/></label>
      <footer>{editing?<button type="button" className="danger" onClick={archive}><MdArchive/>Arquivar</button>:<span/>}<div><button type="button" className="cancel" onClick={()=>setComposerOpen(false)}>Cancelar</button><button className="primary" disabled={saving}>{saving?'Salvando…':'Salvar atividade'}</button></div></footer>
    </form></div>}
  </Container>;
};

export default Activities;
