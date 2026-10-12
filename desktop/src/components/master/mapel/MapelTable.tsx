import type { MataPelajaran } from '@/data/types/master';

interface MapelTableProps {
  mapelList: MataPelajaran[];
  selectedId: string | null;
  onSelectMapel: (id: string) => void;
  totalDb: number;
}

export function MapelTable({
  mapelList,
  selectedId,
  onSelectMapel,
  totalDb,
}: MapelTableProps) {
  const zeroMateriList = mapelList.filter((m) => (m.jumlahMateri || 0) === 0);

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col min-h-full">
          {/* Sticky Header */}
          <div className="sticky top-0 z-3 flex h-6.5 shrink-0 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
            <div className="flex-1 min-w-[150px]">MATA PELAJARAN</div>
            <div className="w-[74px] shrink-0 text-right">MATERI</div>
          </div>

          {/* Table Body */}
          {mapelList.map((m) => {
            const isDipilih = selectedId === m.id;
            const jumlahMateri = m.jumlahMateri || 0;
            const isKosong = jumlahMateri === 0;
            const isNonaktif = !m.aktif;

            let namaTeks = m.nama;
            if (isKosong) {
              namaTeks = `⚠ ${m.nama}`;
            }
            if (isNonaktif) {
              namaTeks += ' · nonaktif';
            }

            return (
              <div
                key={m.id}
                onClick={() => onSelectMapel(m.id)}
                title={`${m.nama} · ${jumlahMateri} materi`}
                className={`flex h-8 shrink-0 items-center border-b border-(--color-border-subtle) px-3.5 text-[12.5px] cursor-pointer transition-colors ${
                  isDipilih
                    ? 'bg-(--color-brand-subtle) shadow-[inset_3px_0_0_var(--color-brand)]'
                    : 'bg-(--color-surface) hover:bg-(--color-surface-alt)'
                }`}
              >
                {/* Nama Mata Pelajaran */}
                <div
                  className={`flex-1 min-w-[150px] truncate pr-2 ${
                    isDipilih ? 'font-semibold' : 'font-normal'
                  } ${
                    isKosong
                      ? 'text-(--color-warning-fg)'
                      : isNonaktif
                      ? 'text-(--color-text-muted)'
                      : 'text-(--color-text-primary)'
                  }`}
                >
                  {namaTeks}
                </div>

                {/* Materi Count */}
                <div
                  className={`w-[74px] shrink-0 text-right font-mono text-[11.5px] ${
                    isKosong
                      ? 'text-(--color-warning-fg) font-semibold'
                      : 'text-(--color-text-primary)'
                  }`}
                >
                  {jumlahMateri}
                </div>
              </div>
            );
          })}

          <div className="flex-1 min-h-0" />
        </div>
      </div>

      {/* Warning Box if any Mapel has 0 Materi */}
      {zeroMateriList.length > 0 && (
        <div className="flex shrink-0 items-start gap-2 border-t border-(--color-warning-border) bg-(--color-warning-subtle) p-2.5 text-xs text-(--color-warning-fg) leading-relaxed">
          <span>⚠</span>
          <span className="flex-1 min-w-0">
            {zeroMateriList.map((x) => x.nama).join(', ')} belum punya materi, jadi belum muncul di matriks belajar.
          </span>
        </div>
      )}

      {/* Sticky Footer */}
      <div className="flex h-8 shrink-0 items-center border-t border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[11.5px] text-(--color-text-muted)">
        <span className="truncate">
          Menampilkan {mapelList.length} dari {totalDb} mata pelajaran
        </span>
      </div>
    </div>
  );
}
