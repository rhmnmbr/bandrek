import { Skeleton } from '@/components/ui/skeleton';

export function UserManagementSkeleton() {
  return (
    <div
      className="flex h-full w-full flex-row overflow-hidden bg-(--color-surface) select-none"
      data-testid="user-management-skeleton"
    >
      {/* Left Column (flex-1 wide table) */}
      <div className="flex flex-1 min-w-0 min-h-0 flex-col border-r border-(--color-border) bg-(--color-surface)">
        {/* Top Header Row (H: 44px / h-11) */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-(--color-border) px-3.5 bg-(--color-surface)">
          <Skeleton className="h-3.5 w-32 rounded shrink-0" />
          <Skeleton className="h-6.5 w-28 rounded shrink-0" />
        </div>

        {/* Filter Bar (H: 48px / h-12) */}
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-xs">
          <Skeleton className="h-6.5 flex-1 min-w-0 max-w-[280px] rounded shrink-0" />
        </div>

        {/* Table Container */}
        <div className="flex flex-1 min-h-0 flex-col">
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col min-h-full w-full">
              {/* Sticky Header (H: 26px / h-6.5) */}
              <div className="sticky top-0 z-3 flex h-6.5 shrink-0 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
                <div className="flex-1 min-w-[160px] pr-2">PENGGUNA</div>
                <div className="w-[120px] shrink-0 pr-2">USERNAME</div>
                <div className="w-[90px] shrink-0 pr-2">PERAN</div>
                <div className="w-[80px] shrink-0 text-right pr-2">STATUS</div>
              </div>

              {/* Table Rows (H: 36px / h-9) */}
              <div className="flex flex-col">
                {/* Row 1: Selected state */}
                <div className="flex h-9 shrink-0 items-center border-b border-(--color-border-subtle) px-3.5 bg-(--color-brand-subtle) shadow-[inset_3px_0_0_var(--color-brand)]">
                  <div className="flex-1 min-w-[160px] flex items-center gap-2 pr-2">
                    <Skeleton className="size-6 rounded-full shrink-0" />
                    <Skeleton className="h-3.5 w-32 rounded shrink-0" />
                  </div>
                  <div className="w-[120px] shrink-0 pr-2">
                    <Skeleton className="h-3.5 w-20 rounded shrink-0" />
                  </div>
                  <div className="w-[90px] shrink-0 pr-2">
                    <Skeleton className="h-4.5 w-16 rounded-full shrink-0" />
                  </div>
                  <div className="w-[80px] shrink-0 flex justify-end pr-2">
                    <Skeleton className="h-4.5 w-14 rounded-full shrink-0" />
                  </div>
                </div>

                {/* Rows 2..6 */}
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex h-9 shrink-0 items-center border-b border-(--color-border-subtle) px-3.5 bg-(--color-surface)"
                  >
                    <div className="flex-1 min-w-[160px] flex items-center gap-2 pr-2">
                      <Skeleton className="size-6 rounded-full shrink-0" />
                      <Skeleton
                        className={`h-3.5 rounded shrink-0 ${
                          idx === 0 ? 'w-28' : idx === 1 ? 'w-36' : idx === 2 ? 'w-24' : 'w-30'
                        }`}
                      />
                    </div>
                    <div className="w-[120px] shrink-0 pr-2">
                      <Skeleton className="h-3.5 w-18 rounded shrink-0" />
                    </div>
                    <div className="w-[90px] shrink-0 pr-2">
                      <Skeleton className="h-4.5 w-16 rounded-full shrink-0" />
                    </div>
                    <div className="w-[80px] shrink-0 flex justify-end pr-2">
                      <Skeleton className="h-4.5 w-14 rounded-full shrink-0" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-1 min-h-0" />
            </div>
          </div>

          {/* Sticky Footer (H: 30px / h-7.5) */}
          <div className="flex h-7.5 shrink-0 items-center border-t border-(--color-border) bg-(--color-surface-alt) px-3.5">
            <Skeleton className="h-3 w-48 rounded shrink-0" />
          </div>
        </div>
      </div>

      {/* Right Column (Form Panel, 352px) */}
      <div className="flex w-[352px] flex-[0_0_352px] min-w-0 min-h-0 flex-col overflow-hidden bg-(--color-surface-alt)">
        {/* Header (H: 52px / h-13) */}
        <div className="flex h-13 shrink-0 items-center gap-2.5 border-b border-(--color-border) bg-(--color-surface) px-3.5">
          <Skeleton className="size-8 rounded-md shrink-0" />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <Skeleton className="h-4 w-32 rounded shrink-0" />
            <Skeleton className="h-3 w-28 rounded shrink-0" />
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-3">
          {/* Nama lengkap */}
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-24 rounded shrink-0" />
            <Skeleton className="h-7 w-full rounded-sm shrink-0" />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-36 rounded shrink-0" />
            <Skeleton className="h-7 w-full rounded-sm shrink-0" />
          </div>

          {/* Kata sandi */}
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-20 rounded shrink-0" />
            <Skeleton className="h-7 w-full rounded-sm shrink-0" />
          </div>

          {/* Peran */}
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-28 rounded shrink-0" />
            <Skeleton className="h-7 w-full rounded-sm shrink-0" />
          </div>

          {/* Status aktif */}
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="size-3.5 rounded-xs shrink-0" />
            <Skeleton className="h-3.5 w-44 rounded shrink-0" />
          </div>
        </div>

        {/* Bottom Actions Bar (H: 48px / h-12) */}
        <div className="flex h-12 shrink-0 items-center justify-end gap-2 border-t border-(--color-border) bg-(--color-surface) px-3.5">
          <Skeleton className="h-6.5 w-16 rounded shrink-0" />
          <Skeleton className="h-6.5 w-20 rounded shrink-0" />
        </div>
      </div>
    </div>
  );
}
