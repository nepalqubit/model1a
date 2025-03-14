import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import ChatMessage from './ChatMessage';
import { Conversation } from '../types';

interface ChatContainerProps {
  conversations: Conversation[];
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: var(--background-color);
`;

const WelcomeMessage = styled.div`
  text-align: center;
  margin: 20px 0;
  color: var(--light-text-color);
  font-size: 0.9rem;
`;

const DateDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: var(--light-text-color);
  font-size: 0.8rem;
  
  &::before, &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid var(--border-color);
  }
  
  &::before {
    margin-right: 10px;
  }
  
  &::after {
    margin-left: 10px;
  }
`;

const ChatContainer: React.FC<ChatContainerProps> = ({ conversations }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [conversations]);
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Check if we need to show a date divider
  const shouldShowDateDivider = (current: Date, previous?: Date): boolean => {
    if (!previous) return true;
    
    return current.toDateString() !== previous.toDateString();
  };
  
  return (
    <Container ref={containerRef}>
      <WelcomeMessage>
        Welcome to RevX Assistant! Ask me anything about RevX's services, 
        policies, or company information.
      </WelcomeMessage>
      
      {conversations.length === 0 ? (
        <WelcomeMessage>
          How can I help you today?
        </WelcomeMessage>
      ) : (
        conversations.map((convo, index) => (
          <React.Fragment key={convo.id}>
            {/* Show date divider if this is a new day */}
            {shouldShowDateDivider(
              convo.timestamp, 
              index > 0 ? conversations[index - 1].timestamp : undefined
            ) && (
              <DateDivider>{formatDate(convo.timestamp)}</DateDivider>
            )}
            
            {/* User question */}
            <ChatMessage 
              isUser={true} 
              text={convo.question} 
              timestamp={convo.timestamp} 
            />
            
            {/* Assistant response */}
            <ChatMessage 
              isUser={false} 
              text={convo.answer} 
              timestamp={new Date(convo.timestamp.getTime() + 500)} 
            />
          </React.Fragment>
        ))
      )}
    </Container>
  );
};

export default ChatContainer;
