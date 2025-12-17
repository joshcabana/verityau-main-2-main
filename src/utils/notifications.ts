import { supabase } from "@/integrations/supabase/client";

interface CreateNotificationParams {
  userId: string;
  type: "match" | "verity_date_request" | "verity_date_accepted" | "message" | "like";
  title: string;
  message: string;
  relatedId?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  relatedId,
}: CreateNotificationParams) {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      type,
      title,
      message,
      related_id: relatedId,
    });

    if (error) {
      console.error("Error creating notification:", error);
      return;
    }

    // Send email for important notifications (Verity Date requests/acceptance)
    if (type === "verity_date_request" || type === "verity_date_accepted") {
      await sendEmailNotification({
        userId,
        type,
        title,
        message,
        relatedId,
      });
    }

    // Send push notification for message types
    if (type === "message") {
      try {
        await supabase.functions.invoke("send-push-notification", {
          body: {
            recipientId: userId,
            title,
            body: message,
            url: `/matches?chat=${relatedId}`,
            matchId: relatedId,
          },
        });
      } catch (pushError) {
        console.error("Error sending push notification:", pushError);
      }
    }
  } catch (error) {
    console.error("Error in createNotification:", error);
  }
}

/**
 * Email notification stub - logs to console for now
 * In production, would call Supabase Edge Function to send actual emails
 */
async function sendEmailNotification(params: CreateNotificationParams) {
  // Fetch user email from profile
  try {
    const { data: user } = await supabase.auth.getUser();
    const email = user?.user?.email || "user@example.com";

    console.log("📧 EMAIL NOTIFICATION STUB:");
    console.log({
      to: email,
      subject: params.title,
      body: params.message,
      type: params.type,
      timestamp: new Date().toISOString(),
      metadata: {
        userId: params.userId,
        relatedId: params.relatedId,
      },
      template: getEmailTemplate(params.type),
    });
    console.log("---");

    // In production, uncomment to send actual emails:
    /*
    await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject: params.title,
        template: params.type,
        data: {
          title: params.title,
          message: params.message,
          relatedId: params.relatedId,
          actionUrl: getActionUrl(params.type, params.relatedId),
        }
      }
    });
    */
  } catch (error) {
    console.error("Error in sendEmailNotification:", error);
  }
}

function getEmailTemplate(type: string): string {
  switch (type) {
    case "verity_date_request":
      return "verity_date_request";
    case "verity_date_accepted":
      return "verity_date_accepted";
    default:
      return "notification";
  }
}

function getActionUrl(type: string, relatedId?: string): string {
  switch (type) {
    case "verity_date_request":
      return `${window.location.origin}/matches`;
    case "verity_date_accepted":
      return `${window.location.origin}/verity-date/waiting?verityDateId=${relatedId}`;
    default:
      return window.location.origin;
  }
}
