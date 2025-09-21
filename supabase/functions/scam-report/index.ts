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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { url, title, description, category, evidence_file_url, reporter_name, reporter_user_id, location } = await req.json();
    
    // Validate required fields
    if (!url || !title || !description || !category) {
      return new Response(JSON.stringify({ error: 'URL, title, description, and category are required' }), {
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

    // Create URL hash for deduplication
    const encoder = new TextEncoder();
    const data = encoder.encode(url.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const urlHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('Creating scam report:', { url, title, category, urlHash });

    // Check if URL already exists
    const { data: existingReport } = await supabaseClient
      .from('scam_reports')
      .select('id, title, upvotes, downvotes')
      .eq('url_hash', urlHash)
      .single();

    if (existingReport) {
      return new Response(JSON.stringify({ 
        error: 'This URL has already been reported',
        existing_report: existingReport 
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert new scam report
    const { data: report, error: insertError } = await supabaseClient
      .from('scam_reports')
      .insert({
        url: url.trim(),
        url_hash: urlHash,
        title: title.trim(),
        description: description.trim(),
        category: category,
        evidence_file_url,
        reporter_name: reporter_name?.trim(),
        reporter_user_id,
        location: location?.trim(),
        status: 'pending',
        upvotes: 0,
        downvotes: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating scam report:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create scam report' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      report: report 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scam-report function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});