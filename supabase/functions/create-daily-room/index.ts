import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const dailyApiKey = Deno.env.get('DAILY_API_KEY');

    if (!dailyApiKey) {
      throw new Error('DAILY_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { verityDateId } = await req.json();

    if (!verityDateId) {
      throw new Error('verityDateId is required');
    }

    // Verify user is part of this verity date
    const { data: verityDate, error: verityDateError } = await supabase
      .from('verity_dates')
      .select('*, matches!inner(user1, user2)')
      .eq('id', verityDateId)
      .single();

    if (verityDateError || !verityDate) {
      throw new Error('Verity date not found');
    }

    const match = verityDate.matches;
    if (match.user1 !== user.id && match.user2 !== user.id) {
      throw new Error('Unauthorized access to this verity date');
    }

    // Create Daily.co room
    const roomResponse = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dailyApiKey}`,
      },
      body: JSON.stringify({
        properties: {
          exp: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
          enable_recording: false,
          enable_screenshare: false,
          enable_chat: false,
          enable_knocking: false,
          enable_prejoin_ui: true,
          max_participants: 2,
          eject_at_room_exp: true,
        },
      }),
    });

    if (!roomResponse.ok) {
      const errorText = await roomResponse.text();
      console.error('Daily.co API error:', errorText);
      throw new Error(`Failed to create Daily.co room: ${roomResponse.status}`);
    }

    const roomData = await roomResponse.json();
    console.log('Daily.co room created:', roomData.name);

    // Update verity_dates with room URL
    const { error: updateError } = await supabase
      .from('verity_dates')
      .update({
        room_url: roomData.url,
        scheduled_at: new Date().toISOString(),
      })
      .eq('id', verityDateId);

    if (updateError) {
      console.error('Error updating verity_dates:', updateError);
      throw new Error('Failed to update verity date');
    }

    return new Response(
      JSON.stringify({ 
        room_url: roomData.url,
        room_name: roomData.name,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-daily-room:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
