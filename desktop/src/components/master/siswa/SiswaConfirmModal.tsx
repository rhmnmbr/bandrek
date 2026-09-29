import { useEffect, useRef } from 'react';
import type { Siswa } from '@/data/types/master';
import { formatTanggalTahun } from '@/lib/dateUtils';

interface SiswaConfirmModalProps {
  isOpen: boolean;
  type: 'nonaktif' | 'hapus' | null;
  siswa: Siswa | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function SiswaConfirmModal({
  isOpen,
  type,
  siswa,
  onClose,
  onConfirm,
}: SiswaConfirmModalProps) {
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

  if (!isOpen || !siswa || !type) return null;

  const isNonaktif = type === 'nonaktif';
  const judul = isNonaktif ? 'Nonaktifkan siswa ini?' : 'Hapus siswa ini?';
  const teks = isNonaktif
    ? `${siswa.nama} tidak lagi muncul saat memilih siswa untuk kegiatan baru. Riwayat dan datanya tetap tersimpan, dan bisa diaktifkan lagi kapan saja.`
    : `${siswa.nama} belum dipakai di kegiatan, kelas, atau ceklis mana pun, jadi aman dihapus permanen.`;

  const classes = siswa.daftarKelasDetail || [];
  const classesText =
    classes.length > 0 ? classes.map((k) => k.nama).join(', ') : 'belum masuk kelas';
  const subText = `${siswa.jenjang} · ${classesText}${
    siswa.bergabung ? ` · bergabung ${formatTanggalTahun(siswa.bergabung)}` : ''
  }`;

  const kegCount = siswa.jumlahKegiatan || 0;
  const mendatangCount = siswa.kegiatanMendatangCount || 0;

  const dampakList: string[] = [];
  if (isNonaktif) {
    if (kegCount > 0) {
      dampakList.push(
        `${kegCount} kegiatan tetap tersimpan dan tetap terhitung di matriks belajar.`
      );
    }
    if (mendatangCount > 0) {
      dampakList.push(
        `${mendatangCount} kegiatan mendatang yang sudah menyertakan siswa ini tidak berubah — keluarkan manual kalau memang batal ikut.`
      );
    }
    if (classes.length > 0) {
      dampakList.push(
        `Tetap terdaftar di ${classes.map((k) => k.nama).join(', ')}, tapi tidak ikut terbawa saat kelas itu diimpor ke kegiatan baru.`
      );
    }
  } else {
    dampakList.push(
      'Tindakan ini menghapus datanya. Masih bisa diurungkan lewat toast setelah menghapus.'
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-54 flex items-center justify-center bg-black/28"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-115 rounded-lg border border-(--color-border-strong) bg-(--color-surface) shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-4 pb-0">
          <div className="text-[17px] font-semibold text-(--color-text-primary)">{judul}</div>
          <div className="mt-1.25 text-[12.5px] leading-relaxed text-(--color-text-secondary)">
            {teks}
          </div>
        </div>

        {/* Info Siswa */}
        <div className="mx-4 mt-2.75 rounded-md border border-(--color-border) bg-(--color-surface-alt) p-2.25">
          <div className="truncate text-[13px] font-semibold text-(--color-text-primary)">
            {siswa.nama}
          </div>
          <div className="mt-0.25 text-[11.5px] leading-normal text-(--color-text-muted)">
            {subText}
          </div>
        </div>

        {/* Dampak */}
        {dampakList.length > 0 && (
          <div
            className={`mx-4 mt-2.5 rounded-md border p-2 text-xs leading-relaxed ${
              isNonaktif
                ? 'border-(--color-border) bg-(--color-surface) text-(--color-text-secondary)'
                : 'border-(--color-danger) bg-(--color-danger-bg) text-(--color-danger-ink)'
            }`}
          >
            <ul className="m-0 pl-4 list-disc space-y-1">
              {dampakList.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 p-3.5 pt-3">
          <button
            ref={safeButtonRef}
            type="button"
            onClick={onClose}
            className="h-7 px-3.25 rounded border border-(--color-border-strong) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-primary) text-[13px] cursor-pointer transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-7 px-3.25 rounded border-none text-[13px] font-semibold text-white cursor-pointer transition-colors ${
              isNonaktif
                ? 'bg-(--color-brand) hover:bg-(--color-brand-pressed)'
                : 'bg-(--color-danger) hover:brightness-95'
            }`}
          >
            {isNonaktif ? 'Nonaktifkan siswa' : 'Hapus siswa'}
          </button>
        </div>
      </div>
    </div>
  );
}
