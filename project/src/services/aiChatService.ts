// AI Chat Service for Live Support
// This service provides intelligent responses for the live chat feature

import { supabase } from '../lib/supabase';

interface AIResponse {
  text: string;
  confidence: number;
  suggestedActions?: string[];
  category?: string;
}

class AIChatService {
  private conversationHistory: any[] = [];

  async generateResponse(userMessage: string): Promise<AIResponse> {
    try {
      // Add to conversation history
      this.conversationHistory.push({ role: 'user', content: userMessage });
      
      // Try external AI API first
      const externalResponse = await this.tryExternalAI(userMessage);
      if (externalResponse) {
        this.conversationHistory.push({ role: 'assistant', content: externalResponse.text });
        return externalResponse;
      }

      // Fallback to local intelligent responses
      const localResponse = this.generateLocalResponse(userMessage);
      this.conversationHistory.push({ role: 'assistant', content: localResponse.text });
      return localResponse;
    } catch (error) {
      // Silent error handling for security
      return this.getFallbackResponse(userMessage);
    }
  }

  private async tryExternalAI(userMessage: string): Promise<AIResponse | null> {
    // The OpenAI call itself runs server-side in the `ai-chat` Supabase Edge
    // Function, which holds OPENAI_API_KEY as a server-only secret. This
    // service never reads or forwards an API key from the client bundle.
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage,
          history: this.conversationHistory.slice(-10),
        },
      });

      if (error || !data?.text) return null;

      return {
        text: data.text,
        confidence: 0.9,
        suggestedActions: ['Contact Support', 'Try Again'],
        category: 'ai_generated'
      };
    } catch (error) {
      // External AI unavailable, using local fallback
    }

    return null;
  }

  private generateLocalResponse(userMessage: string): AIResponse {
    const lowerMessage = userMessage.toLowerCase();
    
    const responses = {
      login: {
        text: `I can help you with login issues. Here are the most common solutions:

🔐 **Login Troubleshooting:**
1. **Email Verification**: Ensure your email is verified
2. **Password Reset**: Use 'Forgot Password' if you can't remember
3. **Browser Issues**: Clear cache and cookies, try incognito mode
4. **Account Status**: Check if your account is active

📧 **Quick Actions:**
• Reset Password: Go to login page → "Forgot Password"
• Email Support: support@gatepreportal.com
• Call Support: +91-8757010589

If the issue persists, please provide your email address for specific assistance.`,
        confidence: 0.95,
        actions: ['Reset Password', 'Clear Cache', 'Contact Support'],
        category: 'authentication'
      },
      
      password: {
        text: `🔑 **Password Reset Process:**

1. **Go to Login Page** → Click "Forgot Password"
2. **Enter Email** → Use your registered email address
3. **Check Email** → Look for reset link (check spam folder)
4. **Click Reset Link** → Set new password
5. **Login** → Use new password

⏰ **Reset Link Expires**: 24 hours
📧 **Email Not Received**: Check spam/junk folder
🔄 **Still Having Issues**: Contact support with your email

**Support Contact:**
• Email: support@gatepreportal.com
• Phone: +91-8757010589`,
        confidence: 0.95,
        actions: ['Request Reset', 'Check Email', 'Contact Support'],
        category: 'authentication'
      },
      
      test: {
        text: `📝 **Test & Exam Support:**

**Common Issues & Solutions:**

🔄 **Test Not Loading:**
• Clear browser cache and cookies
• Try different browser (Chrome, Firefox, Safari, Edge)
• Check internet connection
• Disable browser extensions

⏱️ **Time Management:**
• Tests have specific time limits
• Timer is visible during test
• Auto-submit when time expires
• Save answers regularly

📊 **Submission Issues:**
• Ensure all questions are answered
• Check internet before submitting
• Contact support if submission fails

**Quick Fixes:**
• Refresh page if test freezes
• Use incognito/private mode
• Try mobile device if desktop fails

Need help with a specific test issue?`,
        confidence: 0.9,
        actions: ['Clear Cache', 'Try Different Browser', 'Check Connection'],
        category: 'testing'
      },
      
      upload: {
        text: `📁 **File Upload Support:**

**Supported Formats:**
• Documents: PDF, DOC, DOCX
• Images: JPG, JPEG, PNG
• Maximum Size: 50MB per file

**Upload Issues & Solutions:**

📏 **File Too Large:**
• Compress images before upload
• Convert to PDF if possible
• Split large documents

❌ **Format Not Supported:**
• Convert to supported format
• Use online converters
• Contact support for guidance

🔄 **Upload Fails:**
• Check internet connection
• Try different browser
• Upload during off-peak hours
• Clear browser cache

**Pro Tips:**
• Use Chrome or Firefox for best compatibility
• Ensure stable internet connection
• Keep file names simple (no special characters)

What type of file are you trying to upload?`,
        confidence: 0.9,
        actions: ['Check File Size', 'Convert Format', 'Try Different Browser'],
        category: 'file_management'
      },
      
      payment: {
        text: `💳 **Payment & Billing Support:**

**Payment Methods:**
• Credit/Debit Cards
• UPI (Google Pay, PhonePe, Paytm)
• Net Banking
• Digital Wallets

**Common Issues:**

❌ **Payment Failed:**
• Check card details and expiry
• Ensure sufficient funds
• Try different payment method
• Contact bank if needed

⏳ **Payment Pending:**
• Wait 10-15 minutes for processing
• Check email for confirmation
• Contact support if pending > 30 minutes

💰 **Refund Requests:**
• Provide transaction ID
• Email: billing@gatepreportal.com
• Processing time: 5-7 business days

**Urgent Support:**
• Phone: +91-8757010589
• Email: support@gatepreportal.com
• Available: 9 AM - 6 PM IST

What payment issue are you experiencing?`,
        confidence: 0.85,
        actions: ['Check Transaction', 'Request Refund', 'Contact Billing'],
        category: 'billing'
      },
      
      account: {
        text: `👤 **Account Management:**

**Profile Updates:**
• Go to Profile section
• Update personal information
• Change profile picture
• Update contact details

**Account Settings:**
• Change password
• Update email preferences
• Manage notifications
• Privacy settings

**Account Issues:**
• Email change requires support assistance
• Account suspension: Contact support
• Data export: Available in settings
• Account deletion: Email support

**Security Tips:**
• Use strong password
• Enable 2FA if available
• Log out from shared devices
• Monitor login activity

**Support Contact:**
• Email: support@gatepreportal.com
• Phone: +91-8757010589

What account issue do you need help with?`,
        confidence: 0.9,
        actions: ['Update Profile', 'Change Password', 'Contact Support'],
        category: 'account'
      },
      
      technical: {
        text: `🔧 **Technical Support:**

**Browser Compatibility:**
✅ **Recommended:** Chrome, Firefox, Safari, Edge
❌ **Not Supported:** Internet Explorer

**Performance Issues:**
• Clear browser cache and cookies
• Disable browser extensions
• Try incognito/private mode
• Update browser to latest version

**Mobile Issues:**
• Use mobile browser (not app)
• Enable JavaScript
• Allow cookies and popups
• Check mobile data connection

**Error Messages:**
• Take screenshot of error
• Note error code if shown
• Contact support with details

**Quick Diagnostics:**
• Internet speed test
• Browser console errors
• Device compatibility check

**Emergency Support:**
• Phone: +91-8757010589
• Email: support@gatepreportal.com

Describe the specific error you're seeing.`,
        confidence: 0.85,
        actions: ['Clear Cache', 'Update Browser', 'Check Extensions'],
        category: 'technical'
      },

      resume: {
        text: `📄 **Resume Builder Support:**

**Features Available:**
• Multiple professional templates
• Real-time preview
• Auto-save functionality
• PDF export
• Customizable sections

**Common Questions:**

💾 **Saving Issues:**
• Resume auto-saves every 30 seconds
• Manual save button available
• Data stored locally in browser
• Clear browser data = lose progress

📤 **Export Problems:**
• PDF export requires stable internet
• Try different browser for export
• Check file size limits
• Contact support if export fails

🎨 **Customization:**
• Change colors and fonts
• Reorder sections
• Add/remove content blocks
• Preview in real-time

**Tips:**
• Save frequently
• Use professional templates
• Keep content concise
• Proofread before export

Need help with specific resume builder feature?`,
        confidence: 0.9,
        actions: ['Save Resume', 'Export PDF', 'Customize Template'],
        category: 'resume_builder'
      },

      general: {
        text: `👋 **Welcome to Gate Preparation Portal Support!**

I'm here to help you with any questions about our platform. Here are some common topics I can assist with:

🔐 **Account & Login Issues**
📝 **Test & Exam Problems** 
📁 **File Upload Issues**
💳 **Payment & Billing**
👤 **Profile Management**
📄 **Resume Builder Help**
🔧 **Technical Support**

**Quick Support:**
• Email: support@gatepreportal.com
• Phone: +91-8757010589
• Available: 9 AM - 6 PM IST

What can I help you with today?`,
        confidence: 0.8,
        actions: ['Login Help', 'Test Issues', 'Payment Support'],
        category: 'general'
      }
    };

    // Check for specific keywords and return appropriate response
    if (lowerMessage.includes('login') || lowerMessage.includes('sign in') || lowerMessage.includes('log in')) {
      return responses.login;
    }
    
    if (lowerMessage.includes('password') || lowerMessage.includes('reset') || lowerMessage.includes('forgot')) {
      return responses.password;
    }
    
    if (lowerMessage.includes('test') || lowerMessage.includes('exam') || lowerMessage.includes('quiz')) {
      return responses.test;
    }
    
    if (lowerMessage.includes('upload') || lowerMessage.includes('file') || lowerMessage.includes('document')) {
      return responses.upload;
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('billing') || lowerMessage.includes('money') || lowerMessage.includes('pay')) {
      return responses.payment;
    }
    
    if (lowerMessage.includes('account') || lowerMessage.includes('profile') || lowerMessage.includes('settings')) {
      return responses.account;
    }
    
    if (lowerMessage.includes('resume') || lowerMessage.includes('cv') || lowerMessage.includes('builder')) {
      return responses.resume;
    }
    
    if (lowerMessage.includes('error') || lowerMessage.includes('bug') || lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
      return responses.technical;
    }
    
    // Default to general response
    return responses.general;
  }

  private getFallbackResponse(userMessage: string): AIResponse {
    return {
      text: `I apologize, but I'm having trouble processing your request right now. Please try one of these options:

📧 **Email Support**: support@gatepreportal.com
📞 **Phone Support**: +91-8757010589
🕐 **Hours**: 9 AM - 6 PM IST

Your message: "${userMessage}"

I'll make sure our team gets back to you as soon as possible.`,
      confidence: 0.5,
      suggestedActions: ['Email Support', 'Call Support'],
      category: 'fallback'
    };
  }
}

// Export the service instance
export const aiChatService = new AIChatService();