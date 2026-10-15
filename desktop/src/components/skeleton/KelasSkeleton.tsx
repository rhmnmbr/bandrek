import { Skeleton } from '@/components/ui/skeleton';

export function KelasSkeleton() {
  return (
    <div className="flex flex-1 min-h-0 bg-(--color-surface) overflow-hidden select-none" data-testid="kelas-skeleton">
      {/* Left Column: Kelas List */}
      <div className="flex flex-col border-r border-(--color-border) w-72 flex-[0_0_288px] min-w-0 bg-(--color-surface)">
        {/* 1. Subheader Row (H: 44px / h-11) */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-(--color-border) px-3.5 bg-(--color-surface)">
          <Skeleton className="h-3.5 w-32 rounded shrink-0" />
          <Skeleton className="h-6.5 w-24 rounded shrink-0" />
        </div>

        {/* 2. Filter Bar (H: 48px / h-12) */}
        <div className="flex h-12 shrink-0 items-center gap-1.75 border-b border-(--color-border) px-3.5 bg-(--color-surface-subtle) text-xs">
          <Skeleton className="h-6.5 flex-1 min-w-0 rounded shrink-0" />
        </div>

        {/* 3. Table Container */}
        <div className="flex flex-1 min-h-0 flex-col">
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col min-h-full w-full">
              {/* Sticky Header */}
              <div className="sticky top-0 z-3 flex h-6.5 shrink-0 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
                <div className="flex-1 min-w-35">NAMA KELAS</div>
                <div className="w-16 shrink-0 text-right">SISWA</div>
              </div>

              {/* Table Rows */}
              <div className="flex flex-col">
                {/* Row 1: Selected */}
                <div className="flex h-8 shrink-0 items-center border-b border-(--color-border-subtle) px-3.5 bg-(--color-brand-subtle) shadow-[inset_3px_0_0_var(--color-brand)]">
                  <div className="flex-1 min-w-35">
                    <Skeleton className="h-3.5 w-24 rounded shrink-0" />
                  </div>
                  <div className="w-16 shrink-0 flex justify-end">
                    <Skeleton className="h-3.5 w-4 rounded shrink-0" />
                  </div>
                </div>

                {/* Rows 2..7 */}
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex h-8 shrink-0 items-center border-b border-(--color-border-subtle) px-3.5 bg-(--color-surface)"
                  >
                    <div className="flex-1 min-w-35">
                      <Skeleton className="h-3.5 w-20 rounded shrink-0" />
                    </div>
                    <div className="w-16 shrink-0 flex justify-end">
                      <Skeleton className="h-3.5 w-4 rounded shrink-0" />
                    </div>
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

      {/* Right Column: Kelas Form Panel */}
      <div className="flex flex-1 min-w-0 min-h-0 flex-col overflow-hidden bg-(--color-surface)">
        {/* Header (H: ~54px) */}
        <div className="flex h-13.5 shrink-0 items-center justify-between border-b border-(--color-border) px-4 bg-(--color-surface)">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded shrink-0" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24 rounded shrink-0" />
              <Skeleton className="h-3 w-32 rounded shrink-0" />
            </div>
          </div>
          <Skeleton className="h-4.5 w-12 rounded-full shrink-0" />
        </div>

        {/* Form Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3 bg-(--color-surface)">
          {/* Field: Nama Kelas */}
          <div className="flex flex-col gap-1 max-w-lg">
            <Skeleton className="h-3 w-28 rounded shrink-0" />
            <Skeleton className="h-7 w-full rounded-sm shrink-0" />
          </div>

          {/* Field: Keterangan */}
          <div className="flex flex-col gap-1 max-w-lg">
            <Skeleton className="h-3 w-20 rounded shrink-0" />
            <Skeleton className="h-7 w-full rounded-sm shrink-0" />
          </div>

          {/* Anggota Section */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-36 rounded shrink-0" />
              <Skeleton className="h-3 w-24 rounded shrink-0" />
            </div>

            {/* Anggota Table */}
            <div className="rounded-sm border border-(--color-border) overflow-hidden">
              <div className="flex h-6.5 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3 text-[10.5px] font-semibold text-(--color-text-muted)">
                <div className="flex-1">NAMA SISWA</div>
                <div className="w-20">STATUS</div>
              </div>
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex h-7.5 items-center border-b border-(--color-border-subtle) px-3 bg-(--color-surface)"
                >
                  <div className="flex-1">
                    <Skeleton className="h-3.5 w-32 rounded shrink-0" />
                  </div>
                  <div className="w-20">
                    <Skeleton className="h-4 w-12 rounded-full shrink-0" />
                  </div>
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
