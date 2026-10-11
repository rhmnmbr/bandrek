import { Skeleton } from '@/components/ui/skeleton';

export function RealisasiSkeleton() {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white overflow-hidden select-none">
      {/* 1. Header Toolbar (H: 44px / h-11) */}
      <div className="h-11 flex-none border-b border-(--color-border) bg-white flex items-center gap-2.5 px-3.5 z-10">
        <Skeleton className="w-7 h-7 rounded-md" />
        <Skeleton className="h-5 w-36 rounded-md" />
        <Skeleton className="h-5 w-28 rounded-(--radius-pill)" />

        <div className="flex-1" />

        <Skeleton className="h-5 w-36 rounded-md" />
        <Skeleton className="h-6.5 w-24 rounded-md" />
        <Skeleton className="h-6.5 w-32 rounded-md" />
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 px-5 bg-(--color-canvas)">
        <div className="flex flex-col gap-4 max-w-6xl mx-auto">
          {/* Top Context Banner */}
          <div className="border border-(--color-border) rounded-lg bg-white p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-md" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-(--radius-pill)" />
              <Skeleton className="h-6 w-20 rounded-(--radius-pill)" />
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Form Aktual (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="border border-(--color-border) rounded-lg bg-white p-4 flex flex-col gap-4 shadow-xs">
                <div className="pb-2 border-b border-(--color-border-subtle)">
                  <Skeleton className="h-4 w-40" />
                </div>

                {/* Jam Mulai & Selesai */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-7 w-full rounded-md" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-7 w-full rounded-md" />
                  </div>
                </div>

                {/* Materi Selector */}
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-7 w-full rounded-md" />
                </div>

                {/* Ketuntasan Segmented Control */}
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-full rounded-md" />
                </div>

                {/* Catatan Area */}
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-16 w-full rounded-md" />
                </div>
              </div>
            </div>

            {/* Right Column: Kehadiran Siswa & Subjek (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="border border-(--color-border) rounded-lg bg-white p-4 flex flex-col gap-3.5 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-(--color-border-subtle)">
                  <Skeleton className="h-4 w-36" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-(--radius-pill)" />
                    <Skeleton className="h-5 w-20 rounded-(--radius-pill)" />
                  </div>
                </div>

                {/* Attendance Rows */}
                <div className="flex flex-col divide-y divide-(--color-border-subtle)">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-3.5 w-32" />
                          <Skeleton className="h-2.5 w-18" />
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Skeleton className="h-6.5 w-12 rounded-md" />
                        <Skeleton className="h-6.5 w-12 rounded-md" />
                        <Skeleton className="h-6.5 w-12 rounded-md" />
                        <Skeleton className="h-6.5 w-12 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
