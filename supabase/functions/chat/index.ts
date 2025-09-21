import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { chat_id, user_id, message, anonymous_session } = await req.json();
    
    if (!message || message.trim() === '') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Received chat request:', { chat_id, user_id, message, anonymous_session });

    let chatId = chat_id;
    
    // Create new chat if chat_id is not provided
    if (!chatId) {
      const chatData: any = {
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      };
      
      if (user_id) {
        chatData.user_id = user_id;
      } else {
        chatData.anonymous_session = anonymous_session || crypto.randomUUID();
      }

      const { data: chat, error: chatError } = await supabaseClient
        .from('chats')
        .insert(chatData)
        .select()
        .single();

      if (chatError) {
        console.error('Error creating chat:', chatError);
        return new Response(JSON.stringify({ error: 'Failed to create chat' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      chatId = chat.id;
    }

    // Save user message
    const { error: userMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        message: message,
        role: 'user',
      });

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError);
      return new Response(JSON.stringify({ error: 'Failed to save message' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get AI response from Gemini
    let aiResponse = '';
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (geminiApiKey) {
      try {
        const systemPrompt = 'You are CyberCop AI, a helpful assistant specializing in cybersecurity, cyber safety, scam reporting, and FIR filing. Provide accurate, helpful information about filing FIRs, reporting scams, identifying fraudulent activities, password security, and general cyber safety. Keep responses concise but informative.';
        const fullPrompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;
        
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 500,
              stopSequences: []
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              }
            ]
          }),
        });

        const geminiData = await geminiResponse.json();
        
        if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
          aiResponse = geminiData.candidates[0].content.parts[0].text;
        } else {
          console.log('No valid Gemini response, using fallback');
          aiResponse = getFallbackResponse(message);
        }
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError);
        aiResponse = getFallbackResponse(message);
      }
    } else {
      console.log('Gemini API key not found, using fallback response');
      aiResponse = getFallbackResponse(message);
    }

    // Save AI response
    const { error: aiMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        message: aiResponse,
        role: 'assistant',
      });

    if (aiMessageError) {
      console.error('Error saving AI message:', aiMessageError);
      return new Response(JSON.stringify({ error: 'Failed to save AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      chat_id: chatId,
      message: aiResponse 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: getFallbackResponse('') 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('fir') || lowerMessage.includes('file') || lowerMessage.includes('complaint')) {
    return "To file an FIR (First Information Report), visit your nearest police station or use online portals available in your state. You'll need to provide details about the incident, date, time, location, and any evidence. For cyber crimes, you can also file complaints at cybercrime.gov.in.";
  }
  
  if (lowerMessage.includes('scam') || lowerMessage.includes('fraud') || lowerMessage.includes('suspicious')) {
    return "If you've received a suspicious message or encountered a potential scam, don't share personal information or click suspicious links. Report it to cybercrime.gov.in, block the sender, and warn others. Common signs include urgent requests for money, grammar mistakes, and unsolicited offers.";
  }
  
  if (lowerMessage.includes('url') || lowerMessage.includes('link') || lowerMessage.includes('website')) {
    return "To check if a URL is safe: Look for HTTPS, verify the domain spelling, use online tools like VirusTotal, avoid shortened URLs from unknown sources, and never enter personal information on suspicious sites. If unsure, don't click the link.";
  }
  
  if (lowerMessage.includes('password') || lowerMessage.includes('security')) {
    return "For strong passwords: Use at least 12 characters, include uppercase, lowercase, numbers, and symbols. Avoid personal information, use unique passwords for each account, enable two-factor authentication, and consider using a password manager.";
  }
  
  return "I'm here to help with cybersecurity questions, filing FIRs, reporting scams, and general cyber safety. You can ask about password security, identifying fraudulent activities, or how to report cybercrimes. What specific topic would you like guidance on?";
}