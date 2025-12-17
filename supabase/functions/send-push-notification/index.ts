import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// VAPID keys for web push
const VAPID_PUBLIC_KEY = "BEl62iUYgUivxIkv-69N9rPZNhHyqFJ5z5j7sS1VVZKZ6TQGHSqKBhQN-6MvHUQBfW7mQTXGCzLJXA5ue9OSrSM";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";

interface PushPayload {
  recipientId: string;
  title: string;
  body: string;
  url?: string;
  matchId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { recipientId, title, body, url, matchId }: PushPayload = await req.json();

    // Get user's push subscriptions
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", recipientId);

    if (error) {
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscriptions found for user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Send push notification to all subscriptions
    const pushPromises = subscriptions.map(async (sub) => {
      try {
        const payload = JSON.stringify({
          title,
          body,
          url: url || "/",
          matchId,
          tag: `message-${matchId}`,
        });

        const response = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "TTL": "86400",
          },
          body: payload,
        });

        if (!response.ok && (response.status === 404 || response.status === 410)) {
          // Subscription is invalid, remove it
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }

        return response.ok;
      } catch (error) {
        console.error("Error sending push notification:", error);
        return false;
      }
    });

    const results = await Promise.all(pushPromises);
    const successCount = results.filter((r) => r).length;

    return new Response(
      JSON.stringify({ 
        message: `Sent ${successCount}/${subscriptions.length} notifications`,
        success: true 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
