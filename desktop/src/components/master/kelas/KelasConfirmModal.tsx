import { useEffect, useRef } from 'react';
import type { Kelas } from '@/data/types/master';

interface KelasConfirmModalProps {
  isOpen: boolean;
  kelas: Kelas | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function KelasConfirmModal({
  isOpen,
  kelas,
  onClose,
  onConfirm,
}: KelasConfirmModalProps) {
  const safeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      safeButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !kelas) return null;

  const anggotaCount = (kelas.anggota || []).length;
  const sub = `${kelas.jenjang || '—'} · ${anggotaCount} anggota`;
  const n = kelas.jumlahKegiatan || 0;

  const dampakList = [
    n > 0
      ? `${n} kegiatan tetap tersimpan — tidak ada satu pun yang menunjuk kelas ini, jadi tidak ada rujukan yang putus.`
      : 'Belum dipakai di kegiatan mana pun.',
    'Masih bisa diurungkan lewat toast setelah menghapus.',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-[460px] rounded-lg border border-(--color-border) bg-(--color-surface) p-5 shadow-2xl flex flex-col gap-3.5 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div>
          <h2 id="modal-title" className="text-base font-semibold text-(--color-text-primary)">
            Hapus kelas ini?
          </h2>
          <p className="mt-1 text-[13px] text-(--color-text-secondary) leading-relaxed">
            {kelas.nama} akan dihapus permanen dari data master.
          </p>
        </div>

        {/* Kelas Info Card */}
        <div className="rounded-md border border-(--color-border) bg-(--color-surface-alt) p-3 flex flex-col gap-1">
          <div className="text-[13.5px] font-semibold text-(--color-text-primary)">
            {kelas.nama}
          </div>
          <div className="text-xs text-(--color-text-muted)">{sub}</div>
        </div>

        {/* Dampak Info Box */}
        <div className="rounded-md p-2.5 text-xs leading-relaxed border border-(--color-danger) bg-(--color-danger-subtle) text-(--color-danger-fg)">
          <ul className="list-disc pl-4 space-y-1">
            {dampakList.map((dampak, i) => (
              <li key={i}>{dampak}</li>
            ))}
          </ul>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-(--color-border)">
          <button
            ref={safeButtonRef}
            type="button"
            onClick={onClose}
            className="h-7 px-3.5 rounded border border-(--color-border-strong) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-primary) text-[12.5px] font-medium cursor-pointer transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-7 px-3.5 rounded border-none text-[12.5px] font-semibold cursor-pointer transition-colors bg-(--color-danger) hover:bg-[#A80000] text-white"
          >
            Hapus kelas
          </button>
        </div>
      </div>
    </div>
  );
}
