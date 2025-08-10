// AI Chat Service for Live Support
// This service provides intelligent responses for the live chat feature

interface AIResponse {
  text: string;
  confidence: number;
  suggestedActions?: string[];
}

class AIChatService {
  private conversationHistory: any[] = [];

  async generateResponse(userMessage: string): Promise<AIResponse> {
    try {
      // Try external AI API first
      const externalResponse = await this.tryExternalAI(userMessage);
      if (externalResponse) {
        return externalResponse;
      }

      // Fallback to local intelligent responses
      return this.generateLocalResponse(userMessage);
    } catch (error) {
      console.error('AI response generation error:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  private async tryExternalAI(userMessage: string): Promise<AIResponse | null> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) return null;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an AI support assistant for Gate Preparation Portal. Help users with technical issues, account problems, and general inquiries. Be helpful and professional.'
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (aiResponse) {
        return {
          text: aiResponse,
          confidence: 0.9,
          suggestedActions: ['Contact Support', 'Try Again']
        };
      }
    } catch (error) {
      console.warn('External AI unavailable, using local fallback');
    }

    return null;
  }

  private generateLocalResponse(userMessage: string): AIResponse {
    const lowerMessage = userMessage.toLowerCase();
    
    const responses = {
      login: {
        text: `I can help you with login issues. Please try:
1. Check if your email is verified
2. Reset your password using 'Forgot Password'
3. Clear browser cache and cookies
4. Try a different browser

If the issue persists, contact support with your email address.`,
        confidence: 0.95,
        actions: ['Reset Password', 'Clear Cache', 'Contact Support']
      },
      
      password: {
        text: `To reset your password:
1. Go to login page
2. Click 'Forgot Password'
3. Enter your email address
4. Check email for reset link
5. Follow instructions

Check spam folder if you don't receive the email.`,
        confidence: 0.95,
        actions: ['Request Reset', 'Check Email', 'Contact Support']
      },
      
      test: {
        text: `For test-related issues:
1. Ensure stable internet connection
2. Clear browser cache
3. Try refreshing the page
4. Use supported browsers (Chrome, Firefox, Safari, Edge)
5. Check if test time hasn't expired

What specific issue are you experiencing?`,
        confidence: 0.9,
        actions: ['Clear Cache', 'Try Different Browser', 'Check Connection']
      },
      
      upload: {
        text: `For file upload issues:
1. Check file size (max 50MB)
2. Ensure supported format (PDF, DOC, DOCX, JPG, PNG)
3. Try uploading during off-peak hours
4. Check internet connection
5. Try different browser

What type of file are you uploading?`,
        confidence: 0.9,
        actions: ['Check File Size', 'Convert Format', 'Try Different Browser']
      },
      
      payment: {
        text: `For payment queries:
1. Check payment method validity
2. Ensure sufficient funds
3. Try different payment method
4. Contact bank if transaction pending
5. Check email for confirmation

For refunds, provide transaction ID to support.
For urgent payment issues, call: +91-8757010589 or +91-8519947343`,
        confidence: 0.85,
        actions: ['Check Transaction', 'Request Refund', 'Contact Billing']
      },
      
      account: {
        text: `For account issues:
1. Verify email address
2. Update profile information
3. Check account status
4. Contact support for email changes
5. Ensure account isn't suspended

What specific account issue are you facing?`,
        confidence: 0.9,
        actions: ['Update Profile', 'Change Password', 'Contact Support']
      },
      
      technical: {
        text: `For technical issues:
1. Clear browser cache and cookies
2. Try incognito/private mode
3. Update browser to latest version
4. Disable browser extensions
5. Try different device

Describe the specific error message you're seeing.`,
        confidence: 0.85,
        actions: ['Clear Cache', 'Update Browser', 'Check Extensions']
      },
      
      general: {
        text: `Hello! I'm your AI support assistant. I can help with:
• Login and password issues
• Test problems and navigation
• File upload difficulties
• Payment and billing questions
• Account management
• Technical troubleshooting

What would you like help with?`,
        confidence: 0.8,
        actions: ['Account Help', 'Test Support', 'Technical Issues']
      }
    };

    if (lowerMessage.includes('login') || lowerMessage.includes('sign in')) {
      return responses.login;
    } else if (lowerMessage.includes('password') || lowerMessage.includes('reset')) {
      return responses.password;
    } else if (lowerMessage.includes('test') || lowerMessage.includes('exam')) {
      return responses.test;
    } else if (lowerMessage.includes('upload') || lowerMessage.includes('file')) {
      return responses.upload;
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('billing')) {
      return responses.payment;
    } else if (lowerMessage.includes('account') || lowerMessage.includes('profile')) {
      return responses.account;
    } else if (lowerMessage.includes('error') || lowerMessage.includes('technical')) {
      return responses.technical;
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
      return responses.general;
    } else {
      return {
        text: `I understand you're asking about "${userMessage}". Could you provide more specific details about your issue so I can give you better assistance?`,
        confidence: 0.6,
        actions: ['Provide Details', 'Contact Support']
      };
    }
  }

  private getFallbackResponse(userMessage: string): AIResponse {
    return {
      text: `I'm sorry, I'm experiencing technical difficulties. Please try:
1. Refresh the page and try again
2. Contact support: support@gatepreportal.com
3. Call us: +91-8757010589 or +91-8519947343

Thank you for your patience!`,
      confidence: 0.3,
      actions: ['Refresh Page', 'Email Support', 'Call Support']
    };
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}

export const aiChatService = new AIChatService();
export default aiChatService;
