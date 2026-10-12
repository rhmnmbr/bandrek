import { useState, useEffect, useRef } from 'react';
import { Warning16Regular } from '@fluentui/react-icons';
import type { JenisKelamin } from '@/data/types/common';
import type { Subjek, MataPelajaran } from '@/data/types/master';

export interface SubjekFormData {
  id?: string;
  nama: string;
  kelamin: JenisKelamin | '';
  aktif: boolean;
  mapel: string[];
  kontak: string;
}

interface SubjekFormPanelProps {
  isOpen: boolean;
  initialData: Subjek | null; // null = new mode
  allSubjek: Subjek[];
  mapelList: MataPelajaran[];
  onClose: () => void;
  onSave: (data: SubjekFormData) => void;
  onMintaNonaktif: (subjek: Subjek) => void;
  onAktifkanKembali: (subjek: Subjek) => void;
  onMintaHapus: (subjek: Subjek) => void;
  onLihatKegiatan: (subjekId: string) => void;
}

function getInitialSubjekFormData(initialData: Subjek | null): SubjekFormData {
  if (initialData) {
    return {
      id: initialData.id,
      nama: initialData.nama,
      kelamin: initialData.kelamin || '',
      aktif: initialData.aktif !== false,
      mapel: (initialData.mapel || []).slice(),
      kontak: initialData.kontak || '',
    };
  }
  return {
    nama: '',
    kelamin: '',
    aktif: true,
    mapel: [],
    kontak: '',
  };
}

export function SubjekFormPanel({
  isOpen,
  initialData,
  allSubjek,
  mapelList,
  onClose,
  onSave,
  onMintaNonaktif,
  onAktifkanKembali,
  onMintaHapus,
  onLihatKegiatan,
}: SubjekFormPanelProps) {
  const isNew = !initialData;

  const [form, setForm] = useState<SubjekFormData>(() => getInitialSubjekFormData(initialData));

  const [dicoba, setDicoba] = useState(false);
  const [menuMapelOpen, setMenuMapelOpen] = useState(false);

  const namaInputRef = useRef<HTMLInputElement>(null);
  const menuMapelRef = useRef<HTMLDivElement>(null);

  // Sync form when initialData changes
  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id,
        nama: initialData.nama,
        kelamin: initialData.kelamin || '',
        aktif: initialData.aktif !== false,
        mapel: (initialData.mapel || []).slice(),
        kontak: initialData.kontak || '',
      });
    } else {
      setForm({
        nama: '',
        kelamin: '',
        aktif: true,
        mapel: [],
        kontak: '',
      });
    }
    setDicoba(false);
    setMenuMapelOpen(false);

    if (isOpen) {
      setTimeout(() => {
        namaInputRef.current?.focus();
      }, 60);
    }
  }, [initialData, isOpen]);

  // Click outside to close mapel menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuMapelRef.current && !menuMapelRef.current.contains(e.target as Node)) {
        setMenuMapelOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+S inside panel
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Validation
  const namaTrim = form.nama.trim();
  let errNama = '';
  if (!namaTrim) {
    errNama = 'Nama lengkap harus diisi.';
  } else if (
    allSubjek.some(
      (s) => s.id !== form.id && s.nama.trim().toLowerCase() === namaTrim.toLowerCase()
    )
  ) {
    errNama = 'Sudah ada subjek dengan nama itu.';
  }

  const errorList: string[] = [];
  if (errNama) errorList.push(errNama);

  const hasError = errorList.length > 0;
  const showErrors = dicoba;

  const handleSubmit = () => {
    setDicoba(true);
    if (hasError) {
      namaInputRef.current?.focus();
      return;
    }
    onSave({
      ...form,
      nama: namaTrim,
      kontak: form.kontak.trim(),
    });
  };

  if (!isOpen) return null;

  // Header display calculations
  const displayName = initialData?.nama || form.nama;
  const initials = isNew
    ? '+'
    : displayName
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase() || '?';

  const kelaminText =
    initialData?.kelamin === 'L'
      ? 'Laki-laki'
      : initialData?.kelamin === 'P'
        ? 'Perempuan'
        : '—';

  const subtitle = isNew
    ? 'Isi nama subjek, lalu simpan'
    : `${kelaminText} · ${initialData?.jumlahKegiatan || 0} kegiatan`;

  // Filter available mapels not yet selected
  const activeMapels = mapelList.filter((m) => m.aktif);
  const sisaMapel = activeMapels.filter((m) => !form.mapel.includes(m.id));

  // Deletion logic
  const canDelete = !isNew && (initialData?.dapatDihapus ?? initialData?.jumlahKegiatan === 0);
  const deleteTitle = isNew
    ? 'Belum ada yang bisa dihapus'
    : canDelete
      ? 'Hapus permanen — subjek ini belum dipakai di mana pun'
      : `Tidak bisa dihapus: dipakai di ${initialData?.jumlahKegiatan || 0} kegiatan. Pakai Nonaktifkan.`;

  return (
    <div className="w-[380px] shrink-0 flex flex-col bg-(--color-surface-subtle) min-h-0 overflow-hidden border-l border-(--color-border)">
      {/* Panel Header */}
      <div className="flex h-15.5 shrink-0 items-center gap-2.5 border-b border-(--color-border) px-3.5 bg-(--color-surface)">
        <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-[#F3EFFA] text-[#5B4394] text-[12.5px] font-semibold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate text-[15px] font-semibold text-(--color-text-primary) leading-snug">
            {isNew ? 'Subjek baru' : initialData?.nama}
          </div>
          <div className="truncate text-[11.5px] text-(--color-text-muted) leading-snug">
            {subtitle}
          </div>
        </div>
        <span
          className={`inline-flex items-center h-4.75 px-2.25 rounded-full text-[11px] font-semibold border whitespace-nowrap shrink-0 ${
            isNew
              ? 'border-(--color-border-strong) bg-(--color-surface-sunken) text-(--color-text-muted)'
              : form.aktif
                ? 'border-(--color-success) bg-(--color-success-subtle) text-(--color-success-fg)'
                : 'border-(--color-border-strong) bg-(--color-surface-sunken) text-(--color-text-muted)'
          }`}
        >
          {isNew ? 'Belum disimpan' : form.aktif ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>

      {/* Panel Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-2.5">
        {/* Soft Validation Error Summary */}
        {showErrors && errorList.length > 0 && (
          <div className="shrink-0 rounded-md border border-(--color-danger) bg-(--color-danger-subtle) p-2 text-xs leading-relaxed text-(--color-danger-fg)">
            <div className="font-semibold flex items-center gap-1.5">
              <Warning16Regular className="w-4 h-4 shrink-0" />
              <span>Belum bisa disimpan — {errorList.length} hal perlu dibereskan:</span>
            </div>
            <ul className="mt-1 pl-6 list-disc">
              {errorList.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Nama Lengkap */}
        <div className="flex flex-col gap-1 shrink-0">
          <label
            className={`text-[11.5px] ${
              showErrors && errNama ? 'text-(--color-danger-fg)' : 'text-(--color-text-secondary)'
            }`}
          >
            Nama lengkap <span className="text-(--color-danger)">*</span>
          </label>
          <input
            ref={namaInputRef}
            type="text"
            value={form.nama}
            onChange={(e) => setForm((prev) => ({ ...prev, nama: e.target.value }))}
            placeholder="mis. Bu Sari"
            className={`h-7 rounded px-2 text-[13.5px] bg-(--color-surface) focus:outline-none transition-colors border ${
              showErrors && errNama
                ? 'border-(--color-danger) border-b-2 text-(--color-text-primary)'
                : 'border-(--color-border-strong) text-(--color-text-primary) hover:border-(--color-border-muted) focus:border-(--color-brand)'
            }`}
          />
          {showErrors && errNama && (
            <div className="text-[11px] text-(--color-danger-fg) flex items-center gap-1">
              <Warning16Regular className="w-3.5 h-3.5 shrink-0" />
              <span>{errNama}</span>
            </div>
          )}
        </div>

        {/* Jenis Kelamin */}
        <div className="flex flex-col gap-1 shrink-0">
          <label className="text-[11.5px] text-(--color-text-secondary)">Jenis kelamin</label>
          <div className="flex h-7 w-48 rounded border border-(--color-border-strong) overflow-hidden bg-(--color-surface)">
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, kelamin: prev.kelamin === 'L' ? '' : 'L' }))
              }
              title={form.kelamin === 'L' ? 'Klik lagi untuk mengosongkan' : 'Laki-laki'}
              className={`flex-1 border-none text-[11.5px] cursor-pointer transition-colors ${
                form.kelamin === 'L'
                  ? 'bg-(--color-brand) text-white font-semibold'
                  : 'bg-transparent text-(--color-text-primary) hover:bg-(--color-surface-hover)'
              }`}
            >
              Laki-laki
            </button>
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, kelamin: prev.kelamin === 'P' ? '' : 'P' }))
              }
              title={form.kelamin === 'P' ? 'Klik lagi untuk mengosongkan' : 'Perempuan'}
              className={`flex-1 border-l border-(--color-border) text-[11.5px] cursor-pointer transition-colors ${
                form.kelamin === 'P'
                  ? 'bg-(--color-brand) text-white font-semibold'
                  : 'bg-transparent text-(--color-text-primary) hover:bg-(--color-surface-hover)'
              }`}
            >
              Perempuan
            </button>
          </div>
        </div>

        {/* Kontak */}
        <div className="flex flex-col gap-1 shrink-0">
          <label className="text-[11.5px] text-(--color-text-secondary)">Kontak</label>
          <input
            type="text"
            value={form.kontak}
            onChange={(e) => setForm((prev) => ({ ...prev, kontak: e.target.value }))}
            placeholder="opsional"
            className="h-7 rounded border border-(--color-border-strong) bg-(--color-surface) px-2 font-mono text-xs text-(--color-text-primary) placeholder:text-(--color-text-placeholder) focus:outline-none focus:border-(--color-brand)"
          />
        </div>

        {/* Mata Pelajaran yang Diampu */}
        <div className="flex flex-col gap-1.25 shrink-0">
          <label className="text-[11.5px] text-(--color-text-secondary)">
            Mata pelajaran yang diampu
          </label>
          <div className="flex flex-wrap gap-1.25 items-center">
            {form.mapel.map((mId) => {
              const mp = mapelList.find((m) => m.id === mId);
              return (
                <div
                  key={mId}
                  className="flex items-center gap-1.25 border border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand-ink) rounded-full pl-2.25 pr-1.25 py-0.5 text-[11.5px] max-w-full"
                >
                  <span className="truncate max-w-[130px]">{mp?.nama || mId}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        mapel: prev.mapel.filter((id) => id !== mId),
                      }))
                    }
                    title="Lepas mata pelajaran ini"
                    className="flex h-3.75 w-3.75 shrink-0 items-center justify-center rounded-full border-none bg-transparent hover:bg-[#CFE4FA] text-inherit cursor-pointer"
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                    >
                      <line x1="3.5" y1="3.5" x2="12.5" y2="12.5" />
                      <line x1="12.5" y1="3.5" x2="3.5" y2="12.5" />
                    </svg>
                  </button>
                </div>
              );
            })}

            {/* Tambah Mapel Popover */}
            <div ref={menuMapelRef} className="relative shrink-0">
              <button
                type="button"
                disabled={sisaMapel.length === 0}
                onClick={() => setMenuMapelOpen((prev) => !prev)}
                title={
                  sisaMapel.length === 0
                    ? 'Sudah mengampu semua mata pelajaran'
                    : 'Tambah mata pelajaran yang diampu'
                }
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11.5px] whitespace-nowrap transition-colors border border-dashed ${
                  sisaMapel.length === 0
                    ? 'border-(--color-border) text-(--color-text-disabled) cursor-not-allowed bg-transparent'
                    : 'border-(--color-border-strong) text-(--color-brand) hover:bg-(--color-brand-subtle) cursor-pointer bg-transparent'
                }`}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="shrink-0 relative top-[0.5px]"
                >
                  <line x1="8" y1="3" x2="8" y2="13" />
                  <line x1="3" y1="8" x2="13" y2="8" />
                </svg>
                tambah
              </button>
              {menuMapelOpen && (
                <div className="absolute left-0 top-[27px] z-12 w-52 max-h-49 overflow-y-auto rounded-md border border-(--color-border-strong) bg-(--color-surface) p-1 shadow-lg flex flex-col gap-0.5">
                  {sisaMapel.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, mapel: [...prev.mapel, m.id] }));
                        setMenuMapelOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.25 rounded border-none bg-transparent hover:bg-(--color-surface-hover) text-[12.5px] text-(--color-text-primary) cursor-pointer truncate"
                    >
                      {m.nama}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="text-[11px] text-(--color-text-muted) leading-relaxed">
            {form.mapel.length > 0
              ? 'Dipakai form kegiatan untuk menyarankan pengisi yang cocok — bukan pembatas keras.'
              : 'Belum mengampu mata pelajaran apa pun — tetap bisa dipilih sebagai pengisi mana saja.'}
          </div>
        </div>

        {/* RINGKASAN CARD (Edit mode only) */}
        {!isNew && (
          <div className="shrink-0 rounded-md border border-(--color-border) bg-(--color-surface) p-2.5">
            <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
              RINGKASAN
            </div>
            <div className="text-[12.5px] text-(--color-text-primary) leading-relaxed mt-1">
              {initialData?.ringkasanPenggunaan ||
                (initialData?.jumlahKegiatan
                  ? `${initialData.jumlahKegiatan} kegiatan tercatat memakai subjek ini.`
                  : 'Belum pernah dipasang di kegiatan mana pun.')}
            </div>
            {initialData && initialData.jumlahKegiatan && initialData.jumlahKegiatan > 0 ? (
              <button
                type="button"
                onClick={() => onLihatKegiatan(initialData.id)}
                className="mt-1.25 border-none bg-transparent p-0 text-xs text-(--color-brand) hover:underline cursor-pointer"
              >
                Lihat kegiatannya di daftar kegiatan
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Panel Footer */}
      <div className="flex h-12 shrink-0 items-center gap-1.75 border-t border-(--color-border) bg-(--color-surface) px-3.5">
        {!isNew && (
          <>
            <button
              type="button"
              onClick={() => {
                if (form.aktif && initialData) {
                  onMintaNonaktif(initialData);
                } else if (!form.aktif && initialData) {
                  onAktifkanKembali(initialData);
                }
              }}
              title={
                form.aktif
                  ? 'Sembunyikan dari pemilih subjek tanpa menghapus riwayat'
                  : 'Munculkan lagi di pemilih subjek'
              }
              className={`h-6.5 shrink-0 px-2.5 rounded border-none bg-transparent text-[12.5px] cursor-pointer whitespace-nowrap transition-colors hover:bg-(--color-surface-hover) ${
                form.aktif ? 'text-(--color-warning-fg)' : 'text-(--color-success-fg)'
              }`}
            >
              {form.aktif ? 'Nonaktifkan' : 'Aktifkan kembali'}
            </button>
            <button
              type="button"
              disabled={!canDelete}
              onClick={() => {
                if (canDelete && initialData) {
                  onMintaHapus(initialData);
                }
              }}
              title={deleteTitle}
              className={`h-6.5 shrink-0 px-2.5 rounded border-none bg-transparent text-[12.5px] whitespace-nowrap transition-colors ${
                canDelete
                  ? 'text-(--color-danger) hover:bg-(--color-danger-subtle) cursor-pointer'
                  : 'text-(--color-text-disabled) cursor-not-allowed'
              }`}
            >
              Hapus
            </button>
          </>
        )}

        <div className="flex-1 min-w-1.5" />

        <button
          type="button"
          onClick={onClose}
          className="h-6.5 shrink-0 px-3 rounded border border-(--color-border-strong) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-primary) text-[12.5px] cursor-pointer whitespace-nowrap transition-colors"
        >
          Batal
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          title={isNew ? 'Tambahkan subjek ini' : 'Simpan perubahan'}
          className="flex h-6.5 shrink-0 items-center gap-1.75 px-3 rounded border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-[12.5px] font-semibold cursor-pointer whitespace-nowrap transition-colors"
        >
          <span>{isNew ? 'Simpan subjek' : 'Simpan'}</span>
          <span className="font-mono text-[10px] opacity-75">Ctrl S</span>
        </button>
      </div>
    </div>
  );
}
