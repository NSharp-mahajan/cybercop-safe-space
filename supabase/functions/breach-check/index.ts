import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface BreachCheckRequest {
  type: 'password' | 'email';
  value: string;
  user_id?: string;
}

interface BreachCheckResponse {
  compromised: boolean;
  breachCount?: number;
  breaches?: Array<{
    name: string;
    date: string;
    description: string;
  }>;
  suggestions?: string[];
  error?: string;
}

// Function to hash password using SHA-1 for HIBP API
async function sha1Hash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.toUpperCase();
}

// Check if password has been compromised using HIBP API
async function checkPasswordBreach(password: string): Promise<{compromised: boolean, count: number}> {
  try {
    const hash = await sha1Hash(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);
    
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'User-Agent': 'CyberCop-Safe-Space'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to check password breach');
    }
    
    const text = await response.text();
    const hashes = text.split('\r\n');
    
    for (const hashLine of hashes) {
      const [hashSuffix, count] = hashLine.split(':');
      if (hashSuffix === suffix) {
        return { compromised: true, count: parseInt(count) };
      }
    }
    
    return { compromised: false, count: 0 };
  } catch (error) {
    console.error('Error checking password breach:', error);
    throw error;
  }
}

// Check if email has been compromised using HIBP API
async function checkEmailBreach(email: string): Promise<{compromised: boolean, breaches: any[]}> {
  try {
    const response = await fetch(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: {
          'User-Agent': 'CyberCop-Safe-Space',
          'hibp-api-key': Deno.env.get('HIBP_API_KEY') || ''
        }
      }
    );
    
    if (response.status === 404) {
      return { compromised: false, breaches: [] };
    }
    
    if (!response.ok) {
      throw new Error('Failed to check email breach');
    }
    
    const breaches = await response.json();
    return {
      compromised: true,
      breaches: breaches.map((breach: any) => ({
        name: breach.Name,
        title: breach.Title,
        domain: breach.Domain,
        date: breach.BreachDate,
        pwnCount: breach.PwnCount,
        description: breach.Description.replace(/<[^>]*>/g, ''), // Remove HTML tags
        dataTypes: breach.DataClasses,
        isVerified: breach.IsVerified,
        isSensitive: breach.IsSensitive,
        logoPath: breach.LogoPath
      }))
    };
  } catch (error) {
    console.error('Error checking email breach:', error);
    throw error;
  }
}

// Generate password improvement suggestions
function generatePasswordSuggestions(password: string): string[] {
  const suggestions = [];
  
  if (password.length < 12) {
    suggestions.push('Increase password length to at least 12 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    suggestions.push('Add uppercase letters for better security');
  }
  
  if (!/[a-z]/.test(password)) {
    suggestions.push('Add lowercase letters for variety');
  }
  
  if (!/\d/.test(password)) {
    suggestions.push('Include numbers to increase complexity');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    suggestions.push('Add special characters (!@#$%^&*) for maximum security');
  }
  
  // Check for common patterns
  if (/(\d)\1{2,}/.test(password) || /([a-zA-Z])\1{2,}/.test(password)) {
    suggestions.push('Avoid repeating characters (e.g., 111, aaa)');
  }
  
  if (/12345|qwerty|password|admin|letmein/i.test(password)) {
    suggestions.push('Avoid common password patterns and dictionary words');
  }
  
  if (/\b\d{4}\b/.test(password) && parseInt(password.match(/\b\d{4}\b/)[0]) >= 1900 && parseInt(password.match(/\b\d{4}\b/)[0]) <= 2024) {
    suggestions.push('Avoid using years or dates that could be guessed');
  }
  
  // Check for keyboard patterns
  const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn', '123456', 'qazwsx'];
  for (const pattern of keyboardPatterns) {
    if (password.toLowerCase().includes(pattern)) {
      suggestions.push('Avoid keyboard patterns like "qwerty" or "123456"');
      break;
    }
  }
  
  return suggestions;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, value, user_id } = await req.json() as BreachCheckRequest;
    
    if (!type || !value) {
      throw new Error('Missing required parameters');
    }
    
    let response: BreachCheckResponse;
    
    if (type === 'password') {
      const { compromised, count } = await checkPasswordBreach(value);
      const suggestions = generatePasswordSuggestions(value);
      
      response = {
        compromised,
        breachCount: count,
        suggestions
      };
      
      // Log the check if user is authenticated
      if (user_id) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        );
        
        await supabaseClient.from('security_checks').insert({
          user_id,
          check_type: 'password_breach',
          result: compromised ? 'compromised' : 'safe',
          metadata: { breach_count: count }
        });
      }
    } else if (type === 'email') {
      const { compromised, breaches } = await checkEmailBreach(value);
      
      response = {
        compromised,
        breachCount: breaches.length,
        breaches: breaches.slice(0, 10) // Limit to 10 most recent breaches
      };
      
      // Log the check if user is authenticated
      if (user_id) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        );
        
        await supabaseClient.from('security_checks').insert({
          user_id,
          check_type: 'email_breach',
          result: compromised ? 'compromised' : 'safe',
          metadata: { breach_count: breaches.length }
        });
      }
    } else {
      throw new Error('Invalid check type');
    }
    
    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error in breach-check function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while checking for breaches',
        compromised: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
