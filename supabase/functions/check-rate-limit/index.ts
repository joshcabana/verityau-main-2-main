// Rate Limiting Edge Function for Verity
// Prevents spam by limiting likes and messages to 5 per minute per user

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateLimitRequest {
  userId: string
  action: 'like' | 'message'
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, action }: RateLimitRequest = await req.json()

    if (!userId || !action) {
      throw new Error('Missing userId or action')
    }

    // Check rate limit table
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()

    const { data: recentActions, error: queryError } = await supabaseClient
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('action_type', action)
      .gte('created_at', oneMinuteAgo)

    if (queryError) throw queryError

    // Check if user exceeded limit (5 actions per minute)
    if (recentActions && recentActions.length >= 5) {
      return new Response(
        JSON.stringify({
          allowed: false,
          error: `Rate limit exceeded. You can only ${action} 5 times per minute.`,
          retryAfter: 60,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      )
    }

    // Log this action
    const { error: insertError } = await supabaseClient
      .from('rate_limits')
      .insert({
        user_id: userId,
        action_type: action,
      })

    if (insertError) throw insertError

    // Action is allowed
    return new Response(
      JSON.stringify({
        allowed: true,
        remaining: 5 - (recentActions?.length || 0) - 1,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
