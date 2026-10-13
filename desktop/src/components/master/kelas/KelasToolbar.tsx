import { Add16Regular } from '@fluentui/react-icons';

interface KelasToolbarProps {
  totalKelas: number;
  totalKeanggotaan: number;
  cari: string;
  onCariChange: (val: string) => void;
  adaFilter: boolean;
  onResetFilter: () => void;
  onKelasBaru: () => void;
}

export function KelasToolbar({
  totalKelas,
  totalKeanggotaan,
  cari,
  onCariChange,
  adaFilter,
  onResetFilter,
  onKelasBaru,
}: KelasToolbarProps) {
  return (
    <div className="flex flex-col shrink-0">
      {/* Top Meta Bar */}
      <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-(--color-border) px-3.5 bg-(--color-surface)">
        <div className="shrink-0 text-[12.5px] text-(--color-text-muted) whitespace-nowrap">
          {totalKelas} kelas · {totalKeanggotaan} keanggotaan
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onKelasBaru}
          title="Tambah kelas baru · Ctrl+N"
          className="flex h-6.5 shrink-0 items-center gap-1.5 px-3 rounded border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-[12.5px] font-semibold cursor-pointer whitespace-nowrap transition-colors"
        >
          <Add16Regular className="w-3.5 h-3.5 shrink-0" />
          <span>Kelas baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-(--color-border) px-3.5 bg-(--color-surface-subtle) text-xs">
        {/* Cari Input */}
        <input
          type="text"
          value={cari}
          onChange={(e) => onCariChange(e.target.value)}
          placeholder="Cari nama kelas"
          className="flex-1 min-w-0 h-6.5 rounded border border-(--color-border-strong) bg-(--color-surface) px-2 text-xs text-(--color-text-primary) placeholder:text-(--color-text-placeholder) focus:outline-none focus:border-(--color-brand)"
        />

        {/* Reset Filter Button */}
        {adaFilter && (
          <button
            type="button"
            onClick={onResetFilter}
            className="flex h-6.5 shrink-0 items-center px-2 rounded border-none bg-transparent text-(--color-brand) hover:bg-(--color-brand-subtle) text-xs cursor-pointer whitespace-nowrap transition-colors"
          >
            Reset filter
          </button>
        )}
      </div>
    </div>
  );
}
