// AI Configuration for Live Chat Service
export const aiConfig = {
  // OpenAI API Configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: 'gpt-3.5-turbo',
    maxTokens: 500,
    temperature: 0.7,
    enabled: !!import.meta.env.VITE_OPENAI_API_KEY
  },

  // Local AI Configuration
  local: {
    enabled: true,
    responseDelay: {
      min: 1000, // 1 second
      max: 3000  // 3 seconds
    }
  },

  // Chat Configuration
  chat: {
    maxMessages: 50,
    autoScroll: true,
    typingIndicator: true,
    soundNotifications: false
  },

  // Support Topics
  supportTopics: [
    'login',
    'password',
    'test',
    'upload',
    'payment',
    'account',
    'technical',
    'general'
  ],

  // Response Templates
  templates: {
    greeting: "Hello! I'm your AI support assistant. How can I help you today?",
    fallback: "I'm sorry, I'm experiencing technical difficulties. Please try again or contact support.",
    escalation: "I understand your issue. Let me connect you with our human support team.",
    goodbye: "Thank you for chatting with us. Have a great day!"
  }
};

export default aiConfig;
