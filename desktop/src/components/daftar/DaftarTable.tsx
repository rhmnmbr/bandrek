import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatTanggalPendek, toIso } from '@/lib/dateUtils';
import type { Kegiatan } from '@/data/types/kegiatan';
import {
  Warning12Regular,
  Checkmark12Regular,
  Dismiss12Regular,
  ArrowClockwise12Regular,
  MoreVertical16Regular,
  Edit16Regular,
  Eye16Regular,
  Dismiss16Regular,
  ArrowClockwise16Regular,
  ArrowSync16Regular,
} from '@fluentui/react-icons';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';

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

interface MenuState {
  kegiatan: Kegiatan;
  anchorEl: HTMLElement;
}

interface DaftarTableRowProps {
  ev: Kegiatan;
  isToday: boolean;
  isMenuOpen: boolean;
  onOpenDetail: (kegiatan: Kegiatan) => void;
  onToggleMenu: (kegiatan: Kegiatan, el: HTMLElement) => void;
}

const DaftarTableRow = React.memo<DaftarTableRowProps>(({
  ev,
  isToday,
  isMenuOpen,
  onOpenDetail,
  onToggleMenu,
}) => {
  const isBatal = ev.status === 'dibatalkan';
  const isUlang = ev.status === 'dijadwal_ulang';
  const isTerealisasi = ev.status === 'terealisasi';
  const isBelum = ev.status === 'belum_direalisasi';
  const isTerjadwal = ev.status === 'terjadwal';
  const perlu = ev.perluRealisasi ?? isBelum;

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
      onClick={() => onOpenDetail(ev)}
      className={cn(
        'flex items-center h-8 flex-none border-b border-[#EDEBE9] px-3.5 text-[12.5px] cursor-pointer transition-colors w-full min-w-full',
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
          'flex-1 min-w-40 whitespace-nowrap overflow-hidden text-ellipsis pr-2 flex items-center gap-1.5',
          perlu ? 'font-semibold' : 'font-normal',
          isBatal ? 'line-through text-[#5C5A58]' : 'text-[#242424]'
        )}
      >
        <span className="truncate">{ev.nama}</span>
        {ev.seriId && (
          <span
            title={`Kegiatan berulang: Pertemuan ${ev.urutanSeri ?? 1} dari ${ev.totalSeri ?? '?'}`}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.25 rounded text-[10px] font-medium bg-[#F3F2F1] text-[#5C5A58] border border-[#E1DFDD] flex-none"
          >
            <ArrowSync16Regular className="w-2.75 h-2.75 text-(--color-brand)" />
            <span>
              {ev.urutanSeri ?? 1}/{ev.totalSeri ?? '?'}
            </span>
          </span>
        )}
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
          <span className="leading-none -translate-y-px">
            {ev.labelStatus || 'Terjadwal'}
          </span>
        </span>
      </div>

      {/* AKSI: MENU TITIK TIGA */}
      <div className="w-10 flex-none flex items-center justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu(ev, e.currentTarget);
          }}
          title={`Menu aksi ${ev.nama}`}
          className={cn(
            'w-6.5 h-6.5 rounded flex items-center justify-center transition-colors cursor-pointer',
            isMenuOpen
              ? 'bg-(--color-surface-sunken) text-(--color-text)'
              : 'text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-sunken)'
          )}
        >
          <MoreVertical16Regular className="w-4 h-4 flex-none" />
        </button>
      </div>
    </div>
  );
});
DaftarTableRow.displayName = 'DaftarTableRow';

export const DaftarTable: React.FC<DaftarTableProps> = ({
  kegiatanList,
  simulatedToday = toIso(new Date()),
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
  const [menuState, setMenuState] = React.useState<MenuState | null>(null);
  const total = kegiatanList.length;
  const isPotong = total > MAX_DISPLAY_ROWS;
  const displayList = isPotong ? kegiatanList.slice(0, MAX_DISPLAY_ROWS) : kegiatanList;

  const handleToggleMenu = React.useCallback((keg: Kegiatan, el: HTMLElement) => {
    setMenuState((prev) =>
      prev?.kegiatan.id === keg.id ? null : { kegiatan: keg, anchorEl: el }
    );
  }, []);

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
        className="flex-1 min-h-0 overflow-auto select-none"
      >
        <div className="flex flex-col min-h-full min-w-[1060px] w-full">
          {/* 1. Sticky Table Header */}
          <div className="flex items-center h-6.5 flex-none sticky top-0 z-10 w-full min-w-full bg-[#FAFAFA] border-b border-(--color-border) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
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

            {/* AKSI SPHERICAL / EMPTY HEADER */}
            <div className="w-10 flex-none" />
          </div>

          {/* 2. Table Rows */}
          {displayList.map((ev) => (
            <DaftarTableRow
              key={ev.id}
              ev={ev}
              isToday={ev.tanggal === simulatedToday}
              isMenuOpen={menuState?.kegiatan.id === ev.id}
              onOpenDetail={onOpenDetail}
              onToggleMenu={handleToggleMenu}
            />
          ))}

          <div className="flex-1 min-h-0" />
        </div>
      </div>

      {/* Single Anchored Action Popover */}
      {menuState && (
        <Popover
          key={menuState.kegiatan.id}
          open={Boolean(menuState)}
          onOpenChange={(open) => {
            if (!open) setMenuState(null);
          }}
        >
          <PopoverAnchor virtualRef={{ current: menuState.anchorEl }} />
          <PopoverContent
            align="end"
            side="bottom"
            sideOffset={4}
            className="w-48 p-1 flex flex-col gap-0.5 bg-white border border-(--color-border) rounded-md shadow-(--shadow-overlay) text-[12px] select-none z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Isi Realisasi (jika belum atau jadwal sudah tiba) */}
            {(menuState.kegiatan.status === 'belum_direalisasi' ||
              (menuState.kegiatan.status === 'terjadwal' &&
                menuState.kegiatan.aksiDiizinkan?.includes('isi_realisasi'))) && (
              <button
                type="button"
                onClick={() => {
                  const keg = menuState.kegiatan;
                  setMenuState(null);
                  onIsiRealisasi(keg);
                }}
                className="w-full h-7 px-2.5 rounded text-left flex items-center gap-2 hover:bg-(--color-surface-alt) text-(--color-brand) font-medium cursor-pointer transition-colors"
              >
                <Edit16Regular className="w-3.5 h-3.5 flex-none" />
                <span>Isi realisasi</span>
              </button>
            )}

            {/* 2. Ubah Realisasi (jika sudah terealisasi) */}
            {menuState.kegiatan.status === 'terealisasi' && (
              <button
                type="button"
                onClick={() => {
                  const keg = menuState.kegiatan;
                  setMenuState(null);
                  onIsiRealisasi(keg);
                }}
                className="w-full h-7 px-2.5 rounded text-left flex items-center gap-2 hover:bg-(--color-surface-alt) text-(--color-brand) font-medium cursor-pointer transition-colors"
              >
                <Edit16Regular className="w-3.5 h-3.5 flex-none" />
                <span>Ubah realisasi</span>
              </button>
            )}

            {/* 3. Jadwalkan Ulang (Terjadwal & Belum) */}
            {(menuState.kegiatan.status === 'terjadwal' ||
              menuState.kegiatan.status === 'belum_direalisasi') && (
              <button
                type="button"
                onClick={() => {
                  const keg = menuState.kegiatan;
                  setMenuState(null);
                  onJadwalUlang(keg);
                }}
                className="w-full h-7 px-2.5 rounded text-left flex items-center gap-2 hover:bg-(--color-surface-alt) text-(--color-text) cursor-pointer transition-colors"
              >
                <ArrowClockwise16Regular className="w-3.5 h-3.5 flex-none text-(--color-text-secondary)" />
                <span>Jadwalkan ulang</span>
              </button>
            )}

            {/* 4. Batalkan (Terjadwal & Belum) */}
            {(menuState.kegiatan.status === 'terjadwal' ||
              menuState.kegiatan.status === 'belum_direalisasi') && (
              <button
                type="button"
                onClick={() => {
                  const keg = menuState.kegiatan;
                  setMenuState(null);
                  onBatalkan(keg);
                }}
                className="w-full h-7 px-2.5 rounded text-left flex items-center gap-2 hover:bg-[#FDE7E9] text-[#9B0C18] cursor-pointer transition-colors"
              >
                <Dismiss16Regular className="w-3.5 h-3.5 flex-none text-[#9B0C18]" />
                <span>Batalkan kegiatan</span>
              </button>
            )}

            {/* Divider jika ada aksi lain sebelum Lihat Detail */}
            {(menuState.kegiatan.status === 'terjadwal' ||
              menuState.kegiatan.status === 'belum_direalisasi' ||
              menuState.kegiatan.status === 'terealisasi') && (
              <div className="h-px bg-(--color-border) my-0.5" />
            )}

            {/* 5. Lihat Detail */}
            <button
              type="button"
              onClick={() => {
                const keg = menuState.kegiatan;
                setMenuState(null);
                onOpenDetail(keg);
              }}
              className="w-full h-7 px-2.5 rounded text-left flex items-center gap-2 hover:bg-(--color-surface-alt) text-(--color-text) cursor-pointer transition-colors"
            >
              <Eye16Regular className="w-3.5 h-3.5 flex-none text-(--color-text-secondary)" />
              <span>Lihat detail</span>
            </button>
          </PopoverContent>
        </Popover>
      )}

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
