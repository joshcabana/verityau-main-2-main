import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/motion";
import * as Sentry from "@sentry/react";

// Critical path pages - loaded immediately
import Index from "./pages/Index";
import Auth from "./pages/Auth";

// Lazy load all other pages for better initial bundle size
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Main = lazy(() => import("./pages/Main"));
const IntroCall = lazy(() => import("./pages/IntroCall"));
const ExtendedCall = lazy(() => import("./pages/ExtendedCall"));
const MatchSuccess = lazy(() => import("./pages/MatchSuccess"));
const Matches = lazy(() => import("./pages/Matches"));
const MatchProfile = lazy(() => import("./pages/MatchProfile"));
const WhoLikedYou = lazy(() => import("./pages/WhoLikedYou"));
const VerityPlus = lazy(() => import("./pages/VerityPlus"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Safety = lazy(() => import("./pages/Safety"));
const Vision = lazy(() => import("./pages/Vision"));
const FAQ = lazy(() => import("./pages/FAQ"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const Profile = lazy(() => import("./pages/Profile"));
const VerityDateWaiting = lazy(() => import("./pages/VerityDateWaiting"));
const VerityDateCall = lazy(() => import("./pages/VerityDateCall"));
const VerityDateFeedback = lazy(() => import("./pages/VerityDateFeedback"));
const AdminVerification = lazy(() => import("./pages/AdminVerification"));
const Admin = lazy(() => import("./pages/Admin"));
const Chat = lazy(() => import("./pages/Chat"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      refetchOnReconnect: true, // Refetch on network reconnect
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && 'status' in error && typeof error.status === 'number') {
          if (error.status >= 400 && error.status < 500) {
            return false;
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: 1, // Only retry mutations once
      onError: (error) => {
        // Global error handling for mutations
        console.error('Mutation error:', error);
      },
    },
  },
});

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Animated routes wrapper component
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/verify-email" element={<ProtectedRoute><PageTransition><VerifyEmail /></PageTransition></ProtectedRoute>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          <Route path="/safety" element={<PageTransition><Safety /></PageTransition>} />
          <Route path="/vision" element={<PageTransition><Vision /></PageTransition>} />
          <Route path="/how-it-works" element={<PageTransition><HowItWorks /></PageTransition>} />
          <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
          
          {/* Protected Routes */}
          <Route path="/onboarding" element={<ProtectedRoute><PageTransition><Onboarding /></PageTransition></ProtectedRoute>} />
          <Route path="/main" element={<ProtectedRoute><PageTransition><Main /></PageTransition></ProtectedRoute>} />
          <Route path="/intro-call" element={<ProtectedRoute><PageTransition><IntroCall /></PageTransition></ProtectedRoute>} />
          <Route path="/extended-call" element={<ProtectedRoute><PageTransition><ExtendedCall /></PageTransition></ProtectedRoute>} />
          <Route path="/match-success" element={<ProtectedRoute><PageTransition><MatchSuccess /></PageTransition></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><PageTransition><Matches /></PageTransition></ProtectedRoute>} />
          <Route path="/match/:matchId" element={<ProtectedRoute><PageTransition><MatchProfile /></PageTransition></ProtectedRoute>} />
          <Route path="/chat/:id" element={<ProtectedRoute><PageTransition><Chat /></PageTransition></ProtectedRoute>} />
          <Route path="/who-liked-you" element={<ProtectedRoute><PageTransition><WhoLikedYou /></PageTransition></ProtectedRoute>} />
          <Route path="/upgrade" element={<ProtectedRoute><PageTransition><VerityPlus /></PageTransition></ProtectedRoute>} />
          <Route path="/verity-plus" element={<ProtectedRoute><PageTransition><VerityPlus /></PageTransition></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><PageTransition><Checkout /></PageTransition></ProtectedRoute>} />
          <Route path="/verity-date/waiting" element={<ProtectedRoute><PageTransition><VerityDateWaiting /></PageTransition></ProtectedRoute>} />
          <Route path="/verity-date/call" element={<ProtectedRoute><PageTransition><VerityDateCall /></PageTransition></ProtectedRoute>} />
          <Route path="/verity-date/feedback" element={<ProtectedRoute><PageTransition><VerityDateFeedback /></PageTransition></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><PageTransition><ProfileEdit /></PageTransition></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/verification" element={<ProtectedRoute><PageTransition><AdminVerification /></PageTransition></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><PageTransition><Admin /></PageTransition></ProtectedRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

// Fallback component for Sentry error boundary
function SentryFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-4">We encountered an unexpected error.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

const App = () => (
  <Sentry.ErrorBoundary fallback={<SentryFallback />} showDialog>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <AnimatedRoutes />
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </Sentry.ErrorBoundary>
);

export default App;
