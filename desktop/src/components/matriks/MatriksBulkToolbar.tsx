import * as React from 'react';
import { DatePicker } from '@/components/ui/date-picker';

interface MatriksBulkToolbarProps {
  selectedCount: number;
  tanggal: string;
  onTanggalChange: (val: string) => void;
  catatan: string;
  onCatatanChange: (val: string) => void;
  onApply: () => void;
  onRelease: () => void;
  onExit: () => void;
}

export const MatriksBulkToolbar: React.FC<MatriksBulkToolbarProps> = ({
  selectedCount,
  tanggal,
  onTanggalChange,
  catatan,
  onCatatanChange,
  onApply,
  onRelease,
  onExit,
}) => {
  const isSelected = selectedCount > 0;

  return (
    <div className="flex flex-none items-center gap-[9px] flex-wrap border-t border-[#0F6CBD] bg-[#EBF3FC] p-[9px_14px] text-[12px] text-[#0C548F]">
      <span className="flex-none font-semibold whitespace-nowrap">
        {selectedCount} sel dipilih
      </span>
      <span className="flex-none text-[#424242] whitespace-nowrap">
        {isSelected
          ? 'Sel yang sudah tersampaikan lewat kehadiran akan dilewati.'
          : 'Klik sel, nama siswa, atau judul kolom.'}
      </span>

      <div className="flex-1 min-w-2" />

      {/* Tanggal Picker */}
      <div className="flex flex-none items-center gap-1.5 text-[#424242] whitespace-nowrap">
        <span>Tanggal</span>
        <div className="w-[140px]">
          <DatePicker
            value={tanggal}
            onChange={onTanggalChange}
            placeholder="Pilih tanggal"
            density="compact"
            className="h-[26px] bg-white font-mono text-[11.5px]"
          />
        </div>
      </div>

      {/* Catatan Input */}
      <input
        type="text"
        value={catatan}
        onChange={(e) => onCatatanChange(e.target.value)}
        placeholder="Catatan untuk semua (opsional)"
        className="flex-none h-[26px] w-[230px] rounded border border-[#C8C6C4] bg-white px-2 text-[12px] text-[#242424] placeholder:text-[#8A8886] hover:border-[#8A8886] focus:border-[#0F6CBD] focus:outline-none"
      />

      {/* Button Lepas Ceklis */}
      <button
        type="button"
        disabled={!isSelected}
        onClick={onRelease}
        className={`flex-none h-[26px] px-[11px] rounded border text-[12px] whitespace-nowrap transition-colors ${
          isSelected
            ? 'border-[#C8C6C4] bg-white text-[#242424] hover:bg-[#FAFAFA] cursor-pointer'
            : 'border-[#E1DFDD] bg-white text-[#A19F9D] cursor-not-allowed'
        }`}
      >
        Lepas ceklis
      </button>

      {/* Button Tandai Sudah Dipelajari */}
      <button
        type="button"
        disabled={!isSelected}
        onClick={onApply}
        title={isSelected ? `Tandai ${selectedCount} sel sebagai sudah dipelajari` : 'Pilih dulu sel yang mau ditandai'}
        className={`flex-none h-[26px] px-3 rounded text-[12px] font-semibold whitespace-nowrap transition-colors ${
          isSelected
            ? 'bg-[#0F6CBD] text-white hover:brightness-95 cursor-pointer'
            : 'bg-[#EDEBE9] text-[#8A8886] cursor-not-allowed'
        }`}
      >
        Tandai sudah dipelajari
      </button>

      {/* Button Selesai */}
      <button
        type="button"
        onClick={onExit}
        className="flex-none h-[26px] px-[11px] rounded border border-[#C8C6C4] bg-white text-[12px] text-[#242424] hover:bg-[#FAFAFA] cursor-pointer whitespace-nowrap"
      >
        Selesai
      </button>
    </div>
  );
};
