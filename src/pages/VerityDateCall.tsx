import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ReportDialog } from "@/components/ReportDialog";
import { duration, easing, spring } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ICEBREAKER_PROMPTS = [
  "What's the best adventure you've been on recently?",
  "If you could have dinner with anyone, living or historical, who would it be?",
  "What's something that always makes you smile?",
  "What's your favorite way to spend a Sunday morning?",
  "If you could learn any skill instantly, what would it be?",
  "What's a movie or book that changed your perspective?",
  "What's your go-to comfort food?",
  "What's something you're passionate about that might surprise people?",
  "If you could travel anywhere tomorrow, where would you go?",
  "What's the best piece of advice you've ever received?",
  "What's something you've always wanted to try but haven't yet?",
  "What makes you feel most alive?",
  "What's a talent or hobby you'd love to develop?",
  "What's your favorite childhood memory?",
  "If you could describe yourself in three words, what would they be?",
  "What's something that always makes you laugh?",
  "What's the most spontaneous thing you've ever done?",
  "What's your ideal way to relax after a long day?",
  "What's a place that feels like home to you?",
  "What's something you're grateful for today?",
];

const VerityDateCall = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const verityDateId = searchParams.get("id");
  const [roomUrl, setRoomUrl] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<number>(600); // 10 minutes
  const [currentIcebreakerIndex, setCurrentIcebreakerIndex] = useState<number>(0);
  const [icebreakerVisible, setIcebreakerVisible] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [partnerName, setPartnerName] = useState<string>("this user");
  const [partnerId, setPartnerId] = useState<string>("");
  
  // Timer urgency thresholds
  const isUrgent = timeRemaining <= 120; // Last 2 minutes
  const isCritical = timeRemaining <= 30; // Last 30 seconds

  useEffect(() => {
    if (!verityDateId) {
      navigate("/main");
      return;
    }

    // Load room URL and partner name
    const loadRoom = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("verity_dates")
        .select("room_url, scheduled_at, matches!inner(user1, user2)")
        .eq("id", verityDateId)
        .single();

      if (error || !data?.room_url) {
        toast({
          title: "Error",
          description: "Video room not found",
          variant: "destructive",
        });
        navigate("/main");
        return;
      }

      setRoomUrl(data.room_url);

      // Get partner name and ID
      const match = data.matches;
      const partnerUserId = match.user1 === user.id ? match.user2 : match.user1;
      setPartnerId(partnerUserId);
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", partnerUserId)
        .single();
      
      if (profile) {
        setPartnerName(profile.name || "this user");
      }

      // Calculate time remaining
      if (data.scheduled_at) {
        const scheduledTime = new Date(data.scheduled_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - scheduledTime) / 1000);
        const remaining = Math.max(0, 600 - elapsed);
        setTimeRemaining(remaining);
      }
    };

    loadRoom();

    // Start with random icebreaker
    setCurrentIcebreakerIndex(Math.floor(Math.random() * ICEBREAKER_PROMPTS.length));

    // Countdown timer
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(`/verity-date/feedback?id=${verityDateId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Icebreaker rotation - fade out, change, fade in every 60 seconds
    const icebreakerTimer = setInterval(() => {
      setIcebreakerVisible(false);
      setTimeout(() => {
        setCurrentIcebreakerIndex((prev) => (prev + 1) % ICEBREAKER_PROMPTS.length);
        setIcebreakerVisible(true);
      }, 500); // Wait for fade out
    }, 60000); // Every 60 seconds

    return () => {
      clearInterval(timer);
      clearInterval(icebreakerTimer);
    };
  }, [verityDateId, navigate, toast]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReportSubmit = () => {
    setReportOpen(false);
    toast({
      title: "Report submitted",
      description: "Our safety team will review this. Thank you for keeping Verity safe.",
    });
  };

  if (!roomUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Finding humans who are ready to be real...</p>
        </div>
      </div>
    );
  }

  const currentIcebreaker = ICEBREAKER_PROMPTS[currentIcebreakerIndex];

  return (
    <div className="relative w-full h-screen bg-background">
      {/* Timer overlay with urgency animation */}
      <motion.div 
        className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 backdrop-blur-md border rounded-full px-6 py-3 shadow-lg ${
          isCritical 
            ? 'bg-destructive/80 border-destructive/50' 
            : isUrgent 
              ? 'bg-orange-500/80 border-orange-500/50' 
              : 'bg-card/80 border-primary/20'
        }`}
        animate={prefersReducedMotion ? {} : (isCritical ? { scale: [1, 1.05, 1] } : {})}
        transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0, ease: "easeInOut" }}
      >
        <motion.div
          animate={prefersReducedMotion ? {} : (isUrgent ? { rotate: [0, -10, 10, 0] } : {})}
          transition={{ duration: 0.5, repeat: isUrgent ? Infinity : 0 }}
        >
          <Clock className={`w-5 h-5 ${isCritical ? 'text-white' : isUrgent ? 'text-white' : 'text-primary'}`} />
        </motion.div>
        <motion.span 
          className={`font-mono text-lg font-semibold ${isCritical ? 'text-white' : isUrgent ? 'text-white' : 'text-foreground'}`}
          key={timeRemaining}
          initial={prefersReducedMotion ? {} : { scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {formatTime(timeRemaining)}
        </motion.span>
      </motion.div>

      {/* Icebreaker prompt overlay with Framer Motion */}
      <AnimatePresence mode="wait">
        {icebreakerVisible && (
          <motion.div 
            key={currentIcebreakerIndex}
            className="absolute top-20 sm:top-20 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 max-w-md sm:w-full bg-gradient-to-br from-primary/90 to-secondary/90 backdrop-blur-md border border-primary/30 rounded-2xl p-4 sm:p-6 shadow-2xl"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : { duration: 0.4, ease: easing.easeOut }}
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="w-6 h-6 text-white flex-shrink-0 mt-1" fill="white" />
              </motion.div>
              <div>
                <h3 className="text-white font-semibold mb-2">Conversation Starter</h3>
                <p className="text-white/90 text-sm leading-relaxed">{currentIcebreaker}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report button */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReportOpen(true)}
          className="bg-card/80 backdrop-blur-md border border-border hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Report
        </Button>
      </div>

      {/* Daily.co iframe */}
      <iframe
        src={roomUrl}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="w-full h-full border-0"
        title="Verity Date Video Call"
      />

      {/* Decorative elements */}
      <div className="absolute bottom-4 right-4 z-50 opacity-20 pointer-events-none">
        <Heart className="w-12 h-12 text-primary animate-pulse" fill="currentColor" />
      </div>

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        onSubmit={handleReportSubmit}
        userName={partnerName}
        reportedUserId={partnerId}
        context="verity_date_call"
      />
    </div>
  );
};

export default VerityDateCall;
