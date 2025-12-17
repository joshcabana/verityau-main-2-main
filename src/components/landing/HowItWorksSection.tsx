import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/motion";
import { spring } from "@/lib/motion";
import { Heart, Video, CheckCircle2 } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import conversationIllustration from "@/assets/conversation-illustration.png";
import videoDateIllustration from "@/assets/video-date-illustration.png";
import stepIllustration1 from "@/assets/step-illustration-1.png";
import stepIllustration2 from "@/assets/step-illustration-2.png";
import stepIllustration3 from "@/assets/step-illustration-3.png";

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-[hsl(var(--grey-100))] relative">
      {/* Line illustration decorations */}
      <div className="absolute top-20 left-10 w-40 h-40 opacity-15 hidden lg:block">
        <OptimizedImage
          src={conversationIllustration}
          alt=""
          className="w-full h-full"
          showLoadingState={false}
        />
      </div>
      <div className="absolute bottom-20 right-10 w-40 h-40 opacity-15 hidden lg:block">
        <OptimizedImage
          src={videoDateIllustration}
          alt=""
          className="w-full h-full"
          showLoadingState={false}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Headline */}
        <ScrollReveal>
          <h2 className="section-header text-4xl md:text-[64px] text-center mb-32 text-white">
            One conversation changes everything.
          </h2>
        </ScrollReveal>

        {/* Steps */}
        <div className="space-y-32">
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
                  Upload a few photos. Record a short intro video. Every profile is verified—what you see is who you&apos;ll meet.
                </p>
              </div>
              <div className="order-1 md:order-2">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={spring.gentle}
                >
                  <OptimizedImage
                    src={stepIllustration1}
                    alt="Hands almost touching - human connection"
                    className="w-full max-w-[400px] mx-auto drop-shadow-2xl"
                  />
                </motion.div>
              </div>
            </div>
          </ScrollReveal>

          {/* Step 2 */}
          <ScrollReveal>
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="order-1">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  transition={spring.gentle}
                >
                  <OptimizedImage
                    src={stepIllustration2}
                    alt="Eyes meeting - genuine emotion"
                    className="w-full max-w-[400px] mx-auto drop-shadow-2xl"
                  />
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
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={spring.gentle}
                >
                  <OptimizedImage
                    src={stepIllustration3}
                    alt="Two people in conversation - genuine connection"
                    className="w-full max-w-[400px] mx-auto drop-shadow-2xl"
                  />
                </motion.div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
