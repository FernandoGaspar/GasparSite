import styled, {keyframes} from 'styled-components';

export const Container = styled.div`
    .App {
    text-align: center;
    }

    .chat {
    position: absolute;
    bottom: 20px;
    right: 20px;
    transition: all 0.3s ease;
    z-index: 9999;
    }

    .digitando {
    font-size: 13px;
    }

    .chat.open {
    /* bottom: 200px; */
    }

    .chat-button {
    border: none;
    border-radius: 50%;
    background-color: #007bff;
    color: #fff;
    width: 60px;
    height: 60px;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    }

    .chat-window {
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 10px;
    width: 300px;
    position: relative;
    }

    .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    }

    .chat-body {
    max-height: 200px;
    overflow-y: auto;
    }

    button {
    cursor: pointer;
    }

    .message {
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
    }

    .user {
    background-color: #007bff;
    color: #fff;
    align-self: flex-end;
    }

    .bot {
    background-color: #f2f2f2;
    color: #333;
    align-self: flex-start;
    }

    .chat-form {
    display: flex;
    margin-top: 10px;
    }

    .chat-form input {
    flex: 1;
    padding: 5px;
    border: none;
    border-radius: 5px 0 0 5px;
    }

    .chat-form button {
    padding: 5px 10px;
    border: none;
    border-radius: 0 5px 5px 0;
    background-color: #007bff;
    color: #fff;
    }

`;

export const Chat = styled.div`

`;