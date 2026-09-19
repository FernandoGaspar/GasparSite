import React, { DragEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useHistory, useLocation } from 'react-router-dom';
import {
  MdAdd, MdArchive, MdArrowForward, MdCheck, MdClose, MdToday,
  MdDelete, MdEvent, MdHome, MdInbox, MdLoop, MdMoreHoriz, MdOpenInNew,
  MdPeople, MdPerson, MdPlayArrow, MdSchedule, MdSearch, MdShoppingCart, MdTune, MdWork,
} from 'react-icons/md';
import { URL_API } from '../../repositories/baseAPI';
import { Container } from './styles';
import { ActivityPeriod, matchesActivityPeriod, periodLabels, periodDescriptions, sortByActivityUrgency } from './activityPeriods';
import MicrosoftWorkspace, { MicrosoftDraft, MicrosoftSource } from './MicrosoftWorkspace';

type View = 'focus' | 'board' | 'people' | 'routines' | 'agenda';
type Status = 'inbox' | 'next' | 'doing' | 'waiting' | 'done' | 'cancelled';
type ItemType = 'task' | 'follow_up' | 'maintenance' | 'purchase';
interface Subtask {
  id:number; activityId:number; title:string; isCompleted:boolean; position:number;
  createdAt?:string; updatedAt?:string; completedAt?:string|null;
}
interface Activity {
  id:number; title:string; notes:string; itemType:ItemType; area:'work'|'personal';
  status:Status; priority:'low'|'medium'|'high'; dueDate:string|null; personName:string;
  projectName:string; recurrence:'none'|'weekly'|'monthly'|'quarterly'|'yearly';
  recurrenceInterval:number; createdAt:string; completedAt:string|null;
  subtasks:Subtask[]; subtaskSummary:{total:number;completed:number};
  sourceType?:MicrosoftSource['sourceType']|'gmail_mail'|''; sourceId?:string; sourceUrl?:string;
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
const priorityLabels: Record<string,string> = { low:'Baixa', medium:'Normal', high:'Alta' };
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
const normalizeSearch = (value:unknown) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
const matchesSearch = (item:Activity, search:string) => {
  const term = normalizeSearch(search);
  if (!term) return true;
  const searchable = [
    item.title, item.notes, item.personName, item.projectName,
    item.itemType, typeLabels[item.itemType], item.area, item.area === 'work' ? 'Trabalho' : 'Pessoal',
    item.status, statusLabels[item.status], item.priority, priorityLabels[item.priority],
    item.dueDate, dateLabel(item.dueDate), item.recurrence, recurrenceLabels[item.recurrence],
    item.recurrenceInterval, item.createdAt, item.completedAt,
    ...(item.subtasks || []).map(subtask=>subtask.title),
  ].map(normalizeSearch).join(' ');
  return searchable.includes(term);
};

const TypeIcon = ({ type }:{type:ItemType}) => type === 'follow_up' ? <MdPerson/> : type === 'maintenance' ? <MdHome/> : type === 'purchase' ? <MdShoppingCart/> : <MdCheck/>;

const Activities: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const actionParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const actionFilter = actionParams.get('filter') || '';
  const period:ActivityPeriod = Object.keys(periodLabels).includes(actionFilter) ? actionFilter as ActivityPeriod : 'all';
  const effectivePeriod = actionFilter;
  const setPeriod = (value:ActivityPeriod) => { const params=new URLSearchParams(location.search); if(value==='all')params.delete('filter');else params.set('filter',value); history.replace({pathname:location.pathname,search:params.toString()}); };
  const personFilter = actionParams.get('person') || '';
  const projectFilter = actionParams.get('project') || '';
  const hasActionFilter = Boolean(actionFilter || personFilter || projectFilter);
  const [items, setItems] = useState<Activity[]>([]);
  const [summary, setSummary] = useState<Summary>({open:0,inbox:0,doing:0,waiting:0,overdue:0,dueToday:0});
  const requestedView = actionParams.get('view');
  const [view, setView] = useState<View>(requestedView === 'agenda' ? requestedView : 'focus');
  const [area, setArea] = useState<'all'|'work'|'personal'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [draftInfo, setDraftInfo] = useState<DraftInfo|null>(null);
  const [draftSource, setDraftSource] = useState<MicrosoftSource|null>(null);
  const [editing, setEditing] = useState<Activity|null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [composerOpen, setComposerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [subtaskBusyIds, setSubtaskBusyIds] = useState<number[]>([]);
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

  const searching = Boolean(search.trim());
  const matchesActionFilter = useCallback((item:Activity) => {
    if (personFilter && normalizeSearch(item.personName) !== normalizeSearch(personFilter)) return false;
    if (projectFilter && normalizeSearch(item.projectName) !== normalizeSearch(projectFilter)) return false;
    if (!actionFilter) return true;
    if (['attention','overdue','today','tomorrow','week'].includes(actionFilter)) return matchesActivityPeriod(item,actionFilter);
    if (actionFilter === 'waiting') return !isClosed(item) && item.status === 'waiting';
    if (actionFilter === 'missing-context') return !isClosed(item) && item.priority === 'high' && (!item.personName.trim() || !item.projectName.trim());
    return true;
  }, [actionFilter, personFilter, projectFilter]);
  const visible = useMemo(() => sortByActivityUrgency(items.filter(item => (area === 'all' || item.area === area) && matchesActionFilter(item) && matchesActivityPeriod(item,period) && matchesSearch(item,search))), [items, area, search, matchesActionFilter, period]);
  const open = visible.filter(item => !isClosed(item));
  const focusItems = hasActionFilter || period !== 'all' ? open : open.filter(item => matchesActivityPeriod(item,'attention'));
  const focus = hasActionFilter || period !== 'all' ? focusItems : focusItems.length ? focusItems : open;
  const actionFilterLabel = personFilter ? `Responsável: ${personFilter}` : projectFilter ? `Projeto: ${projectFilter}` : periodLabels[effectivePeriod as ActivityPeriod] || ({ waiting:'Follow-ups aguardando', 'missing-context':'Prioridades sem contexto' } as Record<string,string>)[actionFilter] || 'Filtro do alerta';
  const people = useMemo(() => {
    const grouped:Record<string,Activity[]> = { '':[] };
    visible.filter(item => !isClosed(item)).forEach(item => (grouped[item.personName?.trim() || ''] ||= []).push(item));
    return Object.entries(grouped).sort((a,b) => !a[0] ? 1 : !b[0] ? -1 : a[0].localeCompare(b[0]));
  }, [visible]);

  const openNew = (preset:Partial<FormState>={}) => {
    setEditing(null); setDraftInfo(null); setDraftSource(null); setSubtasks([]); setSubtaskTitle(''); setForm({...blank, area:area === 'all' ? 'work' : area, ...preset}); setComposerOpen(true);
  };
  const openEdit = (item:Activity) => {
    setEditing(item);
    setDraftInfo(null); setDraftSource(null);
    setSubtasks(item.subtasks || []); setSubtaskTitle('');
    setForm({title:item.title,notes:item.notes,itemType:item.itemType,area:item.area,status:item.status,priority:item.priority,dueDate:item.dueDate||'',personName:item.personName,projectName:item.projectName,recurrence:item.recurrence,recurrenceInterval:item.recurrenceInterval});
    setComposerOpen(true);
  };
  const save = async (event:FormEvent) => {
    event.preventDefault(); setSaving(true);
    try {
      const payload = {...form, dueDate:form.dueDate || null, ...(!editing ? {subtasks:subtasks.map(({title,isCompleted})=>({title,isCompleted})),...(draftSource || {})} : {})};
      const {data:saved} = editing
        ? await axios.patch<Activity>(`${URL_API}/activities/${editing.id}`, payload)
        : await axios.post<Activity>(`${URL_API}/activities`, payload);
      if (saved?.id) setItems(current => editing
        ? current.map(item => item.id === saved.id ? saved : item)
        : [saved, ...current.filter(item => item.id !== saved.id)]);
      setComposerOpen(false); setEditing(null); setDraftInfo(null); setDraftSource(null); await load(true);
    } catch (requestError:any) { setError(requestError.response?.data?.message || 'Não foi possível salvar.'); }
    finally { setSaving(false); }
  };
  const addSubtask = async () => {
    const title = subtaskTitle.trim();
    if (!title || saving) return;
    setSubtaskTitle('');
    if (!editing) {
      setSubtasks(current=>[...current,{id:-Date.now(),activityId:0,title,isCompleted:false,position:current.length}]);
      return;
    }
    try {
      const {data} = await axios.post<Subtask>(`${URL_API}/activities/${editing.id}/subtasks`,{title});
      setSubtasks(current=>[...current,data]);
      await load(true);
    } catch (requestError:any) {
      setSubtaskTitle(title);
      setError(requestError.response?.data?.message || 'Não foi possível adicionar a subtarefa.');
    }
  };
  const toggleSubtask = async (subtask:Subtask) => {
    const next = !subtask.isCompleted;
    setSubtasks(current=>current.map(item=>item.id===subtask.id?{...item,isCompleted:next}:item));
    if (subtask.id < 0 || !editing) return;
    setSubtaskBusyIds(current=>[...current,subtask.id]);
    try {
      await axios.patch(`${URL_API}/activities/${editing.id}/subtasks/${subtask.id}`,{isCompleted:next});
      await load(true);
    } catch (requestError:any) {
      setSubtasks(current=>current.map(item=>item.id===subtask.id?subtask:item));
      setError(requestError.response?.data?.message || 'Não foi possível atualizar a subtarefa.');
    } finally { setSubtaskBusyIds(current=>current.filter(id=>id!==subtask.id)); }
  };
  const removeSubtask = async (subtask:Subtask) => {
    setSubtasks(current=>current.filter(item=>item.id!==subtask.id));
    if (subtask.id < 0 || !editing) return;
    setSubtaskBusyIds(current=>[...current,subtask.id]);
    try {
      await axios.delete(`${URL_API}/activities/${editing.id}/subtasks/${subtask.id}`);
      await load(true);
    } catch (requestError:any) {
      setSubtasks(current=>[...current,subtask].sort((a,b)=>a.position-b.position));
      setError(requestError.response?.data?.message || 'Não foi possível remover a subtarefa.');
    } finally { setSubtaskBusyIds(current=>current.filter(id=>id!==subtask.id)); }
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
      setSubtasks((suggestion.steps || []).map((title,index)=>({id:-(Date.now()+index),activityId:0,title,isCompleted:false,position:index})));
      setSubtaskTitle('');
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
      setSubtasks([]); setSubtaskTitle('');
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
    if (item && !personName && item.itemType==='follow_up') { setError('Follow-ups precisam de uma pessoa. Para remover o responsável, altere o tipo para Tarefa.'); return; }
    if (item && item.personName !== personName) void moveItem(item, {personName});
  };
  const archive = async () => {
    if (!editing) return;
    try { await axios.delete(`${URL_API}/activities/${editing.id}`); setComposerOpen(false); setEditing(null); await load(); }
    catch { setError('Não foi possível arquivar a atividade.'); }
  };

  const openMicrosoftDraft = (data:MicrosoftDraft) => {
    const suggestion = data.suggestion || {};
    setEditing(null); setDraftSource(data.source); setSubtaskTitle('');
    setSubtasks((suggestion.steps || []).map((title:string,index:number)=>({id:-(Date.now()+index),activityId:0,title,isCompleted:false,position:index})));
    setForm({
      ...blank,...suggestion,dueDate:suggestion.dueDate || '',
      recurrenceInterval:suggestion.recurrenceInterval || 1,area:'work',
    });
    setDraftInfo({kind:data.analysis?.usedAI?'ai':'fallback',message:data.analysis?.usedAI?'O agente preparou este rascunho a partir do Microsoft 365.':'A IA não estava disponível; preparei um rascunho básico com o item selecionado.',details:'Revise os campos antes de salvar. O e-mail ou compromisso original ficará vinculado à atividade.'});
    setComposerOpen(true);
  };
  useEffect(() => {
    const draft = (location.state as {microsoftDraft?:MicrosoftDraft} | undefined)?.microsoftDraft;
    if (!draft) return;
    openMicrosoftDraft(draft);
    history.replace({...location,state:undefined});
  // The navigation state is consumed exactly once when Communication hands off a draft.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[location.state]);

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
        {item.sourceUrl && <a className="source-link" href={item.sourceUrl} target="_blank" rel="noreferrer" onClick={event=>event.stopPropagation()}><MdOpenInNew/>{item.sourceType==='gmail_mail'?'Gmail':'Outlook'}</a>}
      </div>
      {!!item.subtasks?.length && <div className="subtask-progress"><span><MdCheck/>{item.subtaskSummary?.completed || 0}/{item.subtaskSummary?.total || item.subtasks.length} etapas</span><i><b style={{width:`${Math.round(((item.subtaskSummary?.completed || 0)/(item.subtaskSummary?.total || item.subtasks.length))*100)}%`}}/></i></div>}
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
      <article><div className="pulse-icon coral"><MdSchedule/></div><button className="pulse-action" onClick={()=>{setView('focus');setPeriod('attention')}}>Pedem atenção<strong>{items.filter(item=>matchesActivityPeriod(item,'attention')&&(area==='all'||item.area===area)).length}</strong></button></article>
      <article><div className="pulse-icon gold"><MdInbox/></div><span>Na entrada<strong>{summary.inbox || 0}</strong></span></article>
      <article><div className="pulse-icon violet"><MdMoreHoriz/></div><span>Aguardando<strong>{summary.waiting || 0}</strong></span></article>
    </section>

    <section className="toolbar">
      <nav>
        <button className={view==='focus'?'active':''} onClick={()=>setView('focus')}><MdTune/>Foco</button>
        <button className={view==='board'?'active':''} onClick={()=>setView('board')}><MdMoreHoriz/>Quadro</button>
        <button className={view==='people'?'active':''} onClick={()=>setView('people')}><MdPeople/>Pessoas</button>
        <button className={view==='routines'?'active':''} onClick={()=>setView('routines')}><MdLoop/>Rotinas</button>
        <button className={view==='agenda'?'active':''} onClick={()=>{setSearch('');setView('agenda')}}><MdEvent/>Agenda</button>
      </nav>
      {view!=='agenda'&&<div className="area-filter"><button className={area==='all'?'active':''} onClick={()=>setArea('all')}>Tudo</button><button className={area==='work'?'active':''} onClick={()=>setArea('work')}><MdWork/>Trabalho</button><button className={area==='personal'?'active':''} onClick={()=>setArea('personal')}><MdHome/>Pessoal</button></div>}
    </section>

    {view!=='agenda' && <section className="deadline-filters" aria-label="Filtrar atividades por prazo">
      <div className="deadline-options">{(Object.keys(periodLabels) as ActivityPeriod[]).map(value=><button key={value} aria-pressed={period===value} className={period===value?'active':''} onClick={()=>setPeriod(value)}>{periodLabels[value]}<span>{items.filter(item=>(area==='all'||item.area===area)&&!isClosed(item)&&matchesSearch(item,search)&&matchesActivityPeriod(item,value)&&(!personFilter||normalizeSearch(item.personName)===normalizeSearch(personFilter))&&(!projectFilter||normalizeSearch(item.projectName)===normalizeSearch(projectFilter))).length}</span></button>)}</div>
      <p>{periodDescriptions[(effectivePeriod || 'all') as ActivityPeriod] || 'Atividades relacionadas ao filtro selecionado.'}</p>
    </section>}

    {(personFilter || projectFilter || (actionFilter && !Object.keys(periodLabels).includes(actionFilter))) && <section className="action-filter"><div><span>FILTRO ATIVO</span><strong>{actionFilterLabel}</strong><small>{visible.length} {visible.length===1?'atividade encontrada':'atividades encontradas'}</small></div><button onClick={()=>history.replace('/activities')}><MdClose/> Limpar filtro</button></section>}

    {view!=='agenda'&&<><div className="activity-search">
      <MdSearch/>
      <input aria-label="Buscar atividades" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Buscar em atividades, descrições, projetos, pessoas…"/>
      {searching && <><span>{visible.length} {visible.length===1?'resultado':'resultados'}</span><button aria-label="Limpar busca" onClick={()=>setSearch('')}><MdClose/></button></>}
    </div>

    <form className={`quick-capture ${analyzing?'busy':''}`} onSubmit={quickAdd} aria-busy={analyzing}><MdAdd/><input disabled={analyzing} value={quickTitle} onChange={e=>setQuickTitle(e.target.value)} placeholder={analyzing?'A IA está organizando sua atividade…':'Descreva naturalmente: pessoa, prazo, projeto ou resultado esperado…'}/><span>{analyzing?'IA…':'ENTER'}</span></form></>}
    {error && <div className="error"><strong>Não deu certo desta vez.</strong><span>{error}</span><button onClick={()=>load(false)}>Tentar novamente</button></div>}
    {loading && <div className="state">Organizando suas atividades…</div>}

    {!loading && !searching && view==='agenda' && <MicrosoftWorkspace mode="agenda" onDraft={openMicrosoftDraft} onManageConnection={()=>history.push('/settings')} activities={items}/>}

    {!loading && searching && view!=='people' && <section className="panel search-results">
      <div className="section-head"><div><span>BUSCA</span><h2>Atividades encontradas</h2></div><small>{visible.length} {visible.length===1?'item':'itens'}</small></div>
      <div className="activity-list">{visible.map(item=><ActivityCard key={item.id} item={item}/>)}</div>
      {!visible.length && <div className="empty"><MdSearch/><h3>Nenhuma atividade encontrada</h3><p>Tente buscar por outro título, descrição, projeto, pessoa ou status.</p></div>}
    </section>}

    {!loading && !searching && view==='focus' && <div className="focus-layout">
      <main className="panel"><div className="section-head"><div><span>{hasActionFilter || period!=='all'?'PRAZO':'AGORA'}</span><h2>{hasActionFilter || period!=='all'?actionFilterLabel:focusItems.length?'Pedem atenção':'Próximas atividades'}</h2><p>{periodDescriptions[(effectivePeriod || 'attention') as ActivityPeriod]}</p></div><small>{focus.length} atividades</small></div>
        <div className="activity-list">{focus.map(item=><ActivityCard key={item.id} item={item}/>)}</div>
        {!focus.length && <div className="empty"><MdCheck/><h3>{hasActionFilter || period!=='all'?'Nenhuma atividade neste filtro':'Tudo sob controle'}</h3><p>{hasActionFilter || period!=='all'?'Escolha outro prazo ou área para ver mais atividades.':'Capture uma atividade ou aproveite o espaço livre.'}</p></div>}
      </main>
      <aside>
        <section className="panel attention"><div className="section-head"><div><span>TRIAGEM</span><h2>Caixa de entrada</h2></div><b>{open.filter(item=>item.status==='inbox').length}</b></div>
          {open.filter(item=>item.status==='inbox').slice(0,4).map(item=><ActivityCard key={item.id} item={item} compact/>)}
          <button className="text-button" onClick={()=>setView('board')}>Organizar entrada <MdArrowForward/></button>
        </section>
        <section className="panel people-peek"><div className="section-head"><div><span>RESPONSÁVEIS</span><h2>Por pessoa</h2></div></div>
          {people.filter(([person])=>!!person).slice(0,4).map(([person,topics])=><button key={person} onClick={()=>setView('people')}><span className="avatar">{person.charAt(0).toUpperCase()}</span><span>{person}<small>{topics.length} {topics.length===1?'atividade':'atividades'}</small></span><MdArrowForward/></button>)}
          {!!people.find(([person])=>!person)?.[1].length && <button onClick={()=>setView('people')}><span className="avatar"><MdPerson/></span><span>Sem responsável<small>{people.find(([person])=>!person)?.[1].length} atividades</small></span><MdArrowForward/></button>}
          {!people.some(([,topics])=>topics.length) && <p className="mini-empty">Nenhuma atividade aberta neste filtro.</p>}
        </section>
      </aside>
    </div>}

    {!loading && !searching && view==='board' && <div className="board">{boardStatuses.map(status=>{const target=`status:${status}`;return <section className={`board-column ${dropTarget===target?'drop-target':''}`} key={status} onDragOver={event=>allowDrop(event,target)} onDragEnter={event=>allowDrop(event,target)} onDrop={event=>dropOnStatus(event,status)}><header><span className={`dot ${status}`}/><h2>{statusLabels[status]}</h2><b>{visible.filter(item=>item.status===status).length}</b></header><div>{visible.filter(item=>item.status===status).map(item=><ActivityCard key={item.id} item={item} compact draggable/>)}</div><button onClick={()=>openNew({status})}><MdAdd/>Adicionar</button></section>})}</div>}

    {!loading && view==='people' && <div className="people-view">
      <div className="section-head page-section-head"><div><span>RESPONSÁVEIS</span><h2>Atividades por pessoa</h2><p>Todas as atividades abertas, incluindo as que ainda precisam de um responsável.</p></div><button className="secondary" onClick={()=>openNew({status:'next'})}><MdAdd/> Nova atividade</button></div>
      <div className="people-grid">{people.map(([person,topics])=>{const target=`person:${person}`;return <section className={`person-card ${!person?'unassigned':''} ${dropTarget===target?'drop-target':''}`} key={person} onDragOver={event=>allowDrop(event,target)} onDragEnter={event=>allowDrop(event,target)} onDrop={event=>dropOnPerson(event,person)}><header><span className="avatar large">{person?person.charAt(0).toUpperCase():<MdPerson/>}</span><div><h3>{person || 'Sem responsável'}</h3><p>{topics.length} {topics.length===1?'atividade aberta':'atividades abertas'}</p></div></header><div>{topics.map(item=><ActivityCard key={item.id} item={item} compact draggable/>)}{!topics.length&&<p className="mini-empty">Nenhuma atividade sem responsável neste filtro.</p>}</div><button onClick={()=>openNew({personName:person,status:'next'})}><MdAdd/>Adicionar atividade</button></section>})}</div>
      {!people.length && <div className="empty panel"><MdPeople/><h3>Suas agendas aparecerão aqui</h3><p>Crie um follow-up e associe a uma pessoa.</p></div>}
    </div>}

    {!loading && !searching && view==='routines' && <div className="routines-view">
      <div className="section-head page-section-head"><div><span>RECORRÊNCIAS</span><h2>Rotinas que não dependem da memória</h2><p>Ao concluir, a próxima ocorrência é criada automaticamente.</p></div><button className="secondary" onClick={()=>openNew({itemType:'maintenance',area:'personal',status:'next',recurrence:'monthly'})}><MdAdd/> Nova rotina</button></div>
      <div className="routine-grid">{visible.filter(item=>item.recurrence!=='none'&&!isClosed(item)).map(item=><ActivityCard key={item.id} item={item}/>)}</div>
      {!visible.some(item=>item.recurrence!=='none'&&!isClosed(item)) && <div className="empty panel"><MdLoop/><h3>Nenhuma rotina ativa</h3><p>Ideal para filtros, seguros, revisões e manutenções da casa.</p></div>}
    </div>}

    {composerOpen && <div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setComposerOpen(false)}}><form className="composer" onSubmit={save}>
      <header><div><span>{editing?'EDITAR ATIVIDADE':draftInfo?.kind==='ai'?'RASCUNHO ORGANIZADO PELA IA':'NOVA ATIVIDADE'}</span><h2>{editing?'Ajuste os detalhes':draftInfo?'Revise antes de salvar':'Tire da cabeça. Organize depois.'}</h2></div><button type="button" onClick={()=>setComposerOpen(false)}><MdClose/></button></header>
      {draftInfo && <div className={`ai-draft ${draftInfo.kind}`}><b><span>IA</span>{draftInfo.message}</b><small>{draftInfo.details}</small></div>}
      {(draftSource || editing?.sourceUrl) && <a className="composer-source" href={draftSource?.sourceUrl || editing?.sourceUrl} target="_blank" rel="noreferrer"><MdOpenInNew/>Abrir origem no Outlook</a>}
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
      <section className="subtask-editor">
        <div className="subtask-heading"><div><span>CHECKLIST</span><strong>Etapas da atividade</strong></div>{!!subtasks.length&&<small>{subtasks.filter(item=>item.isCompleted).length}/{subtasks.length} concluídas</small>}</div>
        <div className="subtask-add"><input value={subtaskTitle} maxLength={240} onChange={event=>setSubtaskTitle(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();void addSubtask();}}} placeholder="Adicionar uma etapa…"/><button type="button" disabled={!subtaskTitle.trim()} onClick={()=>void addSubtask()} aria-label="Adicionar subtarefa"><MdAdd/></button></div>
        {!!subtasks.length&&<div className="subtask-list">{subtasks.map(subtask=><div className={subtask.isCompleted?'completed':''} key={subtask.id}><button type="button" className="subtask-check" disabled={subtaskBusyIds.includes(subtask.id)} aria-label={subtask.isCompleted?'Reabrir subtarefa':'Concluir subtarefa'} onClick={()=>void toggleSubtask(subtask)}>{subtask.isCompleted&&<MdCheck/>}</button><span>{subtask.title}</span><button type="button" className="subtask-remove" disabled={subtaskBusyIds.includes(subtask.id)} aria-label="Remover subtarefa" onClick={()=>void removeSubtask(subtask)}><MdDelete/></button></div>)}</div>}
        {!subtasks.length&&<p className="subtask-empty">Divida a atividade em etapas que possam ser marcadas individualmente.</p>}
      </section>
      <footer>{editing?<button type="button" className="danger" onClick={archive}><MdArchive/>Arquivar</button>:<span/>}<div><button type="button" className="cancel" onClick={()=>setComposerOpen(false)}>Cancelar</button><button className="primary" disabled={saving}>{saving?'Salvando…':'Salvar atividade'}</button></div></footer>
    </form></div>}
  </Container>;
};

export default Activities;
