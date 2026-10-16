import * as React from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  useKegiatanDaftar,
  useJenisKegiatanList,
  useSubjekList,
  useKelasList,
  useSiswaList,
  useMapelList,
  useTempatList,
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
import { useMinimumLoading } from '@/lib/useMinimumLoading';

import { DaftarToolbar } from '@/components/daftar/DaftarToolbar';
import { DaftarQuickFilters } from '@/components/daftar/DaftarQuickFilters';
import { DaftarTable } from '@/components/daftar/DaftarTable';
import { DaftarKanban } from '@/components/daftar/DaftarKanban';
import { DaftarEmptyState } from '@/components/daftar/DaftarEmptyState';
import { DaftarKegiatanSkeleton } from '@/components/skeleton';

import { FormKegiatanPanel } from '@/components/kegiatan/FormKegiatanPanel';
import { BatalkanKegiatanModal } from '@/components/kegiatan/BatalkanKegiatanModal';
import { JadwalUlangModal } from '@/components/kegiatan/JadwalUlangModal';

const TODAY_ISO = toIso(new Date());

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
  const { data: siswaList = [] } = useSiswaList({ status: 'semua' });
  const { data: mapelList = [] } = useMapelList();
  const { data: tempatList = [] } = useTempatList();

  const rawLoading =
    (loadingKegiatan || loadingJenis || loadingSubjek || loadingKelas) &&
    semuaKegiatan.length === 0;
  const isPageLoading = useMinimumLoading(rawLoading, 350);

  // Default date range: awal bulan sekarang sampai akhir bulan depan
  const defaultRentang = React.useMemo(() => {
    const now = new Date();
    const dStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    return {
      dari: toIso(dStart),
      sampai: toIso(dEnd),
    };
  }, []);

  // Local filter states - initialized eagerly from URL searchParams to prevent double-mount
  const [userDari, setUserDari] = React.useState<string | null>(
    () => searchParams.get('dari') || null
  );
  const [userSampai, setUserSampai] = React.useState<string | null>(
    () => searchParams.get('sampai') || null
  );

  const [jenis, setJenis] = React.useState<string[]>(
    () => searchParams.get('jenis')?.split(',').filter(Boolean) || []
  );
  const [status, setStatus] = React.useState<StatusKegiatan[]>(
    () => (searchParams.get('status')?.split(',').filter(Boolean) as StatusKegiatan[]) || []
  );
  const [subjek, setSubjek] = React.useState<string[]>(
    () => searchParams.get('subjek')?.split(',').filter(Boolean) || []
  );
  const [kelas, setKelas] = React.useState<string[]>(
    () => searchParams.get('kelas')?.split(',').filter(Boolean) || []
  );
  const [siswa, setSiswa] = React.useState<string[]>(
    () => searchParams.get('siswa')?.split(',').filter(Boolean) || []
  );
  const [mapel, setMapel] = React.useState<string[]>(
    () => searchParams.get('mapel')?.split(',').filter(Boolean) || []
  );
  const [tempat, setTempat] = React.useState<string>(
    () => searchParams.get('tempat') || ''
  );
  const [cari, setCari] = React.useState<string>(
    () => searchParams.get('cari') || ''
  );
  const [cepat, setCepat] = React.useState<QuickFilterDaftar | ''>(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'perlu_realisasi' || filterParam === 'perlu') return 'perlu';
    if (
      filterParam === 'hari' ||
      filterParam === 'minggu' ||
      filterParam === 'datang'
    ) {
      return filterParam as QuickFilterDaftar;
    }
    return '';
  });
  const [sortDesc, setSortDesc] = React.useState<boolean>(true);
  const [viewMode, setViewMode] = React.useState<'tabel' | 'kanban'>(() => {
    const v = searchParams.get('view');
    return v === 'kanban' ? 'kanban' : 'tabel';
  });

  const dari = userDari ?? defaultRentang.dari;
  const sampai = userSampai ?? defaultRentang.sampai;

  // Sync URL query parameters only when URL search actually changes externally
  const searchParamsStr = searchParams.toString();
  React.useEffect(() => {
    const filterParam = searchParams.get('filter');
    const subjekParam = searchParams.get('subjek');
    const kelasParam = searchParams.get('kelas');
    const jenisParam = searchParams.get('jenis');
    const statusParam = searchParams.get('status');
    const cariParam = searchParams.get('cari');
    const mapelParam = searchParams.get('mapel');
    const tempatParam = searchParams.get('tempat');
    const siswaParam = searchParams.get('siswa');
    const dariParam = searchParams.get('dari');
    const sampaiParam = searchParams.get('sampai');

    if (filterParam === 'perlu_realisasi' || filterParam === 'perlu') {
      setCepat('perlu');
    } else if (filterParam === 'hari' || filterParam === 'minggu' || filterParam === 'datang') {
      setCepat(filterParam as QuickFilterDaftar);
    } else {
      setCepat('');
    }

    setSubjek(subjekParam ? subjekParam.split(',').filter(Boolean) : []);
    setKelas(kelasParam ? kelasParam.split(',').filter(Boolean) : []);
    setJenis(jenisParam ? jenisParam.split(',').filter(Boolean) : []);
    setStatus(statusParam ? (statusParam.split(',').filter(Boolean) as StatusKegiatan[]) : []);
    setSiswa(siswaParam ? siswaParam.split(',').filter(Boolean) : []);
    setMapel(mapelParam ? mapelParam.split(',').filter(Boolean) : []);
    setCari(cariParam || '');
    setTempat(tempatParam || '');
    setUserDari(dariParam || null);
    setUserSampai(sampaiParam || null);
  }, [searchParamsStr]);

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
    const dToday = toDate(TODAY_ISO);
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

  // Siswa lowercase name map for O(1) text search
  const siswaNameMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const s of siswaList) {
      map.set(s.id, s.nama.toLowerCase());
    }
    return map;
  }, [siswaList]);

  // Fast O(1) lookup sets
  const jenisSet = React.useMemo(() => new Set(jenis), [jenis]);
  const statusSet = React.useMemo(() => new Set(status), [status]);
  const subjekSet = React.useMemo(() => new Set(subjek), [subjek]);
  const siswaSet = React.useMemo(() => new Set(siswa), [siswa]);
  const mapelSet = React.useMemo(() => new Set(mapel), [mapel]);

  // Main predicate: matches dropdowns and search term with O(1) lookups
  const lolosFilter = React.useCallback(
    (ev: Kegiatan) => {
      if (jenis.length > 0 && (!ev.jenis || !jenisSet.has(ev.jenis))) return false;
      if (status.length > 0 && !statusSet.has(ev.status)) return false;
      if (subjek.length > 0 && !ev.subjek.some((s) => subjekSet.has(s.id))) return false;
      if (siswa.length > 0 && !ev.siswa.some((sid) => siswaSet.has(sid))) return false;
      if (kelas.length > 0) {
        const matchAnyKelas = kelas.some((kId) => {
          const anggota = kelasAnggotaMap.get(kId) || [];
          return ev.kelas === kId || ev.siswa.some((sid) => anggota.includes(sid));
        });
        if (!matchAnyKelas) return false;
      }
      if (mapel.length > 0 && (!ev.mapel || !mapelSet.has(ev.mapel))) return false;
      if (tempat && ev.tempat !== tempat) return false;
      if (cari.trim().length > 0) {
        const qLower = cari.trim().toLowerCase();
        const matchNama = ev.nama.toLowerCase().includes(qLower);
        const matchSiswa = ev.siswa.some((sid) => {
          const sNama = siswaNameMap.get(sid);
          return sNama ? sNama.includes(qLower) : false;
        });
        if (!matchNama && !matchSiswa) return false;
      }
      return true;
    },
    [
      jenis.length,
      jenisSet,
      status.length,
      statusSet,
      subjek.length,
      subjekSet,
      siswa.length,
      siswaSet,
      kelas,
      kelasAnggotaMap,
      mapel.length,
      mapelSet,
      tempat,
      cari,
      siswaNameMap,
    ]
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
      if (ev.tanggal === TODAY_ISO) hari++;
      if (
        ev.tanggal >= mingguIniRange.senin &&
        ev.tanggal <= mingguIniRange.minggu
      ) {
        minggu++;
      }
      if (ev.tanggal >= TODAY_ISO) datang++;
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
        return ev.tanggal === TODAY_ISO;
      }
      if (cepat === 'minggu') {
        return (
          ev.tanggal >= mingguIniRange.senin &&
          ev.tanggal <= mingguIniRange.minggu
        );
      }
      if (cepat === 'datang') {
        return ev.tanggal >= TODAY_ISO;
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
    (jenis.length > 0 ? 1 : 0) +
    (status.length > 0 ? 1 : 0) +
    (subjek.length > 0 ? 1 : 0) +
    (kelas.length > 0 ? 1 : 0) +
    (siswa.length > 0 ? 1 : 0) +
    (mapel.length > 0 ? 1 : 0) +
    (tempat ? 1 : 0) +
    (cari.trim() ? 1 : 0);

  const hasActiveFilters =
    activeDropdownCount > 0 ||
    Boolean(cepat) ||
    !sortDesc ||
    (dari && dari !== defaultRentang.dari) ||
    (sampai && sampai !== defaultRentang.sampai);

  // Sync toolbar filters to URL search params
  const handleUpdateParam = React.useCallback(
    (key: string, val: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (val) {
        next.set(key, val);
      } else {
        next.delete(key);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleChangeJenis = (val: string[]) => {
    setJenis(val);
    handleUpdateParam('jenis', val.length > 0 ? val.join(',') : null);
  };

  const handleChangeStatus = (val: StatusKegiatan[]) => {
    setStatus(val);
    handleUpdateParam('status', val.length > 0 ? val.join(',') : null);
  };

  const handleChangeSubjek = (val: string[]) => {
    setSubjek(val);
    handleUpdateParam('subjek', val.length > 0 ? val.join(',') : null);
  };

  const handleChangeKelas = (val: string[]) => {
    setKelas(val);
    handleUpdateParam('kelas', val.length > 0 ? val.join(',') : null);
  };

  const handleChangeSiswa = (val: string[]) => {
    setSiswa(val);
    handleUpdateParam('siswa', val.length > 0 ? val.join(',') : null);
  };

  const handleChangeMapel = (val: string[]) => {
    setMapel(val);
    handleUpdateParam('mapel', val.length > 0 ? val.join(',') : null);
  };

  const handleChangeTempat = (val: string) => {
    setTempat(val);
    handleUpdateParam('tempat', val || null);
  };

  const handleChangeCari = (val: string) => {
    setCari(val);
    handleUpdateParam('cari', val.trim() || null);
  };

  const handleChangeDari = (val: string) => {
    setUserDari(val);
    handleUpdateParam('dari', val || null);
  };

  const handleChangeSampai = (val: string) => {
    setUserSampai(val);
    handleUpdateParam('sampai', val || null);
  };

  const handleChangeViewMode = (mode: 'tabel' | 'kanban') => {
    setViewMode(mode);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (mode === 'kanban') {
        next.set('view', 'kanban');
      } else {
        next.delete('view');
      }
      return next;
    }, { replace: true });
  };

  // Toggle quick filter chip
  const handleToggleCepat = (id: QuickFilterDaftar) => {
    const next = new URLSearchParams(searchParams);
    if (cepat === id) {
      setCepat('');
      next.delete('filter');
    } else {
      setCepat(id);
      if (id === 'perlu') {
        next.set('filter', 'perlu_realisasi');
      } else {
        next.set('filter', id);
      }
    }
    setSearchParams(next, { replace: true });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setUserDari(null);
    setUserSampai(null);
    setJenis([]);
    setStatus([]);
    setSubjek([]);
    setKelas([]);
    setSiswa([]);
    setMapel([]);
    setTempat('');
    setCari('');
    setCepat('');
    setSortDesc(true);
    setSearchParams({}, { replace: true });
  };

  // Widen date range by 1 year past/future
  const handleWidenRange = () => {
    const dToday = toDate(TODAY_ISO);
    const dPast = addDays(dToday, -365);
    const dFuture = addDays(dToday, 365);
    const pastIso = toIso(dPast);
    const futureIso = toIso(dFuture);
    setUserDari(pastIso);
    setUserSampai(futureIso);
    setCepat('');
    const next = new URLSearchParams(searchParams);
    next.set('dari', pastIso);
    next.set('sampai', futureIso);
    next.delete('filter');
    setSearchParams(next, { replace: true });
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


  const activeTempatObj = React.useMemo(() => {
    if (!tempat) return null;
    const t = tempatList.find((item) => item.id === tempat);
    return t ? { id: t.id, nama: t.nama } : { id: tempat, nama: 'Tempat' };
  }, [tempat, tempatList]);

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
            onChangeDari={handleChangeDari}
            onChangeSampai={handleChangeSampai}
            rentangMati={Boolean(cepat)}
            jenis={jenis}
            onChangeJenis={handleChangeJenis}
            jenisList={jenisList}
            status={status}
            onChangeStatus={handleChangeStatus}
            subjek={subjek}
            onChangeSubjek={handleChangeSubjek}
            subjekList={subjekList}
            kelas={kelas}
            onChangeKelas={handleChangeKelas}
            kelasList={kelasList}
            siswa={siswa}
            onChangeSiswa={handleChangeSiswa}
            siswaList={siswaList}
            mapel={mapel}
            onChangeMapel={handleChangeMapel}
            mapelList={mapelList}
            cari={cari}
            onChangeCari={handleChangeCari}
            simulatedToday={TODAY_ISO}
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
            activeTempat={activeTempatObj}
            onClearTempat={() => handleChangeTempat('')}
            viewMode={viewMode}
            onChangeViewMode={handleChangeViewMode}
          />

          {/* 3. Table or Kanban or Empty State */}
          {filteredKegiatan.length > 0 ? (
            viewMode === 'kanban' ? (
              <DaftarKanban
                kegiatanList={filteredKegiatan}
                simulatedToday={TODAY_ISO}
                onOpenDetail={handleOpenDetail}
                onIsiRealisasi={handleIsiRealisasi}
                onJadwalUlang={handleJadwalUlang}
                onBatalkan={handleBatalkan}
              />
            ) : (
              <DaftarTable
                kegiatanList={filteredKegiatan}
                simulatedToday={TODAY_ISO}
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
            )
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
          initialData={{ mode: 'create', tanggal: TODAY_ISO }}
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
