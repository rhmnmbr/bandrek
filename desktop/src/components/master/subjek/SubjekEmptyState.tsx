interface SubjekEmptyStateProps {
  adaFilter: boolean;
  cari: string;
  totalDb: number;
  status: string;
  onTampilkanSemuaStatus: () => void;
  onResetFilter: () => void;
  onSubjekBaru: () => void;
}

export function SubjekEmptyState({
  adaFilter,
  cari,
  totalDb,
  status,
  onTampilkanSemuaStatus,
  onResetFilter,
  onSubjekBaru,
}: SubjekEmptyStateProps) {
  const judul = adaFilter ? 'Tidak ada subjek yang cocok' : 'Belum ada subjek';
  const teks = adaFilter
    ? `${cari ? `Pencarian “${cari.trim()}”` : 'Filter aktif'} tidak menemukan siapa pun dari ${totalDb} subjek${
        status === 'aktif'
          ? '. Coba ganti status ke “semua” — mungkin subjeknya sudah nonaktif.'
          : '.'
      }`
    : 'Tambahkan subjek supaya bisa dipasang sebagai pengisi atau pendamping kegiatan.';

  return (
    <div className="flex flex-1 min-h-0 items-center justify-center p-6 bg-(--color-surface)">
      <div className="max-w-[420px] text-center flex flex-col items-center">
        <div className="text-[22px] text-(--color-text-muted) mb-2">◇</div>
        <div className="text-[15px] font-semibold text-(--color-text-primary) mb-1.25">{judul}</div>
        <div className="text-[13.5px] text-(--color-text-secondary) leading-relaxed mb-3.5">
          {teks}
        </div>
        <div className="flex gap-2 justify-center">
          {adaFilter ? (
            <>
              <button
                type="button"
                onClick={onTampilkanSemuaStatus}
                className="h-6.5 px-3 rounded border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-colors"
              >
                Tampilkan semua status
              </button>
              <button
                type="button"
                onClick={onResetFilter}
                className="h-6.5 px-3 rounded border border-(--color-border-strong) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-primary) text-[13px] cursor-pointer whitespace-nowrap transition-colors"
              >
                Reset filter
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onSubjekBaru}
              className="h-6.5 px-3 rounded border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-colors"
            >
              + Subjek baru
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
