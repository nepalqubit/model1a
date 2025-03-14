import { useState, useEffect, useCallback } from 'react';

interface SpeechSynthesisHook {
  speak: (text: string) => void;
  cancel: () => void;
  speaking: boolean;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  setVoice: (voice: SpeechSynthesisVoice) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
}

export function useSpeechSynthesis(): SpeechSynthesisHook {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  // Initialize and get voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSupported(true);
      
      // Function to set voices
      const setVoicesList = () => {
        const voicesList = window.speechSynthesis.getVoices();
        setVoices(voicesList);
        
        // Set default to a female voice if available
        const femaleVoice = voicesList.find(
          (voice) => voice.name.includes('female') || voice.name.includes('Female')
        );
        
        if (femaleVoice) {
          setCurrentVoice(femaleVoice);
        } else if (voicesList.length > 0) {
          setCurrentVoice(voicesList[0]);
        }
      };
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = setVoicesList;
      }
      
      // Initial attempt to get voices
      setVoicesList();
      
      // Ensure all voices are loaded
      setTimeout(setVoicesList, 200);
    }
  }, []);

  // Function to speak text
  const speak = useCallback(
    (text: string) => {
      if (!supported) return;
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      if (text.trim() === '') return;
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (currentVoice) {
        utterance.voice = currentVoice;
      }
      
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    },
    [supported, currentVoice, rate, pitch]
  );

  // Function to cancel speaking
  const cancel = useCallback(() => {
    if (!supported) return;
    
    setSpeaking(false);
    window.speechSynthesis.cancel();
  }, [supported]);

  // Function to set voice
  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice);
  }, []);

  return {
    speak,
    cancel,
    speaking,
    supported,
    voices,
    setVoice,
    setRate,
    setPitch
  };
}

export default useSpeechSynthesis;
