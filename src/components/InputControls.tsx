import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

interface InputControlsProps {
  onSendMessage: (message: string) => void;
  onToggleSettings: () => void;
}

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-top: 1px solid var(--border-color);
  position: sticky;
  bottom: 0;
`;

const TextInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border-radius: 24px;
  border: 1px solid var(--border-color);
  font-size: 16px;
  outline: none;
  transition: border-color var(--transition-speed);
  
  &:focus {
    border-color: var(--primary-color);
  }
`;

// Create a button that doesn't pass the isActive prop to the DOM
const IconButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'isActive'
})<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.isActive ? 'var(--accent-color)' : 'var(--primary-color)'};
  color: white;
  margin-left: 12px;
  transition: background-color var(--transition-speed), transform 0.2s;
  
  &:hover {
    background-color: ${props => props.isActive ? 'var(--error-color)' : 'var(--secondary-color)'};
    transform: scale(1.05);
  }
  
  &:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
    transform: none;
  }
`;

const SettingsButton = styled(IconButton)`
  margin-right: 12px;
  margin-left: 0;
  background-color: var(--light-text-color);
  
  &:hover {
    background-color: var(--text-color);
  }
`;

const InputControls: React.FC<InputControlsProps> = ({ onSendMessage, onToggleSettings }) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { transcript, listening, startListening, stopListening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  
  // Handle sending a message
  const handleSend = () => {
    const trimmedText = inputText.trim();
    if (trimmedText) {
      onSendMessage(trimmedText);
      setInputText('');
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Handle voice input toggle
  const toggleVoiceInput = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Focus the input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Update input field with transcript when voice recognition is used
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
      if (!listening) {
        resetTranscript();
      }
    }
  }, [transcript, listening, resetTranscript]);

  return (
    <InputContainer>
      <SettingsButton onClick={onToggleSettings}>
        ⚙️
      </SettingsButton>
      
      <TextInput
        ref={inputRef}
        type="text"
        placeholder="Ask RevX something..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      
      {browserSupportsSpeechRecognition && (
        <IconButton 
          onClick={toggleVoiceInput} 
          isActive={listening}
          title={listening ? "Stop listening" : "Start voice input"}
        >
          {listening ? "⏹️" : "🎤"}
        </IconButton>
      )}
      
      <IconButton 
        onClick={handleSend} 
        disabled={!inputText.trim()}
        title="Send message"
      >
        ➤
      </IconButton>
    </InputContainer>
  );
};

export default InputControls;
