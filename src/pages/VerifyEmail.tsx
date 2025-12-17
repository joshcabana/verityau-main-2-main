import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VerifyEmail = () => {
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user's email
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      
      // If already verified, redirect
      if (user.email_confirmed_at) {
        navigate("/onboarding");
        return;
      }
      
      setEmail(user.email || null);
    });

    // Check for email confirmation in real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "USER_UPDATED" && session?.user?.email_confirmed_at) {
          toast.success("Email verified! Redirecting...");
          setTimeout(() => navigate("/onboarding"), 1000);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (!email || cooldown > 0) return;

    setIsResending(true);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Verification email sent! Check your inbox.");
      setCooldown(60); // 60 second cooldown
    }

    setIsResending(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center px-4 py-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Mail className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">Check your inbox</p>
                <p className="text-muted-foreground">
                  Click the verification link we sent to {email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">Can't find it?</p>
                <p className="text-muted-foreground">
                  Check your spam folder or request a new link below
                </p>
              </div>
            </div>
          </div>

          {/* Resend button */}
          <div className="space-y-2">
            <Button
              onClick={handleResendEmail}
              disabled={isResending || cooldown > 0}
              className="w-full"
              variant="outline"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                "Resend verification email"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              This page will auto-refresh when you verify your email
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Wrong email? */}
          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              Wrong email address?
            </p>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full"
            >
              Sign out and try again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
