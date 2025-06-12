import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";

//address of backend server
const SOCKET_SERVER_URL = "http://localhost:3001";

//set up of chat state and socket connection
export default function App() {
  const [chatHistory, updateChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketInstance.on("bot-message", (incomingMsg) => {
      updateChatHistory((prev) => [...prev, { sender: "bot", text: incomingMsg }]);
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

  const sendMessage = () => {
    const trimmed = userInput.trim();
    if (trimmed.length === 0) return;

    updateChatHistory((old) => [...old, { sender: "user", text: trimmed }]);

    if (socketRef.current) {
      socketRef.current.emit("user-message", trimmed);
    } else {
      console.warn("Tried to send message but socket wasn't ready");
    }

    setUserInput("");
  };

  //chat window

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4"> YARA - Movie Night Planner</h2>

      <div
        className="border rounded p-3 mb-3"
        style={{ height: "60vh", overflowY: "auto", backgroundColor: "#f8f9fa" }}
      >
        {chatHistory.length === 0 ? (
          <p className="text-muted text-center">No messages yet. Start the conversation!</p>
        ) : (
          chatHistory.map((msg, i) => (
            <div
              key={`msg-${i}`}
              className={`p-2 mb-2 rounded ${
                msg.sender === "user" ? "bg-primary text-white text-end" : "bg-light text-start"
              }`}
            >
              {msg.text}

            </div>
          ))
        )}
      </div>
      
      {/*input area*/}
      
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
        />
        <button className="btn btn-primary" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
