import React from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import './MessageList.css';

const MessageList = ({ messages, isTyping, messagesEndRef }) => {
  return (
    <div className="chat-messages">
      {messages.map((message) => (
        <Message 
          key={message.id} 
          message={message} 
        />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 