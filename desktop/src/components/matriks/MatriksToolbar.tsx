import * as React from 'react';
import { ChevronDown12Regular } from '@fluentui/react-icons';
import type { MataPelajaran, Kelas } from '@/data/types';

interface MatriksToolbarProps {
  mapelList: MataPelajaran[];
  selectedMapelId: string;
  onSelectMapel: (id: string) => void;
  kelasList: Kelas[];
  selectedKelasId: string;
  onSelectKelas: (id: string) => void;
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
  selectedKelasId,
  onSelectKelas,
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
  const [openDropdown, setOpenDropdown] = React.useState<'mapel' | 'kelas' | null>(null);
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
  const currentKelas = kelasList.find((k) => k.id === selectedKelasId);

  return (
    <div ref={containerRef} className="flex flex-col bg-white relative z-50">
      {/* 1. Subheader Row (H: 44px) */}
      <div className="flex h-11 flex-none items-center gap-[11px] border-b border-[#E1DFDD] px-[14px]">
        <div className="text-[12.5px] text-[#5C5A58] truncate">
          apa yang sudah dan belum diterima tiap siswa
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onToggleBulkMode}
          title={isBulkMode ? 'Keluar dari mode ceklis massal' : 'Pilih banyak sel sekaligus untuk mengisi riwayat lama'}
          className={`flex-none h-[26px] px-[11px] rounded border text-[12.5px] cursor-pointer whitespace-nowrap transition-colors ${
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
          className="flex-none h-[26px] px-[11px] rounded border border-[#E1DFDD] bg-[#F5F5F5] text-[#A19F9D] text-[12.5px] cursor-not-allowed"
        >
          Cetak
        </button>
        <button
          type="button"
          disabled
          title="Ekspor CSV menyusul di tahap berikutnya"
          className="flex-none h-[26px] px-[11px] rounded border border-[#E1DFDD] bg-[#F5F5F5] text-[#A19F9D] text-[12.5px] cursor-not-allowed"
        >
          Ekspor CSV
        </button>
      </div>

      {/* 2. Filter Bar (H: 48px, bg #FAFAFA) */}
      <div className="flex flex-none flex-wrap items-center gap-[7px] border-b border-[#E1DFDD] bg-[#FAFAFA] p-[11px_14px] text-[12px] relative z-50">
        {/* Mapel Pill Selector (Wajib di kiri, 1 mapel) */}
        <div className="relative flex-none">
          <button
            type="button"
            onClick={() => setOpenDropdown((prev) => (prev === 'mapel' ? null : 'mapel'))}
            title="Matriks menampilkan satu mata pelajaran sekaligus"
            className="flex h-[26px] items-center justify-between gap-[10px] rounded border border-[#0F6CBD] bg-[#EBF3FC] pl-2 pr-1.5 text-[12px] font-semibold text-[#0C548F] hover:brightness-95 cursor-pointer whitespace-nowrap"
          >
            <span>{currentMapel?.nama || 'Pilih mapel'}</span>
            <ChevronDown12Regular className="text-[#0C548F]" />
          </button>
          {openDropdown === 'mapel' && (
            <div className="absolute left-0 top-[29px] z-50 min-w-full w-max max-h-[260px] overflow-y-auto rounded-md border border-[#C8C6C4] bg-white p-1 shadow-lg flex flex-col gap-px">
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
        <div className="relative flex-none">
          <button
            type="button"
            onClick={() => setOpenDropdown((prev) => (prev === 'kelas' ? null : 'kelas'))}
            className={`flex h-[26px] items-center justify-between gap-[10px] rounded border pl-2 pr-1.5 text-[12px] cursor-pointer whitespace-nowrap hover:border-[#8A8886] ${
              selectedKelasId
                ? 'border-[#0F6CBD] bg-[#EBF3FC] text-[#0C548F] font-semibold'
                : 'border-[#C8C6C4] bg-white text-[#424242]'
            }`}
          >
            <span>{selectedKelasId ? `Kelas: ${currentKelas?.nama}` : 'Kelas: semua'}</span>
            <ChevronDown12Regular className="text-[#8A8886]" />
          </button>
          {openDropdown === 'kelas' && (
            <div className="absolute left-0 top-[29px] z-50 min-w-full w-max max-h-[260px] overflow-y-auto rounded-md border border-[#C8C6C4] bg-white p-1 shadow-lg flex flex-col gap-px">
              <button
                type="button"
                onClick={() => {
                  onSelectKelas('');
                  setOpenDropdown(null);
                }}
                className={`w-full text-left p-[6px_9px] rounded text-[12.5px] whitespace-nowrap cursor-pointer hover:bg-[#EBF3FC] ${
                  !selectedKelasId
                    ? 'bg-[#EBF3FC] text-[#0C548F] font-semibold'
                    : 'bg-white text-[#242424] font-normal'
                }`}
              >
                Kelas: semua
              </button>
              {kelasList.map((k) => {
                const isSelected = k.id === selectedKelasId;
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => {
                      onSelectKelas(k.id);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left p-[6px_9px] rounded text-[12.5px] whitespace-nowrap cursor-pointer hover:bg-[#EBF3FC] ${
                      isSelected
                        ? 'bg-[#EBF3FC] text-[#0C548F] font-semibold'
                        : 'bg-white text-[#242424] font-normal'
                    }`}
                  >
                    Kelas: {k.nama}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Input Cari Siswa */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari siswa"
          className="h-[26px] w-[150px] flex-none rounded border border-[#C8C6C4] bg-white px-2 text-[12px] text-[#242424] placeholder:text-[#8A8886] hover:border-[#8A8886] focus:border-[#0F6CBD] focus:outline-none"
        />

        {/* Reset Filter Button */}
        {hasFilter && (
          <button
            type="button"
            onClick={onResetFilter}
            className="h-[26px] flex-none rounded px-2 text-[12px] text-[#0F6CBD] hover:bg-[#EBF3FC] cursor-pointer whitespace-nowrap"
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
