import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { URL_API } from '../../repositories/baseAPI';
import { Page } from './styles';
import { captureShareToken, clearShareAccess, isShareAccessRejected, readShareSession, writeShareSession } from '../../utils/shareSession';

interface Subtask {id:number;title:string;isCompleted:boolean;}
interface Activity {title:string;notes:string;status:string;dueDate:string|null;projectName:string;subtasks:Subtask[];}
interface Event {actorName:string;eventType:string;detail:string;oldValue:string|null;newValue:string|null;createdAt:string;}
interface View {activity:Activity;guestName:string;events:Event[];}

const SharedActivity:React.FC = () => {
  const [token,setToken] = useState(()=>captureShareToken('activity-share'));
  const [session,setSession] = useState(()=>readShareSession('activity-share'));
  const [view,setView] = useState<View|null>(null);
  const [code,setCode] = useState('');
  const [comment,setComment] = useState('');
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [busy,setBusy] = useState(false);
  const invalidateAccess = useCallback(() => {
    clearShareAccess('activity-share');
    setSession('');
    setView(null);
    setToken('');
  },[]);

  const call = useCallback(async (path:string, method:'GET'|'POST', body?:object, key?:string) => {
    const response = await fetch(`${URL_API}/shared-activities${path}`,{
      method,cache:'no-store',referrerPolicy:'no-referrer',
      headers:{'Content-Type':'application/json','X-Share-Link':token,...(key?{'X-Share-Session':key}:{})},
      ...(body?{body:JSON.stringify(body)}:{}),
    });
    const data = await response.json().catch(()=>({}));
    if (!response.ok) throw Object.assign(new Error(data.message||'Não foi possível concluir a operação.'),{status:response.status});
    return data;
  },[token]);
  const load = useCallback(async (key:string) => {
    try {setView(await call('/activity','GET',undefined,key));setError('');}
    catch (failure:any) {
      if (isShareAccessRejected(failure.status)) invalidateAccess();
      else setError(failure.message);
    }
  },[call,invalidateAccess]);
  useEffect(()=>{if(session) void load(session);},[session,load]);
  const sendCode = async () => {
    setBusy(true);setError('');setNotice('');
    try {const data=await call('/code','POST');setNotice(data.message);}
    catch (failure:any) {if(isShareAccessRejected(failure.status))invalidateAccess();else setError(failure.message);}
    finally {setBusy(false);}
  };
  const verify = async (event:FormEvent) => {
    event.preventDefault();setBusy(true);setError('');
    try {const data=await call('/verify','POST',{code});writeShareSession('activity-share',data.session);setSession(data.session);setCode('');}
    catch (failure:any) {if(isShareAccessRejected(failure.status))invalidateAccess();else setError(failure.message);}
    finally {setBusy(false);}
  };
  const update = async (payload:object) => {
    setBusy(true);setError('');setNotice('');
    try {setView(await call('/activity','POST',payload,session));setComment('');setNotice('Atualização registrada.');}
    catch (failure:any) {if(isShareAccessRejected(failure.status))invalidateAccess();else setError(failure.message);}
    finally {setBusy(false);}
  };
  const activity=view?.activity;
  const closed=activity?.status==='done'||activity?.status==='cancelled';
  if(!token)return <Page><main><header><span className="brand">✦ Gaspar</span><small>ATIVIDADE COMPARTILHADA</small></header><section className="card access"><h1>Link inválido ou incompleto</h1><p>Solicite um novo convite ao responsável pela atividade.</p></section></main></Page>;
  return <Page>
    <main><header><span className="brand">✦ Gaspar</span><small>ATIVIDADE COMPARTILHADA</small></header>
      {!view ? <section className="card access"><h1>Acesse sua atividade</h1><p>Este link dá acesso somente a uma atividade. Para proteger as informações, confirme seu e-mail com um código.</p><button disabled={busy} onClick={()=>void sendCode()}>{busy?'Enviando…':'Enviar código por e-mail'}</button><form onSubmit={verify}><label htmlFor="share-code">Código de seis dígitos</label><input id="share-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,''))} placeholder="000000"/><button disabled={busy||code.length!==6}>Confirmar e abrir</button></form></section>
      : <><section className="card hero"><span className="eyebrow">OLÁ, {view.guestName.toUpperCase()}</span><h1>{activity?.title}</h1><p>{activity?.notes||'Sem descrição adicional.'}</p><div className="chips"><span>{activity?.projectName||'Follow-up'}</span><span>{activity?.dueDate?`Prazo: ${new Date(`${activity.dueDate}T12:00:00`).toLocaleDateString('pt-BR')}`:'Sem prazo'}</span><span>{activity?.status==='doing'?'Em andamento':activity?.status==='waiting'?'Aguardando':closed?'Encerrada':'Pendente'}</span></div></section>
        {!closed&&<section className="card"><h2>Atualizar andamento</h2><div className="actions"><button disabled={busy||activity?.status==='doing'} onClick={()=>void update({kind:'status',status:'doing'})}>Em andamento</button><button disabled={busy||activity?.status==='waiting'} onClick={()=>void update({kind:'status',status:'waiting'})}>Aguardando</button></div><textarea value={comment} maxLength={2000} onChange={event=>setComment(event.target.value)} placeholder="O que mudou? Qual é o próximo passo?" rows={4}/><div className="actions"><button disabled={busy||!comment.trim()} onClick={()=>void update({kind:'comment',text:comment})}>Registrar atualização</button><button className="outline" disabled={busy||!comment.trim()} onClick={()=>void update({kind:'completion_request',text:comment})}>Solicitar conclusão</button></div></section>}
        {!!activity?.subtasks.length&&<section className="card"><h2>Etapas</h2><div className="steps">{activity.subtasks.map(step=><label key={step.id}><input type="checkbox" checked={step.isCompleted} disabled={busy||closed} onChange={event=>void update({kind:'subtask',subtaskId:step.id,isCompleted:event.target.checked})}/><span>{step.title}</span></label>)}</div></section>}
        <section className="card"><h2>Histórico</h2>{view.events.length?view.events.map((event,index)=><article className="event" key={index}><b>{event.actorName}</b><time>{new Date(event.createdAt).toLocaleString('pt-BR')}</time><p>{event.eventType==='completion_request'?'Pediu conclusão: ':''}{event.detail}</p>{event.oldValue!==null&&<small>{event.oldValue} → {event.newValue}</small>}</article>):<p>Nenhuma atualização registrada.</p>}</section>
      </>}
      {notice&&<p role="status" className="notice">{notice}</p>}{error&&<p role="alert" className="error">{error}</p>}
      <footer>Seu acesso é individual. Não encaminhe este link.</footer>
    </main>
  </Page>;
};

export default SharedActivity;
