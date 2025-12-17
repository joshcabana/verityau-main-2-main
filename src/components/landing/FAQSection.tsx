import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/motion";

export const FAQSection = () => {
  return (
    <section id="faq" className="py-24 px-4 bg-[hsl(var(--ink))] relative">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className="section-header text-4xl md:text-[64px] text-center mb-16 text-white">
            Questions? Here&apos;s clarity.
          </h2>
          <StaggerContainer className="space-y-6" staggerDelay="fast">
            <StaggerItem>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h4 className="text-xl font-semibold text-white mb-3">
                  How does Verity work?
                </h4>
                <p className="text-white/70 leading-relaxed">
                  Match with someone. Have a ten-minute video date. If you both say yes, chat unlocks. No endless messaging. Just real momentum toward meeting in person.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h4 className="text-xl font-semibold text-white mb-3">
                  What makes Verity different from other dating apps?
                </h4>
                <p className="text-white/70 leading-relaxed">
                  Other apps optimise for time spent scrolling. Verity optimises for time spent connecting. One video date tells you more than a hundred messages ever could.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h4 className="text-xl font-semibold text-white mb-3">
                  What happens during a video date?
                </h4>
                <p className="text-white/70 leading-relaxed">
                  You and your match join a split-screen video call for ten minutes. We provide conversation starters if you need them. At the end, you both privately decide: yes or no. If it&apos;s mutual, chat unlocks.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h4 className="text-xl font-semibold text-white mb-3">
                  Is Verity free?
                </h4>
                <p className="text-white/70 leading-relaxed">
                  Yes. Free members get five video dates per month—enough to find real connection. Verity Plus unlocks unlimited dates and premium features like advanced filters.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h4 className="text-xl font-semibold text-white mb-3">
                  Where is Verity available?
                </h4>
                <p className="text-white/70 leading-relaxed">
                  Verity is live across Australia. Create your profile and start connecting with real people near you.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h4 className="text-xl font-semibold text-white mb-3">
                  What if someone is inappropriate during a call?
                </h4>
                <p className="text-white/70 leading-relaxed">
                  Tap the emergency exit button to leave instantly. Our team reviews reports within minutes, and we have zero tolerance for misconduct. Your safety is our foundation.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h4 className="text-xl font-semibold text-white mb-3">
                  How do you verify profiles?
                </h4>
                <p className="text-white/70 leading-relaxed">
                  Every user records a live selfie video that we match against their photos. No stock images. No catfishing. What you see is who you&apos;ll meet.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h4 className="text-xl font-semibold text-white mb-3">
                  More questions?
                </h4>
                <p className="text-white/70 leading-relaxed">
                  We&apos;d love to hear from you.{" "}
                  <a href="mailto:hello@verity.au" className="text-accent hover:text-accent/80 transition-smooth font-semibold">
                    hello@verity.au
                  </a>
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </ScrollReveal>
      </div>
    </section>
  );
};
