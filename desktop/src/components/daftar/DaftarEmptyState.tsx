import * as React from 'react';
import { formatTanggalPendek } from '@/lib/dateUtils';

export interface DaftarEmptyStateProps {
  hasFilters: boolean;
  activeFilterCount: number;
  hasCepat: boolean;
  totalAll: number;
  dari: string;
  sampai: string;
  onClearCepat: () => void;
  onResetAllFilters: () => void;
  onNewKegiatan: () => void;
  onWidenRange: () => void;
}

export const DaftarEmptyState: React.FC<DaftarEmptyStateProps> = ({
  hasFilters,
  activeFilterCount,
  hasCepat,
  totalAll,
  dari,
  sampai,
  onClearCepat,
  onResetAllFilters,
  onNewKegiatan,
  onWidenRange,
}) => {
  const judul = hasFilters
    ? 'Tidak ada kegiatan yang cocok'
    : 'Belum ada kegiatan di rentang ini';

  const tglDari = formatTanggalPendek(dari) || '—';
  const tglSampai = formatTanggalPendek(sampai) || '—';

  const teks = hasFilters
    ? `${activeFilterCount} filter aktif${
        hasCepat ? ' (termasuk filter cepat)' : ''
      } menyisakan nol kegiatan dari ${totalAll} yang ada. Lepas salah satunya.`
    : `Rentang ${tglDari} → ${tglSampai} tidak memuat kegiatan apa pun. Lebarkan rentangnya atau buat kegiatan baru.`;

  const utamaLabel = hasCepat
    ? 'Lepas filter cepat'
    : hasFilters
    ? 'Lepas semua filter'
    : 'Kegiatan baru';

  const handleUtama = () => {
    if (hasCepat) {
      onClearCepat();
    } else if (hasFilters) {
      onResetAllFilters();
    } else {
      onNewKegiatan();
    }
  };

  const adaKedua = hasCepat || !hasFilters;
  const keduaLabel = hasCepat ? 'Reset semua filter' : 'Lebarkan rentang setahun';

  const handleKedua = () => {
    if (hasCepat) {
      onResetAllFilters();
    } else {
      onWidenRange();
    }
  };

  return (
    <div className="flex-1 min-h-0 flex items-center justify-center p-6 bg-white select-none">
      <div className="max-w-115 text-center">
        <div className="text-[22px] text-(--color-text-muted) mb-2">◇</div>
        <h3 className="text-[15px] font-semibold text-(--color-text) mb-1.25">
          {judul}
        </h3>
        <p className="text-[13.5px] text-(--color-text-secondary) leading-relaxed mb-3.5">
          {teks}
        </p>
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={handleUtama}
            className="h-6.5 px-3 border-none rounded bg-(--color-brand) text-white text-[13px] font-semibold cursor-pointer whitespace-nowrap hover:bg-(--color-brand-pressed) transition-colors"
          >
            {utamaLabel}
          </button>
          {adaKedua && (
            <button
              type="button"
              onClick={handleKedua}
              className="h-6.5 px-3 border border-(--color-border-strong) rounded bg-white text-(--color-text) text-[13px] cursor-pointer whitespace-nowrap hover:bg-(--color-surface-alt) transition-colors"
            >
              {keduaLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
