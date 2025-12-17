/**
 * Verity Motion System
 * 
 * A cohesive, Hinge-inspired motion system that feels smooth, confident, and warm.
 * All animations should feel intentional and premium, never cheap or gimmicky.
 */

import { Variants, Transition } from "framer-motion";

// =============================================================================
// TIMING SCALE
// =============================================================================

export const duration = {
  /** 150ms - Micro-interactions: button press, toggle, hover feedback */
  fast: 0.15,
  /** 250ms - Standard transitions: cards, form elements, small reveals */
  normal: 0.25,
  /** 400ms - Page transitions, hero reveals, modal open/close */
  slow: 0.4,
  /** 600ms - Staggered list animations, dramatic reveals */
  slower: 0.6,
} as const;

// =============================================================================
// EASING CURVES
// =============================================================================

export const easing = {
  /** Entrances - elements arriving on screen */
  easeOut: [0.0, 0.0, 0.2, 1] as const,
  /** Exits - elements leaving screen */
  easeIn: [0.4, 0.0, 1, 1] as const,
  /** Hover states, toggles, continuous motion */
  easeInOut: [0.4, 0.0, 0.2, 1] as const,
} as const;

export const spring = {
  /** Playful interactions: likes, matches, success states */
  default: { type: "spring" as const, stiffness: 400, damping: 30 },
  /** Card movements, swipes */
  gentle: { type: "spring" as const, stiffness: 300, damping: 25 },
  /** Bouncy celebrations */
  bouncy: { type: "spring" as const, stiffness: 500, damping: 20 },
  /** Subtle, smooth spring */
  smooth: { type: "spring" as const, stiffness: 200, damping: 20 },
} as const;

// =============================================================================
// TRANSITION PRESETS
// =============================================================================

export const transition = {
  fast: { duration: duration.fast, ease: easing.easeOut } as Transition,
  normal: { duration: duration.normal, ease: easing.easeOut } as Transition,
  slow: { duration: duration.slow, ease: easing.easeOut } as Transition,
  slower: { duration: duration.slower, ease: easing.easeOut } as Transition,
  spring: spring.default as Transition,
  springGentle: spring.gentle as Transition,
} as const;

// =============================================================================
// VARIANT PRESETS
// =============================================================================

/** Fade in from below - great for page content */
export const fadeUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transition.normal,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

/** Simple fade - for overlays and subtle reveals */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: transition.normal,
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

/** Scale in - for modals, cards, success states */
export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: spring.default,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

/** Scale with spring - for celebratory moments */
export const scaleSpring: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: spring.bouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

/** Slide in from right - for sheets, drawers */
export const slideRight: Variants = {
  hidden: { 
    x: "100%", 
    opacity: 0 
  },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: transition.slow,
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: duration.normal, ease: easing.easeIn },
  },
};

/** Slide in from left */
export const slideLeft: Variants = {
  hidden: { 
    x: "-100%", 
    opacity: 0 
  },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: transition.slow,
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: { duration: duration.normal, ease: easing.easeIn },
  },
};

/** Slide up from bottom - for bottom sheets */
export const slideUp: Variants = {
  hidden: { 
    y: "100%", 
    opacity: 0 
  },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: transition.slow,
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: duration.normal, ease: easing.easeIn },
  },
};

// =============================================================================
// STAGGER CONFIGURATION
// =============================================================================

export const stagger = {
  /** Fast stagger for lists */
  fast: 0.05,
  /** Normal stagger for sections */
  normal: 0.08,
  /** Slow stagger for dramatic reveals */
  slow: 0.12,
} as const;

/** Container variant for staggered children */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.normal,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: stagger.fast,
      staggerDirection: -1,
    },
  },
};

/** Stagger item - use with staggerContainer */
export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transition.normal,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: duration.fast },
  },
};

// =============================================================================
// INTERACTIVE STATES
// =============================================================================

/** Button hover/tap states */
export const buttonMotion = {
  hover: { 
    y: -2,
    transition: { duration: duration.fast, ease: easing.easeOut },
  },
  tap: { 
    y: 0,
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

/** Card hover/tap states */
export const cardMotion = {
  hover: { 
    scale: 1.02,
    transition: spring.gentle,
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

/** Icon button states */
export const iconMotion = {
  hover: { 
    scale: 1.1,
    transition: spring.default,
  },
  tap: { 
    scale: 0.9,
    transition: { duration: 0.1 },
  },
};

/** Heart/like animation */
export const heartMotion = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.2, 1],
    transition: { 
      duration: 0.3,
      times: [0, 0.5, 1],
      ease: easing.easeOut,
    },
  },
};

// =============================================================================
// PAGE TRANSITION
// =============================================================================

export const pageTransition: Variants = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: duration.slow,
      ease: easing.easeOut,
    },
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: duration.fast,
      ease: easing.easeIn,
    },
  },
};

// =============================================================================
// REDUCED MOTION VARIANTS
// =============================================================================

/** Reduced motion version - instant opacity only */
export const reducedMotion: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.05 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.05 },
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get appropriate variants based on reduced motion preference
 */
export function getVariants(variants: Variants, prefersReducedMotion: boolean): Variants {
  return prefersReducedMotion ? reducedMotion : variants;
}

/**
 * Create stagger container with custom timing
 */
export function createStaggerContainer(
  staggerDelay: number = stagger.normal,
  initialDelay: number = 0.1
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: stagger.fast,
        staggerDirection: -1,
      },
    },
  };
}

