import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageLayoutProps {
  children: ReactNode;
  customTitle?: string;
  customSubtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonTo?: string;
  className?: string;
  contentMaxWidth?: "max-w-4xl" | "max-w-5xl" | "max-w-6xl" | "max-w-7xl";
  contentPadding?: "py-20 sm:py-24 md:py-32" | "py-32 md:py-40" | "py-40 md:py-48";
}

/**
 * Standardized page layout component for consistent design across all pages
 */
export function PageLayout({
  children,
  customTitle,
  customSubtitle,
  showBackButton = true,
  backButtonText = "Back to Home",
  backButtonTo = "/",
  className = "",
  contentMaxWidth = "max-w-5xl",
  contentPadding = "py-32 md:py-40",
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-[hsl(var(--ink))] ${className}`}>
      <Navigation
        customTitle={customTitle}
        customSubtitle={customSubtitle}
      />

      <div className={`${contentMaxWidth} mx-auto px-4 sm:px-6 lg:px-8 ${contentPadding}`}>
        {showBackButton && !customTitle && (
          <Link to={backButtonTo}>
            <Button
              variant="ghost"
              size="sm"
              className="mb-8 -ml-2 text-white hover:text-accent hover:bg-white/5 transition-smooth group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {backButtonText}
            </Button>
          </Link>
        )}

        {children}
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 bg-[hsl(var(--ink))]">
        <div className={`${contentMaxWidth} mx-auto flex items-center justify-between text-sm text-white/40`}>
          <Link to="/" className="hover:text-accent transition-colors">
            ← Back to home
          </Link>
          <span>Verity © 2025</span>
        </div>
      </footer>
    </div>
  );
}
