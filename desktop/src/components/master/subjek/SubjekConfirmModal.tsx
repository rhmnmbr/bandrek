import { useEffect, useRef } from 'react';
import type { Subjek } from '@/data/types/master';

interface SubjekConfirmModalProps {
  isOpen: boolean;
  type: 'nonaktif' | 'hapus' | null;
  subjek: Subjek | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function SubjekConfirmModal({
  isOpen,
  type,
  subjek,
  onClose,
  onConfirm,
}: SubjekConfirmModalProps) {
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

  if (!isOpen || !subjek || !type) return null;

  const isNonaktif = type === 'nonaktif';
  const judul = isNonaktif ? 'Nonaktifkan subjek ini?' : 'Hapus subjek ini?';
  const teks = isNonaktif
    ? `${subjek.nama} tidak lagi muncul saat memilih pengisi kegiatan baru. Kegiatan lama tetap menyebut namanya.`
    : `${subjek.nama} belum dipakai di kegiatan mana pun, jadi aman dihapus permanen.`;

  const kelaminText =
    subjek.kelamin === 'L' ? 'Laki-laki' : subjek.kelamin === 'P' ? 'Perempuan' : '';
  const subParts = [subjek.peran, kelaminText, subjek.kontak].filter(Boolean);
  const subText = subParts.join(' · ');

  const kegCount = subjek.jumlahKegiatan || 0;
  const dampakList: string[] = [];

  if (isNonaktif) {
    if (kegCount > 0) {
      dampakList.push(
        `${kegCount} kegiatan tetap tercatat dengan subjek ini sebagai pengisi atau pendamping.`
      );
    }
  } else {
    dampakList.push(
      'Masih bisa diurungkan lewat toast setelah menghapus.'
    );
  }

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
            {judul}
          </h2>
          <p className="mt-1 text-[13px] text-(--color-text-secondary) leading-relaxed">
            {teks}
          </p>
        </div>

        {/* Subjek Info Card */}
        <div className="rounded-md border border-(--color-border) bg-(--color-surface-alt) p-3 flex flex-col gap-1">
          <div className="text-[13.5px] font-semibold text-(--color-text-primary)">
            {subjek.nama}
          </div>
          <div className="text-xs text-(--color-text-muted)">{subText}</div>
        </div>

        {/* Dampak Info Box */}
        {dampakList.length > 0 && (
          <div
            className={`rounded-md p-2.5 text-xs leading-relaxed border ${
              isNonaktif
                ? 'border-(--color-border) bg-(--color-surface) text-(--color-text-primary)'
                : 'border-(--color-danger) bg-(--color-danger-subtle) text-(--color-danger-fg)'
            }`}
          >
            <ul className="list-disc pl-4 space-y-1">
              {dampakList.map((dampak, i) => (
                <li key={i}>{dampak}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-(--color-border)">
          <button
            ref={safeButtonRef}
            type="button"
            onClick={onClose}
            className="h-7 px-3.5 rounded border border-(--color-border-strong) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-primary) text-[12.5px] font-medium cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-7 px-3.5 rounded border-none text-[12.5px] font-semibold cursor-pointer transition-colors ${
              isNonaktif
                ? 'bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white'
                : 'bg-(--color-danger) hover:bg-[#A80000] text-white'
            }`}
          >
            {isNonaktif ? 'Nonaktifkan subjek' : 'Hapus subjek'}
          </button>
        </div>
      </div>
    </div>
  );
}
