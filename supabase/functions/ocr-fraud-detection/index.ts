// Alternative OCR implementation that works even without Gemini Vision
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

serve(async (req) => {
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
    
    let analysisResult = {
      extracted_text: '',
      document_type: 'Unknown',
      fraud_risk: 5,
      fraud_indicators: [] as string[],
      recommendations: [] as string[],
      confidence: 0
    };

    if (geminiApiKey) {
      try {
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

        // Try multiple models in order of preference
        const models = [
          'gemini-1.5-flash-8b',  // This model works with the current API key
          'gemini-1.5-flash-8b-latest',
          'gemini-1.5-flash-8b-001',
          'gemini-1.5-pro-latest',
          'gemini-1.5-flash-latest', 
          'gemini-1.5-flash',
          'gemini-1.5-pro',
          'gemini-pro'
        ];

        let successfulResponse = null;

        for (const model of models) {
          console.log(`Trying model: ${model}`);
          
          try {
            // For non-vision models, we'll ask it to analyze the base64 string pattern
            const isVisionModel = !model.includes('gemini-pro');
            
            let requestBody;
            if (isVisionModel) {
              // Vision model request
              requestBody = {
                contents: [{
                  parts: [
                    { 
                      text: `Extract and analyze text from this document image. Return a JSON object with:
                      - extracted_text: all text found in the image
                      - document_type: type of document
                      - fraud_risk: score 1-10
                      - fraud_indicators: array of fraud indicators
                      - confidence: confidence score 1-10`
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
                  temperature: 0.2,
                  maxOutputTokens: 2048,
                }
              };
            } else {
              // Text-only model fallback - analyze metadata
              const sizeKB = (base64Data.length * 0.75 / 1024).toFixed(1);
              requestBody = {
                contents: [{
                  parts: [{
                    text: `Analyze this document metadata and provide fraud risk assessment:
                    Filename: ${fileName}
                    File type: ${fileType}
                    File size: ${sizeKB} KB
                    
                    Based on the filename and metadata, determine:
                    1. What type of document this likely is
                    2. Common fraud indicators for this document type
                    3. Risk level (1-10)
                    
                    Return as JSON with: document_type, fraud_risk, fraud_indicators[], recommendations[]`
                  }]
                }],
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 1024,
                }
              };
            }

            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                successfulResponse = {
                  text: data.candidates[0].content.parts[0].text,
                  model: model,
                  isVision: isVisionModel
                };
                console.log(`Success with model: ${model}`);
                break;
              }
            } else {
              const errorText = await response.text();
              console.log(`Model ${model} failed:`, errorText.substring(0, 100));
            }
          } catch (modelError) {
            console.log(`Error with model ${model}:`, modelError.message);
          }
        }

        // Process the successful response
        if (successfulResponse) {
          try {
            const responseText = successfulResponse.text;
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              
              if (successfulResponse.isVision) {
                // Vision model response
                analysisResult = {
                  extracted_text: parsed.extracted_text || '',
                  document_type: parsed.document_type || 'Unknown',
                  fraud_risk: Math.min(parsed.fraud_risk || 5, 10),
                  fraud_indicators: parsed.fraud_indicators || [],
                  recommendations: parsed.recommendations || [],
                  confidence: Math.min(parsed.confidence || 7, 10)
                };
              } else {
                // Text-only model response (metadata analysis)
                analysisResult = {
                  extracted_text: `⚠️ Vision API unavailable. Analysis based on metadata:\n\nFile: ${fileName}\nType: ${parsed.document_type || 'Unknown'}\n\nNote: Upload to manual review system for text extraction.`,
                  document_type: parsed.document_type || 'Unknown',
                  fraud_risk: Math.min(parsed.fraud_risk || 5, 10),
                  fraud_indicators: parsed.fraud_indicators || ['Manual text verification required'],
                  recommendations: [
                    ...parsed.recommendations || [],
                    'Use alternative OCR service for text extraction',
                    'Manually review document for authenticity'
                  ],
                  confidence: 3 // Low confidence for metadata-only analysis
                };
              }
            }
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
            analysisResult.extracted_text = 'Analysis completed but unable to parse results';
            analysisResult.confidence = 1;
          }
        } else {
          // All models failed
          throw new Error('All Gemini models failed to process the request');
        }

      } catch (error) {
        console.error('Gemini API error:', error.message);
        
        // Provide fallback analysis based on filename
        const fileAnalysis = analyzeByFilename(fileName || 'document');
        analysisResult = {
          extracted_text: `⚠️ AI Analysis Unavailable\n\nDocument: ${fileName || 'Unknown'}\nSize: ${fileSize ? (fileSize/1024).toFixed(1) + 'KB' : 'Unknown'}\n\nPlease use alternative OCR service or manual review.`,
          document_type: fileAnalysis.type,
          fraud_risk: 5, // Medium risk when unable to analyze
          fraud_indicators: fileAnalysis.indicators,
          recommendations: [
            'Manual document verification required',
            'Use alternative OCR service',
            'Check physical security features',
            'Verify with issuing authority if suspicious'
          ],
          confidence: 1
        };
      }
    } else {
      // No API key
      analysisResult.extracted_text = 'OCR service not configured. Please contact administrator.';
      analysisResult.fraud_indicators = ['OCR service unavailable'];
      analysisResult.recommendations = ['Configure Gemini API key for OCR functionality'];
    }

    // Save to database
    try {
      const { data: savedDoc } = await supabase
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

      return new Response(JSON.stringify({
        success: true,
        analysis: analysisResult,
        document_id: savedDoc?.id,
        processed_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (dbError) {
      // Return success even if DB fails
      return new Response(JSON.stringify({
        success: true,
        analysis: analysisResult,
        processed_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      analysis: {
        extracted_text: 'Error processing document',
        document_type: 'Error',
        fraud_risk: 0,
        fraud_indicators: [error.message],
        recommendations: ['Please try again'],
        confidence: 0
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to analyze document by filename
function analyzeByFilename(fileName: string): { type: string; indicators: string[] } {
  const lowerName = fileName.toLowerCase();
  
  if (lowerName.includes('invoice')) {
    return {
      type: 'Invoice',
      indicators: [
        'Check for company letterhead',
        'Verify invoice number format',
        'Confirm payment details'
      ]
    };
  } else if (lowerName.includes('receipt')) {
    return {
      type: 'Receipt',
      indicators: [
        'Verify merchant information',
        'Check transaction date',
        'Confirm amount accuracy'
      ]
    };
  } else if (lowerName.includes('id') || lowerName.includes('license') || lowerName.includes('passport')) {
    return {
      type: 'ID Document',
      indicators: [
        'Check security features',
        'Verify photo quality',
        'Confirm expiration date'
      ]
    };
  } else if (lowerName.includes('certificate')) {
    return {
      type: 'Certificate',
      indicators: [
        'Verify issuing authority',
        'Check for official seal',
        'Confirm certificate number'
      ]
    };
  } else {
    return {
      type: 'Document',
      indicators: [
        'Manual review required',
        'Check for tampering signs',
        'Verify document source'
      ]
    };
  }
}
