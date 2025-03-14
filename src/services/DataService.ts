import { TrainingData, FAQItem } from '../types';
import { communicationService } from './CommunicationService';

class DataService {
  private data: TrainingData | null = null;
  private isLoading: boolean = false;
  private loadError: Error | null = null;

  async fetchTrainingData(): Promise<TrainingData> {
    if (this.data) {
      return this.data;
    }

    if (this.isLoading) {
      // Wait for the current fetch to complete
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (!this.isLoading) {
            clearInterval(checkInterval);
            if (this.loadError) {
              reject(this.loadError);
            } else if (this.data) {
              resolve(this.data);
            }
          }
        }, 100);
      });
    }

    this.isLoading = true;
    try {
      const response = await fetch('/data/training-data.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch training data: ${response.statusText}`);
      }
      this.data = await response.json();
      if (!this.data) {
        throw new Error('Failed to parse training data');
      }
      return this.data as TrainingData;
    } catch (error) {
      this.loadError = error instanceof Error ? error : new Error(String(error));
      throw this.loadError;
    } finally {
      this.isLoading = false;
    }
  }

  async findAnswer(question: string, isFirstInteraction: boolean = false): Promise<string> {
    // Check for personalized responses first (greetings, thanks, etc.)
    const personalizedResponse = communicationService.getPersonalizedResponse(question);
    if (personalizedResponse) {
      return personalizedResponse;
    }
    const data = await this.fetchTrainingData();
    
    // Normalize the question for comparison (lowercase, remove punctuation)
    const normalizedQuestion = question.toLowerCase().replace(/[^\w\s]/g, '');
    
    // Direct match in FAQs
    const directMatch = data.faq.find(
      faq => faq.question.toLowerCase().replace(/[^\w\s]/g, '') === normalizedQuestion
    );
    
    if (directMatch) {
      return communicationService.formatAnswer(directMatch.answer, isFirstInteraction);
    }
    
    // Keyword matching
    const keywordMatches: { item: FAQItem; matchScore: number }[] = [];
    
    data.faq.forEach(faq => {
      const questionWords = faq.question.toLowerCase().split(/\W+/).filter(word => word.length > 2);
      let matchScore = 0;
      
      questionWords.forEach(word => {
        if (normalizedQuestion.includes(word)) {
          matchScore += 1;
        }
      });
      
      if (matchScore > 0) {
        keywordMatches.push({ item: faq, matchScore });
      }
    });
    
    // Sort by match score
    keywordMatches.sort((a, b) => b.matchScore - a.matchScore);
    
    if (keywordMatches.length > 0) {
      return communicationService.formatAnswer(keywordMatches[0].item.answer, isFirstInteraction);
    }
    
    // Check for service-related questions
    const services = data.company_info.services;
    for (const service of services) {
      if (normalizedQuestion.includes(service.toLowerCase().replace(/[^\w\s]/g, ''))) {
        const serviceMatch = data.faq.find(
          faq => faq.question.toLowerCase().includes(service.toLowerCase())
        );
        if (serviceMatch) {
          return communicationService.formatAnswer(serviceMatch.answer, isFirstInteraction);
        }
      }
    }
    
    // Check for company info related questions
    if (normalizedQuestion.includes('about') || 
        normalizedQuestion.includes('company') || 
        normalizedQuestion.includes('revx')) {
      const companyInfo = `RevX is a digital advertising company headquartered in ${data.company_info.headquarters}. 
      We offer services including ${data.company_info.services.join(', ')}. 
      You can learn more at ${data.company_info.website}.`;
      return communicationService.formatAnswer(companyInfo, isFirstInteraction);
    }
    
    // Check for policy related questions
    if (normalizedQuestion.includes('policy') || 
        normalizedQuestion.includes('security') || 
        normalizedQuestion.includes('privacy')) {
      const policyInfo = data.policies.map(policy => `${policy.name}: ${policy.description}`).join('\n\n');
      const policyResponse = `Here are RevX's policies:\n\n${policyInfo}`;
      return communicationService.formatAnswer(policyResponse, isFirstInteraction);
    }
    
    // Check for team related questions
    if (normalizedQuestion.includes('team') || 
        normalizedQuestion.includes('staff') || 
        normalizedQuestion.includes('employees')) {
      const teamInfo = data.team.map(member => `${member.name} - ${member.position}: ${member.bio}`).join('\n\n');
      const teamResponse = `Here's information about the RevX team:\n\n${teamInfo}`;
      return communicationService.formatAnswer(teamResponse, isFirstInteraction);
    }
    
    // Fallback response with formatting for politeness
    const fallbackResponse = "I don't have specific information about that. Would you like to know about RevX's services, policies, or team?";
    return communicationService.formatAnswer(fallbackResponse, isFirstInteraction);
  }
}

export const dataService = new DataService();
