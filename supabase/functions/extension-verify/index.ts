import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyRequest {
  licenseKey: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { licenseKey }: VerifyRequest = await req.json()

    if (!licenseKey) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'License key is required' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Find license in database
    const { data: license, error: licenseError } = await supabaseClient
      .from('extension_licenses')
      .select(`
        *,
        user_subscriptions!inner(
          status,
          ends_at,
          subscription_plans(name, features)
        )
      `)
      .eq('license_key', licenseKey)
      .eq('status', 'active')
      .single()

    if (licenseError || !license) {
      console.log('License not found:', licenseError)
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid license key' 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if license has expired
    if (new Date(license.expires_at) < new Date()) {
      // Deactivate expired license
      await supabaseClient
        .from('extension_licenses')
        .update({ status: 'expired' })
        .eq('id', license.id)

      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'License has expired' 
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if subscription is still active
    const subscription = license.user_subscriptions
    if (subscription.status !== 'active' || new Date(subscription.ends_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Subscription is no longer active' 
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // License is valid
    return new Response(
      JSON.stringify({ 
        valid: true, 
        userInfo: {
          userId: license.user_id,
          plan: subscription.subscription_plans.name,
          features: subscription.subscription_plans.features,
          expiresAt: license.expires_at
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Extension verification error:', error)
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Failed to verify license' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
