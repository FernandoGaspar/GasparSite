import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import {
  MdArchive, MdCheckCircle, MdClose, MdCreate, MdEmail, MdFlag, MdInbox,
  MdOpenInNew, MdPerson, MdRefresh, MdSecurity, MdSend, MdStar, MdWork,
} from 'react-icons/md';
import { URL_API } from '../../repositories/baseAPI';
import MicrosoftWorkspace, { MicrosoftDraft } from '../Activities/MicrosoftWorkspace';
import MicrosoftTeamsWorkspace from '../Activities/MicrosoftTeamsWorkspace';
import { Container } from './styles';

type Connection = {
  configured:boolean; connected:boolean; migrationRequired?:boolean; email?:string; displayName?:string;
  lastSyncAt?:string; lastError?:string;
  preferences?:{autoOrganize:boolean;archiveNewsletters:boolean;reviewSuspects:boolean};
};
type Mail = {
  id:string;subject:string;snippet:string;receivedDateTime?:string;isRead:boolean;important:boolean;
  sender:{name:string;email:string};category:string;categoryLabel:string;confidence:number;
  suggestedAction:string;reasons:string[];webLink:string;hasAttachments:boolean;
  gmailCategory:string;gmailCategoryLabel:string;mailboxLocation:string;
};
type Inbox = {messages:Mail[];summary:{total:number;unread:number;important:number;toReview:number};gmailCategories?:Record<string,{total:number;unread:number}>;lastSyncAt?:string;syncPending?:boolean};
const emptyInbox:Inbox={messages:[],summary:{total:0,unread:0,important:0,toReview:0}};
const labels:Record<string,string>={primary:'Principal',updates:'Atualizações',social:'Social',promotions:'Promoções',forums:'Fóruns',unread:'Não lidos',important:'Importantes',suspect:'Spam',all:'Recentes'};
const categoryName:Record<string,string>={important:'Importante',reply:'Para responder',waiting:'Aguardando',finance:'Financeiro',purchases:'Compras',travel:'Viagens',documents:'Documentos',newsletter:'Newsletter',registrations:'Cadastro',low_priority:'Baixa prioridade',suspect:'Suspeito',review:'Revisar'};
const messageOf=(error:any,fallback:string)=>error?.response?.data?.message||fallback;

export default function Communications(){
  const history=useHistory();
  const [scope,setScope]=useState<'personal'|'work'>('work');
  const [workView,setWorkView]=useState<'outlook'|'teams'>('outlook');
  const [connection,setConnection]=useState<Connection>();
  const [inbox,setInbox]=useState<Inbox>(emptyInbox);
  const [mode,setMode]=useState('primary'); const [search,setSearch]=useState('');
  const [loading,setLoading]=useState(true); const [busy,setBusy]=useState('');
  const [notice,setNotice]=useState(''); const [error,setError]=useState('');
  const [compose,setCompose]=useState(false); const [draftId,setDraftId]=useState('');
  const [mail,setMail]=useState({to:'',cc:'',subject:'',body:''});

  const load=useCallback(async(forceRefresh=false)=>{
    setLoading(true);setError('');
    try{
      const {data:status}=await axios.get<Connection>(`${URL_API}/gmail/connection`);setConnection(status);
      if(status.connected){const {data}=await axios.get<Inbox>(`${URL_API}/gmail/messages`,{params:{mode,limit:30,search,refresh:forceRefresh||undefined}});setInbox(data);if(data.lastSyncAt)setConnection({...status,lastSyncAt:data.lastSyncAt});}
      else {setInbox(emptyInbox)}
    }catch(e){setError(messageOf(e,'Não foi possível carregar a Central de Comunicação.'));}
    finally{setLoading(false);}
  },[mode,search]);
  useEffect(()=>{void load()},[load]);

  const savePreferences=async(next:Partial<NonNullable<Connection['preferences']>>)=>{if(!connection?.preferences)return;setBusy('preferences');try{const {data}=await axios.put(`${URL_API}/gmail/preferences`,{...connection.preferences,...next});setConnection({...connection,preferences:data});setNotice('Preferências salvas.')}catch(e){setError(messageOf(e,'Não foi possível salvar as preferências.'))}finally{setBusy('')}};
  const organize=async()=>{setBusy('organize');setError('');try{const {data}=await axios.post(`${URL_API}/gmail/organize`,{apply:true,limit:30});setNotice(`${data.applied} mensagem${data.applied===1?' organizada':'s organizadas'}. Nenhuma foi apagada.`);await load()}catch(e){setError(messageOf(e,'Não foi possível organizar sua caixa.'))}finally{setBusy('')}};
  const act=async(item:Mail,action:string)=>{if(action==='spam'&&!window.confirm('Mover esta mensagem para Spam?'))return;setBusy(item.id);setError('');try{await axios.post(`${URL_API}/gmail/messages/${encodeURIComponent(item.id)}/actions`,{action,category:item.category});setNotice('Comando aplicado no Gmail. O estado local foi sincronizado.');await load(true)}catch(e){setError(messageOf(e,'Não foi possível organizar a mensagem.'))}finally{setBusy('')}};
  const saveDraft=async()=>{setBusy('draft');setError('');try{const {data}=await axios.post(`${URL_API}/gmail/drafts`,{to:mail.to.split(',').map(v=>v.trim()).filter(Boolean),cc:mail.cc.split(',').map(v=>v.trim()).filter(Boolean),subject:mail.subject,body:mail.body});setDraftId(data.id);setNotice('Rascunho salvo no Gmail. Revise e confirme o envio.')}catch(e){setError(messageOf(e,'Não foi possível criar o rascunho.'))}finally{setBusy('')}};
  const sendDraft=async()=>{if(!draftId||!window.confirm(`Enviar este e-mail para ${mail.to}?`))return;setBusy('send');try{await axios.post(`${URL_API}/gmail/drafts/${encodeURIComponent(draftId)}/send`,{confirmed:true});setCompose(false);setDraftId('');setMail({to:'',cc:'',subject:'',body:''});setNotice('E-mail enviado com confirmação.')}catch(e){setError(messageOf(e,'Não foi possível enviar o e-mail.'))}finally{setBusy('')}};
  const confidence=useMemo(()=>inbox.messages.filter(item=>item.confidence>=.86).length,[inbox]);
  const openWorkActivity=(draft:MicrosoftDraft)=>history.push('/activities',{microsoftDraft:draft});

  const scopeNav=<nav className="scope-nav"><button className={scope==='personal'?'personal active':''} onClick={()=>setScope('personal')}><MdPerson/>Pessoal</button><button className={scope==='work'?'work active':''} onClick={()=>setScope('work')}><MdWork/>Profissional</button></nav>;
  if(scope==='work')return <Container>
    <header className="hero"><div><span><MdEmail/> CENTRAL DE COMUNICAÇÃO</span><h1>Comunicação profissional</h1><p>Outlook e Teams no mesmo contexto de trabalho.</p></div></header>
    {scopeNav}<nav className="filters"><button className={workView==='outlook'?'active':''} onClick={()=>setWorkView('outlook')}>Outlook</button><button className={workView==='teams'?'active':''} onClick={()=>setWorkView('teams')}>Teams</button></nav><section className="context-note work"><strong>{workView==='teams'?'Conversas do Teams':'Contexto profissional'}</strong><span>{workView==='teams'?'Converta uma mensagem importante em atividade sem misturar conversas pessoais.':'E-mails sinalizados no Outlook criam atividades profissionais. A conta é gerenciada em Configurações.'}</span></section>
    {workView==='teams'?<MicrosoftTeamsWorkspace onDraft={openWorkActivity} onManageConnection={()=>history.push('/settings')}/>:<MicrosoftWorkspace mode="emails" onDraft={openWorkActivity} onManageConnection={()=>history.push('/settings')}/>} 
  </Container>;

  return <Container>
    <header className="hero"><div><span><MdEmail/> CENTRAL DE COMUNICAÇÃO</span><h1>E-mails</h1><p>Uma experiência consistente, com os contextos pessoal e profissional claramente separados.</p></div>{connection?.connected&&<div className="hero-actions"><button className="secondary" onClick={()=>void load(true)}><MdRefresh/>Atualizar</button><button onClick={()=>setCompose(true)}><MdCreate/>Escrever</button></div>}</header>
    {scopeNav}<section className="context-note personal"><strong>Contexto pessoal</strong><span>E-mails marcados no Gmail criam atividades pessoais. A conta corporativa não é usada nesta visão.</span></section>
    {error&&<div className="banner error">{error}<button onClick={()=>setError('')}><MdClose/></button></div>}
    {notice&&<div className="banner success"><MdCheckCircle/>{notice}</div>}
    {loading&&!connection?<div className="loading">Preparando sua comunicação…</div>:!connection?.connected?<section className="connect panel"><div className="google-mark">G</div><div><span>PESSOAL · GMAIL</span><h2>Conta pessoal não conectada</h2><p>A conexão, as permissões e a automação de atividades são gerenciadas somente em Configurações.</p>{connection?.migrationRequired&&<small>A migration da Central de Comunicação precisa ser aplicada na API.</small>}{!connection?.configured&&<small>As credenciais OAuth do Google ainda precisam ser configuradas na API.</small>}</div><button onClick={()=>history.push('/settings')}>Abrir Configurações</button></section>:<>
      <section className="account panel"><div><span>PESSOAL · GMAIL</span><h2>{connection.displayName||connection.email}</h2><p>{connection.email} · última organização {connection.lastSyncAt?new Date(connection.lastSyncAt).toLocaleString('pt-BR'):'ainda não executada'}</p></div><button className="manage-link" onClick={()=>history.push('/settings')}>Gerenciar em Configurações</button></section>
      <section className="metrics"><article><MdInbox/><span>Visíveis<strong>{inbox.summary.total}</strong></span></article><article><MdEmail/><span>Não lidos<strong>{inbox.summary.unread}</strong></span></article><article><MdStar/><span>Importantes<strong>{inbox.summary.important}</strong></span></article><article><MdSecurity/><span>Para revisar<strong>{inbox.summary.toReview}</strong></span></article></section>
      <section className="organizer panel"><div><span>TRIAGEM EXPLICÁVEL</span><h2>{confidence} mensagens com classificação segura</h2><p>Aplicar cria etiquetas. Newsletters e suspeitos só saem da entrada conforme suas preferências; nada é excluído.</p></div><button disabled={busy==='organize'||!inbox.messages.length} onClick={organize}>{busy==='organize'?'Organizando…':'Organizar agora'}</button><div className="preferences">
        <label><input type="checkbox" checked={!!connection.preferences?.autoOrganize} onChange={e=>void savePreferences({autoOrganize:e.target.checked})}/>Organizar novas mensagens automaticamente</label>
        <label><input type="checkbox" checked={!!connection.preferences?.archiveNewsletters} onChange={e=>void savePreferences({archiveNewsletters:e.target.checked})}/>Arquivar newsletters de alta confiança</label>
        <label><input type="checkbox" checked={!!connection.preferences?.reviewSuspects} onChange={e=>void savePreferences({reviewSuspects:e.target.checked})}/>Retirar suspeitos da entrada para revisão</label>
      </div></section>
      <nav className="filters">{Object.entries(labels).map(([key,label])=><button key={key} className={mode===key?'active':''} onClick={()=>setMode(key)}>{label}{inbox.gmailCategories?.[key]?.unread?` · ${inbox.gmailCategories[key].unread}`:''}</button>)}<input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&void load()} placeholder="Buscar remetente ou assunto"/></nav>
      <main className="mail-list">{inbox.messages.map(item=><article key={item.id} className={`mail panel ${!item.isRead?'unread':''}`}><div className="mail-icon"><MdEmail/></div><div className="mail-copy"><div className="mail-top"><span>{item.sender.name||item.sender.email}</span><time>{item.receivedDateTime?new Date(item.receivedDateTime).toLocaleString('pt-BR'):'—'}</time></div><h3>{item.subject}</h3><p>{item.snippet}</p><div className="tags"><b className={item.category==='suspect'?'suspect':''}>{categoryName[item.category]||item.category}</b><span>Gmail: {item.gmailCategoryLabel}</span><span>{Math.round(item.confidence*100)}% de confiança</span>{item.hasAttachments&&<span>Anexo</span>}</div><details><summary>Por que o Gaspar classificou assim?</summary>{item.reasons.map(reason=><p key={reason}>{reason}</p>)}</details></div><div className="mail-actions"><button disabled={busy===item.id} onClick={()=>void act(item,'apply_suggestion')}><MdCheckCircle/>Aplicar</button><button disabled={busy===item.id} onClick={()=>void act(item,'important')}><MdFlag/>Importante</button><button disabled={busy===item.id} onClick={()=>void act(item,'archive')}><MdArchive/>Arquivar</button><button className="secondary" disabled={busy===item.id} onClick={()=>void act(item,item.isRead?'unread':'read')}>{item.isRead?'Não lido':'Lido'}</button><a href={item.webLink} target="_blank" rel="noreferrer"><MdOpenInNew/>Gmail</a></div></article>)}{!loading&&!inbox.messages.length&&<div className="empty panel"><MdInbox/><h2>{inbox.syncPending?'Sincronização inicial em andamento':'Nada nesta visualização'}</h2><p>{inbox.syncPending?'As mensagens já confirmadas aparecerão aqui enquanto o Gmail é espelhado no SQL Server.':'Sua caixa está em ordem ou o filtro não encontrou mensagens.'}</p></div>}</main>
    </>}
    {compose&&<div className="modal-backdrop" onMouseDown={()=>setCompose(false)}><section className="composer panel" onMouseDown={e=>e.stopPropagation()}><header><div><span>ENVIO CONTROLADO</span><h2>Novo e-mail</h2></div><button className="icon-button" onClick={()=>setCompose(false)}><MdClose/></button></header><label>Para<input value={mail.to} onChange={e=>{setDraftId('');setMail({...mail,to:e.target.value})}} placeholder="nome@gmail.com"/></label><label>Cc<input value={mail.cc} onChange={e=>{setDraftId('');setMail({...mail,cc:e.target.value})}} placeholder="Opcional"/></label><label>Assunto<input value={mail.subject} onChange={e=>{setDraftId('');setMail({...mail,subject:e.target.value})}}/></label><label>Mensagem<textarea value={mail.body} onChange={e=>{setDraftId('');setMail({...mail,body:e.target.value})}} rows={9}/></label><p className="safety">O Gaspar primeiro salva no Gmail. O envio só acontece após uma segunda confirmação.</p><footer>{draftId?<><span>Rascunho pronto</span><button disabled={busy==='send'} onClick={sendDraft}><MdSend/>{busy==='send'?'Enviando…':'Confirmar e enviar'}</button></>:<button disabled={busy==='draft'||!mail.to||!mail.subject||!mail.body} onClick={saveDraft}>{busy==='draft'?'Salvando…':'Salvar rascunho'}</button>}</footer></section></div>}
  </Container>;
}
