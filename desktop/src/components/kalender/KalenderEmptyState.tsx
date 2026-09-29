import * as React from 'react';
import { Warning20Regular } from '@fluentui/react-icons';
import { Button } from '@/components/ui/button';

export interface KalenderEmptyStateProps {
  totalInPeriod: number;
  activeFilterCount: number;
  onResetFilters: () => void;
  onGoToday: () => void;
}

export const KalenderEmptyState: React.FC<KalenderEmptyStateProps> = ({
  totalInPeriod,
  activeFilterCount,
  onResetFilters,
  onGoToday,
}) => {
  const getMessage = () => {
    if (totalInPeriod === 0) {
      return 'Tidak ada kegiatan terjadwal pada periode ini. Pindah ke minggu lain, atau buat kegiatan baru.';
    }
    if (activeFilterCount === 1) {
      return `Satu filter aktif menyaring semua ${totalInPeriod} kegiatan di periode ini. Lepas filter itu agar hasilnya muncul.`;
    }
    return `${activeFilterCount} filter aktif sekaligus menyaring semua ${totalInPeriod} kegiatan di periode ini. Lepas salah satunya.`;
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center bg-white p-6 select-none">
      <div className="flex max-w-105 flex-col items-center text-center">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-(--color-warning-bg) text-(--color-warning-ink)">
          <Warning20Regular />
        </div>
        <h3 className="text-[16px] font-semibold text-(--color-text) mb-1">
          Tidak ada kegiatan yang cocok
        </h3>
        <p className="text-[13px] text-(--color-text-secondary) leading-relaxed mb-4">
          {getMessage()}
        </p>
        <div className="flex items-center gap-2.5">
          <Button variant="primary" onClick={onResetFilters}>
            Reset semua filter
          </Button>
          <Button variant="secondary" onClick={onGoToday}>
            Kembali ke hari ini
          </Button>
        </div>
      </div>
    </div>
  );
};
