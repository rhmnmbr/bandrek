import * as React from 'react';
import type { StatusKegiatan } from '@/data/types';
import {
  toDate,
  toIso,
  addDays,
  addMonths,
  getMonday,
  formatRentangMinggu,
  formatRentangWeekend,
  formatTanggalHari,
  formatBulanTahun,
} from '@/lib/dateUtils';

export type KalenderViewMode = 'hari' | 'minggu' | 'weekend' | 'bulan';

export const STATUS_DEFAULT: StatusKegiatan[] = [
  'terjadwal',
  'terealisasi',
  'belum_direalisasi',
  'dijadwal_ulang',
];

export interface KalenderStateFilters {
  jenis: string[];
  subjek: string[];
  siswa: string[];
  kelas: string[];
  ruangan: string[];
  status: StatusKegiatan[];
}

export function useKalenderState(initialAnchor: string = '2026-09-16') {
  const [view, setView] = React.useState<KalenderViewMode>('minggu');
  const [anchorDate, setAnchorDate] = React.useState<string>(initialAnchor);
  const [miniAnchor, setMiniAnchor] = React.useState<string>(initialAnchor);

  // Filters state
  const [filters, setFilters] = React.useState<KalenderStateFilters>({
    jenis: [],
    subjek: [],
    siswa: [],
    kelas: [],
    ruangan: [],
    status: [...STATUS_DEFAULT],
  });

  // Navigation handlers
  const goToday = React.useCallback(() => {
    setAnchorDate(initialAnchor);
    setMiniAnchor(initialAnchor);
  }, [initialAnchor]);

  const prev = React.useCallback(() => {
    const d = toDate(anchorDate);
    if (view === 'hari') {
      const prevDay = toIso(addDays(d, -1));
      setAnchorDate(prevDay);
      setMiniAnchor(prevDay);
    } else if (view === 'minggu' || view === 'weekend') {
      const prevWeek = toIso(addDays(d, -7));
      setAnchorDate(prevWeek);
      setMiniAnchor(prevWeek);
    } else {
      const prevMonth = toIso(addMonths(d, -1));
      setAnchorDate(prevMonth);
      setMiniAnchor(prevMonth);
    }
  }, [anchorDate, view]);

  const next = React.useCallback(() => {
    const d = toDate(anchorDate);
    if (view === 'hari') {
      const nextDay = toIso(addDays(d, 1));
      setAnchorDate(nextDay);
      setMiniAnchor(nextDay);
    } else if (view === 'minggu' || view === 'weekend') {
      const nextWeek = toIso(addDays(d, 7));
      setAnchorDate(nextWeek);
      setMiniAnchor(nextWeek);
    } else {
      const nextMonth = toIso(addMonths(d, 1));
      setAnchorDate(nextMonth);
      setMiniAnchor(nextMonth);
    }
  }, [anchorDate, view]);

  const prevMiniMonth = React.useCallback(() => {
    setMiniAnchor((prev) => toIso(addMonths(toDate(prev), -1)));
  }, []);

  const nextMiniMonth = React.useCallback(() => {
    setMiniAnchor((prev) => toIso(addMonths(toDate(prev), 1)));
  }, []);

  const toggleStatus = React.useCallback((s: StatusKegiatan) => {
    setFilters((prev) => {
      const exists = prev.status.includes(s);
      const nextStatus = exists
        ? prev.status.filter((x) => x !== s)
        : [...prev.status, s];
      return { ...prev, status: nextStatus };
    });
  }, []);

  const setFilterField = React.useCallback(
    (field: keyof Omit<KalenderStateFilters, 'status'>, value: string[]) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const resetFilters = React.useCallback(() => {
    setFilters({
      jenis: [],
      subjek: [],
      siswa: [],
      kelas: [],
      ruangan: [],
      status: [...STATUS_DEFAULT],
    });
  }, []);

  // Keyboard navigation for calendar (T=today, D=day, W=week, M=month) per DESIGN.md §7
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const k = e.key.toUpperCase();
      if (k === 'T') {
        e.preventDefault();
        goToday();
      } else if (k === 'D') {
        e.preventDefault();
        setView('hari');
      } else if (k === 'W') {
        e.preventDefault();
        setView('minggu');
      } else if (k === 'E') {
        e.preventDefault();
        setView('weekend');
      } else if (k === 'M') {
        e.preventDefault();
        setView('bulan');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToday]);

  // Derived date lists & labels
  const anchorD = toDate(anchorDate);

  const rangeLabel = React.useMemo(() => {
    if (view === 'hari') {
      return formatTanggalHari(anchorD);
    }
    if (view === 'minggu') {
      return formatRentangMinggu(getMonday(anchorD));
    }
    if (view === 'weekend') {
      return formatRentangWeekend(getMonday(anchorD));
    }
    return formatBulanTahun(anchorD);
  }, [anchorD, view]);

  // Visible ISO dates for the current view
  const tanggalTampil = React.useMemo(() => {
    if (view === 'hari') {
      return [anchorDate];
    }
    if (view === 'minggu') {
      const mon = getMonday(anchorD);
      const res: string[] = [];
      for (let i = 0; i < 7; i++) {
        res.push(toIso(addDays(mon, i)));
      }
      return res;
    }
    if (view === 'weekend') {
      const mon = getMonday(anchorD);
      return [toIso(addDays(mon, 5)), toIso(addDays(mon, 6))];
    }
    // Bulan view: generate weeks starting from Monday before the 1st of month
    const firstOfMonth = new Date(anchorD.getFullYear(), anchorD.getMonth(), 1);
    const startMon = getMonday(firstOfMonth);
    const lastOfMonth = new Date(anchorD.getFullYear(), anchorD.getMonth() + 1, 0);
    const totalDays = Math.ceil(((lastOfMonth.getTime() - startMon.getTime()) / 86400000 + 1) / 7) * 7;
    const res: string[] = [];
    for (let i = 0; i < totalDays; i++) {
      res.push(toIso(addDays(startMon, i)));
    }
    return res;
  }, [anchorDate, anchorD, view]);

  return {
    view,
    setView,
    anchorDate,
    setAnchorDate,
    miniAnchor,
    setMiniAnchor,
    filters,
    setFilterField,
    toggleStatus,
    resetFilters,
    goToday,
    prev,
    next,
    prevMiniMonth,
    nextMiniMonth,
    rangeLabel,
    tanggalTampil,
  };
}
