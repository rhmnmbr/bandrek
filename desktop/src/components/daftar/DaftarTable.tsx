import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatTanggalPendek } from '@/lib/dateUtils';
import type { Kegiatan } from '@/data/types/kegiatan';
import {
  Warning12Regular,
  Checkmark12Regular,
  Dismiss12Regular,
  ArrowClockwise12Regular,
} from '@fluentui/react-icons';

export interface DaftarTableProps {
  kegiatanList: Kegiatan[];
  simulatedToday?: string;
  dari: string;
  sampai: string;
  activeCepat: string;
  sortDesc: boolean;
  onToggleSort: () => void;
  onOpenDetail: (kegiatan: Kegiatan) => void;
  onIsiRealisasi: (kegiatan: Kegiatan) => void;
  onJadwalUlang: (kegiatan: Kegiatan) => void;
  onBatalkan: (kegiatan: Kegiatan) => void;
}

const MAX_DISPLAY_ROWS = 300;

export const DaftarTable: React.FC<DaftarTableProps> = ({
  kegiatanList,
  simulatedToday = '2026-09-16',
  dari,
  sampai,
  activeCepat,
  sortDesc,
  onToggleSort,
  onOpenDetail,
  onIsiRealisasi,
  onJadwalUlang,
  onBatalkan,
}) => {
  const total = kegiatanList.length;
  const isPotong = total > MAX_DISPLAY_ROWS;
  const displayList = isPotong ? kegiatanList.slice(0, MAX_DISPLAY_ROWS) : kegiatanList;

  // Footer message
  const footerText = React.useMemo(() => {
    if (activeCepat === 'perlu') {
      return `${total} kegiatan sudah lewat tapi belum direalisasi — rentang tanggal diabaikan selama filter ini aktif.`;
    }
    const tglDari = formatTanggalPendek(dari) || '—';
    const tglSampai = formatTanggalPendek(sampai) || '—';
    return `Rentang ${tglDari} → ${tglSampai} · ${total} kegiatan. Ubah rentang untuk memuat riwayat lebih jauh.`;
  }, [activeCepat, total, dari, sampai]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white">
      {/* Scrollable Table Viewport */}
      <div
        data-dft-scroll="tabel"
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden select-none"
      >
        <div className="flex flex-col min-h-full">
          {/* 1. Sticky Table Header */}
          <div className="flex items-center h-6.5 flex-none sticky top-0 z-10 bg-[#FAFAFA] border-b border-(--color-border) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
            {/* TANGGAL */}
            <button
              type="button"
              onClick={onToggleSort}
              title={
                sortDesc
                  ? 'Urut terbaru dulu — klik untuk terlama dulu'
                  : 'Urut terlama dulu — klik untuk terbaru dulu'
              }
              className="w-26 flex-none h-6.5 border-none bg-transparent p-0 text-left text-[10.5px] font-semibold tracking-wider text-(--color-brand) cursor-pointer flex items-center gap-1 hover:text-(--color-brand-pressed) transition-colors"
            >
              <span>TANGGAL</span>
              <span>{sortDesc ? '↓' : '↑'}</span>
            </button>

            {/* JAM */}
            <div className="w-26 flex-none">JAM</div>

            {/* NAMA KEGIATAN */}
            <div className="flex-1 min-w-40">NAMA KEGIATAN</div>

            {/* JENIS */}
            <div className="w-26 flex-none">JENIS</div>

            {/* MATERI */}
            <div className="w-47.5 flex-none">MATERI</div>

            {/* RUANGAN */}
            <div className="w-35 flex-none">RUANGAN</div>

            {/* PENGISI */}
            <div className="w-27 flex-none">PENGISI</div>

            {/* SISWA */}
            <div className="w-13.5 flex-none text-right">SISWA</div>

            {/* STATUS */}
            <div className="w-32 flex-none pl-2">STATUS</div>

            {/* AKSI */}
            <div className="w-37.5 flex-none text-right">AKSI</div>
          </div>

          {/* 2. Table Rows */}
          {displayList.map((ev) => {
            const isToday = ev.tanggal === simulatedToday;
            const isBatal = ev.status === 'dibatalkan';
            const isUlang = ev.status === 'dijadwal_ulang';
            const isTerealisasi = ev.status === 'terealisasi';
            const isBelum = ev.status === 'belum_direalisasi';
            const isTerjadwal = ev.status === 'terjadwal';
            const perlu = ev.perluRealisasi ?? isBelum;

            // Display values
            const formattedDate = formatTanggalPendek(ev.tanggal);
            const formattedJam = `${ev.mulai}–${ev.selesai}`;
            const displayJenis = ev.namaJenis || '—';
            const displayMateri = ev.namaMateri
              ? `${ev.namaMapel || '—'} › ${ev.namaMateri}`
              : '—';
            const displayRuangan = ev.namaRuangan
              ? `${ev.namaTempat || '—'} · ${ev.namaRuangan}`
              : 'Tanpa ruangan';
            const displayPengisi = ev.pengisiUtama?.nama || '—';
            const siswaCount = ev.siswa.length;

            return (
              <div
                key={ev.id}
                onClick={() => onOpenDetail(ev)}
                title={`Buka detail ${ev.nama}`}
                className={cn(
                  'flex items-center h-8 flex-none border-b border-[#EDEBE9] px-3.5 text-[12.5px] cursor-pointer transition-colors',
                  perlu
                    ? 'bg-[#FFF8EE] shadow-[inset_3px_0_0_#F0A82E] hover:bg-[#FFF3E0]'
                    : 'bg-white hover:bg-[#FAFAFA]'
                )}
              >
                {/* TANGGAL */}
                <div
                  className={cn(
                    'w-26 flex-none font-mono text-[11.5px] whitespace-nowrap',
                    isToday ? 'text-[#0C548F] font-semibold' : 'text-[#5C5A58]'
                  )}
                >
                  {formattedDate}
                </div>

                {/* JAM */}
                <div className="w-26 flex-none font-mono text-[11.5px] text-[#424242] whitespace-nowrap">
                  {formattedJam}
                </div>

                {/* NAMA KEGIATAN */}
                <div
                  className={cn(
                    'flex-1 min-w-40 whitespace-nowrap overflow-hidden text-ellipsis pr-2',
                    perlu ? 'font-semibold' : 'font-normal',
                    isBatal ? 'line-through text-[#5C5A58]' : 'text-[#242424]'
                  )}
                >
                  {ev.nama}
                </div>

                {/* JENIS */}
                <div className="w-26 flex-none text-[#424242] whitespace-nowrap overflow-hidden text-ellipsis pr-2">
                  {displayJenis}
                </div>

                {/* MATERI */}
                <div className="w-47.5 flex-none text-[#424242] whitespace-nowrap overflow-hidden text-ellipsis pr-2">
                  {displayMateri}
                </div>

                {/* RUANGAN */}
                <div className="w-35 flex-none text-[#424242] whitespace-nowrap overflow-hidden text-ellipsis pr-2">
                  {displayRuangan}
                </div>

                {/* PENGISI */}
                <div className="w-27 flex-none text-[#424242] whitespace-nowrap overflow-hidden text-ellipsis pr-2">
                  {displayPengisi}
                </div>

                {/* SISWA */}
                <div
                  className={cn(
                    'w-13.5 flex-none text-right font-mono text-[11.5px]',
                    siswaCount > 0 ? 'text-[#242424]' : 'text-[#A19F9D]'
                  )}
                >
                  {siswaCount > 0 ? siswaCount : '—'}
                </div>

                {/* STATUS BADGE */}
                <div className="w-32 flex-none pl-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 h-4.5 px-1.75 rounded-full text-[10.5px] font-semibold border whitespace-nowrap select-none',
                      isBelum && 'border-[#F0A82E] bg-[#FFF4CE] text-[#795B00]',
                      isTerjadwal && 'border-[#0F6CBD] bg-[#EFF6FC] text-[#0F6CBD]',
                      isTerealisasi && 'border-[#107C10] bg-[#DFF6DD] text-[#107C10]',
                      isUlang && 'border-dashed border-[#5B4394] bg-white text-[#5B4394]',
                      isBatal && 'border-[#C8C6C4] bg-[#F3F2F1] text-[#5C5A58]'
                    )}
                  >
                    {isBelum && <Warning12Regular className="w-2.5 h-2.5 flex-none" />}
                    {isTerjadwal && (
                      <span className="w-1.75 h-1.75 flex-none rounded-full bg-current" />
                    )}
                    {isTerealisasi && <Checkmark12Regular className="w-2.75 h-2.75 flex-none" />}
                    {isUlang && <ArrowClockwise12Regular className="w-2.5 h-2.5 flex-none" />}
                    {isBatal && <Dismiss12Regular className="w-2.25 h-2.25 flex-none" />}
                    <span className="leading-none">{ev.labelStatus || 'Terjadwal'}</span>
                  </span>
                </div>

                {/* AKSI BUTTONS */}
                <div className="w-37.5 flex-none flex items-center justify-end gap-1.25">
                  {/* Primary Action Button */}
                  {(isTerjadwal || isBelum || isTerealisasi) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onIsiRealisasi(ev);
                      }}
                      title={
                        isTerealisasi
                          ? 'Perbaiki kehadiran atau catatan realisasi'
                          : 'Catat kehadiran dan hasil sesi ini'
                      }
                      className="flex-none h-6 px-2.25 border-none rounded bg-(--color-brand) text-white text-[11.5px] font-semibold cursor-pointer whitespace-nowrap hover:bg-(--color-brand-pressed) transition-colors"
                    >
                      {isTerealisasi ? 'Ubah realisasi' : 'Isi realisasi'}
                    </button>
                  )}

                  {/* Secondary Reschedule & Cancel Buttons (only for Terjadwal & Belum) */}
                  {(isTerjadwal || isBelum) && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onJadwalUlang(ev);
                        }}
                        title="Jadwalkan ulang kegiatan ini"
                        className="w-6 h-6 flex-none border border-(--color-border-strong) rounded bg-white text-[#424242] text-[11px] cursor-pointer hover:bg-(--color-surface-alt) flex items-center justify-center transition-colors"
                      >
                        ↻
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBatalkan(ev);
                        }}
                        title="Batalkan kegiatan ini"
                        className="w-6 h-6 flex-none border border-[#C50F1F] rounded bg-white text-[#9B0C18] text-[11px] cursor-pointer hover:bg-[#FDE7E9] flex items-center justify-center transition-colors"
                      >
                        <Dismiss12Regular className="w-2.75 h-2.75" />
                      </button>
                    </>
                  )}

                  {/* Read-Only Status: Hanya Detail */}
                  {(isBatal || isUlang) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetail(ev);
                      }}
                      title={`Kegiatan ${ev.labelStatus || ''} hanya bisa dibaca`}
                      className="flex-none h-6 px-2 border-none bg-transparent text-(--color-brand) text-[11.5px] cursor-pointer rounded whitespace-nowrap hover:bg-(--color-brand-subtle) transition-colors"
                    >
                      Lihat detail
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex-1 min-h-0" />
        </div>
      </div>

      {/* 3. Sticky Bottom Summary Bar */}
      <div className="flex-none h-7.5 border-t border-(--color-border) bg-[#FAFAFA] flex items-center gap-2.5 px-3.5 text-[11.5px] text-(--color-text-muted) select-none">
        <span className="flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">
          {footerText}
        </span>
        {isPotong && (
          <span className="flex-none text-[#8A5200] whitespace-nowrap">
            hanya {MAX_DISPLAY_ROWS} baris pertama dimuat
          </span>
        )}
      </div>
    </div>
  );
};
