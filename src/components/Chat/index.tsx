import React, { ReactNode, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { MdChatBubble, MdKeyboardArrowDown, MdKeyboardArrowUp, MdMic, MdNotifications, MdSend } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { Container } from './styles';
import { URL_API } from '../../repositories/baseAPI';

interface Message { content: string; sender: 'user' | 'bot'; action?: Record<string, unknown>; delegatedAgent?: string; }

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
    if (/^[-•]\s+/.test(line)) return <div className="message-bullet" key={index}><i /> <span>{formatInline(line.replace(/^[-•]\s+/, ''))}</span></div>;
    return <p key={index}>{formatInline(line)}</p>;
  })}
</div>;

const Chat: React.FC<Props> = ({
  page = false, agent = 'general', agentName = 'Assistente pessoal', agentRole,
  alerts = [], agentNames = {},
}) => {
  const [open, setOpen] = useState(page);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const userId = localStorage.getItem('@minha-carteira:usuarioId');
  // Camera requests may spend a few seconds obtaining a fresh DVR frame before
  // the visual analysis starts. Keep the browser timeout above the API budget.
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

    axios.get(`${URL_API}/assistant/chat`, { params: { idUsuario: userId, agente: agent }, timeout: requestTimeout })
      .then(({ data }) => {
        if (active && Array.isArray(data.messages)) setMessages(data.messages);
      })
      .catch(() => { /* mantém o histórico local como fallback */ });
    return () => { active = false; };
  }, [agent, userId]);

  useEffect(() => {
    if (!userId || messages.length === 0) return;
    localStorage.setItem(`@minha-carteira:assistant-history:${userId}:${agent}`, JSON.stringify(messages));
  }, [agent, messages, userId]);

  useEffect(() => {
    const body = chatBodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [messages, loading, open]);

  const send = async (text = input) => {
    const message = text.trim();
    if (!message || loading || !userId) return;
    setMessages((current) => [...current, { content: message, sender: 'user' }]);
    setInput(''); setLoading(true);
    try {
      const { data } = await axios.post(
        `${URL_API}/assistant/chat`,
        { idUsuario: userId, mensagem: message, agente: agent },
        { timeout: requestTimeout },
      );
      setMessages((current) => [...current, {
        content: data.message, sender: 'bot', action: data.pendingAction,
        delegatedAgent: data.delegatedAgent,
      }]);
      try {
        if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.message));
        }
      } catch { /* áudio é opcional e não deve transformar uma resposta válida em erro */ }
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
      setMessages((current) => [...current, { content: data.message, sender: 'bot' }]);
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
      <header><div><span>{agent === 'general' ? 'COORDENADOR DA EQUIPE' : 'AGENTE ESPECIALIZADO'}</span><strong>{agentName}</strong>{agentRole && <small>{agentRole}</small>}</div>{!page && <button onClick={() => setOpen(false)}>Fechar</button>}</header>
      <div className="chat-body" ref={chatBodyRef}>
        {alerts.length > 0 && <section className="agent-alerts" aria-label="Alertas deste agente">
          <button className="alerts-toggle" onClick={() => setAlertsOpen(current => !current)}><span><MdNotifications /> {alerts.length} {alerts.length === 1 ? 'alerta disponível' : 'alertas disponíveis'}</span>{alertsOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}</button>
          {alertsOpen && <div className="alerts-list">{alerts.slice(0, 10).map((alert, index) => <article className={`agent-alert ${alert.severity}`} key={`${alert.title}-${index}`}>
            <div><span>{alert.sourceAgent ? agentNames[alert.sourceAgent] || alert.sourceAgent : 'Última análise'}</span><strong>{alert.title}</strong><p>{alert.description}</p></div>
            <footer><button disabled={loading} onClick={() => send(`Quero entender melhor o alerta "${alert.title}": ${alert.description}`)}>Conversar sobre isso</button>{alert.actionUrl && <a href={alert.actionUrl}>{alert.actionLabel || 'Abrir'}</a>}</footer>
          </article>)}</div>}
        </section>}
        {messages.length === 0 && <p>{agent === 'general' ? 'Conte o que você precisa. Vou envolver o especialista mais adequado.' : `Este chat contém somente sua conversa com ${agentName}. Como posso ajudar?`}</p>}
        {messages.map((message, index) => <div className={`message ${message.sender}`} key={message.content + index}>{message.delegatedAgent && <span className="delegation">Análise delegada a {agentNames[message.delegatedAgent] || message.delegatedAgent}</span>}<FormattedMessage content={message.content} />
          {message.action && <button className="confirm" onClick={() => confirm(message.action!)}>Confirmar ação</button>}</div>)}
        {loading && <p>{agentName} está analisando...</p>}
      </div>
      <form onSubmit={(event) => { event.preventDefault(); send(); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder={`Conversar com ${agentName}...`} /><button type="button" onClick={listen} aria-label="Falar"><MdMic /></button><button type="submit" aria-label="Enviar"><MdSend /></button></form>
    </div>}
    {!page && <button className="chat-button" onClick={() => setOpen(!open)} aria-label="Abrir assistente"><MdChatBubble /></button>}
  </div></Container>;
};

export default Chat;
