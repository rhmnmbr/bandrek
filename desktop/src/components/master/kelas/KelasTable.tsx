import type { Kelas } from '@/data/types/master';

interface KelasTableProps {
  kelasList: Kelas[];
  selectedId: string | null;
  onSelectKelas: (id: string) => void;
  totalDb: number;
}

export function KelasTable({
  kelasList,
  selectedId,
  onSelectKelas,
  totalDb,
}: KelasTableProps) {
  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col min-h-full">
          {/* Sticky Header */}
          <div className="sticky top-0 z-3 flex h-6.5 shrink-0 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
            <div className="flex-1 min-w-[140px]">NAMA KELAS</div>
            <div className="w-[64px] shrink-0 text-right">SISWA</div>
          </div>

          {/* Table Body */}
          {kelasList.map((k) => {
            const isDipilih = selectedId === k.id;
            const jumlahSiswa = (k.anggota || []).length;

            return (
              <div
                key={k.id}
                onClick={() => onSelectKelas(k.id)}
                className={`flex h-8 shrink-0 items-center border-b border-(--color-border-subtle) px-3.5 text-[12.5px] cursor-pointer transition-colors ${
                  isDipilih
                    ? 'bg-(--color-brand-subtle) shadow-[inset_3px_0_0_var(--color-brand)]'
                    : 'bg-(--color-surface) hover:bg-(--color-surface-alt)'
                }`}
              >
                {/* Nama Kelas */}
                <div
                  title={k.nama}
                  className={`flex-1 min-w-[140px] truncate pr-2 text-(--color-text-primary) ${
                    isDipilih ? 'font-semibold' : 'font-normal'
                  }`}
                >
                  {k.nama}
                </div>

                {/* Siswa Count */}
                <div
                  className={`w-[64px] shrink-0 text-right font-mono text-[11.5px] ${
                    jumlahSiswa === 0
                      ? 'text-(--color-warning-fg) font-semibold'
                      : 'text-(--color-text-primary)'
                  }`}
                >
                  {jumlahSiswa}
                </div>
              </div>
            );
          })}

          <div className="flex-1 min-h-0" />
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="flex h-8 shrink-0 items-center border-t border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[11.5px] text-(--color-text-muted)">
        <span className="truncate">Menampilkan {kelasList.length} dari {totalDb} kelas</span>
      </div>
    </div>
  );
}
