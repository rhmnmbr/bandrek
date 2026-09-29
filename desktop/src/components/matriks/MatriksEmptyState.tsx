import * as React from 'react';

interface MatriksEmptyStateProps {
  type: 'tanpa_materi' | 'tanpa_siswa';
  namaMapel: string;
  jenjang: string;
  hasFilter: boolean;
  onPrimaryAction: () => void;
  onResetFilter: () => void;
}

export const MatriksEmptyState: React.FC<MatriksEmptyStateProps> = ({
  type,
  namaMapel,
  jenjang,
  hasFilter,
  onPrimaryAction,
  onResetFilter,
}) => {
  const isTanpaMateri = type === 'tanpa_materi';

  const judul = isTanpaMateri
    ? 'Belum ada materi untuk lingkup ini'
    : 'Tidak ada siswa yang cocok';

  const deskripsi = isTanpaMateri
    ? `${namaMapel} belum punya materi berjenjang ${jenjang}, jadi belum ada kolom untuk dibandingkan. Tambahkan materi dengan jenjang ${jenjang}, atau pilih jenjang lain.`
    : hasFilter
    ? `Filter kelas atau pencarian menyisakan nol siswa di jenjang ${jenjang}. Lepas filternya, atau centang “Tampilkan siswa nonaktif” kalau yang kamu cari sudah tidak aktif.`
    : `Belum ada siswa jenjang ${jenjang} yang aktif. Centang “Tampilkan siswa nonaktif” atau pilih jenjang lain.`;

  const primaryLabel = isTanpaMateri ? 'Tambah materi' : 'Tampilkan siswa nonaktif';

  return (
    <div className="flex flex-1 min-h-0 items-center justify-center p-6 bg-white">
      <div className="max-w-[440px] text-center">
        <div className="text-[22px] text-[#8A5200] mb-2 font-bold select-none">⚠</div>
        <div className="text-[15px] font-semibold text-[#242424] mb-1.5">{judul}</div>
        <div className="text-[13.5px] text-[#424242] leading-[1.55] mb-3.5">{deskripsi}</div>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="h-[26px] px-3 rounded bg-[#0F6CBD] text-white text-[13px] font-semibold hover:bg-[#115EA3] cursor-pointer whitespace-nowrap"
          >
            {primaryLabel}
          </button>
          {hasFilter && (
            <button
              type="button"
              onClick={onResetFilter}
              className="h-[26px] px-3 rounded border border-[#C8C6C4] bg-white text-[13px] text-[#242424] hover:bg-[#FAFAFA] cursor-pointer whitespace-nowrap"
            >
              Reset filter
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
