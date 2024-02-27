import React, { useEffect, useState } from 'react';
import { MdChatBubble } from 'react-icons/md';

import { Container }  from './styles';
import axios from 'axios';
import { URL_API } from '../../repositories/baseAPI';

interface Message {
  content: string;
  sender: "user" | "bot";
  date: string;
}

interface IMensagens {
  idNPLChat: number;
  Origem: string;
  Destino: string;	
  DataInicio: string;	
  DataFim: string;	
  Ativo: number;	
  idNPLChatMensagens: number;	
  AutorMensagem: string;	
  Texto: string;	
  Data: string;
}

const Chat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;
  const [mensagemPost, setMensagemPost] = useState<IMensagens[]>([]);
  const [loading, setLoading] = useState<Boolean>(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensagens (inputValue)
    if (inputValue.trim() !== "") {
      const newMessage: Message = {
        content: inputValue,
        sender: "user",
        date: new Date().toISOString(),
      };
      // setMessages([...messages, newMessage]);
      setInputValue("");
    }
  };

  const getMensagens = () => {
      axios.post (URL_API+"/getMensagensAtivas", {
        idUsuario: idUsuario,
      })
      .then((response) => {
          const { data } = response
          setMensagemPost(JSON.parse(data))  
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const setMensagens = (mensagem: string) => {
      setLoading (true)
      const newMessage: IMensagens = {
        idNPLChat: 1,
        Origem: "Fernando Gaspar",
        Destino: "assistant",
        DataInicio: new Date().toISOString(),	
        DataFim: "NULL",
        Ativo: 1,
        idNPLChatMensagens: 1,	
        AutorMensagem: "Fernando Gaspar",	
        Texto: mensagem,
        Data: new Date().toISOString(),
      };

      setMensagemPost([...mensagemPost,  newMessage])

      axios.post (URL_API+"/enviaMensagem", {
        idUsuario: idUsuario,
        mensagem: mensagem,
      })
      .then((response) => {
          const { data } = response
          console.log (response)
          setMensagemPost(JSON.parse(data))  
          setLoading (false)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  useEffect(() => {
    getMensagens()
  },[]); 

    return (
      <Container>
        <div className={`chat ${isOpen ? "open" : ""}`}>
        {isOpen && (
          <div className="chat-window">
                <div className="chat-header">
                  <h3>Chat</h3>
                  <button onClick={toggleChat}>Fechar</button>
                </div>
                <div className="chat-body">
                  {mensagemPost.map((message, index) => (
                    <div
                      key={index}
                      className={`message ${message.AutorMensagem === "assistant" ? "bot" : "user"}`}
                    >
                      {message.Texto}
                    </div>
                  ))}
                </div>
                {
                  loading ?
                    <div className="digitando">
                        IA esta digitando...
                    </div>
                    :
                    <></>
                }

                <form className="chat-form" onSubmit={handleFormSubmit}>
                  <input
                    type="text"
                    placeholder="Digite uma mensagem..."
                    value={inputValue}
                    onChange={handleInputChange}
                  />
                  <button type="submit">Enviar</button>
                </form>
              </div>
            )}
            <button className="chat-button" onClick={toggleChat}>
            <MdChatBubble/>
            </button>
          </div>
      </Container>
)};


export default Chat;