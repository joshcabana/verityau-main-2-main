import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangle } from "lucide-react";
import { ReportDialog } from "@/components/ReportDialog";

const ExtendedCall = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      // Auto-navigate when timer ends
      navigate("/match-success");
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEnd = () => {
    navigate("/match-success");
  };

  const handleReport = () => {
    setIsReportOpen(true);
  };

  const handleReportSubmit = () => {
    setIsReportOpen(false);
    navigate("/main");
  };

  const showWarningBanner = timeLeft <= 30 && timeLeft > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Timer */}
      <div className="bg-card border-b border-border py-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary tabular-nums">
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {showWarningBanner && (
        <div className="bg-primary/10 border-b border-primary/20 py-3 px-4">
          <p className="text-center text-sm text-foreground">
            30 seconds left – say your goodbyes or swap details if you wish.
          </p>
        </div>
      )}

      {/* Video Tiles */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 md:p-6">
        {/* You */}
        <div className="flex-1 bg-muted rounded-xl overflow-hidden relative min-h-[300px] md:min-h-0">
          <div className="absolute inset-0 flex items-center justify-center">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                You
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur px-3 py-1.5 rounded-full">
            <span className="text-sm font-medium text-foreground">You</span>
          </div>
        </div>

        {/* Them */}
        <div className="flex-1 bg-muted rounded-xl overflow-hidden relative min-h-[300px] md:min-h-0">
          <div className="absolute inset-0 flex items-center justify-center">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                ?
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur px-3 py-1.5 rounded-full">
            <span className="text-sm font-medium text-foreground">Them</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-border bg-card/50 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          <Button
            onClick={handleEnd}
            size="lg"
            className="w-full h-14 text-lg font-semibold"
          >
            End call
          </Button>
          
          <Button
            onClick={handleReport}
            variant="ghost"
            size="lg"
            className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report
          </Button>
        </div>
      </div>

      <ReportDialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        onSubmit={handleReportSubmit}
        context="extended_call_demo"
      />
    </div>
  );
};

export default ExtendedCall;
