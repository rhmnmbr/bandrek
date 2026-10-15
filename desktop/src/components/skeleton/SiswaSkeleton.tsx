import { Skeleton } from '@/components/ui/skeleton';

export function SiswaSkeleton() {
  return (
    <div className="flex flex-1 min-h-0 bg-(--color-surface) overflow-hidden select-none" data-testid="siswa-skeleton">
      {/* Table View Container */}
      <div className="flex flex-1 min-w-0 flex-col border-r border-(--color-border)">
        {/* 1. Top Subheader Row (H: 44px / h-11) */}
        <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-(--color-border) px-3.5 bg-(--color-surface)">
          {/* Active / Inactive counter skeleton */}
          <Skeleton className="h-3.5 w-32 rounded shrink-0" />
          <div className="flex-1" />
          {/* + Siswa baru Button */}
          <Skeleton className="h-6.5 w-26 rounded shrink-0" />
        </div>

        {/* 2. Filter Bar (H: ~48px / py-2.5) */}
        <div className="flex shrink-0 items-center gap-1.75 border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-xs">
          {/* Search input: Cari nama siswa */}
          <Skeleton className="h-6.5 w-52 rounded shrink-0" />

          {/* Jenjang: semua */}
          <Skeleton className="h-6.5 w-26 rounded shrink-0" />

          {/* Kelas: semua */}
          <Skeleton className="h-6.5 w-26 rounded shrink-0" />

          {/* Status: Aktif */}
          <Skeleton className="h-6.5 w-24 rounded shrink-0" />
        </div>

        {/* 3. Table Container */}
        <div className="flex flex-1 min-h-0 flex-col">
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col min-h-full min-w-215.5 w-full">
              {/* Sticky Header (H: 26px / h-6.5) */}
              <div className="sticky top-0 z-3 flex h-6.5 shrink-0 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
                <div className="w-59 shrink-0 flex items-center gap-1 text-(--color-brand)">
                  <span>NAMA</span>
                  <span>↑</span>
                </div>
                <div className="w-11 shrink-0">JNJ</div>
                <div className="w-23.5 shrink-0 text-right pr-2.5">LAHIR</div>
                <div className="flex-1 min-w-27.5">ASAL SEKOLAH</div>
                <div className="w-29.5 shrink-0">WALI</div>
                <div className="w-29.5 shrink-0">WHATSAPP</div>
                <div className="w-10 shrink-0 text-right">KEG</div>
                <div className="w-18.5 shrink-0 pl-2">STATUS</div>
              </div>

              {/* Table Rows (H: 32px / h-8) */}
              <div className="flex flex-col">
                {Array.from({ length: 14 }).map((_, rIdx) => (
                  <div
                    key={rIdx}
                    className="flex h-8 shrink-0 items-center border-b border-(--color-border-subtle) px-3.5 bg-(--color-surface) text-[12.5px]"
                  >
                    {/* Nama */}
                    <div className="w-59 shrink-0 pr-2">
                      <Skeleton
                        className={`h-3.5 rounded shrink-0 ${
                          rIdx % 4 === 0
                            ? 'w-44'
                            : rIdx % 3 === 0
                            ? 'w-36'
                            : rIdx % 2 === 0
                            ? 'w-48'
                            : 'w-40'
                        }`}
                      />
                    </div>

                    {/* Jenjang */}
                    <div className="w-11 shrink-0 pr-2">
                      <Skeleton className="h-3.5 w-6 rounded shrink-0" />
                    </div>

                    {/* Lahir */}
                    <div className="w-23.5 shrink-0 pr-2.5 flex justify-end">
                      <Skeleton className="h-3.5 w-16 rounded shrink-0" />
                    </div>

                    {/* Asal Sekolah */}
                    <div className="flex-1 min-w-27.5 pr-2">
                      <Skeleton
                        className={`h-3.5 rounded shrink-0 ${
                          rIdx % 3 === 0
                            ? 'w-3/5'
                            : rIdx % 2 === 0
                            ? 'w-4/5'
                            : 'w-2/3'
                        }`}
                      />
                    </div>

                    {/* Wali */}
                    <div className="w-29.5 shrink-0 pr-2">
                      <Skeleton
                        className={`h-3.5 rounded shrink-0 ${
                          rIdx % 2 === 0 ? 'w-22' : 'w-20'
                        }`}
                      />
                    </div>

                    {/* WhatsApp */}
                    <div className="w-29.5 shrink-0 pr-2">
                      <Skeleton className="h-3.5 w-24 rounded shrink-0" />
                    </div>

                    {/* Keg (right-aligned) */}
                    <div className="w-10 shrink-0 pr-1 flex justify-end">
                      <Skeleton className="h-3.5 w-5 rounded shrink-0" />
                    </div>

                    {/* Status Pill (h-4.5 rounded-full with pl-2) */}
                    <div className="w-18.5 shrink-0 pl-2">
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
            <Skeleton className="h-3 w-56 rounded shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
