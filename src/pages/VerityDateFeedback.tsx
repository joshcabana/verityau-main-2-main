import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, Meh, X, Sparkles, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { ReportDialog } from "@/components/ReportDialog";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { spring, duration, easing } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const VerityDateFeedback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const verityDateId = searchParams.get("id");
  const [submitting, setSubmitting] = useState(false);
  const [partnerName, setPartnerName] = useState<string>("");
  const [partnerId, setPartnerId] = useState<string>("");
  const [matchId, setMatchId] = useState<string>("");
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (!verityDateId) {
      navigate("/main");
      return;
    }

    const loadVerityDate = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: verityDate, error } = await supabase
        .from("verity_dates")
        .select("*, matches!inner(id, user1, user2)")
        .eq("id", verityDateId)
        .single();

      if (error || !verityDate) {
        toast({
          title: "Error",
          description: "Verity date not found",
          variant: "destructive",
        });
        navigate("/main");
        return;
      }

      const match = verityDate.matches;
      setMatchId(match.id);
      const partnerUserId = match.user1 === user.id ? match.user2 : match.user1;
      setPartnerId(partnerUserId);

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", partnerUserId)
        .single();

      if (profile) {
        setPartnerName(profile.name || "your match");
      }
    };

    loadVerityDate();
  }, [verityDateId, navigate, toast]);

  const handleFeedback = async (feedback: "yes" | "maybe" | "no") => {
    if (!verityDateId) return;

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get current verity date to determine which feedback field to update
      const { data: verityDate } = await supabase
        .from("verity_dates")
        .select("*, matches!inner(user1, user2)")
        .eq("id", verityDateId)
        .single();

      if (!verityDate) {
        throw new Error("Verity date not found");
      }

      const match = verityDate.matches;
      const isUser1 = match.user1 === user.id;
      const feedbackField = isUser1 ? "user1_feedback" : "user2_feedback";

      // Update feedback
      const { error: updateError } = await supabase
        .from("verity_dates")
        .update({
          [feedbackField]: feedback,
          completed: true,
        })
        .eq("id", verityDateId);

      if (updateError) throw updateError;

      // Check if both users have provided feedback
      const { data: updatedVerityDate } = await supabase
        .from("verity_dates")
        .select("user1_feedback, user2_feedback")
        .eq("id", verityDateId)
        .single();

      if (updatedVerityDate?.user1_feedback && updatedVerityDate?.user2_feedback) {
        // Both provided feedback - check if it's a match
        if (updatedVerityDate.user1_feedback === "yes" && updatedVerityDate.user2_feedback === "yes") {
          // It's a match! Unlock chat
          await supabase
            .from("matches")
            .update({ 
              both_interested: true,
              chat_unlocked: true // Unlock chat after successful Verity Date
            })
            .eq("id", matchId);

          // Epic celebration with multiple confetti bursts!
          const duration = 3000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

          const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

          const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
              return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
              colors: ["#FF3B30", "#FFE66D", "#FF8E9E", "#FFB6C1", "#FFA07A"],
            });
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
              colors: ["#FF3B30", "#FFE66D", "#FF8E9E", "#FFB6C1", "#FFA07A"],
            });
          }, 250);

          toast({
            title: "🎉 It's a Match!",
            description: "You both felt the connection! Chat is now unlocked.",
          });

          setTimeout(() => {
            navigate(`/matches`);
          }, 3500);
        } else {
          // Not a mutual match - show warm, respectful message
          const isNoFeedback = updatedVerityDate.user1_feedback === "no" || updatedVerityDate.user2_feedback === "no";
          
          toast({
            title: isNoFeedback ? "You parted ways respectfully" : "Thanks for your honesty",
            description: isNoFeedback 
              ? "On to the next connection. Your perfect match is out there! ✨"
              : "We'll let you know if feelings align. Keep being real!",
          });

          setTimeout(() => {
            navigate("/main");
          }, 2500);
        }
      } else {
        // Waiting for other person's feedback
        toast({
          title: "Feedback submitted",
          description: "Waiting for your match to share their thoughts...",
        });

        setTimeout(() => {
          navigate("/main");
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  const handleReportSubmit = () => {
    setReportOpen(false);
    toast({
      title: "Report submitted",
      description: "Our safety team will review this. Thank you for keeping Verity safe.",
    });
  };

  return (
    <FadeIn className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <StaggerContainer className="max-w-2xl w-full space-y-8" staggerDelay="normal" initialDelay={0.1}>
        {/* Header with animated sparkles */}
        <StaggerItem>
          <div className="text-center space-y-4">
            <motion.div 
              className="relative inline-block"
              animate={prefersReducedMotion ? {} : { rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 blur-2xl bg-primary/30 rounded-full"
              />
              <Sparkles className="w-16 h-16 mx-auto text-primary relative" />
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              How did it go?
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Did you feel a connection with <span className="text-primary font-semibold">{partnerName}</span>?
            </motion.p>
          </div>
        </StaggerItem>

        {/* Feedback buttons */}
        <StaggerItem>
          <div className="grid gap-4 max-w-md mx-auto">
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              transition={spring.gentle}
            >
              <Button
                size="lg"
                onClick={() => handleFeedback("yes")}
                disabled={submitting}
                className="w-full h-auto py-6 px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <motion.div
                  animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart className="w-6 h-6 mr-3" fill="currentColor" />
                </motion.div>
                <div className="text-left">
                  <div className="font-semibold text-lg">Yes! 💕</div>
                  <div className="text-sm opacity-90">I felt a real connection</div>
                </div>
              </Button>
            </motion.div>

            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              transition={spring.gentle}
            >
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleFeedback("maybe")}
                disabled={submitting}
                className="w-full h-auto py-6 px-8 border-2 hover:bg-muted/50 transition-all duration-300 group"
              >
                <Meh className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="font-semibold text-lg">Maybe later</div>
                  <div className="text-sm text-muted-foreground">Not sure yet, want to think about it</div>
                </div>
              </Button>
            </motion.div>

            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              transition={spring.gentle}
            >
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleFeedback("no")}
                disabled={submitting}
                className="w-full h-auto py-6 px-8 border-2 hover:bg-muted/50 transition-all duration-300 group"
              >
                <X className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="font-semibold text-lg">No connection</div>
                  <div className="text-sm text-muted-foreground">Didn't feel the spark</div>
                </div>
              </Button>
            </motion.div>
          </div>
        </StaggerItem>

        {/* Info card */}
        <StaggerItem>
          <motion.div 
            className="text-center text-sm text-muted-foreground bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 max-w-md mx-auto"
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            transition={spring.gentle}
          >
            <p>Your honest feedback helps create meaningful connections. If you both say yes, chat will be unlocked! 💬</p>
          </motion.div>
        </StaggerItem>

        {/* Report button */}
        <StaggerItem>
          <div className="text-center">
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReportOpen(true)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Report {partnerName}
              </Button>
            </motion.div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        onSubmit={handleReportSubmit}
        userName={partnerName}
        reportedUserId={partnerId}
        context="verity_date_feedback"
      />
    </FadeIn>
  );
};

export default VerityDateFeedback;
