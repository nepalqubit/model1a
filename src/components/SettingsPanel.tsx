import React from 'react';
import styled from 'styled-components';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  voiceEnabled: boolean;
  onVoiceToggle: (enabled: boolean) => void;
  voiceRate: number;
  onVoiceRateChange: (rate: number) => void;
  voicePitch: number;
  onVoicePitchChange: (pitch: number) => void;
  selectedVoice: SpeechSynthesisVoice | null;
  availableVoices: SpeechSynthesisVoice[];
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
}

const SettingsOverlay = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOpen'
})<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const SettingsContainer = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--box-shadow);
  display: flex;
  flex-direction: column;
`;

const SettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
`;

const SettingsTitle = styled.h2`
  margin: 0;
  color: var(--primary-color);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--light-text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background-color var(--transition-speed);
  
  &:hover {
    background-color: var(--border-color);
  }
`;

const SettingsContent = styled.div`
  padding: 16px;
`;

const SettingItem = styled.div`
  margin-bottom: 20px;
`;

const SettingLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  margin-right: 10px;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: var(--primary-color);
  }
  
  &:focus + span {
    box-shadow: 0 0 1px var(--primary-color);
  }
  
  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--light-text-color);
  transition: 0.4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const RangeSlider = styled.input`
  width: 100%;
  margin: 10px 0;
`;

const SelectInput = styled.select`
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  font-size: 16px;
  background-color: white;
`;

const SwitchLabel = styled.span`
  font-weight: normal;
`;



const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  voiceEnabled,
  onVoiceToggle,
  voiceRate,
  onVoiceRateChange,
  voicePitch,
  onVoicePitchChange,
  selectedVoice,
  availableVoices,
  onVoiceChange
}) => {
  // Support only specific languages: US English, Chinese, Japanese, French, German, Korean, and Hindi

  // Filter voices to only include specific languages
  const supportedLangCodes = ['en-US', 'zh', 'zh-CN', 'zh-HK', 'zh-TW', 'ja', 'ja-JP', 'fr', 'fr-FR', 'de', 'de-DE', 'ko', 'ko-KR', 'hi', 'hi-IN'];
  
  // First filter by supported languages
  const languageFilteredVoices = availableVoices.filter(voice => 
    supportedLangCodes.some(langCode => voice.lang.startsWith(langCode))
  );

  // Then prefer high-quality voices
  const highQualityVoices = languageFilteredVoices.filter(voice => 
    // Check for markers of higher quality voices
    voice.name.includes('Enhanced') || 
    voice.name.includes('Neural') || 
    voice.name.includes('Premium') ||
    voice.localService === true // Local voices are often higher quality
  );

  // If we have high-quality voices, prioritize those, otherwise use all supported language voices
  const qualityVoices = highQualityVoices.length > 0 ? highQualityVoices : languageFilteredVoices;
  
  // Filter for natural-sounding voices (often female voices sound more natural)
  const naturalVoices = qualityVoices.filter(voice => 
    voice.name.toLowerCase().includes('female') || 
    voice.name.toLowerCase().includes('woman') ||
    voice.name.toLowerCase().includes('natural') ||
    voice.name.toLowerCase().includes('girl')
  );
  
  // Use natural voices if available, otherwise use all quality voices
  const displayVoices = naturalVoices.length > 0 ? naturalVoices : qualityVoices;
  
  return (
    <SettingsOverlay isOpen={isOpen} onClick={onClose}>
      <SettingsContainer onClick={e => e.stopPropagation()}>
        <SettingsHeader>
          <SettingsTitle>RevX Assistant Settings</SettingsTitle>
          <CloseButton onClick={onClose}>
            ✖
          </CloseButton>
        </SettingsHeader>
        
        <SettingsContent>
          <SettingItem>
            <SwitchContainer>
              <Switch>
                <SwitchInput 
                  type="checkbox" 
                  checked={voiceEnabled} 
                  onChange={e => onVoiceToggle(e.target.checked)} 
                />
                <Slider />
              </Switch>
              <SwitchLabel>Enable Voice Responses</SwitchLabel>
            </SwitchContainer>
          </SettingItem>
          
          {voiceEnabled && (
            <>
              <SettingItem>
                <SettingLabel htmlFor="voice-select">Select Voice (US English, Chinese, Japanese, French, German, Korean, Hindi)</SettingLabel>
                <SelectInput 
                  id="voice-select"
                  value={selectedVoice ? selectedVoice.name : ''}
                  onChange={e => {
                    const selected = availableVoices.find(voice => voice.name === e.target.value);
                    if (selected) onVoiceChange(selected);
                  }}
                >
                  {displayVoices.map(voice => {
                    // Inline language name mapping
                    const languageMap: Record<string, string> = {
                      'en-US': 'US English',
                      'en-GB': 'British English',
                      'zh': 'Chinese',
                      'zh-CN': 'Chinese (Mainland)',
                      'zh-HK': 'Chinese (Hong Kong)',
                      'zh-TW': 'Chinese (Taiwan)',
                      'ja': 'Japanese',
                      'ja-JP': 'Japanese',
                      'fr': 'French',
                      'fr-FR': 'French (France)',
                      'fr-CA': 'French (Canada)',
                      'de': 'German',
                      'de-DE': 'German (Germany)',
                      'ko': 'Korean',
                      'ko-KR': 'Korean',
                      'hi': 'Hindi',
                      'hi-IN': 'Hindi (India)'
                    };
                    const languageName = languageMap[voice.lang] || voice.lang;
                    
                    return (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({languageName})
                      </option>
                    );
                  })}
                </SelectInput>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel htmlFor="rate-slider">Speaking Rate: {voiceRate.toFixed(1)}</SettingLabel>
                <RangeSlider 
                  type="range" 
                  id="rate-slider"
                  min="0.7" 
                  max="1.5" 
                  step="0.05" 
                  value={voiceRate}
                  onChange={e => onVoiceRateChange(parseFloat(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Slower</span>
                  <span>Normal</span>
                  <span>Faster</span>
                </div>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel htmlFor="pitch-slider">Voice Pitch: {voicePitch.toFixed(1)}</SettingLabel>
                <RangeSlider 
                  type="range" 
                  id="pitch-slider"
                  min="0.8" 
                  max="1.2" 
                  step="0.05" 
                  value={voicePitch}
                  onChange={e => onVoicePitchChange(parseFloat(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Lower</span>
                  <span>Normal</span>
                  <span>Higher</span>
                </div>
              </SettingItem>
            </>
          )}
        </SettingsContent>
      </SettingsContainer>
    </SettingsOverlay>
  );
};

export default SettingsPanel;
