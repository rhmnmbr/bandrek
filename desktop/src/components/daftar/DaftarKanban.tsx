import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatTanggalPendek } from '@/lib/dateUtils';
import type { Kegiatan } from '@/data/types/kegiatan';
import {
  Warning16Regular,
  Warning12Regular,
  Checkmark16Regular,
  Checkmark12Regular,
  Clock16Regular,
  ArrowSync16Regular,
  Person12Regular,
  Building16Regular,
  Book16Regular,
  People12Regular,
} from '@fluentui/react-icons';

export interface DaftarKanbanProps {
  kegiatanList: Kegiatan[];
  simulatedToday?: string;
  onOpenDetail: (kegiatan: Kegiatan) => void;
  onIsiRealisasi: (kegiatan: Kegiatan) => void;
  onJadwalUlang: (kegiatan: Kegiatan) => void;
  onBatalkan: (kegiatan: Kegiatan) => void;
}

interface KanbanColumnConfig {
  id: 'terjadwal' | 'perlu' | 'terealisasi' | 'batal';
  title: string;
  subtitle: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: React.ReactNode;
  predicate: (k: Kegiatan) => boolean;
}

const COLUMNS: KanbanColumnConfig[] = [
  {
    id: 'terjadwal',
    title: 'Terjadwal',
    subtitle: 'Akan datang atau belum waktunya',
    badgeBg: 'bg-(--color-surface-alt)',
    badgeBorder: 'border-(--color-border)',
    badgeText: 'text-(--color-text-secondary)',
    icon: <Clock16Regular className="w-3.5 h-3.5 text-(--color-text-secondary)" />,
    predicate: (k) => k.status === 'terjadwal',
  },
  {
    id: 'perlu',
    title: 'Perlu Realisasi',
    subtitle: 'Waktu lewat, belum diisi kehadiran & materi',
    badgeBg: 'bg-[#FFF3E0]',
    badgeBorder: 'border-[#F0A82E]',
    badgeText: 'text-[#8A5200]',
    icon: <Warning16Regular className="w-3.5 h-3.5 text-[#C47D00]" />,
    predicate: (k) => k.status === 'belum_direalisasi',
  },
  {
    id: 'terealisasi',
    title: 'Terealisasi',
    subtitle: 'Kehadiran & materi tuntas dicatat',
    badgeBg: 'bg-[#E8F5E9]',
    badgeBorder: 'border-[#4CAF50]',
    badgeText: 'text-[#2E7D32]',
    icon: <Checkmark16Regular className="w-3.5 h-3.5 text-[#2E7D32]" />,
    predicate: (k) => k.status === 'terealisasi',
  },
  {
    id: 'batal',
    title: 'Batal & Jadwal Ulang',
    subtitle: 'Dibatalkan atau dialihkan ke jadwal lain',
    badgeBg: 'bg-(--color-surface-sunken)',
    badgeBorder: 'border-(--color-border-subtle)',
    badgeText: 'text-(--color-text-muted)',
    icon: <ArrowSync16Regular className="w-3.5 h-3.5 text-(--color-text-muted)" />,
    predicate: (k) => k.status === 'dibatalkan' || k.status === 'dijadwal_ulang',
  },
];

export const DaftarKanban: React.FC<DaftarKanbanProps> = ({
  kegiatanList,
  onOpenDetail,
  onIsiRealisasi,
  onJadwalUlang,
  onBatalkan,
}) => {
  return (
    <div className="flex-1 min-h-0 overflow-x-auto bg-(--color-surface-alt) p-3 select-none">
      <div className="flex h-full gap-3 min-w-310">
        {COLUMNS.map((col) => {
          const items = kegiatanList.filter(col.predicate);

          return (
            <div
              key={col.id}
              className="flex-1 flex flex-col rounded-lg border border-(--color-border) bg-(--color-surface) min-h-0 shadow-xs overflow-hidden"
            >
              {/* Column Header */}
              <div
                className={cn(
                  'flex flex-col gap-0.5 px-3 py-2.5 border-b border-(--color-border) bg-(--color-surface)',
                  col.id === 'perlu' && 'border-b-2 border-b-[#F0A82E] bg-[#FFFDF8]',
                  col.id === 'terealisasi' && 'border-b-2 border-b-[#4CAF50] bg-[#FAFCFA]'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-[13px] text-(--color-text-primary)">
                    {col.icon}
                    <span>{col.title}</span>
                  </div>
                  <span
                    className={cn(
                      'flex h-5 min-w-5 items-center justify-center rounded-full border px-1.5 text-[11px] font-bold font-mono',
                      col.badgeBg,
                      col.badgeBorder,
                      col.badgeText
                    )}
                  >
                    {items.length}
                  </span>
                </div>
                <p className="text-[11px] text-(--color-text-muted) truncate leading-tight">
                  {col.subtitle}
                </p>
              </div>

              {/* Column Cards Container (Vertical Scroll) */}
              <div className="flex-1 min-h-0 overflow-y-auto p-2 flex flex-col gap-2">
                {items.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-(--color-border) p-4 text-center text-xs text-(--color-text-muted)">
                    Tidak ada kegiatan
                  </div>
                ) : (
                  items.map((k) => {
                    const isPerlu = k.status === 'belum_direalisasi';
                    const isTerealisasi = k.status === 'terealisasi';
                    const isBatal = k.status === 'dibatalkan';
                    const isUlang = k.status === 'dijadwal_ulang';

                    // Hitung hadir dari realisasi jika ada
                    const hadirCount = k.realisasi?.kehadiran
                      ? Object.values(k.realisasi.kehadiran).filter((st) => st === 'hadir').length
                      : null;

                    return (
                      <div
                        key={k.id}
                        onClick={() => onOpenDetail(k)}
                        className={cn(
                          'group relative rounded-md border border-(--color-border) bg-(--color-surface) p-2.5 shadow-xs transition-all cursor-pointer flex flex-col gap-2',
                          'hover:border-(--color-brand) hover:shadow-sm',
                          isPerlu && 'border-[#F0A82E] bg-[#FFFDF8] hover:border-[#D48806]',
                          (isBatal || isUlang) && 'opacity-85 bg-(--color-surface-alt)'
                        )}
                      >
                        {/* Waktu & Jenis */}
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="font-mono text-(--color-text-secondary) font-medium truncate">
                            {k.mulai} - {k.selesai} · {formatTanggalPendek(k.tanggal)}
                          </span>
                          <span className="flex-none rounded-full px-2 py-0.5 text-[10.5px] font-medium border border-(--color-border) bg-(--color-surface-alt) text-(--color-text-secondary)">
                            {k.namaJenis}
                          </span>
                        </div>

                        {/* Judul Kegiatan */}
                        <h4
                          className={cn(
                            'text-[13px] font-semibold text-(--color-text-primary) leading-snug line-clamp-2',
                            (isBatal || isUlang) && 'line-through text-(--color-text-secondary)'
                          )}
                        >
                          {k.nama}
                        </h4>

                        {/* Mapel & Materi */}
                        {k.namaMapel && (
                          <div className="flex items-center gap-1.5 text-xs text-(--color-text-secondary) truncate">
                            <Book16Regular className="w-3.5 h-3.5 flex-none text-(--color-text-muted)" />
                            <span className="font-medium text-(--color-text-primary)">
                              {k.namaMapel}
                            </span>
                            {k.namaMateri && (
                              <>
                                <span className="text-(--color-text-muted)">·</span>
                                <span className="truncate">{k.namaMateri}</span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Ruangan & Subjek & Peserta */}
                        <div className="flex flex-col gap-1 pt-1 border-t border-(--color-border-subtle) text-[11.5px] text-(--color-text-secondary)">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 truncate">
                              <Building16Regular className="w-3.5 h-3.5 flex-none text-(--color-text-muted)" />
                              <span className="truncate">
                                {k.namaRuangan || k.namaTempat || 'Tanpa ruangan'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 flex-none text-(--color-text-muted)">
                              <People12Regular className="w-3.5 h-3.5" />
                              <span>{k.siswa.length} siswa</span>
                            </div>
                          </div>

                          {k.pengisiUtama?.nama && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Person12Regular className="w-3.5 h-3.5 flex-none text-(--color-text-muted)" />
                              <span className="truncate">{k.pengisiUtama.nama}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Footer per status */}
                        {isPerlu && (
                          <div className="pt-1.5 mt-0.5 border-t border-[#F0A82E]/30">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onIsiRealisasi(k);
                              }}
                              className="w-full h-7 rounded bg-[#FFF3E0] hover:bg-[#FFE0B2] border border-[#F0A82E] text-[#8A5200] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                              title="Buka form input kehadiran dan konfirmasi materi"
                            >
                              <Warning12Regular className="text-[#C47D00]" />
                              <span>Isi Realisasi</span>
                            </button>
                          </div>
                        )}

                        {isTerealisasi && (
                          <div className="pt-1 mt-0.5 border-t border-(--color-border-subtle) flex items-center justify-between text-[11px]">
                            <span className="inline-flex items-center gap-1 text-[#2E7D32] font-semibold">
                              <Checkmark12Regular />
                              <span>Terealisasi</span>
                            </span>
                            {hadirCount !== null && (
                              <span className="font-mono text-(--color-text-muted)">
                                {hadirCount} dari {k.siswa.length} hadir
                              </span>
                            )}
                          </div>
                        )}

                        {k.status === 'terjadwal' && (
                          <div className="pt-1 mt-0.5 border-t border-(--color-border-subtle) flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onJadwalUlang(k);
                              }}
                              className="h-6 px-2 rounded border border-(--color-border) bg-(--color-surface) text-(--color-text-secondary) hover:bg-(--color-surface-alt) text-[11px] cursor-pointer transition-colors"
                            >
                              Jadwal ulang
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onBatalkan(k);
                              }}
                              className="h-6 px-2 rounded border border-(--color-border) bg-(--color-surface) text-(--color-danger) hover:bg-(--color-danger-subtle) text-[11px] cursor-pointer transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                        )}

                        {(isBatal || isUlang) && (
                          <div className="pt-1 mt-0.5 border-t border-(--color-border-subtle) text-[11px] text-(--color-text-muted) italic truncate">
                            {isBatal
                              ? `Dibatalkan: ${k.pembatalan?.alasan || 'Tanpa keterangan'}`
                              : `Dijadwal ulang: ${k.penjadwalanUlang?.alasan || 'Perubahan waktu'}`}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
