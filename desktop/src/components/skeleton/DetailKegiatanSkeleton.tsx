import { Skeleton } from '@/components/ui/skeleton';

export function DetailKegiatanSkeleton() {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white overflow-hidden select-none">
      {/* 1. Header Toolbar (H: 44px / h-11) */}
      <div className="h-11 flex-none border-b border-(--color-border) bg-white flex items-center gap-2.5 px-3.5 z-10">
        <Skeleton className="w-7 h-7 rounded-md" />
        <Skeleton className="h-5 w-60 rounded-md" />
        <Skeleton className="h-5 w-24 rounded-(--radius-pill)" />

        <div className="flex-1" />

        <Skeleton className="h-6.5 w-16 rounded-md" />
        <Skeleton className="h-6.5 w-28 rounded-md" />
        <Skeleton className="w-6.5 h-6.5 rounded-md" />
      </div>

      {/* 2. Main Body: 2 Columns */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 px-5 bg-(--color-canvas)">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-6xl mx-auto">
          {/* Left Column: Informasi Rencana & Realisasi (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Card 1: Rencana Kegiatan */}
            <div className="border border-(--color-border) rounded-lg bg-white p-4 flex flex-col gap-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-(--color-border-subtle)">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3.5 w-20" />
              </div>

              {/* Rows */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-52" />
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3.5 w-3/4" />
                </div>
              </div>
            </div>

            {/* Card 2: Realisasi */}
            <div className="border border-(--color-border) rounded-lg bg-white p-4 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-(--color-border-subtle)">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4.5 w-24 rounded-(--radius-pill)" />
              </div>
              <Skeleton className="h-14 w-full rounded-md" />
            </div>
          </div>

          {/* Right Column: Peserta Siswa (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="border border-(--color-border) rounded-lg bg-white p-4 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-(--color-border-subtle)">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3.5 w-16" />
              </div>

              {/* Student Row Skeletons */}
              <div className="flex flex-col divide-y divide-(--color-border-subtle)">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-2.5 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-4.5 w-16 rounded-(--radius-pill)" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
