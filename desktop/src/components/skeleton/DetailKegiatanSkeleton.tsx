import { Skeleton } from '@/components/ui/skeleton';

export function DetailKegiatanSkeleton() {
  return (
    <div
      className="flex-1 min-h-0 flex flex-col bg-white overflow-hidden select-none"
      data-testid="detail-kegiatan-skeleton"
    >
      {/* 1. Header Toolbar (H: 44px / h-11) */}
      <div className="h-11 flex-none border-b border-(--color-border) bg-white flex items-center gap-2.5 px-3.5 z-10">
        <Skeleton className="w-7 h-7 rounded shrink-0" />
        <Skeleton className="h-5 w-56 rounded shrink-0" />
        <Skeleton className="h-5 w-24 rounded-full shrink-0" />

        <div className="flex-1" />

        <Skeleton className="h-6.5 w-16 rounded shrink-0" />
        <Skeleton className="h-6.5 w-28 rounded shrink-0" />
        <Skeleton className="w-7 h-6.5 rounded shrink-0" />
      </div>

      {/* 2. Main Content Frame (Left Panel + Right Sidebar) */}
      <div className="flex-1 min-h-0 flex bg-(--color-surface-alt)">
        {/* Left Scrollable Area */}
        <div className="flex-1 min-w-0 overflow-y-auto p-3 flex flex-col gap-3">
          {/* Card 1: RENCANA */}
          <div className="rounded-lg border border-(--color-border) bg-white overflow-hidden shadow-xs">
            <div className="h-6.5 px-3 bg-(--color-surface-alt) border-b border-(--color-border-subtle) flex items-center">
              <Skeleton className="h-3 w-16 rounded shrink-0" />
            </div>
            <div className="p-3 flex gap-4">
              {/* Kolom Kiri */}
              <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                <div className="flex gap-2.5">
                  <Skeleton className="w-16 h-3.5 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-48 rounded shrink-0" />
                </div>
                <div className="flex gap-2.5">
                  <Skeleton className="w-16 h-3.5 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-36 rounded shrink-0" />
                </div>
                <div className="flex gap-2.5">
                  <Skeleton className="w-16 h-3.5 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-28 rounded shrink-0" />
                </div>
                <div className="flex gap-2.5">
                  <Skeleton className="w-16 h-3.5 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-40 rounded shrink-0" />
                </div>
              </div>
              {/* Kolom Kanan */}
              <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                <div className="flex gap-2.5">
                  <Skeleton className="w-16 h-3.5 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-24 rounded shrink-0" />
                </div>
                <div className="flex gap-2.5">
                  <Skeleton className="w-16 h-3.5 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-44 rounded shrink-0" />
                </div>
                <div className="flex gap-2.5">
                  <Skeleton className="w-16 h-3.5 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-32 rounded shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: REALISASI */}
          <div className="rounded-lg border border-(--color-border) bg-white overflow-hidden shadow-xs">
            <div className="h-6.5 px-3 bg-(--color-surface-alt) border-b border-(--color-border-subtle) flex items-center">
              <Skeleton className="h-3 w-20 rounded shrink-0" />
            </div>
            <div className="p-3 flex gap-4">
              <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                <div className="flex gap-2.5">
                  <Skeleton className="w-16 h-3.5 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-40 rounded shrink-0" />
                </div>
                <div className="flex gap-2.5">
                  <Skeleton className="w-16 h-3.5 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-48 rounded shrink-0" />
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                <div className="flex gap-2.5">
                  <Skeleton className="w-16 h-3.5 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-36 rounded shrink-0" />
                </div>
                <div className="flex gap-2.5">
                  <Skeleton className="w-16 h-3.5 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-28 rounded shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: SISWA PESERTA & HASIL */}
          <div className="rounded-lg border border-(--color-border) bg-white overflow-hidden shadow-xs">
            <div className="h-6.5 px-3 bg-(--color-surface-alt) border-b border-(--color-border-subtle) flex items-center justify-between">
              <Skeleton className="h-3 w-40 rounded shrink-0" />
              <Skeleton className="h-3 w-20 rounded shrink-0" />
            </div>
            {/* Table Header */}
            <div className="flex items-center h-6 px-3 border-b border-(--color-border-subtle) bg-white text-[11px]">
              <span className="flex-1 min-w-0">
                <Skeleton className="h-2.5 w-12 rounded shrink-0" />
              </span>
              <span className="w-16 flex-none">
                <Skeleton className="h-2.5 w-10 rounded shrink-0" />
              </span>
              <span className="w-23 flex-none">
                <Skeleton className="h-2.5 w-14 rounded shrink-0" />
              </span>
              <span className="w-58 flex-none">
                <Skeleton className="h-2.5 w-12 rounded shrink-0" />
              </span>
            </div>
            {/* Table Rows */}
            <div className="flex flex-col">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center h-8 px-3 border-b border-(--color-border-subtle) last:border-b-0"
                >
                  <span className="flex-1 min-w-0">
                    <Skeleton
                      className={`h-3.5 rounded shrink-0 ${
                        idx === 0 ? 'w-32' : idx === 1 ? 'w-40' : idx === 2 ? 'w-28' : 'w-36'
                      }`}
                    />
                  </span>
                  <span className="w-16 flex-none">
                    <Skeleton className="h-3.5 w-8 rounded shrink-0" />
                  </span>
                  <span className="w-23 flex-none">
                    <Skeleton className="h-4.5 w-16 rounded-full shrink-0" />
                  </span>
                  <span className="w-58 flex-none">
                    <Skeleton className="h-3 w-32 rounded shrink-0" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar (330px) */}
        <div className="w-82.5 flex-none border-l border-(--color-border) bg-white overflow-y-auto p-3 flex flex-col gap-3">
          {/* Section 1: RIWAYAT KEGIATAN */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-28 rounded shrink-0 mb-1" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-2.5">
                <Skeleton className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" />
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <Skeleton className="h-3.5 w-32 rounded shrink-0" />
                  <Skeleton className="h-2.5 w-44 rounded shrink-0" />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-(--color-border-subtle) pt-2 flex flex-col gap-2">
            {/* Section 2: KEGIATAN TERKAIT */}
            <Skeleton className="h-3 w-28 rounded shrink-0 mb-1" />
            <Skeleton className="h-14 w-full rounded-md shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
