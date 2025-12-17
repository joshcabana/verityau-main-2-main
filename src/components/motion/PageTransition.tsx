/**
 * PageTransition Component
 * 
 * Wraps page content with enter/exit animations.
 * Use with AnimatePresence in App.tsx for route transitions.
 */

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { pageTransition, reducedMotion, duration, easing } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PageTransitionProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Custom className */
  className?: string;
}

export function PageTransition({
  children,
  className,
  ...props
}: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.05 } },
        exit: { opacity: 0, transition: { duration: 0.05 } },
      }
    : {
        initial: { opacity: 0, y: 20 },
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

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;

