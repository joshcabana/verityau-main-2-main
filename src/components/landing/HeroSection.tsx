import { AppleFadeIn, AppleStagger, AppleStaggerItem, AppleButton } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient-base">
      {/* Gold vignette overlay */}
      <div className="absolute inset-0 hero-gold-vignette" />

      {/* Film grain texture */}
      <div className="absolute inset-0 film-grain pointer-events-none" />

      {/* Content box */}
      <AppleStagger className="relative z-10 max-w-5xl mx-auto text-center px-6 py-20" staggerDelay={0.2}>
        {/* Headline */}
        <AppleStaggerItem>
          <AppleFadeIn>
            <h1 className="hero-text text-6xl md:text-8xl lg:text-9xl mb-8 text-white leading-[0.95]">
              Dating Apps Are a{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--gold-light))] to-[hsl(var(--gold))] bg-clip-text text-transparent">
                Circus of Lies
              </span>
              <br />
              <span className="text-white/90">Verity Is the Exit Door.</span>
            </h1>
          </AppleFadeIn>
        </AppleStaggerItem>

        {/* Subtext */}
        <AppleStaggerItem>
          <AppleFadeIn delay={0.1}>
            <div className="max-w-4xl mx-auto space-y-6 mb-12">
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-light">
                <span className="text-accent font-medium">54% of profiles are basically fan fiction</span> (Pew Research, 2025). You swipe for hours, match with a catfish, and spend weeks texting someone who ghosts faster than your New Year's resolutions.
              </p>
              <p className="text-lg md:text-xl text-white/70 italic">
                On Verity, we skip the clown show: Verified faces, a 30-second intro video, and a 10-minute date that outs the fakers before you waste a single emoji.
              </p>
            </div>
          </AppleFadeIn>
        </AppleStaggerItem>

        {/* CTA Buttons */}
        <AppleStaggerItem>
          <AppleFadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <AppleButton variant="primary" className="h-16 px-12 text-xl font-bold">
              <Link to="/auth?mode=signup">Skip the Swipe Trap</Link>
            </AppleButton>
            <AppleButton variant="secondary" className="h-16 px-12 text-xl font-bold">
              <a href="#brutal-truth">See the Receipts</a>
            </AppleButton>
          </div>
        </AppleFadeIn>
        </AppleStaggerItem>

        {/* Tagline */}
        <AppleStaggerItem>
          <AppleFadeIn delay={0.3}>
            <p className="text-sm text-white/50 mt-4 italic">
              Because life's too short for "haha wyd?" — and even shorter for bad dates.
            </p>
          </AppleFadeIn>
        </AppleStaggerItem>
      </AppleStagger>
    </section>
  );
};
