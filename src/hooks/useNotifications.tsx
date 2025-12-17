import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Notification {
  id: string;
  user_id: string;
  type: "match" | "verity_date_request" | "verity_date_accepted" | "message" | "like";
  title: string;
  message: string;
  related_id: string | null;
  read: boolean;
  created_at: string;
}

interface UseNotificationsOptions {
  userId?: string;
  enabled?: boolean;
  onMatch?: () => void;
  onLike?: () => void;
  onDateRequest?: () => void;
  onMessage?: () => void;
}

/**
 * Hook for realtime notifications with toast integration
 * Subscribes to Supabase realtime for instant notification delivery
 */
export function useNotifications({
  userId,
  enabled = true,
  onMatch,
  onLike,
  onDateRequest,
  onMessage,
}: UseNotificationsOptions = {}) {
  const navigate = useNavigate();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId || !enabled) return;

    // Set up realtime subscription for notifications
    const channel = supabase
      .channel(`user-notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification;
          handleNewNotification(notification);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, enabled, onMatch, onLike, onDateRequest, onMessage]);

  const handleNewNotification = (notification: Notification) => {
    // Show toast notification
    toast.success(notification.title, {
      description: notification.message,
      duration: 5000,
      action: notification.related_id
        ? {
            label: "View",
            onClick: () => navigateToNotification(notification),
          }
        : undefined,
    });

    // Trigger type-specific callbacks
    switch (notification.type) {
      case "match":
        onMatch?.();
        break;
      case "like":
        onLike?.();
        break;
      case "verity_date_request":
        onDateRequest?.();
        sendEmailNotification(notification);
        break;
      case "verity_date_accepted":
        sendEmailNotification(notification);
        break;
      case "message":
        onMessage?.();
        break;
    }
  };

  const navigateToNotification = (notification: Notification) => {
    const path = getNotificationPath(notification);
    if (path) {
      navigate(path);
    }
  };

  const getNotificationPath = (notification: Notification): string | null => {
    switch (notification.type) {
      case "match":
        return "/matches";
      case "like":
        return "/who-liked-you";
      case "verity_date_request":
        return "/matches";
      case "verity_date_accepted":
        return `/verity-date/waiting?verityDateId=${notification.related_id}`;
      case "message":
        return `/chat/${notification.related_id}`;
      default:
        return null;
    }
  };

  const sendEmailNotification = (notification: Notification) => {
    // In production, this would call a Supabase Edge Function to send actual emails
    // await supabase.functions.invoke('send-email', { ... });
  };

  return {
    // Helper to manually trigger a notification (for testing)
    triggerTestNotification: async () => {
      if (!userId) return;

      const testNotification = {
        user_id: userId,
        type: "match",
        title: "🎉 New Match!",
        message: "You have a new match! Start chatting now.",
        related_id: crypto.randomUUID(),
        read: false,
      };

      const { error } = await supabase
        .from("notifications")
        .insert(testNotification);

      if (error) {
        console.error("Error creating test notification:", error);
      }
    },
  };
}

// Helper function to create notifications (used by other parts of the app)
export async function createNotification(params: {
  userId: string;
  type: Notification["type"];
  title: string;
  message: string;
  relatedId?: string;
}) {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      related_id: params.relatedId,
      read: false,
    });

    if (error) {
      console.error("Error creating notification:", error);
    }
  } catch (error) {
    console.error("Error in createNotification:", error);
  }
}
