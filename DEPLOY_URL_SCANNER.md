# URL Scanner Deployment Instructions

## What I've Done:

1. **Integrated your API keys** into the edge function:
   - Google Safe Browsing API: `AIzaSyBaQM1yHdJ9SHW7tJanrzhrmYDDlCwh0T4`
   - VirusTotal API: `5590fee7afa0591b84fdc2e1fe69a0d62e10daa4f4af51069f6c5eeb752562ea`

2. **Enhanced the URL scanner** with:
   - Real-time Google Safe Browsing checks (detects malware, phishing, etc.)
   - VirusTotal scanning against 70+ antivirus engines
   - Domain age verification (flags domains less than 30 days old)
   - All integrated into the scoring system

3. **Created database migration** for storing URL check history

## What You Need to Do:

### 1. Apply Database Migration
```bash
cd C:\dev\cybercop-safe-space
supabase db push
```

### 2. Deploy the Updated Edge Function
```bash
supabase functions deploy url-check
```

### 3. Test the Enhanced Scanner

Try these test URLs to see the APIs in action:

**Safe URLs:**
- https://google.com
- https://github.com
- https://microsoft.com

**Suspicious URLs:**
- http://bit.ly/test
- http://192.168.1.1/admin
- Any newly created domain

**Known Malicious (for testing):**
- http://malware.testing.google.test/testing/malware/
- http://phishing.testing.google.test/testing/phishing/

## How It Works Now:

1. **Pattern Analysis** (25 points)
   - Local pattern matching
   - Typosquatting detection
   - Homograph attack detection

2. **Domain Reputation** (25 points)
   - ✅ Google Safe Browsing API check
   - ✅ VirusTotal API check  
   - ✅ Domain age verification
   - Local suspicious TLD checks

3. **SSL Certificate** (20 points)
   - HTTPS verification

4. **URL Structure** (20 points)
   - Path analysis
   - Parameter checks

5. **Content Analysis** (10 points)
   - File extension checks

## API Rate Limits:

- **Google Safe Browsing**: 10,000 requests/day (plenty!)
- **VirusTotal**: 4 requests/minute, 500/day
- **Domain Age**: Unlimited (free API)

The system handles rate limits gracefully and falls back to pattern analysis if APIs are unavailable.

## Monitoring:

Check edge function logs:
```bash
supabase functions logs url-check --tail
```

## Next Steps:

After deployment, the URL scanner will:
- Show real threats detected by Google and VirusTotal
- Display how many antivirus engines flagged a URL
- Show domain age for new domains
- Provide more accurate safety scores

The UI will automatically display all this information in the detailed analysis section!
