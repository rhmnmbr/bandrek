import { Skeleton } from '@/components/ui/skeleton';

export function SubjekSkeleton() {
  return (
    <div className="flex flex-1 min-h-0 bg-(--color-surface) overflow-hidden select-none" data-testid="subjek-skeleton">
      <div className="flex flex-1 min-w-0 flex-col">
        {/* 1. Top Meta Bar (H: 44px / h-11) */}
        <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-(--color-border) px-3.5 bg-(--color-surface)">
          {/* Active / Inactive counter */}
          <Skeleton className="h-3.5 w-32 rounded shrink-0" />
          <div className="flex-1" />
          {/* Subjek baru Button */}
          <Skeleton className="h-6.5 w-26 rounded shrink-0" />
        </div>

        {/* 2. Filter Bar (H: 48px / h-12) */}
        <div className="flex h-12 shrink-0 items-center gap-1.75 border-b border-(--color-border) px-3.5 bg-(--color-surface-subtle) text-xs">
          {/* Cari input */}
          <Skeleton className="h-6.5 w-52 rounded shrink-0" />

          {/* Status dropdown */}
          <Skeleton className="h-6.5 w-24 rounded shrink-0" />
        </div>

        {/* 3. Table Container */}
        <div className="flex flex-1 min-h-0 flex-col">
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col min-h-full min-w-[718px] w-full">
              {/* Sticky Header */}
              <div className="sticky top-0 z-3 flex h-6.5 shrink-0 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
                <div className="w-[210px] shrink-0">NAMA LENGKAP</div>
                <div className="w-[92px] shrink-0">KELAMIN</div>
                <div className="flex-1 min-w-[120px]">MATA PELAJARAN</div>
                <div className="w-[126px] shrink-0">KONTAK</div>
                <div className="w-[74px] shrink-0 text-right">KEGIATAN</div>
                <div className="w-[78px] shrink-0 pl-2">STATUS</div>
              </div>

              {/* Table Rows */}
              <div className="flex flex-col">
                {Array.from({ length: 14 }).map((_, rIdx) => (
                  <div
                    key={rIdx}
                    className="flex h-8 shrink-0 items-center border-b border-(--color-border-subtle) px-3.5 bg-(--color-surface) text-[12.5px]"
                  >
                    {/* Nama */}
                    <div className="w-[210px] shrink-0 pr-2">
                      <Skeleton
                        className={`h-3.5 rounded shrink-0 ${
                          rIdx % 4 === 0
                            ? 'w-40'
                            : rIdx % 3 === 0
                            ? 'w-32'
                            : rIdx % 2 === 0
                            ? 'w-44'
                            : 'w-36'
                        }`}
                      />
                    </div>

                    {/* Kelamin */}
                    <div className="w-[92px] shrink-0 pr-2">
                      <Skeleton className="h-3.5 w-14 rounded shrink-0" />
                    </div>

                    {/* Mapel */}
                    <div className="flex-1 min-w-[120px] pr-2">
                      <Skeleton
                        className={`h-3.5 rounded shrink-0 ${
                          rIdx % 3 === 0
                            ? 'w-3/5'
                            : rIdx % 2 === 0
                            ? 'w-4/5'
                            : 'w-1/2'
                        }`}
                      />
                    </div>

                    {/* Kontak */}
                    <div className="w-[126px] shrink-0 pr-2">
                      <Skeleton className="h-3.5 w-24 rounded shrink-0" />
                    </div>

                    {/* Kegiatan */}
                    <div className="w-[74px] shrink-0 pr-1 flex justify-end">
                      <Skeleton className="h-3.5 w-6 rounded shrink-0" />
                    </div>

                    {/* Status Pill */}
                    <div className="w-[78px] shrink-0 pl-2">
                      <Skeleton className="h-4.5 w-14 rounded-full shrink-0" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-1 min-h-0" />
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex h-7.5 shrink-0 items-center border-t border-(--color-border) bg-(--color-surface-alt) px-3.5">
            <Skeleton className="h-3 w-52 rounded shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
