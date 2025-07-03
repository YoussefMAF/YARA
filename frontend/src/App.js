import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import './App.css';

const SOCKET_SERVER_URL = "http://localhost:3001";

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
    });

    socketInstance.on("bot-message", (incomingMsg) => {
      setIsTyping(false);
      addMessage("bot", incomingMsg);
    });

    socketInstance.on("typing", () => {
      setIsTyping(true);
    });

    socketInstance.on("stopTyping", () => {
      setIsTyping(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection failed:", err);
    });

    socketRef.current = socketInstance;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
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
    const trimmed = (text !== undefined ? text : userInput).trim();
    if (trimmed.length === 0) return;
    addMessage("user", trimmed);
    if (socketRef.current) {
      socketRef.current.emit("user-message", trimmed);
    } else {
      console.warn("Tried to send message but socket wasn't ready");
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
