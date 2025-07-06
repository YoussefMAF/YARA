import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import './App.css';

const SOCKET_SERVER_URL = process.env.NODE_ENV === 'production' ? 'https://yara-d8fpc2e6edghgmb3.germanywestcentral-01.azurewebsites.net' : 'http://localhost:3001';


export default function App() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      withCredentials: true,
      autoConnect: true
    });

    socketInstance.on("connect", () => {
      console.log("Connected to server");
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection failed:", err);
    });

    socketInstance.on("bot-message", (incomingMsg) => {
      console.log("Received bot message:", incomingMsg);
      setIsTyping(false);
      addMessage("bot", incomingMsg);
    });

    socketInstance.on("typing", () => {
      setIsTyping(true);
    });

    socketInstance.on("stopTyping", () => {
      setIsTyping(false);
    });

    socketRef.current = socketInstance;

    return () => {
      if (socketRef.current) {
        socketInstance.disconnect();
        socketInstance.close();
      }
    };
  }, []);

  const addMessage = (sender, text) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const sendMessage = (text) => {
    const messageToSend = (text !== undefined ? text : userInput).trim();
    if (messageToSend.length === 0) return;
    
    console.log("Sending message:", messageToSend);
    addMessage("user", messageToSend);
    
    if (socketRef.current && socketRef.current.connected) {
      console.log("Socket connected, emitting message");
      socketRef.current.emit("user-message", messageToSend);
    } else {
      console.error("Socket not connected or not ready");
      if (socketRef.current) {
        console.log("Socket state:", {
          connected: socketRef.current.connected,
          disconnected: socketRef.current.disconnected,
          id: socketRef.current.id
        });
      }
    }
    setUserInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="container mt-4">
      <ChatHeader />
      <MessageList
        messages={messages}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
      />
      <MessageInput
        onSendMessage={sendMessage}
        userInput={userInput}
        setUserInput={setUserInput}
      />
    </div>
  );
}
