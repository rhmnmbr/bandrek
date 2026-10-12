import { useState, useEffect, useRef } from 'react';
import { Add16Regular } from '@fluentui/react-icons';
import { Select } from '@/components/ui/select';
import type { JenjangPendidikan, JenisKelamin } from '@/data/types/common';
import type { Siswa, Kelas } from '@/data/types/master';
import { formatTanggalSlash, formatTanggalTahun, hitungUmur, toIso, NAMA_BULAN } from '@/lib/dateUtils';

const SIMULATED_TODAY = '2026-09-16';

export interface SiswaFormData {
  id?: string;
  nama: string;
  jenjang: JenjangPendidikan | '';
  aktif: boolean;
  lahir: string;
  kelamin: JenisKelamin | '';
  asal: string;
  waliNama: string;
  waliWa: string;
  bergabung: string;
  catatan: string;
}

interface SiswaFormPanelProps {
  isOpen: boolean;
  initialData: Siswa | null; // null = new mode
  allSiswa: Siswa[];
  kelasList: Kelas[];
  onClose: () => void;
  onSave: (data: SiswaFormData) => void;
  onMintaNonaktif: (siswa: Siswa) => void;
  onAktifkanKembali: (siswa: Siswa) => void;
  onMintaHapus: (siswa: Siswa) => void;
  onUbahKelas: (kelasId: string, siswaId: string, tambah: boolean) => void;
  onLihatKegiatan: (siswaId: string, namaSiswa?: string) => void;
  today?: string;
}

function getInitialFormData(initialData: Siswa | null, today: string): SiswaFormData {
  if (initialData) {
    return {
      id: initialData.id,
      nama: initialData.nama,
      jenjang: initialData.jenjang,
      aktif: initialData.aktif,
      lahir: initialData.lahir || '',
      kelamin: initialData.kelamin || '',
      asal: initialData.asal || '',
      waliNama: initialData.waliNama || '',
      waliWa: initialData.waliWa || '',
      bergabung: initialData.bergabung || today,
      catatan: initialData.catatan || '',
    };
  }
  return {
    nama: '',
    jenjang: '',
    aktif: true,
    lahir: '',
    kelamin: '',
    asal: '',
    waliNama: '',
    waliWa: '',
    bergabung: today,
    catatan: '',
  };
}

export function SiswaFormPanel({
  isOpen,
  initialData,
  allSiswa,
  kelasList,
  onClose,
  onSave,
  onMintaNonaktif,
  onAktifkanKembali,
  onMintaHapus,
  onUbahKelas,
  onLihatKegiatan,
  today = SIMULATED_TODAY,
}: SiswaFormPanelProps) {
  const isNew = !initialData;

  const [form, setForm] = useState<SiswaFormData>(() => getInitialFormData(initialData, today));

  const [dicoba, setDicoba] = useState(false);
  const [calOpen, setCalOpen] = useState<'lahir' | 'gabung' | null>(null);
  const [calMonth, setCalMonth] = useState<Date>(new Date(today));
  const [menuKelasOpen, setMenuKelasOpen] = useState(false);

  const namaInputRef = useRef<HTMLInputElement>(null);
  const calRef = useRef<HTMLDivElement>(null);
  const menuKelasRef = useRef<HTMLDivElement>(null);

  // Sync form when initialData changes
  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id,
        nama: initialData.nama,
        jenjang: initialData.jenjang,
        aktif: initialData.aktif,
        lahir: initialData.lahir || '',
        kelamin: initialData.kelamin || '',
        asal: initialData.asal || '',
        waliNama: initialData.waliNama || '',
        waliWa: initialData.waliWa || '',
        bergabung: initialData.bergabung || today,
        catatan: initialData.catatan || '',
      });
    } else {
      setForm({
        nama: '',
        jenjang: '',
        aktif: true,
        lahir: '',
        kelamin: '',
        asal: '',
        waliNama: '',
        waliWa: '',
        bergabung: today,
        catatan: '',
      });
    }
    setDicoba(false);
    setCalOpen(null);
    setMenuKelasOpen(false);
  }, [initialData, today, isOpen]);

  // Focus nama on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        namaInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Click outside listener for calendar and class menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setCalOpen(null);
      }
      if (menuKelasRef.current && !menuKelasRef.current.contains(e.target as Node)) {
        setMenuKelasOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validation rules matching prototype line 5679
  const errors: {
    nama?: string;
    lahir?: string;
    jenjang?: string;
    wa?: string;
  } = {};

  const namaTrimmed = form.nama.trim();
  if (!namaTrimmed) {
    errors.nama = 'Nama lengkap harus diisi.';
  } else {
    const kembar = allSiswa.find(
      (x) => x.id !== form.id && x.nama.trim().toLowerCase() === namaTrimmed.toLowerCase()
    );
    if (kembar) {
      errors.nama = `Sudah ada siswa bernama “${kembar.nama}”. Bedakan namanya supaya tidak tertukar saat memilih peserta.`;
    }
  }

  if (!form.lahir) {
    errors.lahir = 'Tanggal lahir harus diisi — dipakai untuk memilah jenjang.';
  } else if (form.lahir >= today) {
    errors.lahir = 'Tanggal lahir harus sebelum hari ini.';
  }

  if (!form.jenjang) {
    errors.jenjang = 'Jenjang harus dipilih — matriks belajar memakainya untuk menentukan kolom materi.';
  }

  const waTrimmed = form.waliWa.trim();
  if (waTrimmed && !/^[0-9+][0-9 x\-().]{6,}$/i.test(waTrimmed)) {
    errors.wa = 'Nomor WhatsApp hanya boleh angka, spasi, dan tanda - + ( ).';
  }

  const hasErrors = Object.keys(errors).length > 0;

  const handleSave = () => {
    setDicoba(true);
    if (hasErrors) {
      if (errors.nama) {
        namaInputRef.current?.focus();
      }
      return;
    }
    onSave(form);
  };

  // Keyboard shortcut Ctrl+S inside panel
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape' && !calOpen && !menuKelasOpen) {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isOpen) return null;

  // Header meta
  const displayName = initialData?.nama || form.nama;
  const inisial = isNew
    ? '+'
    : displayName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase() || '?';

  const enrolledClasses = initialData?.daftarKelasDetail || [];
  const classesSub =
    enrolledClasses.length > 0
      ? enrolledClasses.map((k) => k.nama).join(', ')
      : 'belum masuk kelas';

  const panelSub = isNew
    ? 'Isi data dasarnya, lalu simpan'
    : `${initialData?.jenjang || ''}${
        initialData?.bergabung ? ` · bergabung ${formatTanggalTahun(initialData.bergabung)}` : ''
      } · ${classesSub}`;

  const umur = form.lahir ? hitungUmur(form.lahir, today) : null;
  const jenjangBeda = Boolean(initialData && form.jenjang && form.jenjang !== initialData.jenjang);

  // Available classes to add
  const availableClassesToAdd = isNew
    ? []
    : kelasList.filter(
        (k) =>
          (!k.jenjang || k.jenjang === form.jenjang) &&
          !enrolledClasses.some((ec) => ec.id === k.id)
      );

  const canAddClass = !isNew && availableClassesToAdd.length > 0;
  const addClassTooltip = isNew
    ? 'Simpan siswanya dulu, baru bisa dimasukkan ke kelas'
    : availableClassesToAdd.length === 0
      ? `Sudah masuk semua kelas jenjang ${form.jenjang || ''}`
      : 'Masukkan ke kelas lain';

  // Calendar helpers
  const handleOpenCal = (type: 'lahir' | 'gabung') => {
    const curVal = type === 'lahir' ? form.lahir : form.bergabung;
    if (curVal) {
      setCalMonth(new Date(curVal));
    } else {
      setCalMonth(new Date(today));
    }
    setCalOpen(type);
  };

  const renderCalendar = () => {
    if (!calOpen) return null;
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday-based start: 0 = Mon, 6 = Sun
    const startDow = (firstDay.getDay() + 6) % 7;

    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    for (let i = 0; i < startDow; i++) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    const curSelected = calOpen === 'lahir' ? form.lahir : form.bergabung;

    return (
      <div
        ref={calRef}
        className={`absolute ${
          calOpen === 'gabung' ? 'right-0' : 'left-0'
        } top-7.5 z-20 w-66.5 rounded-lg border border-(--color-border-strong) bg-(--color-surface) p-2.5 shadow-xl animate-in fade-in-0 duration-100`}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex-1 text-[13.5px] font-semibold text-(--color-text-primary)">
            {NAMA_BULAN[month]} {year}
          </div>
          <button
            type="button"
            onClick={() => setCalMonth(new Date(year, month - 1, 1))}
            title="Bulan sebelumnya"
            className="flex h-5.5 w-5.5 items-center justify-center rounded border-none bg-transparent hover:bg-(--color-surface-alt) text-(--color-text-secondary) cursor-pointer"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setCalMonth(new Date(year, month + 1, 1))}
            title="Bulan berikutnya"
            className="flex h-5.5 w-5.5 items-center justify-center rounded border-none bg-transparent hover:bg-(--color-surface-alt) text-(--color-text-secondary) cursor-pointer"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold text-(--color-text-muted) mb-1">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {weeks.map((week, widx) => (
          <div key={widx} className="grid grid-cols-7 gap-0.5 mb-0.5">
            {week.map((d, didx) => {
              if (d === null) return <div key={didx} />;
              const iso = toIso(new Date(year, month, d));
              const isSelected = iso === curSelected;
              const isToday = iso === today;

              return (
                <button
                  key={didx}
                  type="button"
                  onClick={() => {
                    if (calOpen === 'lahir') {
                      setForm((prev) => ({ ...prev, lahir: iso }));
                    } else {
                      setForm((prev) => ({ ...prev, bergabung: iso }));
                    }
                    setCalOpen(null);
                  }}
                  className={`h-6.5 rounded-full border-none text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-(--color-brand) text-white font-semibold'
                      : isToday
                        ? 'border border-(--color-brand) text-(--color-brand) font-semibold hover:bg-(--color-brand-subtle)'
                        : 'text-(--color-text-primary) hover:bg-(--color-surface-alt)'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        ))}

        <div className="flex justify-between border-t border-(--color-border) pt-1.5 mt-1 text-[12.5px]">
          <button
            type="button"
            onClick={() => {
              if (calOpen === 'lahir') {
                setForm((prev) => ({ ...prev, lahir: '' }));
              } else {
                setForm((prev) => ({ ...prev, bergabung: '' }));
              }
              setCalOpen(null);
            }}
            className="border-none bg-transparent p-0 text-(--color-brand) cursor-pointer hover:underline"
          >
            Bersihkan
          </button>
          <button
            type="button"
            onClick={() => {
              if (calOpen === 'lahir') {
                setForm((prev) => ({ ...prev, lahir: today }));
              } else {
                setForm((prev) => ({ ...prev, bergabung: today }));
              }
              setCalOpen(null);
            }}
            className="border-none bg-transparent p-0 text-(--color-brand) cursor-pointer hover:underline"
          >
            Hari ini
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-95 shrink-0 flex-col bg-(--color-surface-alt) border-l border-(--color-border) min-h-0 overflow-hidden">
      {/* Panel Header */}
      <div className="flex h-14.5 shrink-0 items-center gap-2.5 border-b border-(--color-border) bg-(--color-surface) px-3.5 py-3">
        <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-(--color-brand-subtle) text-[12.5px] font-semibold text-(--color-brand-ink)">
          {isNew ? <Add16Regular className="w-4 h-4" /> : inisial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate text-[15px] font-semibold leading-tight text-(--color-text-primary)">
            {isNew ? 'Siswa baru' : initialData?.nama || form.nama}
          </div>
          <div className="truncate text-[11.5px] leading-tight text-(--color-text-muted)">
            {panelSub}
          </div>
        </div>
        <span
          className={`inline-flex h-4.75 shrink-0 items-center px-2.25 rounded-full text-[11px] font-semibold border whitespace-nowrap ${
            isNew
              ? 'border-(--color-border-strong) bg-(--color-surface-sunken) text-(--color-text-muted)'
              : form.aktif
                ? 'border-(--color-success) bg-(--color-success-bg) text-(--color-success-ink)'
                : 'border-(--color-border-strong) bg-(--color-surface-sunken) text-(--color-text-muted)'
          }`}
        >
          {isNew ? 'Belum disimpan' : form.aktif ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>

      {/* Panel Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-2.5">
        {/* Error Summary Box */}
        {dicoba && hasErrors && (
          <div className="shrink-0 rounded-md border border-(--color-danger) bg-(--color-danger-bg) p-2 text-xs leading-relaxed text-(--color-danger-ink)">
            <div className="flex gap-1.75 font-semibold">
              <span>⚠</span>
              <span>
                Belum bisa disimpan — {Object.keys(errors).length} hal perlu dibereskan:
              </span>
            </div>
            <ul className="m-0 mt-1 pl-6 list-disc space-y-0.5">
              {Object.values(errors).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Nama Lengkap */}
        <div className="flex shrink-0 flex-col gap-1">
          <label
            className={`text-[11.5px] ${
              dicoba && errors.nama ? 'text-(--color-danger-ink) font-semibold' : 'text-(--color-text-secondary)'
            }`}
          >
            Nama lengkap <span className="text-(--color-danger)">*</span>
          </label>
          <input
            ref={namaInputRef}
            type="text"
            value={form.nama}
            onChange={(e) => setForm((prev) => ({ ...prev, nama: e.target.value }))}
            placeholder="mis. Nabila Syifa Ramadhani"
            className={`h-7 rounded border bg-(--color-surface) px-2 text-[13.5px] text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:border-(--color-brand) focus:outline-none ${
              dicoba && errors.nama
                ? 'border-(--color-danger) border-b-2'
                : 'border-(--color-border-strong)'
            }`}
          />
          {dicoba && errors.nama && (
            <div className="flex items-center gap-1 text-[11px] text-(--color-danger-ink)">
              <span>⚠</span>
              <span>{errors.nama}</span>
            </div>
          )}
        </div>

        {/* Tanggal Lahir & Jenis Kelamin */}
        <div className="flex shrink-0 gap-2.25 items-start">
          {/* Tanggal Lahir */}
          <div className="w-36 shrink-0 flex flex-col gap-1">
            <label
              className={`text-[11.5px] ${
                dicoba && errors.lahir ? 'text-(--color-danger-ink) font-semibold' : 'text-(--color-text-secondary)'
              }`}
            >
              Tanggal lahir <span className="text-(--color-danger)">*</span>
            </label>
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => handleOpenCal('lahir')}
                className={`flex h-7 w-full items-center justify-between rounded border bg-(--color-surface) px-2 font-mono text-[12.5px] cursor-pointer text-(--color-text-primary) ${
                  dicoba && errors.lahir
                    ? 'border-(--color-danger) border-b-2'
                    : 'border-(--color-border-strong)'
                }`}
              >
                <span>{form.lahir ? formatTanggalSlash(form.lahir) : 'Pilih tanggal'}</span>
                <svg width="13" height="13" viewBox="0 0 20 20" className="text-(--color-text-muted)">
                  <path
                    fill="currentColor"
                    d="M6 2a1 1 0 0 1 1 1v1h6V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 19 6.5v9A2.5 2.5 0 0 1 16.5 18h-13A2.5 2.5 0 0 1 1 15.5v-9A2.5 2.5 0 0 1 3.5 4H5V3a1 1 0 0 1 1-1ZM3 8v7.5c0 .28.22.5.5.5h13a.5.5 0 0 0 .5-.5V8H3Z"
                  />
                </svg>
              </button>
              {calOpen === 'lahir' && renderCalendar()}
            </div>
            {dicoba && errors.lahir && (
              <div className="flex items-center gap-1 text-[11px] text-(--color-danger-ink)">
                <span>⚠</span>
                <span>{errors.lahir}</span>
              </div>
            )}
            {umur !== null && (
              <div className="text-[11px] text-(--color-text-muted)">{umur} tahun</div>
            )}
          </div>

          {/* Jenis Kelamin */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <label className="text-[11.5px] text-(--color-text-secondary)">Jenis kelamin</label>
            <div className="flex h-7 rounded border border-(--color-border-strong) overflow-hidden bg-(--color-surface)">
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, kelamin: prev.kelamin === 'L' ? '' : 'L' }))
                }
                title="Laki-laki"
                className={`flex-1 min-w-0 border-none text-[11.5px] cursor-pointer transition-colors ${
                  form.kelamin === 'L'
                    ? 'bg-(--color-brand) text-white font-semibold'
                    : 'bg-(--color-surface) text-(--color-text-primary) hover:bg-(--color-surface-alt)'
                }`}
              >
                Laki-laki
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, kelamin: prev.kelamin === 'P' ? '' : 'P' }))
                }
                title="Perempuan"
                className={`flex-1 min-w-0 border-none border-l border-(--color-border) text-[11.5px] cursor-pointer transition-colors ${
                  form.kelamin === 'P'
                    ? 'bg-(--color-brand) text-white font-semibold'
                    : 'bg-(--color-surface) text-(--color-text-primary) hover:bg-(--color-surface-alt)'
                }`}
              >
                Perempuan
              </button>
            </div>
          </div>
        </div>

        {/* Jenjang & Tanggal Bergabung */}
        <div className="flex shrink-0 gap-2.25 items-start">
          {/* Jenjang */}
          <div className="w-27.5 shrink-0 flex flex-col gap-1">
            <label
              className={`text-[11.5px] ${
                dicoba && errors.jenjang ? 'text-(--color-danger-ink) font-semibold' : 'text-(--color-text-secondary)'
              }`}
            >
              Jenjang <span className="text-(--color-danger)">*</span>
            </label>
            <Select
              value={form.jenjang}
              onValueChange={(val) =>
                setForm((prev) => ({
                  ...prev,
                  jenjang: val as JenjangPendidikan | '',
                }))
              }
              placeholder="Pilih"
              error={Boolean(dicoba && errors.jenjang)}
              className="h-7 text-[13.5px]"
            >
              <option value="">Pilih</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
            </Select>
            {dicoba && errors.jenjang && (
              <div className="flex items-center gap-1 text-[11px] text-(--color-danger-ink)">
                <span>⚠</span>
                <span>{errors.jenjang}</span>
              </div>
            )}
          </div>

          {/* Tanggal Bergabung */}
          <div className="w-36 shrink-0 flex flex-col gap-1">
            <label className="text-[11.5px] text-(--color-text-secondary)">Tanggal bergabung</label>
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => handleOpenCal('gabung')}
                className="flex h-7 w-full items-center justify-between rounded border border-(--color-border-strong) bg-(--color-surface) px-2 font-mono text-[12.5px] cursor-pointer text-(--color-text-primary)"
              >
                <span>
                  {form.bergabung ? formatTanggalSlash(form.bergabung) : 'Pilih tanggal'}
                </span>
                <svg width="13" height="13" viewBox="0 0 20 20" className="text-(--color-text-muted)">
                  <path
                    fill="currentColor"
                    d="M6 2a1 1 0 0 1 1 1v1h6V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 19 6.5v9A2.5 2.5 0 0 1 16.5 18h-13A2.5 2.5 0 0 1 1 15.5v-9A2.5 2.5 0 0 1 3.5 4H5V3a1 1 0 0 1 1-1ZM3 8v7.5c0 .28.22.5.5.5h13a.5.5 0 0 0 .5-.5V8H3Z"
                  />
                </svg>
              </button>
              {calOpen === 'gabung' && renderCalendar()}
            </div>
          </div>
        </div>

        {/* Peringatan Ganti Jenjang */}
        {jenjangBeda && (
          <div className="shrink-0 rounded-md border border-(--color-warning) bg-(--color-warning-bg) p-2 text-[11.5px] leading-relaxed text-(--color-warning-ink) flex gap-1.75">
            <span className="shrink-0">⚠</span>
            <span>
              Memindahkan {initialData?.nama || 'siswa ini'} dari {initialData?.jenjang} ke{' '}
              {form.jenjang} mengganti kolom materi yang berlaku untuknya di matriks belajar.
              Kehadiran lama tetap tersimpan.
            </span>
          </div>
        )}

        {/* Asal Sekolah */}
        <div className="flex shrink-0 flex-col gap-1">
          <label className="text-[11.5px] text-(--color-text-secondary)">Asal sekolah</label>
          <input
            type="text"
            value={form.asal}
            onChange={(e) => setForm((prev) => ({ ...prev, asal: e.target.value }))}
            placeholder="opsional"
            className="h-7 rounded border border-(--color-border-strong) bg-(--color-surface) px-2 text-[13.5px] text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:border-(--color-brand) focus:outline-none"
          />
        </div>

        {/* Wali & WhatsApp */}
        <div className="flex shrink-0 gap-2.25 items-start">
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <label className="text-[11.5px] text-(--color-text-secondary)">Nama wali</label>
            <input
              type="text"
              value={form.waliNama}
              onChange={(e) => setForm((prev) => ({ ...prev, waliNama: e.target.value }))}
              placeholder="opsional"
              className="h-7 rounded border border-(--color-border-strong) bg-(--color-surface) px-2 text-[13.5px] text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:border-(--color-brand) focus:outline-none"
            />
          </div>
          <div className="w-36.5 shrink-0 flex flex-col gap-1">
            <label
              className={`text-[11.5px] ${
                dicoba && errors.wa ? 'text-(--color-danger-ink) font-semibold' : 'text-(--color-text-secondary)'
              }`}
            >
              No. WhatsApp
            </label>
            <input
              type="text"
              value={form.waliWa}
              onChange={(e) => setForm((prev) => ({ ...prev, waliWa: e.target.value }))}
              placeholder="opsional"
              className={`h-7 rounded border bg-(--color-surface) px-2 font-mono text-xs text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:border-(--color-brand) focus:outline-none ${
                dicoba && errors.wa
                  ? 'border-(--color-danger) border-b-2'
                  : 'border-(--color-border-strong)'
              }`}
            />
            {dicoba && errors.wa && (
              <div className="flex items-center gap-1 text-[11px] text-(--color-danger-ink)">
                <span>⚠</span>
                <span>{errors.wa}</span>
              </div>
            )}
          </div>
        </div>

        {/* Kelas Yang Diikuti */}
        <div className="flex shrink-0 flex-col gap-1.25">
          <label className="text-[11.5px] text-(--color-text-secondary)">Kelas yang diikuti</label>
          <div className="flex flex-wrap items-center gap-1.25">
            {enrolledClasses.map((k) => (
              <div
                key={k.id}
                className="flex items-center gap-1 rounded-full border border-(--color-brand) bg-(--color-brand-subtle) px-2 py-0.5 text-[11.5px] text-(--color-brand-ink) max-w-full"
              >
                <span className="truncate">{k.nama}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (initialData) {
                      onUbahKelas(k.id, initialData.id, false);
                    }
                  }}
                  title="Keluarkan dari kelas ini"
                  className="flex h-3.75 w-3.75 items-center justify-center rounded-full border-none bg-transparent hover:bg-(--color-border) text-inherit cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Tambah Kelas Popover */}
            <div className="relative shrink-0" ref={menuKelasRef}>
              <button
                type="button"
                onClick={() => {
                  if (canAddClass) setMenuKelasOpen((prev) => !prev);
                }}
                disabled={!canAddClass}
                title={addClassTooltip}
                className={`inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-[11.5px] whitespace-nowrap transition-colors ${
                  canAddClass
                    ? 'border-(--color-border-strong) text-(--color-brand) hover:bg-(--color-brand-subtle) cursor-pointer'
                    : 'border-(--color-border) text-(--color-text-disabled) cursor-not-allowed'
                }`}
              >
                + tambah kelas
              </button>

              {menuKelasOpen && (
                <div className="absolute left-0 top-6.75 z-10 w-57 max-h-49 overflow-y-auto rounded-md border border-(--color-border-strong) bg-(--color-surface) p-1 shadow-xl flex flex-col gap-0.25">
                  {availableClassesToAdd.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => {
                        if (initialData) {
                          onUbahKelas(k.id, initialData.id, true);
                          setMenuKelasOpen(false);
                        }
                      }}
                      title={`Masukkan ke ${k.nama}`}
                      className="w-full rounded p-1.5 text-left hover:bg-(--color-brand-subtle) border-none bg-transparent cursor-pointer flex flex-col gap-0.25"
                    >
                      <span className="truncate text-[12.5px] font-medium text-(--color-text-primary)">
                        {k.nama}
                      </span>
                      <span className="truncate text-[11px] text-(--color-text-muted)">
                        {k.anggota.length} siswa · {k.keterangan || k.jenjang}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {!isNew && enrolledClasses.length === 0 && (
            <div className="text-[11px] text-(--color-text-muted)">
              Belum masuk kelas mana pun — masih bisa dipilih satu-satu saat membuat kegiatan.
            </div>
          )}
        </div>

        {/* Catatan */}
        <div className="flex shrink-0 flex-col gap-1">
          <label className="text-[11.5px] text-(--color-text-secondary)">Catatan</label>
          <textarea
            value={form.catatan}
            onChange={(e) => setForm((prev) => ({ ...prev, catatan: e.target.value }))}
            rows={3}
            placeholder="Catatan internal tentang siswa"
            className="h-15.5 rounded border border-(--color-border-strong) bg-(--color-surface) p-2 text-[12.5px] text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:border-(--color-brand) focus:outline-none resize-y"
          />
        </div>

        {/* Ringkasan Box (Edit mode only) */}
        {!isNew && initialData && (
          <div className="shrink-0 rounded-md border border-(--color-border) bg-(--color-surface) p-2.5">
            <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
              RINGKASAN
            </div>
            <div className="mt-1 text-[12.5px] leading-relaxed text-(--color-text-primary)">
              {initialData.ringkasanPenggunaan || 'Belum pernah ikut kegiatan apa pun.'}
            </div>
            <button
              type="button"
              onClick={() => onLihatKegiatan(initialData.id, initialData.nama)}
              className="mt-1.25 border-none bg-transparent p-0 text-xs text-(--color-brand) hover:underline cursor-pointer"
            >
              Lihat kegiatannya di daftar kegiatan
            </button>
          </div>
        )}
      </div>

      {/* Panel Footer */}
      <div className="flex h-11.5 shrink-0 items-center gap-1.75 border-t border-(--color-border) bg-(--color-surface) px-3.5 py-2">
        {!isNew && initialData && (
          <>
            {/* Nonaktifkan / Aktifkan */}
            <button
              type="button"
              onClick={() => {
                if (form.aktif) {
                  onMintaNonaktif(initialData);
                } else {
                  onAktifkanKembali(initialData);
                }
              }}
              title={
                form.aktif
                  ? 'Sembunyikan dari pemilih peserta tanpa menghapus riwayat'
                  : 'Munculkan lagi di pemilih peserta'
              }
              className={`flex h-6.5 shrink-0 items-center px-2.5 rounded border-none bg-transparent hover:bg-(--color-surface-alt) text-[12.5px] cursor-pointer transition-colors ${
                form.aktif ? 'text-(--color-warning-ink)' : 'text-(--color-success-ink)'
              }`}
            >
              {form.aktif ? 'Nonaktifkan' : 'Aktifkan kembali'}
            </button>

            {/* Hapus button */}
            <button
              type="button"
              onClick={() => {
                if (initialData.dapatDihapus) {
                  onMintaHapus(initialData);
                }
              }}
              disabled={!initialData.dapatDihapus}
              title={
                initialData.dapatDihapus
                  ? 'Hapus permanen — siswa ini belum dipakai di mana pun'
                  : initialData.alasanTidakBisaHapus ||
                    'Tidak bisa dihapus karena masih digunakan. Pakai Nonaktifkan.'
              }
              className={`flex h-6.5 shrink-0 items-center px-2.5 rounded border-none bg-transparent text-[12.5px] transition-colors ${
                initialData.dapatDihapus
                  ? 'text-(--color-danger-ink) hover:bg-(--color-danger-bg) cursor-pointer'
                  : 'text-(--color-text-disabled) cursor-not-allowed'
              }`}
            >
              Hapus
            </button>
          </>
        )}

        <div className="flex-1" />

        <button
          type="button"
          onClick={onClose}
          className="flex h-6.5 shrink-0 items-center px-3 rounded border border-(--color-border-strong) bg-(--color-surface) hover:bg-(--color-surface-alt) text-[12.5px] text-(--color-text-primary) cursor-pointer transition-colors"
        >
          Batal
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={dicoba && hasErrors}
          title={
            dicoba && hasErrors
              ? 'Bereskan dulu isian yang bermasalah'
              : isNew
                ? 'Tambahkan siswa ini'
                : 'Simpan perubahan'
          }
          className={`flex h-6.5 shrink-0 items-center gap-1.75 px-3 rounded border-none text-[12.5px] font-semibold transition-colors ${
            dicoba && hasErrors
              ? 'bg-(--color-surface-sunken) text-(--color-text-disabled) cursor-not-allowed'
              : 'bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white cursor-pointer'
          }`}
        >
          <span>{isNew ? 'Simpan siswa' : 'Simpan'}</span>
        </button>
      </div>
    </div>
  );
}
