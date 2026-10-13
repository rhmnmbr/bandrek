import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import type { JenisKegiatan } from '@/data/types/master';
import {
  useJenisKegiatanList,
  useCreateJenisKegiatan,
  useUpdateJenisKegiatan,
  useDeleteJenisKegiatan,
} from '@/data/hooks/useMaster';
import { useToast } from '@/components/ui/toast';
import { JenisToolbar } from '@/components/master/jenis/JenisToolbar';
import { JenisTable } from '@/components/master/jenis/JenisTable';
import { JenisEmptyState } from '@/components/master/jenis/JenisEmptyState';
import {
  JenisFormView,
  type JenisKegiatanFormData,
} from '@/components/master/jenis/JenisFormView';
import { JenisConfirmModal } from '@/components/master/jenis/JenisConfirmModal';
import { JenisKegiatanSkeleton } from '@/components/skeleton';

export function JenisKegiatanScreen() {
  const { id: routeId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isBaruMode = searchParams.get('baru') === '1';

  // Filters
  const [cari, setCari] = useState('');

  // Dialog State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Queries
  const { data: allJenis = [], isLoading: isLoadingAllJenis } = useJenisKegiatanList();
  const { data: filteredJenis = [] } = useJenisKegiatanList({
    q: cari,
  });

  // Selected Jenis
  const selectedJenis = useMemo(() => {
    if (isBaruMode) return null;
    if (routeId) {
      return allJenis.find((j) => j.id === routeId) || null;
    }
    if (filteredJenis.length > 0) {
      return filteredJenis[0];
    }
    return null;
  }, [allJenis, filteredJenis, routeId, isBaruMode]);

  const selectedJenisId = selectedJenis?.id || '';

  // Mutations
  const createMutation = useCreateJenisKegiatan();
  const updateMutation = useUpdateJenisKegiatan();
  const deleteMutation = useDeleteJenisKegiatan();

  // Metrics
  const totalJenis = allJenis.length;
  const adaFilter = Boolean(cari);

  // Auto-redirect if routeId invalid or default first item
  useEffect(() => {
    if (!isBaruMode && !routeId && filteredJenis.length > 0) {
      navigate(`/master/jenis/${filteredJenis[0].id}`, { replace: true });
    }
  }, [isBaruMode, routeId, filteredJenis, navigate]);

  // Handlers
  const handleSelectJenis = useCallback(
    (id: string) => {
      navigate(`/master/jenis/${id}`);
    },
    [navigate]
  );

  const handleNewJenis = useCallback(() => {
    navigate('/master/jenis?baru=1');
  }, [navigate]);

  const handleResetFilter = useCallback(() => {
    setCari('');
  }, []);

  const handleCancel = useCallback(() => {
    if (isBaruMode) {
      if (filteredJenis.length > 0) {
        navigate(`/master/jenis/${filteredJenis[0].id}`);
      } else {
        navigate('/master/jenis');
      }
    }
  }, [isBaruMode, filteredJenis, navigate]);

  // Save Jenis
  const handleSave = useCallback(
    async (formData: JenisKegiatanFormData) => {
      try {
        if (!formData.id) {
          const created = await createMutation.mutateAsync({
            nama: formData.nama.trim(),
            warna: formData.warna,
            materiWajib: formData.materiWajib,
            siswaWajib: formData.siswaWajib,
          });
          showToast({
            type: 'success',
            message: `${created.nama} ditambahkan sebagai jenis kegiatan.`,
          });
          navigate(`/master/jenis/${created.id}`);
        } else {
          await updateMutation.mutateAsync({
            id: formData.id,
            input: {
              nama: formData.nama.trim(),
              warna: formData.warna,
              materiWajib: formData.materiWajib,
              siswaWajib: formData.siswaWajib,
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
          message: err?.message || 'Gagal menyimpan jenis kegiatan.',
        });
      }
    },
    [createMutation, updateMutation, showToast, navigate]
  );

  // Toggle Materi Wajib directly from table
  const handleToggleMateriWajib = useCallback(
    async (item: JenisKegiatan) => {
      const nextVal = !item.materiWajib;
      try {
        await updateMutation.mutateAsync({
          id: item.id,
          input: { materiWajib: nextVal },
        });
        showToast({
          type: 'success',
          message: `Mata pelajaran & materi diatur ${nextVal ? 'wajib' : 'opsional'} untuk ${
            item.nama
          }.`,
          action: {
            label: 'Urungkan',
            onClick: () => {
              updateMutation.mutate({
                id: item.id,
                input: { materiWajib: item.materiWajib },
              });
            },
          },
        });
      } catch {
        showToast({ type: 'error', message: 'Gagal mengubah pengaturan materi.' });
      }
    },
    [updateMutation, showToast]
  );

  // Toggle Siswa Wajib directly from table
  const handleToggleSiswaWajib = useCallback(
    async (item: JenisKegiatan) => {
      const nextVal = !item.siswaWajib;
      try {
        await updateMutation.mutateAsync({
          id: item.id,
          input: { siswaWajib: nextVal },
        });
        showToast({
          type: 'success',
          message: `Siswa peserta diatur ${nextVal ? 'wajib' : 'opsional'} untuk ${item.nama}.`,
          action: {
            label: 'Urungkan',
            onClick: () => {
              updateMutation.mutate({
                id: item.id,
                input: { siswaWajib: item.siswaWajib },
              });
            },
          },
        });
      } catch {
        showToast({ type: 'error', message: 'Gagal mengubah pengaturan siswa.' });
      }
    },
    [updateMutation, showToast]
  );

  // Confirm Delete
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedJenis) return;
    const itemToDelete = selectedJenis;

    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
      setDeleteModalOpen(false);
      showToast({
        type: 'success',
        message: `${itemToDelete.nama} dihapus.`,
        action: {
          label: 'Urungkan',
          onClick: async () => {
            await createMutation.mutateAsync({
              nama: itemToDelete.nama,
              warna: itemToDelete.warna,
              materiWajib: itemToDelete.materiWajib,
              siswaWajib: itemToDelete.siswaWajib,
            });
          },
        },
      });
      navigate('/master/jenis');
    } catch {
      showToast({ type: 'error', message: 'Gagal menghapus jenis kegiatan.' });
    }
  }, [selectedJenis, deleteMutation, createMutation, showToast, navigate]);

  const handleViewKegiatan = useCallback(
    (jenisId: string) => {
      navigate(`/kegiatan?jenis=${jenisId}`);
    },
    [navigate]
  );

  // Keyboard shortcut Ctrl+N
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewJenis();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewJenis]);

  if (isLoadingAllJenis) {
    return <JenisKegiatanSkeleton />;
  }

  return (
    <div className="flex h-full w-full flex-row overflow-hidden bg-(--color-surface)">
      {/* Left Column (flex-1 wide table) */}
      <div className="flex flex-1 min-w-0 min-h-0 flex-col border-r border-(--color-border) bg-(--color-surface)">
        <JenisToolbar
          totalJenis={totalJenis}
          cari={cari}
          onCariChange={setCari}
          adaFilter={adaFilter}
          onResetFilter={handleResetFilter}
          onJenisBaru={handleNewJenis}
        />

        {filteredJenis.length > 0 ? (
          <JenisTable
            jenisList={filteredJenis}
            selectedId={selectedJenisId}
            onSelectJenis={handleSelectJenis}
            totalDb={totalJenis}
            onToggleMateriWajib={handleToggleMateriWajib}
            onToggleSiswaWajib={handleToggleSiswaWajib}
          />
        ) : (
          <JenisEmptyState
            isFiltered={adaFilter}
            onResetFilter={handleResetFilter}
            onNewJenis={handleNewJenis}
          />
        )}
      </div>

      {/* Right Column (352px sidebar form panel) */}
      <div className="flex w-[352px] flex-[0_0_352px] min-w-0 min-h-0 flex-col overflow-hidden bg-(--color-surface-alt)">
        {selectedJenis || isBaruMode ? (
          <JenisFormView
            key={isBaruMode ? 'jenis-baru' : `jenis-${selectedJenis?.id}`}
            jenis={selectedJenis}
            isNewJenis={isBaruMode}
            existingJenis={allJenis}
            onSave={handleSave}
            onDelete={() => setDeleteModalOpen(true)}
            onCancel={handleCancel}
            onViewKegiatan={handleViewKegiatan}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-(--color-text-secondary)">
            <div>
              <div className="text-[22px] text-(--color-text-disabled) mb-2">◇</div>
              <div className="text-[14px] font-semibold text-(--color-text-primary) mb-1">
                Pilih atau buat jenis kegiatan
              </div>
              <div className="text-xs text-(--color-text-muted) max-w-[280px] mx-auto leading-relaxed">
                Pilih jenis kegiatan dari daftar di sebelah kiri untuk mengubah datanya, atau tambah jenis kegiatan baru.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <JenisConfirmModal
        isOpen={deleteModalOpen}
        item={selectedJenis}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
