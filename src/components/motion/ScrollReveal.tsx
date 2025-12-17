/**
 * ScrollReveal Component
 * 
 * Reveals content when it enters the viewport.
 * Uses Intersection Observer for performance.
 */

import { motion, useInView, HTMLMotionProps } from "framer-motion";
import { ReactNode, useRef } from "react";
import { duration, easing, reducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ScrollRevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Direction of the reveal animation */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Delay before animation starts (in seconds) */
  delay?: number;
  /** Duration of the animation */
  duration?: "fast" | "normal" | "slow" | "slower";
  /** How much of the element must be visible to trigger (0-1) */
  threshold?: number;
  /** Whether animation should only play once */
  once?: boolean;
  /** Custom className */
  className?: string;
}

const directionVariants = {
  up: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  down: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  none: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

const durationMap = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  slower: 0.6,
};

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration: durationProp = "normal",
  threshold = 0.2,
  once = true,
  className,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once, 
    amount: threshold,
  });
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion
    ? reducedMotion
    : {
        hidden: directionVariants[direction].hidden,
        visible: {
          ...directionVariants[direction].visible,
          transition: {
            duration: durationMap[durationProp],
            ease: easing.easeOut,
            delay,
          },
        },
      };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default ScrollReveal;

