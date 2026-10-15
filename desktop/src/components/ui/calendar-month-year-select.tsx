import * as React from 'react';
import {
  ChevronDown12Regular,
  ChevronLeft12Regular,
  ChevronRight12Regular,
  Checkmark12Regular,
} from '@fluentui/react-icons';
import { cn } from '@/lib/utils';
import { NAMA_BULAN } from '@/lib/dateUtils';

export interface CalendarMonthYearSelectProps {
  month: number; // 0 - 11
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onPrevMonth: (e?: React.MouseEvent) => void;
  onNextMonth: (e?: React.MouseEvent) => void;
  minYear?: number;
  maxYear?: number;
  className?: string;
}

export const CalendarMonthYearSelect: React.FC<CalendarMonthYearSelectProps> = ({
  month,
  year,
  onMonthChange,
  onYearChange,
  onPrevMonth,
  onNextMonth,
  minYear = 1970,
  maxYear = new Date().getFullYear() + 5,
  className,
}) => {
  const [openMenu, setOpenMenu] = React.useState<'month' | 'year' | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const yearListRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    if (!openMenu) return;
    const handleDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [openMenu]);

  // Auto-scroll to selected year
  React.useEffect(() => {
    if (openMenu === 'year' && yearListRef.current) {
      const selectedEl = yearListRef.current.querySelector('[data-selected="true"]') as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'center' });
      }
    }
  }, [openMenu]);

  // Year options list
  const yearOptions = React.useMemo(() => {
    const high = Math.max(maxYear, year);
    const low = Math.min(minYear, year);
    const list: number[] = [];
    for (let y = high; y >= low; y--) {
      list.push(y);
    }
    return list;
  }, [maxYear, minYear, year]);

  return (
    <div
      ref={containerRef}
      className={cn('relative flex items-center justify-between gap-1 mb-2 select-none', className)}
    >
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {/* Month Selector Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu((prev) => (prev === 'month' ? null : 'month'))}
            title="Pilih bulan"
            className={cn(
              'flex items-center gap-1 h-6.5 px-2 rounded border text-[12px] font-semibold transition-colors cursor-pointer select-none',
              openMenu === 'month'
                ? 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand)'
                : 'border-(--color-border-strong) bg-white text-(--color-text-primary) hover:border-(--color-brand)'
            )}
          >
            <span>{NAMA_BULAN[month]}</span>
            <ChevronDown12Regular
              className={cn(
                'w-3 h-3 text-(--color-text-muted) transition-transform duration-150',
                openMenu === 'month' && 'rotate-180 text-(--color-brand)'
              )}
            />
          </button>

          {/* Custom Month Dropdown Menu */}
          {openMenu === 'month' && (
            <div className="absolute left-0 top-full mt-1 z-30 w-36 max-h-56 overflow-y-auto rounded-md border border-(--color-border-strong) bg-white p-1 shadow-lg animate-in fade-in-0 zoom-in-95 duration-100 flex flex-col gap-0.5">
              {NAMA_BULAN.map((mName, idx) => {
                const isSelected = idx === month;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onMonthChange(idx);
                      setOpenMenu(null);
                    }}
                    data-selected={isSelected}
                    className={cn(
                      'w-full px-2 py-1 rounded text-left text-[12px] flex items-center justify-between cursor-pointer transition-colors border-none',
                      isSelected
                        ? 'bg-(--color-brand-subtle) text-(--color-brand) font-semibold'
                        : 'text-(--color-text-primary) hover:bg-(--color-surface-alt)'
                    )}
                  >
                    <span>{mName}</span>
                    {isSelected && <Checkmark12Regular className="w-3.5 h-3.5 text-(--color-brand) flex-none" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Year Selector Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu((prev) => (prev === 'year' ? null : 'year'))}
            title="Pilih tahun"
            className={cn(
              'flex items-center gap-1 h-6.5 px-2 rounded border font-mono text-[12px] font-semibold transition-colors cursor-pointer select-none',
              openMenu === 'year'
                ? 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand)'
                : 'border-(--color-border-strong) bg-white text-(--color-text-primary) hover:border-(--color-brand)'
            )}
          >
            <span>{year}</span>
            <ChevronDown12Regular
              className={cn(
                'w-3 h-3 text-(--color-text-muted) transition-transform duration-150',
                openMenu === 'year' && 'rotate-180 text-(--color-brand)'
              )}
            />
          </button>

          {/* Custom Year Dropdown Menu */}
          {openMenu === 'year' && (
            <div
              ref={yearListRef}
              className="absolute left-0 top-full mt-1 z-30 w-28 max-h-56 overflow-y-auto rounded-md border border-(--color-border-strong) bg-white p-1 shadow-lg animate-in fade-in-0 zoom-in-95 duration-100 flex flex-col gap-0.5"
            >
              {yearOptions.map((y) => {
                const isSelected = y === year;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      onYearChange(y);
                      setOpenMenu(null);
                    }}
                    data-selected={isSelected}
                    className={cn(
                      'w-full px-2 py-1 rounded text-left text-[12px] font-mono flex items-center justify-between cursor-pointer transition-colors border-none',
                      isSelected
                        ? 'bg-(--color-brand-subtle) text-(--color-brand) font-semibold'
                        : 'text-(--color-text-primary) hover:bg-(--color-surface-alt)'
                    )}
                  >
                    <span>{y}</span>
                    {isSelected && <Checkmark12Regular className="w-3.5 h-3.5 text-(--color-brand) flex-none" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Prev / Next Chevrons */}
      <div className="flex items-center gap-0.5 flex-none">
        <button
          type="button"
          onClick={onPrevMonth}
          title="Bulan sebelumnya"
          className="flex h-5.5 w-5.5 items-center justify-center rounded border-none bg-transparent hover:bg-(--color-surface-alt) text-(--color-text-secondary) cursor-pointer transition-colors"
        >
          <ChevronLeft12Regular className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onNextMonth}
          title="Bulan berikutnya"
          className="flex h-5.5 w-5.5 items-center justify-center rounded border-none bg-transparent hover:bg-(--color-surface-alt) text-(--color-text-secondary) cursor-pointer transition-colors"
        >
          <ChevronRight12Regular className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
