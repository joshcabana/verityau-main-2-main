import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock } from "lucide-react";

interface VerityDateRescheduleProps {
  verityDateId: string;
  currentUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRescheduled: () => void;
}

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

export function VerityDateReschedule({
  verityDateId,
  currentUserId,
  open,
  onOpenChange,
  onRescheduled,
}: VerityDateRescheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleTime = (time: string) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter((t) => t !== time));
    } else if (selectedTimes.length < 3) {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || selectedTimes.length === 0) {
      toast.error("Please select a date and at least one time slot");
      return;
    }

    setSubmitting(true);
    try {
      // Get current verity date to determine which user field to update
      const { data: verityDate } = await supabase
        .from("verity_dates")
        .select("match_id, matches(user1, user2)")
        .eq("id", verityDateId)
        .single();

      if (!verityDate) throw new Error("Verity date not found");

      const match = verityDate.matches as any;
      const isUser1 = match.user1 === currentUserId;
      
      const preferredTimes = selectedTimes.map((time) => ({
        date: selectedDate.toISOString().split("T")[0],
        time,
      }));

      const updateData = isUser1
        ? {
            user1_status: "maybe_later",
            user1_preferred_times: preferredTimes,
          }
        : {
            user2_status: "maybe_later",
            user2_preferred_times: preferredTimes,
          };

      const { error } = await supabase
        .from("verity_dates")
        .update(updateData)
        .eq("id", verityDateId);

      if (error) throw error;

      toast.success("Rescheduling preferences saved! We'll notify your match.");
      onRescheduled();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error rescheduling:", error);
      toast.error("Failed to save rescheduling preferences");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Verity Date</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Select a date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          <div>
            <Label>Select up to 3 preferred times</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {TIME_SLOTS.map((time) => (
                <Button
                  key={time}
                  variant={selectedTimes.includes(time) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTime(time)}
                  disabled={
                    !selectedTimes.includes(time) && selectedTimes.length >= 3
                  }
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {time}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedTimes.length}/3 times selected
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || !selectedDate || selectedTimes.length === 0}
            className="w-full"
          >
            {submitting ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
