import { Skeleton } from '@/components/ui/skeleton';

export function MatriksSkeleton() {
  return (
    <div className="flex flex-1 flex-col h-full bg-white overflow-hidden select-none">
      {/* 1. Matriks Toolbar Skeleton */}
      <div className="h-10 shrink-0 border-b border-(--color-border) bg-white px-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-6.5 w-36 rounded-md" />
          <Skeleton className="h-6.5 w-28 rounded-md" />
          <Skeleton className="h-6.5 w-32 rounded-md" />
          <Skeleton className="h-6.5 w-40 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6.5 w-24 rounded-md" />
        </div>
      </div>

      {/* 2. 4 Summary Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 border-b border-(--color-border) bg-(--color-canvas)">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="border border-(--color-border) rounded-md bg-white p-3 flex flex-col gap-1.5 shadow-xs"
          >
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-2.5 w-36" />
          </div>
        ))}
      </div>

      {/* 3. Matriks Grid Table Skeleton */}
      <div className="flex-1 min-h-0 overflow-auto bg-white">
        <div className="flex flex-col min-w-[800px]">
          {/* Header Row: Student name header + Materi column headers */}
          <div className="sticky top-0 z-10 flex border-b border-(--color-border) bg-(--color-surface-alt) text-[10.5px]">
            <div className="w-48 shrink-0 p-2.5 border-r border-(--color-border)">
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex-1 flex overflow-hidden divide-x divide-(--color-border-subtle)">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="w-20 shrink-0 p-2 flex flex-col gap-1 items-center">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-2 w-8" />
                </div>
              ))}
            </div>
          </div>

          {/* Matrix Rows: Student Name + Cell Blocks */}
          {Array.from({ length: 12 }).map((_, rIdx) => (
            <div
              key={rIdx}
              className="flex border-b border-(--color-border-subtle) hover:bg-(--color-surface-alt) h-7 shrink-0 items-center"
            >
              <div className="w-48 shrink-0 px-3 flex items-center gap-2 border-r border-(--color-border)">
                <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                <Skeleton className="h-3.5 w-28" />
              </div>
              <div className="flex-1 flex divide-x divide-(--color-border-subtle) h-full items-center">
                {Array.from({ length: 8 }).map((_, cIdx) => (
                  <div key={cIdx} className="w-20 shrink-0 flex items-center justify-center px-1">
                    <Skeleton
                      className={`h-5 w-16 rounded-sm ${
                        (rIdx + cIdx) % 4 === 0
                          ? 'opacity-85'
                          : (rIdx + cIdx) % 3 === 0
                          ? 'opacity-65'
                          : 'opacity-40'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Bottom Legend Bar Skeleton */}
      <div className="h-8 shrink-0 border-t border-(--color-border) bg-(--color-surface-alt) px-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}
