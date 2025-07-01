import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { io } from 'socket.io-client';
import './ChatWindow.css';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('botMessage', (message) => {
      setIsTyping(false);
      addMessage('bot', message);
    });

    newSocket.on('typing', () => {
      setIsTyping(true);
    });

    newSocket.on('stopTyping', () => {
      setIsTyping(false);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const addMessage = (sender, text) => {
    const newMessage = {
      id: Date.now(),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = (text) => {
    if (text.trim() && socket) {
      addMessage('user', text);
      socket.emit('userMessage', text);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-container">
      <ChatHeader />
      <MessageList 
        messages={messages} 
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
      />
      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
};

export default ChatWindow; 