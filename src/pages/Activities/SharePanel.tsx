import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { URL_API } from '../../repositories/baseAPI';

interface Share { id:number; guestName:string; guestEmail:string; expiresAt:string; revokedAt:string|null; }
interface Event { id:number; actorName:string; eventType:string; detail:string; oldValue:string|null; newValue:string|null; createdAt:string; }

const when = (value:string) => new Date(value).toLocaleString('pt-BR', {dateStyle:'short',timeStyle:'short'});

const SharePanel:React.FC<{activityId:number; personName:string}> = ({activityId,personName}) => {
  const [shares,setShares] = useState<Share[]>([]);
  const [events,setEvents] = useState<Event[]>([]);
  const [name,setName] = useState(personName);
  const [email,setEmail] = useState('');
  const [link,setLink] = useState('');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');
  const load = async () => {
    const {data} = await axios.get(`${URL_API}/activities/${activityId}/shares`);
    setShares(data.shares || []); setEvents(data.events || []);
  };
  useEffect(()=>{setName(personName);setEmail('');setLink('');setError('');void load().catch(()=>setError('Não foi possível carregar os convites.'));},[activityId,personName]); // eslint-disable-line react-hooks/exhaustive-deps
  const invite = async () => {
    setBusy(true); setError(''); setMessage('');
    try {
      const {data} = await axios.post(`${URL_API}/activities/${activityId}/shares`,{name,email});
      setLink(data.link); setMessage(`Convite enviado para ${data.guestEmail}.`); setEmail('');
      await load();
    } catch (requestError:any) {setError(requestError.response?.data?.message || 'Não foi possível enviar o convite.');}
    finally {setBusy(false);}
  };
  const revoke = async (id:number) => {
    if (!window.confirm('Revogar este acesso? O link deixará de funcionar.')) return;
    setBusy(true); setError('');
    try {await axios.delete(`${URL_API}/activities/${activityId}/shares/${id}`);await load();}
    catch (requestError:any) {setError(requestError.response?.data?.message || 'Não foi possível revogar o acesso.');}
    finally {setBusy(false);}
  };
  return <section className="share-panel">
    <div className="share-heading"><strong>Compartilhar follow-up</strong><small>O convidado vê somente esta atividade e confirma o e-mail para atualizar.</small></div>
    <div className="share-fields"><label><span>Nome</span><input value={name} maxLength={120} onChange={event=>setName(event.target.value)} placeholder="Responsável"/></label><label><span>E-mail</span><input type="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="pessoa@empresa.com"/></label></div>
    <button type="button" className="secondary" disabled={busy||!name.trim()||!email.trim()} onClick={()=>void invite()}>{busy?'Aguarde…':'Enviar convite'}</button>
    {message&&<p className="share-success" role="status">{message}</p>}
    {error&&<p className="share-error" role="alert">{error}</p>}
    {link&&<div className="share-link"><span>Link individual criado</span><input aria-label="Link compartilhado" readOnly value={link}/><button type="button" onClick={()=>void navigator.clipboard.writeText(link)}>Copiar link</button></div>}
    {!!shares.length&&<div className="share-list"><strong>Acessos</strong>{shares.map(share=><div key={share.id}><span><b>{share.guestName}</b><small>{share.guestEmail} · {share.revokedAt?'Revogado':`Expira ${when(share.expiresAt)}`}</small></span>{!share.revokedAt&&<button type="button" disabled={busy} onClick={()=>void revoke(share.id)}>Revogar</button>}</div>)}</div>}
    <div className="share-events"><strong>Histórico do responsável</strong><button type="button" className="share-refresh" onClick={()=>void load().catch(()=>setError('Não foi possível atualizar o histórico.'))}>Atualizar histórico</button>{events.length?events.map(event=><article key={event.id}><b>{event.actorName}</b><time>{when(event.createdAt)}</time><p>{event.eventType==='completion_request'?'Solicitou conclusão: ':''}{event.detail}</p>{event.oldValue!==null&&<small>{event.oldValue} → {event.newValue}</small>}</article>):<small>Nenhuma atualização externa registrada.</small>}</div>
  </section>;
};

export default SharePanel;
