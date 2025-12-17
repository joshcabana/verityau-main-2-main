import { supabase } from "@/integrations/supabase/client";
import { getAllBlockedUserIds } from "./blockingHelpers";

export interface Match {
  id: string;
  user1: string;
  user2: string;
  created_at: string;
  chat_unlocked: boolean;
  profile: {
    id: string;
    user_id: string;
    name: string;
    age: number;
    photos: string[];
    bio: string | null;
    verified: boolean;
    distance_meters?: number;
    last_active?: string;
  };
  verity_date?: {
    id: string;
    scheduled_at: string | null;
    room_url: string | null;
  };
  last_message?: {
    content: string;
    sent_at: string;
  };
}

export const fetchUserMatches = async (userId: string): Promise<Match[]> => {
  try {
    // Get blocked users first
    const blockedUserIds = await getAllBlockedUserIds();

    // Fetch matches where user is either user1 or user2
    const { data: matches, error } = await supabase
      .from("matches")
      .select(`
        id,
        user1,
        user2,
        created_at,
        both_interested,
        chat_unlocked,
        verity_dates (
          id,
          scheduled_at,
          room_url,
          completed
        )
      `)
      .or(`user1.eq.${userId},user2.eq.${userId}`)
      .eq("both_interested", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!matches) return [];

    // Filter out matches with blocked users
    const filteredMatches = matches.filter((match) => {
      const matchedUserId = match.user1 === userId ? match.user2 : match.user1;
      return !blockedUserIds.includes(matchedUserId);
    });

    // Fetch profile data for each match
    const enrichedMatches = await Promise.all(
      filteredMatches.map(async (match) => {
        // Determine which user is the matched user (not the current user)
        const matchedUserId = match.user1 === userId ? match.user2 : match.user1;

        // Fetch the matched user's profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, user_id, name, age, photos, bio, verified, last_active")
          .eq("user_id", matchedUserId)
          .single();

        // Get pending Verity Date (not completed)
        const verityDate = Array.isArray(match.verity_dates) 
          ? match.verity_dates.find((vd: any) => !vd.completed)
          : undefined;

        return {
          id: match.id,
          user1: match.user1,
          user2: match.user2,
          created_at: match.created_at,
          chat_unlocked: match.chat_unlocked || false,
          profile: profile || {
            id: "",
            user_id: matchedUserId,
            name: "Unknown",
            age: 0,
            photos: [],
            bio: null,
            verified: false,
            last_active: undefined,
          },
          verity_date: verityDate,
          last_message: {
            content: match.chat_unlocked ? "Say hi! 👋" : "Complete Verity Date to chat",
            sent_at: match.created_at,
          },
        };
      })
    );

    return enrichedMatches;
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};

export const unmatchUser = async (matchId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("matches")
      .delete()
      .eq("id", matchId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error unmatching:", error);
    return false;
  }
};

export async function acceptVerityDate(
  verityDateId: string,
  currentUserId: string,
  partnerId: string
): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("No active session");
      return false;
    }

    const { data, error } = await supabase.functions.invoke("create-daily-room", {
      body: { verityDateId },
    });

    if (error) {
      console.error("Error creating Daily.co room:", error);
      return false;
    }

    // Create notification for partner
    const { createNotification } = await import("./notifications");
    await createNotification({
      userId: partnerId,
      type: "verity_date_accepted",
      title: "Verity Date Accepted!",
      message: "Your match has accepted the Verity Date. Get ready!",
      relatedId: verityDateId,
    });

    console.log("Daily.co room created:", data);
    return true;
  } catch (error) {
    console.error("Error accepting Verity Date:", error);
    return false;
  }
}
