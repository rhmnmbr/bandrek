import * as React from 'react';
import { ChevronDown12Regular } from '@fluentui/react-icons';
import { MultiSelect } from '@/components/ui/select';
import type { MataPelajaran, Kelas } from '@/data/types';

interface MatriksToolbarProps {
  mapelList: MataPelajaran[];
  selectedMapelId: string;
  onSelectMapel: (id: string) => void;
  kelasList: Kelas[];
  selectedKelasIds: string[];
  onSelectKelasIds: (ids: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showNonaktif: boolean;
  onToggleNonaktif: () => void;
  tandaiTertinggal: boolean;
  onToggleTandaiTertinggal: () => void;
  onResetFilter: () => void;
  hasFilter: boolean;
  isBulkMode: boolean;
  onToggleBulkMode: () => void;
}

export const MatriksToolbar: React.FC<MatriksToolbarProps> = ({
  mapelList,
  selectedMapelId,
  onSelectMapel,
  kelasList,
  selectedKelasIds,
  onSelectKelasIds,
  searchQuery,
  onSearchChange,
  showNonaktif,
  onToggleNonaktif,
  tandaiTertinggal,
  onToggleTandaiTertinggal,
  onResetFilter,
  hasFilter,
  isBulkMode,
  onToggleBulkMode,
}) => {
  // Dropdown open states
  const [openDropdown, setOpenDropdown] = React.useState<'mapel' | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentMapel = mapelList.find((m) => m.id === selectedMapelId);
  const kelasOptions = React.useMemo(() => {
    return kelasList.map((k) => ({ value: k.id, label: k.nama }));
  }, [kelasList]);

  return (
    <div ref={containerRef} className="flex flex-col bg-white relative z-50">
      {/* 1. Subheader Row (H: 44px) */}
      <div className="flex h-11 flex-none items-center gap-2.75 border-b border-[#E1DFDD] px-3.5">
        <div className="text-[12.5px] text-[#5C5A58] truncate">
          apa yang sudah dan belum diterima tiap siswa
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onToggleBulkMode}
          title={isBulkMode ? 'Keluar dari mode ceklis massal' : 'Pilih banyak sel sekaligus untuk mengisi riwayat lama'}
          className={`flex-none h-6.5 px-2.75 rounded border text-[12.5px] cursor-pointer whitespace-nowrap transition-colors ${
            isBulkMode
              ? 'border-[#0F6CBD] bg-[#EBF3FC] text-[#0C548F] font-semibold'
              : 'border-[#C8C6C4] bg-white text-[#242424] hover:bg-[#FAFAFA]'
          }`}
        >
          Ceklis massal
        </button>
        <button
          type="button"
          disabled
          title="Cetak menyusul di tahap berikutnya"
          className="flex-none h-6.5 px-2.75 rounded border border-[#E1DFDD] bg-[#F5F5F5] text-[#A19F9D] text-[12.5px] cursor-not-allowed"
        >
          Cetak
        </button>
      </div>

      {/* 2. Filter Bar (H: 48px, bg #FAFAFA) */}
      <div className="flex flex-none flex-wrap items-center gap-1.75 border-b border-[#E1DFDD] bg-[#FAFAFA] p-[11px_14px] text-[12px] relative z-50">
        {/* Mapel Pill Selector (Wajib di kiri, 1 mapel) */}
        <div className="relative flex-none">
          <button
            type="button"
            onClick={() => setOpenDropdown((prev) => (prev === 'mapel' ? null : 'mapel'))}
            title="Matriks menampilkan satu mata pelajaran sekaligus"
            className="flex h-6.5 items-center justify-between gap-2.5 rounded border border-[#0F6CBD] bg-[#EBF3FC] pl-2 pr-1.5 text-[12px] font-semibold text-[#0C548F] hover:brightness-95 cursor-pointer whitespace-nowrap"
          >
            <span>{currentMapel?.nama || 'Pilih mapel'}</span>
            <ChevronDown12Regular className="text-[#0C548F]" />
          </button>
          {openDropdown === 'mapel' && (
            <div className="absolute left-0 top-7.25 z-50 min-w-full w-max max-h-65 overflow-y-auto rounded-md border border-[#C8C6C4] bg-white p-1 shadow-lg flex flex-col gap-px">
              {mapelList.map((m) => {
                const isSelected = m.id === selectedMapelId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onSelectMapel(m.id);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left p-[6px_9px] rounded text-[12.5px] whitespace-nowrap cursor-pointer hover:bg-[#EBF3FC] ${
                      isSelected
                        ? 'bg-[#EBF3FC] text-[#0C548F] font-semibold'
                        : 'bg-white text-[#242424] font-normal'
                    }`}
                  >
                    {m.nama}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px flex-none bg-[#E1DFDD]" />

        {/* Kelas Filter Selector */}
        <div className="flex-none">
          <MultiSelect
            className="w-auto max-w-40 gap-2"
            value={selectedKelasIds}
            onValueChange={onSelectKelasIds}
            options={kelasOptions}
            placeholder="Kelas"
            density="compact"
          />
        </div>

        {/* Input Cari Siswa */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari siswa"
          className="h-6.5 w-37.5 flex-none rounded border border-[#C8C6C4] bg-white px-2 text-[12px] text-[#242424] placeholder:text-[#8A8886] hover:border-[#8A8886] focus:border-[#0F6CBD] focus:outline-none"
        />

        {/* Reset Filter Button */}
        {hasFilter && (
          <button
            type="button"
            onClick={onResetFilter}
            className="h-6.5 flex-none rounded px-2 text-[12px] text-[#0F6CBD] hover:bg-[#EBF3FC] cursor-pointer whitespace-nowrap"
          >
            Reset filter
          </button>
        )}

        <div className="flex-1 min-w-2" />

        {/* Filter Checkboxes */}
        <div className="flex flex-none items-center gap-5 text-[12px] text-[#424242]">
          {/* Checkbox Tampilkan Siswa Nonaktif */}
          <label className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={showNonaktif}
              onChange={onToggleNonaktif}
              className="w-3.5 h-3.5 m-0 accent-(--color-brand) cursor-pointer translate-y-px"
            />
            <span className="leading-none">Tampilkan siswa nonaktif</span>
          </label>

          {/* Checkbox Tandai Siswa Tertinggal */}
          <label className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={tandaiTertinggal}
              onChange={onToggleTandaiTertinggal}
              className="w-3.5 h-3.5 m-0 accent-(--color-brand) cursor-pointer translate-y-px"
            />
            <span className="leading-none">Tandai siswa tertinggal</span>
          </label>
        </div>
      </div>
    </div>
  );
};
