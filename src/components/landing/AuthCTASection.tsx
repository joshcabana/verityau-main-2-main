import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/motion";

export const AuthCTASection = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-[hsl(var(--grey-100))] to-black">
      <ScrollReveal className="max-w-4xl mx-auto text-center">
        <h2 className="section-header text-4xl md:text-5xl mb-6 text-white">
          Already have an account?
        </h2>
        <p className="body-large text-white/70 mb-8">
          Sign in to continue where you left off.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg" className="text-lg px-8 bg-accent hover:bg-accent/90 hover:shadow-gold text-accent-foreground transition-smooth rounded-full">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </ScrollReveal>
    </section>
  );
};
