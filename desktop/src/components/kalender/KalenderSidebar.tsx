import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronLeft12Regular,
  ChevronRight12Regular,
  Checkmark12Regular,
  Warning12Regular,
  ArrowClockwise12Regular,
  Dismiss12Regular,
} from '@fluentui/react-icons';
import type { StatusKegiatan } from '@/data/types';
import type { KalenderStateFilters } from './useKalenderState';
import {
  toDate,
  toIso,
  addDays,
  getMonday,
  NAMA_BULAN,
} from '@/lib/dateUtils';
import type { JenisKegiatan, Subjek, Kelas, Ruangan, Tempat } from '@/data/types';

export interface KalenderSidebarProps {
  anchorDate: string;
  miniAnchor: string;
  view: 'hari' | 'minggu' | 'bulan';
  todayIso: string;
  filters: KalenderStateFilters;
  jenisList: JenisKegiatan[];
  subjekList: Subjek[];
  kelasList: Kelas[];
  ruanganList: Ruangan[];
  tempatList: Tempat[];
  onSelectDate: (iso: string) => void;
  onPrevMiniMonth: () => void;
  onNextMiniMonth: () => void;
  onFilterChange: (field: keyof Omit<KalenderStateFilters, 'status'>, value: string) => void;
  onToggleStatus: (status: StatusKegiatan) => void;
  onResetFilters: () => void;
  className?: string;
}

export const KalenderSidebar: React.FC<KalenderSidebarProps> = ({
  anchorDate,
  miniAnchor,
  view,
  todayIso,
  filters,
  jenisList,
  subjekList,
  kelasList,
  ruanganList,
  tempatList,
  onSelectDate,
  onPrevMiniMonth,
  onNextMiniMonth,
  onFilterChange,
  onToggleStatus,
  onResetFilters,
  className,
}) => {
  // Tempat lookup map
  const tempatMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const t of tempatList) {
      map.set(t.id, t.nama);
    }
    return map;
  }, [tempatList]);

  // Mini calendar 42-day grid calculation
  const miniDays = React.useMemo(() => {
    const ma = toDate(miniAnchor);
    const firstOfMonth = new Date(ma.getFullYear(), ma.getMonth(), 1);
    const startMon = getMonday(firstOfMonth);
    const anchorD = toDate(anchorDate);
    const weekOfAnchor = toIso(getMonday(anchorD));

    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = addDays(startMon, i);
      const iso = toIso(d);
      const inMonth = d.getMonth() === ma.getMonth();
      const isToday = iso === todayIso;
      const isSelected = iso === anchorDate;
      const inWeek = view === 'minggu' && toIso(getMonday(d)) === weekOfAnchor;

      days.push({
        num: d.getDate(),
        iso,
        inMonth,
        isToday,
        isSelected,
        inWeek,
      });
    }
    return days;
  }, [miniAnchor, anchorDate, todayIso, view]);

  const ma = toDate(miniAnchor);
  const miniMonthLabel = `${NAMA_BULAN[ma.getMonth()]} ${ma.getFullYear()}`;

  // Status definition list with DS tokens
  const STATUS_ITEMS: {
    key: StatusKegiatan;
    label: string;
    icon: React.ReactNode;
    badgeStyle: string;
  }[] = [
    {
      key: 'terjadwal',
      label: 'Terjadwal',
      icon: <span className="text-[10px] leading-none">·</span>,
      badgeStyle: 'bg-(--color-brand-subtle) border-(--color-brand) text-(--color-brand-ink)',
    },
    {
      key: 'terealisasi',
      label: 'Terealisasi',
      icon: <Checkmark12Regular className="text-[11px]" />,
      badgeStyle: 'bg-(--color-success-bg) border-(--color-success) text-(--color-success-ink)',
    },
    {
      key: 'belum_direalisasi',
      label: 'Belum direalisasi',
      icon: <Warning12Regular className="text-[11px]" />,
      badgeStyle: 'bg-(--color-warning-bg) border-(--color-warning) text-(--color-warning-ink)',
    },
    {
      key: 'dijadwal_ulang',
      label: 'Dijadwal ulang',
      icon: <ArrowClockwise12Regular className="text-[11px]" />,
      badgeStyle: 'bg-[#F3EFFA] border-dashed border-[#8764B8] text-[#5B4394]',
    },
    {
      key: 'dibatalkan',
      label: 'Dibatalkan',
      icon: <Dismiss12Regular className="text-[11px]" />,
      badgeStyle: 'bg-(--color-canvas) border-(--color-border) text-(--color-text-muted)',
    },
  ];

  return (
    <aside
      className={cn(
        'w-53 flex-none flex flex-col border-r border-(--color-border) bg-[#FAFAFA] p-2.5 overflow-y-auto select-none',
        className
      )}
    >
      {/* 1. Mini Kalender Header */}
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <button
          type="button"
          onClick={onPrevMiniMonth}
          title="Bulan sebelumnya"
          className="flex h-5.5 w-5.5 items-center justify-center rounded text-(--color-text-secondary) hover:bg-(--color-surface-alt) hover:text-(--color-text) cursor-pointer"
        >
          <ChevronLeft12Regular />
        </button>
        <span className="text-[12.5px] font-semibold text-(--color-text) leading-none">
          {miniMonthLabel}
        </span>
        <button
          type="button"
          onClick={onNextMiniMonth}
          title="Bulan berikutnya"
          className="flex h-5.5 w-5.5 items-center justify-center rounded text-(--color-text-secondary) hover:bg-(--color-surface-alt) hover:text-(--color-text) cursor-pointer"
        >
          <ChevronRight12Regular />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-px mb-0.5 text-center">
        {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((dayChar, i) => (
          <span
            key={`dow-${i}`}
            className="text-[10px] font-semibold text-(--color-text-muted) tracking-wider py-0.5"
          >
            {dayChar}
          </span>
        ))}
      </div>

      {/* 42-day Grid */}
      <div className="grid grid-cols-7 gap-px mb-4">
        {miniDays.map((d) => {
          let btnClass = 'text-(--color-text)';
          if (d.isSelected) {
            btnClass = 'bg-(--color-brand) text-white font-semibold shadow-xs';
          } else if (d.isToday) {
            btnClass = 'bg-[#EBF3FC] text-[#0C548F] font-semibold';
          } else if (d.inWeek) {
            btnClass = 'bg-[#EDEBE9] text-(--color-text)';
          } else if (!d.inMonth) {
            btnClass = 'text-(--color-text-muted) hover:bg-(--color-surface-alt)';
          } else {
            btnClass = 'hover:bg-(--color-surface-alt)';
          }

          return (
            <button
              key={d.iso}
              type="button"
              onClick={() => onSelectDate(d.iso)}
              className={cn(
                'h-5.5 w-full rounded-[3px] font-mono text-[11.5px] flex items-center justify-center transition-colors cursor-pointer',
                btnClass
              )}
            >
              {d.num}
            </button>
          );
        })}
      </div>

      {/* 2. Filter Dropdowns */}
      <div className="text-[11px] font-semibold tracking-wider text-(--color-text-secondary) uppercase mb-1.5">
        Filter
      </div>
      <div className="flex flex-col gap-1.5 mb-4">
        {/* Filter Jenis */}
        <select
          value={filters.jenis}
          onChange={(e) => onFilterChange('jenis', e.target.value)}
          className="h-6.5 w-full rounded border border-(--color-border-strong) bg-white px-1.5 text-[12.5px] text-(--color-text) focus:border-(--color-brand) focus:outline-none cursor-pointer"
        >
          <option value="">Jenis kegiatan</option>
          {jenisList.map((j) => (
            <option key={j.id} value={j.id}>
              {j.nama}
            </option>
          ))}
        </select>

        {/* Filter Subjek */}
        <select
          value={filters.subjek}
          onChange={(e) => onFilterChange('subjek', e.target.value)}
          className="h-6.5 w-full rounded border border-(--color-border-strong) bg-white px-1.5 text-[12.5px] text-(--color-text) focus:border-(--color-brand) focus:outline-none cursor-pointer"
        >
          <option value="">Subjek</option>
          {subjekList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nama}
            </option>
          ))}
        </select>

        {/* Filter Kelas */}
        <select
          value={filters.kelas}
          onChange={(e) => onFilterChange('kelas', e.target.value)}
          className="h-6.5 w-full rounded border border-(--color-border-strong) bg-white px-1.5 text-[12.5px] text-(--color-text) focus:border-(--color-brand) focus:outline-none cursor-pointer"
        >
          <option value="">Kelas</option>
          {kelasList.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama}
            </option>
          ))}
        </select>

        {/* Filter Ruangan */}
        <select
          value={filters.ruangan}
          onChange={(e) => onFilterChange('ruangan', e.target.value)}
          className="h-6.5 w-full rounded border border-(--color-border-strong) bg-white px-1.5 text-[12.5px] text-(--color-text) focus:border-(--color-brand) focus:outline-none cursor-pointer"
        >
          <option value="">Ruangan</option>
          {ruanganList.map((r) => {
            const namaTempat = tempatMap.get(r.tempat) || '';
            return (
              <option key={r.id} value={r.id}>
                {r.nama} {namaTempat ? `· ${namaTempat}` : ''}
              </option>
            );
          })}
        </select>
      </div>

      {/* 3. Status Kegiatan Checkboxes */}
      <div className="text-[11px] font-semibold tracking-wider text-(--color-text-secondary) uppercase mb-1.5">
        Status kegiatan
      </div>
      <div className="flex flex-col gap-1 mb-4">
        {STATUS_ITEMS.map((item) => {
          const isChecked = filters.status.includes(item.key);
          return (
            <label
              key={item.key}
              className="flex items-center gap-2 rounded px-1.5 py-1 text-[12.5px] text-(--color-text) hover:bg-(--color-surface-alt) cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggleStatus(item.key)}
                className="h-3.5 w-3.5 rounded accent-(--color-brand) cursor-pointer"
              />
              <span
                className={cn(
                  'flex h-4 w-4 flex-none items-center justify-center rounded-[3px] border',
                  item.badgeStyle
                )}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </label>
          );
        })}
      </div>

      {/* 4. Reset Filters Action Button */}
      <button
        type="button"
        onClick={onResetFilters}
        className="self-start text-[12.5px] font-medium text-(--color-brand) hover:bg-(--color-brand-subtle) px-1.5 py-1 rounded cursor-pointer transition-colors"
      >
        Reset filter
      </button>
    </aside>
  );
};
