import { Skeleton } from '@/components/ui/skeleton';

export function JenisKegiatanSkeleton() {
  return (
    <div className="flex h-full w-full flex-row overflow-hidden bg-(--color-surface) select-none" data-testid="jenis-skeleton">
      {/* Left Column (flex-1 wide table) */}
      <div className="flex flex-1 min-w-0 min-h-0 flex-col border-r border-(--color-border) bg-(--color-surface)">
        {/* Top Meta Bar (H: 44px / h-11) */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-(--color-border) px-3.5 bg-(--color-surface)">
          <Skeleton className="h-3.5 w-28 rounded shrink-0" />
          <Skeleton className="h-6.5 w-24 rounded shrink-0" />
        </div>

        {/* Filter Bar (H: 48px / h-12) */}
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-xs">
          <Skeleton className="h-6.5 flex-1 min-w-0 max-w-[280px] rounded shrink-0" />
        </div>

        {/* Table Container */}
        <div className="flex flex-1 min-h-0 flex-col">
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col min-h-full w-full">
              {/* Sticky Header (H: 26px / h-6.5) */}
              <div className="sticky top-0 z-3 flex h-6.5 shrink-0 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
                <div className="flex-1 min-w-[140px]">JENIS KEGIATAN</div>
                <div className="w-[104px] shrink-0">MATERI</div>
                <div className="w-[100px] shrink-0">SISWA</div>
                <div className="w-[84px] shrink-0 text-right">KEGIATAN</div>
              </div>

              {/* Table Rows (H: 36px) */}
              <div className="flex flex-col">
                {/* Row 1: Selected state */}
                <div className="flex h-9 shrink-0 items-center border-b border-(--color-border-subtle) px-3.5 bg-(--color-brand-subtle) shadow-[inset_3px_0_0_var(--color-brand)]">
                  <div className="flex-1 min-w-[140px] flex items-center gap-2">
                    <Skeleton className="size-2.5 rounded-full shrink-0" />
                    <Skeleton className="h-3.5 w-28 rounded shrink-0" />
                  </div>
                  <div className="w-[104px] shrink-0">
                    <Skeleton className="h-3.5 w-12 rounded shrink-0" />
                  </div>
                  <div className="w-[100px] shrink-0">
                    <Skeleton className="h-3.5 w-12 rounded shrink-0" />
                  </div>
                  <div className="w-[84px] shrink-0 flex justify-end">
                    <Skeleton className="h-3.5 w-6 rounded shrink-0" />
                  </div>
                </div>

                {/* Rows 2..5 */}
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex h-9 shrink-0 items-center border-b border-(--color-border-subtle) px-3.5 bg-(--color-surface)"
                  >
                    <div className="flex-1 min-w-[140px] flex items-center gap-2">
                      <Skeleton className="size-2.5 rounded-full shrink-0" />
                      <Skeleton
                        className={`h-3.5 rounded shrink-0 ${
                          idx === 0 ? 'w-20' : idx === 1 ? 'w-32' : idx === 2 ? 'w-24' : 'w-16'
                        }`}
                      />
                    </div>
                    <div className="w-[104px] shrink-0">
                      <Skeleton className="h-3.5 w-12 rounded shrink-0" />
                    </div>
                    <div className="w-[100px] shrink-0">
                      <Skeleton className="h-3.5 w-12 rounded shrink-0" />
                    </div>
                    <div className="w-[84px] shrink-0 flex justify-end">
                      <Skeleton className="h-3.5 w-6 rounded shrink-0" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-1 min-h-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: 352px sidebar form panel */}
      <div className="flex w-[352px] flex-[0_0_352px] min-w-0 min-h-0 flex-col overflow-hidden bg-(--color-surface-alt)">
        {/* Panel Header (H: 52px / h-13) */}
        <div className="flex h-13 shrink-0 items-center gap-2.5 border-b border-(--color-border) bg-(--color-surface) px-3.5">
          <Skeleton className="size-8 rounded-md shrink-0" />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <Skeleton className="h-4 w-28 rounded shrink-0" />
            <Skeleton className="h-3 w-36 rounded shrink-0" />
          </div>
        </div>

        {/* Panel Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-3">
          {/* Nama Jenis */}
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-20 rounded shrink-0" />
            <Skeleton className="h-7 w-full rounded-sm shrink-0" />
          </div>

          {/* Warna di Kalender */}
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-28 rounded shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-6.5 w-18 rounded-full shrink-0" />
              ))}
            </div>
            <Skeleton className="h-3 w-48 rounded shrink-0 mt-0.5" />
          </div>

          {/* Switch 1: Wajib materi */}
          <div className="rounded-md border border-(--color-border) bg-(--color-surface) p-2.5 flex items-start gap-2">
            <Skeleton className="mt-0.5 size-3.5 rounded-xs shrink-0" />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <Skeleton className="h-3.5 w-44 rounded shrink-0" />
              <Skeleton className="h-3 w-56 rounded shrink-0" />
            </div>
          </div>

          {/* Switch 2: Wajib siswa */}
          <div className="rounded-md border border-(--color-border) bg-(--color-surface) p-2.5 flex items-start gap-2">
            <Skeleton className="mt-0.5 size-3.5 rounded-xs shrink-0" />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <Skeleton className="h-3.5 w-36 rounded shrink-0" />
              <Skeleton className="h-3 w-48 rounded shrink-0" />
            </div>
          </div>

          {/* Ringkasan */}
          <div className="rounded-md border border-(--color-border) bg-(--color-surface) p-2.5 flex flex-col gap-1">
            <Skeleton className="h-3 w-20 rounded shrink-0" />
            <Skeleton className="h-3.5 w-full rounded shrink-0" />
          </div>
        </div>

        {/* Bottom Actions Bar (H: 48px / h-12) */}
        <div className="flex h-12 shrink-0 items-center justify-between border-t border-(--color-border) bg-(--color-surface) px-3.5">
          <Skeleton className="h-6.5 w-16 rounded shrink-0" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6.5 w-14 rounded shrink-0" />
            <Skeleton className="h-6.5 w-16 rounded shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
