import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHash } from "https://deno.land/std@0.190.0/hash/mod.ts";

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
    try {
      new URL(url);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
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

    const urlHash = createHash("sha256").update(url.toLowerCase().trim()).toString();

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
      urlStatus = await analyzeURL(url);
      console.log('Analysis result:', urlStatus);
    }

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
      cached: !!cachedCheck 
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

async function analyzeURL(url: string): Promise<'safe' | 'suspicious' | 'malicious'> {
  try {
    const urlObj = new URL(url);
    
    // Basic suspicious indicators
    const suspiciousPatterns = [
      /bit\.ly|tinyurl|goo\.gl|t\.co/, // URL shorteners
      /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, // IP addresses
      /[a-z0-9]+-[a-z0-9]+-[a-z0-9]+\.(tk|ml|ga|cf)/, // Suspicious TLDs
      /urgent|winner|claim|verify|suspended|limited/i, // Suspicious keywords in path
    ];

    // Malicious indicators
    const maliciousPatterns = [
      /phishing|malware|virus|trojan/i,
      /fake.*bank|fake.*paypal|fake.*amazon/i,
      /[0-9]{10,}\.com/, // Random number domains
    ];

    const fullUrl = url.toLowerCase();
    const domain = urlObj.hostname.toLowerCase();
    
    // Check for malicious patterns
    for (const pattern of maliciousPatterns) {
      if (pattern.test(fullUrl) || pattern.test(domain)) {
        return 'malicious';
      }
    }

    // Check for suspicious patterns
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(fullUrl) || pattern.test(domain)) {
        return 'suspicious';
      }
    }

    // Check domain age and other factors
    if (domain.length > 30 || domain.split('.').length > 4) {
      return 'suspicious';
    }

    // Additional checks could include:
    // - Domain reputation APIs
    // - DNS checks
    // - SSL certificate validation
    // - Content analysis

    return 'safe';
    
  } catch (error) {
    console.error('URL analysis error:', error);
    return 'suspicious'; // Default to suspicious on error
  }
}