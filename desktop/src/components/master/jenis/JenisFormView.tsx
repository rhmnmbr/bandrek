import { useState, useMemo, useEffect, useRef } from 'react';
import type { JenisKegiatan, JenisKegiatanWarna } from '@/data/types/master';
import { JENIS_WARNA, LIST_WARNA } from './palette';

export interface JenisKegiatanFormData {
  id?: string;
  nama: string;
  warna: JenisKegiatanWarna;
  materiWajib: boolean;
  siswaWajib: boolean;
}

interface JenisFormViewProps {
  jenis: JenisKegiatan | null;
  isNewJenis: boolean;
  existingJenis: JenisKegiatan[];
  onSave: (data: JenisKegiatanFormData) => Promise<void>;
  onDelete: () => void;
  onCancel: () => void;
  onViewKegiatan?: (jenisId: string) => void;
}

export function JenisFormView({
  jenis,
  isNewJenis,
  existingJenis,
  onSave,
  onDelete,
  onCancel,
  onViewKegiatan,
}: JenisFormViewProps) {
  const [nama, setNama] = useState(jenis?.nama || '');
  const [warna, setWarna] = useState<JenisKegiatanWarna>(jenis?.warna || 'pembelajaran');
  const [materiWajib, setMateriWajib] = useState<boolean>(
    jenis ? jenis.materiWajib : true
  );
  const [siswaWajib, setSiswaWajib] = useState<boolean>(
    jenis ? jenis.siswaWajib : true
  );
  const [dicoba, setDicoba] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const namaInputRef = useRef<HTMLInputElement>(null);

  // Sync state on jenis change
  useEffect(() => {
    if (jenis) {
      setNama(jenis.nama || '');
      setWarna(jenis.warna || 'pembelajaran');
      setMateriWajib(jenis.materiWajib);
      setSiswaWajib(jenis.siswaWajib);
    } else {
      setNama('');
      setWarna('pembelajaran');
      setMateriWajib(true);
      setSiswaWajib(true);
    }
    setDicoba(false);
  }, [jenis, isNewJenis]);

  // Focus input
  useEffect(() => {
    setTimeout(() => {
      namaInputRef.current?.focus();
    }, 50);
  }, [isNewJenis, jenis?.id]);

  // Validation
  const errors = useMemo(() => {
    const errs: string[] = [];
    const namaTrim = nama.trim();
    if (!namaTrim) {
      errs.push('Isi nama jenis kegiatan.');
    } else {
      const isDuplicate = existingJenis.some(
        (j) =>
          j.id !== jenis?.id &&
          j.nama.trim().toLowerCase() === namaTrim.toLowerCase()
      );
      if (isDuplicate) {
        errs.push('Nama jenis kegiatan sudah dipakai.');
      }
    }
    return errs;
  }, [nama, existingJenis, jenis]);

  const hasNamaError =
    dicoba &&
    (!nama.trim() || errors.includes('Nama jenis kegiatan sudah dipakai.'));

  // Submit Handler
  const handleSubmit = async () => {
    setDicoba(true);
    if (errors.length > 0) {
      if (hasNamaError) namaInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: jenis?.id,
        nama: nama.trim(),
        warna,
        materiWajib,
        siswaWajib,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit, onCancel]);

  const metaWarna = JENIS_WARNA[warna] || JENIS_WARNA.lainnya;
  const initialIcon = isNewJenis
    ? '+'
    : (jenis?.nama || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

  const panelTitle = isNewJenis ? 'Jenis kegiatan baru' : jenis?.nama || '';
  const panelSub = isNewJenis
    ? 'Isi datanya, lalu simpan'
    : `${JENIS_WARNA[jenis?.warna || 'lainnya']?.label || 'Abu'} · ${
        jenis?.jumlahKegiatan || 0
      } kegiatan`;

  // Deletion permissions
  const bisaHapus = Boolean(jenis?.id && jenis.dapatDihapus);
  const hapusTitle = !jenis?.id
    ? 'Belum ada yang bisa dihapus'
    : jenis.alasanTidakBisaHapus || 'Hapus permanen — belum dipakai di mana pun';

  const simpanDisabled = dicoba && errors.length > 0;

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-(--color-surface-alt)">
      {/* Panel Header */}
      <div className="flex h-13 shrink-0 items-center gap-2.5 border-b border-(--color-border) bg-(--color-surface) px-3.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[12.5px] font-semibold"
          style={{ backgroundColor: metaWarna.bg, color: metaWarna.ink }}
        >
          {initialIcon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-(--color-text-primary) leading-tight truncate">
            {panelTitle}
          </div>
          <div className="text-[11.5px] text-(--color-text-muted) leading-snug truncate">
            {panelSub}
          </div>
        </div>
      </div>

      {/* Panel Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-3">
        {/* Error Summary Alert Box */}
        {dicoba && errors.length > 0 && (
          <div className="rounded-md border border-(--color-danger) bg-(--color-danger-subtle) p-2 text-xs leading-relaxed text-(--color-danger-fg)">
            <div className="font-semibold flex items-center gap-1.5">
              <span>⚠</span>
              <span>Belum bisa disimpan — {errors.length} hal perlu dibereskan:</span>
            </div>
            <ul className="mt-1 list-disc pl-6 space-y-0.5">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Nama Jenis */}
        <div className="flex flex-col gap-1">
          <label className="text-[11.5px] text-(--color-text-secondary) flex items-center gap-1 min-h-[18px]">
            Nama jenis <span className="text-(--color-danger)">*</span>
          </label>
          <input
            ref={namaInputRef}
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="mis. Pembelajaran"
            className={`h-7 px-2 text-[13.5px] rounded-sm border bg-(--color-surface) outline-none transition-colors ${
              hasNamaError
                ? 'border-(--color-danger) focus:border-(--color-danger)'
                : 'border-(--color-border) focus:border-(--color-brand)'
            }`}
          />
          {hasNamaError && (
            <div className="text-[11px] text-(--color-danger) flex items-center gap-1 leading-tight">
              <span>⚠</span>
              <span>
                {errors.find((e) => e.includes('nama')) || 'Isi nama jenis kegiatan.'}
              </span>
            </div>
          )}
        </div>

        {/* Warna di Kalender */}
        <div className="flex flex-col gap-1">
          <label className="text-[11.5px] text-(--color-text-secondary) min-h-[18px]">
            Warna di kalender
          </label>
          <div className="flex flex-wrap gap-1.5">
            {LIST_WARNA.map((wk) => {
              const wMeta = JENIS_WARNA[wk];
              const isSelected = warna === wk;

              return (
                <button
                  key={wk}
                  type="button"
                  onClick={() => setWarna(wk)}
                  title={`Warna ${wMeta.label} di kalender`}
                  className={`flex h-6.5 shrink-0 items-center gap-1.5 px-2.5 rounded-full text-[11.5px] border cursor-pointer transition-all ${
                    isSelected
                      ? 'font-semibold'
                      : 'border-(--color-border) bg-(--color-surface) text-(--color-text-primary) hover:bg-(--color-surface-alt)'
                  }`}
                  style={
                    isSelected
                      ? {
                          borderColor: wMeta.dot,
                          backgroundColor: wMeta.bg,
                          color: wMeta.ink,
                        }
                      : {}
                  }
                >
                  <span
                    className="w-2.25 h-2.25 shrink-0 rounded-full"
                    style={{ backgroundColor: wMeta.dot }}
                  />
                  <span>{wMeta.label}</span>
                </button>
              );
            })}
          </div>
          <div className="text-[11px] text-(--color-text-muted) leading-snug">
            Menentukan warna balok kegiatan dan titik di tampilan bulan.
          </div>
        </div>

        {/* Wajib Pilih Mapel & Materi Switch Card */}
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2 rounded-md border border-(--color-border) bg-(--color-surface) p-2.5 cursor-pointer hover:border-(--color-border-strong) transition-colors">
            <input
              type="checkbox"
              checked={materiWajib}
              onChange={(e) => setMateriWajib(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded-xs text-(--color-brand) cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <div
                className={`text-[12.5px] font-medium leading-tight ${
                  materiWajib ? 'text-(--color-text-primary)' : 'text-(--color-text-secondary)'
                }`}
              >
                Wajib pilih mata pelajaran & materi
              </div>
              <div className="mt-1 text-[11px] text-(--color-text-muted) leading-snug">
                Kalau dimatikan, kegiatan jenis ini tidak masuk hitungan matriks belajar.
              </div>
            </div>
          </label>
        </div>

        {/* Wajib Pilih Siswa Peserta Switch Card */}
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2 rounded-md border border-(--color-border) bg-(--color-surface) p-2.5 cursor-pointer hover:border-(--color-border-strong) transition-colors">
            <input
              type="checkbox"
              checked={siswaWajib}
              onChange={(e) => setSiswaWajib(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded-xs text-(--color-brand) cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <div
                className={`text-[12.5px] font-medium leading-tight ${
                  siswaWajib ? 'text-(--color-text-primary)' : 'text-(--color-text-secondary)'
                }`}
              >
                Wajib pilih siswa peserta
              </div>
              <div className="mt-1 text-[11px] text-(--color-text-muted) leading-snug">
                Rapat dan sejenisnya biasanya dimatikan — cukup subjek saja.
              </div>
            </div>
          </label>
        </div>

        {/* Ringkasan */}
        {!isNewJenis && jenis && (
          <div className="rounded-md border border-(--color-border) bg-(--color-surface) p-2.5">
            <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
              RINGKASAN
            </div>
            <div className="text-[12.5px] leading-relaxed mt-1 text-(--color-text-primary)">
              {jenis.ringkasanPenggunaan ||
                `${jenis.jumlahKegiatan || 0} kegiatan tercatat memakai jenis kegiatan ini.`}
            </div>
            {(jenis.jumlahKegiatan || 0) > 0 && onViewKegiatan && (
              <button
                type="button"
                onClick={() => onViewKegiatan(jenis.id)}
                className="mt-1.5 border-none bg-transparent p-0 text-xs text-(--color-brand) hover:underline cursor-pointer font-medium"
              >
                Lihat kegiatannya di daftar kegiatan
              </button>
            )}
          </div>
        )}
      </div>

      {/* Panel Footer */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-t border-(--color-border) bg-(--color-surface) px-3.5">
        {!isNewJenis && jenis && (
          <button
            type="button"
            onClick={onDelete}
            disabled={!bisaHapus}
            title={hapusTitle}
            className={`h-6.5 px-2.5 rounded-sm border-none text-[12.5px] transition-colors ${
              bisaHapus
                ? 'bg-transparent text-(--color-danger) hover:bg-(--color-danger-subtle) cursor-pointer'
                : 'bg-transparent text-(--color-text-disabled) cursor-not-allowed'
            }`}
          >
            Hapus
          </button>
        )}

        <div className="flex-1 min-w-[6px]" />

        <button
          type="button"
          onClick={onCancel}
          className="h-6.5 px-3 rounded-sm border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-primary) text-[12.5px] font-medium cursor-pointer transition-colors"
        >
          Batal
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={simpanDisabled || isSubmitting}
          title={
            simpanDisabled
              ? 'Bereskan dulu isian yang bermasalah'
              : isNewJenis
              ? 'Tambahkan jenis kegiatan ini'
              : 'Simpan perubahan'
          }
          className={`h-6.5 px-3 rounded-sm border-none text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors ${
            simpanDisabled || isSubmitting
              ? 'bg-(--color-surface-disabled) text-(--color-text-disabled) cursor-not-allowed'
              : 'bg-(--color-brand) hover:bg-(--color-brand-hover) text-white cursor-pointer'
          }`}
        >
          <span>{isNewJenis ? 'Simpan jenis kegiatan' : 'Simpan'}</span>
          <span className="font-mono text-[10px] opacity-75">Ctrl S</span>
        </button>
      </div>
    </div>
  );
}
