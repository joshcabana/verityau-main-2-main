/**
 * EXAMPLE: How to add Hinge-style animations to Index.tsx
 * 
 * This shows before/after examples of applying the animation system
 */

// ========================================
// STEP 1: Import animation hooks at the top
// ========================================

import { usePageTransition, useStaggerAnimation } from '@/hooks/useAnimations';

// ========================================
// STEP 2: Add page transition
// ========================================

// BEFORE:
const Index = () => {
  return (
    <div className="min-h-screen bg-[hsl(var(--ink))] text-foreground">
      {/* content */}
    </div>
  );
};

// AFTER:
const Index = () => {
  const animate = usePageTransition(100); // 100ms delay for smooth entry
  
  return (
    <div className={`min-h-screen bg-[hsl(var(--ink))] text-foreground ${animate ? 'page-enter' : 'opacity-0'}`}>
      {/* content */}
    </div>
  );
};

// ========================================
// STEP 3: Add stagger animation to feature cards
// ========================================

// BEFORE:
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
  <div className="bg-white/5 border border-white/10 rounded-lg p-10">
    <div className="text-4xl mb-4">😤</div>
    <p className="body-large text-white">Feature 1</p>
  </div>
  <div className="bg-white/5 border border-white/10 rounded-lg p-10">
    <div className="text-4xl mb-4">🙄</div>
    <p className="body-large text-white">Feature 2</p>
  </div>
  <div className="bg-white/5 border border-white/10 rounded-lg p-10">
    <div className="text-4xl mb-4">💀</div>
    <p className="body-large text-white">Feature 3</p>
  </div>
</div>

// AFTER:
const Index = () => {
  const features = [
    { emoji: '😤', text: 'Feature 1' },
    { emoji: '🙄', text: 'Feature 2' },
    { emoji: '💀', text: 'Feature 3' },
  ];
  
  const { containerRef, getItemStyle } = useStaggerAnimation(features.length);
  
  return (
    <div ref={containerRef as any} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
      {features.map((feature, i) => (
        <div 
          key={i}
          style={getItemStyle(i)}
          className="bg-white/5 border border-white/10 rounded-lg p-10 card-lift"
        >
          <div className="text-4xl mb-4">{feature.emoji}</div>
          <p className="body-large text-white">{feature.text}</p>
        </div>
      ))}
    </div>
  );
};

// ========================================
// STEP 4: Add card-lift to hoverable cards
// ========================================

// BEFORE:
<div className="bg-white/5 border border-white/10 rounded-lg p-10 shadow-elegant hover:border-accent/30 hover:shadow-gold transition-smooth hover:scale-[1.02]">

// AFTER:
<div className="bg-white/5 border border-white/10 rounded-lg p-10 card-lift hover:border-accent/30">
  {/* The card-lift class handles all the hover animation magic! */}
</div>

// ========================================
// STEP 5: Add button loading states
// ========================================

import { LoadingDots } from '@/components/LoadingComponents';
import { useState } from 'react';

// BEFORE:
<Button
  type="submit"
  size="lg"
>
  Join the Waitlist
</Button>

// AFTER:
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (email: string) => {
  setIsSubmitting(true);
  try {
    await handleEmailSubmit(email);
  } finally {
    setIsSubmitting(false);
  }
};

<Button
  type="submit"
  size="lg"
  disabled={isSubmitting}
>
  {isSubmitting ? <LoadingDots size="sm" /> : 'Join the Waitlist'}
</Button>

// ========================================
// STEP 6: Enhance success dialog
// ========================================

import { AnimatedDialog } from '@/components/AnimatedDialogs';

// BEFORE:
<Dialog open={showSuccess} onOpenChange={setShowSuccess}>
  <DialogContent className="max-w-3xl text-center border-none bg-white/5 border-white/10 backdrop-blur-xl">
    <DialogHeader>
      <DialogTitle className="hero-text text-3xl md:text-5xl mb-4 text-white">
        You're in! Lifetime unlimited Verity Dates locked for you.
      </DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>

// AFTER:
<AnimatedDialog
  isOpen={showSuccess}
  onClose={() => setShowSuccess(false)}
  title="You're in! Lifetime unlimited Verity Dates locked for you."
  className="max-w-3xl bg-[hsl(var(--ink))] text-white border border-white/10"
>
  <div className="text-center">
    {/* content */}
  </div>
</AnimatedDialog>

// ========================================
// STEP 7: Complete example of animated Index.tsx section
// ========================================

import { usePageTransition, useStaggerAnimation } from '@/hooks/useAnimations';
import { LoadingDots } from '@/components/LoadingComponents';
import { AnimatedDialog } from '@/components/AnimatedDialogs';

const Index = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const animate = usePageTransition(100);
  
  const problemCards = [
    { emoji: '😤', text: 'Problem 1', solution: 'Solution 1' },
    { emoji: '🙄', text: 'Problem 2', solution: 'Solution 2' },
    { emoji: '💀', text: 'Problem 3', solution: 'Solution 3' },
  ];
  
  const { containerRef, getItemStyle } = useStaggerAnimation(problemCards.length);

  const handleEmailSubmit = async (email: string) => {
    setIsSubmitting(true);
    try {
      // API call
      await submitToWaitlist(email);
      setShowSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[hsl(var(--ink))] ${animate ? 'page-enter' : 'opacity-0'}`}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="max-w-5xl mx-auto text-center px-4">
          <h1 className="hero-text text-5xl md:text-8xl text-white mb-8">
            Find Your Last First Date
          </h1>
          
          <form onSubmit={handleEmailSubmit}>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? <LoadingDots size="sm" /> : 'Join the Waitlist'}
            </Button>
          </form>
        </div>
      </section>

      {/* Problems Section with Stagger Animation */}
      <section className="py-24 px-4">
        <h2 className="section-header text-4xl text-center mb-20 text-white">
          Every other app is lying to you.
        </h2>

        <div 
          ref={containerRef as any} 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {problemCards.map((card, i) => (
            <div
              key={i}
              style={getItemStyle(i)}
              className="bg-white/5 border border-white/10 rounded-lg p-10 card-lift"
            >
              <div className="text-4xl mb-4">{card.emoji}</div>
              <p className="body-large text-white mb-4">{card.text}</p>
              <p className="text-accent font-semibold text-lg">{card.solution}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Success Dialog */}
      <AnimatedDialog
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="You're in!"
        className="bg-[hsl(var(--ink))] border border-white/10"
      >
        <div className="text-center text-white">
          <p className="text-xl mb-6">
            Lifetime unlimited Verity Dates locked for you.
          </p>
          <Button onClick={() => setShowSuccess(false)}>
            Awesome!
          </Button>
        </div>
      </AnimatedDialog>
    </div>
  );
};

export default Index;
