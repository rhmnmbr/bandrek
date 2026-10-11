import { Skeleton } from '@/components/ui/skeleton';
import { JAM_AWAL, JAM_AKHIR, SLOT_PX } from '@/lib/dateUtils';

const SKELETON_SLOTS: Record<number, Array<{ startHour: number; durationHours: number }>> = {
  0: [{ startHour: 15, durationHours: 1.5 }],
  1: [{ startHour: 16, durationHours: 1.5 }],
  2: [
    { startHour: 8, durationHours: 1.5 },
    { startHour: 13, durationHours: 2 },
  ],
  3: [
    { startHour: 8, durationHours: 1.5 },
    { startHour: 13, durationHours: 2 },
  ],
  4: [{ startHour: 8, durationHours: 2 }],
  5: [
    { startHour: 7, durationHours: 2 },
    { startHour: 9, durationHours: 2 },
  ],
};

export function KalenderSkeleton() {
  const slotPx = SLOT_PX; // 48px
  const hourMarks = [];
  for (let h = JAM_AWAL; h <= JAM_AKHIR; h++) {
    hourMarks.push({
      hour: h,
      top: (h - JAM_AWAL) * slotPx - 6,
    });
  }

  const nowMin = 11 * 60 + 39;
  const nowTop = Math.round(((nowMin - JAM_AWAL * 60) / 60) * slotPx);
  const nowBadgeTop = nowTop - 8;

  return (
    <div className="flex flex-1 min-h-0 bg-white overflow-hidden select-none">
      {/* 1. Left Sidebar Skeleton (Exact match: w-53, p-2.5) */}
      <aside className="w-53 flex-none flex flex-col border-r border-(--color-border) bg-(--color-surface-alt) p-2.5 overflow-y-auto select-none">
        {/* Mini Calendar Header Skeleton */}
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <Skeleton className="w-5.5 h-5.5 rounded" />
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="w-5.5 h-5.5 rounded" />
        </div>

        {/* Days of Week Header Skeleton */}
        <div className="grid grid-cols-7 gap-px mb-0.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex justify-center py-0.5">
              <Skeleton className="h-2.5 w-3 rounded-xs" />
            </div>
          ))}
        </div>

        {/* 42-day Mini Calendar Grid Skeleton */}
        <div className="grid grid-cols-7 gap-px mb-4">
          {Array.from({ length: 42 }).map((_, idx) => (
            <div key={idx} className="h-5.5 flex items-center justify-center">
              <Skeleton
                className={`h-4.5 w-4.5 ${
                  idx === 16 ? 'rounded-full' : 'rounded-xs'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Filter Title Skeleton */}
        <Skeleton className="h-3 w-12 rounded mb-1.5" />

        {/* 5 Filter Dropdown Skeletons */}
        <div className="flex flex-col gap-1.5 mb-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-6.5 w-full rounded" />
          ))}
        </div>

        {/* Status Kegiatan Title Skeleton */}
        <Skeleton className="h-3 w-28 rounded mb-1.5" />

        {/* 5 Status Checkbox Rows Skeletons */}
        <div className="flex flex-col gap-0.5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-1.75 px-1 py-0.5 h-6">
              <Skeleton className="w-3.5 h-3.5 rounded-xs" />
              <Skeleton className="w-4 h-4 rounded-[3px]" />
              <Skeleton className="h-3.5 flex-1 rounded" />
            </div>
          ))}
        </div>

        {/* Reset Filters Action Button Skeleton */}
        <div className="pt-2.5 mt-2.5 border-t border-(--color-border)">
          <Skeleton className="w-full h-6.5 rounded" />
        </div>
      </aside>

      {/* 2. Main Calendar Content Area */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden bg-white">
        {/* Top Calendar Toolbar Skeleton */}
        <div className="flex h-11 flex-none items-center gap-2 border-b border-(--color-border) bg-white px-3 select-none">
          {/* "Hari ini" button skeleton */}
          <Skeleton className="h-6.5 w-17 rounded" />

          {/* Navigation Chevrons skeleton */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-6.5 w-6.5 rounded" />
            <Skeleton className="h-6.5 w-6.5 rounded" />
          </div>

          {/* Date range label skeleton */}
          <Skeleton className="h-4.5 w-32 rounded ml-1 mr-2" />

          {/* Right Toolbar area skeleton */}
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-3.5 w-44 rounded mr-1" />
            <Skeleton className="h-6.5 w-56 rounded" />
          </div>
        </div>

        {/* Day Column Headers Skeleton (SEN .. MIN) */}
        <div className="flex border-b border-(--color-border) bg-[#FAFAFA] flex-none">
          <div className="w-14 flex-none" />
          {Array.from({ length: 7 }).map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 min-w-0 h-7.5 flex items-center justify-center gap-1.5 border-l border-[#EDEBE9] ${
                idx === 2 ? 'bg-[#EBF3FC]' : idx >= 5 ? 'bg-[#FAFAFA]' : 'bg-transparent'
              }`}
            >
              <Skeleton className="h-3 w-7 rounded" />
              <Skeleton className="h-4.5 w-5.5 rounded-full" />
            </div>
          ))}
        </div>

        {/* Scrollable Time Grid Skeleton */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative">
          <div className="flex relative pt-2 pb-2 min-h-full">
            {/* Left Hour Scale Skeleton */}
            <div className="w-14 flex-none relative bg-white">
              {hourMarks.map((hm) => (
                <div
                  key={`hm-${hm.hour}`}
                  style={{ top: `${hm.top}px` }}
                  className="absolute right-2"
                >
                  <Skeleton className="h-2.5 w-8 rounded-xs" />
                </div>
              ))}
              <div
                style={{ top: `${nowBadgeTop}px` }}
                className="absolute right-1"
              >
                <Skeleton className="h-3.5 w-8 rounded-xs" />
              </div>
            </div>

            {/* 7 Grid Columns Skeleton */}
            <div className="flex-1 min-w-0 flex relative">
              {Array.from({ length: 7 }).map((_, colIdx) => {
                const skSlots = SKELETON_SLOTS[colIdx] || [];
                return (
                  <div
                    key={colIdx}
                    className={`flex-1 min-w-0 relative border-l border-[#EDEBE9] ${
                      colIdx === 2
                        ? 'bg-[rgba(235,243,252,.35)]'
                        : colIdx >= 5
                        ? 'bg-[#FAFAFA]'
                        : 'bg-white'
                    }`}
                  >
                    {/* Hourly slot lines */}
                    {Array.from({ length: JAM_AKHIR - JAM_AWAL }).map((_, slotIdx) => (
                      <div
                        key={slotIdx}
                        style={{ height: `${slotPx}px` }}
                        className="border-b border-[#EDEBE9] relative"
                      />
                    ))}

                    {/* Skeleton Event Blocks */}
                    <div className="absolute inset-0 pointer-events-none">
                      {skSlots.map((slot, sIdx) => {
                        const evTop = Math.round((slot.startHour - JAM_AWAL) * slotPx);
                        const evHeight = Math.max(30, Math.round(slot.durationHours * slotPx) - 2);
                        return (
                          <div
                            key={sIdx}
                            style={{
                              top: `${evTop}px`,
                              height: `${evHeight}px`,
                              left: '2px',
                              right: '4px',
                            }}
                            className="absolute pr-1"
                          >
                            <Skeleton className="w-full h-full rounded-[2px]" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Neutral Now Line across grid */}
              <div
                style={{ top: `${nowTop}px` }}
                className="absolute left-0 right-0 h-0 border-t border-(--color-border) pointer-events-none z-10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
