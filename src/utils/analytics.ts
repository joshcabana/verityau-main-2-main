import { supabase } from "@/integrations/supabase/client";

export type AnalyticsEvent =
  | "profile_view"
  | "profile_like"
  | "profile_pass"
  | "match_created"
  | "verity_date_scheduled"
  | "verity_date_completed"
  | "message_sent"
  | "premium_upgrade"
  | "boost_used"
  | "filter_changed"
  | "undo_used"
  | "app_opened"
  | "profile_edit";

export async function trackEvent(
  eventType: AnalyticsEvent,
  eventData?: Record<string, any>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("analytics_events").insert({
      user_id: user.id,
      event_type: eventType,
      event_data: eventData || {},
    });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    // Don't throw - analytics should never break the app
  }
}

export async function trackPageView(pageName: string): Promise<void> {
  await trackEvent("app_opened", { page: pageName });
}

export async function getUserAnalytics(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<any[]> {
  try {
    let query = supabase
      .from("analytics_events")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (startDate) {
      query = query.gte("created_at", startDate.toISOString());
    }
    if (endDate) {
      query = query.lte("created_at", endDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return [];
  }
}
