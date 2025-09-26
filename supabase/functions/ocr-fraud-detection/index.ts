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
      base64Data = data || image; // Use data part or fallback to full string
      mimeType = header.split(';')[0].split(':')[1] || 'image/jpeg';
    } else if (image.includes('base64,')) {
      // Handle case where split might not work as expected
      base64Data = image.substring(image.indexOf('base64,') + 7);
    }
    
    // Log for debugging
    console.log('Image data extraction - mimeType:', mimeType, 'base64 length:', base64Data.length);
    console.log('Base64 preview:', base64Data.substring(0, 50) + '...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `Analyze the document image and extract all text. Look for fraud indicators.

Provide your analysis as a JSON object with these fields:
- extracted_text: all visible text from the document
- document_type: what kind of document this is
- fraud_risk: risk score from 1 to 10
- fraud_indicators: array of suspicious elements found
- recommendations: array of suggested actions
- confidence: your confidence level from 1 to 10

Respond only with the JSON object.`
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
          maxOutputTokens: 2000,
          candidateCount: 1
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
    console.log('Gemini API response received');
    let analysisResult;

    try {
      // Get content from Gemini response
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Invalid response structure:', JSON.stringify(data));
        throw new Error('No valid response from Gemini');
      }
      
      const content = data.candidates[0].content.parts[0].text;
      console.log('Gemini text response length:', content.length);
      
      // Try to parse as JSON first
      try {
        analysisResult = JSON.parse(content);
      } catch (jsonParseError) {
        // Try to extract JSON from the response if it's wrapped in markdown or text
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                         content.match(/```([\s\S]*?)```/) ||
                         content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          // Clean up the JSON string
          const cleanedJson = jsonStr.trim()
            .replace(/^```json\s*/, '')
            .replace(/```$/, '')
            .trim();
          analysisResult = JSON.parse(cleanedJson);
        } else {
          // If still no JSON, try to extract structured data from text
          console.log('Gemini response (not JSON):', content);
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