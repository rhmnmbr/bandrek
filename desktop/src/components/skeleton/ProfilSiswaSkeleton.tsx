import { Skeleton } from '@/components/ui/skeleton';

export function ProfilSiswaSkeleton() {
  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-y-auto bg-(--color-surface) p-4 px-5.5 pb-8 gap-4 select-none">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between pb-3 border-b border-(--color-border)">
        <div className="flex items-center gap-3">
          <Skeleton className="w-7 h-7 rounded-md" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-20 rounded-(--radius-pill)" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6.5 w-20 rounded-md" />
          <Skeleton className="h-6.5 w-36 rounded-md" />
        </div>
      </div>

      {/* 2. Profil Info Card */}
      <div className="border border-(--color-border) rounded-lg bg-(--color-surface) p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-full shrink-0" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-32" />
            <div className="flex gap-2 mt-1">
              <Skeleton className="h-4 w-20 rounded-(--radius-pill)" />
              <Skeleton className="h-4 w-28 rounded-(--radius-pill)" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3.5 w-32" />
        </div>
      </div>

      {/* 3. KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="border border-(--color-border) rounded-md bg-(--color-surface) p-3 flex flex-col gap-1.5 shadow-xs"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-2.5 w-32" />
          </div>
        ))}
      </div>

      {/* 4. Riwayat Kegiatan Section Skeleton */}
      <div className="border border-(--color-border) rounded-lg bg-(--color-surface) p-4 flex flex-col gap-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-(--color-border-subtle)">
          <Skeleton className="h-4 w-36" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-6 w-32 rounded-md" />
          </div>
        </div>

        {/* History Rows */}
        <div className="flex flex-col divide-y divide-(--color-border-subtle)">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-40" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-(--radius-pill)" />
                <Skeleton className="h-5 w-16 rounded-(--radius-pill)" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
