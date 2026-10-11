import { Skeleton } from '@/components/ui/skeleton';

export function KalenderSkeleton() {
  return (
    <div className="flex flex-1 min-h-0 bg-white overflow-hidden select-none">
      {/* 1. Left Sidebar Skeleton (W: 260px) */}
      <div className="w-65 shrink-0 border-r border-(--color-border) bg-(--color-surface-alt) flex flex-col p-3 gap-4 overflow-hidden">
        {/* Create Button */}
        <Skeleton className="h-8 w-full rounded-md" />

        {/* Mini Month Calendar Skeleton */}
        <div className="border border-(--color-border) rounded-md bg-white p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-1">
            <Skeleton className="h-3.5 w-24" />
            <div className="flex gap-1">
              <Skeleton className="w-5 h-5 rounded-sm" />
              <Skeleton className="w-5 h-5 rounded-sm" />
            </div>
          </div>
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: 7 }).map((_, idx) => (
              <Skeleton key={idx} className="h-2.5 w-full" />
            ))}
          </div>
          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, idx) => (
              <Skeleton key={idx} className="h-5 w-full rounded-sm" />
            ))}
          </div>
        </div>

        {/* Filters Group Skeleton */}
        <div className="flex flex-col gap-2.5 flex-1">
          <Skeleton className="h-3 w-28" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Skeleton className="w-3.5 h-3.5 rounded-sm" />
                <Skeleton className="h-3 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Calendar Grid Area */}
      <div className="flex flex-1 flex-col min-w-0 bg-white overflow-hidden">
        {/* Top Calendar Toolbar */}
        <div className="h-11 shrink-0 border-b border-(--color-border) bg-white px-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-6.5 w-28 rounded-md" />
            <Skeleton className="h-6.5 w-20 rounded-md" />
            <Skeleton className="h-5 w-44" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6.5 w-36 rounded-md" />
            <Skeleton className="h-6.5 w-24 rounded-md" />
          </div>
        </div>

        {/* Day Column Headers (Senin – Minggu) */}
        <div className="h-8 shrink-0 border-b border-(--color-border) bg-(--color-surface-alt) flex items-center divide-x divide-(--color-border-subtle)">
          <div className="w-14 shrink-0" />
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="flex-1 px-2 flex items-center justify-between">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-5" />
            </div>
          ))}
        </div>

        {/* Time Grid with Event Blocks */}
        <div className="flex-1 min-h-0 overflow-hidden relative flex">
          {/* Time Labels */}
          <div className="w-14 shrink-0 border-r border-(--color-border-subtle) flex flex-col divide-y divide-(--color-border-subtle) bg-(--color-surface-alt)">
            {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
              <div key={time} className="h-12 px-2 pt-1">
                <span className="text-[10px] text-(--color-text-muted) font-mono">{time}</span>
              </div>
            ))}
          </div>

          {/* Grid Columns */}
          <div className="flex-1 flex divide-x divide-(--color-border-subtle) relative">
            {Array.from({ length: 7 }).map((_, colIdx) => (
              <div key={colIdx} className="flex-1 flex flex-col divide-y divide-(--color-border-subtle) relative p-1.5">
                {colIdx % 2 === 0 && (
                  <Skeleton
                    className={`rounded-md p-2 mb-2 ${
                      colIdx === 0
                        ? 'h-24 mt-4 w-full'
                        : colIdx === 2
                        ? 'h-16 mt-14 w-full'
                        : 'h-20 mt-8 w-full'
                    }`}
                  />
                )}
                {colIdx % 3 === 1 && (
                  <Skeleton className="h-18 mt-20 w-full rounded-md p-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
