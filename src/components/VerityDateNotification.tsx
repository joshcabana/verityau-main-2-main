import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Video, Sparkles } from "lucide-react";
import { getPendingVerityDates } from "@/utils/verityDateHelpers";

interface PendingVerityDate {
  id: string;
  matches: {
    id: string;
    user1: string;
    user2: string;
  };
}

export const VerityDateNotification = () => {
  const navigate = useNavigate();
  const [pendingDates, setPendingDates] = useState<PendingVerityDate[]>([]);
  const [partnerNames, setPartnerNames] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPendingDates();

    // Subscribe to new verity dates
    const channel = supabase
      .channel("verity_dates_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "verity_dates",
        },
        () => {
          loadPendingDates();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadPendingDates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dates = await getPendingVerityDates(user.id);
    setPendingDates(dates);

    // Load partner names
    const names: Record<string, string> = {};
    for (const date of dates) {
      const partnerId = date.matches.user1 === user.id 
        ? date.matches.user2 
        : date.matches.user1;
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", partnerId)
        .single();
      
      if (profile) {
        names[date.id] = profile.name || "your match";
      }
    }
    setPartnerNames(names);
  };

  const handleStartVerityDate = (verityDateId: string) => {
    navigate(`/verity-date/waiting?id=${verityDateId}`);
  };

  if (pendingDates.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom duration-500">
      {pendingDates.map((date) => (
        <Card key={date.id} className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 shadow-2xl backdrop-blur-sm mb-4">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="relative">
                <Heart className="w-8 h-8 text-primary animate-pulse" fill="currentColor" />
                <Sparkles className="w-4 h-4 text-secondary absolute -top-1 -right-1" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  It's a Match! 🎉
                </h3>
                <p className="text-sm text-muted-foreground">
                  You and <span className="text-primary font-semibold">{partnerNames[date.id]}</span> liked each other!
                </p>
              </div>
            </div>

            <div className="bg-card/50 rounded-lg p-3 text-sm text-muted-foreground space-y-1">
              <p className="flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                <span>Start your 10-minute Verity Date</span>
              </p>
              <p className="text-xs">Connect via video to see if you click!</p>
            </div>

            <Button
              onClick={() => handleStartVerityDate(date.id)}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300"
              size="lg"
            >
              <Video className="w-5 h-5 mr-2" />
              Start Verity Date
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
