import * as React from 'react';

interface MatriksAnomalyBannerProps {
  totalSiswa: number;
  namaMapel: string;
  jenjang: string;
  onOpenModal: () => void;
}

export const MatriksAnomalyBanner: React.FC<MatriksAnomalyBannerProps> = ({
  totalSiswa,
  namaMapel,
  jenjang,
  onOpenModal,
}) => {
  return (
    <div className="flex flex-none items-center gap-2 rounded-md border border-[#F0A82E] bg-[#FFF3E0] p-[6px_10px] text-[11.5px] text-[#8A5200] mx-[14px] mb-[9px]">
      <span className="flex-none font-bold">⚠</span>
      <span className="flex-1 min-w-0 leading-[1.45]">
        {totalSiswa} siswa punya catatan {namaMapel} di luar jenjang {jenjang} — biasanya salah input saat memilih materi.
      </span>
      <button
        type="button"
        onClick={onOpenModal}
        className="flex-none h-[22px] px-[9px] rounded border border-[#8A5200] bg-white text-[11.5px] text-[#8A5200] font-medium hover:bg-[#FFF8EE] cursor-pointer whitespace-nowrap"
      >
        Lihat daftarnya
      </button>
    </div>
  );
};
