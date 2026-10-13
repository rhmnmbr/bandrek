import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatTanggalSlash, toDate, toIso, NAMA_BULAN } from '@/lib/dateUtils';
import type { StatusKegiatan } from '@/data/types/kegiatan';
import type { JenisKegiatan, Subjek, Kelas, Siswa, MataPelajaran } from '@/data/types/master';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/select';
import {
  Calendar16Regular,
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
  jenis: string[];
  onChangeJenis: (val: string[]) => void;
  jenisList: JenisKegiatan[];
  status: StatusKegiatan[];
  onChangeStatus: (val: StatusKegiatan[]) => void;
  subjek: string[];
  onChangeSubjek: (val: string[]) => void;
  subjekList: Subjek[];
  kelas: string[];
  onChangeKelas: (val: string[]) => void;
  kelasList: Kelas[];
  siswa: string[];
  onChangeSiswa: (val: string[]) => void;
  siswaList: Siswa[];
  mapel: string[];
  onChangeMapel: (val: string[]) => void;
  mapelList: MataPelajaran[];
  cari: string;
  onChangeCari: (val: string) => void;
  simulatedToday?: string;
  onNewKegiatan?: () => void;
}

const STATUS_OPTIONS: MultiSelectOption[] = [
  { value: 'terjadwal', label: 'Terjadwal' },
  { value: 'belum_direalisasi', label: 'Belum direalisasi' },
  { value: 'terealisasi', label: 'Terealisasi' },
  { value: 'dijadwal_ulang', label: 'Dijadwal ulang' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
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
  siswa,
  onChangeSiswa,
  siswaList,
  mapel,
  onChangeMapel,
  mapelList,
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

  // Options for MultiSelect
  const jenisOptions: MultiSelectOption[] = React.useMemo(
    () => jenisList.map((j) => ({ value: j.id, label: j.nama })),
    [jenisList]
  );

  const subjekOptions: MultiSelectOption[] = React.useMemo(
    () => subjekList.map((s) => ({ value: s.id, label: s.nama })),
    [subjekList]
  );

  const kelasOptions: MultiSelectOption[] = React.useMemo(
    () => kelasList.map((k) => ({ value: k.id, label: k.nama })),
    [kelasList]
  );

  const siswaOptions: MultiSelectOption[] = React.useMemo(
    () => siswaList.map((s) => ({ value: s.id, label: s.nama })),
    [siswaList]
  );

  const mapelOptions: MultiSelectOption[] = React.useMemo(
    () => mapelList.map((m) => ({ value: m.id, label: m.nama })),
    [mapelList]
  );

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
      <div className="flex-none">
        <MultiSelect
          className="w-auto max-w-36 gap-2"
          value={jenis}
          onValueChange={onChangeJenis}
          options={jenisOptions}
          placeholder="Jenis"
          density="compact"
        />
      </div>

      {/* 4. Filter: Status */}
      <div className="flex-none">
        <MultiSelect
          className="w-auto max-w-36 gap-2"
          value={status}
          onValueChange={(val) => onChangeStatus(val as StatusKegiatan[])}
          options={STATUS_OPTIONS}
          placeholder="Status"
          density="compact"
        />
      </div>

      {/* 5. Filter: Subjek */}
      <div className="flex-none">
        <MultiSelect
          searchable
          searchPlaceholder="Cari subjek..."
          className="w-auto max-w-37.5 gap-2"
          value={subjek}
          onValueChange={onChangeSubjek}
          options={subjekOptions}
          placeholder="Subjek"
          density="compact"
        />
      </div>

      {/* 6. Filter: Kelas */}
      <div className="flex-none">
        <MultiSelect
          searchable
          searchPlaceholder="Cari kelas..."
          className="w-auto max-w-39.5 gap-2"
          value={kelas}
          onValueChange={onChangeKelas}
          options={kelasOptions}
          placeholder="Kelas"
          density="compact"
        />
      </div>

      {/* 7. Filter: Siswa */}
      <div className="flex-none">
        <MultiSelect
          searchable
          searchPlaceholder="Cari siswa..."
          className="w-auto max-w-39.5 gap-2"
          value={siswa}
          onValueChange={onChangeSiswa}
          options={siswaOptions}
          placeholder="Siswa"
          density="compact"
        />
      </div>

      {/* 8. Filter: Mata Pelajaran */}
      <div className="flex-none">
        <MultiSelect
          searchable
          searchPlaceholder="Cari mapel..."
          className="w-auto max-w-39.5 gap-2"
          value={mapel}
          onValueChange={onChangeMapel}
          options={mapelOptions}
          placeholder="Mapel"
          density="compact"
        />
      </div>

      {/* 9. Search Input */}
      <input
        type="text"
        value={cari}
        onChange={(e) => onChangeCari(e.target.value)}
        placeholder="Cari nama kegiatan"
        className="flex-none w-39.5 h-6.5 border border-(--color-border-strong) rounded bg-white px-2 text-[12px] text-(--color-text) placeholder:text-(--color-text-muted) hover:border-(--color-text-muted) focus:border-(--color-brand) focus:outline-none transition-colors"
      />

      {/* Right Actions Group (selalu rata kanan, terkunci agar tidak pernah melompat ke kiri) */}
      <div className="ml-auto flex items-center gap-1.75 flex-none pl-2">
        {/* Tombol Tambah Kegiatan Baru */}
        {onNewKegiatan && (
          <button
            type="button"
            onClick={onNewKegiatan}
            className="flex-none h-6.5 px-3 rounded border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Add16Regular className="w-3.5 h-3.5 shrink-0" />
            <span>Kegiatan baru</span>
          </button>
        )}
      </div>
    </div>
  );
};
