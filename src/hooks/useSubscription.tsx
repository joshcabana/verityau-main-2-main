import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { retryAsync, isOnline } from "@/utils/retryUtils";

export interface SubscriptionStatus {
  subscribed: boolean;
  tier: "basic" | "premium" | null;
  product_id: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    subscribed: false,
    tier: null,
    product_id: null,
    subscription_end: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = async () => {
    if (!user) {
      setSubscription({
        subscribed: false,
        tier: null,
        product_id: null,
        subscription_end: null,
      });
      setLoading(false);
      return;
    }

    if (!isOnline()) {
      setError("You are offline. Subscription status may be outdated.");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      await retryAsync(
        async () => {
          const { data, error } = await supabase.functions.invoke("check-subscription");

          if (error) throw error;

          setSubscription(data);
        },
        {
          maxRetries: 2,
          delayMs: 1000,
          onRetry: (attempt) => {
            console.log(`Retrying subscription check (attempt ${attempt})`);
          },
        }
      );
    } catch (error) {
      console.error("Error checking subscription:", error);
      const message = error instanceof Error ? error.message : "Failed to check subscription";
      setError(message);
      toast.error("Failed to check subscription status. Using cached data if available.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();

    // Check subscription every 60 seconds
    const interval = setInterval(checkSubscription, 60000);

    return () => clearInterval(interval);
  }, [user]);

  const createCheckout = async (priceId: string) => {
    if (!isOnline()) {
      toast.error("You are offline. Please check your internet connection.");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      const message = error instanceof Error ? error.message : "Failed to start checkout";
      toast.error(message);
    }
  };

  const openCustomerPortal = async () => {
    if (!isOnline()) {
      toast.error("You are offline. Please check your internet connection.");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL received");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      const message = error instanceof Error ? error.message : "Failed to open customer portal";
      toast.error(message);
    }
  };

  return {
    subscription,
    loading,
    error,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    isPremium: subscription.tier === "premium",
    isBasic: subscription.tier === "basic",
    hasSubscription: subscription.subscribed,
  };
};
