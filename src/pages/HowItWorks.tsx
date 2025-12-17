import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Video, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/motion";
import { motion } from "framer-motion";
import { spring } from "@/lib/motion";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-[hsl(var(--ink))]">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-20 sm:py-24 md:py-32">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-8 -ml-2 text-white hover:text-accent hover:bg-white/5 transition-smooth">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="relative">
          {/* Headline */}
          <ScrollReveal>
            <h1 className="section-header text-4xl md:text-[64px] text-center mb-32 text-white">
              One conversation changes everything.
            </h1>
          </ScrollReveal>

          {/* Steps */}
          <div className="space-y-24 md:space-y-32">
            {/* Step 1 */}
            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="order-2 md:order-1">
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center"
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(212, 175, 55, 0.2)" }}
                      transition={spring.gentle}
                    >
                      <Heart className="w-6 h-6 text-accent" fill="currentColor" />
                    </motion.div>
                    <span className="text-6xl md:text-7xl font-black text-accent">1</span>
                  </div>
                  <h3 className="section-header text-3xl md:text-4xl mb-4 text-white">
                    Show up as yourself
                  </h3>
                  <p className="body-large text-white/70">
                    Upload a few photos. Record a short intro video. Every profile is verified—what you see is who you'll meet.
                  </p>
                </div>
                <div className="order-1 md:order-2">
                  <motion.div
                    className="w-full max-w-[320px] mx-auto"
                    whileHover={{ scale: 1.02 }}
                    transition={spring.gentle}
                  >
                    <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/20 backdrop-blur-sm p-8 flex items-center justify-center">
                      <Heart className="w-24 h-24 text-accent" strokeWidth={1.5} fill="currentColor" />
                      <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.15),transparent_70%)]" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </ScrollReveal>

            {/* Step 2 */}
            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                <div className="order-1">
                  <motion.div
                    className="w-full max-w-[320px] mx-auto"
                    whileHover={{ scale: 1.02 }}
                    transition={spring.gentle}
                  >
                    <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/20 backdrop-blur-sm p-8 flex items-center justify-center">
                      <Video className="w-24 h-24 text-accent" strokeWidth={1.5} />
                      <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.15),transparent_70%)]" />
                    </div>
                  </motion.div>
                </div>
                <div className="order-2">
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center"
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(212, 175, 55, 0.2)" }}
                      transition={spring.gentle}
                    >
                      <Video className="w-6 h-6 text-accent" />
                    </motion.div>
                    <span className="text-6xl md:text-7xl font-black text-accent">2</span>
                  </div>
                  <h3 className="section-header text-3xl md:text-4xl mb-4 text-white">
                    Ten minutes, face to face
                  </h3>
                  <p className="body-large text-white/70">
                    A video date with a timer. Real expressions. Real voice. Real chemistry—or not.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Step 3 */}
            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                <div className="order-2 md:order-1">
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center"
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(212, 175, 55, 0.2)" }}
                      transition={spring.gentle}
                    >
                      <CheckCircle2 className="w-6 h-6 text-accent" />
                    </motion.div>
                    <span className="text-6xl md:text-7xl font-black text-accent">3</span>
                  </div>
                  <h3 className="section-header text-3xl md:text-4xl mb-4 text-white">
                    Decide together.
                  </h3>
                  <p className="body-large text-white/70">
                    If you both feel it, chat unlocks. Plan a proper date. Meet in person.
                    <br />
                    <span className="text-white/50 text-base">No spark? A clean, honest ending—no ghosting required.</span>
                  </p>
                </div>
                <div className="order-1 md:order-2">
                  <motion.div
                    className="w-full max-w-[320px] mx-auto"
                    whileHover={{ scale: 1.02 }}
                    transition={spring.gentle}
                  >
                    <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/20 backdrop-blur-sm p-8 flex items-center justify-center">
                      <MessageCircle className="w-24 h-24 text-accent" strokeWidth={1.5} />
                      <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.15),transparent_70%)]" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 bg-[hsl(var(--ink))]">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-white/40">
          <Link to="/" className="hover:text-accent transition-colors">
            ← Back to home
          </Link>
          <span>Verity © 2025</span>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorks;
