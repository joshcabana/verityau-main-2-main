import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No stripe-signature header found");
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { type: event.type });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("Webhook signature verification failed", { error: errorMessage });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle subscription events
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      logStep("Processing subscription event", {
        type: event.type,
        subscriptionId: subscription.id,
        customerId,
        status: subscription.status,
      });

      // Find user by Stripe customer ID
      const { data: profiles, error: profileError } = await supabaseClient
        .from("profiles")
        .select("user_id")
        .eq("subscription_product_id", customerId)
        .limit(1);

      if (profileError || !profiles || profiles.length === 0) {
        // Try to find by email
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.deleted && customer.email) {
          const { data: authUser } = await supabaseClient.auth.admin.listUsers();
          const user = authUser.users.find((u) => u.email === customer.email);
          
          if (user) {
            logStep("Found user by email", { userId: user.id, email: customer.email });
            await upsertSubscription(supabaseClient, user.id, customerId, subscription);
          } else {
            logStep("User not found for customer", { customerId, email: customer.email });
          }
        }
      } else {
        const userId = profiles[0].user_id;
        await upsertSubscription(supabaseClient, userId, customerId, subscription);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function upsertSubscription(
  supabaseClient: any,
  userId: string,
  customerId: string,
  subscription: Stripe.Subscription
) {
  const productId = subscription.items.data[0]?.price.product as string;
  
  const subscriptionData = {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    product_id: productId,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseClient
    .from("subscriptions")
    .upsert(subscriptionData, {
      onConflict: "stripe_subscription_id",
    });

  if (error) {
    console.error("Error upserting subscription:", error);
    throw error;
  }

  logStep("Subscription upserted successfully", { userId, subscriptionId: subscription.id });

  // Also update profiles table for backward compatibility
  await supabaseClient
    .from("profiles")
    .update({
      subscription_tier: subscription.status === "active" ? "premium" : null,
      subscription_product_id: subscription.status === "active" ? productId : null,
      subscription_expires_at: subscription.status === "active"
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
    })
    .eq("user_id", userId);

  logStep("Profile updated", { userId });
}
