import { memo } from "react";
import { ScrollReveal } from "@/components/motion";
import { motion } from "framer-motion";
import { spring } from "@/lib/motion";

export const TrustSection = memo(function TrustSection() {
  return (
    <section id="trust" className="py-24 md:py-32 px-4 bg-[hsl(var(--grey-100))]">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="section-header text-4xl md:text-6xl text-center mb-20 text-white">
            Why It Works
            </h2>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <motion.div
              className="bg-white/5 border border-accent/20 rounded-2xl p-8 text-center hover:border-accent/40 transition-smooth"
              whileHover={{ scale: 1.02, transition: spring.gentle }}
            >
              <div className="text-5xl md:text-6xl font-black text-accent mb-3">78%</div>
              <h3 className="text-xl font-semibold text-white mb-2">Less Ghosting</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Because you can&apos;t ghost someone you just laughed with on camera.
              </p>
              <p className="text-accent text-sm font-medium italic">Ghosts hate spotlights.</p>
            </motion.div>

            <motion.div
              className="bg-white/5 border border-accent/20 rounded-2xl p-8 text-center hover:border-accent/40 transition-smooth"
              whileHover={{ scale: 1.02, transition: spring.gentle }}
            >
              <div className="text-5xl md:text-6xl font-black text-accent mb-3">92%</div>
              <h3 className="text-xl font-semibold text-white mb-2">Feel Safer</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Video verification + easy reports = trust boost. Women lead the charge.
              </p>
              <p className="text-accent text-sm font-medium italic">No more &quot;seemed nice online&quot; horror stories.</p>
            </motion.div>

            <motion.div
              className="bg-white/5 border border-accent/20 rounded-2xl p-8 text-center hover:border-accent/40 transition-smooth"
              whileHover={{ scale: 1.02, transition: spring.gentle }}
            >
              <div className="text-5xl md:text-6xl font-black text-accent mb-3">3x</div>
              <h3 className="text-xl font-semibold text-white mb-2">More Real Dates</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                From couch call to coffee meetup in under 24 hours. No text limbo.
              </p>
              <p className="text-accent text-sm font-medium italic">Efficiency: The sexiest kink.</p>
            </motion.div>

            <motion.div
              className="bg-white/5 border border-accent/20 rounded-2xl p-8 text-center hover:border-accent/40 transition-smooth"
              whileHover={{ scale: 1.02, transition: spring.gentle }}
            >
              <div className="text-5xl md:text-6xl font-black text-accent mb-3">347</div>
              <h3 className="text-xl font-semibold text-white mb-2">Sparks Ignited</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Relationships formed — from flings to forever.
              </p>
              <p className="text-accent text-sm font-medium italic">We&apos;re not bragging. Okay, we are.</p>
            </motion.div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-sm text-white/40 italic mt-8">
            Beta stats, Nov 2025. Real results may vary — but they&apos;re better than swiping into oblivion.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
});

