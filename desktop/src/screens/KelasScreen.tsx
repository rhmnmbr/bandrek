import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  useKelasList,
  useCreateKelas,
  useUpdateKelas,
  useDeleteKelas,
  useSiswaList,
} from '@/data/hooks/useMaster';
import { useToast } from '@/components/ui/toast';
import { KelasToolbar } from '@/components/master/kelas/KelasToolbar';
import { KelasTable } from '@/components/master/kelas/KelasTable';
import { KelasEmptyState } from '@/components/master/kelas/KelasEmptyState';
import { KelasFormView, type KelasFormData } from '@/components/master/kelas/KelasFormView';
import { KelasConfirmModal } from '@/components/master/kelas/KelasConfirmModal';
import { PeopleTeam24Regular } from '@fluentui/react-icons';
import { KelasSkeleton } from '@/components/skeleton';
import { useMinimumLoading } from '@/lib/useMinimumLoading';

export function KelasScreen() {
  const { id: routeId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isBaruMode = searchParams.get('baru') === '1';

  // Filters
  const [cari, setCari] = useState('');

  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Queries
  const { data: allKelas = [], isLoading: isLoadingAllKelas } = useKelasList();
  const { data: filteredKelas = [] } = useKelasList({
    q: cari,
  });
  const { data: allSiswa = [] } = useSiswaList({ status: 'semua' });

  // Mutations
  const createMutation = useCreateKelas();
  const updateMutation = useUpdateKelas();
  const deleteMutation = useDeleteKelas();

  // Metrics
  const totalKelas = allKelas.length;
  const totalKeanggotaan = useMemo(() => {
    return allKelas.reduce((sum, k) => sum + (k.anggota?.length || 0), 0);
  }, [allKelas]);

  const adaFilter = Boolean(cari);

  // Selected kelas logic
  const selectedKelas = useMemo(() => {
    if (isBaruMode) return null;
    if (routeId) {
      return allKelas.find((k) => k.id === routeId) || null;
    }
    // Default to first item from filtered list if no route param
    if (filteredKelas.length > 0) {
      return filteredKelas[0];
    }
    return null;
  }, [allKelas, filteredKelas, routeId, isBaruMode]);

  const selectedId = selectedKelas?.id || null;

  // Auto-redirect if routeId invalid or default first item
  useEffect(() => {
    if (!isBaruMode && !routeId && filteredKelas.length > 0) {
      navigate(`/master/kelas/${filteredKelas[0].id}`, { replace: true });
    }
  }, [isBaruMode, routeId, filteredKelas, navigate]);

  // Handlers
  const handleSelectKelas = useCallback(
    (id: string) => {
      if (searchParams.has('baru')) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('baru');
        setSearchParams(nextParams);
      }
      navigate(`/master/kelas/${id}`);
    },
    [navigate, searchParams, setSearchParams]
  );

  const handleNewKelas = useCallback(() => {
    setSearchParams({ baru: '1' });
    navigate('/master/kelas?baru=1');
  }, [navigate, setSearchParams]);

  const handleResetFilter = useCallback(() => {
    setCari('');
  }, []);

  const handleCancel = useCallback(() => {
    if (isBaruMode) {
      if (filteredKelas.length > 0) {
        navigate(`/master/kelas/${filteredKelas[0].id}`);
      } else {
        navigate('/master/kelas');
      }
    }
  }, [isBaruMode, filteredKelas, navigate]);

  const handleSaveForm = useCallback(
    async (formData: KelasFormData) => {
      try {
        if (!formData.id) {
          // Create
          const created = await createMutation.mutateAsync({
            nama: formData.nama.trim(),
            keterangan: formData.keterangan.trim(),
            anggota: formData.anggota,
          });
          showToast({
            type: 'success',
            message: `${created.nama} ditambahkan sebagai kelas.`,
          });
          navigate(`/master/kelas/${created.id}`);
        } else {
          // Update
          await updateMutation.mutateAsync({
            id: formData.id,
            input: {
              nama: formData.nama.trim(),
              keterangan: formData.keterangan.trim(),
              anggota: formData.anggota,
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
          message: err?.message || 'Gagal menyimpan data kelas.',
        });
      }
    },
    [createMutation, updateMutation, showToast, navigate]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedKelas) return;
    const deleted = { ...selectedKelas };
    try {
      await deleteMutation.mutateAsync(selectedKelas.id);
      setIsDeleteModalOpen(false);
      showToast({
        type: 'success',
        message: `${deleted.nama} dihapus.`,
        action: {
          label: 'Urungkan',
          onClick: async () => {
            try {
              const restored = await createMutation.mutateAsync({
                nama: deleted.nama,
                keterangan: deleted.keterangan,
                anggota: deleted.anggota,
              });
              showToast({
                type: 'success',
                message: `${restored.nama} dipulihkan.`,
              });
              navigate(`/master/kelas/${restored.id}`);
            } catch {
              showToast({
                type: 'error',
                message: 'Gagal memulihkan kelas.',
              });
            }
          },
        },
      });
      navigate('/master/kelas');
    } catch (err: any) {
      showToast({
        type: 'error',
        message: err?.message || 'Gagal menghapus data kelas.',
      });
    }
  }, [selectedKelas, deleteMutation, createMutation, showToast, navigate]);

  const handleViewKegiatan = useCallback(
    (kelasId: string) => {
      navigate(`/kegiatan?kelas=${kelasId}`);
    },
    [navigate]
  );

  // Keyboard shortcut Ctrl+N
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewKelas();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewKelas]);

  // Full page Kelas Skeleton during initial page loading (enforcing 350ms minimum duration)
  const isPageLoading = useMinimumLoading(isLoadingAllKelas && allKelas.length === 0, 350);
  if (isPageLoading) {
    return <KelasSkeleton />;
  }

  return (
    <div className="flex h-full w-full flex-row overflow-hidden bg-(--color-surface)">
      {/* Left Column (288px) */}
      <div className="flex flex-col w-[288px] flex-[0_0_288px] min-w-0 border-r border-(--color-border) bg-(--color-surface)">
        <KelasToolbar
          totalKelas={totalKelas}
          totalKeanggotaan={totalKeanggotaan}
          cari={cari}
          onCariChange={setCari}
          adaFilter={adaFilter}
          onResetFilter={handleResetFilter}
          onKelasBaru={handleNewKelas}
        />

        {filteredKelas.length > 0 ? (
          <KelasTable
            kelasList={filteredKelas}
            selectedId={selectedId}
            onSelectKelas={handleSelectKelas}
            totalDb={totalKelas}
          />
        ) : (
          <KelasEmptyState
            isFiltered={adaFilter}
            onResetFilter={handleResetFilter}
            onNewKelas={handleNewKelas}
          />
        )}
      </div>

      {/* Right Column (flex-1) */}
      <div className="flex flex-1 min-w-0 min-h-0 flex-col overflow-hidden bg-(--color-surface)">
        {selectedKelas || isBaruMode ? (
          <KelasFormView
            key={isBaruMode ? 'baru' : selectedKelas?.id}
            kelas={selectedKelas}
            isNew={isBaruMode}
            allSiswa={allSiswa}
            existingClasses={allKelas}
            onSave={handleSaveForm}
            onDelete={() => setIsDeleteModalOpen(true)}
            onCancel={handleCancel}
            onViewKegiatan={handleViewKegiatan}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-(--color-text-secondary)">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-(--color-surface-sunken) flex items-center justify-center text-(--color-text-muted) mb-3">
                <PeopleTeam24Regular className="w-6 h-6" />
              </div>
              <div className="text-[14px] font-semibold text-(--color-text-primary) mb-1">
                Pilih atau buat kelas
              </div>
              <div className="text-xs text-(--color-text-muted) max-w-[320px] mx-auto leading-relaxed">
                Pilih kelas dari daftar di sebelah kiri untuk melihat rincian atau mengubahnya, atau buat kelas baru.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <KelasConfirmModal
        isOpen={isDeleteModalOpen}
        kelas={selectedKelas}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
