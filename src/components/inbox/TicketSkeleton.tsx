import { Skeleton } from '../ui/skeleton';

export function TicketSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-border/60 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-3 w-10 rounded" />
      </div>

      <Skeleton className="h-5 w-28 rounded-full" />

      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-3/4 rounded" />

      <div className="flex gap-1.5 pt-1">
        <Skeleton className="h-4 w-12 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>
    </div>
  );
}
