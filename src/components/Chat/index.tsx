import React, { ReactNode, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  MdAccountBalanceWallet,
  MdChatBubble,
  MdHome,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdMic,
  MdNotifications,
  MdPerson,
  MdSend,
  MdSupervisorAccount,
} from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { Container } from './styles';
import { URL_API } from '../../repositories/baseAPI';

interface AgentIdentity { id: string; name: string; }
interface Message {
  content: string;
  sender: 'user' | 'bot';
  action?: Record<string, unknown>;
  agent?: AgentIdentity | string;
  delegatedAgent?: string;
}

export interface AgentAlert {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical' | 'positive';
  actionLabel?: string;
  actionUrl?: string;
  sourceAgent?: string;
}

interface Props {
  page?: boolean;
  agent?: string;
  agentName?: string;
  agentRole?: string;
  alerts?: AgentAlert[];
  agentNames?: Record<string, string>;
}

const coordinator: AgentIdentity = { id: 'general', name: 'Gaspar' };

const normalizeAgent = (value: Message['agent']): AgentIdentity => {
  if (value && typeof value !== 'string' && value.id && value.name) return value;
  if (typeof value === 'string' && value) return { id: 'specialist', name: value };
  return coordinator;
};

const agentRole = (agent: AgentIdentity) => {
  const value = `${agent.id} ${agent.name}`.toLocaleLowerCase();
  if (/(home|casa)/.test(value)) return 'Especialista da casa';
  if (/(finan|guardian|organizer|planner|economist|investor)/.test(value)) return 'Especialista financeiro';
  return 'Coordenador da equipe';
};

const AgentAvatar: React.FC<{ agent: AgentIdentity }> = ({ agent }) => {
  const value = `${agent.id} ${agent.name}`.toLocaleLowerCase();
  const Icon = /(home|casa)/.test(value)
    ? MdHome
    : /(finan|guardian|organizer|planner|economist|investor)/.test(value)
      ? MdAccountBalanceWallet
      : agent.id === 'general'
        ? MdSupervisorAccount
        : MdPerson;
  return <span className={`agent-avatar ${agent.id}`} aria-hidden="true"><Icon /></span>;
};

const formatInline = (text: string): ReactNode[] => text
  .split(/(\*\*[^*]+\*\*)/g)
  .filter(Boolean)
  .map((part, index) => part.startsWith('**') && part.endsWith('**')
    ? <strong key={index}>{part.slice(2, -2)}</strong>
    : <React.Fragment key={index}>{part}</React.Fragment>);

const FormattedMessage: React.FC<{ content: string }> = ({ content }) => <div className="message-content">
  {content.split(/\r?\n/).map((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return <span className="message-space" key={index} />;
    if (line.startsWith('### ')) return <h3 key={index}>{formatInline(line.slice(4))}</h3>;
    if (line.startsWith('## ')) return <h2 key={index}>{formatInline(line.slice(3))}</h2>;
    if (line.startsWith('# ')) return <h2 key={index}>{formatInline(line.slice(2))}</h2>;
    if (/^[-•]\s+/.test(line)) return <div className="message-bullet" key={index}><i /><span>{formatInline(line.replace(/^[-•]\s+/, ''))}</span></div>;
    return <p key={index}>{formatInline(line)}</p>;
  })}
</div>;

const Chat: React.FC<Props> = ({
  page = false,
  agent = 'general',
  agentName = 'Assistente Gaspar',
  agentRole: selectedAgentRole,
  alerts = [],
  agentNames = {},
}) => {
  const [open, setOpen] = useState(page);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const userId = localStorage.getItem('@minha-carteira:usuarioId');
  const requestTimeout = 75000;

  useEffect(() => {
    if (!userId) return;
    let active = true;
    setMessages([]);
    try {
      const saved = localStorage.getItem(`@minha-carteira:assistant-history:${userId}:${agent}`)
        || (agent === 'general' ? localStorage.getItem(`@minha-carteira:assistant-history:${userId}`) : null);
      if (saved) setMessages(JSON.parse(saved));
    } catch { /* histórico local indisponível */ }

    axios.get(`${URL_API}/assistant/chat`, {
      params: { idUsuario: userId, agente: agent },
      timeout: requestTimeout,
    }).then(({ data }) => {
      if (active && Array.isArray(data.messages)) setMessages(data.messages);
    }).catch(() => { /* mantém o histórico local como fallback */ });
    return () => { active = false; };
  }, [agent, userId]);

  useEffect(() => {
    if (!userId || messages.length === 0) return;
    localStorage.setItem(`@minha-carteira:assistant-history:${userId}:${agent}`, JSON.stringify(messages));
  }, [agent, messages, userId]);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, open]);

  const send = async (text = input) => {
    const message = text.trim();
    if (!message || loading || !userId) return;
    setMessages((current) => [...current, { content: message, sender: 'user' }]);
    setInput(''); setLoading(true);
    try {
      const history = messages.slice(-10).map(({ content, sender }) => ({ content, sender }));
      const { data } = await axios.post(`${URL_API}/assistant/chat`, {
        idUsuario: userId,
        mensagem: message,
        agente: agent,
        historico: history,
      }, { timeout: requestTimeout });
      const responseAgent = data.agent?.id && data.agent?.name
        ? data.agent
        : data.delegatedAgent
          ? { id: data.delegatedAgent, name: agentNames[data.delegatedAgent] || data.delegatedAgent }
          : agent === 'general'
            ? coordinator
            : { id: agent, name: agentName };
      setMessages((current) => [...current, {
        content: data.message,
        sender: 'bot',
        action: data.pendingAction,
        agent: responseAgent,
        delegatedAgent: data.delegatedAgent,
      }]);
      try {
        if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.message));
        }
      } catch { /* áudio opcional */ }
    } catch (error: any) {
      const errorMessage = axios.isAxiosError(error) && error.code === 'ECONNABORTED'
        ? 'A captura ou análise demorou mais que o esperado. Tente novamente em instantes.'
        : error?.response?.data?.message || 'Não consegui responder agora. Verifique sua conexão e tente novamente.';
      setMessages((current) => [...current, { content: errorMessage, sender: 'bot' }]);
    } finally { setLoading(false); }
  };

  const confirm = async (action: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${URL_API}/assistant/confirm-action`, { action });
      setMessages((current) => [...current, { content: data.message, sender: 'bot', agent: coordinator }]);
    } catch (error: any) {
      setMessages((current) => [...current, { content: error?.response?.data?.message || 'Não foi possível executar a ação.', sender: 'bot' }]);
    } finally { setLoading(false); }
  };

  const listen = () => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) { setMessages((current) => [...current, { content: 'Seu navegador não suporta reconhecimento de voz.', sender: 'bot' }]); return; }
    const recognition = new Recognition();
    recognition.lang = 'pt-BR'; recognition.interimResults = false;
    recognition.onresult = (event: any) => { const text = event.results[0][0].transcript; setInput(text); send(text); };
    recognition.start();
  };

  if (!page && ['/assistant', '/settings/contas-recorrentes'].includes(pathname)) return null;

  return <Container page={page}><div className="chat">
    {open && <div className="chat-window">
      <header>
        <div><span>{agent === 'general' ? 'CONVERSA COM A EQUIPE' : 'AGENTE ESPECIALIZADO'}</span><strong>{agentName}</strong>{selectedAgentRole && <small>{selectedAgentRole}</small>}</div>
        {agent === 'general' && <div className="team" aria-label="Participantes da conversa">
          <span title="Gaspar, coordenador"><MdSupervisorAccount /></span>
          <span title="Especialistas financeiros"><MdAccountBalanceWallet /></span>
          <span title="Especialista da casa"><MdHome /></span>
        </div>}
        {!page && <button onClick={() => setOpen(false)}>Fechar</button>}
      </header>
      <div className="chat-body" ref={bodyRef} aria-live="polite">
        {alerts.length > 0 && <section className="agent-alerts" aria-label="Alertas deste agente">
          <button className="alerts-toggle" onClick={() => setAlertsOpen((current) => !current)}><span><MdNotifications /> {alerts.length} {alerts.length === 1 ? 'alerta disponível' : 'alertas disponíveis'}</span>{alertsOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}</button>
          {alertsOpen && <div className="alerts-list">{alerts.slice(0, 10).map((alert, index) => <article className={`agent-alert ${alert.severity}`} key={`${alert.title}-${index}`}>
            <div><span>{alert.sourceAgent ? agentNames[alert.sourceAgent] || alert.sourceAgent : 'Última análise'}</span><strong>{alert.title}</strong><p>{alert.description}</p></div>
            <footer><button disabled={loading} onClick={() => send(`Quero entender melhor o alerta "${alert.title}": ${alert.description}`)}>Conversar sobre isso</button>{alert.actionUrl && <a href={alert.actionUrl}>{alert.actionLabel || 'Abrir'}</a>}</footer>
          </article>)}</div>}
        </section>}
        {messages.length === 0 && <div className="empty-state"><AgentAvatar agent={agent === 'general' ? coordinator : { id: agent, name: agentName }} /><div><strong>{agent === 'general' ? 'Gaspar e sua equipe estão aqui' : `${agentName} está aqui`}</strong><p>{agent === 'general' ? 'Faça uma pergunta. O especialista certo responde nesta mesma conversa.' : 'Este chat contém somente sua conversa com este especialista.'}</p></div></div>}
        {messages.map((message, index) => {
          if (message.sender === 'user') return <div className="message user" key={index}><FormattedMessage content={message.content} /></div>;
          const agent = normalizeAgent(message.agent);
          return <div className="agent-message" key={index}>
            <AgentAvatar agent={agent} />
            <div className="agent-message-content">
              <div className="agent-meta"><strong>{agent.name}</strong><span>{agentRole(agent)}</span></div>
              <div className="message bot">{message.delegatedAgent && <span className="delegation">Análise delegada a {agentNames[message.delegatedAgent] || message.delegatedAgent}</span>}<FormattedMessage content={message.content} />
                {message.action && <button className="confirm" onClick={() => confirm(message.action!)}>Confirmar ação</button>}
              </div>
            </div>
          </div>;
        })}
        {loading && <div className="thinking"><AgentAvatar agent={agent === 'general' ? coordinator : { id: agent, name: agentName }} /><span>{agentName} está analisando…</span></div>}
      </div>
      <form onSubmit={(event) => { event.preventDefault(); send(); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder={`Conversar com ${agentName}...`} /><button type="button" onClick={listen} aria-label="Falar"><MdMic /></button><button type="submit" aria-label="Enviar"><MdSend /></button></form>
    </div>}
    {!page && <button className="chat-button" onClick={() => setOpen(!open)} aria-label="Abrir assistente"><MdChatBubble /></button>}
  </div></Container>;
};

export default Chat;
