import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import type { Subjek, PeranSubjek } from '@/data/types/master';
import {
  useSubjekList,
  useSubjekProfil,
  useCreateSubjek,
  useUpdateSubjek,
  useDeleteSubjek,
  useTambahKetersediaanSubjek,
  useUbahKetersediaanSubjek,
  useHapusKetersediaanSubjek,
  useMapelList,
} from '@/data/hooks/useMaster';
import { useToast } from '@/components/ui/toast';
import { SubjekToolbar } from '@/components/master/subjek/SubjekToolbar';
import { SubjekTable } from '@/components/master/subjek/SubjekTable';
import { SubjekEmptyState } from '@/components/master/subjek/SubjekEmptyState';
import { SubjekFormPanel, type SubjekFormData } from '@/components/master/subjek/SubjekFormPanel';
import { SubjekConfirmModal } from '@/components/master/subjek/SubjekConfirmModal';
import { ProfilSubjekView } from '@/components/master/subjek/ProfilSubjekView';

export function SubjekScreen() {
  const { id: routeId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Route / Query logic for Profil
  const queryProfilId = searchParams.get('profil') || searchParams.get('id');
  const profilId = routeId || queryProfilId;

  // Filter states
  const [cari, setCari] = useState('');
  const [peran, setPeran] = useState<PeranSubjek | 'semua'>('semua');
  const [status, setStatus] = useState<'aktif' | 'nonaktif' | 'semua'>('aktif');

  // Panel state
  const editQueryId = searchParams.get('edit');
  const [selectedSubjekId, setSelectedSubjekId] = useState<string | null>(editQueryId || null);
  const [isPanelOpen, setIsPanelOpen] = useState(Boolean(editQueryId));

  // Dialog state
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: 'nonaktif' | 'hapus' | null;
    subjek: Subjek | null;
  }>({
    isOpen: false,
    type: null,
    subjek: null,
  });

  // Queries
  const { data: subjekList = [] } = useSubjekList({
    status,
    peran,
    q: cari,
  });

  const { data: allSubjek = [] } = useSubjekList({ status: 'semua' });
  const { data: mapelList = [] } = useMapelList();
  const { data: profilData } = useSubjekProfil(profilId || '', Boolean(profilId));

  // Mutations
  const createSubjekMutation = useCreateSubjek();
  const updateSubjekMutation = useUpdateSubjek();
  const deleteSubjekMutation = useDeleteSubjek();
  const tambahKetersediaanMutation = useTambahKetersediaanSubjek();
  const ubahKetersediaanMutation = useUbahKetersediaanSubjek();
  const hapusKetersediaanMutation = useHapusKetersediaanSubjek();

  // Active / Inactive counters
  const totalAktif = useMemo(() => allSubjek.filter((s) => s.aktif).length, [allSubjek]);
  const totalNonaktif = allSubjek.length - totalAktif;

  // Selected subject for edit panel
  const selectedSubjek = useMemo(() => {
    if (!selectedSubjekId) return null;
    return allSubjek.find((s) => s.id === selectedSubjekId) || null;
  }, [allSubjek, selectedSubjekId]);

  // Check if any filter is active
  const adaFilter = status !== 'aktif' || peran !== 'semua' || Boolean(cari);

  const handleResetFilter = useCallback(() => {
    setCari('');
    setPeran('semua');
    setStatus('aktif');
  }, []);

  const handleOpenNewSubjek = useCallback(() => {
    setSelectedSubjekId(null);
    setIsPanelOpen(true);
  }, []);

  const handleSelectSubjek = useCallback((id: string) => {
    setSelectedSubjekId(id);
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedSubjekId(null);
    if (searchParams.has('edit')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('edit');
      setSearchParams(nextParams);
    }
  }, [searchParams, setSearchParams]);

  const handleSaveForm = useCallback(
    async (formData: SubjekFormData) => {
      try {
        if (!formData.id) {
          // Create
          const created = await createSubjekMutation.mutateAsync({
            nama: formData.nama.trim(),
            kelamin: formData.kelamin as any,
            peran: formData.peran,
            aktif: formData.aktif,
            mapel: formData.mapel,
            kontak: formData.kontak.trim(),
          });
          showToast({
            type: 'success',
            message: `${created.nama} ditambahkan sebagai subjek.`,
          });
          setSelectedSubjekId(created.id);
        } else {
          // Update
          await updateSubjekMutation.mutateAsync({
            id: formData.id,
            input: {
              nama: formData.nama.trim(),
              kelamin: formData.kelamin as any,
              peran: formData.peran,
              aktif: formData.aktif,
              mapel: formData.mapel,
              kontak: formData.kontak.trim(),
            },
          });
          showToast({
            type: 'success',
            message: 'Perubahan disimpan.',
          });
        }
      } catch (err: any) {
        showToast({
          type: 'error',
          message: err.message || 'Gagal menyimpan subjek.',
        });
      }
    },
    [createSubjekMutation, updateSubjekMutation, showToast]
  );

  // Deactivate handler
  const handleMintaNonaktif = useCallback((sb: Subjek) => {
    setDialogState({
      isOpen: true,
      type: 'nonaktif',
      subjek: sb,
    });
  }, []);

  // Reactivate directly
  const handleAktifkanKembali = useCallback(
    async (sb: Subjek) => {
      try {
        await updateSubjekMutation.mutateAsync({
          id: sb.id,
          input: { aktif: true },
        });
        showToast({
          type: 'success',
          message: `${sb.nama} diaktifkan kembali.`,
          action: {
            label: 'Urungkan',
            onClick: async () => {
              await updateSubjekMutation.mutateAsync({
                id: sb.id,
                input: { aktif: false },
              });
            },
          },
        });
      } catch (err: any) {
        showToast({
          type: 'error',
          message: err.message || 'Gagal mengaktifkan subjek.',
        });
      }
    },
    [updateSubjekMutation, showToast]
  );

  // Delete handler
  const handleMintaHapus = useCallback((sb: Subjek) => {
    setDialogState({
      isOpen: true,
      type: 'hapus',
      subjek: sb,
    });
  }, []);

  // Confirm Dialog Action
  const handleConfirmDialog = useCallback(async () => {
    const sb = dialogState.subjek;
    if (!sb) return;

    if (dialogState.type === 'nonaktif') {
      try {
        await updateSubjekMutation.mutateAsync({
          id: sb.id,
          input: { aktif: false },
        });
        setDialogState({ isOpen: false, type: null, subjek: null });
        showToast({
          type: 'success',
          message: `${sb.nama} dinonaktifkan.`,
          action: {
            label: 'Urungkan',
            onClick: async () => {
              await updateSubjekMutation.mutateAsync({
                id: sb.id,
                input: { aktif: true },
              });
            },
          },
        });
      } catch (err: any) {
        showToast({
          type: 'error',
          message: err.message || 'Gagal menonaktifkan subjek.',
        });
      }
    } else if (dialogState.type === 'hapus') {
      try {
        const result = await deleteSubjekMutation.mutateAsync(sb.id);
        if (!result.bisaDihapus) {
          showToast({
            type: 'error',
            message: result.alasanTidakBisa || 'Subjek tidak dapat dihapus.',
          });
          return;
        }

        setDialogState({ isOpen: false, type: null, subjek: null });
        handleClosePanel();
        showToast({
          type: 'success',
          message: `${sb.nama} dihapus.`,
          action: {
            label: 'Urungkan',
            onClick: async () => {
              await createSubjekMutation.mutateAsync({
                nama: sb.nama,
                kelamin: sb.kelamin,
                peran: sb.peran,
                aktif: sb.aktif,
                mapel: sb.mapel,
                kontak: sb.kontak,
              });
            },
          },
        });
      } catch (err: any) {
        showToast({
          type: 'error',
          message: err.message || 'Gagal menghapus subjek.',
        });
      }
    }
  }, [dialogState, updateSubjekMutation, deleteSubjekMutation, createSubjekMutation, handleClosePanel, showToast]);

  // Profile navigation
  const handleOpenProfil = useCallback(
    (id: string) => {
      navigate(`/master/subjek/${id}`);
    },
    [navigate]
  );

  const handleBackFromProfil = useCallback(() => {
    navigate('/master/subjek');
  }, [navigate]);

  // Keyboard shortcut Ctrl+N
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        const target = e.target as HTMLElement;
        const isInput =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT';
        if (!isInput) {
          e.preventDefault();
          handleOpenNewSubjek();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleOpenNewSubjek]);

  // If in Profil mode, render ProfilSubjekView
  if (profilId && profilData) {
    return (
      <div className="flex flex-1 min-h-0 flex-col bg-(--color-surface)">
        <ProfilSubjekView
          profil={profilData}
          onBack={handleBackFromProfil}
          onUbahData={() => {
            navigate(`/master/subjek?edit=${profilId}`);
          }}
          onLihatKalender={() => {
            navigate(`/kalender?subjek=${profilId}`);
          }}
          onBukaKegiatan={(kId) => {
            navigate(`/kegiatan/${kId}`);
          }}
          onBukaRealisasi={(kId) => {
            navigate(`/kegiatan/${kId}/realisasi`);
          }}
          onTambahKetersediaan={(item) => {
            tambahKetersediaanMutation.mutate({ id: profilId, item });
          }}
          onUbahKetersediaan={(index, patch) => {
            ubahKetersediaanMutation.mutate({ id: profilId, index, patch });
          }}
          onHapusKetersediaan={(index) => {
            hapusKetersediaanMutation.mutate({ id: profilId, index });
          }}
          onToggleAktif={() => {
            if (profilData.subjek.aktif) {
              handleMintaNonaktif(profilData.subjek);
            } else {
              handleAktifkanKembali(profilData.subjek);
            }
          }}
        />

        {/* Confirmation Modal */}
        <SubjekConfirmModal
          isOpen={dialogState.isOpen}
          type={dialogState.type}
          subjek={dialogState.subjek}
          onClose={() => setDialogState({ isOpen: false, type: null, subjek: null })}
          onConfirm={handleConfirmDialog}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-(--color-surface)">
      {/* Master Toolbar */}
      <SubjekToolbar
        totalAktif={totalAktif}
        totalNonaktif={totalNonaktif}
        cari={cari}
        onCariChange={setCari}
        peran={peran}
        onPeranChange={setPeran}
        status={status}
        onStatusChange={setStatus}
        adaFilter={adaFilter}
        onResetFilter={handleResetFilter}
        onSubjekBaru={handleOpenNewSubjek}
      />

      {/* Main Content: Table + Side Panel */}
      <div className="flex flex-1 min-h-0 bg-(--color-surface)">
        {/* Table View */}
        <div className="flex-1 min-w-0 flex flex-col">
          {subjekList.length > 0 ? (
            <SubjekTable
              subjekList={subjekList}
              selectedId={selectedSubjekId}
              mapelList={mapelList}
              onSelectSubjek={handleSelectSubjek}
              onOpenProfil={handleOpenProfil}
              totalDb={allSubjek.length}
              filterAktifOnly={status === 'aktif'}
            />
          ) : (
            <SubjekEmptyState
              adaFilter={adaFilter}
              cari={cari}
              totalDb={allSubjek.length}
              status={status}
              onTampilkanSemuaStatus={() => setStatus('semua')}
              onResetFilter={handleResetFilter}
              onSubjekBaru={handleOpenNewSubjek}
            />
          )}
        </div>

        {/* Side Panel Form */}
        <SubjekFormPanel
          isOpen={isPanelOpen}
          initialData={selectedSubjek}
          allSubjek={allSubjek}
          mapelList={mapelList}
          onClose={handleClosePanel}
          onSave={handleSaveForm}
          onMintaNonaktif={handleMintaNonaktif}
          onAktifkanKembali={handleAktifkanKembali}
          onMintaHapus={handleMintaHapus}
          onLihatKegiatan={(id) => navigate(`/kegiatan?subjek=${id}`)}
        />
      </div>

      {/* Confirmation Modal */}
      <SubjekConfirmModal
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        subjek={dialogState.subjek}
        onClose={() => setDialogState({ isOpen: false, type: null, subjek: null })}
        onConfirm={handleConfirmDialog}
      />
    </div>
  );
}
