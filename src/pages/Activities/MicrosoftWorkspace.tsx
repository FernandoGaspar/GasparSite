import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  MdAccessTime, MdAdd, MdAttachFile, MdEmail, MdEvent,
  MdErrorOutline, MdFlag, MdLocationOn, MdLockOutline, MdOpenInNew,
  MdRefresh, MdSend, MdSync,
} from 'react-icons/md';
import { URL_API } from '../../repositories/baseAPI';
import { WorkspaceShell } from './MicrosoftWorkspace.styles';

export interface MicrosoftSource { sourceType:'microsoft_event'|'microsoft_mail'|'microsoft_teams'; sourceId:string; sourceUrl:string; }
export interface MicrosoftDraft {
  suggestion:any;
  analysis?:any;
  source:MicrosoftSource;
}
type Status = {
  configured:boolean; connected:boolean; migrationRequired?:boolean; email?:string;
  displayName?:string; status?:string; lastError?:string;
};
type EventItem = {
  id:string; subject:string; start:{dateTime:string;timeZone:string}; end:{dateTime:string;timeZone:string};
  location:string; organizer:{name:string;email:string}; attendees:{name:string;email:string}[];
  isAllDay:boolean; isOnlineMeeting:boolean; webLink:string; bodyPreview:string;
};
type MailItem = {
  id:string; subject:string; sender:{name:string;email:string}; receivedDateTime:string; isRead:boolean;
  recipients?:{name:string;email:string}[];
  hasAttachments:boolean; importance:string; flagStatus:string; webLink:string; bodyPreview:string; actionable:boolean;
  actionConfidence:number; suggestedAction:string; actionReasons:string[];
  mailboxLocation:string; actionDismissed:boolean;
};
type MailSummary = { total:number; unread:number; flagged:number; attachments:number; actionable:number };
type SnapshotResponse<T> = { items:T[]; lastSyncAt?:string; syncPending?:boolean; source?:string; summary?:MailSummary };

const dateTime = (value?:string, options?:Intl.DateTimeFormatOptions) => value
  ? new Date(value).toLocaleString('pt-BR', options || { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })
  : 'Horário não informado';

type RelatedActivity = { id:number; title:string; personName?:string; projectName?:string; status?:string };
const normalize = (value:unknown) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
const mailContact = (message:MailItem) => {
  const contact = message.mailboxLocation === 'sentitems' ? message.recipients?.[0] : message.sender;
  return contact?.name || contact?.email || (message.mailboxLocation === 'sentitems' ? 'Destinatário não informado' : 'Remetente não informado');
};

export default function MicrosoftWorkspace({mode,onDraft,onManageConnection,showManualActivity=true,activities=[]}:{mode:'agenda'|'emails';onDraft:(draft:MicrosoftDraft)=>void;onManageConnection?:()=>void;showManualActivity?:boolean;activities?:RelatedActivity[]}) {
  const [status,setStatus] = useState<Status|null>(null);
  const [events,setEvents] = useState<EventItem[]>([]);
  const [messages,setMessages] = useState<MailItem[]>([]);
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState('');
  const [error,setError] = useState('');
  const [agendaRange,setAgendaRange] = useState<'today'|'week'|'month'>('week');
  const [mailMode,setMailMode] = useState<'action'|'flagged'|'unread'|'sent'|'all'>('action');
  const [mailSummary,setMailSummary] = useState<MailSummary>({total:0,unread:0,flagged:0,attachments:0,actionable:0});
  const [mailSearch,setMailSearch] = useState('');
  const [lastSyncAt,setLastSyncAt] = useState('');
  const [syncPending,setSyncPending] = useState(false);
  const [explainId,setExplainId] = useState('');

  const visibleEvents = useMemo(() => {
    const now = new Date(); now.setHours(0,0,0,0);
    const end = new Date(now); end.setDate(end.getDate() + (agendaRange==='today'?1:agendaRange==='week'?7:31));
    return events.filter(event => { const start = new Date(event.start?.dateTime); return start >= now && start < end; });
  },[events,agendaRange]);
  const visibleMessages = useMemo(() => {
    const filtered=mailMode==='action' ? messages.filter(message=>message.actionable) : mailMode==='flagged' ? messages.filter(message=>message.flagStatus==='flagged') : mailMode==='unread' ? messages.filter(message=>!message.isRead) : mailMode==='sent' ? messages.filter(message=>message.mailboxLocation==='sentitems') : messages;
    const search=normalize(mailSearch);
    return search?filtered.filter(message=>normalize(`${message.subject} ${message.sender?.name} ${message.sender?.email} ${(message.recipients || []).map(person=>`${person.name} ${person.email}`).join(' ')} ${message.bodyPreview}`).includes(search)):filtered;
  },[messages,mailMode,mailSearch]);
  const related = (event:EventItem) => {
    const people = [event.organizer?.name,event.organizer?.email,...(event.attendees||[]).flatMap(person=>[person.name,person.email])].map(normalize).filter(Boolean);
    const subject = normalize(event.subject);
    return activities.filter(activity => !['done','cancelled'].includes(activity.status || '') && (
      (!!normalize(activity.personName) && people.some(person=>person.includes(normalize(activity.personName)) || normalize(activity.personName).includes(person))) ||
      (!!normalize(activity.projectName) && normalize(activity.projectName).length>=3 && subject.includes(normalize(activity.projectName)))
    )).slice(0,3);
  };

  const load = useCallback(async (forceRefresh=false) => {
    setLoading(true); setError('');
    try {
      const current = (await axios.get<Status>(`${URL_API}/microsoft/connection`)).data;
      setStatus(current);
      if (!current.connected) return;
      if (mode === 'agenda') {
        const start = new Date(); start.setHours(0,0,0,0);
        const end = new Date(start); end.setDate(end.getDate()+45);
        const data=(await axios.get<SnapshotResponse<EventItem>>(`${URL_API}/microsoft/calendar`,{params:{start:start.toISOString(),end:end.toISOString(),refresh:forceRefresh||undefined}})).data;
        setEvents(data.items || []);setLastSyncAt(data.lastSyncAt||'');setSyncPending(!!data.syncPending);
      } else {
        const data=(await axios.get<SnapshotResponse<MailItem>>(`${URL_API}/microsoft/messages`,{params:{mode:mailMode,limit:50,refresh:forceRefresh||undefined}})).data;
        setMessages(data.items || []);setMailSummary(data.summary || {total:0,unread:0,flagged:0,attachments:0,actionable:0});setLastSyncAt(data.lastSyncAt||'');setSyncPending(!!data.syncPending);
      }
    } catch (requestError:any) {
      setError(requestError.response?.data?.message || 'Não foi possível carregar o Microsoft 365.');
    } finally { setLoading(false); }
  },[mailMode,mode]);

  useEffect(()=>{ void load(); },[load]);

  const draft = async (sourceType:MicrosoftSource['sourceType'], sourceId:string) => {
    setBusy(sourceId); setError('');
    try { onDraft((await axios.post<MicrosoftDraft>(`${URL_API}/microsoft/activity-draft`,{sourceType,sourceId})).data); }
    catch (requestError:any) { setError(requestError.response?.data?.message || 'Não foi possível preparar a atividade.'); }
    finally { setBusy(''); }
  };

  const ignore = async (message:MailItem) => {
    setBusy(`ignore:${message.id}`); setError('');
    try {
      await axios.post(`${URL_API}/microsoft/messages/${encodeURIComponent(message.id)}/actions`,{action:'ignore'});
      setMessages(current=>current.map(item=>item.id===message.id?{...item,actionable:false,actionDismissed:true}:item));
      setExplainId(current=>current===message.id?'':current);
    } catch (requestError:any) {
      setError(requestError.response?.data?.message || 'Não foi possível ignorar este pedido de atenção.');
    } finally { setBusy(''); }
  };

  if (loading && !status) return <WorkspaceShell><section className="m365-state panel"><MdSync className="spin"/><h2>Sincronizando Microsoft 365…</h2></section></WorkspaceShell>;
  if (!status?.connected) return <WorkspaceShell><section className="m365-connect panel">
    <div className="m365-logo"><span>Microsoft</span><strong>365</strong></div>
    <div><span className="eyebrow">CONTA CORPORATIVA</span><h2>Traga sua rotina de trabalho para o Gaspar</h2><p>Consulte agenda e e-mails e transforme compromissos em atividades revisadas por você.</p>
      <ul><li><MdLockOutline/>Somente a sua conta conectada</li><li><MdEvent/>Agenda e e-mails em modo leitura</li><li><MdAdd/>Ao solicitar um rascunho, o item escolhido é analisado pela IA; nada é salvo sem sua confirmação</li></ul>
      {!status?.configured && <div className="m365-warning"><MdErrorOutline/>O administrador ainda precisa informar o Client ID, Tenant ID e segredo do aplicativo Microsoft Entra.</div>}
      {status?.migrationRequired && <div className="m365-warning"><MdErrorOutline/>A estrutura de dados da integração ainda precisa ser aplicada na API.</div>}
      {error && <div className="m365-warning"><MdErrorOutline/>{error}</div>}
      <button className="primary" disabled={!onManageConnection} onClick={onManageConnection}>Configurar conta corporativa</button>
    </div>
  </section></WorkspaceShell>;

  return <WorkspaceShell><section className="m365-workspace">
    <header className="m365-head panel"><div><span className="eyebrow">PROFISSIONAL · MICROSOFT 365</span><h2>{mode==='agenda'?'Minha agenda':'Caixa corporativa'}</h2><p>{status.displayName || status.email} · SQL Server · {lastSyncAt?`atualizado ${dateTime(lastSyncAt)}`:'sincronização inicial pendente'}</p></div><div><button className="secondary" onClick={()=>void load(true)}><MdRefresh/>Atualizar Microsoft</button>{onManageConnection&&<button className="m365-disconnect" onClick={onManageConnection}>Configurações</button>}</div></header>
    {error && <div className="m365-warning"><MdErrorOutline/>{error}</div>}
    {mode==='emails'&&<><section className="m365-metrics"><article><strong>{mailSummary.unread}</strong><span>Não lidos</span></article><article><strong>{mailSummary.flagged}</strong><span>Sinalizados</span></article><article><strong>{mailSummary.attachments}</strong><span>Anexos</span></article><article><strong>{mailSummary.actionable}</strong><span>Pedem ação</span></article></section><input className="m365-search" value={mailSearch} onChange={event=>setMailSearch(event.target.value)} placeholder="Buscar remetente, destinatário ou assunto"/></>}
    <div className="m365-filters">{mode==='agenda'?<><button className={agendaRange==='today'?'active':''} onClick={()=>setAgendaRange('today')}>Hoje</button><button className={agendaRange==='week'?'active':''} onClick={()=>setAgendaRange('week')}>7 dias</button><button className={agendaRange==='month'?'active':''} onClick={()=>setAgendaRange('month')}>30 dias</button></>:<><button className={mailMode==='action'?'active':''} onClick={()=>setMailMode('action')}>Pedem ação</button><button className={mailMode==='flagged'?'active':''} onClick={()=>setMailMode('flagged')}>Sinalizados</button><button className={mailMode==='unread'?'active':''} onClick={()=>setMailMode('unread')}>Não lidos</button><button className={mailMode==='sent'?'active':''} onClick={()=>setMailMode('sent')}>Enviados</button><button className={mailMode==='all'?'active':''} onClick={()=>setMailMode('all')}>Todos</button></>}</div>
    {loading && <div className="m365-loading"><MdSync className="spin"/>Atualizando…</div>}
    {!loading && mode==='agenda' && <div className="m365-list">{visibleEvents.map(event=>{const matches=related(event);return <article className="m365-card" key={event.id}>
      <div className="m365-date"><strong>{dateTime(event.start?.dateTime,{day:'2-digit'})}</strong><span>{dateTime(event.start?.dateTime,{month:'short'})}</span></div>
      <div className="m365-copy"><span className="eyebrow">{event.isOnlineMeeting?'REUNIÃO ONLINE':'COMPROMISSO'}</span><h3>{event.subject}</h3><div className="m365-meta"><span><MdAccessTime/>{event.isAllDay?'Dia inteiro':dateTime(event.start?.dateTime,{hour:'2-digit',minute:'2-digit'})}</span>{event.location&&<span><MdLocationOn/>{event.location}</span>}<span>{event.attendees?.length || 0} participantes</span></div>{event.bodyPreview&&<p>{event.bodyPreview}</p>}{matches.length>0&&<div className="m365-related"><b>{matches.length} {matches.length===1?'atividade relacionada':'atividades relacionadas'}</b>{matches.map(item=><span key={item.id}>{item.title}</span>)}</div>}</div>
      <div className="m365-actions">{showManualActivity&&<button disabled={busy===event.id} onClick={()=>void draft('microsoft_event',event.id)}><MdAdd/>{busy===event.id?'Preparando…':'Criar atividade'}</button>}{event.webLink&&<a href={event.webLink} target="_blank" rel="noreferrer"><MdOpenInNew/>Outlook</a>}</div>
    </article>})}{!visibleEvents.length&&<div className="m365-empty"><MdEvent/><h3>Nenhum compromisso neste período</h3></div>}</div>}
    {!loading && mode==='emails' && <div className="m365-list">{visibleMessages.map(message=><article className={`m365-card mail ${!message.isRead?'unread':''}`} key={message.id}>
      <div className="m365-mail-icon"><MdEmail/></div><div className="m365-copy"><span className="eyebrow">{mailContact(message)}</span><h3>{message.subject}</h3><div className="m365-meta"><span>{dateTime(message.receivedDateTime)}</span>{message.mailboxLocation==='archive'&&<span>Arquivado</span>}{message.mailboxLocation==='sentitems'&&<span><MdSend/>Enviado</span>}{message.flagStatus==='flagged'&&<span className="action"><MdFlag/>Sinalizado</span>}{message.hasAttachments&&<span><MdAttachFile/>Anexo</span>}{message.actionable&&<span className="action">Pede ação · {Math.round((message.actionConfidence||0)*100)}%</span>}</div>{message.bodyPreview&&<p>{message.bodyPreview}</p>}{explainId===message.id&&<div className="m365-explanation">{(message.actionReasons||[]).map(reason=><p key={reason}>{reason}</p>)}</div>}</div>
      <div className="m365-actions">{message.actionable&&<button disabled={busy===`ignore:${message.id}`} onClick={()=>void ignore(message)}>{busy===`ignore:${message.id}`?'Ignorando…':'Ignorar'}</button>}{showManualActivity&&<button disabled={busy===message.id} onClick={()=>void draft('microsoft_mail',message.id)}><MdAdd/>{busy===message.id?'Analisando…':'Criar atividade'}</button>}{message.webLink&&<a href={message.webLink} target="_blank" rel="noreferrer"><MdOpenInNew/>Outlook</a>}</div>
      <button className="m365-explain-button" aria-label="Explicar classificação" aria-expanded={explainId===message.id} onClick={()=>setExplainId(current=>current===message.id?'':message.id)}>?</button>
    </article>)}{!visibleMessages.length&&<div className="m365-empty"><MdEmail/><h3>{syncPending?'Sincronização inicial em andamento':mailMode==='sent'?'Nenhum e-mail enviado encontrado':'Nenhum e-mail neste filtro'}</h3></div>}</div>}
  </section></WorkspaceShell>;
}
