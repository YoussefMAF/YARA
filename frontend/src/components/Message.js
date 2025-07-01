import React from 'react';
import './Message.css';

const Message = ({ message }) => {
  const isBot = message.sender === 'bot';
  
  return (
    <div className={`message ${isBot ? 'bot' : 'user'}`}>
      <div className="message-content">
        <strong>{isBot ? 'Bot' : 'You'}:</strong>
        <span>{message.text}</span>
      </div>
      <div className="message-timestamp">
        {message.timestamp}
      </div>
    </div>
  );
};

export default Message; 