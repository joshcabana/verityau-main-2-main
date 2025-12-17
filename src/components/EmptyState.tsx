import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";
import { spring } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  className = "" 
}: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <FadeIn className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {/* Animated icon */}
      <motion.div
        className="text-muted-foreground mb-6"
        animate={prefersReducedMotion ? {} : { y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
          {icon}
        </div>
      </motion.div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground mb-6 max-w-sm">
        {description}
      </p>

      {/* Optional action button */}
      {action && (
        <motion.div
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          transition={spring.default}
        >
          <Button onClick={action.onClick} className="btn-premium">
            {action.label}
          </Button>
        </motion.div>
      )}
    </FadeIn>
  );
}

export default EmptyState;

