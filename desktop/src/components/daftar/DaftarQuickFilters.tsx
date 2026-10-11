import * as React from 'react';
import { cn } from '@/lib/utils';
import type { QuickFilterDaftar } from '@/data/types/kegiatan';
import { Warning12Regular, Dismiss12Regular } from '@fluentui/react-icons';

export interface DaftarQuickFiltersProps {
  activeCepat: QuickFilterDaftar | '';
  onToggleCepat: (id: QuickFilterDaftar) => void;
  counts: {
    perlu: number;
    hari: number;
    minggu: number;
    datang: number;
  };
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  totalDisplayed: number;
  totalAll: number;
  sortDesc: boolean;
}

interface ChipConfig {
  id: QuickFilterDaftar;
  label: string;
  isWarn: boolean;
}

const CHIP_CONFIGS: ChipConfig[] = [
  { id: 'perlu', label: 'Perlu realisasi', isWarn: true },
  { id: 'hari', label: 'Hari ini', isWarn: false },
  { id: 'minggu', label: 'Minggu ini', isWarn: false },
  { id: 'datang', label: 'Akan datang', isWarn: false },
];

export const DaftarQuickFilters: React.FC<DaftarQuickFiltersProps> = ({
  activeCepat,
  onToggleCepat,
  counts,
  hasActiveFilters,
  onResetFilters,
  totalDisplayed,
  totalAll,
  sortDesc,
}) => {
  return (
    <div className="flex-none px-3.5 py-2.25 flex gap-1.75 items-center flex-nowrap overflow-x-auto border-b border-(--color-border) bg-white text-[12px] select-none">
      <span className="flex-none text-[11.5px] text-(--color-text-muted) whitespace-nowrap">
        Filter cepat
      </span>

      {CHIP_CONFIGS.map((chip) => {
        const count = counts[chip.id];
        const isActive = activeCepat === chip.id;
        const showWarn = chip.isWarn && (isActive || count > 0);

        let chipBrd = 'border-(--color-border-strong)';
        let chipBg = 'bg-white';
        let chipInk = 'text-(--color-text)';

        if (isActive) {
          if (chip.isWarn) {
            chipBrd = 'border-[#F0A82E]';
            chipBg = 'bg-[#FFF3E0]';
            chipInk = 'text-[#8A5200] font-semibold';
          } else {
            chipBrd = 'border-(--color-brand)';
            chipBg = 'bg-(--color-brand-subtle)';
            chipInk = 'text-(--color-brand-ink) font-semibold';
          }
        }

        return (
          <div
            key={chip.id}
            className={cn(
              'flex-none flex items-center h-6 rounded-full border transition-colors',
              chipBrd,
              chipBg,
              chipInk,
              isActive ? 'pr-0.75' : 'pr-0'
            )}
          >
            <button
              type="button"
              onClick={() => onToggleCepat(chip.id)}
              title={
                isActive
                  ? 'Filter cepat aktif — klik untuk melepas'
                  : `${chip.label} · ${count} kegiatan`
              }
              className={cn(
                'h-6 pl-2.5 pr-2 border-none bg-transparent text-inherit text-[11.5px] cursor-pointer whitespace-nowrap flex items-center gap-1.25 hover:brightness-97 transition-all',
                isActive && 'font-semibold'
              )}
            >
              {showWarn && (
                <Warning12Regular className="w-2.75 h-2.75 flex-none text-[#C47D00] relative top-[0.5px]" />
              )}
              <span className="flex items-baseline gap-1 leading-none">
                <span>{chip.label}</span>
                {count > 0 && (
                  <span className="font-mono text-[10.5px] opacity-85">
                    {count}
                  </span>
                )}
              </span>
            </button>

            {isActive && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCepat(chip.id);
                }}
                title="Lepas filter cepat ini"
                className="w-4 h-4 flex-none mr-0.75 rounded-full border-none bg-transparent text-inherit cursor-pointer flex items-center justify-center hover:bg-[#FDE7E9] hover:text-[#9B0C18] transition-colors"
              >
                <Dismiss12Regular className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        );
      })}

      {/* Right side summary & reset (selalu rata kanan) */}
      <div className="ml-auto flex items-center gap-2 flex-none pl-2">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex-none h-6 px-2 border-none bg-transparent text-(--color-brand) text-[12px] cursor-pointer rounded hover:bg-(--color-brand-subtle) whitespace-nowrap transition-colors"
          >
            Reset filter
          </button>
        )}

        <span className="flex-none text-[12px] text-(--color-text-muted) whitespace-nowrap">
          Menampilkan {totalDisplayed} dari {totalAll} kegiatan · urut{' '}
          {sortDesc ? 'terbaru dulu' : 'terlama dulu'}
        </span>
      </div>
    </div>
  );
};
