import * as React from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  useKegiatanDaftar,
  useJenisKegiatanList,
  useSubjekList,
  useKelasList,
} from '@/data/hooks';
import type { Kegiatan, StatusKegiatan, QuickFilterDaftar } from '@/data/types/kegiatan';
import {
  toDate,
  toIso,
  addDays,
  getMonday,
} from '@/lib/dateUtils';
import { BANDREK_EVENTS } from '@/lib/keyboardShortcuts';
import { useToast } from '@/components/ui/toast';

import { DaftarToolbar } from '@/components/daftar/DaftarToolbar';
import { DaftarQuickFilters } from '@/components/daftar/DaftarQuickFilters';
import { DaftarTable } from '@/components/daftar/DaftarTable';
import { DaftarEmptyState } from '@/components/daftar/DaftarEmptyState';
import { DaftarKegiatanSkeleton } from '@/components/skeleton';

import { FormKegiatanPanel } from '@/components/kegiatan/FormKegiatanPanel';
import { BatalkanKegiatanModal } from '@/components/kegiatan/BatalkanKegiatanModal';
import { JadwalUlangModal } from '@/components/kegiatan/JadwalUlangModal';

const SIMULATED_TODAY = '2026-09-16';

export const DaftarKegiatanScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const currentPath = `${location.pathname}${location.search}`;

  // Queries
  const { data: semuaKegiatan = [], isLoading: loadingKegiatan } = useKegiatanDaftar({});
  const { data: jenisList = [], isLoading: loadingJenis } = useJenisKegiatanList();
  const { data: subjekList = [], isLoading: loadingSubjek } = useSubjekList();
  const { data: kelasList = [], isLoading: loadingKelas } = useKelasList();

  const isPageLoading = loadingKegiatan || loadingJenis || loadingSubjek || loadingKelas;

  // Calculate default date range: past 14 days to latest event in dataset
  const defaultRentang = React.useMemo(() => {
    const dToday = toDate(SIMULATED_TODAY);
    const dDari = addDays(dToday, -14);
    const tglAkhir = semuaKegiatan.reduce(
      (max, k) => (k.tanggal > max ? k.tanggal : max),
      SIMULATED_TODAY
    );
    return {
      dari: toIso(dDari),
      sampai: tglAkhir,
    };
  }, [semuaKegiatan]);

  // Local filter states - user explicit selections (null means default derived from data)
  const [userDari, setUserDari] = React.useState<string | null>(null);
  const [userSampai, setUserSampai] = React.useState<string | null>(null);

  const dari = userDari ?? defaultRentang.dari;
  const sampai = userSampai ?? defaultRentang.sampai;

  const [jenis, setJenis] = React.useState<string>('');
  const [status, setStatus] = React.useState<StatusKegiatan | ''>('');
  const [subjek, setSubjek] = React.useState<string>('');
  const [kelas, setKelas] = React.useState<string>('');
  const [cari, setCari] = React.useState<string>('');
  const [cepat, setCepat] = React.useState<QuickFilterDaftar | ''>('');
  const [sortDesc, setSortDesc] = React.useState<boolean>(true);

  // Handle URL query parameter `?filter=perlu_realisasi` or `?filter=perlu`
  React.useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'perlu_realisasi' || filterParam === 'perlu') {
      setCepat('perlu');
    }
  }, [searchParams]);

  // Modal Dialog States
  const [modalBatalState, setModalBatalState] = React.useState<{
    open: boolean;
    kegiatan: Kegiatan | null;
  }>({ open: false, kegiatan: null });

  const [modalUlangState, setModalUlangState] = React.useState<{
    open: boolean;
    kegiatan: Kegiatan | null;
    dariBatal?: boolean;
  }>({ open: false, kegiatan: null, dariBatal: false });

  // Form Panel State
  const [formOpen, setFormOpen] = React.useState(false);

  // Listen to Global Ctrl+N / TopBar Kegiatan Baru event
  React.useEffect(() => {
    const handleNewEvent = () => {
      setFormOpen(true);
    };
    window.addEventListener(BANDREK_EVENTS.NEW_KEGIATAN, handleNewEvent);
    return () => window.removeEventListener(BANDREK_EVENTS.NEW_KEGIATAN, handleNewEvent);
  }, []);

  // Current week boundaries for "Minggu ini" quick filter
  const mingguIniRange = React.useMemo(() => {
    const dToday = toDate(SIMULATED_TODAY);
    const mon = getMonday(dToday);
    const sun = addDays(mon, 6);
    return {
      senin: toIso(mon),
      minggu: toIso(sun),
    };
  }, []);

  // Kelas map for student membership check
  const kelasAnggotaMap = React.useMemo(() => {
    const map = new Map<string, string[]>();
    for (const k of kelasList) {
      map.set(k.id, k.anggota);
    }
    return map;
  }, [kelasList]);

  // Main predicate: matches dropdowns and search term
  const lolosFilter = React.useCallback(
    (ev: Kegiatan) => {
      if (jenis && ev.jenis !== jenis) return false;
      if (status && ev.status !== status) return false;
      if (subjek && !ev.subjek.some((s) => s.id === subjek)) return false;
      if (kelas) {
        const anggota = kelasAnggotaMap.get(kelas) || [];
        if (ev.kelas !== kelas && !ev.siswa.some((sid) => anggota.includes(sid))) {
          return false;
        }
      }
      if (cari.trim().length > 0) {
        const qLower = cari.trim().toLowerCase();
        if (!ev.nama.toLowerCase().includes(qLower)) return false;
      }
      return true;
    },
    [jenis, status, subjek, kelas, kelasAnggotaMap, cari]
  );

  // Quick filter counts (calculated on full dataset matching other active filters)
  const quickFilterCounts = React.useMemo(() => {
    let perlu = 0;
    let hari = 0;
    let minggu = 0;
    let datang = 0;

    for (const ev of semuaKegiatan) {
      if (!lolosFilter(ev)) continue;

      if (ev.status === 'belum_direalisasi') perlu++;
      if (ev.tanggal === SIMULATED_TODAY) hari++;
      if (
        ev.tanggal >= mingguIniRange.senin &&
        ev.tanggal <= mingguIniRange.minggu
      ) {
        minggu++;
      }
      if (ev.tanggal >= SIMULATED_TODAY) datang++;
    }

    return { perlu, hari, minggu, datang };
  }, [semuaKegiatan, lolosFilter, mingguIniRange]);

  // Filtered and sorted kegiatan list
  const filteredKegiatan = React.useMemo(() => {
    const list = semuaKegiatan.filter((ev) => {
      if (!lolosFilter(ev)) return false;

      // Range filtering
      if (cepat === 'perlu') {
        return ev.status === 'belum_direalisasi';
      }
      if (cepat === 'hari') {
        return ev.tanggal === SIMULATED_TODAY;
      }
      if (cepat === 'minggu') {
        return (
          ev.tanggal >= mingguIniRange.senin &&
          ev.tanggal <= mingguIniRange.minggu
        );
      }
      if (cepat === 'datang') {
        return ev.tanggal >= SIMULATED_TODAY;
      }

      // Default date range
      if (dari && ev.tanggal < dari) return false;
      if (sampai && ev.tanggal > sampai) return false;

      return true;
    });

    // Sorting by tanggal & mulai
    return list.slice().sort((a, b) => {
      if (a.tanggal !== b.tanggal) {
        return (a.tanggal < b.tanggal ? -1 : 1) * (sortDesc ? -1 : 1);
      }
      return (a.mulai < b.mulai ? -1 : 1) * (sortDesc ? -1 : 1);
    });
  }, [semuaKegiatan, lolosFilter, cepat, dari, sampai, sortDesc, mingguIniRange]);

  // Active filter count and presence
  const activeDropdownCount =
    (jenis ? 1 : 0) +
    (status ? 1 : 0) +
    (subjek ? 1 : 0) +
    (kelas ? 1 : 0) +
    (cari.trim() ? 1 : 0);

  const hasActiveFilters =
    activeDropdownCount > 0 ||
    Boolean(cepat) ||
    !sortDesc ||
    (dari && dari !== defaultRentang.dari) ||
    (sampai && sampai !== defaultRentang.sampai);

  // Toggle quick filter chip
  const handleToggleCepat = (id: QuickFilterDaftar) => {
    if (cepat === id) {
      setCepat('');
      if (searchParams.get('filter')) {
        const next = new URLSearchParams(searchParams);
        next.delete('filter');
        setSearchParams(next);
      }
    } else {
      setCepat(id);
      if (id === 'perlu') {
        const next = new URLSearchParams(searchParams);
        next.set('filter', 'perlu_realisasi');
        setSearchParams(next);
      } else if (searchParams.get('filter')) {
        const next = new URLSearchParams(searchParams);
        next.delete('filter');
        setSearchParams(next);
      }
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setUserDari(null);
    setUserSampai(null);
    setJenis('');
    setStatus('');
    setSubjek('');
    setKelas('');
    setCari('');
    setCepat('');
    setSortDesc(true);
    if (searchParams.get('filter')) {
      const next = new URLSearchParams(searchParams);
      next.delete('filter');
      setSearchParams(next);
    }
  };

  // Widen date range by 1 year past/future
  const handleWidenRange = () => {
    const dToday = toDate(SIMULATED_TODAY);
    const dPast = addDays(dToday, -365);
    const dFuture = addDays(dToday, 365);
    setUserDari(toIso(dPast));
    setUserSampai(toIso(dFuture));
    setCepat('');
  };

  // Action Handlers
  const handleOpenDetail = (kegiatan: Kegiatan) => {
    navigate(`/kegiatan/${kegiatan.id}`, {
      state: { from: 'daftar', fromTitle: 'Kegiatan', fromPath: currentPath },
    });
  };

  const handleIsiRealisasi = (kegiatan: Kegiatan) => {
    navigate(`/kegiatan/${kegiatan.id}/realisasi`, {
      state: { from: 'daftar', fromTitle: 'Kegiatan', fromPath: currentPath },
    });
  };

  const handleJadwalUlang = (kegiatan: Kegiatan) => {
    setModalUlangState({ open: true, kegiatan, dariBatal: false });
  };

  const handleBatalkan = (kegiatan: Kegiatan) => {
    setModalBatalState({ open: true, kegiatan });
  };

  const handleOpenJadwalUlangFromBatal = (kegiatanId: string, dariBatal?: boolean) => {
    const keg = semuaKegiatan.find((k) => k.id === kegiatanId);
    if (keg) {
      setModalBatalState({ open: false, kegiatan: null });
      setModalUlangState({ open: true, kegiatan: keg, dariBatal: Boolean(dariBatal) });
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white">
      {isPageLoading ? (
        <DaftarKegiatanSkeleton />
      ) : (
        <>
          {/* 1. Main Filter Bar */}
          <DaftarToolbar
            dari={dari}
            sampai={sampai}
            onChangeDari={(val) => setUserDari(val)}
            onChangeSampai={(val) => setUserSampai(val)}
            rentangMati={Boolean(cepat)}
            jenis={jenis}
            onChangeJenis={setJenis}
            jenisList={jenisList}
            status={status}
            onChangeStatus={setStatus}
            subjek={subjek}
            onChangeSubjek={setSubjek}
            subjekList={subjekList}
            kelas={kelas}
            onChangeKelas={setKelas}
            kelasList={kelasList}
            cari={cari}
            onChangeCari={setCari}
            simulatedToday={SIMULATED_TODAY}
            onNewKegiatan={() => setFormOpen(true)}
          />

          {/* 2. Quick Filter Chips Bar */}
          <DaftarQuickFilters
            activeCepat={cepat}
            onToggleCepat={handleToggleCepat}
            counts={quickFilterCounts}
            hasActiveFilters={Boolean(hasActiveFilters)}
            onResetFilters={handleResetFilters}
            totalDisplayed={filteredKegiatan.length}
            totalAll={semuaKegiatan.length}
            sortDesc={sortDesc}
            isLoading={false}
          />

          {/* 3. Table or Empty State */}
          {filteredKegiatan.length > 0 ? (
            <DaftarTable
              kegiatanList={filteredKegiatan}
              simulatedToday={SIMULATED_TODAY}
              dari={dari}
              sampai={sampai}
              activeCepat={cepat}
              sortDesc={sortDesc}
              onToggleSort={() => setSortDesc((prev) => !prev)}
              onOpenDetail={handleOpenDetail}
              onIsiRealisasi={handleIsiRealisasi}
              onJadwalUlang={handleJadwalUlang}
              onBatalkan={handleBatalkan}
            />
          ) : (
            <DaftarEmptyState
              hasFilters={activeDropdownCount > 0 || Boolean(cepat)}
              activeFilterCount={activeDropdownCount + (cepat ? 1 : 0)}
              hasCepat={Boolean(cepat)}
              totalAll={semuaKegiatan.length}
              dari={dari}
              sampai={sampai}
              onClearCepat={() => setCepat('')}
              onResetAllFilters={handleResetFilters}
              onNewKegiatan={() => setFormOpen(true)}
              onWidenRange={handleWidenRange}
            />
          )}
        </>
      )}

      {/* 4. Side Panel: Form Kegiatan (A4) */}
      {formOpen && (
        <FormKegiatanPanel
          open={formOpen}
          initialData={{ mode: 'create', tanggal: SIMULATED_TODAY }}
          onClose={() => setFormOpen(false)}
          onSuccess={() => {
            setFormOpen(false);
            showToast({
              message: 'Kegiatan baru berhasil dibuat.',
              type: 'success',
            });
          }}
          onHighlightConflict={() => {}}
          onOpenDetail={(id) =>
            navigate(`/kegiatan/${id}`, {
              state: { from: 'daftar', fromTitle: 'Kegiatan', fromPath: currentPath },
            })
          }
        />
      )}

      {/* 5. Modal: A6 Batalkan Kegiatan */}
      {modalBatalState.open && modalBatalState.kegiatan && (
        <BatalkanKegiatanModal
          open={modalBatalState.open}
          kegiatan={modalBatalState.kegiatan}
          onClose={() => setModalBatalState({ open: false, kegiatan: null })}
          onOpenJadwalUlang={handleOpenJadwalUlangFromBatal}
        />
      )}

      {/* 6. Modal: A7 Jadwal Ulang */}
      {modalUlangState.open && modalUlangState.kegiatan && (
        <JadwalUlangModal
          open={modalUlangState.open}
          kegiatan={modalUlangState.kegiatan}
          dariBatal={modalUlangState.dariBatal}
          onClose={() =>
            setModalUlangState({ open: false, kegiatan: null, dariBatal: false })
          }
          onNavigateBaru={(baruId) => {
            navigate(`/kegiatan/${baruId}`, {
              state: { from: 'daftar', fromTitle: 'Kegiatan', fromPath: currentPath },
            });
          }}
        />
      )}
    </div>
  );
};
