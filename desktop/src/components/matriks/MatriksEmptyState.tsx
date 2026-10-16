import * as React from 'react';
import { Warning24Regular, DismissCircle24Regular } from '@fluentui/react-icons';

interface MatriksEmptyStateProps {
  type: 'tanpa_materi' | 'tanpa_siswa' | 'tanpa_mapel' | 'error';
  namaMapel?: string;
  errorMessage?: string;
  hasFilter?: boolean;
  onPrimaryAction: () => void;
  onResetFilter?: () => void;
}

export const MatriksEmptyState: React.FC<MatriksEmptyStateProps> = ({
  type,
  namaMapel = '',
  errorMessage,
  hasFilter = false,
  onPrimaryAction,
  onResetFilter,
}) => {
  const isTanpaMapel = type === 'tanpa_mapel';
  const isError = type === 'error';
  const isTanpaMateri = type === 'tanpa_materi';

  const judul = isError
    ? 'Gagal memuat matriks belajar'
    : isTanpaMapel
    ? 'Belum ada mata pelajaran aktif'
    : isTanpaMateri
    ? 'Belum ada materi untuk mata pelajaran ini'
    : 'Tidak ada siswa yang cocok';

  const deskripsi = isError
    ? errorMessage || 'Terjadi kesalahan saat mengambil data dari server. Periksa koneksi Anda dan coba lagi.'
    : isTanpaMapel
    ? 'Matriks belajar menampilkan perkembangan penguasaan materi tiap siswa per mata pelajaran. Tambahkan atau aktifkan mata pelajaran terlebih dahulu di master data.'
    : isTanpaMateri
    ? `${namaMapel || 'Mata pelajaran ini'} belum punya materi aktif, jadi belum ada kolom untuk dibandingkan. Tambahkan materi untuk mata pelajaran ini.`
    : hasFilter
    ? 'Filter kelas atau pencarian menyisakan nol siswa. Lepas filternya, atau centang “Tampilkan siswa nonaktif” kalau yang kamu cari sudah tidak aktif.'
    : 'Belum ada siswa yang aktif. Centang “Tampilkan siswa nonaktif”.';

  const primaryLabel = isError
    ? 'Coba lagi'
    : isTanpaMapel
    ? 'Buka mata pelajaran'
    : isTanpaMateri
    ? 'Tambah materi'
    : 'Tampilkan siswa nonaktif';

  return (
    <div className="flex flex-1 min-h-0 items-center justify-center p-6 bg-white">
      <div className="max-w-110 text-center">
        <div className="flex justify-center mb-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isError
                ? 'bg-(--color-danger-subtle) text-(--color-danger-ink)'
                : 'bg-(--color-warning-bg) text-(--color-warning-ink)'
            }`}
          >
            {isError ? (
              <DismissCircle24Regular className="w-6 h-6" />
            ) : (
              <Warning24Regular className="w-6 h-6" />
            )}
          </div>
        </div>
        <div className="text-[15px] font-semibold text-[#242424] mb-1.5">{judul}</div>
        <div className="text-[13.5px] text-[#424242] leading-[1.55] mb-3.5">{deskripsi}</div>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="h-6.5 px-3 rounded bg-[#0F6CBD] text-white text-[13px] font-semibold hover:bg-[#115EA3] cursor-pointer whitespace-nowrap"
          >
            {primaryLabel}
          </button>
          {hasFilter && onResetFilter && (
            <button
              type="button"
              onClick={onResetFilter}
              className="h-6.5 px-3 rounded border border-[#C8C6C4] bg-white text-[13px] text-[#242424] hover:bg-[#FAFAFA] cursor-pointer whitespace-nowrap"
            >
              Reset filter
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
