import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { ProfileCard } from "@/components/ProfileCard";
import { Loader2, Lock, Crown, WifiOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Profile } from "@/utils/matchmaking";
import { ProfileCardSkeleton } from "@/components/ui/skeleton-card";
import { retryAsync, isOnline } from "@/utils/retryUtils";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

export default function WhoLikedYou() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { hasSubscription, loading: subLoading } = useSubscription();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!isOnline());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchLikes = async () => {
      if (!user) return;

      if (!isOnline()) {
        setError("You are offline. Please check your internet connection.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        await retryAsync(
          async () => {
            // Get all users who liked the current user
            const { data: likes, error: likesError } = await supabase
              .from("likes")
              .select("from_user")
              .eq("to_user", user.id);

            if (likesError) throw likesError;

            if (!likes || likes.length === 0) {
              setProfiles([]);
              return;
            }

            const likedByUserIds = likes.map(like => like.from_user);

            // Fetch profiles of users who liked the current user
            const { data: profilesData, error: profilesError } = await supabase
              .from("profiles")
              .select("*")
              .in("user_id", likedByUserIds);

            if (profilesError) throw profilesError;

            setProfiles(profilesData as Profile[]);
          },
          {
            maxRetries: 2,
            delayMs: 1000,
            onRetry: (attempt) => {
              console.log(`Retrying fetch likes (attempt ${attempt})`);
            },
          }
        );
      } catch (error) {
        console.error("Error fetching likes:", error);
        const message = error instanceof Error ? error.message : "Failed to load likes";
        setError(message);
        
        toast({
          title: "Failed to Load",
          description: "Unable to load profiles who liked you. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && !subLoading) {
      fetchLikes();
    }
  }, [user, authLoading, subLoading, toast]);

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-24">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <Lock className="h-24 w-24 text-primary/20" />
                <Crown className="h-12 w-12 text-primary absolute top-0 right-0 transform translate-x-2 -translate-y-2" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">See Who Liked You</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Upgrade to Verity Plus to see everyone who's interested in you. Don't miss out on potential matches!
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/verity-plus")}
              className="gap-2"
            >
              <Crown className="h-5 w-5" />
              Upgrade to Verity Plus
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Who Liked You</h1>
          
          {!loading && !error && (
            <p className="text-muted-foreground mb-8">
              {profiles.length} {profiles.length === 1 ? "person" : "people"} liked your profile
            </p>
          )}

          {isOffline && (
            <Card className="p-6 mb-6 bg-destructive/10 border-destructive/20">
              <div className="flex items-center gap-3">
                <WifiOff className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">You're offline</p>
                  <p className="text-sm text-muted-foreground">Check your internet connection</p>
                </div>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileCardSkeleton />
              <ProfileCardSkeleton />
              <ProfileCardSkeleton />
              <ProfileCardSkeleton />
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Unable to Load</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try Again
              </Button>
            </Card>
          ) : profiles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">
                No one has liked you yet. Keep swiping to get more matches!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onLike={() => {}}
                  onPass={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
