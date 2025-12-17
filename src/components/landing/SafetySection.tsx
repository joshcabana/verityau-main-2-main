import { memo } from "react";
import { ScrollReveal } from "@/components/motion";

export const SafetySection = memo(function SafetySection() {
  return (
    <section id="safety" className="py-24 px-4 bg-[hsl(var(--grey-100))] relative">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="section-header text-4xl md:text-[64px] text-center mb-12 text-white">
            Safety isn&apos;t a feature. It&apos;s the foundation.
          </h2>
          <div className="text-center max-w-3xl mx-auto">
            <p className="body-large text-white/70 mb-8">
              We verify every user and protect every interaction—so you can relax and be yourself.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h3 className="text-xl font-semibold text-white mb-4">Verification</h3>
                <ul className="text-white/70 space-y-2 text-left">
                  <li>• Live selfie video required</li>
                  <li>• Optional ID verification</li>
                  <li>• Reverse image detection</li>
                  <li>• No anonymous profiles</li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h3 className="text-xl font-semibold text-white mb-4">During Dates</h3>
                <ul className="text-white/70 space-y-2 text-left">
                  <li>• Emergency exit button</li>
                  <li>• Screenshot blocking</li>
                  <li>• Post-date check-ins</li>
                  <li>• One-tap reporting</li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h3 className="text-xl font-semibold text-white mb-4">Moderation</h3>
                <ul className="text-white/70 space-y-2 text-left">
                  <li>• AI-assisted detection</li>
                  <li>• 24/7 human review</li>
                  <li>• Zero tolerance for harm</li>
                  <li>• Quality-first profiles</li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h3 className="text-xl font-semibold text-white mb-4">Privacy</h3>
                <ul className="text-white/70 space-y-2 text-left">
                  <li>• No third-party data sharing</li>
                  <li>• End-to-end encryption</li>
                  <li>• You control location sharing</li>
                  <li>• Block anyone, instantly</li>
                </ul>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 backdrop-blur-xl">
              <h3 className="text-2xl font-semibold text-white mb-4">Our Commitment</h3>
              <p className="text-white/80 text-lg leading-relaxed">
                Safety shapes every decision we make. If something feels wrong, our team responds in minutes—not hours. Verity is where you can finally let your guard down.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
});
