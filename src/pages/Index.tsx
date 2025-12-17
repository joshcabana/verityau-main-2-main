import { Suspense, lazy } from "react";
import Navigation from "@/components/Navigation";

// Import critical above-the-fold components immediately
import { HeroSection } from "@/components/landing";
import { SectionErrorBoundary } from "@/components/landing/ErrorBoundary";

// Lazy load below-the-fold sections for better performance
const ProblemsSection = lazy(() => import("@/components/landing/ProblemsSection").then(module => ({ default: module.ProblemsSection })));
const FeaturesSection = lazy(() => import("@/components/landing/FeaturesSection").then(module => ({ default: module.FeaturesSection })));
const TrustSection = lazy(() => import("@/components/landing/TrustSection").then(module => ({ default: module.TrustSection })));
const FinalCTASection = lazy(() => import("@/components/landing/FinalCTASection").then(module => ({ default: module.FinalCTASection })));
const Footer = lazy(() => import("@/components/landing/Footer").then(module => ({ default: module.Footer })));

// Loading component for lazy-loaded sections
function SectionLoader() {
  return (
    <div className="py-24 px-4 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen bg-[hsl(var(--ink))]">
      <Navigation />

      {/* Hero Section - Above the fold */}
      <HeroSection />

      {/* Lazy-loaded sections below the fold */}
      <Suspense fallback={<SectionLoader />}>
        <SectionErrorBoundary>
          <ProblemsSection />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          <FeaturesSection />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          <TrustSection />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          <FinalCTASection />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          <Footer />
        </SectionErrorBoundary>
      </Suspense>
    </div>
  );
};

export default Index;
