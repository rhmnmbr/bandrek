import { Warning16Regular } from '@fluentui/react-icons';
import type { Tempat } from '@/data/types/master';

interface TempatTableProps {
  tempatList: Tempat[];
  selectedId: string | null;
  onSelectTempat: (id: string) => void;
  totalDb: number;
}

export function TempatTable({
  tempatList,
  selectedId,
  onSelectTempat,
  totalDb,
}: TempatTableProps) {
  const zeroRuanganList = tempatList.filter((t) => (t.jumlahRuangan || 0) === 0);

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col min-h-full">
          {/* Sticky Header */}
          <div className="sticky top-0 z-3 flex h-6.5 shrink-0 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
            <div className="flex-1 min-w-35">TEMPAT</div>
            <div className="w-18.5 shrink-0 text-right">RUANGAN</div>
          </div>

          {/* Table Body */}
          {tempatList.map((t) => {
            const isDipilih = selectedId === t.id;
            const jumlahRuangan = t.jumlahRuangan || 0;
            const isKosong = jumlahRuangan === 0;

            return (
              <div
                key={t.id}
                onClick={() => onSelectTempat(t.id)}
                className={`flex h-8 shrink-0 items-center border-b border-(--color-border-subtle) px-3.5 text-[12.5px] cursor-pointer transition-colors ${
                  isDipilih
                    ? 'bg-(--color-brand-subtle) shadow-[inset_3px_0_0_var(--color-brand)]'
                    : 'bg-(--color-surface) hover:bg-(--color-surface-alt)'
                }`}
              >
                {/* Nama Tempat */}
                <div
                  className={`flex-1 min-w-35 truncate pr-2 flex items-center gap-1.5 ${
                    isDipilih ? 'font-semibold' : 'font-normal'
                  } ${isKosong ? 'text-(--color-warning-fg)' : 'text-(--color-text-primary)'}`}
                >
                  {isKosong && <Warning16Regular className="w-3.5 h-3.5 shrink-0 text-(--color-warning-fg)" />}
                  <span className="truncate" title={t.nama}>{t.nama}</span>
                </div>

                {/* Ruangan Count */}
                <div
                  className={`w-18.5 shrink-0 text-right font-mono text-[11.5px] ${
                    isKosong
                      ? 'text-(--color-warning-fg) font-semibold'
                      : 'text-(--color-text-primary)'
                  }`}
                >
                  {jumlahRuangan}
                </div>
              </div>
            );
          })}

          <div className="flex-1 min-h-0" />
        </div>
      </div>

      {/* Warning Box if any Tempat has 0 Ruangan */}
      {zeroRuanganList.length > 0 && (
        <div className="flex shrink-0 items-start gap-2 border-t border-(--color-warning-border) bg-(--color-warning-subtle) p-2.5 text-xs text-(--color-warning-fg) leading-relaxed">
          <Warning16Regular className="w-4 h-4 shrink-0 mt-0.5 text-(--color-warning-fg)" />
          <span className="flex-1 min-w-0">
            {zeroRuanganList.map((x) => x.nama).join(', ')} belum punya ruangan, jadi belum bisa dipilih di form kegiatan.
          </span>
        </div>
      )}

      {/* Sticky Footer */}
      <div className="flex h-8 shrink-0 items-center border-t border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[11.5px] text-(--color-text-muted)">
        <span className="truncate">Menampilkan {tempatList.length} dari {totalDb} tempat</span>
      </div>
    </div>
  );
}
