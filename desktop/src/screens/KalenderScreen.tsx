import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/toast';
import {
  useKegiatanKalender,
  useJenisKegiatanList,
  useSubjekList,
  useKelasList,
  useRuanganList,
  useTempatList,
  useSiswaList,
} from '@/data/hooks';
import { useKalenderState } from '@/components/kalender/useKalenderState';
import { KalenderSidebar } from '@/components/kalender/KalenderSidebar';
import { KalenderToolbar } from '@/components/kalender/KalenderToolbar';
import { KalenderGrid, type DayColumnData } from '@/components/kalender/KalenderGrid';
import { KalenderMonthView } from '@/components/kalender/KalenderMonthView';
import { KalenderSkeleton } from '@/components/skeleton';
import { KegiatanPopover } from '@/components/kalender/KegiatanPopover';
import {
  FormKegiatanPanel,
  type FormKegiatanInitialData,
} from '@/components/kegiatan/FormKegiatanPanel';
import { BatalkanKegiatanModal } from '@/components/kegiatan/BatalkanKegiatanModal';
import { JadwalUlangModal } from '@/components/kegiatan/JadwalUlangModal';
import { susunLayoutKegiatan } from '@/components/kalender/kalenderLayout';
import {
  toDate,
  toIso,
  addDays,
  getMonday,
  menit,
  NAMA_HARI_PENDEK,
  JAM_AWAL,
  JAM_AKHIR,
  SLOT_PX,
} from '@/lib/dateUtils';
import { BANDREK_EVENTS } from '@/lib/keyboardShortcuts';
import type { Kegiatan } from '@/data/types';

export const KalenderScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  // Gunakan tanggal dan jam lokal real-time saat ini
  const todayIso = React.useMemo(() => toIso(new Date()), []);
  const [nowTime, setNowTime] = React.useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  React.useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setNowTime(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000); // Perbarui posisi garis merah setiap 10 detik
    return () => clearInterval(interval);
  }, []);

  // Master Data Queries
  const { data: jenisList = [] } = useJenisKegiatanList();
  const { data: subjekList = [] } = useSubjekList();
  const { data: kelasList = [] } = useKelasList();
  const { data: ruanganList = [] } = useRuanganList();
  const { data: tempatList = [] } = useTempatList();
  const { data: siswaList = [] } = useSiswaList();

  // Active Popover State
  const [activePopover, setActivePopover] = React.useState<{
    kegiatan: Kegiatan;
    anchorElement: HTMLElement;
  } | null>(null);

  // Form Kegiatan (Side Panel) State
  const [formState, setFormState] = React.useState<{
    open: boolean;
    initialData?: FormKegiatanInitialData | null;
  }>({ open: false });

  // Dialog A6 (Batalkan) & A7 (Jadwal Ulang) State
  const [modalBatalState, setModalBatalState] = React.useState<{
    open: boolean;
    kegiatan: Kegiatan | null;
  }>({ open: false, kegiatan: null });

  const [modalUlangState, setModalUlangState] = React.useState<{
    open: boolean;
    kegiatan: Kegiatan | null;
    dariBatal?: boolean;
  }>({ open: false, kegiatan: null, dariBatal: false });

  // Calendar State & Navigation Hook
  const {
    view,
    setView,
    anchorDate,
    setAnchorDate,
    miniAnchor,
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
  } = useKalenderState(todayIso);

  // Fetch activities covering the full month grid enclosing the active anchor date.
  // This ensures switching between 'hari', 'minggu', 'weekend', and 'bulan' uses the same cache key
  // and eliminates network re-fetching and visual flicker when switching view tabs.
  const { fetchMulai, fetchSelesai } = React.useMemo(() => {
    const anchorD = toDate(anchorDate);
    const firstOfMonth = new Date(anchorD.getFullYear(), anchorD.getMonth(), 1);
    const startMon = getMonday(firstOfMonth);
    const lastOfMonth = new Date(anchorD.getFullYear(), anchorD.getMonth() + 1, 0);
    const totalDays = Math.ceil(((lastOfMonth.getTime() - startMon.getTime()) / 86400000 + 1) / 7) * 7;
    const endSun = addDays(startMon, totalDays - 1);

    const isoStart = toIso(startMon);
    const isoEnd = toIso(endSun);

    const minDate = tanggalTampil[0] && tanggalTampil[0] < isoStart ? tanggalTampil[0] : isoStart;
    const maxDate =
      tanggalTampil[tanggalTampil.length - 1] && tanggalTampil[tanggalTampil.length - 1] > isoEnd
        ? tanggalTampil[tanggalTampil.length - 1]
        : isoEnd;

    return { fetchMulai: minDate, fetchSelesai: maxDate };
  }, [anchorDate, tanggalTampil]);

  const { data: semuaKegiatan = [], isLoading: loadingKegiatan } = useKegiatanKalender({
    rentangMulai: fetchMulai,
    rentangSelesai: fetchSelesai,
    tampilkanDibatalkan: true, // Fetch all so status filters work locally in real-time
  });

  // Filter activities per current filter state
  const { filteredKegiatan, allInPeriodCount } = React.useMemo(() => {
    const inPeriod = semuaKegiatan.filter((k) => {
      const endTgl = k.tanggalSelesai || k.tanggal;
      return tanggalTampil.some((tgl) => tgl >= k.tanggal && tgl <= endTgl);
    });

    let activeCount = 0;
    if (filters.jenis.length > 0) activeCount++;
    if (filters.subjek.length > 0) activeCount++;
    if (filters.siswa.length > 0) activeCount++;
    if (filters.kelas.length > 0) activeCount++;
    if (filters.ruangan.length > 0) activeCount++;
    if (filters.status.length < 5) activeCount++;

    const filtered = inPeriod.filter((k) => {
      // 1. Jenis filter
      if (filters.jenis.length > 0 && (!k.jenis || !filters.jenis.includes(k.jenis))) return false;
      // 2. Subjek filter
      if (filters.subjek.length > 0 && !k.subjek.some((s) => filters.subjek.includes(s.id))) return false;
      // 3. Siswa filter
      if (filters.siswa.length > 0 && !k.siswa.some((sid) => filters.siswa.includes(sid))) return false;
      // 4. Kelas filter
      if (filters.kelas.length > 0 && (!k.kelas || !filters.kelas.includes(k.kelas))) return false;
      // 5. Ruangan filter
      if (filters.ruangan.length > 0 && (!k.ruangan || !filters.ruangan.includes(k.ruangan))) return false;
      // 6. Status filter
      if (!filters.status.includes(k.status)) return false;
      return true;
    });

    return {
      filteredKegiatan: filtered,
      allInPeriodCount: inPeriod.length,
      activeFilterCount: activeCount,
    };
  }, [semuaKegiatan, tanggalTampil, filters]);

  // Now line calculation (red horizontal time line on today's column)
  const nowLine = React.useMemo(() => {
    const isTodayVisible = tanggalTampil.includes(todayIso);
    const nowM = menit(nowTime);
    const minStart = JAM_AWAL * 60;
    const minEnd = JAM_AKHIR * 60;

    if (!isTodayVisible || nowM < minStart || nowM > minEnd) {
      return { show: false, label: nowTime, top: 0, badgeTop: 0 };
    }

    const top = Math.round(((nowM - minStart) / 60) * SLOT_PX);
    return {
      show: true,
      label: nowTime,
      top,
      badgeTop: top - 8,
    };
  }, [tanggalTampil, todayIso, nowTime]);

  const subjekMap = React.useMemo(() => {
    return new Map(subjekList.map((s) => [s.id, s.nama]));
  }, [subjekList]);

  // Day columns data for Week & Day views
  const dayColumns: DayColumnData[] = React.useMemo(() => {
    return tanggalTampil.map((iso) => {
      const d = toDate(iso);
      const dow = (d.getDay() + 6) % 7;
      const isWeekend = dow >= 5;
      const isToday = iso === todayIso;
      const nHari = tanggalTampil.length;

      const events = susunLayoutKegiatan(
        filteredKegiatan,
        iso,
        nHari,
        JAM_AWAL,
        JAM_AKHIR,
        1251,
        subjekMap
      );

      return {
        iso,
        dow: NAMA_HARI_PENDEK[dow],
        num: d.getDate(),
        isToday,
        isWeekend,
        events,
      };
    });
  }, [tanggalTampil, filteredKegiatan, todayIso, subjekMap]);

  // Handle Event Selection (Click on event card -> opens Popover)
  const handleSelectEvent = React.useCallback(
    (kegiatan: Kegiatan, e: React.MouseEvent) => {
      e.stopPropagation();
      setActivePopover({
        kegiatan,
        anchorElement: e.currentTarget as HTMLElement,
      });
    },
    []
  );

  // Handle navigate to rescheduled kegiatan (two-way link)
  const handleNavigateKegiatan = React.useCallback(
    (targetId: string) => {
      const target = semuaKegiatan.find((k) => k.id === targetId);
      if (!target) return;
      setAnchorDate(target.tanggal);
      if (view === 'bulan') {
        setView('minggu');
      }
      setTimeout(() => {
        const el = document.querySelector(`[data-kegiatan-id="${targetId}"]`) as HTMLElement;
        if (el) {
          setActivePopover({ kegiatan: target, anchorElement: el });
        } else {
          setActivePopover(null);
        }
      }, 60);
    },
    [semuaKegiatan, setAnchorDate, setView, view]
  );

  // Popover & Form Action Handlers
  const handleOpenDetail = React.useCallback(
    (kegiatanOrId: Kegiatan | string) => {
      setActivePopover(null);
      const id = typeof kegiatanOrId === 'string' ? kegiatanOrId : kegiatanOrId.id;
      navigate(`/kegiatan/${id}`, {
        state: { fromTitle: 'Kalender', fromPath: '/kalender' },
      });
    },
    [navigate]
  );

  // Listen to global BANDREK_EVENTS.NEW_KEGIATAN (Ctrl+N or TopBar button)
  React.useEffect(() => {
    const handleGlobalNew = (e?: Event) => {
      setActivePopover(null);
      const customDetail = (e as CustomEvent)?.detail;
      setFormState({
        open: true,
        initialData: customDetail || {
          mode: 'create',
          tanggal: anchorDate || todayIso,
          mulai: '08:00',
          selesai: '09:30',
          ruangan: filters.ruangan.length === 1 ? filters.ruangan[0] : '',
        },
      });
    };
    window.addEventListener(BANDREK_EVENTS.NEW_KEGIATAN, handleGlobalNew);
    return () => window.removeEventListener(BANDREK_EVENTS.NEW_KEGIATAN, handleGlobalNew);
  }, [anchorDate, todayIso, filters.ruangan]);

  // Support direct opening via ?form=new
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('form') === 'new') {
      setFormState((prev) =>
        prev.open
          ? prev
          : {
              open: true,
              initialData: {
                mode: 'create',
                tanggal: todayIso,
                mulai: '08:00',
                selesai: '09:30',
              },
            }
      );
    }
  }, []);

  const handleOpenEdit = React.useCallback(
    (kegiatan: Kegiatan) => {
      setActivePopover(null);
      setFormState({
        open: true,
        initialData: {
          mode: 'edit',
          kegiatanId: kegiatan.id,
          nama: kegiatan.nama,
          jenis: kegiatan.jenis,
          tanggal: kegiatan.tanggal,
          tanggalSelesai: kegiatan.tanggalSelesai,
          mulai: kegiatan.mulai,
          selesai: kegiatan.selesai,
          sepanjangHari: Boolean(kegiatan.sepanjangHari),
          ruangan: kegiatan.ruangan || '',
          tempatCustom: kegiatan.tempatCustom || '',
          mapel: kegiatan.mapel || '',
          materi: kegiatan.materi || '',
          subjek: kegiatan.subjek,
          siswa: kegiatan.siswa,
          catatan: kegiatan.catatan || '',
          seriId: kegiatan.seriId,
          urutanSeri: kegiatan.urutanSeri,
          totalSeri: kegiatan.totalSeri,
        },
      });
    },
    []
  );

  const handleOpenRealisasi = React.useCallback(
    (kegiatan: Kegiatan) => {
      setActivePopover(null);
      navigate(`/kegiatan/${kegiatan.id}/realisasi`, {
        state: { fromTitle: 'Kalender', fromPath: '/kalender' },
      });
    },
    [navigate]
  );

  const handleOpenJadwalUlang = React.useCallback(
    (kegiatan: Kegiatan, dariBatal: boolean = false) => {
      setActivePopover(null);
      setModalUlangState({
        open: true,
        kegiatan,
        dariBatal,
      });
    },
    []
  );

  const handleOpenBatal = React.useCallback(
    (kegiatan: Kegiatan) => {
      setActivePopover(null);
      setModalBatalState({
        open: true,
        kegiatan,
      });
    },
    []
  );

  // Handle Empty Slot Selection (Click or drag on calendar grid to create kegiatan)
  const handleSelectSlot = React.useCallback(
    (iso: string, startHour: number, endHour?: number) => {
      setActivePopover(null);
      const effectiveEndHour = endHour ?? (startHour + 1);
      const jamMulai = `${String(startHour).padStart(2, '0')}:00`;
      const jamSelesai = `${String(effectiveEndHour).padStart(2, '0')}:00`;
      setFormState({
        open: true,
        initialData: {
          mode: 'create',
          tanggal: iso,
          mulai: jamMulai,
          selesai: jamSelesai,
          ruangan: filters.ruangan.length === 1 ? filters.ruangan[0] : '',
        },
      });
    },
    [filters.ruangan]
  );

  // Handle Tambah Kegiatan di Jam Ini (prefills date & time range from existing session)
  const handleTambahDiJamIni = React.useCallback(
    (kegiatan: Kegiatan) => {
      setActivePopover(null);
      setFormState({
        open: true,
        initialData: {
          mode: 'create',
          tanggal: kegiatan.tanggal,
          mulai: kegiatan.mulai,
          selesai: kegiatan.selesai,
          ruangan: '', // Leave room unselected so operator can pick an available room
        },
      });
    },
    []
  );

  // Handle Highlight Conflict on calendar
  const handleHighlightConflict = React.useCallback(
    (conflictId: string, conflictDate: string) => {
      setAnchorDate(conflictDate);
      if (view === 'bulan') setView('minggu');
      showToast({
        message: `Menyorot kegiatan bentrok di tanggal ${conflictDate}`,
        type: 'warning',
      });
      setTimeout(() => {
        const el = document.querySelector(`[data-kegiatan-id="${conflictId}"]`) as HTMLElement;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    },
    [setAnchorDate, setView, showToast, view]
  );

  // Handle Form Success
  const handleFormSuccess = React.useCallback(
    (saved: Kegiatan, buatLagi: boolean) => {
      if (!tanggalTampil.includes(saved.tanggal)) {
        setAnchorDate(saved.tanggal);
      }
      if (!buatLagi) {
        setFormState({ open: false });
      }
    },
    [setAnchorDate, tanggalTampil]
  );

  // Handle "+N lainnya" click: jumps to Day View for that date
  const handleMoreClick = React.useCallback(
    (iso: string) => {
      setAnchorDate(iso);
      setView('hari');
    },
    [setAnchorDate, setView]
  );

  const countLabel = `Menampilkan ${filteredKegiatan.length} dari ${allInPeriodCount} kegiatan`;
  const currentMonth = toDate(anchorDate).getMonth();

  // Skeleton is only shown on initial mount until first query resolution.
  // Once loaded, switching view tabs or navigating dates will never replace the screen with a skeleton.
  const hasInitiallyLoadedRef = React.useRef(false);
  if (!loadingKegiatan) {
    hasInitiallyLoadedRef.current = true;
  }
  const isInitialLoading = !hasInitiallyLoadedRef.current && loadingKegiatan && semuaKegiatan.length === 0;

  if (isInitialLoading) {
    return <KalenderSkeleton />;
  }

  return (
    <div className="flex h-full w-full min-h-0 bg-white select-none">
      {/* 1. Left Sidebar: Mini Calendar & Multi-Filters */}
      <KalenderSidebar
        anchorDate={anchorDate}
        miniAnchor={miniAnchor}
        view={view}
        todayIso={todayIso}
        filters={filters}
        jenisList={jenisList}
        subjekList={subjekList}
        siswaList={siswaList}
        kelasList={kelasList}
        ruanganList={ruanganList}
        tempatList={tempatList}
        onSelectDate={(iso) => {
          setAnchorDate(iso);
          setActivePopover(null);
        }}
        onPrevMiniMonth={() => {
          prevMiniMonth();
          setActivePopover(null);
        }}
        onNextMiniMonth={() => {
          nextMiniMonth();
          setActivePopover(null);
        }}
        onFilterChange={(f, v) => {
          setFilterField(f, v);
          setActivePopover(null);
        }}
        onToggleStatus={(s) => {
          toggleStatus(s);
          setActivePopover(null);
        }}
        onResetFilters={() => {
          resetFilters();
          setActivePopover(null);
        }}
      />

      {/* 2. Main Calendar Content Area */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden bg-white">
        {/* Top Calendar Toolbar */}
        <KalenderToolbar
          view={view}
          rangeLabel={rangeLabel}
          countLabel={countLabel}
          onViewChange={(v) => {
            setView(v);
            setActivePopover(null);
          }}
          onGoToday={() => {
            goToday();
            setActivePopover(null);
          }}
          onPrev={() => {
            prev();
            setActivePopover(null);
          }}
          onNext={() => {
            next();
            setActivePopover(null);
          }}
        />

        {/* Content Views */}
        {view === 'bulan' ? (
          <KalenderMonthView
            visibleDates={tanggalTampil}
            currentMonth={currentMonth}
            todayIso={todayIso}
            kegiatanList={filteredKegiatan}
            subjekList={subjekList}
            onSelectEvent={handleSelectEvent}
            onSelectDay={(iso) => {
              setAnchorDate(iso);
              setView('hari');
              setActivePopover(null);
            }}
          />
        ) : (
          <KalenderGrid
            days={dayColumns}
            subjekList={subjekList}
            nowLine={nowLine}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onClosePopover={() => setActivePopover(null)}
            onMoreClick={(iso) => {
              handleMoreClick(iso);
              setActivePopover(null);
            }}
          />
        )}
      </div>

      {/* 3. Floating Kegiatan Popover */}
      {activePopover && (
        <KegiatanPopover
          key={activePopover.kegiatan.id}
          kegiatan={activePopover.kegiatan}
          anchorElement={activePopover.anchorElement}
          isOpen={true}
          onClose={() => setActivePopover(null)}
          subjekList={subjekList}
          siswaList={siswaList}
          kelasList={kelasList}
          kegiatanList={semuaKegiatan}
          onOpenDetail={handleOpenDetail}
          onOpenEdit={handleOpenEdit}
          onOpenRealisasi={handleOpenRealisasi}
          onOpenJadwalUlang={handleOpenJadwalUlang}
          onOpenBatal={handleOpenBatal}
          onNavigateKegiatan={handleNavigateKegiatan}
          onTambahDiJamIni={handleTambahDiJamIni}
        />
      )}

      {/* 4. A4 Form Kegiatan Side Panel */}
      {formState.open && (
        <FormKegiatanPanel
          key={`${formState.initialData?.mode || 'create'}-${formState.initialData?.kegiatanId || 'new'}-${formState.initialData?.tanggal || ''}-${formState.initialData?.mulai || ''}`}
          open={formState.open}
          initialData={formState.initialData}
          onClose={() => setFormState({ open: false })}
          onSuccess={handleFormSuccess}
          onHighlightConflict={handleHighlightConflict}
          onOpenDetail={handleOpenDetail}
        />
      )}

      {/* 5. A6 Batalkan Kegiatan Modal */}
      {modalBatalState.open && modalBatalState.kegiatan && (
        <BatalkanKegiatanModal
          open={modalBatalState.open}
          kegiatan={modalBatalState.kegiatan}
          onClose={() => setModalBatalState({ open: false, kegiatan: null })}
          onOpenJadwalUlang={(kegiatanId, dariBatal) => {
            const keg = semuaKegiatan.find((k) => k.id === kegiatanId);
            if (keg) {
              handleOpenJadwalUlang(keg, dariBatal);
            }
          }}
        />
      )}

      {/* 6. A7 Jadwal Ulang Kegiatan Modal */}
      {modalUlangState.open && modalUlangState.kegiatan && (
        <JadwalUlangModal
          open={modalUlangState.open}
          kegiatan={modalUlangState.kegiatan}
          dariBatal={modalUlangState.dariBatal}
          onClose={() => setModalUlangState({ open: false, kegiatan: null, dariBatal: false })}
          onNavigateBaru={(baruId) => {
            handleNavigateKegiatan(baruId);
          }}
        />
      )}
    </div>
  );
};

