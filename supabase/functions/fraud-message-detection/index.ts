import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language = 'en' } = await req.json();
    
    if (!message || message.trim() === '') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing fraud message detection:', { message, language });

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY_MESSAGE') || Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured for message detection');
    }

    const analysisPrompt = `You are an expert in fraud detection and scam analysis. Analyze the following message for potential fraud indicators, scam patterns, and suspicious content.

Message to analyze:
"${message}"

Provide a detailed analysis in JSON format with the following structure:
{
  "riskLevel": "low" | "medium" | "high" | "critical",
  "score": number (0-100),
  "category": "lottery" | "phishing" | "investment" | "romance" | "job" | "impersonation" | "financial" | "unknown",
  "flags": string[] (specific fraud indicators found),
  "recommendations": string[] (what the user should do),
  "explanation": string (brief explanation of why this is or isn't a scam),
  "confidence": number (0-100, how confident you are in this assessment)
}

Look for:
- Urgent language and pressure tactics
- Requests for personal information or money
- Too-good-to-be-true offers
- Grammatical errors and suspicious formatting
- Impersonation of authorities or companies
- Suspicious links or contact information
- Financial fraud indicators
- Common scam patterns

Be thorough but concise. Focus on protecting the user from potential scams.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: analysisPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let analysisResult;

    try {
      // Get content from Gemini response
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('No valid response from Gemini');
      }
      
      const content = data.candidates[0].content.parts[0].text;
      
      // Try to parse as JSON
      try {
        analysisResult = JSON.parse(content);
      } catch (jsonError) {
        // Try to extract JSON from the response if it's wrapped
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```([\s\S]*?)```/) || content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          analysisResult = JSON.parse(jsonStr);
        } else {
          throw jsonError;
        }
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      // Fallback to basic analysis
      analysisResult = {
        riskLevel: 'medium',
        score: 50,
        category: 'unknown',
        flags: ['Unable to perform detailed AI analysis'],
        recommendations: ['Be cautious with this message', 'Do not share personal information'],
        explanation: 'AI analysis unavailable, please review the message carefully',
        confidence: 0
      };
    }

    // Ensure all required fields are present
    analysisResult = {
      riskLevel: analysisResult.riskLevel || 'medium',
      score: analysisResult.score || 50,
      category: analysisResult.category || 'unknown',
      flags: analysisResult.flags || [],
      recommendations: analysisResult.recommendations || [],
      explanation: analysisResult.explanation || '',
      confidence: analysisResult.confidence || 0,
      timestamp: new Date().toISOString()
    };

    console.log('Fraud analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fraud message detection:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
