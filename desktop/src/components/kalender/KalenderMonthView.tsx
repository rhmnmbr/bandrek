import * as React from 'react';
import { ArrowSync16Regular } from '@fluentui/react-icons';
import { cn } from '@/lib/utils';
import type { Kegiatan } from '@/data/types';
import { toDate, NAMA_HARI } from '@/lib/dateUtils';
import { jenisColorMap, type JenisKegiatanKey } from '@/components/ui/calendar-event';

export interface KalenderMonthViewProps {
  visibleDates: string[]; // 35 or 42 dates
  currentMonth: number; // 0-11
  todayIso: string;
  kegiatanList: Kegiatan[];
  onSelectEvent: (kegiatan: Kegiatan, e: React.MouseEvent) => void;
  onSelectDay: (iso: string) => void;
  className?: string;
}

export const KalenderMonthView: React.FC<KalenderMonthViewProps> = ({
  visibleDates,
  currentMonth,
  todayIso,
  kegiatanList,
  onSelectEvent,
  onSelectDay,
  className,
}) => {
  // Group activities by ISO date
  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, Kegiatan[]>();
    for (const k of kegiatanList) {
      const arr = map.get(k.tanggal) || [];
      arr.push(k);
      map.set(k.tanggal, arr);
    }
    // Sort each day by start time
    map.forEach((arr) => {
      arr.sort((a, b) => a.mulai.localeCompare(b.mulai));
    });
    return map;
  }, [kegiatanList]);

  // Split visible dates into weeks (7 days each)
  const weeks = React.useMemo(() => {
    const result: string[][] = [];
    for (let i = 0; i < visibleDates.length; i += 7) {
      result.push(visibleDates.slice(i, i + 7));
    }
    return result;
  }, [visibleDates]);

  return (
    <div className={cn('flex flex-1 flex-col min-h-0 bg-white select-none', className)}>
      {/* 1. Header with Day Names */}
      <div className="flex border-b border-(--color-border) bg-[#FAFAFA] flex-none">
        {NAMA_HARI.map((dayName, i) => (
          <div
            key={dayName}
            className={cn(
              'flex-1 h-6.5 flex items-center justify-center text-[11px] font-semibold text-(--color-text-secondary) tracking-wider',
              i > 0 && 'border-l border-[#EDEBE9]'
            )}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* 2. Month Grid Weeks */}
      <div className="flex flex-1 flex-col min-h-0">
        {weeks.map((week, wIdx) => (
          <div
            key={`week-${wIdx}`}
            className="flex flex-1 border-b border-[#EDEBE9] min-h-0"
          >
            {week.map((iso, dIdx) => {
              const d = toDate(iso);
              const inCurrentMonth = d.getMonth() === currentMonth;
              const isToday = iso === todayIso;
              const dow = (d.getDay() + 6) % 7;
              const isWeekend = dow >= 5;
              const dayEvents = eventsByDate.get(iso) || [];
              const visibleChips = dayEvents.slice(0, 3);
              const overflowCount = dayEvents.length - visibleChips.length;

              return (
                <div
                  key={iso}
                  onClick={() => onSelectDay(iso)}
                  className={cn(
                    'flex-1 min-w-0 p-1.5 flex flex-col gap-1 overflow-hidden cursor-pointer transition-colors',
                    dIdx > 0 && 'border-l border-[#EDEBE9]',
                    inCurrentMonth
                      ? isWeekend
                        ? 'bg-[#FAFAFA] hover:bg-[#F0EFEF]'
                        : 'bg-white hover:bg-[#FAFAFA]'
                      : 'bg-[#FAFAFA] hover:bg-[#F0EFEF]'
                  )}
                >
                  {/* Day Date Pill */}
                  <div
                    className={cn(
                      'font-mono text-[11.5px] self-start min-w-5 h-4.5 px-1 rounded-full flex items-center justify-center leading-none',
                      isToday
                        ? 'bg-(--color-brand) text-white font-semibold'
                        : inCurrentMonth
                        ? 'text-(--color-text)'
                        : 'text-(--color-text-muted)'
                    )}
                  >
                    {d.getDate()}
                  </div>

                  {/* Up to 3 Event Chips */}
                  <div className="flex flex-col gap-1 overflow-hidden">
                    {visibleChips.map((k) => {
                      const jenisKey = (k.warnaJenis || 'pembelajaran') as JenisKegiatanKey;
                      const jInfo = jenisColorMap[jenisKey] || jenisColorMap.pembelajaran;
                      const isBatal = k.status === 'dibatalkan';

                      return (
                        <div
                          key={k.id}
                          data-kegiatan-id={k.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(k, e);
                          }}
                          title={`${k.mulai} ${k.nama}`}
                          style={{
                            backgroundColor: isBatal ? '#F5F5F5' : jInfo.bg,
                            borderLeftColor: isBatal ? '#C8C6C4' : jInfo.border,
                            color: isBatal ? '#5C5A58' : jInfo.ink,
                          }}
                          className={cn(
                            'flex items-center gap-1.5 px-1.5 py-0.5 rounded-[2px] border-l-3 text-[11px] leading-tight truncate shadow-2xs transition-colors hover:brightness-96',
                            isBatal && 'line-through text-(--color-text-muted)'
                          )}
                        >
                          <span className="font-mono text-[10px] opacity-85 flex-none flex items-center gap-0.5">
                            {k.seriId && <ArrowSync16Regular className="w-2.5 h-2.5 flex-none" />}
                            <span>{k.mulai}</span>
                          </span>
                          <span className="truncate font-medium">{k.nama}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Overflow Link */}
                  {overflowCount > 0 && (
                    <div className="text-[10.5px] font-medium text-(--color-brand) pl-0.5 truncate mt-auto">
                      +{overflowCount} lainnya
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
