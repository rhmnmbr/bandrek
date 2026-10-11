import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import type { Tempat, Ruangan } from '@/data/types/master';
import {
  useTempatList,
  useRuanganByTempat,
  useCreateTempat,
  useUpdateTempat,
  useDeleteTempat,
  useCreateRuangan,
  useUpdateRuangan,
  useDeleteRuangan,
} from '@/data/hooks/useMaster';
import { useToast } from '@/components/ui/toast';
import { TempatToolbar } from '@/components/master/tempat/TempatToolbar';
import { TempatTable } from '@/components/master/tempat/TempatTable';
import { TempatEmptyState } from '@/components/master/tempat/TempatEmptyState';
import {
  TempatFormView,
  type TempatFormData,
  type RuanganFormData,
} from '@/components/master/tempat/TempatFormView';
import { TempatConfirmModal } from '@/components/master/tempat/TempatConfirmModal';
import { MasterTableSkeleton, FormPanelSkeleton, TempatSkeleton } from '@/components/skeleton';

export function TempatScreen() {
  const { id: routeId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isBaruMode = searchParams.get('baru') === '1';
  const isNewRuangan = searchParams.get('ruanganBaru') === '1';
  const selectedRuanganId = searchParams.get('ruangan');

  // Filters
  const [cari, setCari] = useState('');

  // Dialog State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    targetType: 'tempat' | 'ruangan';
    item: Tempat | Ruangan | null;
  }>({
    isOpen: false,
    targetType: 'tempat',
    item: null,
  });

  // Queries
  const { data: allTempat = [], isLoading: isLoadingAllTempat } = useTempatList();
  const { data: filteredTempat = [], isLoading: isLoadingFilteredTempat } = useTempatList({
    q: cari,
  });

  // Selected Tempat
  const selectedTempat = useMemo(() => {
    if (isBaruMode) return null;
    if (routeId) {
      return allTempat.find((t) => t.id === routeId) || null;
    }
    if (filteredTempat.length > 0) {
      return filteredTempat[0];
    }
    return null;
  }, [allTempat, filteredTempat, routeId, isBaruMode]);

  const selectedTempatId = selectedTempat?.id || '';

  // Ruangan list for selected Tempat
  const { data: ruanganList = [] } = useRuanganByTempat(
    selectedTempatId,
    Boolean(selectedTempatId)
  );

  // Active Ruangan
  const activeRuangan = useMemo(() => {
    if (!selectedRuanganId) return null;
    return ruanganList.find((r) => r.id === selectedRuanganId) || null;
  }, [ruanganList, selectedRuanganId]);

  // Mutations
  const createTempatMutation = useCreateTempat();
  const updateTempatMutation = useUpdateTempat();
  const deleteTempatMutation = useDeleteTempat();
  const createRuanganMutation = useCreateRuangan();
  const updateRuanganMutation = useUpdateRuangan();
  const deleteRuanganMutation = useDeleteRuangan();

  // Metrics
  const totalTempat = allTempat.length;
  const totalRuangan = useMemo(
    () => allTempat.reduce((acc, t) => acc + (t.jumlahRuangan || 0), 0),
    [allTempat]
  );
  const adaFilter = Boolean(cari);

  // Auto-redirect if routeId invalid or default first item
  useEffect(() => {
    if (!isBaruMode && !routeId && filteredTempat.length > 0) {
      navigate(`/master/tempat/${filteredTempat[0].id}`, { replace: true });
    }
  }, [isBaruMode, routeId, filteredTempat, navigate]);

  // Handlers
  const handleSelectTempat = useCallback(
    (id: string) => {
      navigate(`/master/tempat/${id}`);
    },
    [navigate]
  );

  const handleNewTempat = useCallback(() => {
    navigate('/master/tempat?baru=1');
  }, [navigate]);

  const handleResetFilter = useCallback(() => {
    setCari('');
  }, []);

  const handleCancel = useCallback(() => {
    if (isBaruMode) {
      if (filteredTempat.length > 0) {
        navigate(`/master/tempat/${filteredTempat[0].id}`);
      } else {
        navigate('/master/tempat');
      }
    }
  }, [isBaruMode, filteredTempat, navigate]);

  const handleNewRuangan = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('ruangan');
    next.set('ruanganBaru', '1');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const handleSelectRuangan = useCallback(
    (ruangan: Ruangan) => {
      const next = new URLSearchParams(searchParams);
      next.delete('ruanganBaru');
      next.set('ruangan', ruangan.id);
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const handleBackToTempat = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('ruangan');
    next.delete('ruanganBaru');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  // Save Tempat
  const handleSaveTempat = useCallback(
    async (formData: TempatFormData) => {
      try {
        if (!formData.id) {
          const created = await createTempatMutation.mutateAsync({
            nama: formData.nama.trim(),
          });
          showToast({
            type: 'success',
            message: `${created.nama} ditambahkan sebagai tempat.`,
          });
          navigate(`/master/tempat/${created.id}`);
        } else {
          await updateTempatMutation.mutateAsync({
            id: formData.id,
            input: {
              nama: formData.nama.trim(),
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
          message: err?.message || 'Gagal menyimpan tempat.',
        });
      }
    },
    [createTempatMutation, updateTempatMutation, showToast, navigate]
  );

  // Save Ruangan
  const handleSaveRuangan = useCallback(
    async (formData: RuanganFormData) => {
      try {
        if (!formData.id) {
          const created = await createRuanganMutation.mutateAsync({
            tempat: formData.tempat,
            nama: formData.nama.trim(),
            kapasitas: formData.kapasitas,
          });
          showToast({
            type: 'success',
            message: `${created.nama} ditambahkan sebagai ruangan.`,
          });
          handleSelectRuangan(created);
        } else {
          await updateRuanganMutation.mutateAsync({
            id: formData.id,
            input: {
              nama: formData.nama.trim(),
              kapasitas: formData.kapasitas,
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
          message: err?.message || 'Gagal menyimpan ruangan.',
        });
      }
    },
    [createRuanganMutation, updateRuanganMutation, showToast, handleSelectRuangan]
  );

  // Confirm Dialog (Delete)
  const handleConfirmDialog = useCallback(async () => {
    const { targetType, item } = dialogState;
    if (!item) return;

    if (targetType === 'tempat') {
      const tempatItem = item as Tempat;
      try {
        await deleteTempatMutation.mutateAsync(tempatItem.id);
        setDialogState({ isOpen: false, targetType: 'tempat', item: null });
        showToast({
          type: 'success',
          message: `${tempatItem.nama} dihapus.`,
          action: {
            label: 'Urungkan',
            onClick: async () => {
              await createTempatMutation.mutateAsync({
                nama: tempatItem.nama,
              });
            },
          },
        });
        navigate('/master/tempat');
      } catch {
        showToast({ type: 'error', message: 'Gagal menghapus tempat.' });
      }
    } else {
      // Ruangan
      const ruanganItem = item as Ruangan;
      try {
        await deleteRuanganMutation.mutateAsync(ruanganItem.id);
        setDialogState({ isOpen: false, targetType: 'ruangan', item: null });
        showToast({
          type: 'success',
          message: `${ruanganItem.nama} dihapus.`,
          action: {
            label: 'Urungkan',
            onClick: async () => {
              await createRuanganMutation.mutateAsync({
                tempat: ruanganItem.tempat,
                nama: ruanganItem.nama,
                kapasitas: ruanganItem.kapasitas,
              });
            },
          },
        });
        handleBackToTempat();
      } catch {
        showToast({ type: 'error', message: 'Gagal menghapus ruangan.' });
      }
    }
  }, [
    dialogState,
    deleteTempatMutation,
    createTempatMutation,
    deleteRuanganMutation,
    createRuanganMutation,
    showToast,
    navigate,
    handleBackToTempat,
  ]);

  const handleViewKegiatan = useCallback(
    (tempatId: string) => {
      navigate(`/kegiatan?tempat=${tempatId}`);
    },
    [navigate]
  );

  // Keyboard shortcut Ctrl+N
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (selectedRuanganId || isNewRuangan) {
          handleNewRuangan();
        } else {
          handleNewTempat();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRuanganId, isNewRuangan, handleNewRuangan, handleNewTempat]);

  // Full page Tempat Skeleton during initial page loading
  if (isLoadingAllTempat || isLoadingFilteredTempat) {
    return <TempatSkeleton />;
  }

  return (
    <div className="flex h-full w-full flex-row overflow-hidden bg-(--color-surface)">
      {/* Left Column (288px) */}
      <div className="flex flex-col w-[288px] flex-[0_0_288px] min-w-0 border-r border-(--color-border) bg-(--color-surface)">
        <TempatToolbar
          totalTempat={totalTempat}
          totalRuangan={totalRuangan}
          cari={cari}
          onCariChange={setCari}
          adaFilter={adaFilter}
          onResetFilter={handleResetFilter}
          onTempatBaru={handleNewTempat}
        />

        {isLoadingFilteredTempat ? (
          <MasterTableSkeleton
            rowCount={8}
            columns={[
              { width: 'flex-1 min-w-[140px]', isFlex: true, headerTitle: 'TEMPAT' },
              { width: 'w-[74px]', headerTitle: 'RUANGAN', align: 'right' },
            ]}
          />
        ) : filteredTempat.length > 0 ? (
          <TempatTable
            tempatList={filteredTempat}
            selectedId={selectedTempatId}
            onSelectTempat={handleSelectTempat}
            totalDb={totalTempat}
          />
        ) : (
          <TempatEmptyState
            isFiltered={adaFilter}
            onResetFilter={handleResetFilter}
            onNewTempat={handleNewTempat}
          />
        )}
      </div>

      {/* Right Column (flex-1) */}
      <div className="flex flex-1 min-w-0 min-h-0 flex-col overflow-hidden bg-(--color-surface)">
        {isLoadingAllTempat || isLoadingFilteredTempat ? (
          <FormPanelSkeleton title="Memuat detail tempat & ruangan..." />
        ) : selectedTempat || isBaruMode ? (
          <TempatFormView
            key={
              isNewRuangan
                ? 'ruangan-baru'
                : activeRuangan
                ? `ruangan-${activeRuangan.id}`
                : isBaruMode
                ? 'tempat-baru'
                : `tempat-${selectedTempat?.id}`
            }
            tempat={selectedTempat}
            isNewTempat={isBaruMode}
            activeRuangan={activeRuangan}
            isNewRuangan={isNewRuangan}
            existingTempat={allTempat}
            ruanganList={ruanganList}
            onSaveTempat={handleSaveTempat}
            onDeleteTempat={() =>
              setDialogState({
                isOpen: true,
                targetType: 'tempat',
                item: selectedTempat,
              })
            }
            onSaveRuangan={handleSaveRuangan}
            onDeleteRuangan={(r) =>
              setDialogState({
                isOpen: true,
                targetType: 'ruangan',
                item: r,
              })
            }
            onNewRuangan={handleNewRuangan}
            onSelectRuangan={handleSelectRuangan}
            onBackToTempat={handleBackToTempat}
            onCancel={handleCancel}
            onViewKegiatan={handleViewKegiatan}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-(--color-text-secondary)">
            <div>
              <div className="text-[22px] text-(--color-text-disabled) mb-2">◇</div>
              <div className="text-[14px] font-semibold text-(--color-text-primary) mb-1">
                Pilih atau buat tempat
              </div>
              <div className="text-xs text-(--color-text-muted) max-w-[320px] mx-auto leading-relaxed">
                Pilih tempat dari daftar di sebelah kiri untuk melihat ruangan atau mengubahnya, atau buat tempat baru.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <TempatConfirmModal
        isOpen={dialogState.isOpen}
        targetType={dialogState.targetType}
        item={dialogState.item}
        onClose={() =>
          setDialogState({ isOpen: false, targetType: 'tempat', item: null })
        }
        onConfirm={handleConfirmDialog}
      />
    </div>
  );
}
