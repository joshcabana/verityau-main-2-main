/**
 * FadeIn Component
 * 
 * A reusable wrapper that fades content in with optional slide-up effect.
 * Respects reduced motion preferences.
 */

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { fadeUp, fade, duration, easing, reducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FadeInProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Direction of the fade animation */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Delay before animation starts (in seconds) */
  delay?: number;
  /** Duration of the animation */
  duration?: "fast" | "normal" | "slow" | "slower";
  /** Whether to animate on mount */
  animate?: boolean;
  /** Custom className */
  className?: string;
}

const directionVariants = {
  up: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  down: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: -20 },
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

export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration: durationProp = "normal",
  animate = true,
  className,
  ...props
}: FadeInProps) {
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
      initial="hidden"
      animate={animate ? "visible" : "hidden"}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default FadeIn;

