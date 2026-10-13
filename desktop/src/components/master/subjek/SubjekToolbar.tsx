import { useState, useRef, useEffect } from 'react';
import { Add16Regular } from '@fluentui/react-icons';

interface SubjekToolbarProps {
  totalAktif: number;
  totalNonaktif: number;
  cari: string;
  onCariChange: (val: string) => void;
  status: 'aktif' | 'nonaktif' | 'semua';
  onStatusChange: (val: 'aktif' | 'nonaktif' | 'semua') => void;
  adaFilter: boolean;
  onResetFilter: () => void;
  onSubjekBaru: () => void;
}

export function SubjekToolbar({
  totalAktif,
  totalNonaktif,
  cari,
  onCariChange,
  status,
  onStatusChange,
  adaFilter,
  onResetFilter,
  onSubjekBaru,
}: SubjekToolbarProps) {
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
    status === 'nonaktif'
      ? 'Status: Nonaktif'
      : status === 'aktif'
        ? 'Status: Aktif'
        : 'Status: semua';

  return (
    <div className="flex flex-col shrink-0">
      {/* Top Meta Bar */}
      <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-(--color-border) px-3.5 bg-(--color-surface)">
        <div className="shrink-0 text-[12.5px] text-(--color-text-muted) whitespace-nowrap">
          {totalAktif} aktif · {totalNonaktif} nonaktif
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onSubjekBaru}
          className="flex h-6.5 shrink-0 items-center gap-1.5 px-3 rounded border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-[12.5px] font-semibold cursor-pointer whitespace-nowrap transition-colors"
        >
          <Add16Regular className="w-3.5 h-3.5 shrink-0" />
          <span>Subjek baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex h-12 shrink-0 items-center gap-1.75 border-b border-(--color-border) px-3.5 bg-(--color-surface-subtle) text-xs">
        {/* Cari Input */}
        <input
          type="text"
          value={cari}
          onChange={(e) => onCariChange(e.target.value)}
          placeholder="Cari nama subjek"
          className="flex-1 min-w-[150px] max-w-[280px] h-6.5 rounded border border-(--color-border-strong) bg-(--color-surface) px-2 text-xs text-(--color-text-primary) placeholder:text-(--color-text-placeholder) focus:outline-none focus:border-(--color-brand)"
        />

        {/* Status Dropdown */}
        <div ref={statusRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              setStatusOpen((prev) => !prev);
            }}
            className={`flex h-6.5 items-center justify-between gap-2.5 rounded px-2 text-xs whitespace-nowrap cursor-pointer transition-colors border ${
              status === 'nonaktif'
                ? 'border-(--color-warning) bg-(--color-warning-subtle) text-(--color-warning-fg) font-semibold'
                : status === 'semua'
                  ? 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand) font-semibold'
                  : 'border-(--color-border-strong) bg-(--color-surface) text-(--color-text-secondary) hover:border-(--color-border-muted)'
            }`}
          >
            <span>{statusLabel}</span>
            <svg width="12" height="12" viewBox="0 0 16 16" className="shrink-0 text-(--color-text-muted)">
              <path
                fill="currentColor"
                d="M3.15 5.65c.2-.2.5-.2.7 0L8 9.79l4.15-4.14c.2-.2.5-.2.7 0 .2.2.2.5 0 .7l-4.5 4.5c-.2.2-.5.2-.7 0l-4.5-4.5c-.2-.2-.2-.5 0-.7Z"
              />
            </svg>
          </button>
          {statusOpen && (
            <div className="absolute left-0 top-[29px] z-12 min-w-full w-max rounded-md border border-(--color-border-strong) bg-(--color-surface) p-1 shadow-lg flex flex-col gap-0.5 max-h-65 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  onStatusChange('aktif');
                  setStatusOpen(false);
                }}
                className={`w-full text-left px-2.25 py-1.5 rounded border-none text-[12.5px] cursor-pointer whitespace-nowrap transition-colors ${
                  status === 'aktif'
                    ? 'bg-(--color-surface-hover) text-(--color-text-primary) font-semibold'
                    : 'bg-transparent text-(--color-text-primary) hover:bg-(--color-surface-hover)'
                }`}
              >
                Status: Aktif
              </button>
              <button
                type="button"
                onClick={() => {
                  onStatusChange('nonaktif');
                  setStatusOpen(false);
                }}
                className={`w-full text-left px-2.25 py-1.5 rounded border-none text-[12.5px] cursor-pointer whitespace-nowrap transition-colors ${
                  status === 'nonaktif'
                    ? 'bg-(--color-warning-subtle) text-(--color-warning-fg) font-semibold'
                    : 'bg-transparent text-(--color-text-primary) hover:bg-(--color-surface-hover)'
                }`}
              >
                Status: Nonaktif
              </button>
              <button
                type="button"
                onClick={() => {
                  onStatusChange('semua');
                  setStatusOpen(false);
                }}
                className={`w-full text-left px-2.25 py-1.5 rounded border-none text-[12.5px] cursor-pointer whitespace-nowrap transition-colors ${
                  status === 'semua'
                    ? 'bg-(--color-brand-subtle) text-(--color-brand) font-semibold'
                    : 'bg-transparent text-(--color-text-primary) hover:bg-(--color-surface-hover)'
                }`}
              >
                Status: semua
              </button>
            </div>
          )}
        </div>

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
