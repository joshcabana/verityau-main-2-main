import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [step, setStep] = useState<"warning" | "confirm">("warning");

  const isConfirmed = confirmText.toUpperCase() === "DELETE";

  const handleClose = () => {
    setConfirmText("");
    setStep("warning");
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setIsDeleting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to delete your account");
        return;
      }

      const { data, error } = await supabase.functions.invoke("delete-account", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Delete account error:", error);
        toast.error("Failed to delete account. Please try again.");
        return;
      }

      if (data?.success) {
        toast.success("Your account has been deleted.");
        
        // Sign out and redirect
        await supabase.auth.signOut();
        navigate("/");
      } else {
        toast.error(data?.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && handleClose()}>
      <DialogContent className="sm:max-w-md bg-card border-destructive/20">
        <AnimatePresence mode="wait">
          {step === "warning" ? (
            <motion.div
              key="warning"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DialogHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <DialogTitle className="text-center text-xl">
                  Delete Your Account?
                </DialogTitle>
                <DialogDescription className="text-center">
                  This action is permanent and cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="my-6 space-y-4">
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <h4 className="font-semibold text-destructive mb-2">
                    This will permanently delete:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your profile and all photos</li>
                    <li>• All your matches and conversations</li>
                    <li>• Your preferences and settings</li>
                    <li>• Any active subscriptions</li>
                    <li>• Your verification status</li>
                  </ul>
                </div>
              </div>

              <DialogFooter className="flex gap-3 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Keep Account
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setStep("confirm")}
                  className="flex-1"
                >
                  Continue
                </Button>
              </DialogFooter>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <DialogTitle className="text-center text-xl">
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription className="text-center">
                  Type <span className="font-mono font-bold text-foreground">DELETE</span> to confirm
                </DialogDescription>
              </DialogHeader>

              <div className="my-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="confirm-delete">
                    Type DELETE to confirm
                  </Label>
                  <Input
                    id="confirm-delete"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="font-mono text-center uppercase"
                    disabled={isDeleting}
                  />
                </div>
              </div>

              <DialogFooter className="flex gap-3 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("warning")}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={!isConfirmed || isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Forever
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteAccountDialog;

