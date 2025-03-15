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
    
    // Handle single-word queries with a mapping of common terms
    if (normalizedQuestion.trim().split(/\s+/).length === 1) {
      const singleWord = normalizedQuestion.trim();
      // Map of common single-word queries to their full questions
      const singleWordMap: Record<string, string> = {
        // Service-related terms
        'services': 'What services does RevX offer?',
        'service': 'What services does RevX offer?',
        'offerings': 'What services does RevX offer?',
        'solutions': 'What services does RevX offer?',
        
        // Web development related terms
        'web': 'What is RevX\'s approach to web development?',
        'website': 'What is RevX\'s approach to web development?',
        'development': 'What is RevX\'s approach to web development?',
        'wordpress': 'What is RevX\'s approach to web development?',
        'sites': 'What is RevX\'s approach to web development?',
        
        // Revenue management related terms
        'revenue': 'How can RevX help my hotel increase revenue?',
        'pricing': 'How can RevX help my hotel increase revenue?',
        'rates': 'How can RevX help my hotel increase revenue?',
        'occupancy': 'How can RevX help my hotel increase revenue?',
        'profit': 'How can RevX help my hotel increase revenue?',
        'profitability': 'How can RevX help my hotel increase revenue?',
        
        // Hotel related terms
        'hotel': 'Does RevX specialize in services for hotels?',
        'hotels': 'Does RevX specialize in services for hotels?',
        'hospitality': 'Does RevX specialize in services for hotels?',
        'lodging': 'Does RevX specialize in services for hotels?',
        'accommodation': 'Does RevX specialize in services for hotels?',
        
        // Marketing related terms
        'marketing': 'What is RevX\'s approach to digital marketing?',
        'digital': 'What is RevX\'s approach to digital marketing?',
        'online': 'What is RevX\'s approach to digital marketing?',
        'advertising': 'What is RevX\'s approach to digital marketing?',
        'ads': 'What is RevX\'s approach to digital marketing?',
        'campaigns': 'What is RevX\'s approach to digital marketing?',
        
        // SEO related terms
        'seo': 'Can RevX assist with SEO for my hotel\'s website?',
        'search': 'Can RevX assist with SEO for my hotel\'s website?',
        'optimization': 'Can RevX assist with SEO for my hotel\'s website?',
        'rankings': 'Can RevX assist with SEO for my hotel\'s website?',
        
        // Social media related terms
        'social': 'What is RevX\'s approach to social media management?',
        'media': 'What is RevX\'s approach to social media management?',
        'facebook': 'What is RevX\'s approach to social media management?',
        'instagram': 'What is RevX\'s approach to social media management?',
        'twitter': 'What is RevX\'s approach to social media management?',
        'linkedin': 'What is RevX\'s approach to social media management?',
        
        // Contact related terms
        'contact': 'How can I get in touch with RevX for consulting services?',
        'email': 'How can I get in touch with RevX for consulting services?',
        'phone': 'How can I get in touch with RevX for consulting services?',
        'call': 'How can I get in touch with RevX for consulting services?',
        'reach': 'How can I get in touch with RevX for consulting services?',
        
        // Location related terms
        'international': 'Does RevX offer services outside the United States?',
        'global': 'Does RevX offer services outside the United States?',
        'worldwide': 'Does RevX offer services outside the United States?',
        'locations': 'Does RevX offer services outside the United States?',
        'offices': 'Does RevX offer services outside the United States?',
        'usa': 'Does RevX offer services outside the United States?',
        'nepal': 'Does RevX offer services outside the United States?',
        
        // Experience related terms
        'experience': 'What is the experience level of RevX in the industry?',
        'expertise': 'What is the experience level of RevX in the industry?',
        'background': 'What is the experience level of RevX in the industry?',
        'history': 'What is the experience level of RevX in the industry?',
        'years': 'What is the experience level of RevX in the industry?',
        
        // Channel management related terms
        'channel': 'Can RevX help with channel management for my hotel?',
        'ota': 'Can RevX help with channel management for my hotel?',
        'booking': 'Can RevX help with channel management for my hotel?',
        'distribution': 'Can RevX help with channel management for my hotel?',
        
        // Technology related terms
        'technology': 'How does RevX integrate technology solutions for businesses?',
        'tech': 'How does RevX integrate technology solutions for businesses?',
        'integration': 'How does RevX integrate technology solutions for businesses?',
        'systems': 'How does RevX integrate technology solutions for businesses?',
        'software': 'How does RevX integrate technology solutions for businesses?',
        'pms': 'How does RevX integrate technology solutions for businesses?',
        'crm': 'How does RevX integrate technology solutions for businesses?',
        
        // Privacy related terms
        'privacy': 'How does RevX handle client data and privacy?',
        'data': 'How does RevX handle client data and privacy?',
        'security': 'How does RevX handle client data and privacy?',
        'confidential': 'How does RevX handle client data and privacy?',
        'protection': 'How does RevX handle client data and privacy?',
        
        // Training related terms
        'training': 'Does RevX provide training for in-house teams?',
        'education': 'Does RevX provide training for in-house teams?',
        'learning': 'Does RevX provide training for in-house teams?',
        'skills': 'Does RevX provide training for in-house teams?',
        
        // Support related terms
        'support': 'What support does RevX offer after project completion?',
        'maintenance': 'What support does RevX offer after project completion?',
        'assistance': 'What support does RevX offer after project completion?',
        'help': 'What support does RevX offer after project completion?',
        
        // Team related terms
        'team': 'What is the experience level of RevX in the industry?',
        'staff': 'What is the experience level of RevX in the industry?',
        'employees': 'What is the experience level of RevX in the industry?',
        'experts': 'What is the experience level of RevX in the industry?',
        'consultants': 'What is the experience level of RevX in the industry?',
        
        // Tools related terms
        'tools': 'What tools and technologies does RevX use in its services?',
        'platforms': 'What tools and technologies does RevX use in its services?',
        'applications': 'What tools and technologies does RevX use in its services?',
        'apps': 'What tools and technologies does RevX use in its services?',
        
        // Trends related terms
        'trends': 'How does RevX stay updated with digital marketing trends?',
        'updates': 'How does RevX stay updated with digital marketing trends?',
        'innovations': 'How does RevX stay updated with digital marketing trends?',
        'latest': 'How does RevX stay updated with digital marketing trends?',
        'new': 'How does RevX stay updated with digital marketing trends?',
        
        // Company related terms
        'about': 'What is RevX all about?',
        'company': 'What is RevX all about?',
        'business': 'What is RevX all about?',
        'revx': 'What is RevX all about?',
        'who': 'What is RevX all about?'
      };
      
      // Check if the single word is in our mapping
      if (singleWordMap[singleWord]) {
        // Find the FAQ that matches the mapped question
        const mappedQuestion = singleWordMap[singleWord];
        const matchedFAQ = data.faq.find(
          faq => faq.question.toLowerCase() === mappedQuestion.toLowerCase()
        );
        
        if (matchedFAQ) {
          return communicationService.formatAnswer(matchedFAQ.answer, isFirstInteraction);
        }
      }
      
      // If no direct mapping, try fuzzy matching with service names
      const services = data.company_info.services;
      for (const service of services) {
        // Create variations of the service name for matching
        const serviceWords = service.toLowerCase().split(/\s+/);
        if (serviceWords.some(word => word.includes(singleWord) || singleWord.includes(word))) {
          // Find an FAQ that mentions this service
          const serviceMatch = data.faq.find(
            faq => faq.question.toLowerCase().includes(service.toLowerCase())
          );
          if (serviceMatch) {
            return communicationService.formatAnswer(serviceMatch.answer, isFirstInteraction);
          }
        }
      }
    }
    
    // Direct match in FAQs
    const directMatch = data.faq.find(
      faq => faq.question.toLowerCase().replace(/[^\w\s]/g, '') === normalizedQuestion
    );
    
    if (directMatch) {
      return communicationService.formatAnswer(directMatch.answer, isFirstInteraction);
    }
    
    // Enhanced keyword matching for short queries
    const keywordMatches: { item: FAQItem; matchScore: number }[] = [];
    
    data.faq.forEach(faq => {
      const questionWords = faq.question.toLowerCase().split(/\W+/).filter(word => word.length > 2);
      let matchScore = 0;
      
      // For short queries, give higher weight to exact matches
      const queryWords = normalizedQuestion.split(/\s+/).filter(word => word.length > 2);
      const isShortQuery = queryWords.length <= 3;
      
      questionWords.forEach(word => {
        if (normalizedQuestion.includes(word)) {
          // Give higher score for exact word matches in short queries
          matchScore += isShortQuery && queryWords.includes(word) ? 2 : 1;
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
