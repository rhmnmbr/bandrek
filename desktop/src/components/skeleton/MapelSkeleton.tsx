import { Skeleton } from '@/components/ui/skeleton';

export function MapelSkeleton() {
  return (
    <div className="flex flex-1 min-h-0 bg-(--color-surface) overflow-hidden select-none" data-testid="mapel-skeleton">
      {/* Left Column: Mapel List */}
      <div className="flex flex-col border-r border-(--color-border) w-[288px] flex-[0_0_288px] min-w-0 bg-(--color-surface)">
        {/* 1. Subheader Row (H: 44px / h-11) */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-(--color-border) px-3.5 bg-(--color-surface)">
          <Skeleton className="h-3.5 w-32 rounded shrink-0" />
          <Skeleton className="h-6.5 w-24 rounded shrink-0" />
        </div>

        {/* 2. Filter Bar (H: 48px / h-12) */}
        <div className="flex h-12 shrink-0 items-center gap-1.75 border-b border-(--color-border) px-3.5 bg-(--color-surface-subtle) text-xs">
          <Skeleton className="h-6.5 flex-1 min-w-[150px] max-w-[280px] rounded shrink-0" />
          <Skeleton className="h-6.5 w-24 rounded shrink-0" />
        </div>

        {/* 3. Table Container */}
        <div className="flex flex-1 min-h-0 flex-col">
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col min-h-full w-full">
              {/* Sticky Header (H: 26px / h-6.5) */}
              <div className="sticky top-0 z-3 flex h-6.5 shrink-0 items-center justify-between border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
                <div>MATA PELAJARAN</div>
                <div>MATERI</div>
              </div>

              {/* Table Rows (H: 32px / h-8) */}
              <div className="flex flex-col">
                {/* Row 1: Selected state (representing the first auto-selected item) */}
                <div className="flex h-8 shrink-0 items-center justify-between border-b border-(--color-border-subtle) px-3.5 bg-(--color-brand-subtle) shadow-[inset_3px_0_0_var(--color-brand)]">
                  <Skeleton className="h-3.5 w-28 rounded shrink-0" />
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
                        idx === 0 ? 'w-20' : idx === 1 ? 'w-14' : idx === 2 ? 'w-16' : idx === 3 ? 'w-24' : 'w-22'
                      }`}
                    />
                    <Skeleton className="h-3.5 w-4 rounded shrink-0" />
                  </div>
                ))}
              </div>

              <div className="flex-1 min-h-0" />
            </div>
          </div>

          {/* Sticky Footer (H: 30px / h-7.5) */}
          <div className="flex h-7.5 shrink-0 items-center border-t border-(--color-border) bg-(--color-surface-alt) px-3.5">
            <Skeleton className="h-3 w-48 rounded shrink-0" />
          </div>
        </div>
      </div>

      {/* Right Column: Detail Form Panel */}
      <div className="flex flex-1 min-w-0 min-h-0 flex-col overflow-hidden bg-(--color-surface)">
        {/* Detail Header (H: ~54px) */}
        <div className="flex h-13.5 shrink-0 items-center justify-between border-b border-(--color-border) px-4 bg-(--color-surface)">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded shrink-0" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-28 rounded shrink-0" />
              <Skeleton className="h-3 w-36 rounded shrink-0" />
            </div>
          </div>
          <Skeleton className="h-4.5 w-12 rounded-full shrink-0" />
        </div>

        {/* Detail Form Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3 bg-(--color-surface)">
          {/* Field: Nama mata pelajaran */}
          <div className="flex flex-col gap-1 max-w-lg">
            <Skeleton className="h-3 w-32 rounded shrink-0" />
            <Skeleton className="h-7 w-full rounded-sm shrink-0" />
          </div>

          {/* Checkbox: Aktif */}
          <div className="max-w-lg">
            <Skeleton className="h-10 w-full rounded-md shrink-0" />
          </div>

          {/* Materi Section */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-48 rounded shrink-0" />
              <Skeleton className="h-6.5 w-20 rounded shrink-0" />
            </div>

            {/* Materi Table */}
            <div className="rounded-sm border border-(--color-border) overflow-hidden">
              {/* Header */}
              <div className="flex h-6.5 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3 text-[10.5px] font-semibold text-(--color-text-muted)">
                <div className="w-8 shrink-0">NO</div>
                <div className="flex-1 min-w-[140px]">NAMA MATERI</div>
                <div className="w-24 shrink-0">DIPAKAI</div>
                <div className="w-16 shrink-0">STATUS</div>
                <div className="w-12 shrink-0" />
              </div>

              {/* Rows */}
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex h-8 items-center border-b border-(--color-border-subtle) px-3 bg-(--color-surface) text-[12.5px]"
                >
                  <div className="w-8 shrink-0">
                    <Skeleton className="h-3 w-3 rounded shrink-0" />
                  </div>
                  <div className="flex-1 min-w-[140px] pr-2">
                    <Skeleton
                      className={`h-3.5 rounded shrink-0 ${
                        idx % 3 === 0 ? 'w-28' : idx % 2 === 0 ? 'w-24' : 'w-32'
                      }`}
                    />
                  </div>
                  <div className="w-24 shrink-0 pr-2">
                    <Skeleton className="h-3.5 w-16 rounded shrink-0" />
                  </div>
                  <div className="w-16 shrink-0 pr-2">
                    <Skeleton className="h-4 w-12 rounded-full shrink-0" />
                  </div>
                  <div className="w-12 shrink-0 flex justify-end">
                    <Skeleton className="h-3.5 w-8 rounded shrink-0" />
                  </div>
                </div>
              ))}
            </div>

            {/* Caption */}
            <Skeleton className="h-2.5 w-72 rounded shrink-0" />

            {/* Summary Box */}
            <div className="rounded-md border border-(--color-border) bg-(--color-surface) p-2.5 flex flex-col gap-1.5 mt-1">
              <Skeleton className="h-2.5 w-20 rounded shrink-0" />
              <Skeleton className="h-3 w-64 rounded shrink-0" />
              <Skeleton className="h-3 w-44 rounded shrink-0" />
            </div>
          </div>
        </div>

        {/* Bottom Action Bar (H: 44px / h-11) */}
        <div className="flex h-11 shrink-0 items-center justify-between border-t border-(--color-border) px-4 bg-(--color-surface)">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6.5 w-20 rounded shrink-0" />
            <Skeleton className="h-6.5 w-14 rounded shrink-0" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6.5 w-14 rounded shrink-0" />
            <Skeleton className="h-6.5 w-24 rounded shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
