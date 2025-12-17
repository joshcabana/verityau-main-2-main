import { memo } from "react";
import { useCountAnimation } from "@/hooks/useCountAnimation";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface AnimatedCounterProps {
  target: number;
  className?: string;
}

export const AnimatedCounter = memo(function AnimatedCounter({ target, className = "" }: AnimatedCounterProps) {
  const { ref, isVisible } = useScrollAnimation();
  const count = useCountAnimation(target, 2000, isVisible);

  return (
    <span ref={ref} className={className}>
      {count.toLocaleString()}
    </span>
  );
});
