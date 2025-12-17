import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangle } from "lucide-react";
import { ReportDialog } from "@/components/ReportDialog";

const IntroCall = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(45);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMatch = () => {
    navigate("/extended-call");
  };

  const handleEnd = () => {
    navigate("/main");
  };

  const handleReport = () => {
    setIsReportOpen(true);
  };

  const handleReportSubmit = () => {
    setIsReportOpen(false);
    navigate("/main");
  };

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

      {/* Prompt */}
      <div className="px-4 pb-4 text-center">
        <p className="text-sm text-muted-foreground">
          Start with your names and where you're based.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-border bg-card/50 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          <Button
            onClick={handleMatch}
            size="lg"
            className="w-full h-14 text-lg font-semibold"
          >
            Match
          </Button>
          
          <div className="flex gap-3">
            <Button
              onClick={handleEnd}
              variant="secondary"
              size="lg"
              className="flex-1 h-12"
            >
              End
            </Button>
            
            <Button
              onClick={handleReport}
              variant="ghost"
              size="lg"
              className="flex-1 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report
            </Button>
          </div>
        </div>
      </div>

      <ReportDialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        onSubmit={handleReportSubmit}
        context="intro_call_demo"
      />
    </div>
  );
};

export default IntroCall;
