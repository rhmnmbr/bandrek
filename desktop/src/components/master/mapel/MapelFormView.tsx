import { useState, useMemo, useEffect, useRef } from 'react';
import { Add16Regular } from '@fluentui/react-icons';
import type { MataPelajaran, Materi } from '@/data/types/master';
import { MateriTable } from './MateriTable';

export interface MapelFormData {
  id?: string;
  nama: string;
  aktif: boolean;
}

export interface MateriFormData {
  id?: string;
  mapel: string;
  nama: string;
  aktif: boolean;
  urutan?: number;
}

interface MapelFormViewProps {
  mapel: MataPelajaran | null;
  isNewMapel: boolean;
  activeMateri: Materi | null;
  isNewMateri: boolean;
  existingMapel: MataPelajaran[];
  materiList: Materi[];
  isLoadingMateri?: boolean;
  onSaveMapel: (data: MapelFormData) => Promise<void>;
  onDeleteMapel: () => void;
  onToggleAktifMapel: () => void;
  onSaveMateri: (data: MateriFormData) => Promise<void>;
  onDeleteMateri: (materi: Materi) => void;
  onToggleAktifMateri: (materi: Materi) => void;
  onReorderMateri: (orderedIds: string[]) => Promise<void>;
  onNewMateri: () => void;
  onSelectMateri: (materi: Materi) => void;
  onBackToMapel: () => void;
  onCancel: () => void;
  onViewKegiatan?: (mapelId: string) => void;
}

export function MapelFormView({
  mapel,
  isNewMapel,
  activeMateri,
  isNewMateri,
  existingMapel,
  materiList,
  isLoadingMateri = false,
  onSaveMapel,
  onDeleteMapel,
  onToggleAktifMapel,
  onSaveMateri,
  onDeleteMateri,
  onToggleAktifMateri,
  onReorderMateri,
  onNewMateri,
  onSelectMateri,
  onBackToMapel,
  onCancel,
  onViewKegiatan,
}: MapelFormViewProps) {
  const isChildMode = Boolean(activeMateri || isNewMateri);

  // Mapel Form State
  const [namaMapel, setNamaMapel] = useState(mapel?.nama || '');
  const [aktifMapel, setAktifMapel] = useState(mapel?.aktif ?? true);
  const [mapelDicoba, setMapelDicoba] = useState(false);

  // Materi Form State
  const [namaMateri, setNamaMateri] = useState(activeMateri?.nama || '');
  const [aktifMateri, setAktifMateri] = useState(activeMateri?.aktif ?? true);
  const [materiDicoba, setMateriDicoba] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapelInputRef = useRef<HTMLInputElement>(null);
  const materiInputRef = useRef<HTMLInputElement>(null);

  // Sync state when mapel changes
  useEffect(() => {
    if (mapel) {
      setNamaMapel(mapel.nama || '');
      setAktifMapel(mapel.aktif ?? true);
    } else {
      setNamaMapel('');
      setAktifMapel(true);
    }
    setMapelDicoba(false);
  }, [mapel, isNewMapel]);

  // Sync state when activeMateri changes
  useEffect(() => {
    if (activeMateri) {
      setNamaMateri(activeMateri.nama || '');
      setAktifMateri(activeMateri.aktif ?? true);
    } else {
      setNamaMateri('');
      setAktifMateri(true);
    }
    setMateriDicoba(false);
  }, [activeMateri, isNewMateri]);

  // Focus input on mode change
  useEffect(() => {
    setTimeout(() => {
      if (isChildMode) {
        materiInputRef.current?.focus();
      } else {
        mapelInputRef.current?.focus();
      }
    }, 50);
  }, [isChildMode]);

  // Validation for Mapel
  const mapelErrors = useMemo(() => {
    const errs: string[] = [];
    const namaTrim = namaMapel.trim();
    if (!namaTrim) {
      errs.push('Isi nama mata pelajaran.');
    } else {
      const isDuplicate = existingMapel.some(
        (m) =>
          m.id !== mapel?.id &&
          m.nama.trim().toLowerCase() === namaTrim.toLowerCase()
      );
      if (isDuplicate) {
        errs.push('Nama mata pelajaran sudah dipakai.');
      }
    }
    return errs;
  }, [namaMapel, existingMapel, mapel]);

  // Validation for Materi
  const materiErrors = useMemo(() => {
    const errs: string[] = [];
    const namaTrim = namaMateri.trim();
    if (!namaTrim) {
      errs.push('Isi nama materi.');
    } else {
      const isDuplicate = materiList.some(
        (t) =>
          t.id !== activeMateri?.id &&
          t.nama.trim().toLowerCase() === namaTrim.toLowerCase()
      );
      if (isDuplicate) {
        errs.push('Nama materi sudah dipakai di mata pelajaran ini.');
      }
    }

    return errs;
  }, [namaMateri, materiList, activeMateri]);

  const hasMapelNamaError =
    mapelDicoba &&
    (!namaMapel.trim() || mapelErrors.includes('Nama mata pelajaran sudah dipakai.'));

  const hasMateriNamaError =
    materiDicoba &&
    (!namaMateri.trim() ||
      materiErrors.includes('Nama materi sudah dipakai di mata pelajaran ini.'));

  // Submit Handler
  const handleSubmit = async () => {
    if (isChildMode) {
      // Save Materi
      setMateriDicoba(true);
      if (materiErrors.length > 0) {
        if (hasMateriNamaError) materiInputRef.current?.focus();
        return;
      }
      if (!mapel) return;

      setIsSubmitting(true);
      try {
        await onSaveMateri({
          id: activeMateri?.id,
          mapel: mapel.id,
          nama: namaMateri.trim(),
          aktif: aktifMateri,
          urutan: activeMateri?.urutan,
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Save Mapel
      setMapelDicoba(true);
      if (mapelErrors.length > 0) {
        if (hasMapelNamaError) mapelInputRef.current?.focus();
        return;
      }

      setIsSubmitting(true);
      try {
        await onSaveMapel({
          id: mapel?.id,
          nama: namaMapel.trim(),
          aktif: aktifMapel,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        if (isChildMode) {
          e.preventDefault();
          onBackToMapel();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit, isChildMode, onBackToMapel]);

  // Render Header Details
  const initialIcon = isChildMode
    ? isNewMateri
      ? '+'
      : (activeMateri?.nama || '?')
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0])
          .join('')
          .toUpperCase()
    : isNewMapel
    ? '+'
    : (mapel?.nama || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

  const panelTitle = isChildMode
    ? isNewMateri
      ? 'Materi baru'
      : activeMateri?.nama || ''
    : isNewMapel
    ? 'Mata pelajaran baru'
    : mapel?.nama || '';

  const countMateri = !isLoadingMateri ? materiList.length : (mapel?.jumlahMateri ?? materiList.length);
  const panelSub = isChildMode
    ? isNewMateri
      ? `Materi baru di ${mapel?.nama || ''}`
      : `${mapel?.nama || ''} · ${activeMateri?.jumlahKegiatan || 0} kegiatan`
    : isNewMapel
    ? 'Isi datanya, lalu simpan'
    : `${countMateri} materi · ${mapel?.jumlahKegiatan || 0} kegiatan`;

  const isCurrentActive = isChildMode ? activeMateri?.aktif ?? true : mapel?.aktif ?? true;

  // Deletion permissions
  const bisaHapusMapel = Boolean(mapel?.id && mapel.dapatDihapus);
  const hapusMapelTitle = !mapel?.id
    ? 'Belum ada yang bisa dihapus'
    : mapel.alasanTidakBisaHapus || 'Hapus permanen — belum dipakai di mana pun';

  const bisaHapusMateri = Boolean(activeMateri?.id && activeMateri.dapatDihapus);
  const hapusMateriTitle = !activeMateri?.id
    ? 'Belum ada yang bisa dihapus'
    : activeMateri.alasanTidakBisaHapus || 'Hapus permanen — belum dipakai di mana pun';

  const errorsToDisplay = isChildMode ? materiErrors : mapelErrors;
  const dicobaFlag = isChildMode ? materiDicoba : mapelDicoba;
  const simpanDisabled = dicobaFlag && errorsToDisplay.length > 0;

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-(--color-surface)">
      {/* Panel Header */}
      <div className="flex h-13 shrink-0 items-center gap-2.5 border-b border-(--color-border) bg-(--color-surface) px-3.5">
        {isChildMode && (
          <button
            type="button"
            onClick={onBackToMapel}
            title={`Kembali ke ${mapel?.nama || 'mata pelajaran'}`}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-(--color-border) bg-(--color-surface) text-(--color-text-secondary) hover:bg-(--color-surface-alt) transition-colors cursor-pointer"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M10.35 3.65c.2.2.2.5 0 .7L6.21 8.5l4.14 4.15c.2.2.2.5 0 .7-.2.2-.5.2-.7 0l-4.5-4.5c-.2-.2-.2-.5 0-.7l4.5-4.5c.2-.2.5-.2.7 0Z" />
            </svg>
          </button>
        )}

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-(--color-brand-subtle) text-[12.5px] font-semibold text-(--color-brand)">
          {(isChildMode ? isNewMateri : isNewMapel) ? <Add16Regular className="w-4 h-4" /> : initialIcon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-(--color-text-primary) leading-tight truncate">
            {panelTitle}
          </div>
          <div className="text-[11.5px] text-(--color-text-muted) leading-snug truncate">
            {panelSub}
          </div>
        </div>

        {/* Status Pill Badge */}
        {!isNewMapel && (!isChildMode || !isNewMateri) && (
          <span
            className={`inline-flex items-center h-4.75 px-2.25 rounded-full text-[11px] font-semibold border whitespace-nowrap ${
              isCurrentActive
                ? 'border-[#4CAF50] bg-[#E8F5E9] text-[#2E7D32]'
                : 'border-(--color-border) bg-(--color-surface-alt) text-(--color-text-secondary)'
            }`}
          >
            {isCurrentActive ? 'Aktif' : 'Nonaktif'}
          </span>
        )}
      </div>

      {/* Panel Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-row flex-wrap content-start gap-2.75">
        {/* Error Summary Alert Box */}
        {dicobaFlag && errorsToDisplay.length > 0 && (
          <div className="flex-[1_1_100%] rounded-md border border-(--color-danger) bg-(--color-danger-subtle) p-2 text-xs leading-relaxed text-(--color-danger-fg)">
            <div className="font-semibold flex items-center gap-1.5">
              <span>⚠</span>
              <span>Belum bisa disimpan — {errorsToDisplay.length} hal perlu dibereskan:</span>
            </div>
            <ul className="mt-1 list-disc pl-6 space-y-0.5">
              {errorsToDisplay.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {isChildMode ? (
          /* ========================================================
             CHILD MODE: MATERI FORM
             ======================================================== */
          <>
            {/* Nama Materi (flex 1 1 100%, min-w 220px) */}
            <div className="flex-[1_1_100%] min-w-55 flex flex-col gap-1">
              <label className="text-[11.5px] text-(--color-text-secondary) flex items-center gap-1 min-h-4.5">
                Nama materi <span className="text-(--color-danger)">*</span>
              </label>
              <input
                ref={materiInputRef}
                type="text"
                value={namaMateri}
                onChange={(e) => setNamaMateri(e.target.value)}
                placeholder="mis. Pecahan"
                className={`h-7 px-2 text-[13.5px] rounded-sm border bg-(--color-surface) outline-none transition-colors ${
                  hasMateriNamaError
                    ? 'border-(--color-danger) focus:border-(--color-danger)'
                    : 'border-(--color-border) focus:border-(--color-brand)'
                }`}
              />
              {hasMateriNamaError && (
                <div className="text-[11px] text-(--color-danger) flex items-center gap-1 leading-tight">
                  <span>⚠</span>
                  <span>
                    {materiErrors.find((e) => e.includes('nama')) || 'Isi nama materi.'}
                  </span>
                </div>
              )}
            </div>

            {/* Switch Aktif Materi */}
            <div className="flex-[1_1_100%] flex flex-col gap-1">
              <label className="flex items-center gap-2 p-2 rounded-md border border-(--color-border) bg-(--color-surface) hover:border-(--color-border-strong) cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={aktifMateri}
                  onChange={(e) => setAktifMateri(e.target.checked)}
                  className="h-3.5 w-3.5 shrink-0 accent-(--color-brand) cursor-pointer"
                />
                <span className="flex-1 min-w-0 text-[12.5px] text-(--color-text-primary) select-none">
                  Aktif — jadi kolom di matriks belajar
                </span>
              </label>
              {!aktifMateri && (
                <div className="text-[11px] text-(--color-text-muted) leading-snug pl-0.5">
                  Nonaktif: kolom hilang dari matriks, capaian lama tetap tersimpan.
                </div>
              )}
            </div>

            {/* Ringkasan Materi */}
            {!isNewMateri && activeMateri && (
              <div className="flex-[1_1_100%] rounded-md border border-(--color-border) bg-(--color-surface) p-2.5">
                <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
                  RINGKASAN
                </div>
                <div className="text-[12.5px] leading-relaxed mt-1 text-(--color-text-primary)">
                  {activeMateri.ringkasanPenggunaan ||
                    `${activeMateri.jumlahKegiatan || 0} kegiatan tercatat memakai materi ini.`}
                </div>
              </div>
            )}
          </>
        ) : (
          /* ========================================================
             PARENT MODE: MAPEL FORM
             ======================================================== */
          <>
            {/* Nama Mapel (flex 1 1 300px, min-w 240px) */}
            <div className="flex-[1_1_300px] min-w-60 flex flex-col gap-1">
              <label className="text-[11.5px] text-(--color-text-secondary) flex items-center gap-1 min-h-4.5">
                Nama mata pelajaran <span className="text-(--color-danger)">*</span>
              </label>
              <input
                ref={mapelInputRef}
                type="text"
                value={namaMapel}
                onChange={(e) => setNamaMapel(e.target.value)}
                placeholder="mis. Matematika"
                className={`h-7 px-2 text-[13.5px] rounded-sm border bg-(--color-surface) outline-none transition-colors ${
                  hasMapelNamaError
                    ? 'border-(--color-danger) focus:border-(--color-danger)'
                    : 'border-(--color-border) focus:border-(--color-brand)'
                }`}
              />
              {hasMapelNamaError && (
                <div className="text-[11px] text-(--color-danger) flex items-center gap-1 leading-tight">
                  <span>⚠</span>
                  <span>
                    {mapelErrors.find((e) => e.includes('nama')) || 'Isi nama mata pelajaran.'}
                  </span>
                </div>
              )}
            </div>

            {/* Switch Aktif Mapel */}
            <div className="flex-[1_1_100%] flex flex-col gap-1">
              <label className="flex items-center gap-2 p-2 rounded-md border border-(--color-border) bg-(--color-surface) hover:border-(--color-border-strong) cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={aktifMapel}
                  onChange={(e) => setAktifMapel(e.target.checked)}
                  className="h-3.5 w-3.5 shrink-0 accent-(--color-brand) cursor-pointer"
                />
                <span className="flex-1 min-w-0 text-[12.5px] text-(--color-text-primary) select-none">
                  Aktif — muncul di form kegiatan dan matriks belajar
                </span>
              </label>
              {!aktifMapel && (
                <div className="text-[11px] text-(--color-text-muted) leading-snug pl-0.5">
                  Nonaktif: kegiatan lama tetap menyebut mata pelajaran ini, tapi tidak bisa dipilih lagi.
                </div>
              )}
            </div>

            {/* Child Materi Table */}
            {!isNewMapel && mapel && (
              <MateriTable
                mapelNama={mapel.nama}
                materiList={materiList}
                isLoading={isLoadingMateri}
                jumlahMateri={mapel.jumlahMateri}
                onNewMateri={onNewMateri}
                onSelectMateri={onSelectMateri}
                onReorderMateri={onReorderMateri}
              />
            )}

            {/* Ringkasan Mapel */}
            {!isNewMapel && mapel && (
              <div className="flex-[1_1_100%] rounded-md border border-(--color-border) bg-(--color-surface) p-2.5">
                <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
                  RINGKASAN
                </div>
                <div className="text-[12.5px] leading-relaxed mt-1 text-(--color-text-primary)">
                  {mapel.ringkasanPenggunaan ||
                    `${mapel.jumlahKegiatan || 0} kegiatan tercatat memakai mata pelajaran ini.`}
                </div>
                {(mapel.jumlahKegiatan || 0) > 0 && onViewKegiatan && (
                  <button
                    type="button"
                    onClick={() => onViewKegiatan(mapel.id)}
                    className="mt-1.5 border-none bg-transparent p-0 text-xs text-(--color-brand) hover:underline cursor-pointer font-medium"
                  >
                    Lihat kegiatannya di daftar kegiatan
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Panel Footer */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-t border-(--color-border) bg-(--color-surface) px-3.5">
        {isChildMode ? (
          /* Footer for Materi */
          <>
            {!isNewMateri && activeMateri && (
              <>
                <button
                  type="button"
                  onClick={() => onToggleAktifMateri(activeMateri)}
                  title={
                    activeMateri.aktif
                      ? 'Sembunyikan dari kolom matriks tanpa menghapus riwayat'
                      : 'Munculkan lagi di matriks belajar'
                  }
                  className={`h-6.5 px-2.5 rounded border-none text-[12.5px] font-medium bg-transparent cursor-pointer transition-colors ${
                    activeMateri.aktif
                      ? 'text-(--color-warning-fg) hover:bg-(--color-warning-subtle)'
                      : 'text-[#2E7D32] hover:bg-[#E8F5E9]'
                  }`}
                >
                  {activeMateri.aktif ? 'Nonaktifkan' : 'Aktifkan kembali'}
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteMateri(activeMateri)}
                  disabled={!bisaHapusMateri}
                  title={hapusMateriTitle}
                  className={`h-6.5 px-2.5 rounded border-none text-[12.5px] transition-colors ${
                    bisaHapusMateri
                      ? 'bg-transparent text-(--color-danger) hover:bg-(--color-danger-subtle) cursor-pointer'
                      : 'bg-transparent text-(--color-text-disabled) cursor-not-allowed'
                  }`}
                >
                  Hapus
                </button>
              </>
            )}

            <div className="flex-1 min-w-1.5" />

            <button
              type="button"
              onClick={onBackToMapel}
              className="h-6.5 px-3 rounded border border-(--color-border-strong) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-primary) text-[12.5px] font-medium cursor-pointer transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={simpanDisabled || isSubmitting}
              title={simpanDisabled ? 'Bereskan dulu isian yang bermasalah' : undefined}
              className={`h-6.5 px-3 rounded border-none text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors ${
                simpanDisabled || isSubmitting
                  ? 'bg-(--color-surface-sunken) text-(--color-text-disabled) cursor-not-allowed'
                  : 'bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white cursor-pointer'
              }`}
            >
              <span>{isNewMateri ? 'Simpan materi' : 'Simpan'}</span>
            </button>
          </>
        ) : (
          /* Footer for Mapel */
          <>
            {!isNewMapel && mapel && (
              <>
                <button
                  type="button"
                  onClick={onToggleAktifMapel}
                  title={
                    mapel.aktif
                      ? 'Sembunyikan dari pemilih tanpa menghapus riwayat'
                      : 'Munculkan lagi di pemilih'
                  }
                  className={`h-6.5 px-2.5 rounded border-none text-[12.5px] font-medium bg-transparent cursor-pointer transition-colors ${
                    mapel.aktif
                      ? 'text-(--color-warning-fg) hover:bg-(--color-warning-subtle)'
                      : 'text-[#2E7D32] hover:bg-[#E8F5E9]'
                  }`}
                >
                  {mapel.aktif ? 'Nonaktifkan' : 'Aktifkan kembali'}
                </button>
                <button
                  type="button"
                  onClick={onDeleteMapel}
                  disabled={!bisaHapusMapel}
                  title={hapusMapelTitle}
                  className={`h-6.5 px-2.5 rounded border-none text-[12.5px] transition-colors ${
                    bisaHapusMapel
                      ? 'bg-transparent text-(--color-danger) hover:bg-(--color-danger-subtle) cursor-pointer'
                      : 'bg-transparent text-(--color-text-disabled) cursor-not-allowed'
                  }`}
                >
                  Hapus
                </button>
              </>
            )}

            <div className="flex-1 min-w-1.5" />

            <button
              type="button"
              onClick={onCancel}
              className="h-6.5 px-3 rounded border border-(--color-border-strong) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-primary) text-[12.5px] font-medium cursor-pointer transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={simpanDisabled || isSubmitting}
              title={simpanDisabled ? 'Bereskan dulu isian yang bermasalah' : undefined}
              className={`h-6.5 px-3 rounded border-none text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors ${
                simpanDisabled || isSubmitting
                  ? 'bg-(--color-surface-sunken) text-(--color-text-disabled) cursor-not-allowed'
                  : 'bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white cursor-pointer'
              }`}
            >
              <span>{isNewMapel ? 'Simpan mata pelajaran' : 'Simpan'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
