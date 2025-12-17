/**
 * Apple.com-inspired animation components
 * Subtle, smooth, and elegant animations that feel natural
 */

import { motion, HTMLMotionProps, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AppleHoverProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  scale?: number;
  stiffness?: number;
  damping?: number;
}

/**
 * Apple-style hover effect with smooth scale and subtle movement
 */
export function AppleHover({
  children,
  scale = 1.02,
  stiffness = 400,
  damping = 25,
  className,
  ...props
}: AppleHoverProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className} {...props}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      transition={{
        type: "spring",
        stiffness,
        damping,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface AppleCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  hover?: boolean;
}

/**
 * Apple-style card with subtle hover effects
 */
export function AppleCard({
  children,
  hover = true,
  className,
  ...props
}: AppleCardProps) {
  return (
    <AppleHover
      scale={hover ? 1.01 : 1}
      stiffness={300}
      damping={30}
      className={className}
      {...props}
    >
      {children}
    </AppleHover>
  );
}

interface AppleButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}

/**
 * Apple-style button with smooth hover animations
 */
export function AppleButton({
  children,
  variant = "primary",
  className,
  ...props
}: AppleButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  const baseClasses = "relative overflow-hidden transition-all duration-300 ease-out";

  const variantClasses = {
    primary: "bg-accent hover:bg-accent/90 text-accent-foreground shadow-gold hover:shadow-elegant",
    secondary: "bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 text-white",
    ghost: "text-white/70 hover:text-white hover:bg-white/5",
  };

  if (prefersReducedMotion) {
    return (
      <button
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      whileHover={{
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

interface AppleParallaxProps {
  children: ReactNode;
  offset?: number;
  className?: string;
}

/**
 * Apple-style parallax effect for subtle depth
 */
export function AppleParallax({
  children,
  offset = 50,
  className
}: AppleParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const springY = useSpring(y, { stiffness: 300, damping: 30 });
  const yTransform = useTransform(springY, [0, 1], [0, -offset]);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrollProgress = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));
      y.set(scrollProgress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [y]);

  return (
    <motion.div
      ref={ref}
      style={{ y: yTransform }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AppleFadeInProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

/**
 * Apple-style fade-in animation - smoother and more elegant than typical reveals
 */
export function AppleFadeIn({
  children,
  delay = 0,
  direction = "up",
  className,
  ...props
}: AppleFadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  const directionOffset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  if (prefersReducedMotion) {
    return <div className={className} {...props}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...directionOffset[direction]
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0
      }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94], // Apple's custom easing
        delay,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Apple-style staggered animation for lists
 */
export function AppleStagger({
  children,
  staggerDelay = 0.1,
  className
}: {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Apple-style stagger item
 */
export function AppleStaggerItem({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: {
          opacity: 0,
          y: 20,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
