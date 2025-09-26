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

    console.log('Processing OCR request for:', fileName);

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY_OCR') || Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    // Extract base64 data
    let base64Data = image;
    let mimeType = 'image/jpeg';
    
    if (image.includes(',')) {
      const parts = image.split(',');
      if (parts.length === 2) {
        base64Data = parts[1];
        const header = parts[0];
        if (header.includes(':') && header.includes(';')) {
          mimeType = header.split(':')[1].split(';')[0];
        }
      }
    }
    
    // Use a simpler prompt that asks for structured text response
    const prompt = `Analyze this document image and provide the following information:

TEXT_CONTENT: [Extract all visible text from the document]

DOCUMENT_TYPE: [Identify the type of document]

FRAUD_RISK: [Rate from 1-10]

FRAUD_INDICATORS: [List any suspicious elements, separated by semicolons]

RECOMMENDATIONS: [List suggested actions, separated by semicolons]

CONFIDENCE: [Your confidence level from 1-10]

Provide your response in the exact format above, with each section on a new line.`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
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
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the structured text response
    let analysisResult = {
      extracted_text: '',
      document_type: 'Unknown',
      fraud_risk: 5,
      fraud_indicators: [],
      recommendations: [],
      confidence: 5
    };

    try {
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const content = data.candidates[0].content.parts[0].text;
        console.log('Parsing structured response...');
        
        // Parse the structured response
        const lines = content.split('\n');
        let currentSection = '';
        
        for (const line of lines) {
          const trimmed = line.trim();
          
          if (trimmed.startsWith('TEXT_CONTENT:')) {
            currentSection = 'text';
            analysisResult.extracted_text = trimmed.substring(13).trim();
          } else if (trimmed.startsWith('DOCUMENT_TYPE:')) {
            currentSection = 'type';
            analysisResult.document_type = trimmed.substring(14).trim();
          } else if (trimmed.startsWith('FRAUD_RISK:')) {
            currentSection = 'risk';
            const risk = parseInt(trimmed.substring(11).trim());
            analysisResult.fraud_risk = isNaN(risk) ? 5 : risk;
          } else if (trimmed.startsWith('FRAUD_INDICATORS:')) {
            currentSection = 'indicators';
            const indicators = trimmed.substring(17).trim();
            if (indicators && indicators !== '[' && indicators !== 'None') {
              analysisResult.fraud_indicators = indicators.split(';').map(i => i.trim()).filter(i => i);
            }
          } else if (trimmed.startsWith('RECOMMENDATIONS:')) {
            currentSection = 'recommendations';
            const recs = trimmed.substring(16).trim();
            if (recs && recs !== '[' && recs !== 'None') {
              analysisResult.recommendations = recs.split(';').map(r => r.trim()).filter(r => r);
            }
          } else if (trimmed.startsWith('CONFIDENCE:')) {
            currentSection = 'confidence';
            const conf = parseInt(trimmed.substring(11).trim());
            analysisResult.confidence = isNaN(conf) ? 5 : conf;
          } else if (trimmed && currentSection) {
            // Continue previous section if it's multiline
            switch (currentSection) {
              case 'text':
                analysisResult.extracted_text += ' ' + trimmed;
                break;
              case 'indicators':
                if (!trimmed.startsWith('[')) {
                  const moreIndicators = trimmed.split(';').map(i => i.trim()).filter(i => i);
                  analysisResult.fraud_indicators.push(...moreIndicators);
                }
                break;
              case 'recommendations':
                if (!trimmed.startsWith('[')) {
                  const moreRecs = trimmed.split(';').map(r => r.trim()).filter(r => r);
                  analysisResult.recommendations.push(...moreRecs);
                }
                break;
            }
          }
        }
        
        // Clean up arrays
        analysisResult.fraud_indicators = analysisResult.fraud_indicators.filter(i => i && i.length > 0);
        analysisResult.recommendations = analysisResult.recommendations.filter(r => r && r.length > 0);
        
        // Ensure we have at least some default values
        if (!analysisResult.extracted_text) {
          analysisResult.extracted_text = 'No text could be extracted from the image';
        }
        if (analysisResult.fraud_indicators.length === 0 && analysisResult.fraud_risk < 3) {
          analysisResult.fraud_indicators = ['No fraud indicators detected'];
        }
        if (analysisResult.recommendations.length === 0) {
          analysisResult.recommendations = ['Document appears to be legitimate'];
        }
        
      } else {
        throw new Error('No response content from Gemini');
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      // Use fallback values
      analysisResult.extracted_text = 'Unable to extract text from document';
      analysisResult.fraud_indicators = ['Analysis failed - please review document manually'];
      analysisResult.recommendations = ['Manual review recommended'];
      analysisResult.confidence = 1;
    }

    console.log('Analysis complete:', analysisResult);

    // Save to database
    try {
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
      }

      return new Response(JSON.stringify({
        success: true,
        analysis: analysisResult,
        document_id: savedDoc?.id,
        processed_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (dbError) {
      // Return success even if DB save fails
      console.error('Database save failed:', dbError);
      
      return new Response(JSON.stringify({
        success: true,
        analysis: analysisResult,
        processed_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in OCR fraud detection:', error);
    
    // Return a more user-friendly error response
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to analyze document',
      analysis: {
        extracted_text: 'Error: Unable to process document',
        document_type: 'Unknown',
        fraud_risk: 5,
        fraud_indicators: ['Document could not be analyzed'],
        recommendations: ['Please try again with a clearer image'],
        confidence: 0
      }
    }), {
      status: 200, // Return 200 to prevent frontend errors
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
