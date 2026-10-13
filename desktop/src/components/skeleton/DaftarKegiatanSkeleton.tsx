import { Skeleton } from '@/components/ui/skeleton';

export function DaftarKegiatanSkeleton({ rowCount = 10 }: { rowCount?: number }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white overflow-hidden select-none">
      {/* 1. Main Filter Bar Skeleton (Exact match: h-11.5, px-3.5, gap-1.75) */}
      <div className="flex-none px-3.5 pt-2.75 pb-2.25 flex gap-1.75 items-center flex-wrap border-b border-(--color-border) bg-white">
        {/* Date: Dari */}
        <Skeleton className="h-6.5 w-26.5 rounded shrink-0" />

        {/* Arrow placeholder */}
        <Skeleton className="h-2 w-3 rounded-xs shrink-0 self-center" />

        {/* Date: Sampai */}
        <Skeleton className="h-6.5 w-26.5 rounded shrink-0" />

        {/* Dropdown: Jenis */}
        <Skeleton className="h-6.5 w-25 rounded shrink-0" />

        {/* Dropdown: Status */}
        <Skeleton className="h-6.5 w-26 rounded shrink-0" />

        {/* Dropdown: Subjek */}
        <Skeleton className="h-6.5 w-27 rounded shrink-0" />

        {/* Dropdown: Kelas */}
        <Skeleton className="h-6.5 w-25 rounded shrink-0" />

        {/* Dropdown: Siswa */}
        <Skeleton className="h-6.5 w-25 rounded shrink-0" />

        {/* Dropdown: Mapel */}
        <Skeleton className="h-6.5 w-25 rounded shrink-0" />

        {/* Search input */}
        <Skeleton className="h-6.5 w-39.5 rounded shrink-0" />

        {/* Right Action Buttons */}
        <div className="ml-auto flex items-center gap-1.75 flex-none pl-2">
          {/* + Kegiatan baru */}
          <Skeleton className="h-6.5 w-28.5 rounded shrink-0" />
        </div>
      </div>

      {/* 2. Quick Filter Chips Bar Skeleton (Exact match: px-3.5, py-2.25, gap-1.75) */}
      <div className="flex-none px-3.5 py-2.25 flex gap-1.75 items-center flex-nowrap overflow-x-auto border-b border-(--color-border) bg-white">
        {/* Label */}
        <Skeleton className="h-3 w-14 rounded shrink-0 mr-0.5" />

        {/* Chips */}
        <Skeleton className="h-6 w-24.5 rounded-full shrink-0" />
        <Skeleton className="h-6 w-16.5 rounded-full shrink-0" />
        <Skeleton className="h-6 w-19 rounded-full shrink-0" />
        <Skeleton className="h-6 w-22 rounded-full shrink-0" />

        {/* Right side summary */}
        <div className="ml-auto flex items-center gap-2 flex-none pl-2">
          <Skeleton className="h-3.5 w-56 rounded shrink-0" />
        </div>
      </div>

      {/* 3. Table Skeleton */}
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

          {/* Table Rows */}
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
