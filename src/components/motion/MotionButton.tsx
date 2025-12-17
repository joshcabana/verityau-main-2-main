/**
 * MotionButton Component
 * 
 * A wrapper that adds Framer Motion animations to any button.
 * Use this when you want enhanced hover/press animations beyond CSS.
 */

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { spring, duration } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MotionButtonWrapperProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Whether to show hover effects */
  hover?: boolean;
  /** Whether to show press effects */
  press?: boolean;
  /** Scale amount on hover (default: 1.02) */
  hoverScale?: number;
  /** Scale amount on press (default: 0.98) */
  pressScale?: number;
  /** Y offset on hover in pixels (default: -2) */
  hoverY?: number;
  /** Custom className */
  className?: string;
}

/**
 * Wraps a button with motion effects.
 * 
 * @example
 * <MotionButtonWrapper>
 *   <Button>Click me</Button>
 * </MotionButtonWrapper>
 */
export function MotionButtonWrapper({
  children,
  hover = true,
  press = true,
  hoverScale = 1.02,
  pressScale = 0.98,
  hoverY = -2,
  className,
  ...props
}: MotionButtonWrapperProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={hover ? { scale: hoverScale, y: hoverY } : undefined}
      whileTap={press ? { scale: pressScale, y: 0 } : undefined}
      transition={spring.default}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default MotionButtonWrapper;

