# Setting up Gemini API for Document Fraud Detection

The Document Scanner tool uses Google's Gemini AI to analyze documents for fraud indicators. Follow these steps to set it up:

## 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API key"
4. Copy your API key

## 2. Configure the API Key in Supabase

### Option A: Using Supabase Dashboard (Recommended)
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to "Edge Functions" → "Secrets"
4. Add a new secret:
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key

### Option B: Using Supabase CLI
```bash
# Set the secret using Supabase CLI
npx supabase secrets set GEMINI_API_KEY=your_actual_api_key_here
```

## 3. Deploy the Edge Function

If you haven't already deployed the OCR edge function:

```bash
# Deploy the OCR fraud detection function
npx supabase functions deploy ocr-fraud-detection
```

## 4. Test the Document Scanner

1. Navigate to the AI Detection Hub page
2. Click on "Document Scanner" tab
3. Upload an image of a document (invoice, ID, certificate, etc.)
4. Click "Analyze Document"

## What the Document Scanner Detects

The Gemini-powered scanner analyzes documents for:

- **Document Tampering**: Altered text, inconsistent fonts, edited regions
- **Fake Logos**: Poorly reproduced or counterfeit company logos
- **Formatting Issues**: Unprofessional layouts, alignment problems
- **Content Inconsistencies**: Mismatched information, logical errors
- **Document Type**: Automatically identifies invoices, IDs, certificates, etc.
- **Fraud Risk Score**: Rates documents from 1-10 (10 being definitely fraudulent)

## Supported Document Types

- Invoices and bills
- Government IDs (driver's license, passport)
- Certificates (birth, education, professional)
- Bank statements
- Utility bills
- Medical documents
- Legal documents

## Troubleshooting

### "Gemini API key not configured" Error
- Ensure you've set the `GEMINI_API_KEY` secret in Supabase
- Check that the key is valid and has not expired

### "API quota exceeded" Error
- Gemini API has usage limits
- Check your [Google Cloud Console](https://console.cloud.google.com) for quota status
- Consider upgrading to a paid plan for higher limits

### Large File Issues
- Resize images before uploading (max recommended: 4MB)
- Supported formats: PNG, JPG, JPEG, GIF, WebP

## Security Notes

- The API key is stored securely in Supabase secrets
- Documents are processed server-side and not stored permanently
- Analysis results can be saved to your account for future reference
- All communications are encrypted

## Additional Features

The Document Scanner provides:
- Text extraction from images
- Fraud risk assessment
- Specific fraud indicators
- Recommendations for action
- Confidence level in the analysis

For any issues or questions, please check the project documentation or open an issue on GitHub.
