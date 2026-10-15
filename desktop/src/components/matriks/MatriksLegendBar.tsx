import * as React from 'react';
import {
  Checkmark16Regular,
  Circle12Filled,
  CircleHalfFill16Regular,
  Mail16Regular,
  Dismiss16Regular,
  Edit16Regular,
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
  { label: 'Tersampaikan', icon: <Checkmark16Regular className="w-3.5 h-3.5 text-current" />, bg: '#E8F5E9', border: '#81C784', text: '#2E7D32' },
  { label: 'Ditandai manual', icon: <Edit16Regular className="w-3.5 h-3.5 text-current" />, bg: '#E0F2F1', border: '#80CBC4', text: '#00695C' },
  { label: 'Sudah dijadwalkan', icon: <Circle12Filled className="w-2.5 h-2.5 text-current" />, bg: '#FAFAFA', border: '#C8C6C4', text: '#5C5A58' },
  { label: 'Sakit', icon: <CircleHalfFill16Regular className="w-2.5 h-2.5 text-current" />, bg: '#FFF3E0', border: '#FFB74D', text: '#8A5200' },
  { label: 'Izin', icon: <Mail16Regular className="w-3 h-3 text-current" />, bg: '#EBF3FC', border: '#90CAF9', text: '#0C548F' },
  { label: 'Alpa', icon: <Dismiss16Regular className="w-3 h-3 text-current" />, bg: '#FDE7E9', border: '#EF9A9A', text: '#9B0C18' },
  { label: 'Belum dijadwalkan', icon: <span className="size-1 rounded-full bg-current opacity-60 flex-none" />, bg: '#FFFFFF', border: '#C8C6C4', text: '#8A8886' },
];

export const MatriksLegendBar: React.FC<MatriksLegendBarProps> = ({ isBulkMode }) => {
  return (
    <div className="flex h-8.5 flex-none items-center gap-3.25 border-t border-[#E1DFDD] bg-[#FAFAFA] px-3.5 text-[11.5px] text-[#424242] select-none">
      {LEGENDA_ITEMS.map((item) => (
        <span key={item.label} className="flex flex-none items-center gap-1.5 whitespace-nowrap">
          <span
            style={{
              backgroundColor: item.bg,
              borderColor: item.border,
              color: item.text,
            }}
            className="flex h-4 w-5 flex-none shrink-0 box-border items-center justify-center rounded-[2px] border leading-none"
          >
            {item.icon}
          </span>
          {item.label}
        </span>
      ))}
      <div className="flex-1 min-w-1.5" />
      <span className="flex-none text-[#5C5A58] whitespace-nowrap">
        {isBulkMode
          ? 'Klik sel, nama siswa, atau judul kolom untuk memilih'
          : 'Klik sel → kegiatan terkait & ceklis manual'}
      </span>
    </div>
  );
};
