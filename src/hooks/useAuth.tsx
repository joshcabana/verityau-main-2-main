import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { setSentryUser } from "@/lib/sentry";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Update Sentry user context
        if (session?.user) {
          setSentryUser({
            id: session.user.id,
            email: session.user.email,
          });
        } else {
          setSentryUser(null);
        }
        
        // Handle auth events
        if (event === "SIGNED_IN") {
          toast.success("Successfully signed in!");
        } else if (event === "SIGNED_OUT") {
          toast.success("Successfully signed out");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Update Sentry user context for existing session
      if (session?.user) {
        setSentryUser({
          id: session.user.id,
          email: session.user.email,
        });
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/onboarding`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    // Check if email confirmation is required
    if (data.user && !data.user.email_confirmed_at) {
      toast.success("Account created! Please verify your email.");
      setTimeout(() => navigate("/verify-email"), 500);
      return { data, error: null };
    }

    toast.success("Account created! Redirecting to onboarding...");
    setTimeout(() => navigate("/onboarding"), 500);
    return { data, error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    // Check if email is verified
    if (!data.user.email_confirmed_at) {
      toast.error("Please verify your email before signing in.");
      navigate("/verify-email");
      return { data, error: null };
    }

    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", data.user.id)
      .single();

    if (!profile) {
      navigate("/onboarding");
    } else {
      navigate("/main");
    }

    return { data, error: null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error(error.message);
      return;
    }

    navigate("/");
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    toast.success("Password reset email sent! Check your inbox.");
    return { error: null };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut,
    resetPassword,
  };
};
