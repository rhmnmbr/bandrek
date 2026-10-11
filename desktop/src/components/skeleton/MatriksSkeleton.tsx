import { Skeleton } from '@/components/ui/skeleton';

export function MatriksSkeleton() {
  return (
    <div className="flex flex-1 flex-col h-full bg-white overflow-hidden select-none" data-testid="matriks-skeleton">
      {/* 1. Subheader Row (H: 44px / h-11) */}
      <div className="flex h-11 flex-none items-center gap-[11px] border-b border-(--color-border) px-[14px] bg-white">
        <Skeleton className="h-3.5 w-64 rounded shrink-0" />
        <div className="flex-1" />
        <Skeleton className="h-[26px] w-22 rounded shrink-0" />
        <Skeleton className="h-[26px] w-14 rounded shrink-0" />
        <Skeleton className="h-[26px] w-21.5 rounded shrink-0" />
      </div>

      {/* 2. Filter Bar (H: 48px, bg-(--color-surface-alt)) */}
      <div className="flex flex-none items-center gap-[7px] border-b border-(--color-border) bg-(--color-surface-alt) p-[11px_14px]">
        {/* Mapel Pill */}
        <Skeleton className="h-[26px] w-28 rounded shrink-0" />

        {/* Jenjang Pill */}
        <Skeleton className="h-[26px] w-38 rounded shrink-0" />

        {/* Vertical Divider */}
        <div className="h-5 w-px flex-none bg-(--color-border)" />

        {/* Kelas Pill */}
        <Skeleton className="h-[26px] w-26 rounded shrink-0" />

        {/* Input Cari Siswa */}
        <Skeleton className="h-[26px] w-[150px] rounded shrink-0" />

        <div className="flex-1 min-w-2" />

        {/* Filter Checkboxes */}
        <div className="flex flex-none items-center gap-5">
          <div className="flex items-center gap-2">
            <Skeleton className="size-3.5 rounded-xs shrink-0" />
            <Skeleton className="h-3 w-36 rounded shrink-0" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-3.5 rounded-xs shrink-0" />
            <Skeleton className="h-3 w-32 rounded shrink-0" />
          </div>
        </div>
      </div>

      {/* 3. 4 Summary Cards (Exact match: flex gap-[9px] border-b border-[#E1DFDD] p-[11px_14px]) */}
      <div className="flex flex-none gap-[9px] border-b border-(--color-border) p-[11px_14px] bg-white">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="flex-1 min-w-0 rounded-lg border border-(--color-border) bg-white p-[8px_11px] flex flex-col justify-between h-[74px]"
          >
            <Skeleton className="h-2.5 w-24 rounded shrink-0" />
            <Skeleton className="h-5 w-14 rounded shrink-0 my-0.5" />
            <Skeleton className="h-2.5 w-36 rounded shrink-0" />
          </div>
        ))}
      </div>

      {/* 4. Scope Title & Metadata Row */}
      <div className="flex flex-none items-baseline gap-2.5 px-[14px] pb-[9px] pt-1 bg-white">
        <Skeleton className="h-4 w-32 rounded shrink-0" />
        <Skeleton className="h-3 w-40 rounded shrink-0" />
      </div>

      {/* 5. Anomaly Banner Placeholder */}
      <div className="flex flex-none items-center gap-2 rounded-md border border-(--color-border) bg-(--color-surface-alt) p-[6px_10px] mx-[14px] mb-[9px]">
        <Skeleton className="size-4 rounded-xs shrink-0" />
        <Skeleton className="h-3 flex-1 rounded" />
        <Skeleton className="h-[22px] w-24 rounded shrink-0" />
      </div>

      {/* 6. Grid Table Container (Sticky Header, Sticky Left, Sticky Right, Sticky Bottom) */}
      <div className="flex-1 min-h-0 overflow-auto bg-white">
        <div className="flex flex-col min-w-min min-h-full">
          {/* Header Row (H: 34px) */}
          <div className="flex sticky top-0 z-30 bg-(--color-surface-alt) border-b border-(--color-border) select-none">
            {/* Sticky Student Header Col (W: 260px) */}
            <div className="w-[260px] flex-none sticky left-0 z-40 bg-(--color-surface-alt) border-r border-b border-(--color-border) h-[34px] flex items-center px-[11px]">
              <Skeleton className="h-3 w-20 rounded shrink-0" />
            </div>

            {/* Material Columns (5 columns matching default SD view) */}
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="min-w-[96px] flex-1 h-[34px] border-r border-[#EDEBE9] border-b border-(--color-border) bg-(--color-surface-alt) px-1.5 py-1 flex items-center justify-center"
              >
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            ))}

            {/* Sticky Checkmark Col (W: 62px) */}
            <div className="w-[62px] flex-none sticky right-0 z-40 bg-(--color-surface-alt) border-l border-b border-(--color-border) h-[34px] flex items-center justify-end px-2.5">
              <Skeleton className="size-3.5 rounded shrink-0" />
            </div>
          </div>

          {/* Student Rows (H: 28px / h-7) */}
          {Array.from({ length: 14 }).map((_, rIdx) => {
            const isTertinggalPlaceholder = rIdx % 3 === 0;
            return (
              <div
                key={rIdx}
                className="flex h-7 flex-none border-b border-[#EDEBE9] bg-white text-[12.5px]"
              >
                {/* Sticky Student Name Col (W: 260px) */}
                <div className="w-[260px] flex-none sticky left-0 z-10 border-r border-(--color-border) bg-white flex items-center gap-1.5 px-[11px]">
                  {isTertinggalPlaceholder && (
                    <Skeleton className="size-3.5 rounded-xs shrink-0" />
                  )}
                  <Skeleton
                    className={`h-3.5 rounded shrink-0 ${
                      rIdx % 4 === 0
                        ? 'w-32'
                        : rIdx % 3 === 0
                        ? 'w-24'
                        : rIdx % 2 === 0
                        ? 'w-36'
                        : 'w-28'
                    }`}
                  />
                </div>

                {/* 5 Material Cells */}
                {Array.from({ length: 5 }).map((_, cIdx) => (
                  <div
                    key={cIdx}
                    className="min-w-[96px] flex-1 flex items-center justify-center border-r border-[#EDEBE9] h-full"
                  >
                    <Skeleton className="size-3.5 rounded-[2px]" />
                  </div>
                ))}

                {/* Sticky Score Col (W: 62px) */}
                <div className="w-[62px] flex-none sticky right-0 z-10 border-l border-(--color-border) bg-white flex items-center justify-end px-2.5">
                  <Skeleton className="h-3 w-6 rounded shrink-0" />
                </div>
              </div>
            );
          })}

          {/* Spacer */}
          <div className="flex-1 min-h-0" />

          {/* Sticky Summary Row "MENERIMA" (H: 26px) */}
          <div className="flex h-[26px] flex-none sticky bottom-0 z-20 bg-(--color-surface-alt) border-t border-(--color-border) select-none">
            {/* Sticky Label (W: 260px) */}
            <div className="w-[260px] flex-none sticky left-0 z-30 bg-(--color-surface-alt) border-r border-(--color-border) flex items-center px-[11px]">
              <Skeleton className="h-3 w-16 rounded shrink-0" />
            </div>

            {/* 5 Material Metrics */}
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="min-w-[96px] flex-1 border-r border-[#EDEBE9] flex items-center justify-center"
              >
                <Skeleton className="h-3 w-8 rounded shrink-0" />
              </div>
            ))}

            {/* Sticky Right Spacer (W: 62px) */}
            <div className="w-[62px] flex-none sticky right-0 z-30 bg-(--color-surface-alt) border-l border-(--color-border)" />
          </div>
        </div>
      </div>

      {/* 7. Bottom Legend Bar Skeleton (H: 34px) */}
      <div className="flex h-[34px] flex-none items-center gap-[13px] border-t border-(--color-border) bg-(--color-surface-alt) px-[14px] select-none">
        {/* 7 legend items */}
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-1.5 shrink-0">
            <Skeleton className="h-4 w-5 rounded-[2px] shrink-0" />
            <Skeleton className="h-3 w-16 rounded shrink-0" />
          </div>
        ))}
        <div className="flex-1 min-w-[6px]" />
        <Skeleton className="h-3 w-48 rounded shrink-0" />
      </div>
    </div>
  );
}
