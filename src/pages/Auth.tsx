import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { authSchema, resetPasswordSchema } from "@/lib/validations";
import { Heart } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { spring, duration, easing } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(() => searchParams.get('mode') !== 'signup');
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { signUp, signIn, signInWithGoogle, signInWithApple, resetPassword, user, loading } = useAuth();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  // Sync isLogin state with URL query parameter
  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsLogin(mode !== 'signup');
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/main");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (isResetPassword) {
      const result = resetPasswordSchema.safeParse({ email });
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        setErrors({ email: fieldErrors.email?.[0] });
        return;
      }
      await resetPassword(email);
      setIsResetPassword(false);
      return;
    }

    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ink))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Form transition variants
  const formVariants = {
    enter: { opacity: 0, x: prefersReducedMotion ? 0 : 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: prefersReducedMotion ? 0 : -20 },
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--ink))] flex items-center justify-center px-4 py-8">
      <FadeIn className="w-full max-w-md">
        <div className="bg-white/5 rounded-2xl shadow-elegant border border-white/10 p-8 backdrop-blur-xl">
          {/* Logo */}
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0.05 } : spring.bouncy}
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="h-8 w-8 text-accent fill-accent" />
              </motion.div>
              <span className="hero-text text-2xl text-white">Verity</span>
            </div>
          </motion.div>

          {/* Title - Animated on mode change */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={isResetPassword ? "reset" : isLogin ? "login" : "signup"}
              className="text-center mb-8"
              variants={formVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: prefersReducedMotion ? 0.05 : duration.normal, ease: easing.easeOut }}
            >
              <h1 className="section-header text-2xl text-white mb-2">
                {isResetPassword ? "Reset Password" : isLogin ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-white/60 text-sm">
                {isResetPassword 
                  ? "Enter your email to receive a reset link" 
                  : isLogin 
                    ? "Sign in to continue to Verity" 
                    : "Join Verity and find real connections"}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-destructive bg-white/10 text-white placeholder:text-white/40" : "bg-white/10 text-white placeholder:text-white/40 border-white/20"}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            {!isResetPassword && (
              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-destructive bg-white/10 text-white placeholder:text-white/40" : "bg-white/10 text-white placeholder:text-white/40 border-white/20"}
                />
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password}</p>
                )}
              </div>
            )}

            {isLogin && !isResetPassword && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsResetPassword(true)}
                  className="text-xs text-accent hover:text-accent/80 hover:underline transition-smooth"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full">
              {isResetPassword ? "Send Reset Link" : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {!isResetPassword && (
            <>
              {/* Divider */}
              <div className="relative my-6">
                <Separator className="bg-white/10" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/5 backdrop-blur-sm px-3 py-1 text-xs text-white/50 rounded-full border border-white/10">
                  or continue with
                </span>
              </div>

              {/* Social Login */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={signInWithGoogle}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={signInWithApple}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Continue with Apple
                </Button>
              </div>
            </>
          )}

          {/* Toggle & Back to Home */}
          <div className="mt-6 text-center space-y-3">
            {isResetPassword ? (
              <button
                type="button"
                onClick={() => setIsResetPassword(false)}
                className="text-sm text-white/60 hover:text-white transition-smooth"
              >
                Back to {isLogin ? "sign in" : "sign up"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-white/60 hover:text-white transition-smooth"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="text-accent hover:text-accent/80 hover:underline font-semibold">
                  {isLogin ? "Sign up" : "Sign in"}
                </span>
              </button>
            )}

            <div>
              <Button asChild variant="ghost" size="sm" className="text-white/60 hover:text-accent">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Terms */}
        <motion.p 
          className="text-center text-xs text-white/50 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: duration.normal }}
        >
          By continuing, you agree to Verity's{" "}
          <Link to="/terms" className="text-accent underline hover:text-accent/80 transition-smooth">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-accent underline hover:text-accent/80 transition-smooth">
            Privacy Policy
          </Link>
        </motion.p>
      </FadeIn>
    </div>
  );
};

export default Auth;
