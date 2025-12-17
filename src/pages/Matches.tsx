import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ArrowLeft, Sparkles } from "lucide-react";
import { MatchCard } from "@/components/MatchCard";
import { Chat } from "@/components/Chat";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { spring, duration, easing } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { 
  fetchUserMatches, 
  unmatchUser, 
  acceptVerityDate,
  Match 
} from "@/utils/matchHelpers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Matches = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [unmatchDialogOpen, setUnmatchDialogOpen] = useState(false);
  const [matchToUnmatch, setMatchToUnmatch] = useState<Match | null>(null);

  // Function to reload matches
  const reloadMatches = async () => {
    if (!user) return;
    try {
      const userMatches = await fetchUserMatches(user.id);
      setMatches(userMatches);
    } catch (error) {
      console.error("Error reloading matches:", error);
    }
  };

  // Realtime notifications with match refresh
  useNotifications({
    userId: user?.id,
    enabled: !!user,
    onMatch: () => {
      // Reload matches when new match occurs
      reloadMatches();
    },
    onDateRequest: () => {
      // Reload to show updated date request status
      reloadMatches();
    },
    onMessage: () => {
      // Could update unread message indicators
      reloadMatches();
    },
  });

  // Load matches
  useEffect(() => {
    const loadMatches = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const userMatches = await fetchUserMatches(user.id);
        setMatches(userMatches);
      } catch (error) {
        console.error("Error loading matches:", error);
        toast({
          title: "Error",
          description: "Failed to load matches. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, [user, toast]);

  const handleOpenChat = (match: Match) => {
    setSelectedMatch(match);
    setChatOpen(true);
  };

  const handleAcceptVerityDate = async (match: Match) => {
    if (!match.verity_date || !user) return;

    const partnerId = match.user1 === user.id ? match.user2 : match.user1;
    const success = await acceptVerityDate(match.verity_date.id, user.id, partnerId);

    if (success) {
      toast({
        title: "🎉 Verity Date Accepted!",
        description: "Redirecting to waiting room...",
        duration: 3000,
      });

      // Navigate to waiting page
      navigate(`/verity-date/waiting?id=${match.verity_date.id}`);
    } else {
      toast({
        title: "Error",
        description: "Failed to accept Verity Date. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnmatchClick = (match: Match) => {
    setMatchToUnmatch(match);
    setUnmatchDialogOpen(true);
  };

  const handleConfirmUnmatch = async () => {
    if (!matchToUnmatch) return;

    const success = await unmatchUser(matchToUnmatch.id);

    if (success) {
      toast({
        title: "Unmatched",
        description: `You've unmatched with ${matchToUnmatch.profile.name}.`,
      });

      // Remove from local state
      setMatches(matches.filter((m) => m.id !== matchToUnmatch.id));
    } else {
      toast({
        title: "Error",
        description: "Failed to unmatch. Please try again.",
        variant: "destructive",
      });
    }

    setUnmatchDialogOpen(false);
    setMatchToUnmatch(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="border-b border-border bg-card/50 backdrop-blur">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-9 w-9 rounded" />
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-2xl p-4 flex gap-4 animate-pulse">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/main")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Matches</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/verity-plus")}
          >
            <Sparkles className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {matches.length === 0 ? (
          <FadeIn className="text-center py-12">
            <motion.div 
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={prefersReducedMotion ? { duration: 0.05 } : spring.bouncy}
            >
              <motion.div
                animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="h-10 w-10 text-primary" />
              </motion.div>
            </motion.div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No matches yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Keep swiping to find your connection!
            </p>
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            >
              <Button onClick={() => navigate("/main")} className="btn-premium">
                Start Discovering
              </Button>
            </motion.div>
          </FadeIn>
        ) : (
          <StaggerContainer className="space-y-4">
            <AnimatePresence>
              {matches.map((match) => (
                <StaggerItem key={match.id}>
                  <MatchCard
                    match={match}
                    onOpenChat={() => handleOpenChat(match)}
                    onAcceptVerityDate={
                      match.verity_date && !match.verity_date.scheduled_at
                        ? () => handleAcceptVerityDate(match)
                        : undefined
                    }
                    onUnmatch={() => handleUnmatchClick(match)}
                  />
                </StaggerItem>
              ))}
            </AnimatePresence>
          </StaggerContainer>
        )}
      </div>

      {/* Chat Dialog */}
      {selectedMatch && (
        <Chat
          open={chatOpen}
          onOpenChange={setChatOpen}
          matchId={selectedMatch.id}
          matchName={selectedMatch.profile.name}
          matchPhoto={selectedMatch.profile.photos?.[0]}
          currentUserId={user?.id || ""}
          chatUnlocked={selectedMatch.chat_unlocked}
        />
      )}

      {/* Unmatch Confirmation Dialog */}
      <AlertDialog open={unmatchDialogOpen} onOpenChange={setUnmatchDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unmatch with {matchToUnmatch?.profile.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove them from your matches and you won't be able to message them anymore.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnmatch}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Unmatch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Matches;
