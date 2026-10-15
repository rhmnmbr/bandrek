import { useState, useRef, useEffect, useMemo } from 'react';
import { Add16Regular, Settings16Regular } from '@fluentui/react-icons';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/select';
import { useJenjangList } from '@/data/hooks/useMaster';
import { KelolaJenjangModal } from './KelolaJenjangModal';
import type { JenjangPendidikan } from '@/data/types/common';
import type { Kelas } from '@/data/types/master';

interface SiswaToolbarProps {
  totalAktif: number;
  totalNonaktif: number;
  cari: string;
  onCariChange: (val: string) => void;
  jenjangList: JenjangPendidikan[];
  onJenjangChange: (val: JenjangPendidikan[]) => void;
  kelasIds: string[];
  onKelasChange: (val: string[]) => void;
  kelasList: Kelas[];
  status: 'aktif' | 'nonaktif' | 'semua';
  onStatusChange: (val: 'aktif' | 'nonaktif' | 'semua') => void;
  adaFilter: boolean;
  onResetFilter: () => void;
  onSiswaBaru: () => void;
}

export function SiswaToolbar({
  totalAktif,
  totalNonaktif,
  cari,
  onCariChange,
  jenjangList,
  onJenjangChange,
  kelasIds,
  onKelasChange,
  kelasList,
  status,
  onStatusChange,
  adaFilter,
  onResetFilter,
  onSiswaBaru,
}: SiswaToolbarProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [kelolaJenjangOpen, setKelolaJenjangOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const { data: dynamicJenjangs = [] } = useJenjangList();

  const jenjangOptions: MultiSelectOption[] = useMemo(() => {
    if (dynamicJenjangs.length > 0) {
      return dynamicJenjangs.map((j) => ({ value: j.nama, label: j.nama }));
    }
    return [
      { value: 'SD', label: 'SD' },
      { value: 'SMP', label: 'SMP' },
      { value: 'SMA', label: 'SMA' },
    ];
  }, [dynamicJenjangs]);

  const kelasOptions: MultiSelectOption[] = useMemo(() => {
    return [
      { value: '-', label: 'Belum punya kelas' },
      ...kelasList.map((k) => ({ value: k.id, label: k.nama })),
    ];
  }, [kelasList]);

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
          onClick={() => setKelolaJenjangOpen(true)}
          className="flex h-6.5 shrink-0 items-center gap-1.5 px-2.5 rounded border border-(--color-border-strong) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-primary) text-[12px] font-medium cursor-pointer whitespace-nowrap transition-colors"
        >
          <Settings16Regular className="w-3.5 h-3.5 shrink-0 text-(--color-text-muted)" />
          <span>Kelola jenjang</span>
        </button>
        <button
          type="button"
          onClick={onSiswaBaru}
          className="flex h-6.5 shrink-0 items-center gap-1.5 px-3 rounded border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-[12.5px] font-semibold cursor-pointer whitespace-nowrap transition-colors"
        >
          <Add16Regular className="w-3.5 h-3.5 shrink-0" />
          <span>Siswa baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-1.75 border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-xs">
        {/* Search input */}
        <div className="relative flex-1 min-w-[150px] max-w-[300px]">
          <input
            type="text"
            value={cari}
            onChange={(e) => onCariChange(e.target.value)}
            placeholder="Cari nama siswa"
            className="h-6.5 w-full rounded border border-(--color-border-strong) bg-(--color-surface) px-2 text-xs text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:border-(--color-brand) focus:outline-none"
          />
          {cari && (
            <button
              type="button"
              onClick={() => onCariChange('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-text-primary) text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Jenjang MultiSelect */}
        <div className="shrink-0">
          <MultiSelect
            className="w-auto max-w-36 gap-2"
            value={jenjangList}
            onValueChange={(val) => onJenjangChange(val as JenjangPendidikan[])}
            options={jenjangOptions}
            placeholder="Jenjang"
            density="compact"
          />
        </div>

        {/* Kelas MultiSelect */}
        <div className="shrink-0">
          <MultiSelect
            searchable
            searchPlaceholder="Cari kelas..."
            className="w-auto max-w-42 gap-2"
            value={kelasIds}
            onValueChange={onKelasChange}
            options={kelasOptions}
            placeholder="Kelas"
            density="compact"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative shrink-0" ref={statusRef}>
          <button
            type="button"
            onClick={() => setStatusOpen((prev) => !prev)}
            className={`flex h-6.5 items-center justify-between gap-2.5 rounded border px-2 text-xs whitespace-nowrap cursor-pointer transition-colors ${
              status === 'nonaktif'
                ? 'border-(--color-warning) bg-(--color-warning-bg) text-(--color-warning-ink) font-semibold'
                : status === 'semua'
                  ? 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                  : 'border-(--color-border-strong) bg-(--color-surface) text-(--color-text-secondary) hover:border-(--color-text-muted)'
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
            <div className="absolute left-0 top-7.25 z-12 min-w-full w-max max-h-65 overflow-y-auto rounded-md border border-(--color-border-strong) bg-(--color-surface) p-1 shadow-lg flex flex-col gap-0.25">
              {[
                { id: 'aktif', label: 'Status: Aktif' },
                { id: 'nonaktif', label: 'Status: Nonaktif' },
                { id: 'semua', label: 'Status: semua' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onStatusChange(opt.id as 'aktif' | 'nonaktif' | 'semua');
                    setStatusOpen(false);
                  }}
                  className={`w-full rounded px-2.25 py-1.5 text-left text-[12.5px] whitespace-nowrap cursor-pointer ${
                    status === opt.id
                      ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                      : 'hover:bg-(--color-brand-subtle) text-(--color-text-primary)'
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
            className="flex h-6.5 shrink-0 items-center px-2 rounded border-none bg-transparent hover:bg-(--color-brand-subtle) text-(--color-brand) text-xs cursor-pointer whitespace-nowrap transition-colors"
          >
            Reset filter
          </button>
        )}
      </div>

      <KelolaJenjangModal
        isOpen={kelolaJenjangOpen}
        onClose={() => setKelolaJenjangOpen(false)}
      />
    </div>
  );
}
