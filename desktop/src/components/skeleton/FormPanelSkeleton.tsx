import { Skeleton } from '@/components/ui/skeleton';

export function FormPanelSkeleton({ title }: { title?: string }) {
  return (
    <div className="flex flex-1 min-h-0 flex-col bg-(--color-surface) p-4 gap-4 overflow-y-auto select-none">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-(--color-border)">
        <div className="flex items-center gap-2">
          {title ? (
            <span className="text-[13.5px] font-semibold text-(--color-text)">{title}</span>
          ) : (
            <Skeleton className="h-4.5 w-36" />
          )}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6.5 w-16 rounded-md" />
          <Skeleton className="h-6.5 w-20 rounded-md" />
        </div>
      </div>

      {/* Form Fields Skeletons */}
      <div className="flex flex-col gap-4 max-w-lg">
        {/* Field 1 */}
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-7 w-full rounded-md" />
        </div>

        {/* Field 2 */}
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-full rounded-md" />
        </div>

        {/* Field 3 */}
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-14 w-full rounded-md" />
        </div>

        {/* Field 4 (checkbox or radio) */}
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="w-4 h-4 rounded-sm" />
          <Skeleton className="h-3.5 w-40" />
        </div>

        {/* Bottom Save / Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-(--color-border-subtle)">
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
