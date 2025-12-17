import { memo } from "react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/motion";
import { spring } from "@/lib/motion";
import { UserCheck, Heart, Video, Key } from "lucide-react";

export const FeaturesSection = memo(function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32 px-4 bg-[hsl(var(--ink))]">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <h2 className="section-header text-4xl md:text-6xl text-center mb-12 text-white">
            How Verity Actually Works
          </h2>
          <p className="text-center text-xl text-white/60 mb-16 italic">
            Because if 10 minutes can&apos;t sell it, nothing can. Sorry, not sorry.
            </p>
          
          <div className="space-y-12">
            {/* Step 1 */}
              <motion.div
              className="flex gap-6 items-start bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-accent/30 transition-smooth"
              whileHover={{ scale: 1.01, transition: spring.gentle }}
              >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-accent" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl font-black text-accent">1</span>
                  <h3 className="text-2xl font-bold text-white">Real Profiles</h3>
                </div>
                <p className="text-white/80 leading-relaxed">
                  Verified photos, a quick bio, and your 30-second intro video. No AI headshots. No gym mirror selfies from 2018. Just you, raw and ridiculous.
                </p>
              </div>
              </motion.div>

            {/* Step 2 */}
              <motion.div
              className="flex gap-6 items-start bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-accent/30 transition-smooth"
              whileHover={{ scale: 1.01, transition: spring.gentle }}
              >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-accent" fill="currentColor" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl font-black text-accent">2</span>
                  <h3 className="text-2xl font-bold text-white">Mutual Magic</h3>
                </div>
                <p className="text-white/80 leading-relaxed">
                  Browse nearby (100km default, because who drives to Wollongong for a maybe?). Like back? Boom — mutual. No algorithm roulette.
                </p>
              </div>
              </motion.div>

            {/* Step 3 */}
              <motion.div
              className="flex gap-6 items-start bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-accent/30 transition-smooth"
              whileHover={{ scale: 1.01, transition: spring.gentle }}
              >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Video className="w-8 h-8 text-accent" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl font-black text-accent">3</span>
                  <h3 className="text-2xl font-bold text-white">The 10-Minute Truth Serum</h3>
                </div>
                <p className="text-white/80 leading-relaxed">
                  Jump into a video date. Timer ticks, icebreakers prompt ("What&apos;s your worst date story?"), report button ready. Laugh? Eye-roll? You know in 600 seconds.
                </p>
              </div>
              </motion.div>

            {/* Step 4 */}
              <motion.div
              className="flex gap-6 items-start bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-accent/30 transition-smooth"
              whileHover={{ scale: 1.01, transition: spring.gentle }}
              >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Key className="w-8 h-8 text-accent" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl font-black text-accent">4</span>
                  <h3 className="text-2xl font-bold text-white">Unlock or Walk</h3>
                </div>
                <p className="text-white/80 leading-relaxed">
                  Both feel it? Chat opens — plan the real deal. No? Part ways with a "better luck" toast. No grudges. No "one more message" lies.
                </p>
              </div>
              </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
});
