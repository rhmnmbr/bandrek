import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatTanggalSlash, toDate, toIso, NAMA_BULAN } from '@/lib/dateUtils';
import type { StatusKegiatan } from '@/data/types/kegiatan';
import type { JenisKegiatan, Subjek, Kelas } from '@/data/types/master';
import {
  Calendar16Regular,
  ChevronDown12Regular,
  ChevronLeft12Regular,
  ChevronRight12Regular,
  Add16Regular,
} from '@fluentui/react-icons';

export interface DaftarToolbarProps {
  dari: string;
  sampai: string;
  onChangeDari: (val: string) => void;
  onChangeSampai: (val: string) => void;
  rentangMati: boolean;
  jenis: string;
  onChangeJenis: (val: string) => void;
  jenisList: JenisKegiatan[];
  status: StatusKegiatan | '';
  onChangeStatus: (val: StatusKegiatan | '') => void;
  subjek: string;
  onChangeSubjek: (val: string) => void;
  subjekList: Subjek[];
  kelas: string;
  onChangeKelas: (val: string) => void;
  kelasList: Kelas[];
  cari: string;
  onChangeCari: (val: string) => void;
  simulatedToday?: string;
  onNewKegiatan?: () => void;
}

const STATUS_OPTIONS: { id: StatusKegiatan | ''; label: string }[] = [
  { id: '', label: 'Status: semua' },
  { id: 'terjadwal', label: 'Status: Terjadwal' },
  { id: 'belum_direalisasi', label: 'Status: Belum direalisasi' },
  { id: 'terealisasi', label: 'Status: Terealisasi' },
  { id: 'dijadwal_ulang', label: 'Status: Dijadwal ulang' },
  { id: 'dibatalkan', label: 'Status: Dibatalkan' },
];

export const DaftarToolbar: React.FC<DaftarToolbarProps> = ({
  dari,
  sampai,
  onChangeDari,
  onChangeSampai,
  rentangMati,
  jenis,
  onChangeJenis,
  jenisList,
  status,
  onChangeStatus,
  subjek,
  onChangeSubjek,
  subjekList,
  kelas,
  onChangeKelas,
  kelasList,
  cari,
  onChangeCari,
  simulatedToday = '2026-09-16',
  onNewKegiatan,
}) => {
  // Dropdown open states: 'dari' | 'sampai' | 'jenis' | 'status' | 'subjek' | 'kelas' | null
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const [calAnchor, setCalAnchor] = React.useState<string>(simulatedToday);

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  // Calendar Helpers for Mini Picker
  const calDate = React.useMemo(() => toDate(calAnchor), [calAnchor]);
  const calYear = calDate.getFullYear();
  const calMonth = calDate.getMonth();
  const calMonthLabel = `${NAMA_BULAN[calMonth]} ${calYear}`;

  const calWeeks = React.useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);

    // Bandrek starts weeks on Monday (dow 0 = Mon ... 6 = Sun)
    // Prototype dow: Min, Sen, Sel, Rab, Kam, Jum, Sab (starts Sun, or prototype lines 1049: Min, Sen, Sel, Rab, Kam, Jum, Sab)
    // Let's match prototype calDow: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
    const startDow = firstDay.getDay(); // 0 = Sun
    const totalDays = lastDay.getDate();

    const weeks: { dateIso: string; dayNum: number; inMonth: boolean }[][] = [];
    let currentWeek: { dateIso: string; dayNum: number; inMonth: boolean }[] = [];

    // Prepend previous month days
    const prevMonthLastDay = new Date(calYear, calMonth, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const iso = `${calMonth === 0 ? calYear - 1 : calYear}-${String(calMonth === 0 ? 12 : calMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      currentWeek.push({ dateIso: iso, dayNum: d, inMonth: false });
    }

    // Days in current month
    for (let d = 1; d <= totalDays; d++) {
      const iso = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      currentWeek.push({ dateIso: iso, dayNum: d, inMonth: true });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Postpend next month days
    if (currentWeek.length > 0) {
      let d = 1;
      while (currentWeek.length < 7) {
        const nextMonthYear = calMonth === 11 ? calYear + 1 : calYear;
        const nextMonth = calMonth === 11 ? 1 : calMonth + 2;
        const iso = `${nextMonthYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        currentWeek.push({ dateIso: iso, dayNum: d, inMonth: false });
        d++;
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [calYear, calMonth]);

  const handlePrevCalMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    const d = new Date(calYear, calMonth - 1, 1);
    setCalAnchor(toIso(d));
  };

  const handleNextCalMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    const d = new Date(calYear, calMonth + 1, 1);
    setCalAnchor(toIso(d));
  };

  // Label computations
  const jenisLabel = React.useMemo(() => {
    if (!jenis) return 'Jenis: semua';
    const j = jenisList.find((item) => item.id === jenis);
    return j ? j.nama : 'Jenis: semua';
  }, [jenis, jenisList]);

  const statusLabel = React.useMemo(() => {
    const s = STATUS_OPTIONS.find((item) => item.id === status);
    return s ? s.label : 'Status: semua';
  }, [status]);

  const subjekLabel = React.useMemo(() => {
    if (!subjek) return 'Subjek: semua';
    const s = subjekList.find((item) => item.id === subjek);
    return s ? `Subjek: ${s.nama}` : 'Subjek: semua';
  }, [subjek, subjekList]);

  const kelasLabel = React.useMemo(() => {
    if (!kelas) return 'Kelas: semua';
    const k = kelasList.find((item) => item.id === kelas);
    return k ? `Kelas: ${k.nama}` : 'Kelas: semua';
  }, [kelas, kelasList]);

  return (
    <div
      ref={containerRef}
      className="relative z-20 flex-none px-3.5 pt-2.75 pb-2.25 flex gap-1.75 items-center flex-wrap border-b border-(--color-border) bg-(--color-canvas) text-[12px] select-none"
    >
      {/* 1. Date Range: Dari */}
      <div className="relative flex-none">
        <button
          type="button"
          onClick={() => {
            if (rentangMati) return;
            setCalAnchor(dari || simulatedToday);
            toggleDropdown('dari');
          }}
          disabled={rentangMati}
          title={
            rentangMati
              ? 'Rentang tanggal diabaikan selama filter cepat aktif'
              : 'Rentang tanggal yang dimuat'
          }
          className={cn(
            'h-6.5 border rounded px-2 font-mono text-[11.5px] flex items-center gap-2 transition-colors cursor-pointer',
            rentangMati
              ? 'border-(--color-border) bg-(--color-surface-alt) text-(--color-text-muted) cursor-not-allowed'
              : dari
              ? 'border-(--color-border-strong) bg-white text-(--color-text) hover:border-(--color-text-muted)'
              : 'border-(--color-border-strong) bg-white text-(--color-text-muted)'
          )}
        >
          <span>{formatTanggalSlash(dari) || 'Dari tanggal'}</span>
          <Calendar16Regular className="w-3.25 h-3.25 flex-none text-(--color-icon-faint)" />
        </button>

        {openDropdown === 'dari' && !rentangMati && (
          <div className="absolute left-0 top-7.25 z-30 w-66.5 bg-white border border-(--color-border-strong) rounded-lg shadow-(--shadow-overlay) p-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex-1 text-[13.5px] font-semibold text-(--color-text)">
                {calMonthLabel}
              </div>
              <button
                type="button"
                onClick={handlePrevCalMonth}
                title="Bulan sebelumnya"
                className="w-5.5 h-5.5 rounded flex items-center justify-center text-(--color-text-secondary) hover:bg-(--color-surface-alt) cursor-pointer"
              >
                <ChevronLeft12Regular className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextCalMonth}
                title="Bulan berikutnya"
                className="w-5.5 h-5.5 rounded flex items-center justify-center text-(--color-text-secondary) hover:bg-(--color-surface-alt) cursor-pointer"
              >
                <ChevronRight12Regular className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 text-[10px] font-semibold text-(--color-text-muted) text-center mb-1">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {calWeeks.map((week, widx) => (
              <div key={widx} className="grid grid-cols-7 gap-0.5 mb-0.5">
                {week.map((day) => {
                  const isSelected = day.dateIso === dari;
                  const isTodayDate = day.dateIso === simulatedToday;
                  return (
                    <button
                      key={day.dateIso}
                      type="button"
                      onClick={() => {
                        onChangeDari(day.dateIso);
                        setOpenDropdown(null);
                      }}
                      className={cn(
                        'h-6.5 rounded-full text-[12px] flex items-center justify-center cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-(--color-brand) text-white font-semibold'
                          : isTodayDate
                          ? 'text-(--color-brand-ink) font-semibold ring-1 ring-(--color-brand) hover:bg-(--color-brand-subtle)'
                          : day.inMonth
                          ? 'text-(--color-text) hover:bg-(--color-surface-alt)'
                          : 'text-(--color-text-muted) opacity-50 hover:bg-(--color-surface-alt)'
                      )}
                    >
                      {day.dayNum}
                    </button>
                  );
                })}
              </div>
            ))}

            <div className="flex justify-between mt-1.5 pt-1.5 border-t border-(--color-border)">
              <button
                type="button"
                onClick={() => {
                  onChangeDari('');
                  setOpenDropdown(null);
                }}
                className="text-(--color-brand) text-[12.5px] cursor-pointer hover:underline"
              >
                Bersihkan
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeDari(simulatedToday);
                  setOpenDropdown(null);
                }}
                className="text-(--color-brand) text-[12.5px] cursor-pointer hover:underline"
              >
                Hari ini
              </button>
            </div>
          </div>
        )}
      </div>

      <span className="flex-none text-(--color-text-muted)">→</span>

      {/* 2. Date Range: Sampai */}
      <div className="relative flex-none">
        <button
          type="button"
          onClick={() => {
            if (rentangMati) return;
            setCalAnchor(sampai || simulatedToday);
            toggleDropdown('sampai');
          }}
          disabled={rentangMati}
          title={
            rentangMati
              ? 'Rentang tanggal diabaikan selama filter cepat aktif'
              : 'Rentang tanggal yang dimuat'
          }
          className={cn(
            'h-6.5 border rounded px-2 font-mono text-[11.5px] flex items-center gap-2 transition-colors cursor-pointer',
            rentangMati
              ? 'border-(--color-border) bg-(--color-surface-alt) text-(--color-text-muted) cursor-not-allowed'
              : sampai
              ? 'border-(--color-border-strong) bg-white text-(--color-text) hover:border-(--color-text-muted)'
              : 'border-(--color-border-strong) bg-white text-(--color-text-muted)'
          )}
        >
          <span>{formatTanggalSlash(sampai) || 'Sampai tanggal'}</span>
          <Calendar16Regular className="w-3.25 h-3.25 flex-none text-(--color-icon-faint)" />
        </button>

        {openDropdown === 'sampai' && !rentangMati && (
          <div className="absolute left-0 top-7.25 z-30 w-66.5 bg-white border border-(--color-border-strong) rounded-lg shadow-(--shadow-overlay) p-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex-1 text-[13.5px] font-semibold text-(--color-text)">
                {calMonthLabel}
              </div>
              <button
                type="button"
                onClick={handlePrevCalMonth}
                title="Bulan sebelumnya"
                className="w-5.5 h-5.5 rounded flex items-center justify-center text-(--color-text-secondary) hover:bg-(--color-surface-alt) cursor-pointer"
              >
                <ChevronLeft12Regular className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextCalMonth}
                title="Bulan berikutnya"
                className="w-5.5 h-5.5 rounded flex items-center justify-center text-(--color-text-secondary) hover:bg-(--color-surface-alt) cursor-pointer"
              >
                <ChevronRight12Regular className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 text-[10px] font-semibold text-(--color-text-muted) text-center mb-1">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {calWeeks.map((week, widx) => (
              <div key={widx} className="grid grid-cols-7 gap-0.5 mb-0.5">
                {week.map((day) => {
                  const isSelected = day.dateIso === sampai;
                  const isTodayDate = day.dateIso === simulatedToday;
                  return (
                    <button
                      key={day.dateIso}
                      type="button"
                      onClick={() => {
                        onChangeSampai(day.dateIso);
                        setOpenDropdown(null);
                      }}
                      className={cn(
                        'h-6.5 rounded-full text-[12px] flex items-center justify-center cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-(--color-brand) text-white font-semibold'
                          : isTodayDate
                          ? 'text-(--color-brand-ink) font-semibold ring-1 ring-(--color-brand) hover:bg-(--color-brand-subtle)'
                          : day.inMonth
                          ? 'text-(--color-text) hover:bg-(--color-surface-alt)'
                          : 'text-(--color-text-muted) opacity-50 hover:bg-(--color-surface-alt)'
                      )}
                    >
                      {day.dayNum}
                    </button>
                  );
                })}
              </div>
            ))}

            <div className="flex justify-between mt-1.5 pt-1.5 border-t border-(--color-border)">
              <button
                type="button"
                onClick={() => {
                  onChangeSampai('');
                  setOpenDropdown(null);
                }}
                className="text-(--color-brand) text-[12.5px] cursor-pointer hover:underline"
              >
                Bersihkan
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeSampai(simulatedToday);
                  setOpenDropdown(null);
                }}
                className="text-(--color-brand) text-[12.5px] cursor-pointer hover:underline"
              >
                Hari ini
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Filter: Jenis */}
      <div className="relative flex-none">
        <button
          type="button"
          onClick={() => toggleDropdown('jenis')}
          className={cn(
            'h-6.5 pl-2.5 pr-2 border rounded text-[12px] cursor-pointer flex items-center justify-between gap-3.5 whitespace-nowrap transition-colors',
            jenis
              ? 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand-ink)'
              : 'border-(--color-border-strong) bg-white text-(--color-text-secondary) hover:border-(--color-text-muted)'
          )}
        >
          <span>{jenisLabel}</span>
          <ChevronDown12Regular className="w-3 h-3 flex-none text-(--color-icon-faint)" />
        </button>

        {openDropdown === 'jenis' && (
          <div className="absolute left-0 top-7.25 z-30 min-w-full w-max bg-white border border-(--color-border-strong) rounded-md shadow-(--shadow-overlay) p-1 flex flex-col gap-0.5 max-h-65 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChangeJenis('');
                setOpenDropdown(null);
              }}
              className={cn(
                'w-full text-left px-2.25 py-1.5 rounded text-[12.5px] cursor-pointer whitespace-nowrap transition-colors',
                !jenis
                  ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                  : 'text-(--color-text) hover:bg-(--color-surface-alt)'
              )}
            >
              Jenis: semua
            </button>
            {jenisList.map((j) => {
              const active = jenis === j.id;
              return (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => {
                    onChangeJenis(j.id);
                    setOpenDropdown(null);
                  }}
                  className={cn(
                    'w-full text-left px-2.25 py-1.5 rounded text-[12.5px] cursor-pointer whitespace-nowrap transition-colors',
                    active
                      ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                      : 'text-(--color-text) hover:bg-(--color-surface-alt)'
                  )}
                >
                  {j.nama}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Filter: Status */}
      <div className="relative flex-none">
        <button
          type="button"
          onClick={() => toggleDropdown('status')}
          className={cn(
            'h-6.5 pl-2.5 pr-2 border rounded text-[12px] cursor-pointer flex items-center justify-between gap-3.5 whitespace-nowrap transition-colors',
            status
              ? 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand-ink)'
              : 'border-(--color-border-strong) bg-white text-(--color-text-secondary) hover:border-(--color-text-muted)'
          )}
        >
          <span>{statusLabel}</span>
          <ChevronDown12Regular className="w-3 h-3 flex-none text-(--color-icon-faint)" />
        </button>

        {openDropdown === 'status' && (
          <div className="absolute left-0 top-7.25 z-30 min-w-full w-max bg-white border border-(--color-border-strong) rounded-md shadow-(--shadow-overlay) p-1 flex flex-col gap-0.5 max-h-65 overflow-y-auto">
            {STATUS_OPTIONS.map((opt) => {
              const active = status === opt.id;
              return (
                <button
                  key={opt.id || 'semua'}
                  type="button"
                  onClick={() => {
                    onChangeStatus(opt.id);
                    setOpenDropdown(null);
                  }}
                  className={cn(
                    'w-full text-left px-2.25 py-1.5 rounded text-[12.5px] cursor-pointer whitespace-nowrap transition-colors',
                    active
                      ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                      : 'text-(--color-text) hover:bg-(--color-surface-alt)'
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Filter: Subjek */}
      <div className="relative flex-none">
        <button
          type="button"
          onClick={() => toggleDropdown('subjek')}
          className={cn(
            'h-6.5 px-2 max-w-37.5 border rounded text-[12px] cursor-pointer flex items-center justify-between gap-2.5 whitespace-nowrap transition-colors',
            subjek
              ? 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand-ink)'
              : 'border-(--color-border-strong) bg-white text-(--color-text-secondary) hover:border-(--color-text-muted)'
          )}
        >
          <span className="truncate">{subjekLabel}</span>
          <ChevronDown12Regular className="w-3 h-3 flex-none text-(--color-icon-faint)" />
        </button>

        {openDropdown === 'subjek' && (
          <div className="absolute left-0 top-7.25 z-30 min-w-full w-max bg-white border border-(--color-border-strong) rounded-md shadow-(--shadow-overlay) p-1 flex flex-col gap-0.5 max-h-65 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChangeSubjek('');
                setOpenDropdown(null);
              }}
              className={cn(
                'w-full text-left px-2.25 py-1.5 rounded text-[12.5px] cursor-pointer whitespace-nowrap transition-colors',
                !subjek
                  ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                  : 'text-(--color-text) hover:bg-(--color-surface-alt)'
              )}
            >
              Subjek: semua
            </button>
            {subjekList.map((s) => {
              const active = subjek === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onChangeSubjek(s.id);
                    setOpenDropdown(null);
                  }}
                  className={cn(
                    'w-full text-left px-2.25 py-1.5 rounded text-[12.5px] cursor-pointer whitespace-nowrap transition-colors',
                    active
                      ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                      : 'text-(--color-text) hover:bg-(--color-surface-alt)'
                  )}
                >
                  Subjek: {s.nama}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Filter: Kelas */}
      <div className="relative flex-none">
        <button
          type="button"
          onClick={() => toggleDropdown('kelas')}
          className={cn(
            'h-6.5 px-2 max-w-39.5 border rounded text-[12px] cursor-pointer flex items-center justify-between gap-2.5 whitespace-nowrap transition-colors',
            kelas
              ? 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand-ink)'
              : 'border-(--color-border-strong) bg-white text-(--color-text-secondary) hover:border-(--color-text-muted)'
          )}
        >
          <span className="truncate">{kelasLabel}</span>
          <ChevronDown12Regular className="w-3 h-3 flex-none text-(--color-icon-faint)" />
        </button>

        {openDropdown === 'kelas' && (
          <div className="absolute left-0 top-7.25 z-30 min-w-full w-max bg-white border border-(--color-border-strong) rounded-md shadow-(--shadow-overlay) p-1 flex flex-col gap-0.5 max-h-65 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChangeKelas('');
                setOpenDropdown(null);
              }}
              className={cn(
                'w-full text-left px-2.25 py-1.5 rounded text-[12.5px] cursor-pointer whitespace-nowrap transition-colors',
                !kelas
                  ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                  : 'text-(--color-text) hover:bg-(--color-surface-alt)'
              )}
            >
              Kelas: semua
            </button>
            {kelasList.map((k) => {
              const active = kelas === k.id;
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => {
                    onChangeKelas(k.id);
                    setOpenDropdown(null);
                  }}
                  className={cn(
                    'w-full text-left px-2.25 py-1.5 rounded text-[12.5px] cursor-pointer whitespace-nowrap transition-colors',
                    active
                      ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                      : 'text-(--color-text) hover:bg-(--color-surface-alt)'
                  )}
                >
                  Kelas: {k.nama}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Search Input */}
      <input
        type="text"
        value={cari}
        onChange={(e) => onChangeCari(e.target.value)}
        placeholder="Cari nama kegiatan"
        className="flex-none w-39.5 h-6.5 border border-(--color-border-strong) rounded bg-white px-2 text-[12px] text-(--color-text) placeholder:text-(--color-text-muted) hover:border-(--color-text-muted) focus:border-(--color-brand) focus:outline-none transition-colors"
      />

      {/* Right Actions Group (selalu rata kanan, terkunci agar tidak pernah melompat ke kiri) */}
      <div className="ml-auto flex items-center gap-1.75 flex-none pl-2">
        {/* 8. Ekspor CSV (Disabled per spec) */}
        <button
          type="button"
          disabled
          title="Ekspor CSV menyusul di tahap berikutnya"
          className="flex-none h-6.5 px-2.75 border border-(--color-border) rounded bg-(--color-surface-alt) text-(--color-text-muted) text-[12px] cursor-not-allowed whitespace-nowrap"
        >
          Ekspor CSV
        </button>

        {/* 9. Tombol Tambah Kegiatan Baru */}
        {onNewKegiatan && (
          <button
            type="button"
            onClick={onNewKegiatan}
            title="Buat kegiatan baru (Ctrl+N)"
            className="flex-none h-6.5 px-2.75 rounded bg-(--color-brand) text-white font-medium text-[12px] flex items-center gap-1 hover:bg-(--color-brand-pressed) transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Add16Regular className="text-[13px]" />
            <span>Kegiatan baru</span>
          </button>
        )}
      </div>
    </div>
  );
};
