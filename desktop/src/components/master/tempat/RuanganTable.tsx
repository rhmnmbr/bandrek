import type { Ruangan } from '@/data/types/master';

interface RuanganTableProps {
  tempatNama: string;
  ruanganList: Ruangan[];
  onNewRuangan: () => void;
  onSelectRuangan: (ruangan: Ruangan) => void;
}

export function RuanganTable({
  tempatNama,
  ruanganList,
  onNewRuangan,
  onSelectRuangan,
}: RuanganTableProps) {
  return (
    <div className="flex-[1_1_100%] flex flex-col gap-1.5 border-t border-(--color-border) pt-2.75 mt-1">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) truncate">
          RUANGAN · {ruanganList.length}
        </div>
        <button
          type="button"
          onClick={onNewRuangan}
          title={`Tambah ruangan di ${tempatNama}`}
          className="flex h-5.75 shrink-0 items-center gap-1 px-2.25 rounded-sm border border-(--color-border) bg-(--color-surface) text-(--color-brand) text-[11.5px] font-medium hover:bg-(--color-brand-subtle) transition-colors cursor-pointer"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="8" y1="2" x2="8" y2="14" />
            <line x1="2" y1="8" x2="14" y2="8" />
          </svg>
          <span>Ruangan</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="rounded-md border border-(--color-border) bg-(--color-surface) overflow-hidden">
        {ruanganList.map((r, index) => {
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
              <div className="w-5 shrink-0 flex items-center justify-center text-(--color-text-disabled)">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="5" cy="4" r="1.3" />
                  <circle cx="11" cy="4" r="1.3" />
                  <circle cx="5" cy="8" r="1.3" />
                  <circle cx="11" cy="8" r="1.3" />
                  <circle cx="5" cy="12" r="1.3" />
                  <circle cx="11" cy="12" r="1.3" />
                </svg>
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
        })}

        {ruanganList.length === 0 && (
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
