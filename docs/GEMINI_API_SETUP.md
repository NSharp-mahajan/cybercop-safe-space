# Gemini API Key Setup Guide

## ⚠️ IMPORTANT SECURITY NOTICE
Never commit API keys to version control or share them publicly. If a key is exposed, revoke it immediately and generate a new one.

## Setting Up Gemini API Key

### 1. Get a Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 2. Local Development Setup
For local development with Supabase CLI:

1. Update the `/supabase/.env` file:
```
GEMINI_API_KEY=your-actual-api-key-here
```

2. The edge functions will automatically use this when running locally with:
```bash
supabase functions serve
```

### 3. Production Setup (Supabase Dashboard)
For production deployment:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to Settings → Edge Functions
4. Add a new secret:
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key
5. Click "Save"

### 4. Verify the Setup
Test the document scanner feature:

1. Start your local development server:
```bash
npm run dev
```

2. If running Supabase locally:
```bash
supabase start
supabase functions serve
```

3. Navigate to the AI Detection Hub
4. Go to the "Document Scanner" tab
5. Upload a test image
6. Click "Analyze Document"

If successful, you should see:
- Extracted text from the document
- Fraud risk assessment
- Document type identification

### Troubleshooting

#### Error: "Gemini API key not configured"
- Ensure the API key is set correctly in the environment
- For local: Check `/supabase/.env`
- For production: Check Supabase Dashboard → Settings → Edge Functions

#### Error: "API key invalid"
- Verify the API key is correct and active
- Check if the key has been revoked
- Ensure you're using a Gemini API key, not a different Google API key

#### Error: "Rate limit exceeded"
- Gemini API has usage limits
- Consider implementing caching or rate limiting in your application
- Upgrade to a paid plan if needed

### Security Best Practices

1. **Never commit API keys**: Always use environment variables
2. **Rotate keys regularly**: Change your API keys periodically
3. **Use different keys**: Use separate keys for development and production
4. **Monitor usage**: Check your API usage in Google AI Studio
5. **Restrict access**: In production, limit which domains can use your key

### API Key Restrictions (Optional)
In Google AI Studio, you can restrict your API key:
1. Click on your API key
2. Select "Edit API key"
3. Under "Application restrictions", choose:
   - HTTP referrers (for web apps)
   - IP addresses (for servers)
4. Add your allowed domains/IPs
