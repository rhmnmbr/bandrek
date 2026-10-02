import * as React from 'react';
import { cn } from '@/lib/utils';
import { Add12Regular, Checkmark12Regular, Warning12Regular, ArrowClockwise12Regular } from '@fluentui/react-icons';
import type { Kegiatan } from '@/data/types';
import type { LayoutEventItem } from './kalenderLayout';
import { JAM_AWAL, JAM_AKHIR, SLOT_PX, menit } from '@/lib/dateUtils';
import { jenisColorMap, type JenisKegiatanKey } from '@/components/ui/calendar-event';

export interface DayColumnData {
  iso: string;
  dow: string;
  num: number;
  isToday: boolean;
  isWeekend: boolean;
  events: LayoutEventItem[];
}

export interface KalenderGridProps {
  days: DayColumnData[];
  nowLine?: {
    show: boolean;
    label: string;
    top: number;
    badgeTop: number;
  };
  onSelectEvent: (kegiatan: Kegiatan, e: React.MouseEvent) => void;
  onSelectSlot: (iso: string, hour: number) => void;
  onMoreClick: (iso: string) => void;
  className?: string;
}

interface FreeSlot {
  left: number;
  width: number;
}

/**
 * Menghitung rentang track horizontal yang kosong (belum terisi kegiatan)
 * untuk suatu slot jam tertentu agar hover '+' presisi di area sisa.
 */
function getFreeSlotsForHour(events: LayoutEventItem[], hour: number): FreeSlot[] {
  const hourStart = hour * 60;
  const hourEnd = (hour + 1) * 60;

  const overlapping = events.filter((ev) => {
    const s = ev.startMin != null ? ev.startMin : 0;
    const e = ev.endMin != null ? ev.endMin : 0;
    return s < hourEnd && e > hourStart;
  });

  if (overlapping.length === 0) {
    return [{ left: 0, width: 100 }];
  }

  const occupiedRanges = overlapping
    .map((ev) => ({
      start: Math.max(0, ev.left),
      end: Math.min(100, ev.left + ev.width),
    }))
    .sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [];
  for (const range of occupiedRanges) {
    if (merged.length === 0) {
      merged.push({ ...range });
    } else {
      const prev = merged[merged.length - 1];
      if (range.start <= prev.end + 0.5) {
        prev.end = Math.max(prev.end, range.end);
      } else {
        merged.push({ ...range });
      }
    }
  }

  const freeSlots: FreeSlot[] = [];
  let currentPos = 0;

  for (const occ of merged) {
    if (occ.start > currentPos + 1) {
      freeSlots.push({
        left: Math.round(currentPos * 10) / 10,
        width: Math.round((occ.start - currentPos) * 10) / 10,
      });
    }
    currentPos = Math.max(currentPos, occ.end);
  }

  if (currentPos < 99) {
    freeSlots.push({
      left: Math.round(currentPos * 10) / 10,
      width: Math.round((100 - currentPos) * 10) / 10,
    });
  }

  return freeSlots;
}

export const KalenderGrid: React.FC<KalenderGridProps> = ({
  days,
  nowLine,
  onSelectEvent,
  onSelectSlot,
  onMoreClick,
  className,
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [slotPx, setSlotPx] = React.useState<number>(SLOT_PX);
  const [colWidth, setColWidth] = React.useState<number>(150);

  // Dynamically calculate slot height and column width based on viewport
  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const updateDimensions = () => {
      const h = el.clientHeight;
      const totalHours = JAM_AKHIR - JAM_AWAL; // 17 hours (06:00 - 23:00)
      const pad = 16; // pt-2 (8px) + pb-2 (8px)
      const available = h - pad;
      if (available > 0) {
        const calculated = Math.floor(available / totalHours);
        setSlotPx(Math.max(SLOT_PX, Math.min(46, calculated)));
      }

      const w = el.clientWidth;
      const availableW = w - 56; // 56px left hour column
      if (availableW > 0 && days.length > 0) {
        setColWidth(Math.floor(availableW / days.length));
      }
    };

    updateDimensions();
    const ro = new ResizeObserver(updateDimensions);
    ro.observe(el);
    window.addEventListener('resize', updateDimensions);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [days.length]);

  // Generate 06:00 .. 23:00 hour marks
  const hourMarks = React.useMemo(() => {
    const list = [];
    for (let h = JAM_AWAL; h <= JAM_AKHIR; h++) {
      list.push({
        hour: h,
        label: `${String(h).padStart(2, '0')}:00`,
        top: (h - JAM_AWAL) * slotPx - 6,
      });
    }
    return list;
  }, [slotPx]);

  const minStart = JAM_AWAL * 60;
  const nowTop = nowLine?.show
    ? Math.round(((menit(nowLine.label) - minStart) / 60) * slotPx)
    : 0;
  const nowBadgeTop = nowTop - 8;

  return (
    <div className={cn('flex flex-1 flex-col min-h-0 bg-white select-none', className)}>
      {/* 1. Day Column Headers */}
      <div className="flex border-b border-(--color-border) bg-[#FAFAFA] flex-none">
        {/* Left Spacer for Hour Column (56px) */}
        <div className="w-14 flex-none" />

        {/* Day Header Cells */}
        {days.map((d) => (
          <div
            key={d.iso}
            className={cn(
              'flex-1 min-w-0 h-7.5 flex items-center justify-center gap-1.5 border-l border-[#EDEBE9]',
              d.isToday ? 'bg-[#EBF3FC]' : d.isWeekend ? 'bg-[#FAFAFA]' : 'bg-transparent'
            )}
          >
            <span className="text-[11px] font-semibold text-(--color-text-secondary) tracking-wider">
              {d.dow}
            </span>
            <span
              className={cn(
                "font-mono text-[13px] font-semibold min-w-5.5 h-4.5 px-1.5 rounded-full flex items-center justify-center leading-none",
                d.isToday
                  ? "bg-(--color-brand) text-white"
                  : "text-(--color-text)"
              )}
            >
              {d.num}
            </span>
          </div>
        ))}
      </div>

      {/* 2. Scrollable Time Grid Body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative"
      >
        <div className="flex relative pt-2 pb-2 min-h-full">
          {/* Left Hour Scale (56px) */}
          <div className="w-14 flex-none relative bg-white">
            {hourMarks.map((hm) => (
              <div
                key={`hm-${hm.hour}`}
                style={{ top: `${hm.top}px` }}
                className="absolute right-2 font-mono text-[11px] text-(--color-text-secondary) leading-none select-none"
              >
                {hm.label}
              </div>
            ))}

            {/* Current Time Badge */}
            {nowLine?.show && (
              <div
                style={{ top: `${nowBadgeTop}px` }}
                className="absolute right-1 z-10 font-mono text-[10px] bg-[#C50F1F] text-white px-1 py-0.5 rounded leading-none shadow-xs"
              >
                {nowLine.label}
              </div>
            )}
          </div>

          {/* Grid Columns */}
          <div className="flex-1 min-w-0 flex relative">
            {days.map((d) => (
              <div
                key={`col-${d.iso}`}
                className={cn(
                  'flex-1 min-w-0 relative border-l border-[#EDEBE9]',
                  d.isToday
                    ? 'bg-[rgba(235,243,252,.35)]'
                    : d.isWeekend
                    ? 'bg-[#FAFAFA]'
                    : 'bg-white'
                )}
              >
                {/* Hourly Slot Cells */}
                {Array.from({ length: JAM_AKHIR - JAM_AWAL }).map((_, slotIdx) => {
                  const hour = JAM_AWAL + slotIdx;
                  const freeSlots = getFreeSlotsForHour(d.events, hour);

                  return (
                    <div
                      key={`slot-${d.iso}-${hour}`}
                      style={{ height: `${slotPx}px` }}
                      className="border-b border-[#EDEBE9] relative"
                    >
                      {/* Clickable track-aware free slot areas with hover + indicator */}
                      {freeSlots.map((slot) => {
                        const slotPixelWidth = (slot.width / 100) * colWidth;
                        // Sembunyikan hover jika area sisa terlalu kecil (< 36px) agar tombol '+' tidak terpotong
                        if (slotPixelWidth < 36) return null;

                        return (
                          <button
                            key={`free-slot-${d.iso}-${hour}-${slot.left}`}
                            type="button"
                            onClick={() => onSelectSlot(d.iso, hour)}
                            title={`Klik untuk membuat kegiatan · ${d.num} ${d.dow} ${String(hour).padStart(2, '0')}:00`}
                            style={{
                              left: `calc(${slot.left}% + 1px)`,
                              width: `calc(${slot.width}% - 3px)`,
                            }}
                            className="absolute top-[2px] bottom-[2px] rounded border border-dashed border-transparent hover:border-[#8CC3F0] hover:bg-[#EBF3FC] text-transparent hover:text-(--color-brand) flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Add12Regular className="text-[13px]" />
                          </button>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Overlaid Events Layer */}
                <div className="absolute inset-0 pointer-events-none">
                  {d.events.map((ev) => {
                    const evTop = ev.startMin != null
                      ? Math.round(((ev.startMin - minStart) / 60) * slotPx)
                      : ev.top;
                    const evHeight = ev.startMin != null && ev.endMin != null
                      ? Math.max(30, Math.round(((ev.endMin - ev.startMin) / 60) * slotPx) - 2)
                      : ev.height;

                    // Render "+N lainnya" group button
                    if (ev.lebih) {
                      return (
                        <div
                          key={ev.id}
                          style={{
                            top: `${evTop}px`,
                            height: `${evHeight}px`,
                            left: `${ev.left}%`,
                            width: `${ev.width}%`,
                          }}
                          className="absolute pr-1 pointer-events-auto"
                        >
                          <button
                            type="button"
                            onClick={() => onMoreClick(ev.iso)}
                            title={ev.title}
                            className="w-full h-full rounded-[2px] border border-dashed border-[#8A8886] bg-[#F5F5F5] text-[#424242] hover:bg-[#EDEBE9] hover:border-[#5C5A58] p-1 flex flex-col items-center justify-center text-[11px] leading-tight cursor-pointer overflow-hidden transition-colors"
                          >
                            <span className="font-semibold whitespace-nowrap">
                              +{ev.lebihN}
                            </span>
                            <span className="text-[10px] text-(--color-text-muted) truncate">
                              lainnya
                            </span>
                          </button>
                        </div>
                      );
                    }

                    // Render Standard Event Block
                    const k = ev.kegiatan;
                    if (!k) return null;

                    const jenisKey = (k.warnaJenis || 'pembelajaran') as JenisKegiatanKey;
                    const jInfo = jenisColorMap[jenisKey] || jenisColorMap.pembelajaran;
                    const isBatal = k.status === 'dibatalkan';
                    const isBelum = k.status === 'belum_direalisasi';
                    const isDijadwalUlang = k.status === 'dijadwal_ulang';
                    const isTerealisasi = k.status === 'terealisasi';

                    return (
                      <div
                        key={ev.id}
                        style={{
                          top: `${evTop}px`,
                          height: `${evHeight}px`,
                          left: `${ev.left}%`,
                          width: `${ev.width}%`,
                        }}
                        className="absolute pr-1 pointer-events-auto"
                      >
                        <div
                          tabIndex={0}
                          role="button"
                          data-kegiatan-id={k.id}
                          onClick={(e) => onSelectEvent(k, e)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onSelectEvent(k, e as unknown as React.MouseEvent);
                            }
                          }}
                          title={ev.title}
                          style={{
                            backgroundColor: isBatal ? '#F5F5F5' : jInfo.bg,
                            borderLeftColor: isBatal ? '#C8C6C4' : jInfo.border,
                            color: isBatal ? '#5C5A58' : jInfo.ink,
                          }}
                          className={cn(
                            'h-full rounded-[2px] p-1 overflow-hidden cursor-pointer flex flex-col gap-0.5 border-l-4 transition-all duration-(--dur-fast) select-none',
                            'hover:brightness-96 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black',
                            isBatal
                              ? 'border border-(--color-border)'
                              : isBelum
                              ? 'border border-[#F0A82E] shadow-(--shadow-raised)'
                              : isDijadwalUlang
                              ? 'border border-dashed border-[#8764B8] shadow-(--shadow-raised)'
                              : 'border border-transparent shadow-(--shadow-raised)'
                          )}
                        >
                          {/* Row 1: Time + Status Glyph */}
                          <div className="flex items-center justify-between font-mono text-[10px] leading-tight opacity-90">
                            <span className="truncate">{ev.jamLabel}</span>
                            <span className="flex-none ml-1">
                              {isTerealisasi && (
                                <Checkmark12Regular className="text-(--color-success-ink)" />
                              )}
                              {isBelum && (
                                <Warning12Regular className="text-[#C47D00]" />
                              )}
                              {isDijadwalUlang && (
                                <ArrowClockwise12Regular className="text-[#8764B8]" />
                              )}
                            </span>
                          </div>

                          {/* Row 2: Title */}
                          <div
                            className={cn(
                              'text-[12px] font-semibold leading-snug truncate',
                              isBatal && 'line-through text-(--color-text-muted)'
                            )}
                          >
                            {k.nama}
                          </div>

                          {/* Row 3: Metadata (hidden if block height < 44px) */}
                          {ev.meta && (evHeight >= 44 || ev.height >= 44) && (
                            <div className="text-[10.5px] leading-tight truncate opacity-85">
                              {ev.meta}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Red Current Time Line across grid */}
            {nowLine?.show && (
              <div
                style={{ top: `${nowTop}px` }}
                className="absolute left-0 right-0 h-0 border-t border-[#C50F1F] pointer-events-none z-10"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
