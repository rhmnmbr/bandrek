import { useState, useRef, useEffect } from 'react';
import { Add16Regular } from '@fluentui/react-icons';
import type { JenjangPendidikan } from '@/data/types/common';
import type { Kelas } from '@/data/types/master';

interface SiswaToolbarProps {
  totalAktif: number;
  totalNonaktif: number;
  cari: string;
  onCariChange: (val: string) => void;
  jenjang: JenjangPendidikan | 'semua';
  onJenjangChange: (val: JenjangPendidikan | 'semua') => void;
  kelasId: string;
  onKelasChange: (val: string) => void;
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
  jenjang,
  onJenjangChange,
  kelasId,
  onKelasChange,
  kelasList,
  status,
  onStatusChange,
  adaFilter,
  onResetFilter,
  onSiswaBaru,
}: SiswaToolbarProps) {
  const [jenjangOpen, setJenjangOpen] = useState(false);
  const [kelasOpen, setKelasOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const jenjangRef = useRef<HTMLDivElement>(null);
  const kelasRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (jenjangRef.current && !jenjangRef.current.contains(e.target as Node)) {
        setJenjangOpen(false);
      }
      if (kelasRef.current && !kelasRef.current.contains(e.target as Node)) {
        setKelasOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const jenjangLabel = jenjang !== 'semua' ? `Jenjang: ${jenjang}` : 'Jenjang: semua';
  const kelasObj = kelasList.find((k) => k.id === kelasId);
  const kelasLabel =
    kelasId === '-'
      ? 'Kelas: belum punya'
      : kelasObj
        ? `Kelas: ${kelasObj.nama}`
        : 'Kelas: semua';
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
          disabled
          title="Impor CSV menyusul di tahap berikutnya"
          className="flex h-6.5 shrink-0 items-center px-2.5 rounded border border-(--color-border) bg-(--color-surface-sunken) text-(--color-text-disabled) text-[12.5px] cursor-not-allowed whitespace-nowrap"
        >
          Impor CSV
        </button>
        <button
          type="button"
          onClick={onSiswaBaru}
          title="Tambah siswa baru · Ctrl+N"
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

        {/* Jenjang Dropdown */}
        <div className="relative shrink-0" ref={jenjangRef}>
          <button
            type="button"
            onClick={() => setJenjangOpen((prev) => !prev)}
            className={`flex h-6.5 items-center justify-between gap-2.5 rounded border px-2 text-xs whitespace-nowrap cursor-pointer transition-colors ${
              jenjang !== 'semua'
                ? 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                : 'border-(--color-border-strong) bg-(--color-surface) text-(--color-text-secondary) hover:border-(--color-text-muted)'
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
            <div className="absolute left-0 top-7.25 z-12 min-w-full w-max max-h-65 overflow-y-auto rounded-md border border-(--color-border-strong) bg-(--color-surface) p-1 shadow-lg flex flex-col gap-0.25">
              {[
                { id: 'semua', label: 'Jenjang: semua' },
                { id: 'SD', label: 'Jenjang: SD' },
                { id: 'SMP', label: 'Jenjang: SMP' },
                { id: 'SMA', label: 'Jenjang: SMA' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onJenjangChange(opt.id as JenjangPendidikan | 'semua');
                    setJenjangOpen(false);
                  }}
                  className={`w-full rounded px-2.25 py-1.5 text-left text-[12.5px] whitespace-nowrap cursor-pointer ${
                    jenjang === opt.id
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

        {/* Kelas Dropdown */}
        <div className="relative shrink-0" ref={kelasRef}>
          <button
            type="button"
            onClick={() => setKelasOpen((prev) => !prev)}
            className={`flex h-6.5 max-w-42 items-center justify-between gap-2.5 rounded border px-2 text-xs whitespace-nowrap cursor-pointer transition-colors ${
              kelasId
                ? 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                : 'border-(--color-border-strong) bg-(--color-surface) text-(--color-text-secondary) hover:border-(--color-text-muted)'
            }`}
          >
            <span className="truncate">{kelasLabel}</span>
            <svg width="12" height="12" viewBox="0 0 16 16" className="shrink-0 text-(--color-text-muted)">
              <path
                fill="currentColor"
                d="M3.15 5.65c.2-.2.5-.2.7 0L8 9.79l4.15-4.14c.2-.2.5-.2.7 0 .2.2.2.5 0 .7l-4.5 4.5c-.2.2-.5.2-.7 0l-4.5-4.5c-.2-.2-.2-.5 0-.7Z"
              />
            </svg>
          </button>
          {kelasOpen && (
            <div className="absolute left-0 top-7.25 z-12 min-w-full w-max max-h-65 overflow-y-auto rounded-md border border-(--color-border-strong) bg-(--color-surface) p-1 shadow-lg flex flex-col gap-0.25">
              <button
                type="button"
                onClick={() => {
                  onKelasChange('');
                  setKelasOpen(false);
                }}
                className={`w-full rounded px-2.25 py-1.5 text-left text-[12.5px] whitespace-nowrap cursor-pointer ${
                  !kelasId
                    ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                    : 'hover:bg-(--color-brand-subtle) text-(--color-text-primary)'
                }`}
              >
                Kelas: semua
              </button>
              <button
                type="button"
                onClick={() => {
                  onKelasChange('-');
                  setKelasOpen(false);
                }}
                className={`w-full rounded px-2.25 py-1.5 text-left text-[12.5px] whitespace-nowrap cursor-pointer ${
                  kelasId === '-'
                    ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                    : 'hover:bg-(--color-brand-subtle) text-(--color-text-primary)'
                }`}
              >
                Kelas: belum punya
              </button>
              {kelasList.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => {
                    onKelasChange(k.id);
                    setKelasOpen(false);
                  }}
                  className={`w-full rounded px-2.25 py-1.5 text-left text-[12.5px] whitespace-nowrap cursor-pointer ${
                    kelasId === k.id
                      ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                      : 'hover:bg-(--color-brand-subtle) text-(--color-text-primary)'
                  }`}
                >
                  Kelas: {k.nama}
                </button>
              ))}
            </div>
          )}
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
    </div>
  );
}
