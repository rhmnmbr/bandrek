import { Skeleton } from '@/components/ui/skeleton';

export function AuditLogSkeleton() {
  return (
    <div className="flex h-full w-full flex-col bg-(--color-surface)">
      {/* Header bar skeleton */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-(--color-border) px-3.5 bg-(--color-surface)">
        <Skeleton className="h-4 w-48 rounded" />
        <Skeleton className="h-6.5 w-32 rounded" />
      </div>

      {/* Filter toolbar skeleton */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-(--color-border) bg-(--color-surface-alt) px-3.5">
        <Skeleton className="h-6.5 w-64 rounded" />
        <Skeleton className="h-6.5 w-32 rounded" />
        <Skeleton className="h-6.5 w-28 rounded" />
        <Skeleton className="h-6.5 w-36 rounded" />
      </div>

      {/* Table rows skeleton */}
      <div className="flex-1 overflow-hidden p-3.5 flex flex-col gap-2">
        <div className="flex gap-2 border-b border-(--color-border) pb-2">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-4 w-44 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-4 flex-1 rounded" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 border-b border-(--color-border-subtle)">
            <Skeleton className="h-4 w-36 rounded" />
            <div className="flex items-center gap-2 w-44">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-4 flex-1 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
