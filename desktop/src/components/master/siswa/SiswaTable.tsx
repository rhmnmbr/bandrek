import type { Siswa } from '@/data/types/master';
import { formatTanggalTahun } from '@/lib/dateUtils';

interface SiswaTableProps {
  siswaList: Siswa[];
  selectedId: string | null;
  desc: boolean;
  onToggleSort: () => void;
  onSelectSiswa: (id: string) => void;
  onOpenProfil: (id: string) => void;
  totalDb: number;
  filterAktifOnly: boolean;
}

export function SiswaTable({
  siswaList,
  selectedId,
  desc,
  onToggleSort,
  onSelectSiswa,
  onOpenProfil,
  totalDb,
  filterAktifOnly,
}: SiswaTableProps) {
  const urutGlyph = desc ? '↓' : '↑';
  const urutTitle = desc ? 'Urut Z–A — klik untuk A–Z' : 'Urut A–Z — klik untuk Z–A';

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="flex flex-col min-h-full min-w-[862px] w-full">
          {/* Sticky Header */}
          <div className="sticky top-0 z-3 flex h-6.5 shrink-0 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
            <button
              type="button"
              onClick={onToggleSort}
              title={urutTitle}
              className="flex h-6.5 w-59 shrink-0 items-center gap-1 border-none bg-transparent p-0 text-left text-[10.5px] font-semibold tracking-wider text-(--color-brand) hover:text-(--color-brand-pressed) cursor-pointer transition-colors"
            >
              NAMA <span>{urutGlyph}</span>
            </button>
            <div className="w-13 shrink-0">JNJ</div>
            <div className="w-21.5 shrink-0">LAHIR</div>
            <div className="flex-1 min-w-27.5">ASAL SEKOLAH</div>
            <div className="w-29.5 shrink-0">WALI</div>
            <div className="w-29.5 shrink-0">WHATSAPP</div>
            <div className="w-10 shrink-0 text-right">KEG</div>
            <div className="w-18.5 shrink-0 pl-2">STATUS</div>
          </div>

          {/* Table Body */}
          {siswaList.map((sw) => {
            const isDipilih = selectedId === sw.id;
            const rowTitle =
              (sw.daftarKelasDetail || []).length > 0
                ? `${sw.nama} · ${(sw.daftarKelasDetail || []).map((k) => k.nama).join(', ')}`
                : `${sw.nama} · belum masuk kelas mana pun`;

            return (
              <div
                key={sw.id}
                onClick={() => onSelectSiswa(sw.id)}
                title={rowTitle}
                className={`flex h-8 shrink-0 items-center border-b border-(--color-border-subtle) px-3.5 text-[12.5px] cursor-pointer transition-colors ${
                  isDipilih
                    ? 'bg-(--color-brand-subtle) shadow-[inset_3px_0_0_var(--color-brand)]'
                    : 'bg-(--color-surface) hover:bg-(--color-surface-alt)'
                }`}
              >
                {/* Nama (Clicking text opens profile) */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProfil(sw.id);
                  }}
                  title={`Lihat profil ${sw.nama}`}
                  className={`w-59 shrink-0 truncate pr-2 cursor-pointer hover:underline hover:text-(--color-brand-ink) ${
                    isDipilih ? 'font-semibold' : 'font-normal'
                  } ${sw.aktif ? 'text-(--color-text-primary)' : 'text-(--color-text-muted) line-through'}`}
                >
                  {sw.nama}
                </div>

                {/* Jenjang */}
                <div className="w-13 shrink-0 text-(--color-text-secondary)">{sw.jenjang}</div>

                {/* Tanggal Lahir */}
                <div className="w-21.5 shrink-0 font-mono text-[11.5px] text-(--color-text-muted) whitespace-nowrap">
                  {sw.lahir ? formatTanggalTahun(sw.lahir) : '—'}
                </div>

                {/* Asal Sekolah */}
                <div
                  className={`flex-1 min-w-27.5 truncate pr-2 ${
                    sw.asal ? 'text-(--color-text-secondary)' : 'text-(--color-text-disabled)'
                  }`}
                >
                  {sw.asal || '—'}
                </div>

                {/* Wali */}
                <div
                  className={`w-29.5 shrink-0 truncate pr-2 ${
                    sw.waliNama ? 'text-(--color-text-secondary)' : 'text-(--color-text-disabled)'
                  }`}
                >
                  {sw.waliNama || '—'}
                </div>

                {/* WhatsApp */}
                <div
                  className={`w-29.5 shrink-0 truncate pr-2 font-mono text-[11.5px] ${
                    sw.waliWa ? 'text-(--color-text-secondary)' : 'text-(--color-text-disabled)'
                  }`}
                >
                  {sw.waliWa || '—'}
                </div>

                {/* Jumlah Kegiatan */}
                <div
                  className={`w-10 shrink-0 text-right font-mono text-[11.5px] ${
                    (sw.jumlahKegiatan || 0) > 0
                      ? 'text-(--color-text-primary)'
                      : 'text-(--color-text-disabled)'
                  }`}
                >
                  {(sw.jumlahKegiatan || 0) > 0 ? sw.jumlahKegiatan : '—'}
                </div>

                {/* Status Pill */}
                <div className="w-18.5 shrink-0 pl-2">
                  <span
                    className={`inline-flex h-4.5 items-center px-2 rounded-full text-[10.5px] font-semibold border whitespace-nowrap ${
                      sw.aktif
                        ? 'border-(--color-success) bg-(--color-success-bg) text-(--color-success-ink)'
                        : 'border-(--color-border-strong) bg-(--color-surface-sunken) text-(--color-text-muted)'
                    }`}
                  >
                    {sw.aktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            );
          })}

          <div className="flex-1 min-h-0" />
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="flex h-7.5 shrink-0 items-center border-t border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[11.5px] text-(--color-text-muted)">
        Menampilkan {siswaList.length} dari {totalDb} siswa
        {filterAktifOnly ? ' · siswa nonaktif disembunyikan' : ''}
      </div>
    </div>
  );
}
