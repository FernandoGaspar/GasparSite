import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdChatBubble, MdMic, MdSend } from 'react-icons/md';
import { Container } from './styles';
import { URL_API } from '../../repositories/baseAPI';

interface Message { content: string; sender: 'user' | 'bot'; action?: Record<string, unknown>; }

interface Props { page?: boolean; }

const Chat: React.FC<Props> = ({ page = false }) => {
  const [open, setOpen] = useState(page);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
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

  const send = async (text = input) => {
    const message = text.trim();
    if (!message || loading || !userId) return;
    setMessages((current) => [...current, { content: message, sender: 'user' }]);
    setInput(''); setLoading(true);
    try {
      const { data } = await axios.post(`${URL_API}/assistant/chat`, { idUsuario: userId, mensagem: message });
      setMessages((current) => [...current, { content: data.message, sender: 'bot', action: data.pendingAction }]);
      if ('speechSynthesis' in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.message));
    } catch (error: any) {
      setMessages((current) => [...current, { content: error?.response?.data?.message || 'Não consegui responder agora.', sender: 'bot' }]);
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

  return <Container page={page}><div className="chat">
    {open && <div className="chat-window">
      <header><div><span>ASSISTENTE PESSOAL</span><strong>Como posso ajudar?</strong></div>{!page && <button onClick={() => setOpen(false)}>Fechar</button>}</header>
      <div className="chat-body">{messages.length === 0 && <p>Posso analisar suas finanças e controlar sua casa. Como posso ajudar?</p>}
        {messages.map((message, index) => <div className={`message ${message.sender}`} key={index}><span>{message.content}</span>
          {message.action && <button className="confirm" onClick={() => confirm(message.action!)}>Confirmar ação</button>}</div>)}
        {loading && <p>Assistente está pensando...</p>}
      </div>
      <form onSubmit={(event) => { event.preventDefault(); send(); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Pergunte ou dê um comando..." /><button type="button" onClick={listen} aria-label="Falar"><MdMic /></button><button type="submit" aria-label="Enviar"><MdSend /></button></form>
    </div>}
    {!page && <button className="chat-button" onClick={() => setOpen(!open)} aria-label="Abrir assistente"><MdChatBubble /></button>}
  </div></Container>;
};

export default Chat;
