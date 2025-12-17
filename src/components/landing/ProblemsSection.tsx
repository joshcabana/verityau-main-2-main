import { motion } from "framer-motion";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/motion";
import { spring } from "@/lib/motion";

export const ProblemsSection = () => {
  return (
    <section id="brutal-truth" className="py-24 md:py-32 px-4 bg-[hsl(var(--grey-100))]">
      <div className="max-w-6xl mx-auto">
        {/* Headline */}
        <ScrollReveal>
          <h2 className="section-header text-4xl md:text-6xl text-center mb-20 text-white">
            The Brutal Truth
          </h2>
        </ScrollReveal>

        {/* Three Cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
          <StaggerItem>
            <motion.div
              className="bg-white/5 border border-accent/20 rounded-2xl p-8 shadow-elegant hover:border-accent/40 hover:shadow-gold transition-smooth h-full"
              whileHover={{ scale: 1.02, transition: spring.gentle }}
            >
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-2xl font-bold text-white mb-4">The Photoshop Fiasco</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                <span className="text-accent font-semibold">54% lie about looks</span> (Pew). You meet, and it&apos;s like ordering a burger and getting a sad salad.
              </p>
              <p className="text-white/60 text-sm mb-4 italic">
                Your date&apos;s "casual selfie" was taken in 2019, and they&apos;ve aged like milk in the sun.
              </p>
              <p className="text-accent font-semibold text-lg">
                → Verity Fix: Video verification from day one. No filters. No mercy.
              </p>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div
              className="bg-white/5 border border-accent/20 rounded-2xl p-8 shadow-elegant hover:border-accent/40 hover:shadow-gold transition-smooth h-full"
              whileHover={{ scale: 1.02, transition: spring.gentle }}
            >
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-2xl font-bold text-white mb-4">The Texting Black Hole</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                <span className="text-accent font-semibold">72% ghost after weeks of chat</span> (YouGov AU). Momentum dies in "haha" purgatory.
              </p>
              <p className="text-white/60 text-sm mb-4 italic">
                You&apos;re left with a conversation that&apos;s deader than your ex&apos;s excuses.
              </p>
              <p className="text-accent font-semibold text-lg">
                → Verity Fix: No DM foreplay. Straight to a 10-minute date. Bail gracefully if it&apos;s DOA.
              </p>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div
              className="bg-white/5 border border-accent/20 rounded-2xl p-8 shadow-elegant hover:border-accent/40 hover:shadow-gold transition-smooth h-full"
              whileHover={{ scale: 1.02, transition: spring.gentle }}
            >
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-2xl font-bold text-white mb-4">The Wasted Night Special</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                <span className="text-accent font-semibold">68% of first dates flop</span> due to mismatched expectations (Match.com AU).
              </p>
              <p className="text-white/60 text-sm mb-4 italic">
                You Uber across town for an hour of silence and a hug that feels like a parole hearing.
              </p>
              <p className="text-accent font-semibold text-lg">
                → Verity Fix: Ten minutes from your couch tells you everything. No Uber regrets.
              </p>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>

        {/* Footer */}
        <ScrollReveal delay={0.2}>
          <p className="text-center text-sm text-accent/70 italic">
            Stats from the dating apocalypse. Sources in footer. You&apos;re welcome.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
