import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { URL_API } from '../../repositories/baseAPI';
import { Page } from '../SharedActivity/styles';
import { captureShareToken, clearShareAccess, isShareAccessRejected, readShareSession, writeShareSession } from '../../utils/shareSession';

interface Subtask {id:number;title:string;isCompleted:boolean;}
interface Activity {id:number;title:string;notes:string;itemType:string;status:string;dueDate:string|null;projectName:string;subtasks:Subtask[];subtaskSummary:{total:number;completed:number};}
interface Event {activityId:number;actorName:string;eventType:string;detail:string;oldValue:string|null;newValue:string|null;createdAt:string;}
interface View {person:{name:string;email:string};activities:Activity[];events:Event[];}

const Workspace = styled(Page)`
  main{max-width:830px}.summary{display:flex;align-items:baseline;justify-content:space-between;gap:15px}.summary p{margin:0;color:#aebcd0}.activity-list{display:grid;gap:12px}.activity-list .card{margin:0}.activity-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.activity-top h2{margin:7px 0 5px;font-size:19px}.activity-top small{color:#99abc5}.activity-top button{flex:0 0 auto}.activity-detail{border-top:1px solid #33415b;margin-top:17px;padding-top:18px}.activity-detail>p{margin:0 0 14px}.activity-detail .steps{margin:14px 0}.activity-detail .event{margin-top:14px}.activity-detail .event p{margin:5px 0}.toolbar{display:flex;gap:8px;justify-content:flex-end;margin-bottom:14px}.muted{color:#9eacc3;font-size:13px}.empty{text-align:center;padding:28px;color:#9eacc3}
  @media(max-width:560px){.summary,.activity-top{align-items:flex-start;flex-direction:column}.activity-top button{width:100%}}
`;

const statusLabel = (value:string) => ({inbox:'Entrada',next:'Pendente',doing:'Em andamento',waiting:'Aguardando',done:'Concluída',cancelled:'Cancelada'} as Record<string,string>)[value] || value;
const dateLabel = (value:string|null) => value ? new Date(`${value.slice(0,10)}T12:00:00`).toLocaleDateString('pt-BR') : 'Sem prazo';

const AssignedActivities:React.FC = () => {
  const [token,setToken] = useState(()=>captureShareToken('person-share'));
  const [session,setSession] = useState(()=>readShareSession('person-share'));
  const [view,setView] = useState<View|null>(null);
  const [expandedId,setExpandedId] = useState<number|null>(null);
  const [code,setCode] = useState('');
  const [comment,setComment] = useState('');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const invalidateAccess = useCallback(() => {
    clearShareAccess('person-share');
    setSession('');
    setView(null);
    setToken('');
  },[]);

  const call = useCallback(async (path:string,method:'GET'|'POST',body?:object,key?:string) => {
    const response = await fetch(`${URL_API}/shared-people${path}`,{
      method,cache:'no-store',referrerPolicy:'no-referrer',
      headers:{'Content-Type':'application/json','X-Share-Link':token,...(key?{'X-Share-Session':key}:{})},
      ...(body?{body:JSON.stringify(body)}:{}),
    });
    const data = await response.json().catch(()=>({}));
    if(!response.ok) throw Object.assign(new Error(data.message||'Não foi possível concluir a operação.'),{status:response.status});
    return data;
  },[token]);
  const load = useCallback(async (key:string) => {
    try {setView(await call('/activities','GET',undefined,key));setError('');}
    catch (failure:any) {
      if(isShareAccessRejected(failure.status))invalidateAccess();
      else setError(failure.message);
    }
  },[call,invalidateAccess]);
  useEffect(()=>{if(session)void load(session);},[session,load]);
  useEffect(()=>{
    if(!session) return;
    const timer=window.setInterval(()=>{if(document.visibilityState==='visible')void load(session);},30000);
    return ()=>window.clearInterval(timer);
  },[session,load]);
  const sendCode = async () => {
    setBusy(true);setError('');setNotice('');
    try {const data=await call('/code','POST');setNotice(data.message);}
    catch(failure:any){if(isShareAccessRejected(failure.status))invalidateAccess();else setError(failure.message);}
    finally{setBusy(false);}
  };
  const verify = async (event:FormEvent) => {
    event.preventDefault();setBusy(true);setError('');
    try {const data=await call('/verify','POST',{code});writeShareSession('person-share',data.session);setSession(data.session);setCode('');}
    catch(failure:any){if(isShareAccessRejected(failure.status))invalidateAccess();else setError(failure.message);}
    finally{setBusy(false);}
  };
  const update = async (activityId:number,payload:object) => {
    setBusy(true);setError('');setNotice('');
    try {setView(await call(`/activities/${activityId}`,'POST',payload,session));setComment('');setNotice('Atualização registrada e enviada ao responsável.');}
    catch(failure:any){if(isShareAccessRejected(failure.status))invalidateAccess();else setError(failure.message);}
    finally{setBusy(false);}
  };
  const openItems=view?.activities.filter(item=>!['done','cancelled'].includes(item.status)) || [];
  const closedItems=view?.activities.filter(item=>['done','cancelled'].includes(item.status)) || [];
  const renderActivity=(activity:Activity) => {
    const expanded=expandedId===activity.id;
    const closed=['done','cancelled'].includes(activity.status);
    return <article className="card" key={activity.id}>
      <div className="activity-top"><div><span className="eyebrow">{activity.projectName||'ATIVIDADE'}</span><h2>{activity.title}</h2><small>{dateLabel(activity.dueDate)} · {statusLabel(activity.status)} · {activity.subtaskSummary.completed}/{activity.subtaskSummary.total} etapas</small></div><button className="outline" onClick={()=>{setExpandedId(expanded?null:activity.id);setComment('');}}>{expanded?'Fechar':'Ver e atualizar'}</button></div>
      {expanded&&<div className="activity-detail"><p>{activity.notes||'Sem descrição adicional.'}</p>
        {!closed&&<><div className="actions"><button disabled={busy||activity.status==='doing'} onClick={()=>void update(activity.id,{kind:'status',status:'doing'})}>Em andamento</button><button disabled={busy||activity.status==='waiting'} onClick={()=>void update(activity.id,{kind:'status',status:'waiting'})}>Aguardando</button></div><textarea value={comment} maxLength={2000} onChange={event=>setComment(event.target.value)} placeholder="O que mudou? Qual é o próximo passo?" rows={3}/><div className="actions"><button disabled={busy||!comment.trim()} onClick={()=>void update(activity.id,{kind:'comment',text:comment})}>Registrar atualização</button><button className="outline" disabled={busy||!comment.trim()} onClick={()=>void update(activity.id,{kind:'completion_request',text:comment})}>Pedir conclusão</button></div></>}
        {!!activity.subtasks.length&&<div className="steps">{activity.subtasks.map(step=><label key={step.id}><input type="checkbox" checked={step.isCompleted} disabled={busy||closed} onChange={event=>void update(activity.id,{kind:'subtask',subtaskId:step.id,isCompleted:event.target.checked})}/><span>{step.title}</span></label>)}</div>}
        <h3>Histórico desta atividade</h3>{view?.events.filter(event=>event.activityId===activity.id).map((event,index)=><div className="event" key={index}><b>{event.actorName}</b><time>{new Date(event.createdAt).toLocaleString('pt-BR')}</time><p>{event.eventType==='completion_request'?'Pediu conclusão: ':''}{event.detail}</p>{event.oldValue!==null&&<small>{event.oldValue} → {event.newValue}</small>}</div>)}
      </div>}
    </article>;
  };
  if(!token)return <Workspace><main><header><span className="brand">✦ Gaspar</span><small>MINHAS ATIVIDADES</small></header><section className="card access"><h1>Link inválido ou incompleto</h1><p>Solicite um novo convite ao responsável pelas atividades.</p></section></main></Workspace>;
  return <Workspace><main><header><span className="brand">✦ Gaspar</span><small>MINHAS ATIVIDADES</small></header>
    {!view?<section className="card access"><h1>Acesse suas atividades</h1><p>Este convite é individual. Confirme seu e-mail com um código para visualizar e atualizar a lista atribuída a você.</p><button disabled={busy} onClick={()=>void sendCode()}>{busy?'Enviando…':'Enviar código por e-mail'}</button><form onSubmit={verify}><label htmlFor="person-share-code">Código de seis dígitos</label><input id="person-share-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,''))} placeholder="000000"/><button disabled={busy||code.length!==6}>Confirmar e abrir</button></form></section>
      : <><section className="card summary"><div><span className="eyebrow">ACOMPANHAMENTO COMPARTILHADO</span><h1>Olá, {view.person.name}</h1><p>{openItems.length} em aberto · {closedItems.length} concluídas</p></div></section><div className="toolbar"><button className="outline" disabled={busy} onClick={()=>void load(session)}>Atualizar lista</button></div><div className="activity-list">{openItems.map(renderActivity)}{!openItems.length&&<div className="card empty">Nenhuma atividade em aberto no momento.</div>}{!!closedItems.length&&<h2>Concluídas</h2>}{closedItems.map(renderActivity)}</div></>}
    {notice&&<p role="status" className="notice">{notice}</p>}{error&&<p role="alert" className="error">{error}</p>}
    <footer>Somente atividades vinculadas a este responsável aparecem aqui. Não encaminhe o link.</footer>
  </main></Workspace>;
};

export default AssignedActivities;
