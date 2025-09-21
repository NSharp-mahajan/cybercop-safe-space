// Mock chat service for local development
// This replaces the Supabase Edge Function calls when running locally

interface ChatResponse {
  chat_id: string;
  message: string;
}

interface ChatRequest {
  chat_id?: string;
  user_id?: string;
  message: string;
  anonymous_session?: string;
}

export const mockChatService = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const chatId = request.chat_id || crypto.randomUUID();
    const message = request.message.toLowerCase();
    
    let response = '';
    
    if (message.includes('fir') || message.includes('file') || message.includes('complaint')) {
      response = "To file an FIR (First Information Report), visit your nearest police station or use online portals available in your state. You'll need to provide details about the incident, date, time, location, and any evidence. For cyber crimes, you can also file complaints at cybercrime.gov.in.";
    } else if (message.includes('scam') || message.includes('fraud') || message.includes('suspicious')) {
      response = "If you've received a suspicious message or encountered a potential scam, don't share personal information or click suspicious links. Report it to cybercrime.gov.in, block the sender, and warn others. Common signs include urgent requests for money, grammar mistakes, and unsolicited offers.";
    } else if (message.includes('url') || message.includes('link') || message.includes('website')) {
      response = "To check if a URL is safe: Look for HTTPS, verify the domain spelling, use online tools like VirusTotal, avoid shortened URLs from unknown sources, and never enter personal information on suspicious sites. If unsure, don't click the link.";
    } else if (message.includes('password') || message.includes('security')) {
      response = "For strong passwords: Use at least 12 characters, include uppercase, lowercase, numbers, and symbols. Avoid personal information, use unique passwords for each account, enable two-factor authentication, and consider using a password manager.";
    } else {
      response = "I'm here to help with cybersecurity questions, filing FIRs, reporting scams, and general cyber safety. You can ask about password security, identifying fraudulent activities, or how to report cybercrimes. What specific topic would you like guidance on?";
    }
    
    return {
      chat_id: chatId,
      message: response
    };
  }
};
