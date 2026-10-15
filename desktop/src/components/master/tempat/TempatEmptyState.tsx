import { Search24Regular, Building24Regular } from '@fluentui/react-icons';

interface TempatEmptyStateProps {
  isFiltered: boolean;
  onResetFilter?: () => void;
  onNewTempat?: () => void;
}

export function TempatEmptyState({
  isFiltered,
  onResetFilter,
  onNewTempat,
}: TempatEmptyStateProps) {
  return (
    <div className="flex flex-1 min-h-0 items-center justify-center p-6 bg-(--color-surface)">
      <div className="max-w-105 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-(--color-surface-sunken) flex items-center justify-center text-(--color-text-muted) mb-3">
          {isFiltered ? (
            <Search24Regular className="w-6 h-6" />
          ) : (
            <Building24Regular className="w-6 h-6" />
          )}
        </div>
        <div className="text-[15px] font-semibold text-(--color-text-primary) mb-1.5">
          {isFiltered ? 'Tidak ada yang cocok' : 'Belum ada tempat'}
        </div>
        <div className="text-[13.5px] text-(--color-text-secondary) leading-relaxed mb-3.5">
          {isFiltered
            ? 'Filter aktif tidak menemukan apa pun dari daftar tempat.'
            : 'Tambahkan tempat supaya bisa diisi ruangan dan dipakai saat menjadwalkan kegiatan.'}
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
              onClick={onNewTempat}
              className="h-6.5 px-3 border-none rounded-sm bg-(--color-brand) text-(--color-surface) text-[13px] font-semibold hover:bg-(--color-brand-pressed) transition-colors cursor-pointer"
            >
              + Tempat baru
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
