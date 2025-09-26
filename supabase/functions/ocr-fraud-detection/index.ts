import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, fileName, fileSize, fileType, userId } = await req.json();
    
    if (!image) {
      throw new Error('No image data provided');
    }

    console.log('Processing OCR fraud detection request for file:', fileName);

    // Call Gemini Vision API to analyze the document
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY_OCR') || Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    // Extract base64 data from the image URL
    let base64Data = image;
    let mimeType = 'image/jpeg';
    
    if (image.startsWith('data:')) {
      const [header, data] = image.split(',');
      base64Data = data;
      mimeType = header.split(';')[0].split(':')[1] || 'image/jpeg';
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `You are an expert fraud detection analyst specializing in document analysis. Analyze the provided document image for:

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
- confidence: How confident you are in the analysis (1-10)

Please analyze this document for potential fraud indicators and extract all text content.`
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1500
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
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let analysisResult;

    try {
      // Get content from Gemini response
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('No valid response from Gemini');
      }
      
      const content = data.candidates[0].content.parts[0].text;
      
      // Try to parse as JSON first
      try {
        analysisResult = JSON.parse(content);
      } catch (jsonParseError) {
        // Try to extract JSON from the response if it's wrapped in markdown or text
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```([\s\S]*?)```/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[1]);
        } else {
          throw jsonParseError;
        }
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      // If JSON parsing fails, structure the response manually
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to analyze document';
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

    // Save to database
    const { data: savedDoc, error: dbError } = await supabase
      .from('scanned_documents')
      .insert({
        user_id: userId || null,
        file_name: fileName || 'unknown',
        file_size: fileSize || null,
        file_type: fileType || null,
        extracted_text: analysisResult.extracted_text,
        document_type: analysisResult.document_type,
        fraud_risk_score: analysisResult.fraud_risk,
        fraud_indicators: analysisResult.fraud_indicators,
        recommendations: analysisResult.recommendations,
        confidence_level: analysisResult.confidence,
        analysis_status: 'completed'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue without failing the request
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      document_id: savedDoc?.id,
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