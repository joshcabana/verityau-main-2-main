import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Loader2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VerityDateReschedule } from "@/components/VerityDateReschedule";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/utils/analytics";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { duration, easing, spring } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const VerityDateWaiting = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const verityDateId = searchParams.get("id");
  const [partnerName, setPartnerName] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(60);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    if (!verityDateId) {
      toast({
        title: "Error",
        description: "Invalid verity date ID",
        variant: "destructive",
      });
      navigate("/main");
      return;
    }

    const loadVerityDate = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setCurrentUserId(user.id);

      // Get verity date and partner info
      const { data: verityDate, error } = await supabase
        .from("verity_dates")
        .select("*, matches!inner(user1, user2)")
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
      const partnerId = match.user1 === user.id ? match.user2 : match.user1;

      // Get partner profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", partnerId)
        .single();

      if (profile) {
        setPartnerName(profile.name || "your match");
      }

      // If room already exists, redirect
      if (verityDate.room_url) {
        setRoomUrl(verityDate.room_url);
        setTimeout(() => {
          navigate(`/verity-date/call?id=${verityDateId}`);
        }, 2000);
      } else {
        // Create room
        createRoom();
      }
    };

    const createRoom = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke("create-daily-room", {
        body: { verityDateId },
      });

      if (error || !data?.room_url) {
        toast({
          title: "Error",
          description: "Failed to create video room",
          variant: "destructive",
        });
        navigate("/main");
        return;
      }

      setRoomUrl(data.room_url);
      setTimeout(() => {
        navigate(`/verity-date/call?id=${verityDateId}`);
      }, 2000);
    };

    loadVerityDate();

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [verityDateId, navigate, toast]);

  return (
    <FadeIn className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <StaggerContainer className="max-w-lg w-full text-center space-y-8" staggerDelay="normal" initialDelay={0.1}>
        {/* Animated Heart */}
        <StaggerItem>
          <div className="relative">
            <motion.div 
              className="absolute inset-0 blur-3xl bg-primary/20 rounded-full"
              animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="w-24 h-24 mx-auto text-primary relative" fill="currentColor" />
            </motion.div>
          </div>
        </StaggerItem>

        {/* Heading */}
        <StaggerItem>
          <div className="space-y-4">
            <motion.h1 
              className="text-4xl font-bold text-foreground"
              animate={prefersReducedMotion ? {} : { opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Getting Ready...
            </motion.h1>
            <p className="text-xl text-muted-foreground">
              Waiting for <span className="text-primary font-semibold">{partnerName}</span> to join your Verity Date
            </p>
          </div>
        </StaggerItem>

        {/* Loading spinner */}
        <StaggerItem>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Finding humans who are ready to be real...</span>
          </div>
        </StaggerItem>

        {/* Room status */}
        <AnimatePresence>
          {roomUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-primary"
            >
              Room created! Joining in a moment...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated countdown */}
        <StaggerItem>
          <motion.div 
            className="text-4xl font-mono text-primary font-bold"
            key={countdown}
            initial={prefersReducedMotion ? {} : { scale: 1.3, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {countdown}s
          </motion.div>
        </StaggerItem>

        {/* Tips card */}
        <StaggerItem>
          <motion.div 
            className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-3"
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            transition={spring.gentle}
          >
            <h3 className="font-semibold text-foreground">Remember:</h3>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li>✨ Be authentic and present</li>
              <li>💬 Let the conversation flow naturally</li>
              <li>⏱️ You'll have 10 minutes together</li>
              <li>❤️ After the call, share if you felt a connection</li>
            </ul>
          </motion.div>
        </StaggerItem>

        {/* Reschedule button */}
        <StaggerItem>
          <motion.div
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            transition={spring.default}
          >
            <Button
              variant="outline"
              onClick={() => setRescheduleOpen(true)}
              className="w-full"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Maybe Later - Reschedule
            </Button>
          </motion.div>
        </StaggerItem>
      </StaggerContainer>

      {verityDateId && currentUserId && (
        <VerityDateReschedule
          verityDateId={verityDateId}
          currentUserId={currentUserId}
          open={rescheduleOpen}
          onOpenChange={setRescheduleOpen}
          onRescheduled={() => {
            trackEvent("verity_date_scheduled", { 
              verity_date_id: verityDateId,
              action: "rescheduled" 
            });
            toast({
              title: "Preferences saved",
              description: "We'll help coordinate a better time with your match.",
            });
            navigate("/matches");
          }}
        />
      )}
    </FadeIn>
  );
};

export default VerityDateWaiting;
