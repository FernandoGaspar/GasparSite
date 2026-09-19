import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  MdAdd,
  MdCheckCircle,
  MdErrorOutline,
  MdLightbulbOutline,
  MdLockOutline,
  MdMessage,
  MdOpenInNew,
  MdRefresh,
  MdSearch,
  MdSync,
} from 'react-icons/md';

import { URL_API } from '../../repositories/baseAPI';
import { WorkspaceShell } from './MicrosoftWorkspace.styles';
import type { MicrosoftDraft } from './MicrosoftWorkspace';
import './MicrosoftTeamsWorkspace.css';

type Status = {
  connected: boolean;
  configured: boolean;
  email?: string;
  displayName?: string;
  teamsAuthorized?: boolean;
  teamsSync?: { migrationRequired?: boolean; lastError?: string };
};
type Member = { id: string; name: string; email: string };
type Message = {
  id: string;
  chatId: string;
  sender: { id: string; name: string };
  body: string;
  createdDateTime?: string;
  webUrl?: string;
  chatTopic?: string;
  chatType?: string;
  members?: Member[];
  hasActivity?: boolean;
};
type Response = {
  items: Message[];
  summary?: { messages: number; chats: number };
  lastSyncAt?: string;
  syncPending?: boolean;
  lastError?: string;
};
type Conversation = { id: string; title: string; messages: Message[]; last: Message; activityCount: number };

const normalize = (value: unknown) => String(value || '').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const chatTitle = (item: Message, email?: string) => item.chatTopic || (item.members || [])
  .filter(member => normalize(member.email) !== normalize(email))
  .map(member => member.name || member.email)
  .filter(Boolean).join(', ')
  || (item.chatType === 'meeting' ? 'Conversa de reunião' : 'Conversa do Teams');
const displayDate = (value?: string) => value
  ? new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  : '—';
const initials = (value?: string) => String(value || '?').split(/\s+/).filter(Boolean).slice(0, 2)
  .map(part => part[0]).join('').toUpperCase();

export default function MicrosoftTeamsWorkspace({
  onDraft,
  onManageConnection,
}: {
  onDraft: (draft: MicrosoftDraft) => void;
  onManageConnection?: () => void;
}) {
  const [status, setStatus] = useState<Status | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [summary, setSummary] = useState<Response['summary']>();
  const [lastSync, setLastSync] = useState('');
  const [search, setSearch] = useState('');
  const [selectedChat, setSelectedChat] = useState('');
  const [conversationFilter, setConversationFilter] = useState<'all' | 'activities'>('all');
  const [syncPending, setSyncPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false, silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const current = (await axios.get<Status>(`${URL_API}/microsoft/connection`)).data;
      setStatus(current);
      if (!current.connected || !current.teamsAuthorized) return;
      const data = (await axios.get<Response>(`${URL_API}/microsoft/teams/messages`, {
        params: { limit: 240, refresh: refresh || undefined }, timeout: 90000,
      })).data;
      setMessages(data.items || []);
      setSummary(data.summary);
      setLastSync(data.lastSyncAt || '');
      setSyncPending(Boolean(data.syncPending));
      setError(data.lastError || '');
    } catch (cause: any) {
      setError(cause.response?.data?.message || 'Não foi possível carregar o Teams.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!syncPending) return undefined;
    const timer = window.setTimeout(() => void load(false, true), 10000);
    return () => window.clearTimeout(timer);
  }, [load, syncPending]);

  const conversations = useMemo<Conversation[]>(() => {
    const term = normalize(search);
    const grouped = new Map<string, Message[]>();
    messages.forEach(message => {
      if (term && !normalize(`${message.sender?.name} ${message.body} ${chatTitle(message, status?.email)}`).includes(term)) return;
      grouped.set(message.chatId, [...(grouped.get(message.chatId) || []), message]);
    });
    return [...grouped.entries()].map(([id, items]) => ({
      id,
      title: chatTitle(items[0], status?.email),
      messages: [...items].reverse(),
      last: items[0],
      activityCount: items.filter(item => item.hasActivity).length,
    }));
  }, [messages, search, status?.email]);
  const visibleConversations = useMemo(
    () => conversationFilter === 'activities'
      ? conversations.filter(conversation => conversation.activityCount > 0)
      : conversations,
    [conversationFilter, conversations],
  );
  const selected = visibleConversations.find(conversation => conversation.id === selectedChat)
    || visibleConversations[0];

  useEffect(() => {
    if (selected && selected.id !== selectedChat) setSelectedChat(selected.id);
    if (!selected && selectedChat) setSelectedChat('');
  }, [selected, selectedChat]);

  const draft = async (item: Message) => {
    setBusy(item.id);
    try {
      onDraft((await axios.post<MicrosoftDraft>(`${URL_API}/microsoft/activity-draft`, {
        sourceType: 'microsoft_teams', sourceId: item.id,
      })).data);
    } catch (cause: any) {
      setError(cause.response?.data?.message || 'Não foi possível preparar a atividade.');
    } finally {
      setBusy('');
    }
  };

  if (loading && !status) return <WorkspaceShell><section className="m365-state panel"><MdSync className="spin" /><h2>Sincronizando Teams…</h2></section></WorkspaceShell>;
  if (!status?.connected) return <WorkspaceShell><section className="m365-connect panel"><div className="m365-logo"><span>Microsoft</span><strong>Teams</strong></div><div><span className="eyebrow">CONTA CORPORATIVA</span><h2>Conecte o Microsoft 365</h2><p>A integração usa somente sua conta e não recebe sua senha.</p><button className="primary" onClick={onManageConnection}>Abrir Configurações</button></div></section></WorkspaceShell>;
  if (!status.teamsAuthorized) return <WorkspaceShell><section className="m365-connect panel"><div className="m365-logo"><MdMessage /><strong>Teams</strong></div><div><span className="eyebrow">NOVA PERMISSÃO</span><h2>Autorize suas conversas</h2><p>O Gaspar solicitará somente leitura dos chats da sua própria conta.</p><ul><li><MdLockOutline />Permissão delegada Chat.Read</li><li><MdAdd />Mensagens só viram atividades após sua confirmação</li></ul><button className="primary" onClick={onManageConnection}>Autorizar Teams</button></div></section></WorkspaceShell>;
  if (status.teamsSync?.migrationRequired) return <WorkspaceShell><div className="m365-warning"><MdErrorOutline />A integração do Teams aguarda a migration da API.</div></WorkspaceShell>;

  return <WorkspaceShell><section className="teams-inbox">
    <header className="teams-inbox-hero">
      <div className="teams-hero-brand"><span><MdMessage /></span><div><small>MICROSOFT TEAMS</small><h2>Conversas que viram ação</h2><p>Encontre o contexto certo e transforme uma mensagem em atividade sem perder o fio da conversa.</p></div></div>
      <div className="teams-hero-actions"><a className="teams-ideas-link" href="/ai-context"><MdLightbulbOutline />Mapa de ideias</a><button className="secondary" disabled={syncPending} onClick={() => void load(true)}>{syncPending ? <MdSync className="spin" /> : <MdRefresh />}{syncPending ? 'Buscando…' : 'Buscar novidades'}</button></div>
      <div className="teams-hero-status"><span><strong>{summary?.chats || 0}</strong> conversas salvas</span><span><strong>{summary?.messages || 0}</strong> mensagens no histórico</span><span className={syncPending ? 'live' : ''}>{syncPending ? <><MdSync className="spin" /> Atualizando em segundo plano</> : <>Dados disponíveis agora</>}</span>{lastSync && <span>Última atualização {displayDate(lastSync)}</span>}</div>
    </header>

    <div className="teams-commandbar">
      <label className="teams-search"><MdSearch /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar pessoa, assunto ou trecho da mensagem" /></label>
      <div className="teams-view-switch" role="group" aria-label="Filtrar conversas"><button className={conversationFilter === 'all' ? 'active' : ''} onClick={() => setConversationFilter('all')}>Todas</button><button className={conversationFilter === 'activities' ? 'active' : ''} onClick={() => setConversationFilter('activities')}>Com atividade</button></div>
      <button className="teams-settings" onClick={onManageConnection}>Configurações</button>
    </div>

    {error && <div className="m365-warning"><MdErrorOutline />{error}</div>}
    {loading ? <div className="m365-loading"><MdSync className="spin" />Carregando suas conversas…</div> : <div className="teams-inbox-layout">
      <aside className="teams-conversation-rail">
        <header><div><strong>Conversas recentes</strong><small>{visibleConversations.length} encontradas</small></div></header>
        <div className="teams-conversation-list">
          {visibleConversations.map(conversation => <button key={conversation.id} className={selected?.id === conversation.id ? 'active' : ''} onClick={() => setSelectedChat(conversation.id)}>
            <span className="teams-avatar">{initials(conversation.title)}</span>
            <span className="teams-rail-copy"><span><strong>{conversation.title}</strong><time>{displayDate(conversation.last.createdDateTime)}</time></span><small>{conversation.last.sender?.name || 'Participante'}</small><p>{conversation.last.body}</p><span className="teams-rail-badges"><i>{conversation.messages.length} mensagens recentes</i>{conversation.activityCount > 0 && <i className="done"><MdCheckCircle />{conversation.activityCount} {conversation.activityCount === 1 ? 'atividade' : 'atividades'}</i>}</span></span>
          </button>)}
          {!visibleConversations.length && <div className="teams-rail-empty"><MdMessage /><strong>Nenhuma conversa encontrada</strong><span>Altere a busca ou selecione “Todas”.</span></div>}
        </div>
      </aside>

      <section className="teams-chat-stage">
        {selected ? <>
          <header className="teams-chat-header"><div className="teams-avatar large">{initials(selected.title)}</div><div><span>CONVERSA NO TEAMS</span><h3>{selected.title}</h3><p>{selected.messages.length} mensagens recentes disponíveis</p></div>{selected.last.webUrl && <a href={selected.last.webUrl} target="_blank" rel="noreferrer"><MdOpenInNew />Continuar no Teams</a>}</header>
          <div className="teams-chat-scroll">
            <div className="teams-history-marker"><span>Histórico recente</span></div>
            {selected.messages.map(item => {
              const own = normalize(item.sender?.name) === normalize(status.displayName);
              return <article className={`teams-bubble-row${own ? ' own' : ''}`} key={`${item.chatId}:${item.id}`}>
                {!own && <span className="teams-message-avatar">{initials(item.sender?.name)}</span>}
                <div className="teams-bubble"><header><strong>{own ? 'Você' : item.sender?.name || 'Participante'}</strong><time>{displayDate(item.createdDateTime)}</time></header><p>{item.body}</p><footer>{item.hasActivity ? <span className="teams-activity-created"><MdCheckCircle />Atividade criada</span> : <button disabled={busy === item.id} onClick={() => void draft(item)}><MdAdd />{busy === item.id ? 'Analisando…' : 'Transformar em atividade'}</button>}</footer></div>
              </article>;
            })}
          </div>
          <footer className="teams-chat-foot"><MdLightbulbOutline /><span><strong>Encontrou algo importante?</strong> Transforme a mensagem em atividade e mantenha o compromisso rastreável.</span></footer>
        </> : <div className="teams-stage-empty"><MdMessage /><h3>Escolha uma conversa</h3><p>O histórico e as ações aparecerão aqui.</p></div>}
      </section>
    </div>}
  </section></WorkspaceShell>;
}
