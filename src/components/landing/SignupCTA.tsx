import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SocialShareButtons } from "./SocialShareButtons";

interface SignupCTAProps {
  variant?: "hero" | "final-cta";
  className?: string;
  showShareButtons?: boolean;
}

export const SignupCTA = ({
  variant = "hero",
  className = "",
  showShareButtons = true
}: SignupCTAProps) => {
  const isHeroVariant = variant === "hero";

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          asChild
          size="lg"
          className={`${
            isHeroVariant
              ? "h-14 px-10 text-lg font-semibold bg-accent hover:bg-accent/90 hover:shadow-gold text-accent-foreground rounded-full whitespace-nowrap transition-smooth"
              : "h-16 md:h-20 px-12 md:px-16 text-base md:text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary hover:scale-105 shadow-elegant transition-smooth rounded-full"
          }`}
        >
          <Link to="/auth?mode=signup">Get Started</Link>
        </Button>
        
        {isHeroVariant && (
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-14 px-10 text-lg font-semibold bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-full whitespace-nowrap transition-smooth"
          >
            <Link to="/auth">Sign In</Link>
          </Button>
        )}
      </div>

      {showShareButtons && isHeroVariant && (
        <div className="mt-2">
          <p className="text-center text-sm text-white/50 mb-3">
            Know someone who deserves better dates?
          </p>
          <SocialShareButtons />
        </div>
      )}
    </div>
  );
};

