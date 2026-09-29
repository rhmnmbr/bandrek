import * as React from 'react';
import type { MatriksBelajarResult } from '@/data/types';

interface MatriksSummaryCardsProps {
  data: MatriksBelajarResult;
  totalMateriTersampaikan: number;
  totalSelBerlaku: number;
  persentaseCakupan: number;
  jumlahSiswaTertinggal: number;
  totalSiswaTampil: number;
  menungguRealisasi: number;
}

export const MatriksSummaryCards: React.FC<MatriksSummaryCardsProps> = ({
  data,
  totalMateriTersampaikan,
  totalSelBerlaku,
  persentaseCakupan,
  jumlahSiswaTertinggal,
  totalSiswaTampil,
  menungguRealisasi,
}) => {
  const { ambangTertinggal, materiPalingTertinggal, kolom } = data;

  const adaTertinggal = jumlahSiswaTertinggal > 0;
  const adaMenunggu = menungguRealisasi > 0;

  return (
    <div className="flex gap-[9px] border-b border-[#E1DFDD] p-[11px_14px]">
      {/* 1. Cakupan Materi */}
      <div className="flex-1 min-w-0 rounded-lg border border-[#E1DFDD] bg-white p-[8px_11px] leading-[1.35] text-[#424242]">
        <div className="text-[10.5px] tracking-[0.09em] text-[#5C5A58] uppercase">
          Cakupan Materi
        </div>
        <div className="mt-0 font-mono text-[19px] font-semibold truncate">
          {persentaseCakupan}%
        </div>
        <div className="text-[11.5px] text-[#5C5A58] truncate">
          {totalMateriTersampaikan} dari {totalSelBerlaku} sel tersampaikan
        </div>
      </div>

      {/* 2. Siswa Tertinggal */}
      <div
        className={`flex-1 min-w-0 rounded-lg border p-[8px_11px] leading-[1.35] ${
          adaTertinggal
            ? 'border-[#F0A82E] bg-[#FFF3E0] text-[#8A5200]'
            : 'border-[#E1DFDD] bg-white text-[#424242]'
        }`}
      >
        <div
          className={`text-[10.5px] tracking-[0.09em] uppercase ${
            adaTertinggal ? 'text-[#8A5200]' : 'text-[#5C5A58]'
          }`}
        >
          Siswa Tertinggal
        </div>
        <div className="mt-0 font-mono text-[19px] font-semibold truncate">
          {jumlahSiswaTertinggal} dari {totalSiswaTampil}
        </div>
        <div
          className={`text-[11.5px] truncate ${
            adaTertinggal ? 'text-[#8A5200]' : 'text-[#5C5A58]'
          }`}
        >
          ≥ {ambangTertinggal.minBelum} dari {kolom.length} materi belum diterima
        </div>
      </div>

      {/* 3. Materi Paling Tertinggal */}
      <div className="flex-1 min-w-0 rounded-lg border border-[#E1DFDD] bg-white p-[8px_11px] leading-[1.35] text-[#424242]">
        <div className="text-[10.5px] tracking-[0.09em] text-[#5C5A58] uppercase">
          Materi Paling Tertinggal
        </div>
        <div className="mt-[2px] text-[14px] font-semibold truncate">
          {materiPalingTertinggal ? materiPalingTertinggal.nama : 'Semua merata'}
        </div>
        <div className="text-[11.5px] text-[#5C5A58] truncate">
          {materiPalingTertinggal ? materiPalingTertinggal.alasan : 'tiap materi belum diterima 0 siswa'}
        </div>
      </div>

      {/* 4. Menunggu Realisasi */}
      <div
        className={`flex-1 min-w-0 rounded-lg border p-[8px_11px] leading-[1.35] ${
          adaMenunggu
            ? 'border-[#F0A82E] bg-[#FFF3E0] text-[#8A5200]'
            : 'border-[#E1DFDD] bg-white text-[#424242]'
        }`}
      >
        <div
          className={`text-[10.5px] tracking-[0.09em] uppercase ${
            adaMenunggu ? 'text-[#8A5200]' : 'text-[#5C5A58]'
          }`}
        >
          Menunggu Realisasi
        </div>
        <div className="mt-0 font-mono text-[19px] font-semibold truncate">
          {menungguRealisasi} kegiatan
        </div>
        <div
          className={`text-[11.5px] truncate ${
            adaMenunggu ? 'text-[#8A5200]' : 'text-[#5C5A58]'
          }`}
        >
          angka di atas bisa berubah
        </div>
      </div>
    </div>
  );
};
