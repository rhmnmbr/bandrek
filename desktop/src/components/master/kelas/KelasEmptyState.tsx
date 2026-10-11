interface KelasEmptyStateProps {
  isFiltered: boolean;
  onResetFilter?: () => void;
  onNewKelas?: () => void;
}

export function KelasEmptyState({
  isFiltered,
  onResetFilter,
  onNewKelas,
}: KelasEmptyStateProps) {
  return (
    <div className="flex flex-1 min-h-0 items-center justify-center p-6 bg-(--color-surface)">
      <div className="max-w-[420px] text-center">
        <div className="text-[22px] text-(--color-text-disabled) mb-2">◇</div>
        <div className="text-[15px] font-semibold text-(--color-text-primary) mb-1.5">
          {isFiltered ? 'Tidak ada kelas yang cocok' : 'Belum ada kelas'}
        </div>
        <div className="text-[13.5px] text-(--color-text-secondary) leading-relaxed mb-3.5">
          {isFiltered
            ? 'Coba ubah kata kunci pencarian atau filter jenjang.'
            : 'Kelas dipakai sebagai pintasan untuk menambahkan sekelompok siswa ke kegiatan secara cepat.'}
        </div>
        <div className="flex gap-2 justify-center">
          {isFiltered ? (
            <button
              type="button"
              onClick={onResetFilter}
              className="h-6.5 px-3 border border-(--color-border) rounded-sm bg-(--color-surface) text-(--color-brand) text-[13px] font-semibold hover:bg-(--color-brand-subtle) transition-colors cursor-pointer"
            >
              Reset filter
            </button>
          ) : (
            <button
              type="button"
              onClick={onNewKelas}
              className="h-6.5 px-3 border-none rounded-sm bg-(--color-brand) text-(--color-surface) text-[13px] font-semibold hover:bg-(--color-brand-pressed) transition-colors cursor-pointer"
            >
              + Kelas baru
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
