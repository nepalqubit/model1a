import { TimeOfDay } from '../types';

/**
 * CommunicationService handles the formatting and style of the assistant's responses
 * including greetings, polite phrases, and contextual responses based on time of day.
 */
class CommunicationService {
  /**
   * Determine the time of day (morning, afternoon, evening, night) based on current hour
   */
  getTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 17) {
      return 'afternoon';
    } else if (hour >= 17 && hour < 22) {
      return 'evening';
    } else {
      return 'night';
    }
  }

  /**
   * Get a greeting appropriate for the current time of day
   */
  getTimeBasedGreeting(): string {
    const timeOfDay = this.getTimeOfDay();
    const greetings: Record<TimeOfDay, string[]> = {
      morning: [
        'Good morning!',
        'Hello and good morning!',
        'Morning! How can I assist you today?',
      ],
      afternoon: [
        'Good afternoon!',
        'Hello! Hope you\'re having a pleasant afternoon.',
        'Good day! How may I help you?',
      ],
      evening: [
        'Good evening!',
        'Hello and good evening!',
        'Evening! How can I be of service?',
      ],
      night: [
        'Hello there!',
        'Greetings! How can I assist you tonight?',
        'Hello! How may I help you?',
      ]
    };
    
    // Randomly select one of the greetings for variety
    const options = greetings[timeOfDay];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Format the answer with polite phrases and proper greeting
   */
  formatAnswer(answer: string, isFirstInteraction: boolean = false): string {
    // Add greeting if this is the first interaction
    const greeting = isFirstInteraction ? `${this.getTimeBasedGreeting()} ` : '';
    
    // Collection of polite phrases to inject into responses
    const politePrefixes = [
      "I'd be happy to help you with that. ",
      "I appreciate your question. ",
      "Thank you for asking. ",
      "I'm pleased to assist you. ",
      "That's a great question. "
    ];

    const politeClosings = [
      " Is there anything else you'd like to know?",
      " Can I assist you with anything more?",
      " Please feel free to ask if you have other questions.",
      " I'm here to help if you need more information."
    ];

    // Skip polite prefixes for short answers or answers that already have a greeting
    const shouldAddPrefix = answer.length > 20 && !answer.startsWith("Here") && !answer.startsWith("I don't");
    const prefix = shouldAddPrefix ? politePrefixes[Math.floor(Math.random() * politePrefixes.length)] : '';
    
    // Only add closing to longer answers that aren't error messages
    const shouldAddClosing = answer.length > 100 && !answer.includes("don't have specific information");
    const closing = shouldAddClosing ? politeClosings[Math.floor(Math.random() * politeClosings.length)] : '';
    
    return `${greeting}${prefix}${answer}${closing}`;
  }
  
  /**
   * Get a personalized response based on the user's query and context
   */
  getPersonalizedResponse(query: string): string | null {
    // Convert query to lowercase for easier matching
    const lowercaseQuery = query.toLowerCase();
    
    // Handle greetings
    if (lowercaseQuery.match(/^(hi|hello|hey|greetings).*/)) {
      return this.getTimeBasedGreeting() + " How may I assist you today?";
    }
    
    // Handle thank you messages
    if (lowercaseQuery.match(/thank you|thanks|thank/)) {
      return "You're very welcome! It's my pleasure to assist you.";
    }
    
    // Handle goodbye/farewell
    if (lowercaseQuery.match(/bye|goodbye|farewell|see you|talk to you later/)) {
      return "Goodbye! Have a wonderful " + this.getTimeOfDay() + ". Feel free to return if you have more questions!";
    }
    
    // Handle "how are you" type questions
    if (lowercaseQuery.match(/how are you|how do you do|how is it going/)) {
      return "I'm doing well, thank you for asking! I'm here and ready to assist you with information about RevX. How can I help you today?";
    }
    
    // Returning null means no personalized response was found
    return null;
  }
}

export const communicationService = new CommunicationService();
