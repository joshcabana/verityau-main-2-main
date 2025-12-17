import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PUBLIC_VAPID_KEY = "BEl62iUYgUivxIkv-69N9rPZNhHyqFJ5z5j7sS1VVZKZ6TQGHSqKBhQN-6MvHUQBfW7mQTXGCzLJXA5ue9OSrSM";

export const usePushNotifications = (userId: string | undefined) => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw error;
    }
  };

  const subscribeToPush = async () => {
    if (!isSupported || !userId) {
      console.log('Push notifications not supported or user not logged in');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast({
          title: "Notifications blocked",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
        return;
      }

      const registration = await registerServiceWorker();
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      });

      setSubscription(sub);

      // Store subscription in database
      const subscriptionJson = sub.toJSON();
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        endpoint: subscriptionJson.endpoint!,
        p256dh: subscriptionJson.keys!.p256dh!,
        auth: subscriptionJson.keys!.auth!,
      }, {
        onConflict: 'endpoint'
      });

      if (error) {
        console.error('Error saving subscription:', error);
        throw error;
      }

      toast({
        title: "Notifications enabled",
        description: "You'll receive notifications for new messages",
      });
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast({
        title: "Error",
        description: "Failed to enable notifications",
        variant: "destructive",
      });
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      
      // Remove from database
      const subscriptionJson = subscription.toJSON();
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscriptionJson.endpoint!);

      setSubscription(null);
      
      toast({
        title: "Notifications disabled",
        description: "You won't receive push notifications anymore",
      });
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  return {
    isSupported,
    subscription,
    subscribeToPush,
    unsubscribeFromPush,
  };
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
