import { useState, useRef, useEffect } from 'react';
import type { JenjangPendidikan } from '@/data/types/common';

interface KelasToolbarProps {
  totalKelas: number;
  totalKeanggotaan: number;
  cari: string;
  onCariChange: (val: string) => void;
  jenjang: JenjangPendidikan | 'semua';
  onJenjangChange: (val: JenjangPendidikan | 'semua') => void;
  adaFilter: boolean;
  onResetFilter: () => void;
  onKelasBaru: () => void;
}

const JENJANG_LIST: JenjangPendidikan[] = ['SD', 'SMP', 'SMA'];

export function KelasToolbar({
  totalKelas,
  totalKeanggotaan,
  cari,
  onCariChange,
  jenjang,
  onJenjangChange,
  adaFilter,
  onResetFilter,
  onKelasBaru,
}: KelasToolbarProps) {
  const [jenjangOpen, setJenjangOpen] = useState(false);
  const jenjangRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (jenjangRef.current && !jenjangRef.current.contains(e.target as Node)) {
        setJenjangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const jenjangLabel = jenjang !== 'semua' ? `Jenjang: ${jenjang}` : 'Jenjang: semua';

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
          <svg
            width="11"
            height="11"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="shrink-0 relative top-[0.5px]"
          >
            <line x1="8" y1="3" x2="8" y2="13" />
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
          Kelas baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex h-12 shrink-0 items-center gap-1.75 border-b border-(--color-border) px-3.5 bg-(--color-surface-subtle) text-xs">
        {/* Cari Input */}
        <input
          type="text"
          value={cari}
          onChange={(e) => onCariChange(e.target.value)}
          placeholder="Cari nama kelas"
          className="flex-1 min-w-0 h-6.5 rounded border border-(--color-border-strong) bg-(--color-surface) px-2 text-xs text-(--color-text-primary) placeholder:text-(--color-text-placeholder) focus:outline-none focus:border-(--color-brand)"
        />

        {/* Jenjang Dropdown */}
        <div ref={jenjangRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setJenjangOpen((prev) => !prev)}
            className={`flex h-6.5 items-center justify-between gap-1.5 rounded px-2 text-xs whitespace-nowrap cursor-pointer transition-colors border ${
              jenjang !== 'semua'
                ? 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand) font-semibold'
                : 'border-(--color-border-strong) bg-(--color-surface) text-(--color-text-secondary) hover:border-(--color-border-muted)'
            }`}
          >
            <span>{jenjangLabel}</span>
            <svg width="12" height="12" viewBox="0 0 16 16" className="shrink-0 text-(--color-text-muted)">
              <path
                fill="currentColor"
                d="M3.15 5.65c.2-.2.5-.2.7 0L8 9.79l4.15-4.14c.2-.2.5-.2.7 0 .2.2.2.5 0 .7l-4.5 4.5c-.2.2-.5.2-.7 0l-4.5-4.5c-.2-.2-.2-.5 0-.7Z"
              />
            </svg>
          </button>
          {jenjangOpen && (
            <div className="absolute right-0 top-[29px] z-12 min-w-full w-max rounded-md border border-(--color-border-strong) bg-(--color-surface) p-1 shadow-lg flex flex-col gap-0.5 max-h-65 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  onJenjangChange('semua');
                  setJenjangOpen(false);
                }}
                className={`w-full text-left px-2.25 py-1.5 rounded border-none text-[12.5px] cursor-pointer whitespace-nowrap transition-colors ${
                  jenjang === 'semua'
                    ? 'bg-(--color-brand-subtle) text-(--color-brand) font-semibold'
                    : 'bg-transparent text-(--color-text-primary) hover:bg-(--color-surface-hover)'
                }`}
              >
                Jenjang: semua
              </button>
              {JENJANG_LIST.map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => {
                    onJenjangChange(j);
                    setJenjangOpen(false);
                  }}
                  className={`w-full text-left px-2.25 py-1.5 rounded border-none text-[12.5px] cursor-pointer whitespace-nowrap transition-colors ${
                    jenjang === j
                      ? 'bg-(--color-brand-subtle) text-(--color-brand) font-semibold'
                      : 'bg-transparent text-(--color-text-primary) hover:bg-(--color-surface-hover)'
                  }`}
                >
                  Jenjang: {j}
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
            className="flex h-6.5 shrink-0 items-center px-2 rounded border-none bg-transparent text-(--color-brand) hover:bg-(--color-brand-subtle) text-xs cursor-pointer whitespace-nowrap transition-colors"
          >
            Reset filter
          </button>
        )}
      </div>
    </div>
  );
}
