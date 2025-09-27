import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { url, user_id } = await req.json();
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate URL format
    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Additional validation for malformed domains
    const hostname = urlObj.hostname;
    if (!hostname || hostname === '') {
      return new Response(JSON.stringify({ 
        error: 'Invalid domain',
        status: 'malicious',
        score: 0,
        details: {
          checks: {
            patternAnalysis: { passed: false, score: 0, reason: 'Invalid domain format' },
            domainReputation: { passed: false, score: 0, reason: 'No valid domain found' },
            sslCertificate: { passed: false, score: 0, reason: 'Cannot verify SSL for invalid domain' },
            urlStructure: { passed: false, score: 0, reason: 'Malformed URL structure' },
            contentAnalysis: { passed: false, score: 0, reason: 'Cannot analyze invalid URL' }
          },
          warnings: ['This URL has an invalid domain format and should not be trusted.'],
          recommendations: ['Do not visit this URL', 'Check the URL format carefully']
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Check for missing TLD or malformed domains
    const domainParts = hostname.split('.');
    if (domainParts.length < 2 || domainParts.some(part => part === '')) {
      const analysisResult = await analyzeURL(url);
      // Force the result to be malicious for malformed domains
      analysisResult.status = 'malicious';
      analysisResult.score = Math.min(20, analysisResult.score);
      analysisResult.details.warnings.push('Domain format is invalid or incomplete');
      analysisResult.details.checks.urlStructure.passed = false;
      analysisResult.details.checks.urlStructure.score = 0;
      analysisResult.details.checks.urlStructure.reason = 'Invalid domain format detected';
      
      return new Response(JSON.stringify({ 
        url,
        status: analysisResult.status,
        score: analysisResult.score,
        details: analysisResult.details,
        cached: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting: 5 checks per minute per IP or user
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    
    let rateLimitQuery = supabaseClient
      .from('url_checks')
      .select('id')
      .gte('checked_at', oneMinuteAgo);

    if (user_id) {
      rateLimitQuery = rateLimitQuery.eq('user_id', user_id);
    } else {
      rateLimitQuery = rateLimitQuery.eq('ip_address', clientIP);
    }

    const { data: recentChecks, error: rateLimitError } = await rateLimitQuery;

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    } else if (recentChecks && recentChecks.length >= 5) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Maximum 5 URL checks per minute.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(url.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const urlHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('Checking URL:', { url, urlHash, clientIP });

    // Check if URL was recently checked (cache for 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: cachedCheck } = await supabaseClient
      .from('url_checks')
      .select('status')
      .eq('url_hash', urlHash)
      .gte('checked_at', fiveMinutesAgo)
      .order('checked_at', { ascending: false })
      .limit(1)
      .single();

    let urlStatus = 'safe'; // Default status

    if (cachedCheck) {
      urlStatus = cachedCheck.status;
      console.log('Using cached result:', urlStatus);
    } else {
      // Perform URL analysis
      const analysisResult = await analyzeURL(url);
      urlStatus = analysisResult.status;
      console.log('Analysis result:', analysisResult);
      
      // Store the check result
      const { error: insertError } = await supabaseClient
        .from('url_checks')
        .insert({
          url: url.trim(),
          url_hash: urlHash,
          status: urlStatus,
          user_id: user_id || null,
          ip_address: clientIP,
        });

      if (insertError) {
        console.error('Error storing URL check:', insertError);
      }

      return new Response(JSON.stringify({ 
        url,
        status: urlStatus,
        score: analysisResult.score,
        details: analysisResult.details,
        cached: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For cached results, perform a quick analysis to provide details
    const quickAnalysis = await analyzeURL(url);
    
    return new Response(JSON.stringify({ 
      url,
      status: urlStatus,
      score: quickAnalysis.score,
      details: quickAnalysis.details,
      cached: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in url-check function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

interface AnalysisResult {
  status: 'safe' | 'suspicious' | 'malicious';
  score: number; // 0-100, where 100 is safest
  details: {
    checks: {
      patternAnalysis: { passed: boolean; score: number; reason?: string };
      domainReputation: { passed: boolean; score: number; reason?: string };
      sslCertificate: { passed: boolean; score: number; reason?: string };
      urlStructure: { passed: boolean; score: number; reason?: string };
      contentAnalysis: { passed: boolean; score: number; reason?: string };
    };
    warnings: string[];
    recommendations: string[];
    domainContext?: {
      type: 'government' | 'educational' | 'healthcare' | 'financial' | 'trusted' | 'general';
      trustLevel: 'high' | 'medium' | 'low';
      explanation: string;
    };
    scoreExplanation: string;
  };
}

async function analyzeURL(url: string): Promise<AnalysisResult> {
  const result: AnalysisResult = {
    status: 'safe',
    score: 100,
    details: {
      checks: {
        patternAnalysis: { passed: true, score: 25 },
        domainReputation: { passed: true, score: 25 },
        sslCertificate: { passed: true, score: 20 },
        urlStructure: { passed: true, score: 20 },
        contentAnalysis: { passed: true, score: 10 }
      },
      warnings: [],
      recommendations: [],
      scoreExplanation: ''
    }
  };

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    const fullUrl = url.toLowerCase();
    
    // Detect domain context first
    const domainContext = detectDomainContext(domain);
    result.details.domainContext = domainContext;
    
    // 1. Pattern Analysis (25 points)
    const patternResult = analyzePatterns(fullUrl, domain, urlObj);
    result.details.checks.patternAnalysis = patternResult;
    
    // 2. Domain Reputation Check (25 points)
    const domainResult = await checkDomainReputation(domain);
    result.details.checks.domainReputation = domainResult;
    
    // 3. SSL Certificate Check (20 points)
    const sslResult = await checkSSLCertificate(urlObj);
    result.details.checks.sslCertificate = sslResult;
    
    // 4. URL Structure Analysis (20 points)
    const structureResult = await analyzeURLStructure(urlObj, domain);
    result.details.checks.urlStructure = structureResult;
    
    // 5. Content Analysis (10 points)
    const contentResult = analyzeURLContent(urlObj);
    result.details.checks.contentAnalysis = contentResult;
    
    // Calculate total score
    let totalScore = 0;
    for (const check of Object.values(result.details.checks)) {
      totalScore += check.score;
    }
    result.score = Math.max(0, Math.min(100, totalScore));
    
    // Adjust status based on domain context
    if (domainContext.trustLevel === 'high' && result.score >= 40) {
      // Trusted domains get more lenient treatment
      result.status = result.score >= 60 ? 'safe' : 'suspicious';
      if (domainContext.type === 'government' || domainContext.type === 'educational') {
        result.details.warnings.push(`Note: This is a ${domainContext.type} website with lower technical scores but high institutional trust.`);
      }
    } else {
      // Standard scoring for other domains
      if (result.score >= 80) {
        result.status = 'safe';
      } else if (result.score >= 50) {
        result.status = 'suspicious';
        result.details.warnings.push('This URL shows some suspicious characteristics. Proceed with caution.');
      } else {
        result.status = 'malicious';
        result.details.warnings.push('This URL appears to be dangerous. Do not proceed.');
      }
    }
    
    // Generate score explanation
    result.details.scoreExplanation = generateScoreExplanation(result.score, domainContext, result.details.checks);
    
    // Add recommendations based on findings
    if (!result.details.checks.sslCertificate.passed) {
      result.details.recommendations.push('Ensure the website uses HTTPS before entering any sensitive information.');
    }
    if (!result.details.checks.patternAnalysis.passed) {
      result.details.recommendations.push('Be extremely cautious - this URL contains known phishing patterns.');
    }
    
    return result;
    
  } catch (error) {
    console.error('URL analysis error:', error);
    result.status = 'suspicious';
    result.score = 40;
    result.details.warnings.push('Unable to fully analyze this URL.');
    return result;
  }
}

function analyzePatterns(fullUrl: string, domain: string, urlObj: URL): { passed: boolean; score: number; reason?: string } {
  let score = 25;
  let reasons: string[] = [];
  
  // Check for basic domain format issues first
  const domainParts = domain.split('.');
  
  // Check if domain has proper TLD
  if (domainParts.length < 2) {
    score -= 20;
    reasons.push('Missing or invalid top-level domain');
  }
  
  // Check for domains that look like they're missing dots (e.g., xyzzcom)
  const lastPart = domainParts[domainParts.length - 1];
  if (lastPart && lastPart.length > 6 && /^[a-z]+com|net|org|gov|edu/.test(lastPart)) {
    score -= 25;
    reasons.push('Malformed domain - missing dot before TLD');
  }
  
  // Suspicious patterns with severity scores
  const suspiciousPatterns = [
    { pattern: /bit\.ly|tinyurl|goo\.gl|t\.co|short\.link/, severity: 10, reason: 'URL shortener detected' },
    { pattern: /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, severity: 15, reason: 'IP address instead of domain' },
    { pattern: /[a-z0-9]+-[a-z0-9]+-[a-z0-9]+\.(tk|ml|ga|cf|cc)/, severity: 12, reason: 'Suspicious TLD' },
    { pattern: /urgent|winner|claim|verify|suspended|limited|expire/i, severity: 8, reason: 'Urgency keywords detected' },
    { pattern: /@|%40/, severity: 10, reason: 'Contains @ symbol (possible credential phishing)' },
  ];

  // Malicious patterns
  const maliciousPatterns = [
    { pattern: /phishing|malware|virus|trojan/i, severity: 25, reason: 'Malicious keywords detected' },
    { pattern: /fake.*bank|fake.*paypal|fake.*amazon/i, severity: 25, reason: 'Fake service detected' },
    { pattern: /[0-9]{10,}\./, severity: 20, reason: 'Random number domain' },
    { pattern: /[а-яА-Я]/, severity: 20, reason: 'Cyrillic characters (possible homograph attack)' },
  ];
  
  // Check for typosquatting of popular domains
  const popularDomains = [
    'google', 'facebook', 'amazon', 'paypal', 'microsoft', 'apple', 'netflix',
    'youtube', 'twitter', 'instagram', 'linkedin', 'ebay', 'walmart', 'target',
    'bestbuy', 'chase', 'bankofamerica', 'wellsfargo', 'citibank', 'usbank'
  ];
  
  // Common typosquatting techniques
  const typosquattingChecks = [];
  
  // Get domain base (already extracted above)
  const domainBase = domainParts[0];
  
  // Check for character substitution (e.g., youtubbe instead of youtube)
  for (const popular of popularDomains) {
    const distance = levenshteinDistance(domainBase, popular);
    
    // If the domain is very similar to a popular domain (1-2 character difference)
    if (distance > 0 && distance <= 2) {
      typosquattingChecks.push({
        detected: true,
        original: popular,
        severity: 25,
        reason: `Typosquatting detected: '${domainBase}' is suspiciously similar to '${popular}'`
      });
    }
    
    // Check for common misspellings
    const commonMisspellings: Record<string, string[]> = {
      'youtube': ['youtub', 'youtubbe', 'yotube', 'yuotube', 'youtbe'],
      'google': ['googel', 'gogle', 'goggle', 'gooogle'],
      'facebook': ['facbook', 'facebok', 'fcebook', 'faceboo'],
      'paypal': ['payp4l', 'paypaI', 'paipal', 'paybal'],
      'amazon': ['amazom', 'amazone', 'amaz0n', 'anazon'],
      'microsoft': ['mircosoft', 'microsofy', 'microsodt', 'micr0soft']
    };
    
    if (commonMisspellings[popular]) {
      for (const misspelling of commonMisspellings[popular]) {
        if (domain.startsWith(misspelling + '.') || domain === misspelling + '.com') {
          typosquattingChecks.push({
            detected: true,
            original: popular,
            severity: 25,
            reason: `Known typosquatting variation of ${popular}.com`
          });
        }
      }
    }
  }
  
  // Check malicious patterns first
  for (const { pattern, severity, reason } of maliciousPatterns) {
    if (pattern.test(fullUrl) || pattern.test(domain)) {
      score -= severity;
      reasons.push(reason);
    }
  }
  
  // Check suspicious patterns
  for (const { pattern, severity, reason } of suspiciousPatterns) {
    if (pattern.test(fullUrl) || pattern.test(domain)) {
      score -= severity;
      reasons.push(reason);
    }
  }
  
  // Apply typosquatting checks
  for (const check of typosquattingChecks) {
    if (check.detected) {
      score -= check.severity;
      reasons.push(check.reason);
    }
  }
  
  return {
    passed: score >= 15,
    score: Math.max(0, score),
    reason: reasons.length > 0 ? reasons.join('; ') : undefined
  };
}

async function checkDomainReputation(domain: string): Promise<{ passed: boolean; score: number; reason?: string }> {
  let score = 25;
  let reasons: string[] = [];
  
  // Check domain context first
  const domainContext = detectDomainContext(domain);
  
  // Special handling for government and educational domains
  if (domainContext.type === 'government') {
    // Government domains always get full reputation score
    return { passed: true, score: 25, reason: 'Official government domain - inherently trusted' };
  }
  
  if (domainContext.type === 'educational') {
    // Educational domains get high reputation score
    return { passed: true, score: 23, reason: 'Educational institution domain' };
  }
  
  // Check if domain is in common whitelist
  const trustedDomains = [
    'google.com', 'facebook.com', 'amazon.com', 'microsoft.com', 'apple.com',
    'github.com', 'stackoverflow.com', 'wikipedia.org', 'youtube.com', 'twitter.com'
  ];
  
  if (trustedDomains.some(trusted => domain === trusted || domain.endsWith('.' + trusted))) {
    return { passed: true, score: 25 };
  }
  
  // Check domain age (using basic heuristics)
  if (domain.length > 30) {
    score -= 10;
    reasons.push('Unusually long domain name');
  }
  
  if (domain.split('.').length > 4) {
    score -= 5;
    reasons.push('Multiple subdomains');
  }
  
  // Check for suspicious TLDs
  const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.cc', '.download', '.review'];
  if (suspiciousTLDs.some(tld => domain.endsWith(tld))) {
    score -= 10;
    reasons.push('Suspicious top-level domain');
  }
  
  // Check with external APIs
  try {
    // Google Safe Browsing Check
    const safeBrowsingResult = await checkGoogleSafeBrowsing(`https://${domain}`);
    if (!safeBrowsingResult.safe) {
      score -= 20;
      reasons.push(`Flagged by Google Safe Browsing: ${safeBrowsingResult.threats.join(', ')}`);
    }
    
    // VirusTotal Check
    const virusTotalResult = await checkVirusTotal(`https://${domain}`);
    if (!virusTotalResult.safe) {
      score -= 15;
      reasons.push(`Detected by ${virusTotalResult.positives} security vendors`);
    }
    
    // Domain Age Check
    const domainAge = await checkDomainAge(domain);
    if (!domainAge.exists) {
      score -= 20;
      reasons.push(`Domain does not exist or cannot be verified: ${domainAge.error || 'Unknown domain'}`);
    } else if (domainAge.isNew) {
      score -= 15;
      reasons.push(`Recently created domain (${Math.floor(domainAge.daysSinceCreation || 0)} days old)`);
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

async function checkSSLCertificate(urlObj: URL): Promise<{ passed: boolean; score: number; reason?: string }> {
  if (urlObj.protocol !== 'https:') {
    return {
      passed: false,
      score: 0,
      reason: 'No HTTPS/SSL encryption'
    };
  }
  
  // In a real implementation, you could:
  // - Check certificate validity
  // - Verify certificate chain
  // - Check for self-signed certificates
  // - Verify domain matches certificate
  
  return {
    passed: true,
    score: 20
  };
}

async function analyzeURLStructure(urlObj: URL, domain: string): Promise<{ passed: boolean; score: number; reason?: string }> {
  let score = 20;
  let reasons: string[] = [];
  
  // Quick domain existence check using DNS
  try {
    const parts = domain.split('.');
    if (parts.length >= 2) {
      const rootDomain = parts.slice(-2).join('.');
      const dnsResponse = await fetch(`https://dns.google/resolve?name=${rootDomain}&type=A`);
      if (dnsResponse.ok) {
        const dnsData = await dnsResponse.json();
        if (!dnsData.Answer || dnsData.Answer.length === 0) {
          score -= 15;
          reasons.push('Domain has no DNS records (likely non-existent)');
        }
      }
    }
  } catch (error) {
    console.error('Quick DNS check failed:', error);
  }
  
  // Check for suspicious URL characteristics
  if (urlObj.pathname.length > 100) {
    score -= 5;
    reasons.push('Unusually long URL path');
  }
  
  // Check for multiple redirects in URL
  if ((urlObj.pathname.match(/\//g) || []).length > 5) {
    score -= 5;
    reasons.push('Complex URL structure');
  }
  
  // Check for suspicious parameters
  const params = urlObj.searchParams;
  if (params.has('redirect') || params.has('url') || params.has('continue')) {
    score -= 5;
    reasons.push('Contains redirect parameters');
  }
  
  // Check for encoded characters
  if (/%[0-9a-f]{2}/i.test(urlObj.href)) {
    score -= 5;
    reasons.push('Contains encoded characters');
  }
  
  return {
    passed: score >= 10,
    score: Math.max(0, score),
    reason: reasons.length > 0 ? reasons.join('; ') : undefined
  };
}

function analyzeURLContent(urlObj: URL): { passed: boolean; score: number; reason?: string } {
  let score = 10;
  let reasons: string[] = [];
  
  // Check for suspicious file extensions
  const suspiciousExtensions = ['.exe', '.scr', '.vbs', '.pif', '.cmd', '.com', '.bat'];
  const pathname = urlObj.pathname.toLowerCase();
  
  for (const ext of suspiciousExtensions) {
    if (pathname.endsWith(ext)) {
      score -= 10;
      reasons.push(`Suspicious file type: ${ext}`);
      break;
    }
  }
  
  return {
    passed: score >= 5,
    score: Math.max(0, score),
    reason: reasons.length > 0 ? reasons.join('; ') : undefined
  };
}

// Google Safe Browsing API Integration
async function checkGoogleSafeBrowsing(url: string): Promise<{ safe: boolean; threats: string[] }> {
  const API_KEY = 'AIzaSyBaQM1yHdJ9SHW7tJanrzhrmYDDlCwh0T4';
  
  try {
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
    
    if (!response.ok) {
      console.error('Google Safe Browsing API error:', response.statusText);
      return { safe: true, threats: [] }; // Default to safe on API error
    }
    
    const data = await response.json();
    
    if (data.matches && data.matches.length > 0) {
      const threats = data.matches.map((match: any) => match.threatType);
      return { safe: false, threats };
    }
    
    return { safe: true, threats: [] };
  } catch (error) {
    console.error('Google Safe Browsing check failed:', error);
    return { safe: true, threats: [] }; // Default to safe on error
  }
}

// VirusTotal API Integration
async function checkVirusTotal(url: string): Promise<{ safe: boolean; positives: number }> {
  const API_KEY = '5590fee7afa0591b84fdc2e1fe69a0d62e10daa4f4af51069f6c5eeb752562ea';
  
  try {
    // First, get the URL identifier
    const urlId = btoa(url).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    // Check if URL has been scanned before
    const response = await fetch(
      `https://www.virustotal.com/api/v3/urls/${urlId}`,
      {
        headers: {
          'x-apikey': API_KEY
        }
      }
    );
    
    if (response.status === 404) {
      // URL not in database, submit it for scanning
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
      
      // For new submissions, default to safe (will be checked on next scan)
      return { safe: true, positives: 0 };
    }
    
    if (!response.ok) {
      console.error('VirusTotal API error:', response.statusText);
      return { safe: true, positives: 0 };
    }
    
    const data = await response.json();
    const stats = data.data?.attributes?.last_analysis_stats;
    
    if (stats) {
      const malicious = stats.malicious || 0;
      const suspicious = stats.suspicious || 0;
      const positives = malicious + suspicious;
      
      return {
        safe: positives === 0,
        positives
      };
    }
    
    return { safe: true, positives: 0 };
  } catch (error) {
    console.error('VirusTotal check failed:', error);
    return { safe: true, positives: 0 }; // Default to safe on error
  }
}

// Domain Age Check with DNS verification
async function checkDomainAge(domain: string): Promise<{ exists: boolean; isNew: boolean; daysSinceCreation?: number; error?: string }> {
  try {
    // Remove subdomains to get root domain
    const parts = domain.split('.');
    if (parts.length < 2) {
      return { exists: false, isNew: true, error: 'Invalid domain format' };
    }
    
    const rootDomain = parts.slice(-2).join('.');
    
    // First, try to verify if domain exists using DNS
    try {
      // Try multiple APIs for better coverage
      
      // Option 1: Use dns.google.com for DNS verification
      const dnsResponse = await fetch(`https://dns.google/resolve?name=${rootDomain}&type=A`);
      if (dnsResponse.ok) {
        const dnsData = await dnsResponse.json();
        if (!dnsData.Answer || dnsData.Answer.length === 0) {
          // No DNS records found - domain likely doesn't exist
          return { exists: false, isNew: true, error: 'Domain has no DNS records' };
        }
      }
    } catch (dnsError) {
      console.error('DNS check failed:', dnsError);
    }
    
    // Option 2: Try WHOIS-based domain info
    try {
      // Use a different API that provides better domain info
      const response = await fetch(`https://api.apilayer.com/whois/query?domain=${rootDomain}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; URLScanner/1.0)'
        }
      });
      
      if (response.status === 404) {
        return { exists: false, isNew: true, error: 'Domain not found' };
      }
      
      if (response.ok) {
        const data = await response.json();
        
        // Check if domain exists
        if (data.result && data.result.creation_date) {
          const createdDate = new Date(data.result.creation_date);
          const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
          
          return {
            exists: true,
            isNew: daysSinceCreation < 30,
            daysSinceCreation
          };
        }
      }
    } catch (whoisError) {
      console.error('WHOIS check failed:', whoisError);
    }
    
    // Option 3: Use alternative domain age API
    try {
      const altResponse = await fetch(`https://api.domainsdb.info/v1/domains/search?domain=${rootDomain}`);
      
      if (altResponse.ok) {
        const data = await altResponse.json();
        
        if (data.domains && data.domains.length > 0) {
          const domainInfo = data.domains.find((d: any) => d.domain === rootDomain);
          
          if (domainInfo && domainInfo.create_date) {
            const createdDate = new Date(domainInfo.create_date);
            const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
            
            return {
              exists: true,
              isNew: daysSinceCreation < 30,
              daysSinceCreation
            };
          }
        }
        
        // If no domain info found, it likely doesn't exist
        return { exists: false, isNew: true, error: 'Domain not found in registry' };
      }
    } catch (altError) {
      console.error('Alternative domain check failed:', altError);
    }
    
    // If all checks fail, assume domain is suspicious (non-existent or very new)
    return { exists: false, isNew: true, error: 'Unable to verify domain existence' };
    
  } catch (error) {
    console.error('Domain age check failed:', error);
    return { exists: false, isNew: true, error: 'Domain verification failed' };
  }
}

// Domain context detection
function detectDomainContext(domain: string): {
  type: 'government' | 'educational' | 'healthcare' | 'financial' | 'trusted' | 'general';
  trustLevel: 'high' | 'medium' | 'low';
  explanation: string;
} {
  const lowerDomain = domain.toLowerCase();
  
  // Government domains
  if (lowerDomain.endsWith('.gov') || lowerDomain.endsWith('.gov.in') || 
      lowerDomain.endsWith('.gov.uk') || lowerDomain.endsWith('.gov.au') ||
      lowerDomain.endsWith('.gc.ca') || lowerDomain.endsWith('.govt.nz') ||
      lowerDomain.endsWith('.gov.sg') || lowerDomain.includes('.government.') ||
      lowerDomain.endsWith('.gob.mx') || lowerDomain.endsWith('.gov.br')) {
    return {
      type: 'government',
      trustLevel: 'high',
      explanation: 'This is an official government domain. Government websites are inherently trusted, though they may have lower technical security scores due to legacy systems.'
    };
  }
  
  // Educational domains
  if (lowerDomain.endsWith('.edu') || lowerDomain.endsWith('.ac.uk') || 
      lowerDomain.endsWith('.edu.au') || lowerDomain.endsWith('.ac.in') ||
      lowerDomain.endsWith('.edu.sg') || lowerDomain.endsWith('.edu.cn')) {
    return {
      type: 'educational',
      trustLevel: 'high',
      explanation: 'This is an educational institution domain. Educational websites are generally trusted, though security practices may vary.'
    };
  }
  
  // Healthcare domains
  if (lowerDomain.includes('hospital') || lowerDomain.includes('health') || 
      lowerDomain.includes('medical') || lowerDomain.includes('clinic') ||
      lowerDomain.endsWith('.nhs.uk')) {
    return {
      type: 'healthcare',
      trustLevel: 'medium',
      explanation: 'This appears to be a healthcare-related domain. Verify it belongs to a legitimate healthcare provider.'
    };
  }
  
  // Financial institutions (common patterns)
  const financialKeywords = ['bank', 'credit', 'finance', 'insurance', 'invest'];
  if (financialKeywords.some(keyword => lowerDomain.includes(keyword))) {
    // Check if it's a known bank
    const trustedBanks = ['chase.com', 'bankofamerica.com', 'wellsfargo.com', 'citibank.com', 
                          'usbank.com', 'capitalone.com', 'ally.com', 'discover.com'];
    if (trustedBanks.some(bank => lowerDomain === bank || lowerDomain.endsWith('.' + bank))) {
      return {
        type: 'financial',
        trustLevel: 'high',
        explanation: 'This is a recognized financial institution. Always verify the exact domain to avoid phishing.'
      };
    }
    return {
      type: 'financial',
      trustLevel: 'low',
      explanation: 'This appears to be a financial domain. Be extremely cautious and verify authenticity through official channels.'
    };
  }
  
  // Other trusted domains
  const trustedDomains = [
    'google.com', 'microsoft.com', 'apple.com', 'amazon.com', 'facebook.com',
    'youtube.com', 'wikipedia.org', 'github.com', 'stackoverflow.com', 'mozilla.org'
  ];
  
  if (trustedDomains.some(trusted => lowerDomain === trusted || lowerDomain.endsWith('.' + trusted))) {
    return {
      type: 'trusted',
      trustLevel: 'high',
      explanation: 'This is a well-known, trusted website.'
    };
  }
  
  return {
    type: 'general',
    trustLevel: 'low',
    explanation: 'This is a general domain. Verify its legitimacy before sharing sensitive information.'
  };
}

// Generate contextual score explanation
function generateScoreExplanation(score: number, domainContext: any, checks: any): string {
  const failedChecks = [];
  const explanations = [];
  
  // Analyze which checks failed and why
  if (!checks.patternAnalysis.passed) {
    failedChecks.push('pattern analysis');
    if (checks.patternAnalysis.reason?.includes('Typosquatting')) {
      explanations.push('The domain appears to be mimicking a popular website');
    } else if (checks.patternAnalysis.reason?.includes('URL shortener')) {
      explanations.push('URL shorteners can hide the actual destination');
    }
  }
  
  if (!checks.sslCertificate.passed) {
    failedChecks.push('SSL certificate');
    explanations.push('The site lacks HTTPS encryption');
  }
  
  if (!checks.domainReputation.passed) {
    failedChecks.push('domain reputation');
    if (checks.domainReputation.reason?.includes('Recently created')) {
      explanations.push('The domain was created very recently');
    }
  }
  
  // Generate contextual explanation
  if (domainContext.type === 'government' && score < 80) {
    return `This government website scored ${score}/100. While government sites are inherently trusted, this one has technical issues: ${explanations.join(', ')}. Government sites often use older technology for stability, which can affect security scores. The site is still safe to use for official purposes.`;
  } else if (domainContext.type === 'educational' && score < 80) {
    return `This educational institution scored ${score}/100. Educational sites are generally trusted but may have: ${explanations.join(', ')}. The lower score reflects technical limitations rather than malicious intent.`;
  } else if (score >= 80) {
    return `This site scored ${score}/100, indicating good security practices. ${domainContext.explanation}`;
  } else if (score >= 50) {
    return `This site scored ${score}/100 due to: ${failedChecks.join(', ')}. ${explanations.join('. ')}. Exercise caution when sharing personal information.`;
  } else {
    return `This site scored only ${score}/100, indicating serious security concerns: ${failedChecks.join(', ')}. ${explanations.join('. ')}. Avoid visiting this site or sharing any information.`;
  }
}

// Levenshtein distance function for typosquatting detection
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  // Create matrix
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  // Calculate distances
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}
