import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const VerifiedBadge = ({ className, size = "md" }: VerifiedBadgeProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center",
        className
      )}
      title="Verified Profile"
    >
      <BadgeCheck
        className={cn(
          "text-primary fill-primary/20",
          sizeClasses[size]
        )}
      />
    </div>
  );
};
