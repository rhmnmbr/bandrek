import { Skeleton } from '@/components/ui/skeleton';

export function TempatSkeleton() {
  return (
    <div className="flex flex-1 min-h-0 bg-(--color-surface) overflow-hidden select-none" data-testid="tempat-skeleton">
      {/* Left Column: Tempat List */}
      <div className="flex flex-col border-r border-(--color-border) w-[288px] flex-[0_0_288px] min-w-0 bg-(--color-surface)">
        {/* 1. Subheader Row (H: 44px / h-11) */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-(--color-border) px-3.5 bg-(--color-surface)">
          <Skeleton className="h-3.5 w-32 rounded shrink-0" />
          <Skeleton className="h-6.5 w-24 rounded shrink-0" />
        </div>

        {/* 2. Filter Bar (H: 48px / h-12) */}
        <div className="flex h-12 shrink-0 items-center border-b border-(--color-border) px-3.5 bg-(--color-surface-subtle) text-xs">
          <Skeleton className="h-6.5 w-full rounded shrink-0" />
        </div>

        {/* 3. Table Container */}
        <div className="flex flex-1 min-h-0 flex-col">
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col min-h-full w-full">
              {/* Sticky Header */}
              <div className="sticky top-0 z-3 flex h-6.5 shrink-0 items-center justify-between border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
                <div>TEMPAT</div>
                <div>RUANGAN</div>
              </div>

              {/* Table Rows */}
              <div className="flex flex-col">
                {/* Row 1: Selected */}
                <div className="flex h-8 shrink-0 items-center justify-between border-b border-(--color-border-subtle) px-3.5 bg-(--color-brand-subtle) shadow-[inset_3px_0_0_var(--color-brand)]">
                  <Skeleton className="h-3.5 w-24 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-4 rounded shrink-0" />
                </div>

                {/* Rows 2..6 */}
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex h-8 shrink-0 items-center justify-between border-b border-(--color-border-subtle) px-3.5 bg-(--color-surface)"
                  >
                    <Skeleton
                      className={`h-3.5 rounded shrink-0 ${
                        idx === 0 ? 'w-20' : idx === 1 ? 'w-16' : idx === 2 ? 'w-24' : 'w-18'
                      }`}
                    />
                    <Skeleton className="h-3.5 w-4 rounded shrink-0" />
                  </div>
                ))}
              </div>

              <div className="flex-1 min-h-0" />
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex h-7.5 shrink-0 items-center border-t border-(--color-border) bg-(--color-surface-alt) px-3.5">
            <Skeleton className="h-3 w-44 rounded shrink-0" />
          </div>
        </div>
      </div>

      {/* Right Column: Tempat Detail Panel */}
      <div className="flex flex-1 min-w-0 min-h-0 flex-col overflow-hidden bg-(--color-surface)">
        {/* Header */}
        <div className="flex h-13.5 shrink-0 items-center justify-between border-b border-(--color-border) px-4 bg-(--color-surface)">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded shrink-0" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-28 rounded shrink-0" />
              <Skeleton className="h-3 w-36 rounded shrink-0" />
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3 bg-(--color-surface)">
          {/* Field: Nama Tempat */}
          <div className="flex flex-col gap-1 max-w-lg">
            <Skeleton className="h-3 w-24 rounded shrink-0" />
            <Skeleton className="h-7 w-full rounded-sm shrink-0" />
          </div>

          {/* Ruangan Section */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-36 rounded shrink-0" />
              <Skeleton className="h-6.5 w-24 rounded shrink-0" />
            </div>

            {/* Ruangan Table */}
            <div className="rounded-sm border border-(--color-border) overflow-hidden">
              <div className="flex h-6.5 items-center justify-between border-b border-(--color-border) bg-(--color-surface-alt) px-3 text-[10.5px] font-semibold text-(--color-text-muted)">
                <div>NAMA RUANGAN</div>
                <div>KAPASITAS</div>
              </div>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex h-8 items-center justify-between border-b border-(--color-border-subtle) px-3 bg-(--color-surface)"
                >
                  <Skeleton className="h-3.5 w-28 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-8 rounded shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex h-11 shrink-0 items-center justify-between border-t border-(--color-border) px-4 bg-(--color-surface)">
          <Skeleton className="h-6.5 w-16 rounded shrink-0" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6.5 w-14 rounded shrink-0" />
            <Skeleton className="h-6.5 w-24 rounded shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
