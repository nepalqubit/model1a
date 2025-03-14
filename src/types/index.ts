export interface CompanyInfo {
  name: string;
  website: string;
  headquarters: string;
  services: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Policy {
  name: string;
  description: string;
}

export interface TeamMember {
  name: string;
  position: string;
  bio: string;
}

export interface TrainingData {
  company_info: CompanyInfo;
  faq: FAQItem[];
  policies: Policy[];
  team: TeamMember[];
}

export interface Conversation {
  id: string;
  timestamp: Date;
  question: string;
  answer: string;
}

export interface AssistantSettings {
  voiceEnabled: boolean;
  voiceName: string;
  voiceRate: number;
  voicePitch: number;
}
