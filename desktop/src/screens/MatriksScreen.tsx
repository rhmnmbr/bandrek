import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/toast';
import {
  useMapelList,
  useSiswaList,
  useKelasList,
  useMatriks,
  useTandaiManual,
  useHapusManual,
  useTandaiManualMassal,
  useHapusManualMassal,
} from '@/data/hooks';
import { MatriksToolbar } from '@/components/matriks/MatriksToolbar';
import { MatriksSummaryCards } from '@/components/matriks/MatriksSummaryCards';
import { MatriksGrid } from '@/components/matriks/MatriksGrid';
import { MatriksLegendBar } from '@/components/matriks/MatriksLegendBar';
import { MatriksCellPopover } from '@/components/matriks/MatriksCellPopover';
import { MatriksBulkToolbar } from '@/components/matriks/MatriksBulkToolbar';
import { MatriksAnomalyModal } from '@/components/matriks/MatriksAnomalyModal';
import { MatriksEmptyState } from '@/components/matriks/MatriksEmptyState';
import type {
  JenjangPendidikan,
  SelMatriks,
  BarisSiswa,
  KolomMateri,
  TandaiManualInput,
} from '@/data/types';

const JENJANG_ORDER: JenjangPendidikan[] = ['SD', 'SMP', 'SMA'];

export const MatriksScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Master Data
  const { data: mapelList = [] } = useMapelList();
  const { data: siswaList = [] } = useSiswaList();
  const { data: kelasList = [] } = useKelasList();

  // Filter mapel aktif
  const mapelAktif = React.useMemo(() => mapelList.filter((m) => m.aktif), [mapelList]);

  // Hitung jumlah siswa aktif per jenjang untuk default jenjang (DOMAIN.md §10)
  const aktifPerJenjang = React.useMemo(() => {
    const counts: Record<JenjangPendidikan, number> = { SD: 0, SMP: 0, SMA: 0 };
    for (const s of siswaList) {
      if (s.aktif && s.jenjang in counts) {
        counts[s.jenjang]++;
      }
    }
    return counts;
  }, [siswaList]);

  // Determine default jenjang based on most active students
  const defaultJenjang: JenjangPendidikan = React.useMemo(() => {
    return [...JENJANG_ORDER].sort((a, b) => aktifPerJenjang[b] - aktifPerJenjang[a])[0] || 'SD';
  }, [aktifPerJenjang]);

  // Session-persisted Mapel & Jenjang selection (DOMAIN.md §10)
  const [selectedMapelId, setSelectedMapelId] = React.useState<string>(() => {
    return sessionStorage.getItem('bandrek:matriks:mapel') || '';
  });

  const [selectedJenjang, setSelectedJenjang] = React.useState<JenjangPendidikan>(() => {
    const saved = sessionStorage.getItem('bandrek:matriks:jenjang') as JenjangPendidikan;
    return saved && JENJANG_ORDER.includes(saved) ? saved : defaultJenjang;
  });

  // Ensure selectedMapelId falls back to first active mapel if empty
  React.useEffect(() => {
    if (mapelAktif.length > 0) {
      const exists = mapelAktif.some((m) => m.id === selectedMapelId);
      if (!exists) {
        const first = mapelAktif[0].id;
        setSelectedMapelId(first);
        sessionStorage.setItem('bandrek:matriks:mapel', first);
      }
    }
  }, [mapelAktif, selectedMapelId]);

  // Ensure default jenjang is set if empty
  React.useEffect(() => {
    if (!selectedJenjang) {
      setSelectedJenjang(defaultJenjang);
      sessionStorage.setItem('bandrek:matriks:jenjang', defaultJenjang);
    }
  }, [defaultJenjang, selectedJenjang]);

  // Update handlers with session persistence
  const handleSelectMapel = React.useCallback((id: string) => {
    setSelectedMapelId(id);
    sessionStorage.setItem('bandrek:matriks:mapel', id);
    setSelectedKeys(new Set());
    setPopoverState(null);
  }, []);

  const handleSelectJenjang = React.useCallback((j: JenjangPendidikan) => {
    setSelectedJenjang(j);
    sessionStorage.setItem('bandrek:matriks:jenjang', j);
    setSelectedKelasId('');
    setSelectedKeys(new Set());
    setPopoverState(null);
  }, []);

  // Additional Filters
  const [selectedKelasId, setSelectedKelasId] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [showNonaktif, setShowNonaktif] = React.useState<boolean>(false);
  const [tandaiTertinggal, setTandaiTertinggal] = React.useState<boolean>(true);

  // Bulk Mode State
  const [isBulkMode, setIsBulkMode] = React.useState<boolean>(false);
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set());
  const [bulkDate, setBulkDate] = React.useState<string>('');
  const [bulkNotes, setBulkNotes] = React.useState<string>('');

  // Anomaly Modal State
  const [anomalyModalOpen, setAnomalyModalOpen] = React.useState<boolean>(false);

  // Cell Popover State
  const [popoverState, setPopoverState] = React.useState<{
    cell: SelMatriks;
    siswa: BarisSiswa;
    materi: KolomMateri;
    anchorRect: DOMRect;
  } | null>(null);

  // Close popovers on Esc
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (anomalyModalOpen) {
          setAnomalyModalOpen(false);
        } else if (popoverState) {
          setPopoverState(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [anomalyModalOpen, popoverState]);

  // Build filter params for TanStack Query
  const filterParams = React.useMemo(() => {
    return {
      kelasId: selectedKelasId || undefined,
      q: searchQuery.trim() || undefined,
      tampilkanNonaktif: showNonaktif,
    };
  }, [selectedKelasId, searchQuery, showNonaktif]);

  // Fetch Matrix Data
  const { data: matriksResult, isLoading } = useMatriks(
    selectedMapelId,
    selectedJenjang,
    filterParams,
    Boolean(selectedMapelId)
  );

  // Mutations
  const tandaiManualMutation = useTandaiManual();
  const hapusManualMutation = useHapusManual();
  const tandaiManualMassalMutation = useTandaiManualMassal();
  const hapusManualMassalMutation = useHapusManualMassal();

  // Reset Filters
  const handleResetFilter = React.useCallback(() => {
    setSelectedKelasId('');
    setSearchQuery('');
  }, []);

  const hasFilter = Boolean(selectedKelasId || searchQuery.trim());

  // Jenjang Options with active counts
  const jenjangOptions = React.useMemo(() => {
    return JENJANG_ORDER.map((j) => ({
      id: j,
      label: `${j} · ${aktifPerJenjang[j]} siswa aktif`,
    }));
  }, [aktifPerJenjang]);

  // Filter classes by active jenjang
  const classesForJenjang = React.useMemo(() => {
    return kelasList.filter((k) => k.jenjang === selectedJenjang);
  }, [kelasList, selectedJenjang]);

  // Bulk Selection Handlers
  const handleToggleCellSelection = React.useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleToggleRowSelection = React.useCallback((_siswaId: string, rowKeys: string[]) => {
    setSelectedKeys((prev) => {
      const allPresent = rowKeys.every((k) => prev.has(k));
      const next = new Set(prev);
      if (allPresent) {
        rowKeys.forEach((k) => next.delete(k));
      } else {
        rowKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  }, []);

  const handleToggleColumnSelection = React.useCallback((_materiId: string, colKeys: string[]) => {
    setSelectedKeys((prev) => {
      const allPresent = colKeys.every((k) => prev.has(k));
      const next = new Set(prev);
      if (allPresent) {
        colKeys.forEach((k) => next.delete(k));
      } else {
        colKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  }, []);

  // Cell Click Handler
  const handleCellClick = React.useCallback(
    (cell: SelMatriks, siswa: BarisSiswa, materi: KolomMateri, rect: DOMRect) => {
      setPopoverState({ cell, siswa, materi, anchorRect: rect });
    },
    []
  );

  // Student Name Click Handler
  const handleStudentNameClick = React.useCallback(
    (_siswa: BarisSiswa) => {
      showToast({
        message: 'Profil siswa menyusul di Batch B.',
        type: 'info',
      });
    },
    [showToast]
  );

  // Navigate to kegiatan
  const handleNavigateToKegiatan = React.useCallback(
    (kegiatanId: string) => {
      navigate(`/kegiatan/${kegiatanId}`, { state: { from: 'matriks' } });
    },
    [navigate]
  );

  // Single Cell Manual Checklist Handlers
  const handleSaveManual = React.useCallback(
    async (siswaId: string, materiId: string, tanggal?: string | null, catatan?: string) => {
      try {
        await tandaiManualMutation.mutateAsync({
          siswaId,
          materiId,
          tanggal: tanggal || null,
          catatan: catatan || '',
          oleh: 'Operator',
        });
        showToast({
          message: 'Ditandai sudah dipelajari.',
          type: 'success',
        });
      } catch (err: any) {
        showToast({
          message: err?.message || 'Gagal menyimpan ceklis manual.',
          type: 'error',
        });
      }
    },
    [tandaiManualMutation, showToast]
  );

  const handleRemoveManual = React.useCallback(
    async (siswaId: string, materiId: string, ceklisId?: string) => {
      try {
        if (ceklisId) {
          await hapusManualMutation.mutateAsync(ceklisId);
        } else {
          await hapusManualMassalMutation.mutateAsync([{ siswaId, materiId }]);
        }
        showToast({
          message: 'Ceklis manual dilepas.',
          type: 'success',
        });
      } catch (err: any) {
        showToast({
          message: err?.message || 'Gagal melepas ceklis manual.',
          type: 'error',
        });
      }
    },
    [hapusManualMutation, hapusManualMassalMutation, showToast]
  );

  // Bulk Apply Handler (DOMAIN.md §10: skip cells already tersampaikan)
  const handleBulkApply = React.useCallback(async () => {
    if (!matriksResult || selectedKeys.size === 0) return;

    const itemsToMark: TandaiManualInput[] = [];
    let skippedTersampaikan = 0;

    selectedKeys.forEach((key) => {
      const [sid, mid] = key.split('|');
      const cell = matriksResult.sel[sid]?.[mid];
      if (cell && cell.keadaan === 'tersampaikan') {
        skippedTersampaikan++;
      } else {
        itemsToMark.push({
          siswaId: sid,
          materiId: mid,
          tanggal: bulkDate || null,
          catatan: bulkNotes || '',
          oleh: 'Operator',
        });
      }
    });

    if (itemsToMark.length === 0) {
      showToast({
        message: 'Semua sel yang dipilih sudah tersampaikan lewat kehadiran.',
        type: 'warning',
      });
      return;
    }

    try {
      await tandaiManualMassalMutation.mutateAsync(itemsToMark);
      setSelectedKeys(new Set());
      setBulkNotes('');
      const n = itemsToMark.length;
      showToast({
        message: `${n} sel ditandai sudah dipelajari${
          skippedTersampaikan ? ` · ${skippedTersampaikan} dilewati karena sudah tersampaikan lewat kehadiran` : ''
        }.`,
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        message: err?.message || 'Gagal menandai sel massal.',
        type: 'error',
      });
    }
  }, [matriksResult, selectedKeys, bulkDate, bulkNotes, tandaiManualMassalMutation, showToast]);

  // Bulk Release Handler
  const handleBulkRelease = React.useCallback(async () => {
    if (selectedKeys.size === 0) return;

    const keysToRemove: Array<{ siswaId: string; materiId: string }> = [];
    selectedKeys.forEach((key) => {
      const [sid, mid] = key.split('|');
      keysToRemove.push({ siswaId: sid, materiId: mid });
    });

    try {
      const removed = await hapusManualMassalMutation.mutateAsync(keysToRemove);
      setSelectedKeys(new Set());
      showToast({
        message: removed > 0 ? `${removed} ceklis manual dilepas.` : 'Tidak ada ceklis manual di sel yang dipilih.',
        type: removed > 0 ? 'success' : 'info',
      });
    } catch (err: any) {
      showToast({
        message: err?.message || 'Gagal melepas ceklis manual.',
        type: 'error',
      });
    }
  }, [selectedKeys, hapusManualMassalMutation, showToast]);

  // Summary Metrics Calculation
  const metrics = React.useMemo(() => {
    if (!matriksResult) {
      return {
        totalMateriTersampaikan: 0,
        totalSelBerlaku: 0,
        persentaseCakupan: 0,
        jumlahSiswaTertinggal: 0,
        totalSiswaTampil: 0,
        menungguRealisasi: 0,
      };
    }

    const totalSiswaTampil = matriksResult.baris.length;
    const totalKolom = matriksResult.kolom.length;
    const totalSelBerlaku = totalSiswaTampil * totalKolom;

    let totalMateriTersampaikan = 0;
    for (const m of matriksResult.kolom) {
      totalMateriTersampaikan += matriksResult.ringkasanKolom[m.id]?.menerimaCount || 0;
    }

    const persentaseCakupan = totalSelBerlaku > 0 ? Math.round((totalMateriTersampaikan / totalSelBerlaku) * 100) : 0;
    const jumlahSiswaTertinggal = matriksResult.siswaTertinggal.length;
    const menungguRealisasi = matriksResult.menungguRealisasiCount || 0;

    return {
      totalMateriTersampaikan,
      totalSelBerlaku,
      persentaseCakupan,
      jumlahSiswaTertinggal,
      totalSiswaTampil,
      menungguRealisasi,
    };
  }, [matriksResult]);

  // Loading state
  if (isLoading || !matriksResult) {
    return (
      <div className="flex flex-1 flex-col h-full bg-white">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-[13.5px] text-[#5C5A58]">Memuat matriks belajar…</div>
        </div>
      </div>
    );
  }

  // Check Prerequisite Empty States
  const hasNoKolom = matriksResult.kolom.length === 0;
  const hasNoSiswa = matriksResult.baris.length === 0;

  // Filter suffix for metadata
  const currentKelasObj = kelasList.find((k) => k.id === selectedKelasId);
  const filterSuffix = [
    currentKelasObj ? ` · Kelas: ${currentKelasObj.nama}` : '',
    searchQuery.trim() ? ` · pencarian “${searchQuery.trim()}”` : '',
    showNonaktif ? ' · termasuk nonaktif' : '',
  ].join('');

  return (
    <div className="flex flex-1 flex-col h-full bg-white overflow-hidden" data-testid="matriks-screen">
      {/* 1. Main Toolbar with Single-Select Mapel & Jenjang */}
      <MatriksToolbar
        mapelList={mapelAktif}
        selectedMapelId={selectedMapelId}
        onSelectMapel={handleSelectMapel}
        jenjangOptions={jenjangOptions}
        selectedJenjang={selectedJenjang}
        onSelectJenjang={handleSelectJenjang}
        kelasList={classesForJenjang}
        selectedKelasId={selectedKelasId}
        onSelectKelas={setSelectedKelasId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showNonaktif={showNonaktif}
        onToggleNonaktif={() => setShowNonaktif((prev) => !prev)}
        tandaiTertinggal={tandaiTertinggal}
        onToggleTandaiTertinggal={() => setTandaiTertinggal((prev) => !prev)}
        onResetFilter={handleResetFilter}
        hasFilter={hasFilter}
        isBulkMode={isBulkMode}
        onToggleBulkMode={() => {
          setIsBulkMode((prev) => !prev);
          setSelectedKeys(new Set());
          setPopoverState(null);
        }}
      />

      {/* 2. Content View: Empty State vs Regular Grid */}
      {hasNoKolom ? (
        <MatriksEmptyState
          type="tanpa_materi"
          namaMapel={matriksResult.namaMapel}
          jenjang={selectedJenjang}
          hasFilter={hasFilter}
          onPrimaryAction={() => navigate('/master/mapel')}
          onResetFilter={handleResetFilter}
        />
      ) : hasNoSiswa ? (
        <MatriksEmptyState
          type="tanpa_siswa"
          namaMapel={matriksResult.namaMapel}
          jenjang={selectedJenjang}
          hasFilter={hasFilter}
          onPrimaryAction={() => setShowNonaktif(true)}
          onResetFilter={handleResetFilter}
        />
      ) : (
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
          {/* 4 Summary Cards */}
          <MatriksSummaryCards
            data={matriksResult}
            totalMateriTersampaikan={metrics.totalMateriTersampaikan}
            totalSelBerlaku={metrics.totalSelBerlaku}
            persentaseCakupan={metrics.persentaseCakupan}
            jumlahSiswaTertinggal={metrics.jumlahSiswaTertinggal}
            totalSiswaTampil={metrics.totalSiswaTampil}
            menungguRealisasi={metrics.menungguRealisasi}
          />

          {/* Grid Table */}
          <MatriksGrid
            data={matriksResult}
            tandaiTertinggal={tandaiTertinggal}
            isBulkMode={isBulkMode}
            selectedKeys={selectedKeys}
            onToggleCellSelection={handleToggleCellSelection}
            onToggleRowSelection={handleToggleRowSelection}
            onToggleColumnSelection={handleToggleColumnSelection}
            onCellClick={handleCellClick}
            onStudentNameClick={handleStudentNameClick}
            onOpenAnomalyModal={() => setAnomalyModalOpen(true)}
            filterSuffix={filterSuffix}
          />

          {/* Bulk Action Toolbar if bulk mode is active */}
          {isBulkMode && (
            <MatriksBulkToolbar
              selectedCount={selectedKeys.size}
              tanggal={bulkDate}
              onTanggalChange={setBulkDate}
              catatan={bulkNotes}
              onCatatanChange={setBulkNotes}
              onApply={handleBulkApply}
              onRelease={handleBulkRelease}
              onExit={() => {
                setIsBulkMode(false);
                setSelectedKeys(new Set());
              }}
            />
          )}

          {/* Legend Bar at Bottom */}
          <MatriksLegendBar isBulkMode={isBulkMode} />
        </div>
      )}

      {/* Cell Popover */}
      {popoverState && (
        <MatriksCellPopover
          open={Boolean(popoverState)}
          onClose={() => setPopoverState(null)}
          cell={popoverState.cell}
          siswa={popoverState.siswa}
          materi={popoverState.materi}
          namaMapel={matriksResult.namaMapel}
          anchorRect={popoverState.anchorRect}
          onSaveManual={handleSaveManual}
          onRemoveManual={handleRemoveManual}
          onNavigateToKegiatan={handleNavigateToKegiatan}
        />
      )}

      {/* Anomaly Modal */}
      <MatriksAnomalyModal
        open={anomalyModalOpen}
        onClose={() => setAnomalyModalOpen(false)}
        items={matriksResult.catatanDiLuarJenjang}
        totalSiswa={new Set(matriksResult.catatanDiLuarJenjang.map((c) => c.siswaId)).size}
        jenjang={selectedJenjang}
        namaMapel={matriksResult.namaMapel}
        onNavigateToKegiatan={handleNavigateToKegiatan}
      />
    </div>
  );
};
