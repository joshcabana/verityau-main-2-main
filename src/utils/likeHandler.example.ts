/**
 * EXAMPLE: How to integrate Verity Date creation when users like each other
 * 
 * Use this pattern in your matching/profile browsing components
 */

import { supabase } from "@/integrations/supabase/client";
import { checkAndCreateVerityDate } from "./verityDateHelpers";
import { toast } from "@/hooks/use-toast";

/**
 * Example function to handle when a user likes another user
 * This should be called from your profile card, swipe UI, or match screen
 */
export async function handleLikeUser(likedUserId: string) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Create the like
    const { error: likeError } = await supabase
      .from("likes")
      .insert({
        from_user: user.id,
        to_user: likedUserId,
      });

    if (likeError) {
      // Handle duplicate like error gracefully
      if (likeError.code === '23505') {
        toast({
          title: "Already liked",
          description: "You've already liked this person",
        });
        return;
      }
      throw likeError;
    }

    // Check if this creates a mutual like and should trigger a Verity Date
    const verityDateRequest = await checkAndCreateVerityDate(user.id, likedUserId);

    if (verityDateRequest) {
      // It's a mutual match! Show celebration
      toast({
        title: "🎉 It's a Match!",
        description: `You and ${verityDateRequest.partnerName} liked each other! Start your Verity Date to connect.`,
      });

      // The VerityDateNotification component will automatically show
      // the notification to start the video call
    } else {
      // Simple like notification
      toast({
        title: "Like sent! ❤️",
        description: "They'll be notified if they like you back.",
      });
    }
  } catch (error) {
    console.error("Error handling like:", error);
    toast({
      title: "Error",
      description: "Failed to send like. Please try again.",
      variant: "destructive",
    });
  }
}

/**
 * USAGE EXAMPLE IN A COMPONENT:
 * 
 * import { handleLikeUser } from "@/utils/likeHandler.example";
 * 
 * const ProfileCard = ({ profile }) => {
 *   return (
 *     <div>
 *       <h2>{profile.name}</h2>
 *       <Button onClick={() => handleLikeUser(profile.user_id)}>
 *         <Heart /> Like
 *       </Button>
 *     </div>
 *   );
 * };
 */
