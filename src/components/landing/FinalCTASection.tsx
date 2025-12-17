import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/motion";

export const FinalCTASection = () => {
  return (
    <section className="relative py-24 md:py-40 px-4 bg-accent overflow-hidden">
      <ScrollReveal className="relative max-w-5xl mx-auto text-center z-10">
        {/* Headline */}
        <h2 className="hero-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[hsl(var(--ink))] mb-6">
          Ignite Your Chaos
        </h2>
        
        {/* Subheading */}
        <p className="text-xl md:text-2xl text-[hsl(var(--ink))]/80 mb-12 font-light">
          Lifetime unlimited for the first 2,000. Ditch the circus. Join the real show.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            asChild
            size="lg"
            className="h-16 md:h-20 px-12 md:px-16 text-base md:text-xl font-bold bg-[hsl(var(--ink))] hover:bg-[hsl(var(--ink))]/90 text-white hover:scale-105 shadow-elegant transition-smooth rounded-full"
          >
            <Link to="/auth?mode=signup">Grab Your Spot</Link>
          </Button>
        </div>

        {/* Footer Nudge */}
        <p className="text-sm text-[hsl(var(--ink))]/70 italic">
          © 2025 Verity. Canberra&apos;s middle finger to mediocre matches.
        </p>
      </ScrollReveal>
    </section>
  );
};
