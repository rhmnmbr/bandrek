import { useState, useMemo, useEffect, useRef } from 'react';
import { Add16Regular } from '@fluentui/react-icons';
import type { Kelas } from '@/data/types/master';
import type { Siswa } from '@/data/types/master';

export interface KelasFormData {
  id?: string;
  nama: string;
  keterangan: string;
  anggota: string[];
}

interface KelasFormViewProps {
  kelas: Kelas | null;
  isNew: boolean;
  allSiswa: Siswa[];
  existingClasses: Kelas[];
  onSave: (data: KelasFormData) => Promise<void>;
  onDelete: () => void;
  onCancel: () => void;
  onViewKegiatan?: (kelasId: string) => void;
}

export function KelasFormView({
  kelas,
  isNew,
  allSiswa,
  existingClasses,
  onSave,
  onDelete,
  onCancel,
  onViewKegiatan,
}: KelasFormViewProps) {
  const [nama, setNama] = useState(kelas?.nama || '');
  const [keterangan, setKeterangan] = useState(kelas?.keterangan || '');
  const [anggota, setAnggota] = useState<string[]>(kelas?.anggota ? [...kelas.anggota] : []);
  const [dicoba, setDicoba] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Candidate member popover state
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuCari, setMenuCari] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const namaInputRef = useRef<HTMLInputElement>(null);

  // Sync state when selected kelas changes
  useEffect(() => {
    if (kelas) {
      setNama(kelas.nama || '');
      setKeterangan(kelas.keterangan || '');
      setAnggota(kelas.anggota ? [...kelas.anggota] : []);
    } else {
      setNama('');
      setKeterangan('');
      setAnggota([]);
    }
    setDicoba(false);
    setMenuOpen(false);
    setMenuCari('');
  }, [kelas, isNew]);

  // Focus search input when popover opens
  useEffect(() => {
    if (menuOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [menuOpen]);

  // Click outside to close popover
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Map of students for quick lookup
  const siswaMap = useMemo(() => {
    const map = new Map<string, Siswa>();
    for (const s of allSiswa) {
      map.set(s.id, s);
    }
    return map;
  }, [allSiswa]);

  // Validation errors
  const errors = useMemo(() => {
    const errs: string[] = [];
    const namaTrim = nama.trim();
    if (!namaTrim) {
      errs.push('Isi nama kelas.');
    } else {
      const isDuplicate = existingClasses.some(
        (c) =>
          c.id !== kelas?.id &&
          c.nama.trim().toLowerCase() === namaTrim.toLowerCase()
      );
      if (isDuplicate) {
        errs.push('Nama kelas sudah dipakai.');
      }
    }

    return errs;
  }, [nama, existingClasses, kelas]);

  const hasNamaError = dicoba && (!nama.trim() || errors.includes('Nama kelas sudah dipakai.'));

  // Filter candidate students for popover (any active student not yet added)
  const candidateStudents = useMemo(() => {
    const q = menuCari.trim().toLowerCase();
    const anggotaSet = new Set(anggota);

    let list = allSiswa.filter((s) => s.aktif && !anggotaSet.has(s.id));
    if (q) {
      list = list.filter((s) => s.nama.toLowerCase().includes(q));
    }

    return list
      .sort((a, b) => a.nama.localeCompare(b.nama, 'id'))
      .slice(0, 40);
  }, [allSiswa, anggota, menuCari]);

  // Actions
  const handleAddMember = (siswaId: string) => {
    if (!anggota.includes(siswaId)) {
      setAnggota((prev) => [...prev, siswaId]);
    }
  };

  const handleRemoveMember = (siswaId: string) => {
    setAnggota((prev) => prev.filter((id) => id !== siswaId));
  };

  const handleSubmit = async () => {
    setDicoba(true);
    if (errors.length > 0) {
      if (hasNamaError) {
        namaInputRef.current?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: kelas?.id,
        nama: nama.trim(),
        keterangan: keterangan.trim(),
        anggota,
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
        if (menuOpen) {
          e.preventDefault();
          setMenuOpen(false);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit, menuOpen]);

  // Header texts
  const inisial = isNew
    ? '+'
    : (kelas?.nama || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

  const panelJudul = isNew ? 'Kelas baru' : kelas?.nama || '';
  const panelSub = isNew
    ? 'Isi datanya, lalu simpan'
    : `${anggota.length} anggota · ${kelas?.jumlahKegiatan || 0} kegiatan`;

  const simpanDisabled = dicoba && errors.length > 0;
  const bisaHapus = Boolean(kelas?.id && kelas.dapatDihapus);
  const hapusTitle = !kelas?.id
    ? 'Belum ada yang bisa dihapus'
    : !kelas.dapatDihapus
    ? kelas.alasanTidakBisaHapus ||
      `Tidak bisa dihapus: dipakai sebagai sumber impor di ${kelas.jumlahKegiatanLangsung || 0} kegiatan. Ubah dulu kegiatan itu.`
    : (kelas.jumlahKegiatan || 0) > 0
    ? `Aman dihapus — ${kelas.jumlahKegiatan} kegiatan menyentuh kelas ini lewat anggotanya, tapi tidak ada yang menunjuk kelas ini.`
    : 'Hapus permanen — belum dipakai di mana pun';

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-(--color-surface)">
      {/* Panel Header */}
      <div className="flex h-13 shrink-0 items-center gap-2.5 border-b border-(--color-border) bg-(--color-surface) px-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-(--color-brand-subtle) text-[12.5px] font-semibold text-(--color-brand)">
          {isNew ? <Add16Regular className="w-4 h-4" /> : inisial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-(--color-text-primary) leading-tight truncate">
            {panelJudul}
          </div>
          <div className="text-[11.5px] text-(--color-text-muted) leading-snug truncate">
            {panelSub}
          </div>
        </div>
      </div>

      {/* Panel Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-row flex-wrap content-start gap-2.75">
        {/* Error Summary Alert Box */}
        {dicoba && errors.length > 0 && (
          <div className="flex-[1_1_100%] rounded-md border border-(--color-danger) bg-(--color-danger-subtle) p-2 text-xs leading-relaxed text-(--color-danger-fg)">
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

        {/* Nama Kelas (flex 1 1 240px, min-w 200px) */}
        <div className="flex-[1_1_240px] min-w-50 flex flex-col gap-1">
          <label className="text-[11.5px] text-(--color-text-secondary) flex items-center gap-1 min-h-4.5">
            Nama kelas <span className="text-(--color-danger)">*</span>
          </label>
          <input
            ref={namaInputRef}
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="mis. Kelas Reguler Sore"
            className={`h-7 px-2 text-[13.5px] rounded-sm border bg-(--color-surface) outline-none transition-colors ${
              hasNamaError
                ? 'border-(--color-danger) focus:border-(--color-danger)'
                : 'border-(--color-border) focus:border-(--color-brand)'
            }`}
          />
          {hasNamaError && (
            <div className="text-[11px] text-(--color-danger) flex items-center gap-1 leading-tight">
              <span>⚠</span>
              <span>{errors.find((e) => e.includes('nama')) || 'Isi nama kelas.'}</span>
            </div>
          )}
        </div>

        {/* Keterangan (flex 1 1 280px, min-w 220px) */}
        <div className="flex-[1_1_280px] min-w-55 flex flex-col gap-1">
          <label className="text-[11.5px] text-(--color-text-secondary) flex items-center gap-1 min-h-4.5">
            Keterangan
          </label>
          <input
            type="text"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="opsional — mis. Sesi sore Senin & Rabu"
            className="h-7 px-2 text-[13.5px] rounded-sm border border-(--color-border) bg-(--color-surface) outline-none focus:border-(--color-brand) transition-colors"
          />
        </div>

        {/* Anggota Siswa (flex 1 1 340px, min-w 300px) */}
        <div className="flex-[1_1_340px] min-w-75 flex flex-col gap-1">
          <div className="flex items-center justify-between min-h-4.5">
            <label className="text-[11.5px] text-(--color-text-secondary)">
              Anggota · {anggota.length} siswa
            </label>

            {/* Candidate Search Popover Anchor */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="h-6 px-2 border border-(--color-border) rounded bg-(--color-surface) text-(--color-brand) text-[11.5px] font-medium inline-flex items-center gap-1 hover:bg-(--color-brand-subtle) transition-colors cursor-pointer"
              >
                <Add16Regular className="w-3.5 h-3.5 shrink-0" />
                <span>Tambah siswa</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-6.5 z-20 w-65 rounded-md border border-(--color-border) bg-(--color-surface) p-1.5 shadow-lg flex flex-col gap-1">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={menuCari}
                    onChange={(e) => setMenuCari(e.target.value)}
                    placeholder="Cari siswa"
                    className="h-6.5 px-2 text-xs rounded-sm border border-(--color-border) bg-(--color-surface) outline-none focus:border-(--color-brand)"
                  />
                  <div className="max-h-50 overflow-y-auto overflow-x-hidden flex flex-col gap-0.5">
                    {candidateStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          handleAddMember(s.id);
                        }}
                        title="Masukkan ke kelas ini"
                        className="flex h-7.5 shrink-0 items-center justify-between gap-1.5 w-full text-left px-2 rounded-sm border-none bg-transparent hover:bg-(--color-brand-subtle) text-[12.5px] text-(--color-text-primary) cursor-pointer transition-colors"
                      >
                        <span className="truncate flex-1 min-w-0">{s.nama}</span>
                        {s.jenjang && (
                          <span className="shrink-0 text-[11px] text-(--color-text-muted)">
                            {s.jenjang}
                          </span>
                        )}
                      </button>
                    ))}
                    {candidateStudents.length === 0 && (
                      <div className="p-3 text-center text-xs text-(--color-text-muted) leading-relaxed">
                        {menuCari.trim()
                          ? 'Tidak ada siswa aktif yang cocok.'
                          : 'Semua siswa aktif sudah tergabung.'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Member List Container */}
          <div className="border border-(--color-border) rounded-sm bg-(--color-surface) max-h-51.5 overflow-y-auto overflow-x-hidden">
            {anggota.map((id, i) => {
              const s = siswaMap.get(id);
              const isMati = s?.aktif === false;
              const displayName = s?.nama || id;

              return (
                <div
                  key={id}
                  className={`flex h-7.5 items-center gap-1.5 px-2.5 hover:bg-(--color-surface-alt) transition-colors ${
                    i > 0 ? 'border-t border-(--color-border-subtle)' : ''
                  }`}
                >
                  <span
                    className={`flex-1 min-w-0 text-[12.5px] truncate ${
                      isMati ? 'text-(--color-text-muted)' : 'text-(--color-text-primary)'
                    }`}
                  >
                    {displayName}
                  </span>

                  {/* Meta badge */}
                  {isMati ? (
                    <span className="shrink-0 text-[11px] text-(--color-text-muted) whitespace-nowrap">
                      nonaktif
                    </span>
                  ) : s?.jenjang ? (
                    <span className="shrink-0 text-[11px] text-(--color-text-muted) whitespace-nowrap">
                      {s.jenjang}
                    </span>
                  ) : null}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(id)}
                    title={`Keluarkan ${displayName} dari kelas ini`}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-none bg-transparent text-(--color-text-muted) hover:bg-(--color-danger-subtle) hover:text-(--color-danger) transition-colors cursor-pointer"
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

            {anggota.length === 0 && (
              <div className="p-3 text-center text-xs text-(--color-text-muted) leading-relaxed">
                Belum ada anggota. Pakai "+ Tambah siswa" di atas.
              </div>
            )}
          </div>

          {/* Member Note */}
          <div className="text-[11px] text-(--color-text-muted) leading-snug">
            {anggota.length > 0
              ? 'Mengeluarkan anggota tidak menghapus riwayat kehadirannya.'
              : 'Kelas kosong tetap bisa disimpan dan diisi nanti.'}
          </div>
        </div>

        {/* Info Card: KELAS ITU PINTASAN (flex 1 1 210px, min-w 190px) */}
        <div className="flex-[1_1_210px] min-w-47.5 rounded-md border border-(--color-border) bg-(--color-surface-alt) p-2.5">
          <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
            KELAS ITU PINTASAN
          </div>
          <div className="text-[12.5px] leading-relaxed mt-1 text-(--color-text-secondary)">
            Mengubah anggota kelas tidak mengubah kegiatan yang sudah dibuat — kelas hanya dipakai saat "+ Dari kelas" di form kegiatan. Satu siswa boleh ada di beberapa kelas.
          </div>
        </div>

        {/* Ringkasan Card (only when editing existing class) */}
        {!isNew && kelas && (
          <div className="flex-[1_1_100%] rounded-md border border-(--color-border) bg-(--color-surface) p-2.5">
            <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
              RINGKASAN
            </div>
            <div className="text-[12.5px] leading-relaxed mt-1 text-(--color-text-primary)">
              {kelas.ringkasanPenggunaan}
            </div>
            {(kelas.jumlahKegiatan || 0) > 0 && onViewKegiatan && (
              <button
                type="button"
                onClick={() => onViewKegiatan(kelas.id)}
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
        {!isNew && (
          <button
            type="button"
            onClick={onDelete}
            disabled={!bisaHapus}
            title={hapusTitle}
            className={`h-6.5 px-2.5 rounded border-none text-[12.5px] transition-colors ${
              bisaHapus
                ? 'bg-transparent text-(--color-danger) hover:bg-(--color-danger-subtle) cursor-pointer'
                : 'bg-transparent text-(--color-text-disabled) cursor-not-allowed'
            }`}
          >
            Hapus
          </button>
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
          className={`h-6.5 px-3 rounded border-none text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            simpanDisabled || isSubmitting
              ? 'bg-(--color-surface-sunken) text-(--color-text-disabled) cursor-not-allowed'
              : 'bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white cursor-pointer'
          }`}
        >
          <span>{isNew ? 'Simpan kelas' : 'Simpan'}</span>
        </button>
      </div>
    </div>
  );
}
