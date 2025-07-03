import React from 'react';
import './Message.css';

const Message = ({ message }) => {
  return (
    <div className={`yara-message yara-message--${message.sender === 'bot' ? 'bot' : 'user'}`}>
      <div className="yara-message__wrapper">
        <div className="yara-message__content">{message.text}</div>
        <div className="yara-message__time">{message.timestamp}</div>
      </div>
    </div>
  );
};

export default Message; 