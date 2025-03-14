import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import ChatContainer from './components/ChatContainer';
import InputControls from './components/InputControls';
import SettingsPanel from './components/SettingsPanel';
import { dataService } from './services/DataService';
import { communicationService } from './services/CommunicationService';
import { Conversation, AssistantSettings } from './types';
import useSpeechSynthesis from './hooks/useSpeechSynthesis';
import GlobalStyles from './styles/GlobalStyles';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
`;

const Header = styled.header`
  background-color: var(--primary-color);
  color: white;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--box-shadow);
`;

const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  
  span {
    margin-left: 10px;
  }
  
  img {
    height: 36px;
    width: auto;
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

function App() {
  // State for conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  // State for settings
  const [settings, setSettings] = useState<AssistantSettings>({
    voiceEnabled: true,
    voiceName: '',
    voiceRate: 1,
    voicePitch: 1
  });
  
  // State for settings panel
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Load voice synthesis
  const { speak, cancel, voices, supported, setVoice, setRate, setPitch, speaking } = useSpeechSynthesis();
  
  // Find default female voice when voices are loaded
  useEffect(() => {
    if (voices.length > 0) {
      const femaleVoice = voices.find(
        voice => voice.name.toLowerCase().includes('female') || 
                voice.name.toLowerCase().includes('woman')
      );
      
      // Set the default voice
      if (femaleVoice) {
        setVoice(femaleVoice);
        setSettings(prev => ({
          ...prev,
          voiceName: femaleVoice.name
        }));
      } else {
        setVoice(voices[0]);
        setSettings(prev => ({
          ...prev,
          voiceName: voices[0].name
        }));
      }
    }
  }, [voices, setVoice]);
  
  // Handler for sending a message
  const handleSendMessage = async (message: string) => {
    // Generate a unique ID for this conversation
    const id = uuidv4();
    const timestamp = new Date();
    
    // Create a new conversation with the question
    const newConversation: Conversation = {
      id,
      timestamp,
      question: message,
      answer: '...' // Placeholder while processing
    };
    
    // Add to state to show in UI immediately
    setConversations(prev => [...prev, newConversation]);
    
    try {
      // Process the message and get a response with first interaction context
      // Determine if this is the first interaction in this session
      const isFirstInteraction = conversations.length === 0;
      const answer = await dataService.findAnswer(message, isFirstInteraction);
      
      // Update the conversation with the actual answer
      setConversations(prev => 
        prev.map(convo => 
          convo.id === id ? { ...convo, answer } : convo
        )
      );
      
      // Speak the response if voice is enabled
      if (settings.voiceEnabled && supported) {
        speak(answer);
      }
      
      // Save conversation to local storage for persistence
      saveConversationToStorage({
        id,
        timestamp,
        question: message,
        answer
      });
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Update with error message
      setConversations(prev => 
        prev.map(convo => 
          convo.id === id ? { 
            ...convo, 
            answer: 'Sorry, I encountered an error processing your question. Please try again.' 
          } : convo
        )
      );
    }
  };
  
  // Load conversations from storage on component mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('revx_conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        // Convert string dates back to Date objects
        const formattedConversations = parsed.map((convo: any) => ({
          ...convo,
          timestamp: new Date(convo.timestamp)
        }));
        setConversations(formattedConversations);
      } catch (error) {
        console.error('Error parsing saved conversations:', error);
      }
    }
    
    // Load settings
    const savedSettings = localStorage.getItem('revx_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);
  
  // Save settings when they change
  useEffect(() => {
    localStorage.setItem('revx_settings', JSON.stringify(settings));
    
    // Update speech settings
    setRate(settings.voiceRate);
    setPitch(settings.voicePitch);
    
    const selectedVoice = voices.find(voice => voice.name === settings.voiceName);
    if (selectedVoice) {
      setVoice(selectedVoice);
    }
  }, [settings, setRate, setPitch, setVoice, voices]);
  
  // Save conversation to local storage
  const saveConversationToStorage = (conversation: Conversation) => {
    try {
      const savedConversations = localStorage.getItem('revx_conversations') || '[]';
      const parsed = JSON.parse(savedConversations);
      parsed.push(conversation);
      localStorage.setItem('revx_conversations', JSON.stringify(parsed));
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };
  
  // Handlers for settings
  const handleVoiceToggle = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, voiceEnabled: enabled }));
    
    if (!enabled && speaking) {
      cancel();
    }
  };
  
  const handleVoiceRateChange = (rate: number) => {
    setSettings(prev => ({ ...prev, voiceRate: rate }));
  };
  
  const handleVoicePitchChange = (pitch: number) => {
    setSettings(prev => ({ ...prev, voicePitch: pitch }));
  };
  
  const handleVoiceChange = (voice: SpeechSynthesisVoice) => {
    setSettings(prev => ({ ...prev, voiceName: voice.name }));
  };
  
  return (
    <AppContainer>
      <GlobalStyles />
      
      <Header>
        <Logo>
          <img src="/revx_logo.svg" alt="RevX Logo" />
          <span>Assistant</span>
        </Logo>
      </Header>
      
      <MainContent>
        <ChatContainer conversations={conversations} />
        <InputControls 
          onSendMessage={handleSendMessage} 
          onToggleSettings={() => setIsSettingsOpen(true)} 
        />
      </MainContent>
      
      <SettingsPanel 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        voiceEnabled={settings.voiceEnabled}
        onVoiceToggle={handleVoiceToggle}
        voiceRate={settings.voiceRate}
        onVoiceRateChange={handleVoiceRateChange}
        voicePitch={settings.voicePitch}
        onVoicePitchChange={handleVoicePitchChange}
        selectedVoice={voices.find(voice => voice.name === settings.voiceName) || null}
        availableVoices={voices}
        onVoiceChange={handleVoiceChange}
      />
    </AppContainer>
  );
}

export default App;
