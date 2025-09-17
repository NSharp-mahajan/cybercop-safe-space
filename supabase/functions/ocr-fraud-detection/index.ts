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
    const { image } = await req.json();
    
    if (!image) {
      throw new Error('No image data provided');
    }

    console.log('Processing OCR fraud detection request');

    // Call OpenAI Vision API to analyze the document
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert fraud detection analyst specializing in document analysis. Analyze the provided document image for:

1. **Text Extraction**: Extract all visible text content
2. **Fraud Indicators**: Look for signs of document tampering, inconsistencies, suspicious formatting, fake logos, or altered information
3. **Document Type**: Identify what type of document this is (invoice, ID, certificate, etc.)
4. **Risk Assessment**: Rate the fraud risk from 1-10 (1=legitimate, 10=definitely fraudulent)

Provide a detailed analysis in JSON format with:
- extracted_text: All text found in the document
- document_type: Type of document identified
- fraud_risk: Risk score 1-10
- fraud_indicators: Array of specific issues found
- recommendations: What actions to take
- confidence: How confident you are in the analysis (1-10)`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this document for potential fraud indicators and extract all text content.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let analysisResult;

    try {
      // Try to parse as JSON first
      const content = data.choices[0].message.content;
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, structure the response manually
      const content = data.choices[0].message.content;
      analysisResult = {
        extracted_text: content,
        document_type: "Unknown",
        fraud_risk: 5,
        fraud_indicators: ["Unable to parse structured analysis"],
        recommendations: ["Review document manually for fraud indicators"],
        confidence: 3
      };
    }

    console.log('OCR fraud detection completed successfully');

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      processed_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in OCR fraud detection:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});