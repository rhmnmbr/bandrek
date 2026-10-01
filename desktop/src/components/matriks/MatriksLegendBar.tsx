import * as React from 'react';
import {
  Checkmark12Regular,
  Circle12Filled,
  CircleHalfFill12Regular,
  Mail12Regular,
  Dismiss12Regular,
} from '@fluentui/react-icons';

interface MatriksLegendBarProps {
  isBulkMode: boolean;
}

const LEGENDA_ITEMS: Array<{
  label: string;
  icon: React.ReactNode;
  bg: string;
  border: string;
  text: string;
}> = [
  { label: 'Tersampaikan', icon: <Checkmark12Regular className="w-3 h-3 text-current" />, bg: '#E8F5E9', border: '#4CAF50', text: '#2E7D32' },
  { label: 'Ditandai manual', icon: <Checkmark12Regular className="w-3 h-3 text-current opacity-90" />, bg: '#F2FAF3', border: '#9CCBA0', text: '#2E7D32' },
  { label: 'Sudah dijadwalkan', icon: <Circle12Filled className="w-2 h-2 text-current" />, bg: '#FAFAFA', border: '#C8C6C4', text: '#5C5A58' },
  { label: 'Sakit', icon: <CircleHalfFill12Regular className="w-2.5 h-2.5 text-current" />, bg: '#FFF3E0', border: '#F0A82E', text: '#8A5200' },
  { label: 'Izin', icon: <Mail12Regular className="w-2.5 h-2.5 text-current" />, bg: '#EBF3FC', border: '#0F6CBD', text: '#0C548F' },
  { label: 'Alpa', icon: <Dismiss12Regular className="w-2.5 h-2.5 text-current" />, bg: '#FDE7E9', border: '#C50F1F', text: '#9B0C18' },
  { label: 'Belum dijadwalkan', icon: <span className="text-[11px] leading-none opacity-60">·</span>, bg: '#FFFFFF', border: '#EDEBE9', text: '#8A8886' },
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
            }}
            className="flex h-3.5 w-5 flex-none items-center justify-center rounded-[2px] border leading-none"
          >
            {item.icon}
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
