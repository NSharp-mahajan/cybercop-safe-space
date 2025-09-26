# URL Scanner API Integration Guide

This guide explains how to integrate free API services to enhance the URL scanner functionality.

## Current Implementation

The URL scanner currently uses pattern-based analysis to detect:
- URL shorteners
- IP addresses instead of domains
- Suspicious TLDs (.tk, .ml, .ga, .cf, .cc)
- Urgency keywords (urgent, winner, claim, verify, suspended)
- Malicious keywords (phishing, malware, virus, trojan)
- Typosquatting attempts
- Homograph attacks (Cyrillic characters)
- SSL certificate presence
- URL structure anomalies

## Free API Services for Enhancement

### 1. Google Safe Browsing API (FREE)
- **What it does**: Checks URLs against Google's database of unsafe web resources
- **Free tier**: 10,000 requests per day
- **Setup**:
  1. Go to https://console.cloud.google.com/
  2. Create a new project
  3. Enable Safe Browsing API
  4. Create API credentials
  5. Add to your edge function:

```typescript
async function checkGoogleSafeBrowsing(url: string): Promise<boolean> {
  const API_KEY = Deno.env.get('GOOGLE_SAFE_BROWSING_API_KEY');
  if (!API_KEY) return true; // Default to safe if no API key
  
  const response = await fetch(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: {
          clientId: 'cybercop-safe-space',
          clientVersion: '1.0.0'
        },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }]
        }
      })
    }
  );
  
  const data = await response.json();
  return !data.matches || data.matches.length === 0;
}
```

### 2. VirusTotal API (FREE with limits)
- **What it does**: Checks URLs against 70+ antivirus engines
- **Free tier**: 4 requests per minute, 500 per day
- **Setup**:
  1. Sign up at https://www.virustotal.com/
  2. Get your API key from your profile
  3. Add to your edge function:

```typescript
async function checkVirusTotal(url: string): Promise<{ safe: boolean; positives: number }> {
  const API_KEY = Deno.env.get('VIRUSTOTAL_API_KEY');
  if (!API_KEY) return { safe: true, positives: 0 };
  
  // Submit URL for scanning
  const urlId = btoa(url).replace(/=/g, '');
  
  const response = await fetch(
    `https://www.virustotal.com/api/v3/urls/${urlId}`,
    {
      headers: {
        'x-apikey': API_KEY
      }
    }
  );
  
  if (response.status === 404) {
    // URL not in database, submit it
    const submitResponse = await fetch(
      'https://www.virustotal.com/api/v3/urls',
      {
        method: 'POST',
        headers: {
          'x-apikey': API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `url=${encodeURIComponent(url)}`
      }
    );
    
    // Return neutral result for new submissions
    return { safe: true, positives: 0 };
  }
  
  const data = await response.json();
  const stats = data.data?.attributes?.last_analysis_stats;
  const malicious = stats?.malicious || 0;
  const suspicious = stats?.suspicious || 0;
  
  return {
    safe: malicious === 0 && suspicious === 0,
    positives: malicious + suspicious
  };
}
```

### 3. URLVoid API (LIMITED FREE)
- **What it does**: Checks URL reputation across multiple blacklists
- **Free tier**: Very limited, consider for critical checks only
- **Alternative**: Use their web interface for manual verification

### 4. WHOIS Lookup (FREE)
- **What it does**: Check domain age and registration details
- **Implementation**:

```typescript
async function checkDomainAge(domain: string): Promise<{ isNew: boolean; daysSinceCreation?: number }> {
  try {
    const response = await fetch(`https://api.domainsdb.info/v1/domains/search?domain=${domain}`);
    const data = await response.json();
    
    if (data.domains && data.domains.length > 0) {
      const createdDate = new Date(data.domains[0].create_date);
      const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      
      return {
        isNew: daysSinceCreation < 30, // Flag domains less than 30 days old
        daysSinceCreation
      };
    }
    
    return { isNew: false };
  } catch {
    return { isNew: false };
  }
}
```

### 5. PhishTank API (FREE)
- **What it does**: Community-based phishing detection
- **Free tier**: Unlimited with registration
- **Setup**:
  1. Register at https://phishtank.org/
  2. Get API key
  3. Download database or use API

## Implementation Strategy

1. **Prioritize API calls**: Since free tiers have limits, check local patterns first
2. **Cache results**: Store API results for 24-48 hours to reduce API calls
3. **Graceful degradation**: If API fails, fall back to pattern analysis
4. **Rate limiting**: Implement proper rate limiting to stay within free tiers

## Environment Variables Needed

Add these to your Supabase edge function environment:
```
GOOGLE_SAFE_BROWSING_API_KEY=your_key_here
VIRUSTOTAL_API_KEY=your_key_here
```

## Enhanced Analysis Function

Here's how to integrate these APIs into the existing analysis:

```typescript
async function checkDomainReputation(domain: string): Promise<{ passed: boolean; score: number; reason?: string }> {
  let score = 25;
  let reasons: string[] = [];
  
  // Existing checks...
  
  // Add API checks
  try {
    // Google Safe Browsing
    const isSafeGoogle = await checkGoogleSafeBrowsing(`https://${domain}`);
    if (!isSafeGoogle) {
      score -= 20;
      reasons.push('Flagged by Google Safe Browsing');
    }
    
    // Domain age check
    const domainAge = await checkDomainAge(domain);
    if (domainAge.isNew) {
      score -= 10;
      reasons.push(`Domain created recently (${domainAge.daysSinceCreation} days ago)`);
    }
  } catch (error) {
    console.error('API check failed:', error);
    // Continue with local analysis
  }
  
  return {
    passed: score >= 15,
    score: Math.max(0, score),
    reason: reasons.length > 0 ? reasons.join('; ') : undefined
  };
}
```

## Testing URLs

Here are some test URLs to verify the scanner:
- Safe: `https://google.com`, `https://github.com`
- Suspicious: `http://bit.ly/test`, `http://192.168.1.1/admin`
- Malicious patterns: URLs with terms like "urgent-verify-account", "suspended-paypal"

## Future Enhancements

1. **Machine Learning**: Train a model on phishing URLs
2. **Screenshot Analysis**: Use Puppeteer to capture and analyze page content
3. **DNS Records Check**: Verify MX, A, and CNAME records
4. **Certificate Transparency Logs**: Check CT logs for certificate history
5. **Favicon Hash Matching**: Compare favicons against known legitimate sites

## Note on Free Tiers

All mentioned APIs have free tiers that should be sufficient for moderate usage. Monitor your usage to avoid hitting limits. Consider implementing:
- User-based rate limiting
- Caching of results
- Priority queuing for registered users
- Fallback to pattern-only analysis when limits are reached
