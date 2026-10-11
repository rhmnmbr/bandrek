import { Skeleton } from '@/components/ui/skeleton';

export function DaftarKegiatanSkeleton({ rowCount = 10 }: { rowCount?: number }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white overflow-hidden">
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="flex flex-col min-h-full min-w-[1100px] w-full">
          {/* Sticky Table Header */}
          <div className="sticky top-0 z-3 flex h-6.5 shrink-0 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
            <div className="w-26 shrink-0">TANGGAL</div>
            <div className="w-26 shrink-0">JAM</div>
            <div className="flex-1 min-w-40">NAMA KEGIATAN</div>
            <div className="w-26 shrink-0">JENIS</div>
            <div className="w-47.5 shrink-0">MATERI</div>
            <div className="w-35 shrink-0">RUANGAN</div>
            <div className="w-27 shrink-0">PENGISI</div>
            <div className="w-13.5 shrink-0 text-right pr-2">SISWA</div>
            <div className="w-32 shrink-0 pl-2">STATUS</div>
            <div className="w-10 shrink-0" />
          </div>

          {/* Shimmer Table Rows */}
          <div className="flex flex-col">
            {Array.from({ length: rowCount }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center h-8 shrink-0 border-b border-(--color-border-subtle) px-3.5 bg-white"
              >
                {/* Tanggal */}
                <div className="w-26 shrink-0 pr-2">
                  <Skeleton className="h-3.5 w-18" />
                </div>

                {/* Jam */}
                <div className="w-26 shrink-0 pr-2">
                  <Skeleton className="h-3.5 w-20" />
                </div>

                {/* Nama Kegiatan */}
                <div className="flex-1 min-w-40 pr-2">
                  <Skeleton className="h-3.5 w-4/5" />
                </div>

                {/* Jenis */}
                <div className="w-26 shrink-0 pr-2">
                  <Skeleton className="h-4.5 w-20 rounded-(--radius-pill)" />
                </div>

                {/* Materi */}
                <div className="w-47.5 shrink-0 pr-2">
                  <Skeleton className="h-3.5 w-36" />
                </div>

                {/* Ruangan */}
                <div className="w-35 shrink-0 pr-2">
                  <Skeleton className="h-3.5 w-28" />
                </div>

                {/* Pengisi */}
                <div className="w-27 shrink-0 pr-2">
                  <Skeleton className="h-3.5 w-20" />
                </div>

                {/* Siswa */}
                <div className="w-13.5 shrink-0 pr-2 flex justify-end">
                  <Skeleton className="h-3.5 w-6" />
                </div>

                {/* Status */}
                <div className="w-32 shrink-0 pl-2 pr-2">
                  <Skeleton className="h-4.5 w-24 rounded-(--radius-pill)" />
                </div>

                {/* Aksi */}
                <div className="w-10 shrink-0 flex justify-center">
                  <Skeleton className="h-5 w-5 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer bar skeleton */}
      <div className="h-7 shrink-0 border-t border-(--color-border) bg-(--color-surface-alt) px-3.5 flex items-center justify-between">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}
