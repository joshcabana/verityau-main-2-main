import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Crown, Heart, Sparkles, Zap, Users, Star, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FadeIn, ScrollReveal, StaggerContainer, StaggerItem } from "@/components/motion";
import { spring, duration, easing } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const VerityPlus = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      const priceId = selectedPlan === "monthly" 
        ? "price_1SWUoFHGk085e6qAVmuxpq7w" // Basic monthly
        : "price_1SWUoqHGk085e6qAG0RkOy85"; // Premium monthly

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Heart,
      title: "Unlimited Verity Dates",
      description: "Connect with as many people as you want, no restrictions",
    },
    {
      icon: Zap,
      title: "Priority Matching",
      description: "Get matched first when new users join in your area",
    },
    {
      icon: Users,
      title: "Extended Search Radius",
      description: "Find connections up to 500km away instead of just 100km",
    },
    {
      icon: Star,
      title: "Profile Boost",
      description: "Your profile gets shown more often to potential matches",
    },
    {
      icon: Sparkles,
      title: "Advanced Filters",
      description: "Filter by interests, values, and relationship goals",
    },
    {
      icon: Crown,
      title: "Exclusive Badge",
      description: "Stand out with a premium Verity Plus badge on your profile",
    },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--ink))]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[hsl(var(--ink))]/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/main")}
            className="gap-2 text-white hover:text-accent hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-accent">
            <Crown className="w-5 h-5" />
            <span className="hero-text">Verity Plus</span>
          </div>
          <div className="w-20" /> {/* Spacer for center alignment */}
        </div>
      </div>

      {/* Hero Section */}
      <FadeIn className="max-w-6xl mx-auto px-4 py-16 text-center">
        <motion.div 
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/30 mb-6 shadow-gold"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={prefersReducedMotion ? { duration: 0.05 } : spring.bouncy}
        >
          <motion.div
            animate={prefersReducedMotion ? {} : { rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Crown className="w-10 h-10 text-accent" />
          </motion.div>
        </motion.div>
        
        <h1 className="section-header text-4xl md:text-5xl text-white mb-4">
          Upgrade to Verity Plus
        </h1>
        <p className="body-large text-white/70 max-w-2xl mx-auto mb-8">
          Unlock unlimited connections and premium features to find your perfect match faster
        </p>

        {/* Pricing Toggle */}
        <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full p-1 mb-12">
          <Button
            variant={selectedPlan === "monthly" ? "default" : "ghost"}
            onClick={() => setSelectedPlan("monthly")}
            className={selectedPlan === "monthly" ? "rounded-full px-8 bg-accent hover:bg-accent/90" : "rounded-full px-8 text-white hover:bg-white/5"}
          >
            Monthly
          </Button>
          <Button
            variant={selectedPlan === "annual" ? "default" : "ghost"}
            onClick={() => setSelectedPlan("annual")}
            className={selectedPlan === "annual" ? "rounded-full px-8 relative bg-accent hover:bg-accent/90" : "rounded-full px-8 relative text-white hover:bg-white/5"}
          >
            Annual
            <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full font-semibold">
              Save 20%
            </span>
          </Button>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto bg-white/5 rounded-3xl border-2 border-accent/30 p-8 shadow-elegant backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-white mb-2">
              ${selectedPlan === "monthly" ? "24.99" : "19.99"}
              <span className="text-2xl text-white/60">/mo</span>
            </div>
            {selectedPlan === "annual" && (
              <p className="text-sm text-white/50">
                Billed as $239.99/year
              </p>
            )}
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            size="lg"
            className="w-full h-14 text-lg font-semibold btn-premium shadow-premium mb-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 mr-2" />
                Start Verity Plus
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Cancel anytime. No commitments.
          </p>
        </div>
      </FadeIn>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <ScrollReveal>
          <h2 className="section-header text-3xl font-bold text-white text-center mb-12">
            Everything you get with Plus
          </h2>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={index}>
                <motion.div
                  className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-accent/30 transition-all duration-300 hover:shadow-gold group h-full"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -4 }}
                  transition={spring.gentle}
                >
                  <motion.div 
                    className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4"
                    whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }}
                    transition={spring.default}
                  >
                    <Icon className="w-6 h-6 text-accent" />
                  </motion.div>
                  <h3 className="font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-accent text-sm font-medium">
                    <Check className="w-4 h-4" />
                    <span>Included</span>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* FAQ Section */}
        <ScrollReveal className="mt-20 max-w-3xl mx-auto">
          <h2 className="section-header text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <StaggerContainer className="space-y-6">
            <StaggerItem>
              <motion.div 
                className="bg-white/5 rounded-2xl p-6 border border-white/10"
                whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                transition={spring.gentle}
              >
                <h3 className="font-semibold text-white mb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Yes! You can cancel your Verity Plus subscription at any time. You'll continue to have access to Plus features until the end of your billing period.
                </p>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div 
                className="bg-white/5 rounded-2xl p-6 border border-white/10"
                whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                transition={spring.gentle}
              >
                <h3 className="font-semibold text-white mb-2">
                  What happens if I cancel?
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  If you cancel, you'll revert to the free plan. You'll be limited to 5 Verity Dates per month and standard matching priority, but you'll keep all your existing matches and conversations.
                </p>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div 
                className="bg-white/5 rounded-2xl p-6 border border-white/10"
                whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                transition={spring.gentle}
              >
                <h3 className="font-semibold text-white mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  We offer a 7-day free trial for new Verity Plus subscribers. You won't be charged until the trial period ends. Cancel before then and you won't pay anything.
                </p>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </ScrollReveal>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-white/10 bg-[hsl(var(--ink))]/95 backdrop-blur sticky bottom-0">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-semibold text-white">Ready to upgrade?</p>
            <p className="text-sm text-white/60">Start finding better matches today</p>
          </div>
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            size="lg"
            className="btn-premium shadow-premium w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 mr-2" />
                Get Verity Plus
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerityPlus;
