// Define common types used throughout the application

// Time of day types for greetings and contextual responses
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

// Chat message data structure
export interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Conversation structure for RevX Assistant
export interface Conversation {
  id: string;
  timestamp: Date;
  question: string;
  answer: string;
}

// Assistant settings structure
export interface AssistantSettings {
  voiceEnabled: boolean;
  voiceName: string;
  voiceRate: number;
  voicePitch: number;
}

// Training data JSON structure
export interface TrainingData {
  faq: FAQItem[];
  company_info: CompanyInfo;
  policies: PolicyItem[];
  team: TeamMember[];
}

// FAQ item structure
export interface FAQItem {
  question: string;
  answer: string;
  tags?: string[];
}

// Company information structure
export interface CompanyInfo {
  name: string;
  headquarters: string;
  founded: string;
  website: string;
  services: string[];
}

// Policy information structure
export interface PolicyItem {
  name: string;
  description: string;
  last_updated?: string;
}

// Team member information structure
export interface TeamMember {
  name: string;
  position: string;
  bio: string;
  joined?: string;
}
