import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ProfileCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="w-full aspect-[3/4]" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </Card>
  );
}

export function MatchCardSkeleton() {
  return (
    <Card className="p-4 flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </Card>
  );
}
