import * as React from 'react';

interface MatriksLegendBarProps {
  isBulkMode: boolean;
}

const LEGENDA_ITEMS = [
  { label: 'Tersampaikan', glyph: '✓', bg: '#E8F5E9', border: '#4CAF50', text: '#2E7D32', italic: false },
  { label: 'Ditandai manual', glyph: '✓', bg: '#F2FAF3', border: '#9CCBA0', text: '#2E7D32', italic: true },
  { label: 'Sudah dijadwalkan', glyph: '●', bg: '#FAFAFA', border: '#C8C6C4', text: '#5C5A58', italic: false },
  { label: 'Sakit', glyph: '◐', bg: '#FFF3E0', border: '#F0A82E', text: '#8A5200', italic: false },
  { label: 'Izin', glyph: '✉', bg: '#EBF3FC', border: '#0F6CBD', text: '#0C548F', italic: false },
  { label: 'Alpa', glyph: '✕', bg: '#FDE7E9', border: '#C50F1F', text: '#9B0C18', italic: false },
  { label: 'Belum dijadwalkan', glyph: '·', bg: '#FFFFFF', border: '#EDEBE9', text: '#8A8886', italic: false },
];

export const MatriksLegendBar: React.FC<MatriksLegendBarProps> = ({ isBulkMode }) => {
  return (
    <div className="flex h-[34px] flex-none items-center gap-[13px] border-t border-[#E1DFDD] bg-[#FAFAFA] px-[14px] text-[11.5px] text-[#424242] select-none">
      {LEGENDA_ITEMS.map((item) => (
        <span key={item.label} className="flex flex-none items-center gap-1.5 whitespace-nowrap">
          <span
            style={{
              backgroundColor: item.bg,
              borderColor: item.border,
              color: item.text,
              fontStyle: item.italic ? 'italic' : 'normal',
            }}
            className="flex h-3.5 w-5 flex-none items-center justify-center rounded-[2px] border text-[9px] font-semibold leading-none"
          >
            {item.glyph}
          </span>
          {item.label}
        </span>
      ))}
      <div className="flex-1 min-w-[6px]" />
      <span className="flex-none text-[#5C5A58] whitespace-nowrap">
        {isBulkMode
          ? 'Klik sel, nama siswa, atau judul kolom untuk memilih'
          : 'Klik sel → kegiatan terkait & ceklis manual'}
      </span>
    </div>
  );
};
