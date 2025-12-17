import { supabase } from "@/integrations/supabase/client";

export interface VerityDateRequest {
  matchId: string;
  partnerId: string;
  partnerName: string;
  verityDateId?: string;
}

/**
 * Check if a mutual like exists and create a Verity Date request
 */
export async function checkAndCreateVerityDate(
  currentUserId: string,
  likedUserId: string
): Promise<VerityDateRequest | null> {
  try {
    // Check if the other user has already liked us
    const { data: mutualLike, error: likeError } = await supabase
      .from("likes")
      .select("*")
      .eq("from_user", likedUserId)
      .eq("to_user", currentUserId)
      .single();

    if (likeError || !mutualLike) {
      // Not a mutual like yet
      return null;
    }

    // It's a mutual like! Check if match already exists
    const { data: existingMatch } = await supabase
      .from("matches")
      .select("id, verity_dates(id)")
      .or(`and(user1.eq.${currentUserId},user2.eq.${likedUserId}),and(user1.eq.${likedUserId},user2.eq.${currentUserId})`)
      .single();

    let matchId: string;

    if (existingMatch) {
      matchId = existingMatch.id;
      
      // Check if verity date already exists
      if (existingMatch.verity_dates && existingMatch.verity_dates.length > 0) {
        // Verity date already exists
        return null;
      }
    } else {
      // Create new match
      const { data: newMatch, error: matchError } = await supabase
        .from("matches")
        .insert({
          user1: currentUserId,
          user2: likedUserId,
          both_interested: false, // Will be true after successful Verity Date
        })
        .select()
        .single();

      if (matchError || !newMatch) {
        console.error("Error creating match:", matchError);
        return null;
      }

      matchId = newMatch.id;
    }

    // Create Verity Date
    const { data: verityDate, error: verityDateError } = await supabase
      .from("verity_dates")
      .insert({
        match_id: matchId,
      })
      .select()
      .single();

    if (verityDateError || !verityDate) {
      console.error("Error creating verity date:", verityDateError);
      return null;
    }

    // Get partner info
    const { data: partnerProfile } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", likedUserId)
      .single();

    // Create notification for the partner
    const { createNotification } = await import("./notifications");
    await createNotification({
      userId: likedUserId,
      type: "verity_date_request",
      title: "New Verity Date Request!",
      message: `${partnerProfile?.name || "Someone"} wants to have a Verity Date with you!`,
      relatedId: verityDate.id,
    });

    return {
      matchId,
      partnerId: likedUserId,
      partnerName: partnerProfile?.name || "your match",
      verityDateId: verityDate.id,
    };
  } catch (error) {
    console.error("Error in checkAndCreateVerityDate:", error);
    return null;
  }
}

/**
 * Get pending Verity Date requests for the current user
 */
export async function getPendingVerityDates(userId: string) {
  try {
    const { data, error } = await supabase
      .from("verity_dates")
      .select(`
        *,
        matches!inner(
          id,
          user1,
          user2
        )
      `)
      .is("room_url", null)
      .eq("completed", false);

    if (error) {
      console.error("Error fetching pending verity dates:", error);
      return [];
    }

    // Filter for matches involving this user
    return data?.filter((vd: any) => 
      vd.matches.user1 === userId || vd.matches.user2 === userId
    ) || [];
  } catch (error) {
    console.error("Error in getPendingVerityDates:", error);
    return [];
  }
}

/**
 * Accept a Verity Date and create the Daily.co room
 */
export async function acceptVerityDate(verityDateId: string): Promise<{ room_url?: string; error?: string }> {
  try {
    // Call edge function to create Daily.co room
    const { data, error } = await supabase.functions.invoke('create-daily-room', {
      body: { verityDateId },
    });

    if (error) {
      console.error('Error creating Daily room:', error);
      
      // Log error for monitoring
      await supabase.from('video_call_errors').insert({
        verity_date_id: verityDateId,
        error_message: error.message || 'Unknown error',
        error_code: error.code,
        timestamp: new Date().toISOString(),
      }).catch(logError => console.error('Failed to log video error:', logError));
      
      return { 
        error: 'Video call service temporarily unavailable. Please try again in a few minutes or contact support if the issue persists.' 
      };
    }

    if (!data?.room_url) {
      console.error('Daily.co returned no room URL');
      return { 
        error: 'Failed to create video room. Please try again or contact support.' 
      };
    }

    return { room_url: data.room_url };
  } catch (error) {
    console.error('Unexpected error in acceptVerityDate:', error);
    
    // Log critical error
    await supabase.from('video_call_errors').insert({
      verity_date_id: verityDateId,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }).catch(logError => console.error('Failed to log video error:', logError));
    
    return { 
      error: 'An unexpected error occurred. Please refresh the page and try again.' 
    };
  }
}

