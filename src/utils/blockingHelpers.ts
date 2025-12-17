import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Block a user
 */
export async function blockUser(blockedUserId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to block users");
      return false;
    }

    if (user.id === blockedUserId) {
      toast.error("You cannot block yourself");
      return false;
    }

    const { error } = await supabase
      .from("blocked_users")
      .insert({
        blocker_id: user.id,
        blocked_id: blockedUserId,
      });

    if (error) {
      // If error is duplicate, user is already blocked
      if (error.code === "23505") {
        toast.error("User is already blocked");
        return false;
      }
      console.error("Error blocking user:", error);
      toast.error("Failed to block user");
      return false;
    }

    toast.success("User blocked successfully");
    return true;
  } catch (error) {
    console.error("Unexpected error blocking user:", error);
    toast.error("Failed to block user");
    return false;
  }
}

/**
 * Unblock a user
 */
export async function unblockUser(blockedUserId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to unblock users");
      return false;
    }

    const { error } = await supabase
      .from("blocked_users")
      .delete()
      .eq("blocker_id", user.id)
      .eq("blocked_id", blockedUserId);

    if (error) {
      console.error("Error unblocking user:", error);
      toast.error("Failed to unblock user");
      return false;
    }

    toast.success("User unblocked successfully");
    return true;
  } catch (error) {
    console.error("Unexpected error unblocking user:", error);
    toast.error("Failed to unblock user");
    return false;
  }
}

/**
 * Check if a user is blocked (either direction)
 */
export async function isUserBlocked(userId: string, otherUserId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("is_user_blocked", {
      user_id: userId,
      other_user_id: otherUserId,
    });

    if (error) {
      console.error("Error checking if user is blocked:", error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error("Unexpected error checking if user is blocked:", error);
    return false;
  }
}

/**
 * Get list of users the current user has blocked
 */
export async function getBlockedUsers(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("blocked_users")
      .select("blocked_id")
      .eq("blocker_id", user.id);

    if (error) {
      console.error("Error fetching blocked users:", error);
      return [];
    }

    return data.map((block) => block.blocked_id);
  } catch (error) {
    console.error("Unexpected error fetching blocked users:", error);
    return [];
  }
}

/**
 * Get list of users who have blocked the current user
 */
export async function getUsersWhoBlockedMe(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("blocked_users")
      .select("blocker_id")
      .eq("blocked_id", user.id);

    if (error) {
      console.error("Error fetching users who blocked me:", error);
      return [];
    }

    return data.map((block) => block.blocker_id);
  } catch (error) {
    console.error("Unexpected error fetching users who blocked me:", error);
    return [];
  }
}

/**
 * Get all users that should be hidden (blocked or blocking)
 */
export async function getAllBlockedUserIds(): Promise<string[]> {
  try {
    const [blockedByMe, blockedMe] = await Promise.all([
      getBlockedUsers(),
      getUsersWhoBlockedMe(),
    ]);

    // Combine and deduplicate
    return [...new Set([...blockedByMe, ...blockedMe])];
  } catch (error) {
    console.error("Unexpected error fetching all blocked users:", error);
    return [];
  }
}
