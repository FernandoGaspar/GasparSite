import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { MdClose, MdContentCopy, MdPersonAdd, MdRefresh } from 'react-icons/md';
import { URL_API } from '../../repositories/baseAPI';

interface Candidate { id:number; title:string; status:string; assigneeId:number|null; }
interface Share { id:number; guestName:string; guestEmail:string; expiresAt:string; revokedAt:string|null; }
interface Event { id:number; activityTitle:string; actorName:string; eventType:string; detail:string; oldValue:string|null; newValue:string|null; createdAt:string; }

const when = (value:string) => new Date(value).toLocaleString('pt-BR', {dateStyle:'short',timeStyle:'short'});
const errorMessage = (error:any) => error.response?.data?.message || 'Não foi possível concluir. Tente novamente.';

const PersonSharePanel:React.FC<{
  name:string; personId:number|null; email:string; activities:Candidate[];
  onClose:()=>void; onChanged:()=>void; onPersonCreated:(id:number)=>void;
}> = ({name,personId,email:initialEmail,activities,onClose,onChanged,onPersonCreated}) => {
  const [currentPersonId,setCurrentPersonId] = useState(personId);
  const [email,setEmail] = useState(initialEmail);
  const [selected,setSelected] = useState<number[]>(()=>activities.filter(item=>!personId || !item.assigneeId).map(item=>item.id));
  const [shares,setShares] = useState<Share[]>([]);
  const [events,setEvents] = useState<Event[]>([]);
  const [link,setLink] = useState('');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');
  const linked = useMemo(()=>activities.filter(item=>item.assigneeId===currentPersonId && !!currentPersonId),[activities,currentPersonId]);
  const unlinked = useMemo(()=>activities.filter(item=>!item.assigneeId),[activities]);
  const inviteIds = [...linked.map(item=>item.id),...unlinked.filter(item=>selected.includes(item.id)).map(item=>item.id)];

  const loadAccess = async (id:number) => {
    const {data} = await axios.get(`${URL_API}/activity-people/${id}/shares`);
    setShares(data.shares || []); setEvents(data.events || []);
  };
  useEffect(()=>{if(personId)void loadAccess(personId).catch(()=>setError('Não foi possível carregar os acessos.'));},[personId]);

  const invite = async () => {
    setBusy(true);setError('');setMessage('');setLink('');
    try {
      const {data} = await axios.post(`${URL_API}/activity-people/shares`,{name,email,activityIds:inviteIds});
      setCurrentPersonId(data.personId);setEmail(data.guestEmail);setLink(data.link);
      onPersonCreated(data.personId);
      setMessage(`Convite enviado para ${data.guestEmail}. ${data.activityCount} atividades vinculadas.`);
      await loadAccess(data.personId);onChanged();
    } catch (failure:any) {setError(errorMessage(failure));}
    finally {setBusy(false);}
  };
  const attach = async () => {
    if (!currentPersonId) return;
    setBusy(true);setError('');setMessage('');
    try {
      const ids = unlinked.filter(item=>selected.includes(item.id)).map(item=>item.id);
      await axios.post(`${URL_API}/activity-people/${currentPersonId}/assignments`,{activityIds:ids});
      setMessage(`${ids.length} atividades incluídas na lista de ${name}.`);setSelected([]);onChanged();
    } catch (failure:any) {setError(errorMessage(failure));}
    finally {setBusy(false);}
  };
  const revoke = async (id:number) => {
    if (!currentPersonId || !window.confirm('Revogar este acesso? O link deixará de funcionar.')) return;
    setBusy(true);setError('');
    try {await axios.delete(`${URL_API}/activity-people/${currentPersonId}/shares/${id}`);await loadAccess(currentPersonId);setMessage('Acesso revogado.');}
    catch (failure:any) {setError(errorMessage(failure));}
    finally {setBusy(false);}
  };
  return <div className="overlay person-share-overlay" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}>
    <section className="composer person-share-dialog" role="dialog" aria-modal="true" aria-label={`Compartilhar atividades de ${name}`}>
      <header><div><span>ACESSO POR PESSOA</span><h2>Compartilhar atividades de {name}</h2></div><button type="button" onClick={onClose} aria-label="Fechar"><MdClose/></button></header>
      <p className="person-share-intro">O convite dá acesso à lista vinculada a esta pessoa, não apenas a uma atividade. Só o e-mail confirmado poderá abrir e atualizar a lista.</p>
      <label className="person-share-email"><span>E-mail do responsável</span><input type="email" value={email} readOnly={!!currentPersonId} onChange={event=>setEmail(event.target.value)} placeholder="pessoa@empresa.com"/></label>
      {currentPersonId&&<p className="person-share-hint">Para evitar misturar pessoas com o mesmo nome, este cadastro está vinculado ao e-mail acima.</p>}
      <div className="person-share-preview"><strong>Atividades na lista</strong><small>{linked.length} já vinculadas · {unlinked.length} ainda sem vínculo</small>
        {activities.map(item=><label key={item.id} className="person-share-candidate"><input type="checkbox" checked={item.assigneeId===currentPersonId && !!currentPersonId ? true : selected.includes(item.id)} disabled={!!item.assigneeId || busy} onChange={event=>setSelected(current=>event.target.checked?[...current,item.id]:current.filter(id=>id!==item.id))}/><span>{item.title}<small>{item.assigneeId?'Já vinculada':'Incluir no acesso'} · {item.status==='done'?'Concluída':'Em aberto'}</small></span></label>)}
      </div>
      <div className="person-share-actions"><button type="button" className="primary" disabled={busy||!email.trim()||!inviteIds.length} onClick={()=>void invite()}><MdPersonAdd/>{busy?'Aguarde…':currentPersonId?'Enviar novo convite':'Compartilhar lista'}</button>{!!currentPersonId&&!!unlinked.filter(item=>selected.includes(item.id)).length&&<button type="button" className="secondary" disabled={busy} onClick={()=>void attach()}>Incluir sem reenviar convite</button>}</div>
      {link&&<div className="share-link"><span>Link individual do convite</span><input readOnly value={link} aria-label="Link compartilhado"/><button type="button" onClick={()=>void navigator.clipboard.writeText(link)}><MdContentCopy/> Copiar</button></div>}
      {message&&<p className="share-success" role="status">{message}</p>}{error&&<p className="share-error" role="alert">{error}</p>}
      {!!currentPersonId&&<div className="share-list"><strong>Acessos</strong>{shares.length?shares.map(share=><div key={share.id}><span><b>{share.guestName}</b><small>{share.guestEmail} · {share.revokedAt?'Revogado':`Expira ${when(share.expiresAt)}`}</small></span>{!share.revokedAt&&<button type="button" disabled={busy} onClick={()=>void revoke(share.id)}>Revogar</button>}</div>):<small>Nenhum convite ativo.</small>}</div>}
      {!!currentPersonId&&<div className="share-events"><strong>Histórico de alterações</strong><button type="button" className="share-refresh" onClick={()=>void loadAccess(currentPersonId).catch(()=>setError('Não foi possível atualizar o histórico.'))}><MdRefresh/> Atualizar</button>{events.length?events.map(event=><article key={event.id}><b>{event.actorName} · {event.activityTitle}</b><time>{when(event.createdAt)}</time><p>{event.eventType==='completion_request'?'Pediu conclusão: ':''}{event.detail}</p>{event.oldValue!==null&&<small>{event.oldValue} → {event.newValue}</small>}</article>):<small>Nenhuma alteração recebida.</small>}</div>}
    </section>
  </div>;
};

export default PersonSharePanel;
