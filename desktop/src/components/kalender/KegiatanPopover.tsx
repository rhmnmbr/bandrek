import * as React from 'react';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatTanggalRingkas, NAMA_BULAN_PENDEK, toDate } from '@/lib/dateUtils';
import type { Kegiatan } from '@/data/types/kegiatan';
import type { Subjek, Siswa, Kelas } from '@/data/types/master';
import {
  Dismiss16Regular,
  ChevronDown12Regular,
} from '@fluentui/react-icons';
import { KegiatanBadge } from '@/components/ui/badge';

export interface KegiatanPopoverProps {
  kegiatan: Kegiatan | null;
  anchorElement: HTMLElement | null;
  isOpen: boolean;
  onClose: () => void;
  subjekList: Subjek[];
  siswaList: Siswa[];
  kelasList: Kelas[];
  kegiatanList?: Kegiatan[];
  onOpenDetail?: (kegiatan: Kegiatan) => void;
  onOpenEdit?: (kegiatan: Kegiatan) => void;
  onOpenRealisasi?: (kegiatan: Kegiatan) => void;
  onOpenJadwalUlang?: (kegiatan: Kegiatan) => void;
  onOpenBatal?: (kegiatan: Kegiatan) => void;
  onNavigateKegiatan?: (kegiatanId: string) => void;
}

export const KegiatanPopover: React.FC<KegiatanPopoverProps> = ({
  kegiatan,
  anchorElement,
  isOpen,
  onClose,
  subjekList,
  siswaList,
  kelasList,
  kegiatanList = [],
  onOpenDetail,
  onOpenEdit,
  onOpenRealisasi,
  onOpenJadwalUlang,
  onOpenBatal,
  onNavigateKegiatan,
}) => {
  const [isSiswaOpen, setIsSiswaOpen] = React.useState(false);

  if (!isOpen || !kegiatan || !anchorElement) return null;

  const isBatal = kegiatan.status === 'dibatalkan';

  // Subjek names map
  const subjekMap = new Map(subjekList.map((s) => [s.id, s.nama]));

  // Siswa map
  const siswaMap = new Map(siswaList.map((sw) => [sw.id, sw]));

  // Kelas map
  const kelasMap = new Map(kelasList.map((k) => [k.id, k.nama]));
  const namaKelas = kegiatan.kelas ? kelasMap.get(kegiatan.kelas) : null;

  // Rescheduled helper
  const ringkasEvent = (targetId: string) => {
    const ev = kegiatanList.find((k) => k.id === targetId);
    if (!ev) return null;
    const d = toDate(ev.tanggal);
    const tgl = `${d.getDate()} ${NAMA_BULAN_PENDEK[d.getMonth()]}`;
    return {
      id: ev.id,
      teks: `${ev.nama} · ${tgl} ${ev.mulai}–${ev.selesai}`,
    };
  };

  const targetJadwalUlangKe = kegiatan.jadwalUlangKe ? ringkasEvent(kegiatan.jadwalUlangKe) : null;
  const targetJadwalUlangDari = kegiatan.jadwalUlangDari ? ringkasEvent(kegiatan.jadwalUlangDari) : null;

  // Student list items
  const daftarSiswa = kegiatan.siswa
    .map((id) => siswaMap.get(id))
    .filter((sw): sw is Siswa => Boolean(sw));

  const virtualRef = React.useMemo(
    () => ({ current: anchorElement }),
    [anchorElement]
  );

  return (
    <Popover open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <PopoverAnchor virtualRef={virtualRef} />
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        collisionPadding={8}
        className="w-[340px] p-0 overflow-hidden bg-white border border-(--color-border-strong) rounded-lg shadow-(--shadow-overlay) duration-(--dur-normal) z-50 text-(--color-text)"
      >
        {/* 1. Header: Title + Status Badge + Close Button */}
        <div className="pt-3 px-3.5 pb-0 flex justify-between gap-2.5 items-start">
          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                'text-[15px] font-semibold leading-tight wrap-break-word',
                isBatal && 'line-through text-(--color-text-muted)'
              )}
            >
              {kegiatan.nama}
            </h3>
            <KegiatanBadge status={kegiatan.status} className="mt-1.5" />
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Tutup · Esc"
            className="w-[22px] h-[22px] flex-none rounded flex items-center justify-center text-[#5C5A58] hover:bg-[#EDEBE9] hover:text-[#242424] cursor-pointer transition-colors"
          >
            <Dismiss16Regular className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. Metadata Rows */}
        <div className="pt-2.5 px-3.5 flex flex-col gap-1.5 text-[12.5px] text-[#424242]">
          {/* Row: Waktu */}
          <div className="flex gap-2.5 leading-[1.45]">
            <span className="w-[66px] flex-none text-[#5C5A58]">Waktu</span>
            <span className="flex-1 min-w-0 font-mono text-[12px]">
              {formatTanggalRingkas(kegiatan.tanggal)} · {kegiatan.mulai}–{kegiatan.selesai}
            </span>
          </div>

          {/* Row: Jenis */}
          <div className="flex gap-2.5 leading-[1.45]">
            <span className="w-[66px] flex-none text-[#5C5A58]">Jenis</span>
            <span className="flex-1 min-w-0">{kegiatan.namaJenis || '—'}</span>
          </div>

          {/* Row: Materi (if exists) */}
          {(kegiatan.namaMateri || kegiatan.materi) && (
            <div className="flex gap-2.5 leading-[1.45]">
              <span className="w-[66px] flex-none text-[#5C5A58]">Materi</span>
              <span className="flex-1 min-w-0">
                {kegiatan.namaMapel ? `${kegiatan.namaMapel} › ` : ''}
                {kegiatan.namaMateri || '—'}
              </span>
            </div>
          )}

          {/* Row: Tempat & Ruangan */}
          <div className="flex gap-2.5 leading-[1.45]">
            <span className="w-[66px] flex-none text-[#5C5A58]">Tempat</span>
            <span className="flex-1 min-w-0">
              {kegiatan.namaTempat && kegiatan.namaRuangan
                ? `${kegiatan.namaTempat} · ${kegiatan.namaRuangan}`
                : kegiatan.namaRuangan || 'Tanpa ruangan'}
            </span>
          </div>

          {/* Row: Subjek */}
          <div className="flex gap-2.5 leading-[1.45]">
            <span className="w-[66px] flex-none text-[#5C5A58]">Subjek</span>
            <span className="flex-1 min-w-0">
              {kegiatan.subjek.length === 0 ? (
                '—'
              ) : (
                kegiatan.subjek.map((s, idx) => {
                  const sNama = subjekMap.get(s.id) || s.id;
                  return (
                    <span key={s.id}>
                      {sNama} <span className="text-[#5C5A58]">({s.peran})</span>
                      {idx < kegiatan.subjek.length - 1 ? ', ' : ''}
                    </span>
                  );
                })
              )}
            </span>
          </div>

          {/* Row: Siswa */}
          <div className="flex gap-2.5 leading-[1.45]">
            <span className="w-[66px] flex-none text-[#5C5A58]">Siswa</span>
            <div className="flex-1 min-w-0">
              {daftarSiswa.length === 0 ? (
                '—'
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsSiswaOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-[#0F6CBD] hover:text-[#115EA3] cursor-pointer text-left font-normal select-none"
                  >
                    <span>
                      {daftarSiswa.length} siswa{namaKelas ? ` · ${namaKelas}` : ''}
                    </span>
                    <ChevronDown12Regular
                      className={cn(
                        'w-2.5 h-2.5 transition-transform duration-(--dur-fast)',
                        isSiswaOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  {isSiswaOpen && (
                    <div className="mt-1.5 border border-[#E1DFDD] rounded max-h-32 overflow-y-auto bg-white">
                      {daftarSiswa.map((sw) => (
                        <div
                          key={sw.id}
                          className="flex items-center gap-2 py-1 px-2 border-b border-[#F5F5F5] last:border-b-0 text-[12px]"
                        >
                          <span className="flex-1 min-w-0 truncate font-normal">
                            {sw.nama}
                          </span>
                          <span className="text-[11px] text-[#5C5A58] flex-none">
                            {sw.jenjang}
                          </span>
                          <span
                            className={cn(
                              'text-[10.5px] px-1.5 h-4 flex items-center rounded-full flex-none',
                              sw.aktif
                                ? 'bg-[#E8F5E9] text-[#2E7D32]'
                                : 'bg-[#F5F5F5] text-[#5C5A58]'
                            )}
                          >
                            {sw.aktif ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Row: Dibatalkan (if cancel record exists) */}
          {kegiatan.pembatalan && (
            <div className="flex gap-2.5 leading-[1.45]">
              <span className="w-[66px] flex-none text-[#5C5A58]">Dibatalkan</span>
              <span className="flex-1 min-w-0">
                {kegiatan.pembatalan.alasan || 'Tanpa alasan tercatat'}
                {kegiatan.pembatalan.keterangan ? ` — ${kegiatan.pembatalan.keterangan}` : ''} ·{' '}
                {kegiatan.pembatalan.pada}
              </span>
            </div>
          )}

          {/* Row: Alasan (if reschedule record exists) */}
          {kegiatan.penjadwalanUlang && (
            <div className="flex gap-2.5 leading-[1.45]">
              <span className="w-[66px] flex-none text-[#5C5A58]">Alasan</span>
              <span className="flex-1 min-w-0">
                {kegiatan.penjadwalanUlang.alasan || 'Tanpa alasan tercatat'}
                {kegiatan.penjadwalanUlang.keterangan
                  ? ` — ${kegiatan.penjadwalanUlang.keterangan}`
                  : ''}{' '}
                · {kegiatan.penjadwalanUlang.pada}
              </span>
            </div>
          )}

          {/* Row: Reschedule Link To */}
          {targetJadwalUlangKe && (
            <div className="flex gap-2.5 leading-[1.45]">
              <span className="w-[66px] flex-none text-[#5C5A58]">Pindah ke</span>
              <button
                type="button"
                onClick={() => onNavigateKegiatan?.(targetJadwalUlangKe.id)}
                className="flex-1 min-w-0 text-left text-[12.5px] leading-[1.45] text-[#0F6CBD] hover:text-[#115EA3] underline cursor-pointer truncate"
              >
                {targetJadwalUlangKe.teks}
              </button>
            </div>
          )}

          {/* Row: Reschedule Link From */}
          {targetJadwalUlangDari && (
            <div className="flex gap-2.5 leading-[1.45]">
              <span className="w-[66px] flex-none text-[#5C5A58]">Pindahan dari</span>
              <button
                type="button"
                onClick={() => onNavigateKegiatan?.(targetJadwalUlangDari.id)}
                className="flex-1 min-w-0 text-left text-[12.5px] leading-[1.45] text-[#0F6CBD] hover:text-[#115EA3] underline cursor-pointer truncate"
              >
                {targetJadwalUlangDari.teks}
              </button>
            </div>
          )}
        </div>

        {/* 3. Action Buttons Footer */}
        <div className="mt-3 p-3 pt-2.5 px-3.5 border-t border-[#E1DFDD] bg-[#FAFAFA] flex flex-wrap gap-1.5">
          {/* Action Set 1: Terjadwal & Belum direalisasi */}
          {(kegiatan.status === 'terjadwal' || kegiatan.status === 'belum_direalisasi') && (
            <>
              <button
                type="button"
                onClick={() => onOpenRealisasi?.(kegiatan)}
                title="Catat kehadiran dan hasil sesi ini"
                className="h-[26px] px-2.75 rounded text-xs font-semibold bg-[#0F6CBD] text-white hover:bg-[#115EA3] active:translate-y-px transition-all cursor-pointer whitespace-nowrap"
              >
                Isi realisasi
              </button>
              <button
                type="button"
                onClick={() => onOpenDetail?.(kegiatan)}
                className="h-[26px] px-2.75 rounded text-xs font-normal bg-white border border-[#C8C6C4] text-[#242424] hover:bg-[#F3F2F1] active:translate-y-px transition-all cursor-pointer whitespace-nowrap"
              >
                Lihat detail
              </button>
              <button
                type="button"
                onClick={() => onOpenEdit?.(kegiatan)}
                className="h-[26px] px-2.75 rounded text-xs font-normal bg-white border border-[#C8C6C4] text-[#242424] hover:bg-[#F3F2F1] active:translate-y-px transition-all cursor-pointer whitespace-nowrap"
              >
                Ubah kegiatan
              </button>
              <button
                type="button"
                onClick={() => onOpenJadwalUlang?.(kegiatan)}
                className="h-[26px] px-2.75 rounded text-xs font-normal bg-white border border-[#C8C6C4] text-[#242424] hover:bg-[#F3F2F1] active:translate-y-px transition-all cursor-pointer whitespace-nowrap"
              >
                Jadwalkan ulang
              </button>
              <button
                type="button"
                onClick={() => onOpenBatal?.(kegiatan)}
                className="h-[26px] px-2.75 rounded text-xs font-semibold bg-[#C50F1F] text-white hover:bg-[#A80816] active:translate-y-px transition-all cursor-pointer whitespace-nowrap"
              >
                Batalkan kegiatan
              </button>
            </>
          )}

          {/* Action Set 2: Terealisasi */}
          {kegiatan.status === 'terealisasi' && (
            <>
              <button
                type="button"
                onClick={() => onOpenRealisasi?.(kegiatan)}
                title="Perbaiki kehadiran atau catatan realisasi"
                className="h-[26px] px-2.75 rounded text-xs font-semibold bg-[#0F6CBD] text-white hover:bg-[#115EA3] active:translate-y-px transition-all cursor-pointer whitespace-nowrap"
              >
                Ubah realisasi
              </button>
              <button
                type="button"
                onClick={() => onOpenDetail?.(kegiatan)}
                className="h-[26px] px-2.75 rounded text-xs font-normal bg-white border border-[#C8C6C4] text-[#242424] hover:bg-[#F3F2F1] active:translate-y-px transition-all cursor-pointer whitespace-nowrap"
              >
                Lihat detail
              </button>
            </>
          )}

          {/* Action Set 3: Dibatalkan & Dijadwal ulang */}
          {(kegiatan.status === 'dibatalkan' || kegiatan.status === 'dijadwal_ulang') && (
            <>
              <button
                type="button"
                disabled
                title="Kegiatan yang dibatalkan atau dijadwalkan ulang tidak bisa direalisasi"
                className="h-[26px] px-2.75 rounded text-xs font-semibold bg-[#EDEBE9] text-[#8A8886] cursor-not-allowed whitespace-nowrap"
              >
                Isi realisasi
              </button>
              <button
                type="button"
                onClick={() => onOpenDetail?.(kegiatan)}
                className="h-[26px] px-2.75 rounded text-xs font-normal bg-white border border-[#C8C6C4] text-[#242424] hover:bg-[#F3F2F1] active:translate-y-px transition-all cursor-pointer whitespace-nowrap"
              >
                Lihat detail
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
