import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  userName?: string;
  reportedUserId?: string;
  context?: string;
}

export const ReportDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  userName = "this user",
  reportedUserId,
  context = "unknown"
}: ReportDialogProps) => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reportedUserId) {
      toast({
        title: "Error",
        description: "Unable to submit report. User information missing.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a report.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("reports")
        .insert({
          reporter_id: user.id,
          reported_user_id: reportedUserId,
          reason,
          details,
          context,
          status: "pending",
        });

      if (error) throw error;

      onSubmit();
      setReason("");
      setDetails("");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Report {userName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Why are you reporting {userName}?</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value="inappropriate" id="inappropriate" className="mt-0.5" />
                <Label htmlFor="inappropriate" className="font-normal cursor-pointer leading-relaxed flex-1">
                  Inappropriate behavior or content
                </Label>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value="harassment" id="harassment" className="mt-0.5" />
                <Label htmlFor="harassment" className="font-normal cursor-pointer leading-relaxed flex-1">
                  Harassment or hate speech
                </Label>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value="fake" id="fake" className="mt-0.5" />
                <Label htmlFor="fake" className="font-normal cursor-pointer leading-relaxed flex-1">
                  Fake profile or spam
                </Label>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value="underage" id="underage" className="mt-0.5" />
                <Label htmlFor="underage" className="font-normal cursor-pointer leading-relaxed flex-1">
                  Appears to be under 18
                </Label>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value="other" id="other" className="mt-0.5" />
                <Label htmlFor="other" className="font-normal cursor-pointer leading-relaxed flex-1">
                  Other safety concern
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="details" className="text-sm font-medium">
              Additional details (optional)
            </Label>
            <Textarea
              id="details"
              placeholder="Help us understand what happened..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your report is anonymous and will be reviewed by our safety team. We take all reports seriously and will take appropriate action.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
