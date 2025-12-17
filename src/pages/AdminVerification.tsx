import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, CheckCircle, XCircle, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { logAdminAction } from "@/utils/adminAuditLog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PendingProfile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  photos: string[];
  verification_video_url: string | null;
  created_at: string;
}

export default function AdminVerification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<PendingProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<PendingProfile | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkAdminAndLoadProfiles();
  }, [user]);

  const checkAdminAndLoadProfiles = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      // Check if user has admin role using secure function
      const { data: hasAdminRole, error: roleError } = await supabase
        .rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

      if (roleError || !hasAdminRole) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/main");
        return;
      }

      setIsAdmin(true);

      // Load unverified profiles with verification videos
      const { data: pendingProfiles, error } = await supabase
        .from("profiles")
        .select("id, user_id, name, age, photos, verification_video_url, created_at")
        .eq("verified", false)
        .not("verification_video_url", "is", null)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setProfiles(pendingProfiles || []);
    } catch (error) {
      console.error("Error loading profiles:", error);
      toast.error("Failed to load pending verifications");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (profile: PendingProfile, action: "approve" | "reject") => {
    setSelectedProfile(profile);
    setReviewAction(action);
    setRejectionReason("");
  };

  const confirmReview = async () => {
    if (!selectedProfile || !reviewAction || !user) return;

    setProcessing(true);

    try {
      // Get reviewer's profile ID
      const { data: reviewerProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!reviewerProfile) throw new Error("Reviewer profile not found");

      // Call the database function to update verification status
      const { error } = await supabase.rpc("update_verification_status", {
        p_profile_id: selectedProfile.id,
        p_reviewer_id: reviewerProfile.id,
        p_status: reviewAction === "approve" ? "approved" : "rejected",
        p_reason: reviewAction === "reject" ? rejectionReason : null,
      });

      if (error) throw error;

      // Log admin action
      await logAdminAction({
        action: reviewAction === "approve" ? "approve_verification" : "reject_verification",
        targetType: "profile",
        targetId: selectedProfile.id,
        details: {
          profile_name: selectedProfile.name,
          reason: reviewAction === "reject" ? rejectionReason : undefined,
        },
      });

      toast.success(
        reviewAction === "approve"
          ? `${selectedProfile.name} has been verified!`
          : `Verification rejected for ${selectedProfile.name}`
      );

      // Remove from list
      setProfiles(profiles.filter((p) => p.id !== selectedProfile.id));
      setSelectedProfile(null);
      setReviewAction(null);
    } catch (error) {
      console.error("Error reviewing profile:", error);
      toast.error("Failed to process review");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/main")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">Admin Verification</h1>
            </div>
          </div>
          <Badge variant="secondary">
            {profiles.length} Pending
          </Badge>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {profiles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">All Caught Up!</h2>
              <p className="text-muted-foreground">
                No pending verifications at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {profiles.map((profile) => (
              <Card key={profile.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={profile.photos?.[0]} alt={profile.name} />
                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                          {profile.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{profile.name}, {profile.age}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Submitted {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Verification Video */}
                  {profile.verification_video_url && (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        src={profile.verification_video_url}
                        controls
                        className="w-full h-full"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleReview(profile, "approve")}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={processing}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReview(profile, "reject")}
                      variant="destructive"
                      className="flex-1"
                      disabled={processing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Review Confirmation Dialog */}
      <AlertDialog
        open={!!selectedProfile && !!reviewAction}
        onOpenChange={() => {
          setSelectedProfile(null);
          setReviewAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reviewAction === "approve" ? "Approve Verification?" : "Reject Verification?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {reviewAction === "approve" ? (
                <p>
                  This will verify <strong>{selectedProfile?.name}</strong> and they'll receive a
                  verification badge on their profile.
                </p>
              ) : (
                <div className="space-y-3">
                  <p>
                    Please provide a reason for rejecting <strong>{selectedProfile?.name}</strong>'s
                    verification:
                  </p>
                  <Textarea
                    placeholder="e.g., Video quality is too low, face not clearly visible, etc."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReview}
              disabled={processing || (reviewAction === "reject" && !rejectionReason.trim())}
              className={reviewAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : reviewAction === "approve" ? (
                "Approve"
              ) : (
                "Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
