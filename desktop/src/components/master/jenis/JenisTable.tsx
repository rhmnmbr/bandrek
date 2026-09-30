import type { JenisKegiatan } from '@/data/types/master';
import { JENIS_WARNA } from './palette';

interface JenisTableProps {
  jenisList: JenisKegiatan[];
  selectedId: string | null;
  onSelectJenis: (id: string) => void;
  totalDb: number;
  onToggleMateriWajib: (item: JenisKegiatan) => void;
  onToggleSiswaWajib: (item: JenisKegiatan) => void;
}

export function JenisTable({
  jenisList,
  selectedId,
  onSelectJenis,
  totalDb,
  onToggleMateriWajib,
  onToggleSiswaWajib,
}: JenisTableProps) {
  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col min-h-full">
          {/* Sticky Header */}
          <div className="sticky top-0 z-3 flex h-6.5 shrink-0 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
            <div className="flex-1 min-w-[140px] pr-2">JENIS KEGIATAN</div>
            <div className="w-[104px] shrink-0 pr-2">MATERI</div>
            <div className="w-[100px] shrink-0 pr-2">SISWA</div>
            <div className="w-[84px] shrink-0 text-right pr-2">KEGIATAN</div>
          </div>

          {/* Table Body */}
          {jenisList.map((j) => {
            const isDipilih = selectedId === j.id;
            const metaWarna = JENIS_WARNA[j.warna] || JENIS_WARNA.lainnya;
            const nKegiatan = j.jumlahKegiatan || 0;

            return (
              <div
                key={j.id}
                onClick={() => onSelectJenis(j.id)}
                title={j.nama}
                className={`flex h-8 shrink-0 items-center border-b border-(--color-border-subtle) px-3.5 text-[12.5px] cursor-pointer transition-colors ${
                  isDipilih
                    ? 'bg-(--color-brand-subtle) shadow-[inset_3px_0_0_var(--color-brand)]'
                    : 'bg-(--color-surface) hover:bg-(--color-surface-alt)'
                }`}
              >
                {/* Nama Jenis & Color Dot */}
                <div className="flex-1 min-w-[140px] flex items-center gap-1.75 truncate pr-2">
                  <span
                    className="w-2.25 h-2.25 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: metaWarna.dot }}
                  />
                  <span
                    className={`truncate ${
                      isDipilih
                        ? 'font-semibold text-(--color-text-primary)'
                        : 'font-normal text-(--color-text-primary)'
                    }`}
                  >
                    {j.nama}
                  </span>
                </div>

                {/* Materi Wajib Pill */}
                <div className="w-[104px] shrink-0 flex items-center pr-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMateriWajib(j);
                    }}
                    title={
                      j.materiWajib
                        ? 'Klik: mata pelajaran & materi jadi opsional di form kegiatan'
                        : 'Klik: mata pelajaran & materi jadi wajib di form kegiatan'
                    }
                    className={`inline-flex items-center h-4.5 px-2 rounded-full text-[10.5px] font-semibold border transition-colors cursor-pointer ${
                      j.materiWajib
                        ? 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand)'
                        : 'border-(--color-border) bg-(--color-surface) text-(--color-text-secondary) hover:bg-(--color-surface-alt)'
                    }`}
                  >
                    {j.materiWajib ? 'wajib' : 'opsional'}
                  </button>
                </div>

                {/* Siswa Wajib Pill */}
                <div className="w-[100px] shrink-0 flex items-center pr-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSiswaWajib(j);
                    }}
                    title={
                      j.siswaWajib
                        ? 'Klik: siswa peserta jadi opsional di form kegiatan'
                        : 'Klik: siswa peserta jadi wajib di form kegiatan'
                    }
                    className={`inline-flex items-center h-4.5 px-2 rounded-full text-[10.5px] font-semibold border transition-colors cursor-pointer ${
                      j.siswaWajib
                        ? 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand)'
                        : 'border-(--color-border) bg-(--color-surface) text-(--color-text-secondary) hover:bg-(--color-surface-alt)'
                    }`}
                  >
                    {j.siswaWajib ? 'wajib' : 'opsional'}
                  </button>
                </div>

                {/* Kegiatan Count */}
                <div className="w-[84px] shrink-0 text-right font-mono text-[11.5px] text-(--color-text-primary) pr-2">
                  {nKegiatan > 0 ? (
                    <span>{nKegiatan}</span>
                  ) : (
                    <span className="text-(--color-text-disabled)">—</span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex-1 min-h-0" />
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="flex h-7.5 shrink-0 items-center border-t border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[11.5px] text-(--color-text-muted)">
        Menampilkan {jenisList.length} dari {totalDb} jenis kegiatan
      </div>
    </div>
  );
}
