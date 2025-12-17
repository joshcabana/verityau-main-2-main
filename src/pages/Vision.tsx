import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/motion";

const Vision = () => {
  return (
    <div className="min-h-screen bg-[hsl(var(--ink))]">
      <Navigation
        customTitle="The Verity Vision"
        customSubtitle="Building the future of authentic dating"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Hero */}
      <section className="py-32 md:py-40 relative overflow-hidden">
        {/* Gold vignette overlay */}
        <div className="absolute inset-0 hero-gold-vignette pointer-events-none" />
        {/* Film grain texture */}
        <div className="absolute inset-0 film-grain pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="space-y-8">
              <div className="max-w-5xl">
                <h1 className="hero-text text-5xl md:text-7xl lg:text-8xl text-white leading-[0.95] font-light mb-8">
                  Modern Dating:{" "}
                  <span className="text-accent font-medium">
                    A Circus of Lies
                  </span>
                  {" "}and Loneliness
            </h1>
                <p className="text-2xl md:text-3xl text-white/80 leading-relaxed font-light italic">
                  They tricked us into thinking love was a casino.
                </p>
        </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* The Problem: Three Acts of Modern Dating Horror */}
      <section className="py-32 md:py-40 bg-[hsl(var(--grey-100))] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-20">
          <ScrollReveal>
            <div className="space-y-8">
                <h3 className="text-3xl md:text-4xl font-light text-white mb-6">
                  Swipe right on delusion. Filter out reality. Pose like you're in a rom-com.
                </h3>
                <p className="text-xl md:text-2xl text-white/70 leading-relaxed">
                  You spend hours curating your "best self," they Photoshop theirs, and when you finally meet? It's like ordering a steak and getting a sad tofu patty. Surprise! The vibe's as dead as your last Tinder match.
                </p>
                <p className="text-xl md:text-2xl text-accent font-medium">
                  → On Verity, we skip the bullshit audition. You see the unfiltered mess from second one.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="space-y-8">
                <h3 className="text-3xl md:text-4xl font-light text-white mb-6">
                  They turned flirting into a bad improv sketch.
                </h3>
                <p className="text-xl md:text-2xl text-white/70 leading-relaxed">
                  Weeks of "haha" hell, where "wyd?" echoes in the abyss like a drunk uncle at a wedding. Momentum? More like a slow-motion car crash into "kthxbye."
                </p>
                <p className="text-xl md:text-2xl text-accent font-medium">
                  → On Verity, we don't do foreplay with keyboards. The date crashes the party first — ten minutes of "is this it?" or "holy shit, yes."
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <div className="space-y-8">
                <h3 className="text-3xl md:text-4xl font-light text-white mb-6">
                  They convinced us to bet entire nights on a gamble.
                </h3>
                <p className="text-xl md:text-2xl text-white/70 leading-relaxed">
                  You trek across town, traffic-fueled rage bubbling, only to sit in silence staring at someone who smells like regret and last night's takeout. Awkward hug, Uber home, and another therapy session booked.
                </p>
                <p className="text-xl md:text-2xl text-accent font-medium">
                  → On Verity, ten minutes from your couch (or bed, no judgment) outs the fakers faster than a bad first kiss. Waste-free wonder.
                </p>
              </div>
            </ScrollReveal>
            </div>
        </div>
      </section>

      {/* How It Works: The Verity Way */}
      <section className="py-32 md:py-40 bg-[hsl(var(--ink))]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center space-y-16">
              <div className="space-y-8">
                <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  Match.
            </h2>
                <p className="text-xl md:text-2xl text-white/70 leading-relaxed max-w-3xl mx-auto">
                  Ten-minute video date.
                </p>
              </div>

              <div className="max-w-4xl mx-auto space-y-8 text-left">
                <p className="text-xl md:text-2xl text-white/80 leading-relaxed">
                  Hear the snort-laugh you can't emoji. Spot the eye-roll at bad jokes. Feel the <span className="text-accent font-medium">"oh fuck, this could be it"</span> or the merciful <span className="text-white/60 italic">"next."</span>
                </p>
                <p className="text-xl md:text-2xl text-white/80 leading-relaxed">
                  If it's electric, chat unlocks. If it's a dud, dip out like civilized adults — <span className="text-accent">no ghosts, no grudges, no gaslighting yourself into a second chance.</span>
                </p>
              </div>

              <div className="pt-8 border-t border-white/10 mt-16">
                <p className="text-2xl md:text-3xl text-white font-medium mb-4">
                  Verity isn't an app.
                </p>
                <p className="text-xl md:text-2xl text-accent font-medium italic">
                  It's the middle finger to the dating industrial complex.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 pt-12">
                <div className="text-center p-8 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-xl text-white font-medium">Raw faces.</p>
                </div>
                <div className="text-center p-8 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-xl text-white font-medium">Awkward pauses.</p>
                </div>
                <div className="text-center p-8 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-xl text-white font-medium">Electric silences.</p>
                </div>
              </div>

              <p className="text-2xl md:text-3xl text-white/90 font-light pt-8">
                That's the Verity chaos — <span className="text-accent font-medium">and we're all in.</span>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* The Data: Why We Built This */}
      <section className="py-32 md:py-40 bg-[hsl(var(--grey-100))] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-lg font-medium text-accent uppercase tracking-wider mb-12">
                The Numbers Don't Lie
            </h2>
              <div className="max-w-4xl mx-auto space-y-8">
                <p className="text-2xl md:text-3xl text-white/90 leading-relaxed font-light">
                  At Verity, we believe dating shouldn't feel like a game of chance or a performance art. In a world where <span className="text-accent font-medium">54% of users lie</span> about their appearance or lifestyle (Pew Research, 2025), and <span className="text-accent font-medium">72% experience ghosting</span> after investing weeks in texting (YouGov AU Survey), the system is broken.
                </p>
                <p className="text-2xl md:text-3xl text-white/80 leading-relaxed font-light">
                  In 2025, dating apps are a <span className="text-accent font-medium">$10B industry</span>, but retention is abysmal (under 20% after Week 1). Users crave truth, but the market delivers illusion.
                </p>
                <p className="text-2xl md:text-3xl text-white/80 leading-relaxed font-light">
                  Verity changes that — by making video the entry point, we cut the noise and amplify the genuine. Our users say it best: <span className="text-white font-medium italic">"Finally, dating feels like dating again."</span>
                </p>
              </div>

              {/* Impact Stats */}
              <div className="grid md:grid-cols-3 gap-8 mt-20">
                <div className="text-center p-8 bg-white/5 border border-accent/20 rounded-2xl">
                  <div className="text-4xl md:text-5xl font-bold text-accent mb-2">78%</div>
                  <p className="text-white/70 font-light">Less ghosting</p>
                </div>
                <div className="text-center p-8 bg-white/5 border border-accent/20 rounded-2xl">
                  <div className="text-4xl md:text-5xl font-bold text-accent mb-2">3x</div>
                  <p className="text-white/70 font-light">More real meetups</p>
                </div>
                <div className="text-center p-8 bg-white/5 border border-accent/20 rounded-2xl">
                  <div className="text-4xl md:text-5xl font-bold text-accent mb-2">92%</div>
                  <p className="text-white/70 font-light">Higher trust scores</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Join the Rebellion */}
      <section className="py-32 md:py-40 bg-[hsl(var(--ink))]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl font-medium text-white mb-8">
                Ready to ditch the circus?
              </h2>
              <p className="text-xl md:text-2xl text-white/70 mb-16 max-w-3xl mx-auto">
                Join thousands who are done playing games and ready for something real.
              </p>
              
              <div className="max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-16 px-12 text-lg bg-accent hover:bg-accent/90 text-accent-foreground rounded-full shadow-gold hover:shadow-elegant transition-all"
                  >
                    <Link to="/auth?mode=signup">Start Dating for Real</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-16 px-12 text-lg border-white/20 text-white hover:bg-white/5 hover:border-accent/40 rounded-full transition-all"
                  >
                    <Link to="/faq">See How It Works</Link>
                  </Button>
              </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Closing */}
      <section className="py-40 md:py-48 bg-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--gold))] via-[hsl(var(--gold-light))] to-[hsl(var(--gold))]" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <div className="space-y-12">
              <div className="space-y-8">
                <p className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight text-[hsl(var(--ink))]">
                  No more games.
                  <br />
                  No more ghosts.
                  <br />
                  Just <span className="italic">you</span>, being real.
                </p>
              </div>
              <div className="space-y-8 pt-8">
                <p className="text-2xl md:text-3xl text-[hsl(var(--ink))]/80 font-light">
                  Welcome to Verity. Where dating stops being a circus.
            </p>
            <Button
              asChild
              size="lg"
                  className="h-20 px-16 text-2xl font-bold bg-[hsl(var(--ink))] hover:bg-[hsl(var(--ink))]/90 text-white hover:scale-105 shadow-elegant transition-smooth rounded-full border-none"
            >
                  <Link to="/auth?mode=signup">Join the Revolution</Link>
            </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[hsl(var(--ink))]">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-white/40">
          <Link to="/" className="hover:text-accent transition-colors">
            ← Back to home
          </Link>
          <span>Verity © 2025</span>
        </div>
      </footer>
    </div>
    </div>
  );
};

export default Vision;
