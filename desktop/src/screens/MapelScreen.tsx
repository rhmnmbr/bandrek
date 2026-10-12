import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import type { MataPelajaran, Materi } from '@/data/types/master';
import {
  useMapelList,
  useMateriList,
  useCreateMapel,
  useUpdateMapel,
  useDeleteMapel,
  useCreateMateri,
  useUpdateMateri,
  useDeleteMateri,
  useReorderMateri,
} from '@/data/hooks/useMaster';
import { useToast } from '@/components/ui/toast';
import { MapelToolbar } from '@/components/master/mapel/MapelToolbar';
import { MapelTable } from '@/components/master/mapel/MapelTable';
import { MapelEmptyState } from '@/components/master/mapel/MapelEmptyState';
import {
  MapelFormView,
  type MapelFormData,
  type MateriFormData,
} from '@/components/master/mapel/MapelFormView';
import { MapelConfirmModal } from '@/components/master/mapel/MapelConfirmModal';
import { MasterTableSkeleton, FormPanelSkeleton, MapelSkeleton } from '@/components/skeleton';

export function MapelScreen() {
  const { id: routeId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isBaruMode = searchParams.get('baru') === '1';
  const isNewMateri = searchParams.get('materiBaru') === '1';
  const selectedMateriId = searchParams.get('materi');

  // Filters
  const [cari, setCari] = useState('');
  const [status, setStatus] = useState<'aktif' | 'nonaktif' | 'semua'>('aktif');

  // Dialog State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: 'nonaktif' | 'hapus' | null;
    targetType: 'mapel' | 'materi';
    item: MataPelajaran | Materi | null;
  }>({
    isOpen: false,
    type: null,
    targetType: 'mapel',
    item: null,
  });

  // Queries
  const { data: allMapel = [], isLoading: isLoadingAllMapel } = useMapelList();
  const { data: filteredMapel = [], isLoading: isLoadingFilteredMapel } = useMapelList({
    status,
    q: cari,
  });

  // Selected Mapel
  const selectedMapel = useMemo(() => {
    if (isBaruMode) return null;
    if (routeId) {
      return allMapel.find((m) => m.id === routeId) || null;
    }
    if (filteredMapel.length > 0) {
      return filteredMapel[0];
    }
    return null;
  }, [allMapel, filteredMapel, routeId, isBaruMode]);

  const selectedMapelId = selectedMapel?.id || '';

  // Materi list for selected Mapel
  const {
    data: materiList = [],
    isLoading: isLoadingMateri,
    isFetching: isFetchingMateri,
  } = useMateriList(selectedMapelId, Boolean(selectedMapelId));

  const isMateriLoading = isLoadingMateri || (isFetchingMateri && materiList.length === 0);

  // Active Materi
  const activeMateri = useMemo(() => {
    if (!selectedMateriId) return null;
    return materiList.find((t) => t.id === selectedMateriId) || null;
  }, [materiList, selectedMateriId]);

  // Mutations
  const createMapelMutation = useCreateMapel();
  const updateMapelMutation = useUpdateMapel();
  const deleteMapelMutation = useDeleteMapel();
  const createMateriMutation = useCreateMateri();
  const updateMateriMutation = useUpdateMateri();
  const deleteMateriMutation = useDeleteMateri();
  const reorderMateriMutation = useReorderMateri();

  // Metrics
  const totalMapel = allMapel.length;
  const totalAktif = useMemo(() => allMapel.filter((m) => m.aktif).length, [allMapel]);
  const adaFilter = status !== 'aktif' || Boolean(cari);

  // Auto-redirect if routeId invalid or default first item
  useEffect(() => {
    if (!isBaruMode && !routeId && filteredMapel.length > 0) {
      navigate(`/master/mapel/${filteredMapel[0].id}`, { replace: true });
    }
  }, [isBaruMode, routeId, filteredMapel, navigate]);

  // Handlers
  const handleSelectMapel = useCallback(
    (id: string) => {
      navigate(`/master/mapel/${id}`);
    },
    [navigate]
  );

  const handleNewMapel = useCallback(() => {
    navigate('/master/mapel?baru=1');
  }, [navigate]);

  const handleResetFilter = useCallback(() => {
    setCari('');
    setStatus('aktif');
  }, []);

  const handleCancel = useCallback(() => {
    if (isBaruMode) {
      if (filteredMapel.length > 0) {
        navigate(`/master/mapel/${filteredMapel[0].id}`);
      } else {
        navigate('/master/mapel');
      }
    }
  }, [isBaruMode, filteredMapel, navigate]);

  const handleNewMateri = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('materi');
    next.set('materiBaru', '1');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const handleSelectMateri = useCallback(
    (materi: Materi) => {
      const next = new URLSearchParams(searchParams);
      next.delete('materiBaru');
      next.set('materi', materi.id);
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const handleBackToMapel = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('materi');
    next.delete('materiBaru');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  // Save Mapel
  const handleSaveMapel = useCallback(
    async (formData: MapelFormData) => {
      try {
        if (!formData.id) {
          const created = await createMapelMutation.mutateAsync({
            nama: formData.nama.trim(),
            aktif: formData.aktif,
          });
          showToast({
            type: 'success',
            message: `${created.nama} ditambahkan sebagai mata pelajaran.`,
          });
          navigate(`/master/mapel/${created.id}`);
        } else {
          await updateMapelMutation.mutateAsync({
            id: formData.id,
            input: {
              nama: formData.nama.trim(),
              aktif: formData.aktif,
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
          message: err?.message || 'Gagal menyimpan mata pelajaran.',
        });
      }
    },
    [createMapelMutation, updateMapelMutation, showToast, navigate]
  );

  // Toggle Aktif Mapel
  const handleToggleAktifMapel = useCallback(() => {
    if (!selectedMapel) return;
    if (selectedMapel.aktif) {
      setDialogState({
        isOpen: true,
        type: 'nonaktif',
        targetType: 'mapel',
        item: selectedMapel,
      });
    } else {
      updateMapelMutation.mutate(
        { id: selectedMapel.id, input: { aktif: true } },
        {
          onSuccess: () => {
            showToast({
              type: 'success',
              message: `${selectedMapel.nama} diaktifkan kembali.`,
              action: {
                label: 'Urungkan',
                onClick: () => {
                  updateMapelMutation.mutate({
                    id: selectedMapel.id,
                    input: { aktif: false },
                  });
                },
              },
            });
          },
        }
      );
    }
  }, [selectedMapel, updateMapelMutation, showToast]);

  // Save Materi
  const handleSaveMateri = useCallback(
    async (formData: MateriFormData) => {
      try {
        if (!formData.id) {
          const created = await createMateriMutation.mutateAsync({
            mapel: formData.mapel,
            nama: formData.nama.trim(),
            aktif: formData.aktif,
          });
          showToast({
            type: 'success',
            message: `${created.nama} ditambahkan sebagai materi.`,
          });
          handleSelectMateri(created);
        } else {
          await updateMateriMutation.mutateAsync({
            id: formData.id,
            input: {
              nama: formData.nama.trim(),
              aktif: formData.aktif,
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
          message: err?.message || 'Gagal menyimpan materi.',
        });
      }
    },
    [createMateriMutation, updateMateriMutation, showToast, handleSelectMateri]
  );

  // Toggle Aktif Materi
  const handleToggleAktifMateri = useCallback(
    (materi: Materi) => {
      if (materi.aktif) {
        setDialogState({
          isOpen: true,
          type: 'nonaktif',
          targetType: 'materi',
          item: materi,
        });
      } else {
        updateMateriMutation.mutate(
          { id: materi.id, input: { aktif: true } },
          {
            onSuccess: () => {
              showToast({
                type: 'success',
                message: `${materi.nama} diaktifkan kembali.`,
                action: {
                  label: 'Urungkan',
                  onClick: () => {
                    updateMateriMutation.mutate({
                      id: materi.id,
                      input: { aktif: false },
                    });
                  },
                },
              });
            },
          }
        );
      }
    },
    [updateMateriMutation, showToast]
  );

  // Reorder Materi
  const handleReorderMateri = useCallback(
    async (orderedIds: string[]) => {
      if (!selectedMapel) return;
      try {
        await reorderMateriMutation.mutateAsync({
          mapelId: selectedMapel.id,
          orderedIds,
        });
      } catch {
        showToast({
          type: 'error',
          message: 'Gagal mengubah urutan materi.',
        });
      }
    },
    [selectedMapel, reorderMateriMutation, showToast]
  );

  // Confirm Dialog (Deactivate / Delete)
  const handleConfirmDialog = useCallback(async () => {
    const { type, targetType, item } = dialogState;
    if (!item || !type) return;

    if (targetType === 'mapel') {
      const mapelItem = item as MataPelajaran;
      if (type === 'nonaktif') {
        try {
          await updateMapelMutation.mutateAsync({
            id: mapelItem.id,
            input: { aktif: false },
          });
          setDialogState({ isOpen: false, type: null, targetType: 'mapel', item: null });
          showToast({
            type: 'success',
            message: `${mapelItem.nama} dinonaktifkan.`,
            action: {
              label: 'Urungkan',
              onClick: () => {
                updateMapelMutation.mutate({
                  id: mapelItem.id,
                  input: { aktif: true },
                });
              },
            },
          });
        } catch {
          showToast({ type: 'error', message: 'Gagal menonaktifkan mata pelajaran.' });
        }
      } else {
        try {
          await deleteMapelMutation.mutateAsync(mapelItem.id);
          setDialogState({ isOpen: false, type: null, targetType: 'mapel', item: null });
          showToast({
            type: 'success',
            message: `${mapelItem.nama} dihapus.`,
            action: {
              label: 'Urungkan',
              onClick: async () => {
                await createMapelMutation.mutateAsync({
                  nama: mapelItem.nama,
                  aktif: mapelItem.aktif,
                });
              },
            },
          });
          navigate('/master/mapel');
        } catch {
          showToast({ type: 'error', message: 'Gagal menghapus mata pelajaran.' });
        }
      }
    } else {
      // Materi
      const materiItem = item as Materi;
      if (type === 'nonaktif') {
        try {
          await updateMateriMutation.mutateAsync({
            id: materiItem.id,
            input: { aktif: false },
          });
          setDialogState({ isOpen: false, type: null, targetType: 'materi', item: null });
          showToast({
            type: 'success',
            message: `${materiItem.nama} dinonaktifkan.`,
            action: {
              label: 'Urungkan',
              onClick: () => {
                updateMateriMutation.mutate({
                  id: materiItem.id,
                  input: { aktif: true },
                });
              },
            },
          });
        } catch {
          showToast({ type: 'error', message: 'Gagal menonaktifkan materi.' });
        }
      } else {
        try {
          await deleteMateriMutation.mutateAsync(materiItem.id);
          setDialogState({ isOpen: false, type: null, targetType: 'materi', item: null });
          showToast({
            type: 'success',
            message: `${materiItem.nama} dihapus.`,
            action: {
              label: 'Urungkan',
              onClick: async () => {
                await createMateriMutation.mutateAsync({
                  mapel: materiItem.mapel,
                  nama: materiItem.nama,
                  aktif: materiItem.aktif,
                });
              },
            },
          });
          handleBackToMapel();
        } catch {
          showToast({ type: 'error', message: 'Gagal menghapus materi.' });
        }
      }
    }
  }, [
    dialogState,
    updateMapelMutation,
    deleteMapelMutation,
    createMapelMutation,
    updateMateriMutation,
    deleteMateriMutation,
    createMateriMutation,
    showToast,
    navigate,
    handleBackToMapel,
  ]);

  const handleViewKegiatan = useCallback(
    (mapelId: string) => {
      navigate(`/kegiatan?mapel=${mapelId}`);
    },
    [navigate]
  );

  // Keyboard shortcut Ctrl+N
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (selectedMateriId || isNewMateri) {
          handleNewMateri();
        } else {
          handleNewMapel();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMateriId, isNewMateri, handleNewMateri, handleNewMapel]);

  // Full page Mapel Skeleton during initial page loading
  if (isLoadingAllMapel || isLoadingFilteredMapel) {
    return <MapelSkeleton />;
  }

  return (
    <div className="flex h-full w-full flex-row overflow-hidden bg-(--color-surface)">
      {/* Left Column (288px) */}
      <div className="flex flex-col w-[288px] flex-[0_0_288px] min-w-0 border-r border-(--color-border) bg-(--color-surface)">
        <MapelToolbar
          totalMapel={totalMapel}
          totalAktif={totalAktif}
          cari={cari}
          onCariChange={setCari}
          status={status}
          onStatusChange={setStatus}
          adaFilter={adaFilter}
          onResetFilter={handleResetFilter}
          onMapelBaru={handleNewMapel}
        />

        {isLoadingFilteredMapel ? (
          <MasterTableSkeleton
            rowCount={8}
            columns={[
              { width: 'flex-1 min-w-[150px]', isFlex: true, headerTitle: 'MATA PELAJARAN' },
              { width: 'w-[74px]', headerTitle: 'MATERI', align: 'right' },
            ]}
          />
        ) : filteredMapel.length > 0 ? (
          <MapelTable
            mapelList={filteredMapel}
            selectedId={selectedMapelId}
            onSelectMapel={handleSelectMapel}
            totalDb={totalMapel}
          />
        ) : (
          <MapelEmptyState
            isFiltered={adaFilter}
            onResetFilter={handleResetFilter}
            onNewMapel={handleNewMapel}
          />
        )}
      </div>

      {/* Right Column (flex-1) */}
      <div className="flex flex-1 min-w-0 min-h-0 flex-col overflow-hidden bg-(--color-surface)">
        {isLoadingAllMapel || isLoadingFilteredMapel ? (
          <FormPanelSkeleton title="Memuat detail mata pelajaran..." />
        ) : selectedMapel || isBaruMode ? (
          <MapelFormView
            key={
              isNewMateri
                ? 'materi-baru'
                : activeMateri
                ? `materi-${activeMateri.id}`
                : isBaruMode
                ? 'mapel-baru'
                : `mapel-${selectedMapel?.id}`
            }
            mapel={selectedMapel}
            isNewMapel={isBaruMode}
            activeMateri={activeMateri}
            isNewMateri={isNewMateri}
            existingMapel={allMapel}
            materiList={materiList}
            isLoadingMateri={isMateriLoading}
            onSaveMapel={handleSaveMapel}
            onDeleteMapel={() =>
              setDialogState({
                isOpen: true,
                type: 'hapus',
                targetType: 'mapel',
                item: selectedMapel,
              })
            }
            onToggleAktifMapel={handleToggleAktifMapel}
            onSaveMateri={handleSaveMateri}
            onDeleteMateri={(m) =>
              setDialogState({
                isOpen: true,
                type: 'hapus',
                targetType: 'materi',
                item: m,
              })
            }
            onToggleAktifMateri={handleToggleAktifMateri}
            onReorderMateri={handleReorderMateri}
            onNewMateri={handleNewMateri}
            onSelectMateri={handleSelectMateri}
            onBackToMapel={handleBackToMapel}
            onCancel={handleCancel}
            onViewKegiatan={handleViewKegiatan}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-(--color-text-secondary)">
            <div>
              <div className="text-[22px] text-(--color-text-disabled) mb-2">◇</div>
              <div className="text-[14px] font-semibold text-(--color-text-primary) mb-1">
                Pilih atau buat mata pelajaran
              </div>
              <div className="text-xs text-(--color-text-muted) max-w-[320px] mx-auto leading-relaxed">
                Pilih mata pelajaran dari daftar di sebelah kiri untuk melihat materi atau mengubahnya, atau buat mata pelajaran baru.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <MapelConfirmModal
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        targetType={dialogState.targetType}
        item={dialogState.item}
        onClose={() =>
          setDialogState({ isOpen: false, type: null, targetType: 'mapel', item: null })
        }
        onConfirm={handleConfirmDialog}
      />
    </div>
  );
}
