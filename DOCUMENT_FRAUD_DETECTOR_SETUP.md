# Document Fraud Detector Setup Guide

## Overview

The Document Fraud Detector is now fully functional! This AI-powered tool analyzes documents (invoices, IDs, certificates, etc.) to detect potential fraud using Google's Gemini Vision AI.

## Quick Setup (3 Steps)

### Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API key"**
4. Choose **"Create API key in new project"**
5. Copy the generated API key (starts with `AIza...`)

### Step 2: Add API Key to Supabase

#### Option A: Via Supabase Dashboard (Recommended)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/itvgzcdcthxqqczqgtbl/settings/secrets)
2. Click **"New secret"**
3. Add these details:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your API key from Step 1
4. Click **"Save"**

#### Option B: Via Command Line
```bash
npx supabase secrets set GEMINI_API_KEY="your-api-key-here"
```

### Step 3: Test the Document Scanner

1. Navigate to **AI Detection Hub** in your app
2. Click the **"Document Scanner"** tab
3. Upload any document image
4. Click **"Analyze Document"**
5. See the fraud analysis results!

## What the Scanner Detects

### Document Types
- **Invoices** - Fake billing documents
- **ID Documents** - Forged licenses, passports
- **Certificates** - Fraudulent degrees, awards
- **Bank Statements** - Altered financial records
- **Utility Bills** - Fake proof of address

### Fraud Indicators
- ❌ **Text Quality Issues** - Blurry, misaligned text
- ❌ **Content Problems** - Spelling errors, incorrect dates
- ❌ **Missing Security** - No watermarks, stamps
- ❌ **Format Issues** - Wrong layouts, fake logos
- ❌ **Tampering Signs** - Edited areas, inconsistencies

### Risk Levels
- 🟢 **Low (1-3)** - Document appears legitimate
- 🟡 **Medium (4-6)** - Some suspicious elements
- 🟠 **High (7-8)** - Likely fraudulent
- 🔴 **Critical (9-10)** - Definitely fraudulent

## Features

### 1. AI-Powered Analysis
- Extracts all text from documents
- Identifies document type automatically
- Detects multiple fraud patterns
- Provides confidence scores

### 2. Smart Recommendations
- Specific actions based on fraud type
- Clear next steps for users
- Reporting guidance

### 3. Fallback Support
- Works with multiple Gemini models
- Graceful error handling
- Basic analysis without API key

## Troubleshooting

### "API Key Not Configured" Error
```bash
# Verify your secret is set
npx supabase secrets list

# Should show:
# GEMINI_API_KEY
```

### "Quota Exceeded" Error
- Free tier: 60 requests per minute
- Check usage at [Google Cloud Console](https://console.cloud.google.com)
- Wait a minute and try again

### "Model Not Found" Error
The function automatically tries these models:
1. `gemini-pro-vision` (primary)
2. `gemini-1.5-flash` (fallback)

### Large Image Issues
- Maximum size: 4MB
- Supported formats: PNG, JPG, JPEG, GIF, WebP
- Compress images if needed

## API Response Format

```json
{
  "success": true,
  "analysis": {
    "extracted_text": "Complete text from document",
    "document_type": "Invoice",
    "fraud_risk": 8,
    "fraud_indicators": [
      "Misspelled company name",
      "Invalid tax number format",
      "Suspicious payment terms"
    ],
    "recommendations": [
      "Do not process this invoice",
      "Verify with supposed sender",
      "Report to authorities"
    ],
    "confidence": 9
  },
  "processed_at": "2024-01-26T10:30:00Z"
}
```

## Security & Privacy

- ✅ Documents processed server-side
- ✅ No permanent storage of images
- ✅ Encrypted API communications
- ✅ Results saved to your account only
- ✅ GDPR compliant processing

## Cost Information

### Google Gemini API Pricing
- **Free Tier**: 60 requests/minute
- **Paid**: $0.00025 per image under 1MB
- **No credit card required** for free tier

### Monitoring Usage
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "APIs & Services" → "Credentials"
3. Check your API key usage

## Advanced Configuration

### Multiple API Keys (Optional)
For high-volume usage, you can set specific keys:
```bash
# OCR-specific key
npx supabase secrets set GEMINI_API_KEY_OCR="your-ocr-key"

# General fallback key
npx supabase secrets set GEMINI_API_KEY="your-general-key"
```

### Custom Fraud Patterns
The function includes built-in patterns for common document types. To add custom patterns, modify the edge function.

## Integration Examples

### Upload and Analyze
```javascript
// Example: Upload document and get analysis
const file = document.getElementById('fileInput').files[0];
const base64 = await convertToBase64(file);

const { data, error } = await supabase.functions.invoke('ocr-fraud-detection', {
  body: {
    image: base64,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  }
});

if (data.success) {
  console.log('Fraud Risk:', data.analysis.fraud_risk);
  console.log('Indicators:', data.analysis.fraud_indicators);
}
```

## Best Practices

1. **Image Quality**: Use clear, well-lit photos
2. **File Size**: Keep under 4MB for best performance
3. **Document Position**: Ensure full document is visible
4. **Multiple Checks**: Combine with manual review for critical documents

## Support

- **Documentation**: Check `/SETUP_GEMINI_API.md`
- **Logs**: View in Supabase Dashboard → Functions → Logs
- **Issues**: Report on GitHub repository

## Next Steps

1. ✅ Set up your Gemini API key
2. ✅ Test with sample documents
3. ✅ Integrate into your workflow
4. ✅ Monitor usage and results

---

**Ready to detect document fraud!** Your Document Scanner is now fully operational with AI-powered analysis.
