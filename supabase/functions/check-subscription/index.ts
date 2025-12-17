import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check local subscriptions table first (populated by webhook)
    const { data: localSub } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (localSub) {
      logStep("Found active subscription in local DB", { subscriptionId: localSub.stripe_subscription_id });
      return new Response(JSON.stringify({
        subscribed: true,
        product_id: localSub.product_id,
        subscription_end: localSub.current_period_end
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Fallback to Stripe API if not in local DB
    logStep("No local subscription found, checking Stripe API");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      
      // Update profile to clear subscription
      await supabaseClient
        .from("profiles")
        .update({
          subscription_tier: null,
          subscription_product_id: null,
          subscription_expires_at: null,
        })
        .eq("user_id", user.id);
      
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;
    let tier = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      productId = subscription.items.data[0].price.product as string;
      
      // Determine tier based on product ID
      if (productId === "prod_TTRhSzeEIcxhdT") {
        tier = "basic";
      } else if (productId === "prod_TTRi8pGlnnt6KM") {
        tier = "premium";
      }
      
      logStep("Determined subscription tier", { productId, tier });

      // Update profile with subscription info
      await supabaseClient
        .from("profiles")
        .update({
          subscription_tier: tier,
          subscription_product_id: productId,
          subscription_expires_at: subscriptionEnd,
        })
        .eq("user_id", user.id);
      
      logStep("Profile updated with subscription info");
    } else {
      logStep("No active subscription found");
      
      // Clear subscription from profile
      await supabaseClient
        .from("profiles")
        .update({
          subscription_tier: null,
          subscription_product_id: null,
          subscription_expires_at: null,
        })
        .eq("user_id", user.id);
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      tier: tier,
      product_id: productId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    
    // User-friendly error messages
    let userMessage = errorMessage;
    let statusCode = 500;
    
    if (errorMessage.includes("not set")) {
      userMessage = "Subscription service is temporarily unavailable.";
      statusCode = 503;
    } else if (errorMessage.includes("Authentication")) {
      userMessage = "Please log in to check your subscription status.";
      statusCode = 401;
    } else if (!userMessage) {
      userMessage = "Unable to check subscription status. Using cached data if available.";
    }
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        details: errorMessage,
        subscribed: false 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: statusCode,
      }
    );
  }
});
