import React,{useCallback,useEffect,useMemo,useState} from 'react';
import axios from 'axios';
import {MdArrowForward,MdCheckCircle,MdInbox,MdRefresh,MdSchedule,MdWarning} from 'react-icons/md';
import SchedulingCard,{SchedulingAction} from '../../components/SchedulingCard';
import {URL_API} from '../../repositories/baseAPI';

type Filter='active'|'attention'|'approval';
const terminal=new Set(['confirmed','declined','cancelled','expired','failed']);
const approvalStates=new Set(['needs_contact','awaiting_initial_approval','awaiting_final_approval']);
const attentionStates=new Set(['needs_contact','paused','failed']);
const stateLabels:Record<string,string>={needs_contact:'Escolher contato',awaiting_initial_approval:'Aprovar início',initial_message_queued:'Mensagem na fila',negotiating:'Negociando',awaiting_final_approval:'Aprovar proposta final',final_message_queued:'Confirmação na fila',intervention_message_queued:'Intervenção na fila',paused:'Precisa de atenção',confirmed:'Confirmado',declined:'Recusado',cancelled:'Cancelado',expired:'Expirado',failed:'Falhou'};
const messageOf=(error:any,fallback:string)=>error?.response?.data?.message||fallback;
const idOf=(item:SchedulingAction)=>String(item.id||item.actionId||'');
const stateOf=(item:SchedulingAction)=>String(item.state||item.status||'');
const contactOf=(item:SchedulingAction)=>item.contact?.displayName||item.contactCandidates?.find(candidate=>String(candidate.id||candidate.contactId)===String(item.contactId||''))?.displayName||item.contactCandidates?.[0]?.displayName||'Contato a confirmar';
const timeOf=(item:SchedulingAction)=>String(item.updatedAt||item.createdAt||item.expiresAt||'');

export default function SchedulingInbox({requestedId}:{requestedId?:string|null}){
  const [items,setItems]=useState<SchedulingAction[]>([]);
  const [selected,setSelected]=useState<SchedulingAction>();
  const [filter,setFilter]=useState<Filter>('active');
  const [loading,setLoading]=useState(true);
  const [refreshing,setRefreshing]=useState(false);
  const [error,setError]=useState('');

  const load=useCallback(async(silent=false)=>{
    if(!silent)setRefreshing(true);
    setError('');
    try{
      const {data}=await axios.get(`${URL_API}/secretary/scheduling`,{params:{limit:100}});
      const next:Array<SchedulingAction>=data.items||data.scheduling||[];
      setItems(next);
      setSelected(current=>{
        const targetId=idOf(current||{})||requestedId||'';
        return targetId?next.find(item=>idOf(item)===targetId)||current:current;
      });
    }catch(cause){if(!silent)setError(messageOf(cause,'Não foi possível carregar os agendamentos da secretária.'))}
    finally{setLoading(false);if(!silent)setRefreshing(false)}
  },[requestedId]);

  useEffect(()=>{void load()},[load]);
  useEffect(()=>{const timer=window.setInterval(()=>{if(document.visibilityState==='visible')void load(true)},15000);return()=>window.clearInterval(timer)},[load]);
  useEffect(()=>{if(!requestedId||selected)return;const match=items.find(item=>idOf(item)===requestedId);if(match)setSelected(match)},[items,requestedId,selected]);

  const groups=useMemo(()=>({
    active:items.filter(item=>!terminal.has(stateOf(item))),
    attention:items.filter(item=>attentionStates.has(stateOf(item))||String(item.pauseReason||'').startsWith('outbound_')),
    approval:items.filter(item=>approvalStates.has(stateOf(item))),
  }),[items]);
  const visible=groups[filter];
  const updateItem=(next:SchedulingAction)=>{setSelected(next);setItems(current=>current.map(item=>idOf(item)===idOf(next)?next:item))};

  return <section className="scheduling-inbox">
    <header className="section-heading"><div><span>INBOX DA SECRETÁRIA</span><h2>Agendamentos pelo WhatsApp</h2><p>Acompanhe mandatos ativos e encontre rapidamente tudo que precisa da sua decisão.</p></div><button className="secondary-action" disabled={refreshing} onClick={()=>void load()}><MdRefresh/>{refreshing?'Atualizando…':'Atualizar'}</button></header>
    {error&&<div className="wa-banner error" role="alert">{error}</div>}
    <nav className="scheduling-filters" aria-label="Filtros dos agendamentos">
      <button className={filter==='active'?'active':''} onClick={()=>setFilter('active')}><MdSchedule/><span>Ativos<strong>{groups.active.length}</strong></span></button>
      <button className={filter==='attention'?'active attention':''} onClick={()=>setFilter('attention')}><MdWarning/><span>Precisam de atenção<strong>{groups.attention.length}</strong></span></button>
      <button className={filter==='approval'?'active approval':''} onClick={()=>setFilter('approval')}><MdCheckCircle/><span>Aguardando aprovação<strong>{groups.approval.length}</strong></span></button>
    </nav>
    <div className={`scheduling-workspace ${selected?'has-detail':''}`}><div className="scheduling-list" aria-busy={loading}>{loading?<div className="wa-empty">Carregando agendamentos…</div>:visible.map(item=>{const itemState=stateOf(item),itemId=idOf(item),needsAttention=attentionStates.has(itemState)||String(item.pauseReason||'').startsWith('outbound_');return <button key={itemId} className={idOf(selected||{})===itemId?'active':''} onClick={()=>setSelected(item)}><div className={`schedule-list-icon ${needsAttention?'attention':''}`}><MdInbox/></div><div><strong>{item.request||'Agendamento'}</strong><span>{contactOf(item)} · {needsAttention&&terminal.has(itemState)?'Verificar envio · ':''}{stateLabels[itemState]||itemState.replace(/_/g,' ')}</span>{timeOf(item)&&<time>{new Date(timeOf(item)).toLocaleString('pt-BR')}</time>}</div><MdArrowForward/></button>})}{!loading&&!visible.length&&<div className="wa-empty">Nenhum agendamento neste filtro.</div>}</div>
      {selected&&<div className="scheduling-detail"><button className="scheduling-back" onClick={()=>setSelected(undefined)}>Voltar para a lista</button><SchedulingCard action={selected} onChange={updateItem}/></div>}
    </div>
  </section>;
}
