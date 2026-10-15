import { useState, useRef, useEffect } from 'react';
import {
  Dismiss16Regular,
  Add16Regular,
  Edit16Regular,
  Delete16Regular,
  Checkmark16Regular,
  Warning16Regular,
} from '@fluentui/react-icons';
import {
  useJenjangList,
  useCreateJenjang,
  useUpdateJenjang,
  useDeleteJenjang,
} from '@/data/hooks/useMaster';
import { useToast } from '@/components/ui/toast';
import type { JenjangOption } from '@/data/types/master';

interface KelolaJenjangModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KelolaJenjangModal({ isOpen, onClose }: KelolaJenjangModalProps) {
  const { showToast } = useToast();
  const { data: jenjangList = [], isLoading } = useJenjangList();
  const createMutation = useCreateJenjang();
  const updateMutation = useUpdateJenjang();
  const deleteMutation = useDeleteJenjang();

  const [newNama, setNewNama] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNama, setEditingNama] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNewNama('');
      setEditingId(null);
      setConfirmDeleteId(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (editingId) {
          setEditingId(null);
        } else if (confirmDeleteId) {
          setConfirmDeleteId(null);
        } else {
          onClose();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, editingId, confirmDeleteId, onClose]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNama.trim();
    if (!trimmed) return;

    if (jenjangList.some((j) => j.nama.toLowerCase() === trimmed.toLowerCase())) {
      showToast({
        type: 'warning',
        message: `Jenjang “${trimmed}” sudah ada dalam daftar.`,
      });
      return;
    }

    try {
      await createMutation.mutateAsync({ nama: trimmed });
      showToast({
        type: 'success',
        message: `Pilihan jenjang “${trimmed}” berhasil ditambahkan.`,
      });
      setNewNama('');
      inputRef.current?.focus();
    } catch (err: any) {
      showToast({
        type: 'error',
        message: err.message || 'Gagal menambahkan jenjang.',
      });
    }
  };

  const handleStartEdit = (opt: JenjangOption) => {
    setEditingId(opt.id);
    setEditingNama(opt.nama);
    setConfirmDeleteId(null);
  };

  const handleSaveEdit = async (id: string) => {
    const trimmed = editingNama.trim();
    if (!trimmed) return;

    if (
      jenjangList.some(
        (j) => j.id !== id && j.nama.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      showToast({
        type: 'warning',
        message: `Jenjang “${trimmed}” sudah digunakan.`,
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({ id, nama: trimmed });
      showToast({
        type: 'success',
        message: `Jenjang berhasil diubah menjadi “${trimmed}”.`,
      });
      setEditingId(null);
    } catch (err: any) {
      showToast({
        type: 'error',
        message: err.message || 'Gagal mengubah jenjang.',
      });
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showToast({
        type: 'success',
        message: `Pilihan jenjang “${nama}” berhasil dihapus.`,
      });
      setConfirmDeleteId(null);
    } catch (err: any) {
      showToast({
        type: 'error',
        message: err.message || 'Gagal menghapus jenjang.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in-0 duration-100">
      <div className="w-full max-w-[480px] rounded-lg border border-(--color-border) bg-(--color-surface) shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-3 bg-(--color-surface)">
          <div>
            <h2 className="text-[15px] font-semibold text-(--color-text-primary) leading-tight">
              Kelola Pilihan Jenjang
            </h2>
            <p className="text-xs text-(--color-text-muted) leading-snug mt-0.5">
              Tambah, ubah, atau hapus pilihan jenjang pendidikan siswa.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded flex items-center justify-center text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-surface-alt) cursor-pointer transition-colors"
          >
            <Dismiss16Regular className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Add Form */}
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newNama}
              onChange={(e) => setNewNama(e.target.value)}
              placeholder="Tambah jenjang (mis. TK, PAUD, Alumni)..."
              disabled={createMutation.isPending}
              className="h-8 flex-1 rounded border border-(--color-border-strong) bg-(--color-surface) px-2.5 text-[12.5px] outline-none focus:border-(--color-brand) transition-colors text-(--color-text-primary) placeholder:text-(--color-text-muted)"
            />
            <button
              type="submit"
              disabled={!newNama.trim() || createMutation.isPending}
              className="h-8 px-3 rounded border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-[12px] font-semibold cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Add16Regular className="w-3.5 h-3.5" />
              <span>{createMutation.isPending ? 'Menambah...' : 'Tambah'}</span>
            </button>
          </form>

          {/* List of Jenjang */}
          <div className="flex flex-col gap-1.5">
            <div className="text-[11.5px] font-medium text-(--color-text-secondary) px-0.5">
              Daftar Jenjang Aktif ({jenjangList.length})
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-(--color-text-muted)">
                Memuat data jenjang...
              </div>
            ) : jenjangList.length === 0 ? (
              <div className="py-6 text-center text-xs text-(--color-text-muted) border border-dashed border-(--color-border) rounded">
                Belum ada pilihan jenjang.
              </div>
            ) : (
              <div className="border border-(--color-border) rounded-md divide-y divide-(--color-border) bg-(--color-surface) overflow-hidden">
                {jenjangList.map((opt) => {
                  const isEditing = editingId === opt.id;
                  const isConfirmingDelete = confirmDeleteId === opt.id;

                  if (isConfirmingDelete) {
                    return (
                      <div
                        key={opt.id}
                        className="p-3 bg-(--color-danger-subtle) flex flex-col gap-2 text-xs"
                      >
                        <div className="flex items-start gap-2 text-(--color-danger-fg)">
                          <Warning16Regular className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            Hapus jenjang <strong>“{opt.nama}”</strong>?
                            {(opt.jumlahSiswa ?? 0) > 0 && (
                              <div className="text-[11px] mt-0.5">
                                Jenjang ini sedang digunakan oleh{' '}
                                <strong>{opt.jumlahSiswa} siswa</strong>. Siswa
                                tersebut akan diubah menjadi tanpa jenjang.
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="h-6.5 px-2.5 rounded border border-(--color-border) bg-(--color-surface) text-[11px] font-medium text-(--color-text-primary) hover:bg-(--color-surface-alt) cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(opt.id, opt.nama)}
                            disabled={deleteMutation.isPending}
                            className="h-6.5 px-2.5 rounded border-none bg-(--color-danger) text-[11px] font-semibold text-white hover:opacity-90 cursor-pointer disabled:opacity-50"
                          >
                            {deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus'}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (isEditing) {
                    return (
                      <div
                        key={opt.id}
                        className="p-2 flex items-center gap-2 bg-(--color-surface-alt)"
                      >
                        <input
                          type="text"
                          value={editingNama}
                          onChange={(e) => setEditingNama(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEdit(opt.id);
                            }
                          }}
                          autoFocus
                          className="h-7 flex-1 rounded border border-(--color-brand) bg-(--color-surface) px-2 text-[12px] outline-none text-(--color-text-primary)"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(opt.id)}
                          disabled={!editingNama.trim() || updateMutation.isPending}
                          className="h-7 px-2.5 rounded border-none bg-(--color-brand) text-white text-[11px] font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          <Checkmark16Regular className="w-3.5 h-3.5" />
                          <span>Simpan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="h-7 px-2 rounded border border-(--color-border) bg-(--color-surface) text-[11px] text-(--color-text-secondary) hover:bg-(--color-surface-alt) cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between px-3 py-2 text-xs hover:bg-(--color-surface-alt) transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-semibold text-(--color-text-primary) px-2 py-0.5 rounded bg-(--color-surface-sunken) border border-(--color-border) text-[12px]">
                          {opt.nama}
                        </span>
                        <span className="text-[11px] text-(--color-text-muted)">
                          {(opt.jumlahSiswa ?? 0) > 0
                            ? `${opt.jumlahSiswa} siswa`
                            : 'belum digunakan'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(opt)}
                          title={`Ubah nama jenjang ${opt.nama}`}
                          className="h-6.5 w-6.5 rounded flex items-center justify-center text-(--color-text-secondary) hover:text-(--color-brand) hover:bg-(--color-surface) cursor-pointer transition-colors"
                        >
                          <Edit16Regular className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(opt.id)}
                          title={`Hapus jenjang ${opt.nama}`}
                          className="h-6.5 w-6.5 rounded flex items-center justify-center text-(--color-text-secondary) hover:text-(--color-danger) hover:bg-(--color-surface) cursor-pointer transition-colors"
                        >
                          <Delete16Regular className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-(--color-border) px-4 py-2.5 bg-(--color-surface-alt)">
          <button
            type="button"
            onClick={onClose}
            className="h-7.5 px-4 rounded border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-xs font-medium text-(--color-text-primary) cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
