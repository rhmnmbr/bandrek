import { useState, useMemo, useEffect, useRef } from 'react';
import type { Tempat, Ruangan } from '@/data/types/master';
import { RuanganTable } from './RuanganTable';

export interface TempatFormData {
  id?: string;
  nama: string;
}

export interface RuanganFormData {
  id?: string;
  tempat: string;
  nama: string;
  kapasitas: number;
}

interface TempatFormViewProps {
  tempat: Tempat | null;
  isNewTempat: boolean;
  activeRuangan: Ruangan | null;
  isNewRuangan: boolean;
  existingTempat: Tempat[];
  ruanganList: Ruangan[];
  onSaveTempat: (data: TempatFormData) => Promise<void>;
  onDeleteTempat: () => void;
  onSaveRuangan: (data: RuanganFormData) => Promise<void>;
  onDeleteRuangan: (ruangan: Ruangan) => void;
  onNewRuangan: () => void;
  onSelectRuangan: (ruangan: Ruangan) => void;
  onBackToTempat: () => void;
  onCancel: () => void;
  onViewKegiatan?: (tempatId: string) => void;
}

export function TempatFormView({
  tempat,
  isNewTempat,
  activeRuangan,
  isNewRuangan,
  existingTempat,
  ruanganList,
  onSaveTempat,
  onDeleteTempat,
  onSaveRuangan,
  onDeleteRuangan,
  onNewRuangan,
  onSelectRuangan,
  onBackToTempat,
  onCancel,
  onViewKegiatan,
}: TempatFormViewProps) {
  const isChildMode = Boolean(activeRuangan || isNewRuangan);

  // Tempat Form State
  const [namaTempat, setNamaTempat] = useState(tempat?.nama || '');
  const [tempatDicoba, setTempatDicoba] = useState(false);

  // Ruangan Form State
  const [namaRuangan, setNamaRuangan] = useState(activeRuangan?.nama || '');
  const [kapasitas, setKapasitas] = useState<number>(activeRuangan?.kapasitas || 12);
  const [ruanganDicoba, setRuanganDicoba] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const tempatInputRef = useRef<HTMLInputElement>(null);
  const ruanganInputRef = useRef<HTMLInputElement>(null);

  // Sync state when tempat changes
  useEffect(() => {
    if (tempat) {
      setNamaTempat(tempat.nama || '');
    } else {
      setNamaTempat('');
    }
    setTempatDicoba(false);
  }, [tempat, isNewTempat]);

  // Sync state when activeRuangan changes
  useEffect(() => {
    if (activeRuangan) {
      setNamaRuangan(activeRuangan.nama || '');
      setKapasitas(activeRuangan.kapasitas || 12);
    } else {
      setNamaRuangan('');
      setKapasitas(12);
    }
    setRuanganDicoba(false);
  }, [activeRuangan, isNewRuangan]);

  // Focus input on mode change
  useEffect(() => {
    setTimeout(() => {
      if (isChildMode) {
        ruanganInputRef.current?.focus();
      } else {
        tempatInputRef.current?.focus();
      }
    }, 50);
  }, [isChildMode]);

  // Validation for Tempat
  const tempatErrors = useMemo(() => {
    const errs: string[] = [];
    const namaTrim = namaTempat.trim();
    if (!namaTrim) {
      errs.push('Isi nama tempat.');
    } else {
      const isDuplicate = existingTempat.some(
        (t) =>
          t.id !== tempat?.id &&
          t.nama.trim().toLowerCase() === namaTrim.toLowerCase()
      );
      if (isDuplicate) {
        errs.push('Nama tempat sudah dipakai.');
      }
    }
    return errs;
  }, [namaTempat, existingTempat, tempat]);

  // Validation for Ruangan
  const ruanganErrors = useMemo(() => {
    const errs: string[] = [];
    const namaTrim = namaRuangan.trim();
    if (!namaTrim) {
      errs.push('Isi nama ruangan.');
    } else {
      const isDuplicate = ruanganList.some(
        (r) =>
          r.id !== activeRuangan?.id &&
          r.nama.trim().toLowerCase() === namaTrim.toLowerCase()
      );
      if (isDuplicate) {
        errs.push('Nama ruangan sudah dipakai di tempat ini.');
      }
    }

    if (kapasitas == null || isNaN(kapasitas) || kapasitas < 1) {
      errs.push('Kapasitas minimal 1 orang.');
    }

    return errs;
  }, [namaRuangan, ruanganList, activeRuangan, kapasitas]);

  const hasTempatNamaError =
    tempatDicoba &&
    (!namaTempat.trim() || tempatErrors.includes('Nama tempat sudah dipakai.'));

  const hasRuanganNamaError =
    ruanganDicoba &&
    (!namaRuangan.trim() ||
      ruanganErrors.includes('Nama ruangan sudah dipakai di tempat ini.'));

  // Submit Handler
  const handleSubmit = async () => {
    if (isChildMode) {
      // Save Ruangan
      setRuanganDicoba(true);
      if (ruanganErrors.length > 0) {
        if (hasRuanganNamaError) ruanganInputRef.current?.focus();
        return;
      }
      if (!tempat) return;

      setIsSubmitting(true);
      try {
        await onSaveRuangan({
          id: activeRuangan?.id,
          tempat: tempat.id,
          nama: namaRuangan.trim(),
          kapasitas: Number(kapasitas) || 12,
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Save Tempat
      setTempatDicoba(true);
      if (tempatErrors.length > 0) {
        if (hasTempatNamaError) tempatInputRef.current?.focus();
        return;
      }

      setIsSubmitting(true);
      try {
        await onSaveTempat({
          id: tempat?.id,
          nama: namaTempat.trim(),
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
          onBackToTempat();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit, isChildMode, onBackToTempat]);

  // Render Header Details
  const initialIcon = isChildMode
    ? isNewRuangan
      ? '+'
      : (activeRuangan?.nama || '?')
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0])
          .join('')
          .toUpperCase()
    : isNewTempat
    ? '+'
    : (tempat?.nama || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

  const panelTitle = isChildMode
    ? isNewRuangan
      ? 'Ruangan baru'
      : activeRuangan?.nama || ''
    : isNewTempat
    ? 'Tempat baru'
    : tempat?.nama || '';

  const panelSub = isChildMode
    ? isNewRuangan
      ? `Ruangan baru di ${tempat?.nama || ''}`
      : `${tempat?.nama || ''} · ${activeRuangan?.jumlahKegiatan || 0} kegiatan`
    : isNewTempat
    ? 'Isi datanya, lalu simpan'
    : `${ruanganList.length} ruangan · ${tempat?.jumlahKegiatan || 0} kegiatan`;

  // Deletion permissions
  const bisaHapusTempat = Boolean(tempat?.id && tempat.dapatDihapus);
  const hapusTempatTitle = !tempat?.id
    ? 'Belum ada yang bisa dihapus'
    : tempat.alasanTidakBisaHapus || 'Hapus permanen — belum dipakai di mana pun';

  const bisaHapusRuangan = Boolean(activeRuangan?.id && activeRuangan.dapatDihapus);
  const hapusRuanganTitle = !activeRuangan?.id
    ? 'Belum ada yang bisa dihapus'
    : activeRuangan.alasanTidakBisaHapus || 'Hapus permanen — belum dipakai di mana pun';

  const errorsToDisplay = isChildMode ? ruanganErrors : tempatErrors;
  const dicobaFlag = isChildMode ? ruanganDicoba : tempatDicoba;
  const simpanDisabled = dicobaFlag && errorsToDisplay.length > 0;

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-(--color-surface)">
      {/* Panel Header */}
      <div className="flex h-13 shrink-0 items-center gap-2.5 border-b border-(--color-border) bg-(--color-surface) px-3.5">
        {isChildMode && (
          <button
            type="button"
            onClick={onBackToTempat}
            title={`Kembali ke ${tempat?.nama || 'tempat'}`}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-(--color-border) bg-(--color-surface) text-(--color-text-secondary) hover:bg-(--color-surface-alt) transition-colors cursor-pointer"
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
              <path d="M10.35 3.65c.2.2.2.5 0 .7L6.21 8.5l4.14 4.15c.2.2.2.5 0 .7-.2.2-.5.2-.7 0l-4.5-4.5c-.2-.2-.2-.5 0-.7l4.5-4.5c.2-.2.5-.2.7 0Z" />
            </svg>
          </button>
        )}

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-(--color-brand-subtle) text-[12.5px] font-semibold text-(--color-brand)">
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
             CHILD MODE: RUANGAN FORM
             ======================================================== */
          <>
            {/* Nama Ruangan (flex 1 1 260px, min-w 220px) */}
            <div className="flex-[1_1_260px] min-w-[220px] flex flex-col gap-1">
              <label className="text-[11.5px] text-(--color-text-secondary) flex items-center gap-1 min-h-[18px]">
                Nama ruangan <span className="text-(--color-danger)">*</span>
              </label>
              <input
                ref={ruanganInputRef}
                type="text"
                value={namaRuangan}
                onChange={(e) => setNamaRuangan(e.target.value)}
                placeholder="mis. R. Melati"
                className={`h-7 px-2 text-[13.5px] rounded-sm border bg-(--color-surface) outline-none transition-colors ${
                  hasRuanganNamaError
                    ? 'border-(--color-danger) focus:border-(--color-danger)'
                    : 'border-(--color-border) focus:border-(--color-brand)'
                }`}
              />
              {hasRuanganNamaError && (
                <div className="text-[11px] text-(--color-danger) flex items-center gap-1 leading-tight">
                  <span>⚠</span>
                  <span>
                    {ruanganErrors.find((e) => e.includes('nama')) || 'Isi nama ruangan.'}
                  </span>
                </div>
              )}
            </div>

            {/* Kapasitas (flex 0 0 190px, min-w 190px) */}
            <div className="flex-[0_0_190px] min-w-[190px] flex flex-col gap-1">
              <label className="text-[11.5px] text-(--color-text-secondary) flex items-center gap-1 min-h-[18px]">
                Kapasitas
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={kapasitas}
                  onChange={(e) => setKapasitas(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="h-7 w-[110px] px-2 text-[12.5px] font-mono rounded-sm border border-(--color-border) bg-(--color-surface) outline-none focus:border-(--color-brand) transition-colors"
                />
                <span className="text-xs text-(--color-text-secondary)">orang</span>
              </div>
              <div className="text-[11px] text-(--color-text-muted) leading-snug">
                Dipakai sebagai peringatan lembut saat peserta kegiatan melebihi daya tampung.
              </div>
            </div>

            {/* Ringkasan Ruangan */}
            {!isNewRuangan && activeRuangan && (
              <div className="flex-[1_1_100%] rounded-md border border-(--color-border) bg-(--color-surface) p-2.5">
                <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
                  RINGKASAN
                </div>
                <div className="text-[12.5px] leading-relaxed mt-1 text-(--color-text-primary)">
                  {activeRuangan.ringkasanPenggunaan ||
                    `${activeRuangan.jumlahKegiatan || 0} kegiatan tercatat memakai ruangan ini.`}
                </div>
              </div>
            )}
          </>
        ) : (
          /* ========================================================
             PARENT MODE: TEMPAT FORM
             ======================================================== */
          <>
            {/* Nama Tempat (flex 1 1 320px, min-w 240px) */}
            <div className="flex-[1_1_320px] min-w-[240px] flex flex-col gap-1">
              <label className="text-[11.5px] text-(--color-text-secondary) flex items-center gap-1 min-h-[18px]">
                Nama tempat <span className="text-(--color-danger)">*</span>
              </label>
              <input
                ref={tempatInputRef}
                type="text"
                value={namaTempat}
                onChange={(e) => setNamaTempat(e.target.value)}
                placeholder="mis. Bandrek Pusat"
                className={`h-7 px-2 text-[13.5px] rounded-sm border bg-(--color-surface) outline-none transition-colors ${
                  hasTempatNamaError
                    ? 'border-(--color-danger) focus:border-(--color-danger)'
                    : 'border-(--color-border) focus:border-(--color-brand)'
                }`}
              />
              {hasTempatNamaError && (
                <div className="text-[11px] text-(--color-danger) flex items-center gap-1 leading-tight">
                  <span>⚠</span>
                  <span>
                    {tempatErrors.find((e) => e.includes('nama')) || 'Isi nama tempat.'}
                  </span>
                </div>
              )}
            </div>

            {/* Child Ruangan Table */}
            {!isNewTempat && tempat && (
              <RuanganTable
                tempatNama={tempat.nama}
                ruanganList={ruanganList}
                onNewRuangan={onNewRuangan}
                onSelectRuangan={onSelectRuangan}
              />
            )}

            {/* Ringkasan Tempat */}
            {!isNewTempat && tempat && (
              <div className="flex-[1_1_100%] rounded-md border border-(--color-border) bg-(--color-surface) p-2.5">
                <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
                  RINGKASAN
                </div>
                <div className="text-[12.5px] leading-relaxed mt-1 text-(--color-text-primary)">
                  {tempat.ringkasanPenggunaan ||
                    `${tempat.jumlahKegiatan || 0} kegiatan tercatat memakai tempat ini.`}
                </div>
                {(tempat.jumlahKegiatan || 0) > 0 && onViewKegiatan && (
                  <button
                    type="button"
                    onClick={() => onViewKegiatan(tempat.id)}
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
          /* Footer for Ruangan */
          <>
            {!isNewRuangan && activeRuangan && (
              <button
                type="button"
                onClick={() => onDeleteRuangan(activeRuangan)}
                disabled={!bisaHapusRuangan}
                title={hapusRuanganTitle}
                className={`h-6.5 px-2.5 rounded-sm border-none text-[12.5px] transition-colors ${
                  bisaHapusRuangan
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
              onClick={onBackToTempat}
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
                  : isNewRuangan
                  ? 'Tambahkan ruangan ini'
                  : 'Simpan perubahan'
              }
              className={`h-6.5 px-3 rounded-sm border-none text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors ${
                simpanDisabled || isSubmitting
                  ? 'bg-(--color-surface-disabled) text-(--color-text-disabled) cursor-not-allowed'
                  : 'bg-(--color-brand) hover:bg-(--color-brand-hover) text-white cursor-pointer'
              }`}
            >
              <span>{isNewRuangan ? 'Simpan ruangan' : 'Simpan'}</span>
              <span className="font-mono text-[10px] opacity-75">Ctrl S</span>
            </button>
          </>
        ) : (
          /* Footer for Tempat */
          <>
            {!isNewTempat && tempat && (
              <button
                type="button"
                onClick={onDeleteTempat}
                disabled={!bisaHapusTempat}
                title={hapusTempatTitle}
                className={`h-6.5 px-2.5 rounded-sm border-none text-[12.5px] transition-colors ${
                  bisaHapusTempat
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
                  : isNewTempat
                  ? 'Tambahkan tempat ini'
                  : 'Simpan perubahan'
              }
              className={`h-6.5 px-3 rounded-sm border-none text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors ${
                simpanDisabled || isSubmitting
                  ? 'bg-(--color-surface-disabled) text-(--color-text-disabled) cursor-not-allowed'
                  : 'bg-(--color-brand) hover:bg-(--color-brand-hover) text-white cursor-pointer'
              }`}
            >
              <span>{isNewTempat ? 'Simpan tempat' : 'Simpan'}</span>
              <span className="font-mono text-[10px] opacity-75">Ctrl S</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
