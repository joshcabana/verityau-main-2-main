import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";
import { spring, duration, easing } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { StaggerContainer, StaggerItem } from "@/components/motion";

const MatchSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get("matchId");
  const prefersReducedMotion = useReducedMotion();
  
  const [match, setMatch] = useState<{
    id: string;
    name: string;
    age: number;
    photo: string | null;
    matchedDate: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trigger confetti animation
    const confettiDuration = 3000;
    const animationEnd = Date.now() + confettiDuration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / confettiDuration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadMatchData = async () => {
      if (!matchId) {
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch match details
        const { data: matchData } = await supabase
          .from("matches")
          .select("user1, user2, created_at")
          .eq("id", matchId)
          .single();

        if (matchData) {
          const partnerId = matchData.user1 === user.id ? matchData.user2 : matchData.user1;

          // Fetch partner's profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, age, photos, bio")
            .eq("user_id", partnerId)
            .single();

          setMatch({
            id: matchId,
            name: profile?.name || "Unknown",
            age: profile?.age || 0,
            photo: profile?.photos?.[0] || null,
            matchedDate: new Date(matchData.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })
          });
        }
      } catch (error) {
        console.error("Error loading match:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMatchData();
  }, [matchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Match not found</h1>
          <Button onClick={() => navigate("/main")}>Go to Main</Button>
        </div>
      </div>
    );
  }

  // Heart animation variants
  const heartVariants = {
    initial: { scale: 0, rotate: -45 },
    animate: {
      scale: [0, 1.2, 1],
      rotate: [-45, 0, 0],
      transition: prefersReducedMotion 
        ? { duration: 0.05 }
        : { 
            duration: 0.6,
            times: [0, 0.6, 1],
            ease: easing.easeOut,
          }
    },
  };

  const cardVariants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: prefersReducedMotion 
        ? { duration: 0.05 }
        : spring.gentle
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center px-4">
      <motion.div 
        className="w-full max-w-md"
        variants={cardVariants}
        initial="initial"
        animate="animate"
      >
        <StaggerContainer className="bg-card rounded-2xl shadow-lg p-8 md:p-12 text-center space-y-8">
          {/* Success Icon */}
          <StaggerItem>
            <div className="flex justify-center">
              <motion.div 
                className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={prefersReducedMotion ? { duration: 0.05 } : spring.bouncy}
              >
                <motion.div
                  variants={heartVariants}
                  initial="initial"
                  animate="animate"
                >
                  <motion.div
                    animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }}
                  >
                    <Heart className="h-10 w-10 text-primary fill-primary" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </StaggerItem>

          {/* Heading */}
          <StaggerItem>
            <div className="space-y-2">
              <motion.h1 
                className="text-2xl md:text-3xl font-bold text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: duration.normal }}
              >
                🎉 It's a Match!
              </motion.h1>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: duration.normal }}
              >
                You and {match.name} liked each other
              </motion.p>
            </div>
          </StaggerItem>

          {/* Match Card */}
          <StaggerItem>
            <motion.div 
              className="bg-muted rounded-xl p-6 space-y-4"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              transition={spring.gentle}
            >
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={prefersReducedMotion ? { duration: 0.05 } : { ...spring.bouncy, delay: 0.4 }}
                >
                  <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                    <AvatarImage src={match.photo} alt={match.name} />
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                      {match.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {match.name}, {match.age}
                </h2>

                <p className="text-sm text-muted-foreground pt-2">
                  Matched on {match.matchedDate}
                </p>
              </div>
            </motion.div>
          </StaggerItem>

          {/* Info */}
          <StaggerItem>
            <div className="bg-primary/5 rounded-lg p-4 text-sm text-muted-foreground">
              <p>
                Complete a Verity Date to unlock chat and get to know each other better!
              </p>
            </div>
          </StaggerItem>

          {/* Actions */}
          <StaggerItem>
            <div className="space-y-3">
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              >
                <Button
                  onClick={() => navigate("/matches")}
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                >
                  View Match
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              >
                <Button
                  onClick={() => navigate("/main")}
                  variant="outline"
                  size="lg"
                  className="w-full h-12 text-base"
                >
                  Keep Discovering
                </Button>
              </motion.div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </motion.div>
    </div>
  );
};

export default MatchSuccess;
