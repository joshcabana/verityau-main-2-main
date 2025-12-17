import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Ban, ShieldOff } from "lucide-react";
import { blockUser, unblockUser } from "@/utils/blockingHelpers";

interface BlockButtonProps {
  userId: string;
  userName: string;
  isBlocked?: boolean;
  onBlockChange?: (blocked: boolean) => void;
  variant?: "default" | "ghost" | "destructive" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export const BlockButton = ({
  userId,
  userName,
  isBlocked = false,
  onBlockChange,
  variant = "destructive",
  size = "default",
}: BlockButtonProps) => {
  const [blocked, setBlocked] = useState(isBlocked);
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    setLoading(true);
    const success = await blockUser(userId);
    if (success) {
      setBlocked(true);
      onBlockChange?.(true);
    }
    setLoading(false);
  };

  const handleUnblock = async () => {
    setLoading(true);
    const success = await unblockUser(userId);
    if (success) {
      setBlocked(false);
      onBlockChange?.(false);
    }
    setLoading(false);
  };

  if (blocked) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size={size} disabled={loading}>
            <ShieldOff className="mr-2 h-4 w-4" />
            Unblock
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock {userName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will allow {userName} to see your profile and send you messages again.
              You'll also be able to see their profile in your matches.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnblock} disabled={loading}>
              Unblock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} disabled={loading}>
          <Ban className="mr-2 h-4 w-4" />
          Block User
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block {userName}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Blocking {userName} will:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Remove them from your matches</li>
              <li>Prevent them from seeing your profile</li>
              <li>Delete your chat conversation</li>
              <li>Prevent future messages and interactions</li>
            </ul>
            <p className="mt-4 text-destructive">This action cannot be undone easily.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBlock}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            Block User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
