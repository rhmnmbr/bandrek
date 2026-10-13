import type { Ruangan } from '@/data/types/master';
import { Skeleton } from '@/components/ui/skeleton';
import { ReOrderDotsVertical16Regular, Add16Regular } from '@fluentui/react-icons';

interface RuanganTableProps {
  tempatNama: string;
  ruanganList: Ruangan[];
  isLoading?: boolean;
  jumlahRuangan?: number;
  onNewRuangan: () => void;
  onSelectRuangan: (ruangan: Ruangan) => void;
}

export function RuanganTable({
  tempatNama,
  ruanganList,
  isLoading = false,
  jumlahRuangan,
  onNewRuangan,
  onSelectRuangan,
}: RuanganTableProps) {
  const countDisplay = !isLoading ? ruanganList.length : (jumlahRuangan ?? ruanganList.length);
  const skeletonRowCount = jumlahRuangan ? Math.min(Math.max(jumlahRuangan, 2), 6) : 3;

  return (
    <div className="flex-[1_1_100%] flex flex-col gap-1.5 border-t border-(--color-border) pt-2.75 mt-1">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) truncate">
          RUANGAN · {countDisplay}
        </div>
        <button
          type="button"
          onClick={onNewRuangan}
          disabled={isLoading}
          title={`Tambah ruangan di ${tempatNama}`}
          className={`flex h-6 shrink-0 items-center gap-1 px-2 rounded border border-(--color-border) bg-(--color-surface) text-[11.5px] font-medium transition-colors ${
            isLoading
              ? 'opacity-50 cursor-not-allowed text-(--color-text-muted)'
              : 'text-(--color-brand) hover:bg-(--color-brand-subtle) cursor-pointer'
          }`}
        >
          <Add16Regular className="w-3.5 h-3.5 shrink-0" />
          <span>Ruangan</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="rounded-md border border-(--color-border) bg-(--color-surface) overflow-hidden">
        {isLoading && ruanganList.length === 0 ? (
          Array.from({ length: skeletonRowCount }).map((_, idx) => (
            <div
              key={idx}
              className={`flex h-8 items-center gap-1 px-1.5 ${
                idx > 0 ? 'border-t border-(--color-border-subtle)' : ''
              } bg-(--color-surface)`}
            >
              {/* Icon / Grab Spacer Placeholder */}
              <div className="w-5 shrink-0 flex items-center justify-center">
                <Skeleton className="h-3 w-3 rounded-xs opacity-40" />
              </div>

              {/* Nama Ruangan Placeholder */}
              <div className="flex-1 min-w-0 pr-2">
                <Skeleton
                  className={`h-3.5 rounded-xs ${
                    idx % 3 === 0 ? 'w-28' : idx % 2 === 0 ? 'w-20' : 'w-32'
                  }`}
                />
              </div>

              {/* Meta info placeholder */}
              <div className="shrink-0 pr-2">
                <Skeleton className="h-3 w-32 rounded-xs" />
              </div>

              {/* Ubah Action Button Placeholder */}
              <div className="shrink-0">
                <Skeleton className="h-5.25 w-10 rounded-sm" />
              </div>
            </div>
          ))
        ) : (
          ruanganList.map((r, index) => {
            const nKegiatan = r.jumlahKegiatan || 0;
            const kapasitas = r.kapasitas || 12;
            const metaText = `kapasitas ${kapasitas} · ${nKegiatan} kegiatan`;

            return (
              <div
                key={r.id}
                className={`flex h-8 items-center gap-1 px-1.5 transition-colors hover:bg-(--color-surface-alt) ${
                  index > 0 ? 'border-t border-(--color-border-subtle)' : ''
                } bg-(--color-surface)`}
              >
                {/* Icon / Grab Spacer */}
                <div className="w-5 shrink-0 flex items-center justify-center text-(--color-text-muted)">
                  <ReOrderDotsVertical16Regular className="w-4 h-4" />
                </div>

                {/* Nama Ruangan */}
                <div
                  onClick={() => onSelectRuangan(r)}
                  title={`Ubah ${r.nama}`}
                  className="flex-1 min-w-0 truncate text-[12.5px] text-(--color-text-primary) cursor-pointer hover:underline pr-2"
                >
                  {r.nama}
                </div>

                {/* Meta info: kapasitas & kegiatan */}
                <div className="shrink-0 text-[11.5px] text-(--color-text-muted) pr-2">
                  {metaText}
                </div>

                {/* Ubah Action Button */}
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelectRuangan(r)}
                    title={`Ubah ${r.nama}`}
                    className="h-5.25 px-2 rounded-sm border-none bg-transparent text-(--color-brand) text-[11.5px] font-medium hover:bg-(--color-brand-subtle) cursor-pointer transition-colors"
                  >
                    Ubah
                  </button>
                </div>
              </div>
            );
          })
        )}

        {!isLoading && ruanganList.length === 0 && (
          <div className="p-3 text-center text-xs text-(--color-text-muted) leading-relaxed">
            Belum ada ruangan untuk tempat ini. Pakai "+ Ruangan" di atas untuk menambahkan.
          </div>
        )}
      </div>

      {/* Note Below Table */}
      <div className="text-[11px] text-(--color-text-muted) leading-relaxed">
        Ruangan muncul dikelompokkan per tempat di form kegiatan.
      </div>
    </div>
  );
}
