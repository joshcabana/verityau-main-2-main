import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Sparkles, Shield, Loader2, RotateCcw, Crown, SlidersHorizontal, Bell, BellOff } from "lucide-react";
import { ProfileCard } from "@/components/ProfileCard";
import { PreferencesDrawer } from "@/components/PreferencesDrawer";
import { VerityDateNotification } from "@/components/VerityDateNotification";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { fetchMatchingProfiles, likeProfile, passProfile, undoLastPass, boostProfile, Profile } from "@/utils/matchmaking";
import { trackEvent, trackPageView } from "@/utils/analytics";
import { supabase } from "@/integrations/supabase/client";
import { startLastActiveUpdates } from "@/utils/updateLastActive";

const Main = () => {
  const { user } = useAuth();
  const { hasSubscription, isPremium } = useSubscription();
  const { isSupported, subscription, subscribeToPush, unsubscribeFromPush } = usePushNotifications(user?.id);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Realtime notifications with toast integration
  useNotifications({
    userId: user?.id,
    enabled: !!user,
    onMatch: () => {
      // Refresh matches when new match occurs
      trackEvent("match_notification_received");
    },
    onLike: () => {
      // Could show special animation or refresh like count
      trackEvent("like_notification_received");
    },
    onDateRequest: () => {
      // Refresh to show date request notification
      trackEvent("date_request_notification_received");
    },
    onMessage: () => {
      // Update unread message count
      trackEvent("message_notification_received");
    },
  });
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [preferences, setPreferences] = useState<any>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [filters, setFilters] = useState<{
    verifiedOnly: boolean;
    activeRecently: boolean;
    heightRange?: [number, number];
    interests?: string[];
    values?: string[];
  }>({
    verifiedOnly: false,
    activeRecently: false,
    heightRange: [150, 200],
    interests: [],
    values: [],
  });

  // Fetch user preferences and profiles
  useEffect(() => {
    const loadProfilesAndPreferences = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Track page view
        trackPageView("discovery");

        // Start updating last_active
        const cleanup = startLastActiveUpdates(user.id);

        // Get user preferences
        const { data: userPrefs } = await supabase
          .from("preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (userPrefs) {
          setPreferences(userPrefs);

          // Parse age_range from PostgreSQL int4range format
          const ageRange = userPrefs.age_range;
          let minAge = 18;
          let maxAge = 99;
          
          if (typeof ageRange === 'string') {
            const matches = ageRange.match(/\[(\d+),(\d+)\)/);
            if (matches) {
              minAge = parseInt(matches[1]);
              maxAge = parseInt(matches[2]) - 1; // PostgreSQL ranges are exclusive on upper bound
            }
          }

          // Fetch matching profiles
          const matchingProfiles = await fetchMatchingProfiles(
            user.id,
            {
              gender_prefs: userPrefs.gender_prefs || [],
              age_range: [minAge, maxAge],
              distance_km: userPrefs.distance_km || 100,
            },
            20,
            filters
          );

          setProfiles(matchingProfiles);
        }

        return cleanup;
      } catch (error) {
        console.error("Error loading profiles:", error);
        toast({
          title: "Error",
          description: "Failed to load profiles. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const cleanup = loadProfilesAndPreferences();

    return () => {
      cleanup.then((fn) => fn && fn());
    };
  }, [user, toast, filters]);

  // Load more profiles when near the end
  useEffect(() => {
    const loadMoreProfiles = async () => {
      if (!user || !preferences || isLoadingMore || profiles.length - currentProfileIndex > 3) return;

      try {
        setIsLoadingMore(true);

        const ageRange = preferences.age_range;
        let minAge = 18;
        let maxAge = 99;
        
        if (typeof ageRange === 'string') {
          const matches = ageRange.match(/\[(\d+),(\d+)\)/);
          if (matches) {
            minAge = parseInt(matches[1]);
            maxAge = parseInt(matches[2]) - 1;
          }
        }

        const newProfiles = await fetchMatchingProfiles(
          user.id,
          {
            gender_prefs: preferences.gender_prefs || [],
            age_range: [minAge, maxAge],
            distance_km: preferences.distance_km || 100,
          },
          10,
          filters
        );

        setProfiles((prev) => [...prev, ...newProfiles]);
      } catch (error) {
        console.error("Error loading more profiles:", error);
      } finally {
        setIsLoadingMore(false);
      }
    };

    loadMoreProfiles();
  }, [currentProfileIndex, profiles.length, user, preferences, isLoadingMore, filters]);

  const handleLike = async () => {
    if (!user || isProcessingAction || !currentProfile) return;

    try {
      setIsProcessingAction(true);

      // Track like event
      trackEvent("profile_like", { 
        liked_user_id: currentProfile.user_id,
        profile_name: currentProfile.name 
      });

      const result = await likeProfile(user.id, currentProfile.user_id);

      if (result.isMatch && result.matchId) {
        // Track match event
        trackEvent("match_created", { 
          match_id: result.matchId,
          matched_with: currentProfile.user_id 
        });
        
        // Navigate to match success page with confetti
        navigate(`/match-success?matchId=${result.matchId}`);
      } else {
        toast({
          title: "💕 Like sent!",
          description: `${currentProfile.name} will be notified if they like you back.`,
          duration: 3000,
        });
      }

      // Move to next profile and reset undo
      setCurrentProfileIndex((prev) => prev + 1);
      setCanUndo(false);
    } catch (error) {
      console.error("Error liking profile:", error);
      toast({
        title: "Error",
        description: "Failed to send like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handlePass = async () => {
    if (!user || isProcessingAction || !currentProfile) return;

    try {
      setIsProcessingAction(true);

      // Track pass event
      trackEvent("profile_pass", { 
        passed_user_id: currentProfile.user_id,
        profile_name: currentProfile.name 
      });

      await passProfile(user.id, currentProfile.user_id);

      // Enable undo button
      setCanUndo(true);

      // Move to next profile
      setCurrentProfileIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Error passing profile:", error);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleUndo = async () => {
    if (!user || isUndoing) return;

    try {
      setIsUndoing(true);

      const result = await undoLastPass(user.id, hasSubscription);
      
      if (result.requiresPremium) {
        toast({
          title: "🔒 Premium Feature",
          description: "Upgrade to Verity Plus to undo passes!",
          action: (
            <Button size="sm" onClick={() => navigate("/verity-plus")}>
              <Crown className="h-4 w-4 mr-1" />
              Upgrade
            </Button>
          ),
          duration: 6000,
        });
        return;
      }

      if (result.success) {
        setCanUndo(false);
        // Reload profiles from beginning
        setCurrentProfileIndex(0);
        setProfiles([]);

        toast({
          title: "⏮️ Rewinded!",
          description: "Profile brought back to your feed.",
        });
      } else {
        toast({
          title: "Nothing to undo",
          description: "No recent passes to rewind.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error undoing pass:", error);
      toast({
        title: "Error",
        description: "Failed to undo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUndoing(false);
    }
  };

  const handleFiltersChange = async (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentProfileIndex(0);
    setProfiles([]);
  };

  const currentProfile = profiles[currentProfileIndex];
  const hasMoreProfiles = currentProfileIndex < profiles.length;

  // Swipeable handlers for touch gestures
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isProcessingAction && currentProfile) {
        setSwipeDirection("left");
        setTimeout(() => {
          handlePass();
          setSwipeDirection(null);
        }, 300);
      }
    },
    onSwipedRight: () => {
      if (!isProcessingAction && currentProfile) {
        setSwipeDirection("right");
        setTimeout(() => {
          handleLike();
          setSwipeDirection(null);
        }, 300);
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Skeleton className="w-full aspect-[3/4] rounded-2xl" />
          <div className="flex justify-center gap-6 mt-6">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="w-20 h-20 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!hasMoreProfiles && !isLoadingMore) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              No more profiles
            </h2>
            <p className="text-muted-foreground">
              You've seen everyone nearby. {filters.verifiedOnly || filters.activeRecently ? 'Try adjusting your filters!' : 'Check back later for new matches!'}
            </p>
          </div>

          <div className="space-y-3">
            {(filters.verifiedOnly || filters.activeRecently) && (
              <Button
                onClick={() => setPreferencesOpen(true)}
                size="lg"
                variant="outline"
                className="w-full"
              >
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                Adjust Filters
              </Button>
            )}
            <Button
              onClick={() => navigate("/matches")}
              size="lg"
              className="w-full btn-premium"
            >
              <Heart className="w-5 h-5 mr-2" />
              View My Matches
            </Button>
            
            <Button
              onClick={() => navigate("/verity-plus")}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Verity Plus
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Discover</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreferencesOpen(true)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {(filters.verifiedOnly || filters.activeRecently) && (
                <span className="w-2 h-2 bg-primary rounded-full" />
              )}
            </Button>
            {canUndo && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={isUndoing}
                className="relative group"
              >
                <RotateCcw className={`h-5 w-5 ${isUndoing ? 'animate-spin' : ''}`} />
                <Crown className="absolute -top-1 -right-1 h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/matches")}
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/verity-plus")}
            >
              <Sparkles className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Feed */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        {currentProfile ? (
          <div className="w-full" {...swipeHandlers}>
            <div
              className={`transition-transform duration-300 ${
                swipeDirection === "right"
                  ? "translate-x-8 rotate-6"
                  : swipeDirection === "left"
                  ? "-translate-x-8 -rotate-6"
                  : ""
              }`}
            >
              <ProfileCard
                profile={currentProfile}
                onLike={handleLike}
                onPass={handlePass}
              />
            </div>
            
            {/* Swipe hints */}
            {swipeDirection === "right" && (
              <div className="absolute top-20 left-8 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xl rotate-12 shadow-lg">
                LIKE 💚
              </div>
            )}
            {swipeDirection === "left" && (
              <div className="absolute top-20 right-8 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xl -rotate-12 shadow-lg">
                PASS ❌
              </div>
            )}
            
            {/* Profile counter */}
            <div className="text-center mt-4 text-sm text-muted-foreground">
              {currentProfileIndex + 1} of {profiles.length}
              {isLoadingMore && " • Loading more..."}
            </div>
            
            {/* Swipe instruction */}
            <div className="text-center mt-2 text-xs text-muted-foreground">
              👉 Swipe right to like, left to pass
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profiles...</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-border bg-card/50 backdrop-blur safe-area-bottom">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-around gap-4">
            <Button
              variant="ghost"
              className="flex-col h-auto py-2 px-4"
              onClick={() => navigate("/matches")}
            >
              <Heart className="h-5 w-5 mb-1" />
              <span className="text-xs">Matches</span>
            </Button>
            <Button
              variant="ghost"
              className="flex-col h-auto py-2 px-4"
              onClick={() => navigate("/verity-plus")}
            >
              <Sparkles className="h-5 w-5 mb-1" />
              <span className="text-xs">Verity Plus</span>
            </Button>
            <Button
              variant="ghost"
              className="flex-col h-auto py-2 px-4"
              onClick={() => {
                toast({
                  title: "Community Guidelines",
                  description: "Be respectful, authentic, and kind to everyone.",
                });
              }}
            >
              <Shield className="h-5 w-5 mb-1" />
              <span className="text-xs">Guidelines</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Preferences Drawer */}
      <PreferencesDrawer
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Verity Date Notifications */}
      <VerityDateNotification />

      {/* Push Notification Toggle */}
      {isSupported && (
        <div className="fixed bottom-24 right-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={subscription ? unsubscribeFromPush : subscribeToPush}
            className="rounded-full shadow-lg bg-card"
            title={subscription ? "Disable push notifications" : "Enable push notifications"}
          >
            {subscription ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Main;
