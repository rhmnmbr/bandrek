import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft12Regular, ChevronRight12Regular } from '@fluentui/react-icons';
import type { KalenderViewMode } from './useKalenderState';

export interface KalenderToolbarProps {
  view: KalenderViewMode;
  rangeLabel: string;
  countLabel: string;
  onViewChange: (view: KalenderViewMode) => void;
  onGoToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}

export const KalenderToolbar: React.FC<KalenderToolbarProps> = ({
  view,
  rangeLabel,
  countLabel,
  onViewChange,
  onGoToday,
  onPrev,
  onNext,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex h-11 flex-none items-center gap-2 border-b border-(--color-border) bg-white px-3 select-none',
        className
      )}
    >
      {/* 1. "Hari ini" button */}
      <button
        type="button"
        onClick={onGoToday}
        title="Hari ini (T)"
        className="h-6.5 rounded border border-(--color-border-strong) bg-white px-2.5 text-[12.5px] font-medium text-(--color-text) hover:bg-(--color-surface-alt) active:bg-(--color-surface-sunken) cursor-pointer transition-colors shadow-2xs"
      >
        Hari ini
      </button>

      {/* 2. Navigation Chevrons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          title="Sebelumnya"
          className="flex h-6.5 w-6.5 items-center justify-center rounded border border-(--color-border-strong) bg-white text-(--color-text-secondary) hover:bg-(--color-surface-alt) hover:text-(--color-text) cursor-pointer transition-colors shadow-2xs"
        >
          <ChevronLeft12Regular />
        </button>
        <button
          type="button"
          onClick={onNext}
          title="Berikutnya"
          className="flex h-6.5 w-6.5 items-center justify-center rounded border border-(--color-border-strong) bg-white text-(--color-text-secondary) hover:bg-(--color-surface-alt) hover:text-(--color-text) cursor-pointer transition-colors shadow-2xs"
        >
          <ChevronRight12Regular />
        </button>
      </div>

      {/* 3. Range Date Label */}
      <span className="ml-1 text-[15px] font-semibold text-(--color-text) truncate">
        {rangeLabel}
      </span>

      {/* Flexible Spacer */}
      <div className="flex-1" />

      {/* 4. Filtered Count Summary */}
      <span className="text-[12.5px] text-(--color-text-secondary) hidden sm:inline">
        {countLabel}
      </span>

      {/* 5. View Mode Segmented Control */}
      <div className="flex rounded border border-(--color-border-strong) bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => onViewChange('hari')}
          title="Tampilan Hari (D)"
          className={cn(
            'h-6 px-3 text-[12.5px] cursor-pointer transition-colors font-medium border-r border-(--color-border-subtle)',
            view === 'hari'
              ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
              : 'text-(--color-text) hover:bg-(--color-surface-alt)'
          )}
        >
          Hari
        </button>
        <button
          type="button"
          onClick={() => onViewChange('minggu')}
          title="Tampilan Minggu (W)"
          className={cn(
            'h-6 px-3 text-[12.5px] cursor-pointer transition-colors font-medium border-r border-(--color-border-subtle)',
            view === 'minggu'
              ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
              : 'text-(--color-text) hover:bg-(--color-surface-alt)'
          )}
        >
          Minggu
        </button>
        <button
          type="button"
          onClick={() => onViewChange('bulan')}
          title="Tampilan Bulan (M)"
          className={cn(
            'h-6 px-3 text-[12.5px] cursor-pointer transition-colors font-medium',
            view === 'bulan'
              ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
              : 'text-(--color-text) hover:bg-(--color-surface-alt)'
          )}
        >
          Bulan
        </button>
      </div>
    </div>
  );
};
