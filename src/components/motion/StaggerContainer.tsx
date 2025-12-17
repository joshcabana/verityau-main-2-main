/**
 * StaggerContainer Component
 * 
 * A container that staggers the entrance of its children.
 * Use with StaggerItem for best results.
 */

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { stagger, duration, easing, reducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface StaggerContainerProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Delay between each child animation */
  staggerDelay?: "fast" | "normal" | "slow" | number;
  /** Initial delay before stagger begins */
  initialDelay?: number;
  /** Whether to animate on mount */
  animate?: boolean;
  /** Custom className */
  className?: string;
}

const staggerMap = {
  fast: stagger.fast,
  normal: stagger.normal,
  slow: stagger.slow,
};

export function StaggerContainer({
  children,
  staggerDelay = "normal",
  initialDelay = 0.1,
  animate = true,
  className,
  ...props
}: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  const staggerValue = typeof staggerDelay === "number" 
    ? staggerDelay 
    : staggerMap[staggerDelay];

  const variants = prefersReducedMotion
    ? reducedMotion
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerValue,
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

  return (
    <motion.div
      initial="hidden"
      animate={animate ? "visible" : "hidden"}
      exit="exit"
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Direction of the fade animation */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Custom className */
  className?: string;
}

const itemDirectionVariants = {
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

export function StaggerItem({
  children,
  direction = "up",
  className,
  ...props
}: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion
    ? reducedMotion
    : {
        hidden: itemDirectionVariants[direction].hidden,
        visible: {
          ...itemDirectionVariants[direction].visible,
          transition: {
            duration: duration.normal,
            ease: easing.easeOut,
          },
        },
        exit: {
          opacity: 0,
          y: -10,
          transition: { duration: duration.fast },
        },
      };

  return (
    <motion.div variants={variants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

export default StaggerContainer;

