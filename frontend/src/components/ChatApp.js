import React, { useState } from 'react';
import Button from './Button';

function ChatApp() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      messages: [],
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Chat History Bar */}
      <div style={{ width: 220, borderRight: '1px solid #ccc', padding: 10, background: '#f9f9f9' }}>
        <Button onClick={handleNewChat}>New Chat</Button>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 20 }}>
          {chats.map(chat => (
            <li
              key={chat.id}
              style={{
                cursor: 'pointer',
                fontWeight: chat.id === activeChatId ? 'bold' : 'normal',
                padding: '8px 0',
                color: chat.id === activeChatId ? '#007bff' : '#333',
              }}
              onClick={() => setActiveChatId(chat.id)}
            >
              Chat {chat.id}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1, padding: 24 }}>
        {activeChatId ? (
          <div>
            <h2>Chat {activeChatId}</h2>

          </div>
        ) : (
          <div>Select a chat or start a new one.</div>
        )}
      </div>
    </div>
  );
}

export default ChatApp; 