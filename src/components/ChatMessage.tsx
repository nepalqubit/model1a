import React from 'react';
import styled from 'styled-components';

interface ChatMessageProps {
  isUser: boolean;
  text: string;
  timestamp: Date;
}

const MessageContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isUser'
})<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  margin: 8px 0;
  max-width: 100%;
`;

const MessageBubble = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isUser'
})<{ isUser: boolean }>`
  background-color: ${props => props.isUser ? 'var(--primary-color)' : 'white'};
  color: ${props => props.isUser ? 'white' : 'var(--text-color)'};
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 80%;
  box-shadow: var(--box-shadow);
  border: 1px solid var(--border-color);
  word-wrap: break-word;
`;

const Timestamp = styled.span`
  font-size: 0.7rem;
  color: var(--light-text-color);
  margin-top: 4px;
`;

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatMessage: React.FC<ChatMessageProps> = ({ isUser, text, timestamp }) => {
  return (
    <MessageContainer isUser={isUser}>
      <MessageBubble isUser={isUser}>
        {text}
      </MessageBubble>
      <Timestamp>{formatTime(timestamp)}</Timestamp>
    </MessageContainer>
  );
};

export default ChatMessage;
