import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import type { JenjangPendidikan } from '@/data/types/common';
import type { Siswa } from '@/data/types/master';
import {
  useSiswaList,
  useSiswaProfil,
  useCreateSiswa,
  useUpdateSiswa,
  useDeleteSiswa,
  useKelasList,
  useUbahAnggotaKelas,
} from '@/data/hooks/useMaster';
import { useToast } from '@/components/ui/toast';
import { SiswaToolbar } from '@/components/master/siswa/SiswaToolbar';
import { SiswaTable } from '@/components/master/siswa/SiswaTable';
import { SiswaEmptyState } from '@/components/master/siswa/SiswaEmptyState';
import { SiswaFormPanel, type SiswaFormData } from '@/components/master/siswa/SiswaFormPanel';
import { SiswaConfirmModal } from '@/components/master/siswa/SiswaConfirmModal';
import { ProfilSiswaView } from '@/components/master/siswa/ProfilSiswaView';
import { MasterTableSkeleton, ProfilSiswaSkeleton, SiswaSkeleton } from '@/components/skeleton';
import { BANDREK_EVENTS, dispatchBandrekEvent } from '@/lib/keyboardShortcuts';

export function SiswaScreen() {
  const { id: routeId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Route / Query logic for Profil
  const queryProfilId = searchParams.get('profil') || searchParams.get('id');
  const profilId = routeId || queryProfilId;

  // Filter states
  const [cari, setCari] = useState('');
  const [jenjang, setJenjang] = useState<JenjangPendidikan | 'semua'>('semua');
  const [kelasId, setKelasId] = useState('');
  const [status, setStatus] = useState<'aktif' | 'nonaktif' | 'semua'>('aktif');
  const [desc, setDesc] = useState(false);

  // Panel state
  const editQueryId = searchParams.get('edit');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(editQueryId || null);
  const [isPanelOpen, setIsPanelOpen] = useState(Boolean(editQueryId));

  // Dialog state
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: 'nonaktif' | 'hapus' | null;
    student: Siswa | null;
  }>({
    isOpen: false,
    type: null,
    student: null,
  });

  // Queries
  const { data: siswaList = [], isLoading: isLoadingSiswa } = useSiswaList({
    status,
    jenjang,
    kelasId,
    q: cari,
    desc,
  });

  const { data: allSiswa = [], isLoading: isLoadingAllSiswa } = useSiswaList({ status: 'semua' });
  const { data: kelasList = [], isLoading: isLoadingKelas } = useKelasList();
  const { data: profilData, isLoading: isLoadingProfil } = useSiswaProfil(profilId || '', Boolean(profilId));

  // Mutations
  const createSiswaMutation = useCreateSiswa();
  const updateSiswaMutation = useUpdateSiswa();
  const deleteSiswaMutation = useDeleteSiswa();
  const ubahAnggotaKelasMutation = useUbahAnggotaKelas();

  // Active / Inactive counter
  const totalAktif = useMemo(() => allSiswa.filter((s) => s.aktif).length, [allSiswa]);
  const totalNonaktif = allSiswa.length - totalAktif;

  // Selected student for edit panel
  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return allSiswa.find((s) => s.id === selectedStudentId) || null;
  }, [allSiswa, selectedStudentId]);

  // Check if any filter is active
  const adaFilter =
    status !== 'aktif' || jenjang !== 'semua' || Boolean(kelasId) || Boolean(cari) || desc;

  const handleResetFilter = useCallback(() => {
    setCari('');
    setJenjang('semua');
    setKelasId('');
    setStatus('aktif');
    setDesc(false);
  }, []);

  const handleOpenNewSiswa = useCallback(() => {
    setSelectedStudentId(null);
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedStudentId(null);
    if (searchParams.has('edit')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('edit');
      setSearchParams(nextParams);
    }
  }, [searchParams, setSearchParams]);

  const handleSelectSiswa = useCallback(
    (id: string) => {
      if (selectedStudentId === id && isPanelOpen) {
        handleClosePanel();
      } else {
        setSelectedStudentId(id);
        setIsPanelOpen(true);
      }
    },
    [selectedStudentId, isPanelOpen, handleClosePanel]
  );

  const handleSaveForm = useCallback(
    async (formData: SiswaFormData) => {
      try {
        if (!formData.id) {
          // Create
          const created = await createSiswaMutation.mutateAsync({
            nama: formData.nama.trim(),
            jenjang: formData.jenjang as JenjangPendidikan,
            aktif: formData.aktif,
            lahir: formData.lahir,
            kelamin: formData.kelamin as any,
            asal: formData.asal.trim(),
            waliNama: formData.waliNama.trim(),
            waliWa: formData.waliWa.trim(),
            bergabung: formData.bergabung,
            catatan: formData.catatan.trim(),
          });
          showToast({
            type: 'success',
            message: `Siswa “${created.nama}” berhasil ditambahkan.`,
          });
          setSelectedStudentId(created.id);
        } else {
          // Update
          const updated = await updateSiswaMutation.mutateAsync({
            id: formData.id,
            input: {
              nama: formData.nama.trim(),
              jenjang: formData.jenjang as JenjangPendidikan,
              aktif: formData.aktif,
              lahir: formData.lahir,
              kelamin: formData.kelamin as any,
              asal: formData.asal.trim(),
              waliNama: formData.waliNama.trim(),
              waliWa: formData.waliWa.trim(),
              bergabung: formData.bergabung,
              catatan: formData.catatan.trim(),
            },
          });
          showToast({
            type: 'success',
            message: `Data siswa “${updated.nama}” berhasil disimpan.`,
          });
        }
      } catch (err: any) {
        showToast({
          type: 'error',
          message: err.message || 'Gagal menyimpan siswa.',
        });
      }
    },
    [createSiswaMutation, updateSiswaMutation, showToast]
  );

  // Deactivate handler
  const handleMintaNonaktif = useCallback((sw: Siswa) => {
    setDialogState({
      isOpen: true,
      type: 'nonaktif',
      student: sw,
    });
  }, []);

  // Reactivate directly
  const handleAktifkanKembali = useCallback(
    async (sw: Siswa) => {
      try {
        await updateSiswaMutation.mutateAsync({
          id: sw.id,
          input: { aktif: true },
        });
        showToast({
          type: 'success',
          message: `Siswa “${sw.nama}” diaktifkan kembali.`,
        });
      } catch (err: any) {
        showToast({
          type: 'error',
          message: err.message || 'Gagal mengaktifkan siswa.',
        });
      }
    },
    [updateSiswaMutation, showToast]
  );

  // Delete handler
  const handleMintaHapus = useCallback((sw: Siswa) => {
    setDialogState({
      isOpen: true,
      type: 'hapus',
      student: sw,
    });
  }, []);

  // Confirm Dialog Action
  const handleConfirmDialog = useCallback(async () => {
    const sw = dialogState.student;
    if (!sw) return;

    if (dialogState.type === 'nonaktif') {
      try {
        await updateSiswaMutation.mutateAsync({
          id: sw.id,
          input: { aktif: false },
        });
        setDialogState({ isOpen: false, type: null, student: null });
        showToast({
          type: 'info',
          message: `Siswa “${sw.nama}” dinonaktifkan.`,
          action: {
            label: 'Urungkan',
            onClick: () => {
              updateSiswaMutation.mutate({
                id: sw.id,
                input: { aktif: true },
              });
              showToast({
                type: 'success',
                message: `Siswa “${sw.nama}” diaktifkan kembali.`,
              });
            },
          },
        });
      } catch (err: any) {
        showToast({
          type: 'error',
          message: err.message || 'Gagal menonaktifkan siswa.',
        });
      }
    } else if (dialogState.type === 'hapus') {
      try {
        await deleteSiswaMutation.mutateAsync(sw.id);
        setDialogState({ isOpen: false, type: null, student: null });
        handleClosePanel();
        showToast({
          type: 'success',
          message: `Siswa “${sw.nama}” berhasil dihapus permanen.`,
        });
      } catch (err: any) {
        showToast({
          type: 'error',
          message: err.message || 'Gagal menghapus siswa.',
        });
      }
    }
  }, [dialogState, updateSiswaMutation, deleteSiswaMutation, handleClosePanel, showToast]);

  // Class membership change
  const handleUbahKelas = useCallback(
    async (targetKelasId: string, studentId: string, tambah: boolean) => {
      const sw = allSiswa.find((s) => s.id === studentId);
      const k = kelasList.find((kl) => kl.id === targetKelasId);
      const sName = sw ? sw.nama : 'Siswa';
      const kName = k ? k.nama : 'kelas';

      try {
        await ubahAnggotaKelasMutation.mutateAsync({
          kelasId: targetKelasId,
          siswaId: studentId,
          tambah,
        });

        if (tambah) {
          showToast({
            type: 'success',
            message: `${sName} dimasukkan ke ${kName}.`,
          });
        } else {
          showToast({
            type: 'info',
            message: `${sName} dikeluarkan dari ${kName}. Kegiatan yang sudah mengimpor kelas ini tidak berubah.`,
          });
        }
      } catch (err: any) {
        showToast({
          type: 'error',
          message: err.message || 'Gagal mengubah keanggotaan kelas.',
        });
      }
    },
    [allSiswa, kelasList, ubahAnggotaKelasMutation, showToast]
  );

  // Navigate to daftar kegiatan with search
  const handleLihatKegiatan = useCallback(
    (namaSiswa: string) => {
      navigate(`/kegiatan?cari=${encodeURIComponent(namaSiswa)}`);
    },
    [navigate]
  );

  // Global Ctrl+N shortcut for Siswa
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleOpenNewSiswa();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleOpenNewSiswa]);

  // If in Profil Siswa mode
  if (profilId) {
    if (isLoadingProfil || !profilData) {
      return <ProfilSiswaSkeleton />;
    }
    return (
      <ProfilSiswaView
        profil={profilData}
        onBack={() => {
          if (routeId) {
            navigate('/master/siswa');
          } else {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('profil');
            nextParams.delete('id');
            setSearchParams(nextParams);
          }
        }}
        onEdit={(id) => {
          if (routeId) {
            navigate(`/master/siswa?edit=${id}`);
          } else {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('profil');
            nextParams.delete('id');
            nextParams.set('edit', id);
            setSearchParams(nextParams);
            setSelectedStudentId(id);
            setIsPanelOpen(true);
          }
        }}
        onCetak={() => {
          showToast({
            type: 'info',
            message: 'Cetak rapor menyusul di tahap berikutnya.',
          });
        }}
        onJadwalkanSusulan={() => {
          dispatchBandrekEvent(BANDREK_EVENTS.NEW_KEGIATAN);
        }}
      />
    );
  }

  // Full page Siswa Skeleton during initial page loading
  if (isLoadingSiswa || isLoadingAllSiswa || isLoadingKelas) {
    return <SiswaSkeleton />;
  }

  // Master Siswa Screen: Table View + Side Panel
  return (
    <div className="flex flex-1 min-h-0 bg-(--color-surface)">
      {/* Left Column: Table View */}
      <div className="flex flex-1 min-w-0 flex-col border-r border-(--color-border)">
        <SiswaToolbar
          totalAktif={totalAktif}
          totalNonaktif={totalNonaktif}
          cari={cari}
          onCariChange={setCari}
          jenjang={jenjang}
          onJenjangChange={setJenjang}
          kelasId={kelasId}
          onKelasChange={setKelasId}
          kelasList={kelasList}
          status={status}
          onStatusChange={setStatus}
          adaFilter={adaFilter}
          onResetFilter={handleResetFilter}
          onSiswaBaru={handleOpenNewSiswa}
        />

        {isLoadingSiswa ? (
          <MasterTableSkeleton
            rowCount={10}
            minWidth="min-w-[862px]"
            columns={[
              { width: 'w-59', headerTitle: 'NAMA' },
              { width: 'w-11', headerTitle: 'JNJ' },
              { width: 'w-23.5', headerTitle: 'LAHIR', align: 'right' },
              { width: 'flex-1 min-w-27.5', isFlex: true, headerTitle: 'ASAL SEKOLAH' },
              { width: 'w-29.5', headerTitle: 'WALI' },
              { width: 'w-29.5', headerTitle: 'WHATSAPP' },
              { width: 'w-10', headerTitle: 'KEG', align: 'right' },
              { width: 'w-18.5', headerTitle: 'STATUS' },
            ]}
          />
        ) : siswaList.length > 0 ? (
          <SiswaTable
            siswaList={siswaList}
            selectedId={isPanelOpen ? selectedStudentId : null}
            desc={desc}
            onToggleSort={() => setDesc((prev) => !prev)}
            onSelectSiswa={handleSelectSiswa}
            onOpenProfil={(id) => {
              const nextParams = new URLSearchParams(searchParams);
              nextParams.set('profil', id);
              setSearchParams(nextParams);
            }}
            totalDb={allSiswa.length}
            filterAktifOnly={status === 'aktif'}
          />
        ) : (
          <SiswaEmptyState
            adaFilter={adaFilter}
            cari={cari}
            totalDb={allSiswa.length}
            status={status}
            onTampilkanSemuaStatus={() => setStatus('semua')}
            onResetFilter={handleResetFilter}
            onSiswaBaru={handleOpenNewSiswa}
          />
        )}
      </div>

      {/* Right Column: Side Panel Form */}
      {isPanelOpen && (
        <SiswaFormPanel
          isOpen={isPanelOpen}
          initialData={selectedStudent}
          allSiswa={allSiswa}
          kelasList={kelasList}
          onClose={handleClosePanel}
          onSave={handleSaveForm}
          onMintaNonaktif={handleMintaNonaktif}
          onAktifkanKembali={handleAktifkanKembali}
          onMintaHapus={handleMintaHapus}
          onUbahKelas={handleUbahKelas}
          onLihatKegiatan={handleLihatKegiatan}
        />
      )}

      {/* Delete / Deactivate Confirm Dialog */}
      <SiswaConfirmModal
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        siswa={dialogState.student}
        onClose={() => setDialogState({ isOpen: false, type: null, student: null })}
        onConfirm={handleConfirmDialog}
      />
    </div>
  );
}
