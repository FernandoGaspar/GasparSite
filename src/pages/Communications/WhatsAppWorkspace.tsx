import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { FaWhatsapp } from 'react-icons/fa';
import { MdCheckCircle, MdClose, MdContacts, MdCreate, MdForum, MdRefresh, MdSchedule, MdSearch, MdSend, MdTune } from 'react-icons/md';
import { URL_API } from '../../repositories/baseAPI';
import { createIdempotencyKey } from '../../utils/idempotency';
import { WhatsAppArea } from './whatsappStyles';
import ContactManager, { CanonicalContact } from './ContactManager';
import SecretaryStylePanel from './SecretaryStylePanel';
import SchedulingInbox from './SchedulingInbox';
import {SchedulingAction} from '../../components/SchedulingCard';

export type WhatsAppDraft = { suggestion:any; analysis?:any; source:{sourceType:'whatsapp';sourceId:string;sourceUrl?:string} };
type Status={configured:boolean;connected:boolean;allowSend:boolean;groupsEnabled:boolean;gatewayState:string;phoneNumber?:string;displayName?:string;lastError?:string};
type Conversation={id:string;title:string;isGroup:boolean;preview:string;lastMessageAt?:string;unreadCount:number;messageCount:number;contactId?:string;contact?:CanonicalContact;canonicalContact?:CanonicalContact;address?:string;phoneNumber?:string};
type Message={id:string;direction:'inbound'|'outbound';senderName:string;messageType:string;text:string;occurredAt:string;mediaFileName?:string};
type ManualOutboundAttention={type:'whatsapp_manual_outbound_attention';id:string;commandId:string;chatId:string;messagePreview:string;state:string;isBlocking:boolean;version:number;messageId?:string;lastError?:string;createdAt?:string;updatedAt?:string};
const blockingPauseReasons=new Set(['outbound_outcome_unknown','outbound_sent_after_state_changed']);
const manualAttentionErrorCodes=new Set(['outcome_unknown','snapshot_pending','manual_attention_pending']);
const messageOf=(error:any,fallback:string)=>error?.response?.data?.message||fallback;
const errorCodeOf=(error:any)=>String(error?.response?.data?.code||'');
const normalizedWhatsAppIdentity=(value?:string)=>{
  const raw=String(value||'').trim().toLocaleLowerCase();
  if(!raw)return '';
  if(!raw.includes('@')){
    const digits=raw.replace(/\D/g,'');
    return digits.length>=10&&digits.length<=15?`${digits}@s.whatsapp.net`:raw;
  }
  const [localPart,...domainParts]=raw.split('@');
  const normalizedLocal=localPart.replace(/:\d+$/,'');
  return `${normalizedLocal}@${domainParts.join('@')}`;
};
export const sameWhatsAppIdentity=(left?:string,right?:string)=>{
  const leftIdentity=normalizedWhatsAppIdentity(left),rightIdentity=normalizedWhatsAppIdentity(right);
  return !!leftIdentity&&!!rightIdentity&&leftIdentity===rightIdentity;
};
const manualSendFingerprint=(chatId:string,text:string)=>`${normalizedWhatsAppIdentity(chatId)}\0${text}`;
const clearManualSendAttemptsForChat=(attempts:Map<string,string>,chatId:string)=>{const prefix=`${normalizedWhatsAppIdentity(chatId)}\0`;for(const fingerprint of Array.from(attempts.keys()))if(fingerprint.startsWith(prefix))attempts.delete(fingerprint)};

export default function WhatsAppWorkspace({initialView,onDraft,onManageConnection}:{initialView?:'conversations'|'scheduling'|'contacts'|'style';onDraft:(draft:WhatsAppDraft)=>void;onManageConnection:()=>void}){
  const query=useMemo(()=>new URLSearchParams(window.location.search),[]);
  const requestedChatId=query.get('chatId');
  const requestedSchedulingId=query.get('schedulingId');
  const [status,setStatus]=useState<Status>(); const [items,setItems]=useState<Conversation[]>([]);
  const [selected,setSelected]=useState<Conversation>(); const [messages,setMessages]=useState<Message[]>([]);
  const [view,setView]=useState<'conversations'|'scheduling'|'contacts'|'style'>(requestedSchedulingId||query.get('section')==='scheduling'?'scheduling':query.get('section')==='contacts'?'contacts':query.get('section')==='style'?'style':initialView||'conversations');
  const [schedulingFocusId,setSchedulingFocusId]=useState<string|null>(requestedSchedulingId);
  const [schedulingAttention,setSchedulingAttention]=useState<SchedulingAction[]>([]);
  const [schedulingAttentionLoading,setSchedulingAttentionLoading]=useState(true);
  const [schedulingAttentionError,setSchedulingAttentionError]=useState('');
  const [manualAttentions,setManualAttentions]=useState<ManualOutboundAttention[]>([]);
  const [manualAttentionLoading,setManualAttentionLoading]=useState(true);
  const [manualAttentionError,setManualAttentionError]=useState('');
  const [contacts,setContacts]=useState<CanonicalContact[]>([]); const [contactsLoading,setContactsLoading]=useState(true);
  const [contactsError,setContactsError]=useState('');
  const [search,setSearch]=useState(''); const [reply,setReply]=useState(''); const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(''); const [error,setError]=useState(''); const [notice,setNotice]=useState('');
  const manualSendAttempts=useRef<Map<string,string>>(new Map());
  const manualAcknowledgeAttempts=useRef<Map<string,string>>(new Map());
  const loadSchedulingAttention=useCallback(async(silent=false)=>{if(!silent)setSchedulingAttentionLoading(true);try{const {data}=await axios.get(`${URL_API}/secretary/scheduling`,{params:{limit:300}});const scheduling:Array<SchedulingAction>=data.items||data.scheduling||[];setSchedulingAttention(scheduling.filter(item=>blockingPauseReasons.has(String(item.pauseReason||''))));setSchedulingAttentionError('')}catch(cause){setSchedulingAttentionError(messageOf(cause,'Não foi possível verificar os envios pendentes de conferência.'))}finally{if(!silent)setSchedulingAttentionLoading(false)}},[]);
  const loadManualAttentions=useCallback(async(silent=false)=>{if(!silent)setManualAttentionLoading(true);try{const {data}=await axios.get(`${URL_API}/whatsapp/outbound-attentions`);const attentions:Array<ManualOutboundAttention>=data.items||[];setManualAttentions(attentions.filter(item=>item.type==='whatsapp_manual_outbound_attention'&&item.isBlocking));setManualAttentionError('')}catch(cause){setManualAttentionError(messageOf(cause,'Não foi possível verificar os envios manuais pendentes de conferência.'))}finally{if(!silent)setManualAttentionLoading(false)}},[]);
  const refreshLive=useCallback(async()=>{try{const {data}=await axios.get<Status>(`${URL_API}/whatsapp/connection`,{params:{live:true}});setStatus(data)}catch{/* Os dados salvos continuam disponíveis quando o gateway está temporariamente indisponível. */}},[]);
  const loadContacts=useCallback(async()=>{setContactsLoading(true);setContactsError('');try{const {data}=await axios.get(`${URL_API}/contacts`);setContacts(data.contacts||data.items||[])}catch(cause){setContactsError(messageOf(cause,'Não foi possível carregar os contatos.'));throw cause}finally{setContactsLoading(false)}},[]);
  const load=useCallback(async()=>{setLoading(true);setError('');try{const [connection,conversations]=await Promise.all([axios.get<Status>(`${URL_API}/whatsapp/connection`,{params:{live:false}}),axios.get(`${URL_API}/whatsapp/conversations`,{params:{limit:100,search}})]);setStatus(connection.data);setItems(conversations.data.items||[]);window.setTimeout(()=>void refreshLive(),0)}catch(cause){setError(messageOf(cause,'Não foi possível carregar as conversas salvas do WhatsApp.'))}finally{setLoading(false)}},[search,refreshLive]);
  useEffect(()=>{void load()},[load]);
  useEffect(()=>{void loadContacts().catch(()=>{/* A área de conversas continua disponível sem a agenda canônica. */})},[loadContacts]);
  useEffect(()=>{if(view!=='conversations')return undefined;void loadSchedulingAttention();void loadManualAttentions();const timer=window.setInterval(()=>{if(document.visibilityState==='visible'){void loadSchedulingAttention(true);void loadManualAttentions(true)}},15000);return()=>window.clearInterval(timer)},[loadManualAttentions,loadSchedulingAttention,view]);
  const open=useCallback(async(item:Conversation)=>{setSelected(item);setBusy('thread');setError('');try{const {data}=await axios.get(`${URL_API}/whatsapp/conversations/${encodeURIComponent(item.id)}/messages`,{params:{limit:160}});setMessages(data.items||[]);setItems(current=>current.map(value=>value.id===item.id?{...value,unreadCount:0}:value))}catch(cause){setError(messageOf(cause,'Não foi possível abrir a conversa.'))}finally{setBusy('')}},[]);
  useEffect(()=>{if(!requestedChatId||selected||!items.length)return;const match=items.find(item=>item.id===requestedChatId);if(match)void open(match)},[items,open,requestedChatId,selected]);
  const blockingMandate=useMemo(()=>selected?schedulingAttention.find(item=>{const chatId=String(item.chatId||item.conversationId||'');return !!chatId&&sameWhatsAppIdentity(chatId,selected.id)}):undefined,[schedulingAttention,selected]);
  const blockingManualAttention=useMemo(()=>selected?manualAttentions.find(item=>item.isBlocking&&sameWhatsAppIdentity(item.chatId,selected.id)):undefined,[manualAttentions,selected]);
  const attentionLoading=schedulingAttentionLoading||manualAttentionLoading;
  const attentionError=manualAttentionError||schedulingAttentionError;
  const composerBlocked=attentionLoading||!!attentionError||!!blockingMandate||!!blockingManualAttention;
  const send=async()=>{const text=reply.trim();if(!selected||!text||composerBlocked||!window.confirm(`Enviar esta mensagem para ${displayName(selected)}?`))return;const fingerprint=manualSendFingerprint(selected.id,text);let key=manualSendAttempts.current.get(fingerprint);if(!key){key=createIdempotencyKey('whatsapp-manual-send');manualSendAttempts.current.set(fingerprint,key)}setBusy('send');setError('');try{await axios.post(`${URL_API}/whatsapp/messages`,{chatId:selected.id,text,confirmed:true},{headers:{'Idempotency-Key':key}});manualSendAttempts.current.delete(fingerprint);setReply('');setNotice('Mensagem enviada após sua confirmação.');await open(selected)}catch(cause){const code=errorCodeOf(cause);setError(manualAttentionErrorCodes.has(code)?'O resultado deste envio precisa ser conferido na conversa antes de qualquer nova mensagem.':messageOf(cause,'Não foi possível enviar a mensagem. Tente novamente sem alterar o texto para consultar o mesmo envio com segurança.'));if(manualAttentionErrorCodes.has(code))await loadManualAttentions()}finally{setBusy('')}};
  const acknowledgeManualAttention=async()=>{const attention=blockingManualAttention;if(!attention||busy||!window.confirm('Confirme somente depois de conferir na conversa se a mensagem chegou. Marcar esta atenção como conferida não envia uma nova mensagem.'))return;const commandId=String(attention.commandId||attention.id);let key=manualAcknowledgeAttempts.current.get(commandId);if(!key){key=createIdempotencyKey('whatsapp-manual-attention-ack');manualAcknowledgeAttempts.current.set(commandId,key)}setBusy(`manual-ack:${commandId}`);setError('');try{const {data}=await axios.post(`${URL_API}/whatsapp/outbound-attentions/${encodeURIComponent(commandId)}/acknowledge`,{confirmed:true,expectedVersion:attention.version},{headers:{'Idempotency-Key':key}});const updated:ManualOutboundAttention=data.attention||data.item||data;setManualAttentions(current=>current.map(item=>item.commandId===commandId?updated:item).filter(item=>item.isBlocking));manualAcknowledgeAttempts.current.delete(commandId);clearManualSendAttemptsForChat(manualSendAttempts.current,attention.chatId);setNotice('Conversa conferida. Um novo envio exigirá uma nova confirmação.')}catch(cause){setError(messageOf(cause,'Não foi possível marcar esta conversa como conferida.'));const code=errorCodeOf(cause);if(manualAttentionErrorCodes.has(code)||code==='attention_acknowledged')await loadManualAttentions()}finally{setBusy('')}};
  const changeReply=(next:string)=>setReply(next);
  const draft=async(item:Message)=>{if(!selected)return;setBusy(item.id);try{const {data}=await axios.post<WhatsAppDraft>(`${URL_API}/whatsapp/activity-draft`,{chatId:selected.id,messageId:item.id,area:'personal'});onDraft(data)}catch(cause){setError(messageOf(cause,'Não foi possível preparar a atividade.'))}finally{setBusy('')}};
  function canonicalFor(conversation?:Conversation){
    if(!conversation)return undefined;
    if(conversation.contact?.displayName)return conversation.contact;
    if(conversation.canonicalContact?.displayName)return conversation.canonicalContact;
    const direct=contacts.find(contact=>contact.id===conversation.contactId);
    if(direct)return direct;
    if(conversation.isGroup)return undefined;
    const conversationAddress=conversation.address||conversation.phoneNumber||conversation.id;
    return contacts.find(contact=>contact.channels.some(channel=>{
      return sameWhatsAppIdentity(channel.address,conversationAddress);
    }));
  }
  function displayName(conversation?:Conversation){return canonicalFor(conversation)?.displayName||conversation?.title||'Conversa'}
  return <WhatsAppArea>
    {!status?.connected&&!items.length?<section className="wa-connect"><div className="wa-logo"><FaWhatsapp/></div><div><span>WHATSAPP VINCULADO</span><h2>{loading?'Carregando dados salvos…':'Conecte seu WhatsApp ao Gaspar'}</h2><p>O pareamento por QR Code e as permissões de leitura e envio ficam nas Configurações. A agenda de contatos e o estilo podem ser preparados agora.</p>{status?.lastError&&<small>{status.lastError}</small>}</div><button onClick={onManageConnection}>Abrir Configurações</button></section>:<section className="wa-hero"><div className="wa-logo"><FaWhatsapp/></div><div><span>{status?.connected?'DISPOSITIVO VINCULADO':'DADOS SALVOS'}</span><h2>{status?.displayName||status?.phoneNumber||'WhatsApp conectado'}</h2><p>{status?.connected?'Conversas carregadas do banco; novidades chegam do WhatsApp em segundo plano.':'Exibindo o histórico salvo enquanto o WhatsApp reconecta.'}</p></div><button onClick={()=>void load()}><MdRefresh/>{loading?'Lendo banco…':'Atualizar tela'}</button><button className="secondary" onClick={onManageConnection}>Configurações</button></section>}
    {error&&<div className="wa-banner error">{error}<button onClick={()=>setError('')}><MdClose/></button></div>}{notice&&<div className="wa-banner success"><MdCheckCircle/>{notice}</div>}
    <nav className="wa-tabs" aria-label="Áreas do WhatsApp"><button className={view==='conversations'?'active':''} onClick={()=>setView('conversations')}><MdForum/>Conversas</button><button className={view==='scheduling'?'active':''} onClick={()=>setView('scheduling')}><MdSchedule/>Agendamentos</button><button className={view==='contacts'?'active':''} onClick={()=>setView('contacts')}><MdContacts/>Contatos</button><button className={view==='style'?'active':''} onClick={()=>setView('style')}><MdTune/>Estilo da secretária</button></nav>
    {view==='scheduling'?<SchedulingInbox requestedId={schedulingFocusId}/>:view==='contacts'?<ContactManager contacts={contacts} loading={contactsLoading} loadError={contactsError} onReload={loadContacts} onChange={setContacts}/>:view==='style'?<SecretaryStylePanel/>:<>
      <div className="wa-search"><MdSearch/><input value={search} onChange={event=>setSearch(event.target.value)} onKeyDown={event=>event.key==='Enter'&&void load()} placeholder="Buscar conversa ou mensagem"/></div>
      <section className="wa-layout"><aside>{items.map(item=>{const name=displayName(item);return <button key={item.id} className={selected?.id===item.id?'active':''} onClick={()=>void open(item)}><div className="wa-avatar">{name.slice(0,2).toUpperCase()}</div><div><strong>{name}</strong>{name!==item.title&&<small className="canonical-name">Nome no WhatsApp: {item.title}</small>}<span>{item.preview||'Nova conversa'}</span></div><time>{item.lastMessageAt?new Date(item.lastMessageAt).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}):''}{item.unreadCount>0&&<b>{item.unreadCount}</b>}</time></button>})}{!loading&&!items.length&&<p className="wa-empty">As novas conversas aparecerão aqui.</p>}</aside>
        <main>{!selected?<div className="wa-empty-state"><FaWhatsapp/><h3>Escolha uma conversa</h3><p>Leia o contexto, transforme mensagens em atividades e responda somente com confirmação.</p></div>:<><header><div><h3>{displayName(selected)}</h3><p>{selected.isGroup?'Grupo autorizado':'Conversa individual'} · {selected.messageCount} mensagens salvas{displayName(selected)!==selected.title?` · ${selected.title}`:''}</p></div></header><div className="wa-thread">{busy==='thread'?<p className="wa-empty">Carregando conversa…</p>:messages.map(item=><article key={item.id} className={item.direction}><div><small>{item.direction==='outbound'?'Você':canonicalFor(selected)?.displayName||item.senderName||selected.title}</small><p>{item.text||`[${item.messageType}]`}</p>{item.mediaFileName&&<em>{item.mediaFileName}</em>}<time>{new Date(item.occurredAt).toLocaleString('pt-BR')}</time></div>{item.direction==='inbound'&&<button disabled={busy===item.id} onClick={()=>void draft(item)}><MdCreate/>{busy===item.id?'Organizando…':'Criar atividade'}</button>}</article>)}</div>{(blockingManualAttention||blockingMandate||attentionError)&&<div className="wa-composer-guard" role="alert"><div><strong>{blockingManualAttention?'Envio manual aguardando conferência.':blockingMandate?'Envio manual bloqueado para esta conversa.':'Não foi possível verificar se esta conversa pode receber mensagens.'}</strong><span>{blockingManualAttention?.state==='snapshot_pending'?'A mensagem saiu, mas o histórico ainda não confirmou o registro. Confira a conversa antes de continuar.':blockingManualAttention?'O resultado do último envio é incerto e a mensagem pode já ter chegado. Confira a conversa para evitar duplicidade.':blockingMandate?.pauseReason==='outbound_sent_after_state_changed'?'Uma mensagem tardia precisa ser conferida antes de qualquer novo envio.':blockingMandate?'O resultado do último envio da secretária é incerto. Confira a negociação para evitar duplicidade.':'Atualize as verificações antes de responder.'}</span></div>{blockingManualAttention?<button className="secondary-action" disabled={!!busy} onClick={()=>void acknowledgeManualAttention()}><MdCheckCircle/>{busy===`manual-ack:${blockingManualAttention.commandId}`?'Registrando…':'Conferi a conversa'}</button>:blockingMandate?<button className="secondary-action" onClick={()=>{setSchedulingFocusId(String(blockingMandate.id||blockingMandate.actionId||''));setView('scheduling')}}>Ver agendamento</button>:<button className="secondary-action" onClick={()=>{void loadSchedulingAttention();void loadManualAttentions()}}>Tentar novamente</button>}</div>}<footer><textarea value={reply} onChange={event=>changeReply(event.target.value)} rows={3} placeholder={!status?.connected?'O WhatsApp está reconectando.':attentionLoading?'Verificando envios pendentes…':blockingManualAttention?'Confira o último envio antes de responder.':blockingMandate?'Confira o agendamento antes de responder.':attentionError?'Verificação de segurança indisponível.':status?.allowSend?'Escreva uma resposta…':'Habilite envios nas Configurações para responder.'} disabled={!status?.connected||!status?.allowSend||composerBlocked}/><button disabled={!status?.connected||!status?.allowSend||composerBlocked||!reply.trim()||busy==='send'} onClick={()=>void send()}><MdSend/>{busy==='send'?'Enviando…':'Revisar e enviar'}</button><small>{blockingManualAttention||blockingMandate?'Novos envios permanecem bloqueados até todas as atenções serem resolvidas.':'Cada envio manual exige sua confirmação.'}</small></footer></>}</main>
      </section>
    </>}
  </WhatsAppArea>;
}
