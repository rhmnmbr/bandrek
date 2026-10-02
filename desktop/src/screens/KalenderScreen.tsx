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
  useSimulasi,
} from '@/data/hooks';
import { useKalenderState } from '@/components/kalender/useKalenderState';
import { KalenderSidebar } from '@/components/kalender/KalenderSidebar';
import { KalenderToolbar } from '@/components/kalender/KalenderToolbar';
import { KalenderGrid, type DayColumnData } from '@/components/kalender/KalenderGrid';
import { KalenderMonthView } from '@/components/kalender/KalenderMonthView';
import { KalenderEmptyState } from '@/components/kalender/KalenderEmptyState';
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
  const { config } = useSimulasi();
  const todayIso = config.simulatedToday || '2026-09-16';
  const nowTime = config.simulatedNow || '11:39';

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

  // Fetch activities in broad range covering active view
  const rentangMulai = tanggalTampil[0] || anchorDate;
  const rentangSelesai = tanggalTampil[tanggalTampil.length - 1] || anchorDate;

  const { data: semuaKegiatan = [] } = useKegiatanKalender({
    rentangMulai,
    rentangSelesai,
    tampilkanDibatalkan: true, // Fetch all so status filters work locally in real-time
  });

  // Filter activities per current filter state
  const { filteredKegiatan, allInPeriodCount, activeFilterCount } = React.useMemo(() => {
    const setTampil = new Set(tanggalTampil);
    const inPeriod = semuaKegiatan.filter((k) => setTampil.has(k.tanggal));

    let activeCount = 0;
    if (filters.jenis.length > 0) activeCount++;
    if (filters.subjek.length > 0) activeCount++;
    if (filters.siswa.length > 0) activeCount++;
    if (filters.kelas.length > 0) activeCount++;
    if (filters.ruangan.length > 0) activeCount++;
    if (filters.status.length < 5) activeCount++;

    const filtered = inPeriod.filter((k) => {
      // 1. Jenis filter
      if (filters.jenis.length > 0 && !filters.jenis.includes(k.jenis)) return false;
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
        JAM_AKHIR
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
  }, [tanggalTampil, filteredKegiatan, todayIso]);

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
                tanggal: '2026-09-16',
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
          mulai: kegiatan.mulai,
          selesai: kegiatan.selesai,
          ruangan: kegiatan.ruangan || '',
          mapel: kegiatan.mapel || '',
          materi: kegiatan.materi || '',
          subjek: kegiatan.subjek,
          siswa: kegiatan.siswa,
          catatan: kegiatan.catatan || '',
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

  // Handle Empty Slot Selection (Click on calendar grid to create kegiatan)
  const handleSelectSlot = React.useCallback(
    (iso: string, hour: number) => {
      setActivePopover(null);
      const jamMulai = `${String(hour).padStart(2, '0')}:00`;
      const jamSelesai = `${String(hour + 1).padStart(2, '0')}:30`;
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

  const isPeriodEmpty = filteredKegiatan.length === 0;
  const countLabel = `Menampilkan ${filteredKegiatan.length} dari ${allInPeriodCount} kegiatan`;
  const currentMonth = toDate(anchorDate).getMonth();

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
        {isPeriodEmpty ? (
          <KalenderEmptyState
            totalInPeriod={allInPeriodCount}
            activeFilterCount={activeFilterCount}
            onResetFilters={resetFilters}
            onGoToday={goToday}
          />
        ) : view === 'bulan' ? (
          <KalenderMonthView
            visibleDates={tanggalTampil}
            currentMonth={currentMonth}
            todayIso={todayIso}
            kegiatanList={filteredKegiatan}
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
            nowLine={nowLine}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
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

