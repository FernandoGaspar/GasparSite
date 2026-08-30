import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  MdAccountBalanceWallet,
  MdChatBubble,
  MdHome,
  MdMic,
  MdPerson,
  MdSend,
  MdSupervisorAccount,
} from 'react-icons/md';
import { Container } from './styles';
import { URL_API } from '../../repositories/baseAPI';

interface AgentIdentity { id: string; name: string; }
interface Message {
  content: string;
  sender: 'user' | 'bot';
  action?: Record<string, unknown>;
  agent?: AgentIdentity | string;
}

interface Props { page?: boolean; }

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

const messageText = (content: string) => content.split(/(\*\*[^*]+\*\*)/g).map((part, index) => (
  part.startsWith('**') && part.endsWith('**')
    ? <strong key={index}>{part.slice(2, -2)}</strong>
    : <React.Fragment key={index}>{part}</React.Fragment>
));

const Chat: React.FC<Props> = ({ page = false }) => {
  const [open, setOpen] = useState(page);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem('@minha-carteira:usuarioId');

  useEffect(() => {
    if (!page || !userId) return;
    try {
      const saved = localStorage.getItem(`@minha-carteira:assistant-history:${userId}`);
      if (saved) setMessages(JSON.parse(saved));
    } catch { /* histórico local indisponível */ }
  }, [page, userId]);

  useEffect(() => {
    if (!page || !userId || messages.length === 0) return;
    localStorage.setItem(`@minha-carteira:assistant-history:${userId}`, JSON.stringify(messages));
  }, [messages, page, userId]);

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
        agente: 'general',
        historico: history,
      });
      const agent = data.agent?.id && data.agent?.name
        ? data.agent
        : data.delegatedAgent
          ? { id: 'specialist', name: data.delegatedAgent }
          : coordinator;
      setMessages((current) => [...current, { content: data.message, sender: 'bot', action: data.pendingAction, agent }]);
      if ('speechSynthesis' in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.message));
    } catch (error: any) {
      setMessages((current) => [...current, { content: error?.response?.data?.message || 'Não consegui responder agora.', sender: 'bot' }]);
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

  return <Container page={page}><div className="chat">
    {open && <div className="chat-window">
      <header>
        <div><span>CONVERSA COM A EQUIPE</span><strong>Assistente Gaspar</strong></div>
        <div className="team" aria-label="Participantes da conversa">
          <span title="Gaspar, coordenador"><MdSupervisorAccount /></span>
          <span title="Especialistas financeiros"><MdAccountBalanceWallet /></span>
          <span title="Especialista da casa"><MdHome /></span>
        </div>
        {!page && <button onClick={() => setOpen(false)}>Fechar</button>}
      </header>
      <div className="chat-body" ref={bodyRef} aria-live="polite">
        {messages.length === 0 && <div className="empty-state"><AgentAvatar agent={coordinator} /><div><strong>Gaspar e sua equipe estão aqui</strong><p>Faça uma pergunta. O especialista certo responde nesta mesma conversa.</p></div></div>}
        {messages.map((message, index) => {
          if (message.sender === 'user') return <div className="message user" key={index}>{messageText(message.content)}</div>;
          const agent = normalizeAgent(message.agent);
          return <div className="agent-message" key={index}>
            <AgentAvatar agent={agent} />
            <div className="agent-message-content">
              <div className="agent-meta"><strong>{agent.name}</strong><span>{agentRole(agent)}</span></div>
              <div className="message bot">{messageText(message.content)}
                {message.action && <button className="confirm" onClick={() => confirm(message.action!)}>Confirmar ação</button>}
              </div>
            </div>
          </div>;
        })}
        {loading && <div className="thinking"><AgentAvatar agent={coordinator} /><span>Consultando a equipe…</span></div>}
      </div>
      <form onSubmit={(event) => { event.preventDefault(); send(); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Pergunte ou dê um comando..." /><button type="button" onClick={listen} aria-label="Falar"><MdMic /></button><button type="submit" aria-label="Enviar"><MdSend /></button></form>
    </div>}
    {!page && <button className="chat-button" onClick={() => setOpen(!open)} aria-label="Abrir assistente"><MdChatBubble /></button>}
  </div></Container>;
};

export default Chat;
