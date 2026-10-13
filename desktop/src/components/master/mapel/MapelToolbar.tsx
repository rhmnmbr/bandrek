import { useState, useRef, useEffect } from 'react';
import { Add16Regular } from '@fluentui/react-icons';

interface MapelToolbarProps {
  totalMapel: number;
  totalAktif: number;
  cari: string;
  onCariChange: (val: string) => void;
  status: 'aktif' | 'nonaktif' | 'semua';
  onStatusChange: (val: 'aktif' | 'nonaktif' | 'semua') => void;
  adaFilter: boolean;
  onResetFilter: () => void;
  onMapelBaru: () => void;
}

const STATUS_OPTIONS: { id: 'aktif' | 'nonaktif' | 'semua'; label: string }[] = [
  { id: 'aktif', label: 'Status: aktif' },
  { id: 'nonaktif', label: 'Status: nonaktif' },
  { id: 'semua', label: 'Status: semua' },
];

export function MapelToolbar({
  totalMapel,
  totalAktif,
  cari,
  onCariChange,
  status,
  onStatusChange,
  adaFilter,
  onResetFilter,
  onMapelBaru,
}: MapelToolbarProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusLabel =
    STATUS_OPTIONS.find((o) => o.id === status)?.label || 'Status: aktif';

  return (
    <div className="flex flex-col shrink-0">
      {/* Top Meta Bar */}
      <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-(--color-border) px-3.5 bg-(--color-surface)">
        <div className="shrink-0 text-[12.5px] text-(--color-text-muted) whitespace-nowrap">
          {totalMapel} mata pelajaran · {totalAktif} aktif
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onMapelBaru}
          title="Tambah mata pelajaran baru · Ctrl+N"
          className="flex h-6.5 shrink-0 items-center gap-1.5 px-3 rounded border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-[12.5px] font-semibold cursor-pointer whitespace-nowrap transition-colors"
        >
          <Add16Regular className="w-3.5 h-3.5 shrink-0" />
          <span>Mapel baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex h-12 shrink-0 items-center gap-1.75 border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-xs">
        {/* Search Input */}
        <input
          type="text"
          value={cari}
          onChange={(e) => onCariChange(e.target.value)}
          placeholder="Cari mata pelajaran"
          className="h-6.5 w-[140px] flex-1 min-w-0 rounded-sm border border-(--color-border) bg-(--color-surface) px-2 text-xs outline-none focus:border-(--color-brand) transition-colors"
        />

        {/* Status Dropdown */}
        <div className="relative shrink-0" ref={statusRef}>
          <button
            type="button"
            onClick={() => setStatusOpen(!statusOpen)}
            className={`flex h-6.5 items-center justify-between gap-1.5 rounded-sm border px-2 text-xs transition-colors cursor-pointer whitespace-nowrap ${
              status !== 'aktif'
                ? 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand) font-semibold'
                : 'border-(--color-border) bg-(--color-surface) text-(--color-text-primary) font-normal hover:bg-(--color-surface-alt)'
            }`}
          >
            <span>{statusLabel}</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="text-(--color-text-muted)"
            >
              <path d="M3.15 5.65c.2-.2.5-.2.7 0L8 9.79l4.15-4.14c.2-.2.5-.2.7 0 .2.2.2.5 0 .7l-4.5 4.5c-.2.2-.5.2-.7 0l-4.5-4.5c-.2-.2-.2-.5 0-.7Z" />
            </svg>
          </button>

          {statusOpen && (
            <div className="absolute left-0 top-7.5 z-20 w-max min-w-full rounded-md border border-(--color-border) bg-(--color-surface) p-1 shadow-lg flex flex-col gap-0.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onStatusChange(opt.id);
                    setStatusOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-sm border-none text-[12.5px] cursor-pointer whitespace-nowrap transition-colors ${
                    status === opt.id
                      ? 'bg-(--color-brand-subtle) text-(--color-brand) font-semibold'
                      : 'bg-transparent text-(--color-text-primary) hover:bg-(--color-surface-alt)'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

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
