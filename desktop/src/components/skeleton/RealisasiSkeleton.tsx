import { Skeleton } from '@/components/ui/skeleton';

export function RealisasiSkeleton() {
  return (
    <div
      className="h-full w-full flex-1 min-h-0 flex flex-col bg-white overflow-hidden select-none"
      data-testid="realisasi-skeleton"
    >
      {/* 1. Header Toolbar (H: 44px / h-11) */}
      <div className="h-11 flex-none border-b border-(--color-border) bg-white flex items-center gap-2.5 px-3.5 z-10">
        <Skeleton className="w-7 h-7 rounded shrink-0" />
        <Skeleton className="h-5 w-32 rounded shrink-0" />
        <Skeleton className="h-5 w-24 rounded-full shrink-0" />

        <div className="flex-1" />

        <Skeleton className="h-6.5 w-24 rounded shrink-0" />
        <Skeleton className="h-6.5 w-36 rounded shrink-0" />
      </div>

      {/* 2. Main Content (Two Columns Layout) */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left Column (flex-1) */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-y-auto">
          {/* Rencana Kegiatan Context Bar */}
          <div className="flex-none mx-3.5 mt-3.25 border border-(--color-border) rounded-lg bg-(--color-surface-alt) p-2.5 px-3 flex items-center gap-3.5">
            <div className="flex-none max-w-[65%] flex flex-col gap-1">
              <Skeleton className="h-4 w-48 rounded shrink-0" />
              <Skeleton className="h-3 w-64 rounded shrink-0" />
            </div>
            <div className="w-px h-7.5 flex-none bg-(--color-border)" />
            <div className="flex-none flex flex-col gap-1">
              <Skeleton className="h-2.5 w-24 rounded shrink-0" />
              <Skeleton className="h-3.5 w-40 rounded shrink-0" />
            </div>
          </div>

          {/* Form Realisasi Waktu & Materi */}
          <div className="flex-none mx-3.5 mt-3 border border-(--color-border) rounded-lg bg-white p-3 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-20 rounded shrink-0" />
                <Skeleton className="h-7 w-full rounded shrink-0" />
              </div>
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-20 rounded shrink-0" />
                <Skeleton className="h-7 w-full rounded shrink-0" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-28 rounded shrink-0" />
              <Skeleton className="h-7 w-full rounded shrink-0" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-24 rounded shrink-0" />
              <Skeleton className="h-7 w-64 rounded shrink-0" />
            </div>
          </div>

          {/* Combined Kehadiran Container (Subjek & Siswa) */}
          <div className="flex-1 min-h-0 mx-3.5 my-3.5 border border-(--color-border) rounded-lg flex flex-col overflow-hidden bg-white">
            {/* Header bar */}
            <div className="flex-none h-9 px-3 bg-(--color-surface-alt) border-b border-(--color-border) flex items-center justify-between">
              <Skeleton className="h-3 w-44 rounded shrink-0" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-28 rounded shrink-0" />
                <Skeleton className="h-6 w-16 rounded shrink-0" />
              </div>
            </div>

            {/* Sticky Table Header */}
            <div className="flex-none h-6 px-3 bg-white border-b border-[#EDEBE9] flex items-center">
              <div className="w-6 flex-none">
                <Skeleton className="h-2.5 w-3 rounded shrink-0" />
              </div>
              <div className="flex-1 min-w-0">
                <Skeleton className="h-2.5 w-16 rounded shrink-0" />
              </div>
              <div className="w-17.5 flex-none">
                <Skeleton className="h-2.5 w-12 rounded shrink-0" />
              </div>
              <div className="w-53 flex-none">
                <Skeleton className="h-2.5 w-20 rounded shrink-0" />
              </div>
              <div className="w-72.5 flex-none">
                <Skeleton className="h-2.5 w-20 rounded shrink-0" />
              </div>
            </div>

            {/* Rows */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-8.5 px-3 border-b border-[#EDEBE9] flex items-center"
                >
                  <div className="w-6 flex-none">
                    <Skeleton className="h-3 w-3 rounded shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <Skeleton
                      className={`h-3.5 rounded shrink-0 ${
                        idx % 2 === 0 ? 'w-36' : 'w-28'
                      }`}
                    />
                  </div>
                  <div className="w-17.5 flex-none">
                    <Skeleton className="h-3.5 w-12 rounded shrink-0" />
                  </div>
                  <div className="w-53 flex-none">
                    <Skeleton className="h-6 w-48 rounded shrink-0" />
                  </div>
                  <div className="w-72.5 flex-none">
                    <Skeleton className="h-6.5 w-48 rounded shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar (310px fixed width / w-77.5) */}
        <div className="w-77.5 flex-none border-l border-(--color-border) bg-(--color-surface-alt) p-3.5 flex flex-col gap-3 overflow-y-auto select-none">
          {/* Catatan Kegiatan */}
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-28 rounded shrink-0" />
            <Skeleton className="h-24 w-full rounded shrink-0" />
          </div>

          {/* Status Box */}
          <div className="rounded-lg border border-(--color-border) bg-white p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-full shrink-0" />
              <Skeleton className="h-3.5 w-24 rounded shrink-0" />
            </div>
            <Skeleton className="h-10 w-full rounded shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
