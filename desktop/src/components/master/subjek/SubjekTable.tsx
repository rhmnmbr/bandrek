import type { Subjek, MataPelajaran } from '@/data/types/master';

interface SubjekTableProps {
  subjekList: Subjek[];
  selectedId: string | null;
  mapelList: MataPelajaran[];
  onSelectSubjek: (id: string) => void;
  onOpenProfil: (id: string) => void;
  totalDb: number;
  filterAktifOnly: boolean;
}

export function SubjekTable({
  subjekList,
  selectedId,
  mapelList,
  onSelectSubjek,
  onOpenProfil,
  totalDb,
  filterAktifOnly,
}: SubjekTableProps) {
  const mapelMap = new Map(mapelList.map((m) => [m.id, m.nama]));

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="flex flex-col min-h-full min-w-[718px] w-full">
          {/* Sticky Header */}
          <div className="sticky top-0 z-3 flex h-6.5 shrink-0 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
            <div className="w-[210px] shrink-0">NAMA LENGKAP</div>
            <div className="w-[92px] shrink-0">KELAMIN</div>
            <div className="flex-1 min-w-[120px]">MATA PELAJARAN</div>
            <div className="w-[126px] shrink-0">KONTAK</div>
            <div className="w-[74px] shrink-0 text-right">KEGIATAN</div>
            <div className="w-[78px] shrink-0 pl-2">STATUS</div>
          </div>

          {/* Table Body */}
          {subjekList.map((sb) => {
            const isDipilih = selectedId === sb.id;
            const mp = (sb.mapel || []).map((id) => mapelMap.get(id) || id).filter(Boolean);
            const kelaminText =
              sb.kelamin === 'L' ? 'Laki-laki' : sb.kelamin === 'P' ? 'Perempuan' : '—';
            const rowTitle = `${sb.nama} · ${sb.jumlahKegiatan || 0} kegiatan`;

            return (
              <div
                key={sb.id}
                onClick={() => onSelectSubjek(sb.id)}
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
                    onOpenProfil(sb.id);
                  }}
                  title={`Lihat profil ${sb.nama}`}
                  className={`w-[210px] shrink-0 truncate pr-2 cursor-pointer hover:underline hover:text-(--color-brand-ink) ${
                    isDipilih ? 'font-semibold' : 'font-normal'
                  } ${sb.aktif ? 'text-(--color-text-primary)' : 'text-(--color-text-muted) line-through'}`}
                >
                  {sb.nama}
                </div>

                {/* Kelamin */}
                <div
                  className={`w-[92px] shrink-0 ${
                    sb.kelamin ? 'text-(--color-text-secondary)' : 'text-(--color-text-disabled)'
                  }`}
                >
                  {kelaminText}
                </div>

                {/* Mapel */}
                <div
                  className={`flex-1 min-w-[120px] truncate pr-2 ${
                    mp.length > 0 ? 'text-(--color-text-secondary)' : 'text-(--color-text-disabled)'
                  }`}
                >
                  {mp.length > 0 ? mp.join(', ') : '—'}
                </div>

                {/* Kontak */}
                <div
                  className={`w-[126px] shrink-0 truncate pr-2 font-mono text-[11.5px] ${
                    sb.kontak ? 'text-(--color-text-secondary)' : 'text-(--color-text-disabled)'
                  }`}
                >
                  {sb.kontak || '—'}
                </div>

                {/* Kegiatan */}
                <div
                  className={`w-[74px] shrink-0 text-right font-mono text-[11.5px] ${
                    sb.jumlahKegiatan ? 'text-(--color-text-primary)' : 'text-(--color-text-disabled)'
                  }`}
                >
                  {sb.jumlahKegiatan ? sb.jumlahKegiatan : '—'}
                </div>

                {/* Status */}
                <div className="w-[78px] shrink-0 pl-2">
                  <span
                    className={`inline-flex items-center h-4.5 px-2 rounded-full text-[10.5px] font-semibold border whitespace-nowrap ${
                      sb.aktif
                        ? 'border-(--color-success) bg-(--color-success-subtle) text-(--color-success-fg)'
                        : 'border-(--color-border-strong) bg-(--color-surface-sunken) text-(--color-text-muted)'
                    }`}
                  >
                    {sb.aktif ? 'Aktif' : 'Nonaktif'}
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
        Menampilkan {subjekList.length} dari {totalDb} subjek
        {filterAktifOnly && ' · subjek nonaktif disembunyikan'}
      </div>
    </div>
  );
}
