import { supabase } from "@/integrations/supabase/client";

export const updateLastActive = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ last_active: new Date().toISOString() })
      .eq("user_id", userId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating last active:", error);
  }
};

// Update last active every 5 minutes
export const startLastActiveUpdates = (userId: string): (() => void) => {
  // Update immediately
  updateLastActive(userId);

  // Then update every 5 minutes
  const interval = setInterval(() => {
    updateLastActive(userId);
  }, 5 * 60 * 1000); // 5 minutes

  // Return cleanup function
  return () => clearInterval(interval);
};
