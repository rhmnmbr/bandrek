interface TempatToolbarProps {
  totalTempat: number;
  totalRuangan: number;
  cari: string;
  onCariChange: (val: string) => void;
  adaFilter: boolean;
  onResetFilter: () => void;
  onTempatBaru: () => void;
}

export function TempatToolbar({
  totalTempat,
  totalRuangan,
  cari,
  onCariChange,
  adaFilter,
  onResetFilter,
  onTempatBaru,
}: TempatToolbarProps) {
  return (
    <div className="flex flex-col shrink-0">
      {/* Top Meta Bar */}
      <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-(--color-border) px-3.5 bg-(--color-surface)">
        <div className="shrink-0 text-[12.5px] text-(--color-text-muted) whitespace-nowrap">
          {totalTempat} tempat · {totalRuangan} ruangan
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onTempatBaru}
          title="Tambah tempat baru · Ctrl+N"
          className="flex h-6.5 shrink-0 items-center gap-1.5 px-3 rounded-sm border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-[12.5px] font-semibold cursor-pointer whitespace-nowrap transition-colors"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <line x1="8" y1="2" x2="8" y2="14" />
            <line x1="2" y1="8" x2="14" y2="8" />
          </svg>
          <span>Tempat baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-xs">
        {/* Search Input */}
        <input
          type="text"
          value={cari}
          onChange={(e) => onCariChange(e.target.value)}
          placeholder="Cari tempat"
          className="h-6.5 flex-1 min-w-0 rounded-sm border border-(--color-border) bg-(--color-surface) px-2 text-xs outline-none focus:border-(--color-brand) transition-colors"
        />

        {/* Reset Filter Button */}
        {adaFilter && (
          <button
            type="button"
            onClick={onResetFilter}
            className="flex h-6.5 shrink-0 items-center px-2 border-none bg-transparent text-(--color-brand) text-xs cursor-pointer rounded-sm hover:bg-(--color-brand-subtle) whitespace-nowrap transition-colors"
          >
            Reset filter
          </button>
        )}
      </div>
    </div>
  );
}
