import * as React from 'react';
import {
  Dismiss16Regular,
  Add16Regular,
  Warning16Regular,
  ChevronDown12Regular,
  ArrowSync16Regular,
} from '@fluentui/react-icons';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, SearchInput, Textarea, FormLabel, InlineError } from '@/components/ui/input';
import { Select, GroupedRuanganSelect, type TempatRuanganGroup } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { SubjekChip, AddSubjekButton, type SubjekPeran } from '@/components/ui/subjek-chip';
import { ErrorSummary, type ErrorSummaryItem } from '@/components/ui/error-summary';
import { ConflictWarning } from '@/components/ui/conflict-warning';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import {
  useJenisKegiatanList,
  useSubjekList,
  useKelasList,
  useMapelList,
  useMateriList,
  useTempatList,
  useRuanganList,
  useSiswaList,
  useCreateKegiatan,
  useUpdateKegiatan,
} from '@/data/hooks';
import { repositories } from '@/data/repositories';
import type { Kegiatan, FrekuensiPengulangan, TipeBerakhirPengulangan } from '@/data/types';
import { menit, formatTanggalPendek, toDate, toIso, addDays } from '@/lib/dateUtils';
import { BANDREK_EVENTS } from '@/lib/keyboardShortcuts';

export interface FormKegiatanInitialData {
  mode: 'create' | 'edit';
  kegiatanId?: string;
  nama?: string;
  jenis?: string | null;
  tanggal?: string;
  tanggalSelesai?: string | null;
  mulai?: string;
  selesai?: string;
  sepanjangHari?: boolean;
  ruangan?: string;
  tempatCustom?: string | null;
  mapel?: string;
  materi?: string;
  subjek?: Array<{ id: string; peran?: string | null }>;
  siswa?: string[];
  catatan?: string;
  seriId?: string | null;
  urutanSeri?: number | null;
  totalSeri?: number | null;
}

export interface FormKegiatanPanelProps {
  open: boolean;
  initialData?: FormKegiatanInitialData | null;
  onClose: () => void;
  onSuccess?: (savedKegiatan: Kegiatan, buatLagi: boolean) => void;
  onHighlightConflict?: (kegiatanId: string, tanggal: string) => void;
  onOpenDetail?: (kegiatanId: string) => void;
}

export const FormKegiatanPanel: React.FC<FormKegiatanPanelProps> = ({
  open,
  initialData,
  onClose,
  onSuccess,
  onHighlightConflict,
  onOpenDetail,
}) => {
  const { showToast } = useToast();

  // Master Data
  const { data: jenisList = [] } = useJenisKegiatanList();
  const { data: subjekList = [] } = useSubjekList();
  const { data: kelasList = [] } = useKelasList();
  const { data: mapelList = [] } = useMapelList();
  const { data: tempatList = [] } = useTempatList();
  const { data: ruanganList = [] } = useRuanganList();
  const { data: siswaList = [] } = useSiswaList();

  // Mutations
  const { mutateAsync: createKegiatanAsync, isPending: isCreating } = useCreateKegiatan();
  const { mutateAsync: updateKegiatanAsync, isPending: isUpdating } = useUpdateKegiatan();
  const isSaving = isCreating || isUpdating;

  // Mode & IDs
  const mode = initialData?.mode || 'create';
  const kegiatanId = initialData?.kegiatanId;

  // Form Fields State - initialized once upon mount
  const [nama, setNama] = React.useState<string>(() => initialData?.nama || '');
  const [jenis, setJenis] = React.useState<string>(() => initialData?.jenis || '');
  const [tanggal, setTanggal] = React.useState<string>(() => initialData?.tanggal || '');
  const [lintasHari, setLintasHari] = React.useState<boolean>(
    () => Boolean(initialData?.tanggalSelesai && initialData.tanggalSelesai !== initialData.tanggal)
  );
  const [tanggalSelesai, setTanggalSelesai] = React.useState<string>(
    () => initialData?.tanggalSelesai || initialData?.tanggal || ''
  );
  const [mulai, setMulai] = React.useState<string>(() => initialData?.mulai || '08:00');
  const [selesai, setSelesai] = React.useState<string>(() => initialData?.selesai || '09:30');
  const [sepanjangHari, setSepanjangHari] = React.useState<boolean>(
    () => Boolean(initialData?.sepanjangHari)
  );
  const [ruangan, setRuangan] = React.useState<string>(() => initialData?.ruangan || '');
  const [isCustomTempat, setIsCustomTempat] = React.useState<boolean>(
    () => Boolean(initialData?.tempatCustom)
  );
  const [tempatCustom, setTempatCustom] = React.useState<string>(
    () => initialData?.tempatCustom || ''
  );
  const [mapel, setMapel] = React.useState<string>(() => initialData?.mapel || '');
  const [materi, setMateri] = React.useState<string>(() => initialData?.materi || '');
  const [subjek, setSubjek] = React.useState<Array<{ id: string; peran?: string | null }>>(() => {
    if (initialData?.subjek && initialData.subjek.length > 0) return initialData.subjek;
    return [];
  });
  const [selectedSiswaIds, setSelectedSiswaIds] = React.useState<string[]>(
    () => initialData?.siswa || []
  );
  const [catatan, setCatatan] = React.useState<string>(() => initialData?.catatan || '');
  const [copiedClasses, setCopiedClasses] = React.useState<
    Array<{ kelasId: string; nama: string; count: number }>
  >([]);

  // Recurring schedule state (hanya untuk create)
  const [isRecurring, setIsRecurring] = React.useState<boolean>(false);
  const [recurringFreq, setRecurringFreq] = React.useState<FrekuensiPengulangan>('mingguan');
  const [recurringEndType, setRecurringEndType] =
    React.useState<TipeBerakhirPengulangan>('pertemuan');
  const [recurringCount, setRecurringCount] = React.useState<number>(4);
  const [recurringUntilDate, setRecurringUntilDate] = React.useState<string>(() => {
    if (initialData?.tanggal) {
      return toIso(addDays(toDate(initialData.tanggal), 28));
    }
    return '';
  });

  React.useEffect(() => {
    if (tanggal && !recurringUntilDate) {
      setRecurringUntilDate(toIso(addDays(toDate(tanggal), 28)));
    }
  }, [tanggal, recurringUntilDate]);

  const summaryRecurringText = React.useMemo(() => {
    if (!tanggal) return 'Pilih tanggal mulai kegiatan terlebih dahulu.';
    const d = toDate(tanggal);
    const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()];

    if (recurringFreq === 'bulanan') {
      const tgl = d.getDate();
      if (recurringEndType === 'pertemuan') {
        return `Diulang setiap bulan pada tanggal ${tgl} sebanyak ${recurringCount} pertemuan.`;
      }
      return `Diulang setiap bulan pada tanggal ${tgl} sampai ${recurringUntilDate ? formatTanggalPendek(recurringUntilDate) : 'tanggal batas'}.`;
    }

    const intervalTeks = recurringFreq === 'dua_mingguan' ? 'setiap 2 minggu' : 'setiap minggu';
    if (recurringEndType === 'pertemuan') {
      return `Diulang ${intervalTeks} pada hari ${namaHari} sebanyak ${recurringCount} pertemuan.`;
    }
    return `Diulang ${intervalTeks} pada hari ${namaHari} sampai ${recurringUntilDate ? formatTanggalPendek(recurringUntilDate) : 'tanggal batas'}.`;
  }, [tanggal, recurringFreq, recurringEndType, recurringCount, recurringUntilDate]);

  // Query materi list based on selected mapel
  const { data: materiList = [] } = useMateriList(mapel || '');

  // Field interaction & validation state
  const [dicoba, setDicoba] = React.useState(false);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);

  // Popover menus state
  const [menuTambahSubjekOpen, setMenuTambahSubjekOpen] = React.useState(false);
  const [menuDariKelasOpen, setMenuDariKelasOpen] = React.useState(false);
  const [searchSiswa, setSearchSiswa] = React.useState('');

  // Dirty & draft tracking
  const [isDirty, setIsDirty] = React.useState(false);
  const [draftTime, setDraftTime] = React.useState<string>('Belum ada perubahan');
  const [showDiscardConfirm, setShowDiscardConfirm] = React.useState(false);

  // Field refs for error scrolling & focusing
  const namaRef = React.useRef<HTMLInputElement>(null);
  const jenisRef = React.useRef<HTMLButtonElement>(null);
  const tanggalRef = React.useRef<HTMLButtonElement>(null);
  const tanggalSelesaiRef = React.useRef<HTMLButtonElement>(null);
  const mulaiRef = React.useRef<HTMLButtonElement>(null);
  const selesaiRef = React.useRef<HTMLButtonElement>(null);
  const ruanganRef = React.useRef<HTMLButtonElement>(null);
  const mapelRef = React.useRef<HTMLButtonElement>(null);
  const materiRef = React.useRef<HTMLButtonElement>(null);

  // Adjust toast offset on side panel lifecycle per DESIGN.md §3.8 & §14
  React.useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(BANDREK_EVENTS.SIDE_PANEL_STATE_CHANGE, {
        detail: { isOpen: true, width: 498 },
      })
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent(BANDREK_EVENTS.SIDE_PANEL_STATE_CHANGE, {
          detail: { isOpen: false },
        })
      );
    };
  }, []);

  // Mark dirty on changes
  const markTouched = (field: string) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
    setIsDirty(true);
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setDraftTime(`Draf disimpan ${hh}:${mm}`);
  };

  // Active students only (aktif === true)
  const activeSiswa = React.useMemo(() => {
    return siswaList.filter((s) => s.aktif);
  }, [siswaList]);

  // Current selected jenis data
  const currentJenisData = React.useMemo(() => {
    return jenisList.find((j) => j.id === jenis);
  }, [jenisList, jenis]);

  // Grouped Ruangan options for select
  const tempatRuanganGroups: TempatRuanganGroup[] = React.useMemo(() => {
    return tempatList.map((t) => ({
      id: t.id,
      nama: t.nama,
      ruangan: ruanganList
        .filter((r) => r.tempat === t.id)
        .map((r) => ({ id: r.id, nama: r.nama, kapasitas: r.kapasitas })),
    }));
  }, [tempatList, ruanganList]);

  // Active subjects remaining for "+ tambah"
  const remainingSubjek = React.useMemo(() => {
    const usedIds = new Set(subjek.map((s) => s.id));
    return subjekList.filter((s) => s.aktif && !usedIds.has(s.id));
  }, [subjekList, subjek]);

  // Students grouped by Jenjang
  const groupedStudents = React.useMemo(() => {
    const q = searchSiswa.toLowerCase().trim();
    const filtered = q
      ? activeSiswa.filter((s) => {
          const matchName = s.nama.toLowerCase().includes(q);
          const kelas = kelasList.find(
            (k) => k.anggota?.includes(s.id) || s.daftarKelas?.includes(k.id)
          );
          const matchKelas = kelas?.nama.toLowerCase().includes(q);
          return matchName || matchKelas;
        })
      : activeSiswa;

    const jenjangs = ['SD', 'SMP', 'SMA', 'Lainnya'];
    const groups: Record<string, typeof activeSiswa> = {
      SD: [],
      SMP: [],
      SMA: [],
      Lainnya: [],
    };

    filtered.forEach((s) => {
      const j = s.jenjang || 'Lainnya';
      if (groups[j]) {
        groups[j].push(s);
      } else {
        groups.Lainnya.push(s);
      }
    });

    return jenjangs
      .filter((j) => groups[j] && groups[j].length > 0)
      .map((j) => ({
        label: `${j} · ${groups[j].length} siswa`,
        students: groups[j],
      }));
  }, [activeSiswa, searchSiswa, kelasList]);

  // All visible students in checklist
  const allVisibleStudentIds = React.useMemo(() => {
    return groupedStudents.flatMap((g) => g.students.map((s) => s.id));
  }, [groupedStudents]);

  const allVisibleAreSelected =
    allVisibleStudentIds.length > 0 &&
    allVisibleStudentIds.every((id) => selectedSiswaIds.includes(id));

  // Determine distinct jenjang among selected students (for materi matching hint)
  const selectedStudentJenjang = React.useMemo(() => {
    const set = new Set<string>();
    selectedSiswaIds.forEach((id) => {
      const s = siswaList.find((x) => x.id === id);
      if (s?.jenjang) set.add(s.jenjang);
    });
    return Array.from(set);
  }, [selectedSiswaIds, siswaList]);

  // Filtered materi options based on selected mapel and student jenjang
  const availableMateriOptions = React.useMemo(() => {
    if (!mapel) return [];
    return materiList.map((m) => ({
      value: m.id,
      label: m.nama,
    }));
  }, [mapel, materiList]);

  // Pure Declarative Conflict Detection Query (Zero loops, zero setState in useEffect)
  const subjekIds = React.useMemo(() => subjek.map((s) => s.id).filter(Boolean), [subjek]);

  const { data: conflictData } = useQuery({
    queryKey: [
      'cekBentrok',
      tanggal,
      lintasHari ? tanggalSelesai : tanggal,
      sepanjangHari ? '07:00' : mulai,
      sepanjangHari ? '18:00' : selesai,
      isCustomTempat ? '' : ruangan,
      subjekIds.join(','),
      selectedSiswaIds.join(','),
      mode,
      kegiatanId,
    ],
    queryFn: () =>
      repositories.kegiatan.cekBentrok({
        tanggal,
        tanggalSelesai: lintasHari && tanggalSelesai ? tanggalSelesai : undefined,
        mulai: sepanjangHari ? '07:00' : mulai,
        selesai: sepanjangHari ? '18:00' : selesai,
        ruangan: isCustomTempat ? '' : ruangan,
        subjek: subjekIds,
        siswa: selectedSiswaIds,
        excludeKegiatanId: mode === 'edit' ? kegiatanId : undefined,
      }),
    enabled: Boolean(
      open &&
        tanggal &&
        (!lintasHari || (tanggalSelesai && tanggalSelesai >= tanggal)) &&
        (sepanjangHari ||
          (mulai &&
            selesai &&
            (lintasHari && tanggalSelesai > tanggal ? true : menit(selesai) > menit(mulai))))
    ),
    staleTime: 500,
  });

  const conflicts = conflictData?.adaBentrok ? conflictData.daftarBentrok : [];

  // Validation function per DOMAIN.md §5 and prototype periksa()
  const validateForm = React.useCallback((): Record<string, string> => {
    const err: Record<string, string> = {};

    if (!nama.trim()) {
      err.nama = 'Nama kegiatan belum diisi. Tulis nama yang mudah dikenali di kalender.';
    }
    // Jenis kegiatan kini opsional
    if (currentJenisData && currentJenisData.materiWajib) {
      if (!mapel) {
        err.mapel = 'Pilih mata pelajaran.';
      } else if (!materi) {
        err.materi = 'Pilih materi yang akan disampaikan.';
      }
    }
    if (!tanggal) {
      err.tanggal = 'Tanggal belum diisi.';
    }
    if (lintasHari) {
      if (!tanggalSelesai) {
        err.tanggalSelesai = 'Tanggal selesai belum diisi.';
      } else if (tanggal && tanggalSelesai <= tanggal) {
        err.tanggalSelesai = 'Tanggal selesai harus setelah tanggal mulai.';
      }
    }
    if (!sepanjangHari) {
      if (!mulai) {
        err.mulai = 'Jam mulai belum diisi.';
      }
      if (!selesai) {
        err.selesai = 'Jam selesai belum diisi.';
      } else {
        const isSameDay = !lintasHari || (tanggal && tanggalSelesai && tanggal === tanggalSelesai);
        if (isSameDay && mulai && menit(selesai) <= menit(mulai)) {
          err.selesai = `Jam selesai harus setelah jam mulai. Ubah jam selesai menjadi setelah ${mulai}.`;
        }
      }
    }
    if (currentJenisData && currentJenisData.siswaWajib && selectedSiswaIds.length === 0) {
      err.siswa =
        'Pilih minimal satu siswa. Gunakan "+ Dari kelas" untuk menambahkan sekelas sekaligus.';
    }
    if (mode === 'create' && isRecurring) {
      if (recurringEndType === 'tanggal') {
        if (!recurringUntilDate) {
          err.recurringUntilDate = 'Pilih batas tanggal pengulangan.';
        } else if (tanggal && toDate(recurringUntilDate) <= toDate(tanggal)) {
          err.recurringUntilDate = 'Batas tanggal pengulangan harus setelah tanggal mulai kegiatan.';
        }
      } else if (recurringEndType === 'pertemuan') {
        if (!recurringCount || recurringCount < 2 || recurringCount > 52) {
          err.recurringCount = 'Jumlah pertemuan harus di antara 2 sampai 52 kali.';
        }
      }
    }

    return err;
  }, [
    nama,
    currentJenisData,
    mapel,
    materi,
    tanggal,
    lintasHari,
    tanggalSelesai,
    mulai,
    selesai,
    sepanjangHari,
    selectedSiswaIds,
    mode,
    isRecurring,
    recurringEndType,
    recurringUntilDate,
    recurringCount,
  ]);

  const currentErrors = validateForm();
  const hasErrors = Object.keys(currentErrors).length > 0;
  const isSaveDisabled = dicoba && hasErrors;

  // Request close: confirms if dirty
  const handleRequestClose = React.useCallback(() => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  // Add subject from active subjects (default: tanpa peran)
  const handleAddSubjek = (subjekId: string) => {
    setSubjek((prev) => [...prev, { id: subjekId, peran: null }]);
    setMenuTambahSubjekOpen(false);
    markTouched('subjek');
  };

  // Change subject role
  const handleChangeSubjekPeran = (index: number, newPeran: SubjekPeran) => {
    setSubjek((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], peran: newPeran || null };
      return copy;
    });
    markTouched('subjek');
  };

  // Remove subject
  const handleRemoveSubjek = (index: number) => {
    setSubjek((prev) => prev.filter((_, idx) => idx !== index));
    markTouched('subjek');
  };

  // Import class students (+ Dari kelas)
  const handleCopyClass = (kelasId: string) => {
    const targetKelas = kelasList.find((k) => k.id === kelasId);
    if (!targetKelas) return;

    const classStudents = activeSiswa.filter(
      (s) => targetKelas.anggota?.includes(s.id) || s.daftarKelas?.includes(kelasId)
    );
    const newStudentIds = classStudents.map((s) => s.id);

    const alreadyCount = newStudentIds.filter((id) => selectedSiswaIds.includes(id)).length;
    const addedCount = newStudentIds.length - alreadyCount;

    // Add unique students
    setSelectedSiswaIds((prev) => Array.from(new Set([...prev, ...newStudentIds])));

    // Add chip info
    setCopiedClasses((prev) => {
      if (prev.some((c) => c.kelasId === kelasId)) return prev;
      return [...prev, { kelasId, nama: targetKelas.nama, count: classStudents.length }];
    });

    setMenuDariKelasOpen(false);
    markTouched('siswa');

    showToast({
      message:
        alreadyCount > 0
          ? `${addedCount} siswa disalin dari ${targetKelas.nama} (${alreadyCount} siswa sudah terpilih sebelumnya).`
          : `${addedCount} siswa dari ${targetKelas.nama} disalin.`,
      type: 'info',
    });
  };

  // Remove copied class
  const handleRemoveCopiedClass = (kelasId: string) => {
    const targetKelas = kelasList.find((k) => k.id === kelasId);
    const classStudentIds = activeSiswa
      .filter((s) => targetKelas?.anggota?.includes(s.id) || s.daftarKelas?.includes(kelasId))
      .map((s) => s.id);
    setSelectedSiswaIds((prev) => prev.filter((id) => !classStudentIds.includes(id)));
    setCopiedClasses((prev) => prev.filter((c) => c.kelasId !== kelasId));
    markTouched('siswa');
  };

  // Student toggle
  const handleToggleStudent = (studentId: string) => {
    setSelectedSiswaIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
    markTouched('siswa');
  };

  // Toggle all visible
  const handleToggleAllVisible = () => {
    if (allVisibleAreSelected) {
      setSelectedSiswaIds((prev) => prev.filter((id) => !allVisibleStudentIds.includes(id)));
    } else {
      setSelectedSiswaIds((prev) => Array.from(new Set([...prev, ...allVisibleStudentIds])));
    }
    markTouched('siswa');
  };

  // Clear all students
  const handleClearAllStudents = () => {
    setSelectedSiswaIds([]);
    setCopiedClasses([]);
    markTouched('siswa');
  };

  // Save handler
  const handleSave = React.useCallback(
    async (buatLagi: boolean = false) => {
      setDicoba(true);
      const errors = validateForm();

      if (Object.keys(errors).length > 0) {
        // Focus first invalid field
        if (errors.nama) namaRef.current?.focus();
        else if (errors.jenis) jenisRef.current?.focus();
        else if (errors.mapel) mapelRef.current?.focus();
        else if (errors.materi) materiRef.current?.focus();
        else if (errors.tanggal) tanggalRef.current?.focus();
        else if (errors.tanggalSelesai) tanggalSelesaiRef.current?.focus();
        else if (errors.mulai) mulaiRef.current?.focus();
        else if (errors.selesai) selesaiRef.current?.focus();

        showToast({
          message: `${Object.keys(errors).length} isian perlu diperbaiki sebelum disimpan.`,
          type: 'warning',
        });
        return;
      }

      setServerError(null);

      try {
        let savedResult: Kegiatan;
        const effectiveMulai = sepanjangHari ? '07:00' : mulai;
        const effectiveSelesai = sepanjangHari ? '18:00' : selesai;
        const effectiveRuangan = isCustomTempat ? '' : ruangan;
        const effectiveTempatCustom = isCustomTempat ? tempatCustom.trim() : null;
        const effectiveTanggalSelesai = lintasHari && tanggalSelesai ? tanggalSelesai : null;

        if (mode === 'edit' && kegiatanId) {
          savedResult = await updateKegiatanAsync({
            id: kegiatanId,
            input: {
              nama: nama.trim(),
              jenis: jenis || null,
              mapel: currentJenisData?.materiWajib ? mapel : null,
              materi: currentJenisData?.materiWajib ? materi : null,
              tanggal,
              tanggalSelesai: effectiveTanggalSelesai,
              mulai: effectiveMulai,
              selesai: effectiveSelesai,
              sepanjangHari,
              ruangan: effectiveRuangan,
              tempatCustom: effectiveTempatCustom,
              subjek: subjek.map((s) => ({ id: s.id, peran: s.peran || null })),
              siswa: selectedSiswaIds,
              catatan: catatan.trim(),
            },
          });

          showToast({
            message: `Kegiatan "${savedResult.nama}" berhasil diperbarui.`,
            type: 'success',
          });
        } else {
          savedResult = await createKegiatanAsync({
            nama: nama.trim(),
            jenis: jenis || null,
            mapel: currentJenisData?.materiWajib ? mapel : null,
            materi: currentJenisData?.materiWajib ? materi : null,
            tanggal,
            tanggalSelesai: effectiveTanggalSelesai,
            mulai: effectiveMulai,
            selesai: effectiveSelesai,
            sepanjangHari,
            ruangan: effectiveRuangan,
            tempatCustom: effectiveTempatCustom,
            subjek: subjek.map((s) => ({ id: s.id, peran: s.peran || null })),
            siswa: selectedSiswaIds,
            catatan: catatan.trim(),
            pengulangan: isRecurring
              ? {
                  aktif: true,
                  frekuensi: recurringFreq,
                  tipeBerakhir: recurringEndType,
                  totalPertemuan: recurringEndType === 'pertemuan' ? recurringCount : undefined,
                  sampaiTanggal: recurringEndType === 'tanggal' ? recurringUntilDate : undefined,
                }
              : undefined,
          });

          const isRecurringSave = Boolean(isRecurring && savedResult.totalSeri && savedResult.totalSeri > 1);
          showToast({
            message: buatLagi
              ? isRecurringSave
                ? `${savedResult.totalSeri} kegiatan berulang "${savedResult.nama}" disimpan. Form siap untuk kegiatan berikutnya.`
                : `Kegiatan "${savedResult.nama}" disimpan. Form siap untuk kegiatan berikutnya.`
              : isRecurringSave
              ? `${savedResult.totalSeri} kegiatan berulang "${savedResult.nama}" berhasil dijadwalkan.`
              : `Kegiatan "${savedResult.nama}" berhasil disimpan.`,
            type: 'success',
          });
        }

        if (buatLagi) {
          // "Simpan & buat lagi" maintains jenis, ruangan, subjek, mapel, tanggal; resets nama, materi, siswa, catatan per DOMAIN.md §5
          setNama('');
          setMateri('');
          setSelectedSiswaIds([]);
          setCopiedClasses([]);
          setCatatan('');
          setIsRecurring(false);
          setDicoba(false);
          setTouched({});
          setIsDirty(false);
          setDraftTime('Belum ada perubahan');
          onSuccess?.(savedResult, true);
          namaRef.current?.focus();
        } else {
          setIsDirty(false);
          onSuccess?.(savedResult, false);
          onClose();
        }
      } catch (err: any) {
        const msg =
          err?.message ||
          'Basis data sedang terpakai proses lain. Coba simpan lagi; isian Anda masih utuh.';
        setServerError(msg);
        showToast({
          message: 'Gagal menyimpan kegiatan. Periksa pesan kesalahan.',
          type: 'error',
        });
      }
    },
    [
      validateForm,
      mode,
      kegiatanId,
      updateKegiatanAsync,
      createKegiatanAsync,
      nama,
      jenis,
      currentJenisData,
      mapel,
      materi,
      tanggal,
      lintasHari,
      tanggalSelesai,
      mulai,
      selesai,
      sepanjangHari,
      ruangan,
      isCustomTempat,
      tempatCustom,
      subjek,
      selectedSiswaIds,
      catatan,
      isRecurring,
      recurringFreq,
      recurringEndType,
      recurringCount,
      recurringUntilDate,
      showToast,
      onSuccess,
      onClose,
    ]
  );

  // Global Ctrl+S listener
  React.useEffect(() => {
    const handleGlobalSave = () => {
      handleSave(false);
    };
    window.addEventListener(BANDREK_EVENTS.SAVE, handleGlobalSave);
    return () => window.removeEventListener(BANDREK_EVENTS.SAVE, handleGlobalSave);
  }, [handleSave]);

  // Global Esc listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleRequestClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [handleRequestClose]);

  if (!open) return null;

  // Header pill text e.g. "Rab, 16 Sep · 08:00" or "Rab, 16 Sep - Kam, 17 Sep · Sepanjang hari"
  const contextPill = tanggal
    ? `${formatTanggalPendek(tanggal)}${lintasHari && tanggalSelesai && tanggalSelesai !== tanggal ? ` – ${formatTanggalPendek(tanggalSelesai)}` : ''} · ${sepanjangHari ? 'Sepanjang hari' : mulai || '08:00'}`
    : 'Tanggal belum dipilih';

  // Error summary list
  const errorSummaryItems: ErrorSummaryItem[] = dicoba
    ? Object.keys(currentErrors).map((k) => ({
        id: k,
        field:
          k === 'recurringUntilDate' || k === 'recurringCount'
            ? 'Pengulangan'
            : k === 'tanggalSelesai'
            ? 'Tanggal Selesai'
            : k.charAt(0).toUpperCase() + k.slice(1),
        message: currentErrors[k],
        onFocusField: () => {
          if (k === 'nama') namaRef.current?.focus();
          else if (k === 'jenis') jenisRef.current?.focus();
          else if (k === 'mapel') mapelRef.current?.focus();
          else if (k === 'materi') materiRef.current?.focus();
          else if (k === 'tanggal') tanggalRef.current?.focus();
          else if (k === 'tanggalSelesai') tanggalSelesaiRef.current?.focus();
          else if (k === 'mulai') mulaiRef.current?.focus();
          else if (k === 'selesai') selesaiRef.current?.focus();
        },
      }))
    : [];

  return (
    <>
      <div className="fixed inset-0 z-40">
        {/* Light Scrim: calendar context remains visible underneath */}
        <div
          onClick={handleRequestClose}
          className="absolute inset-0 bg-[#242424]/18 transition-opacity duration-(--dur-slow) animate-in fade-in-0"
        />

        {/* 498px Side Panel per DESIGN.md §3.10 and prototype */}
        <aside
          style={{ width: '498px' }}
          className="absolute right-0 top-0 bottom-0 bg-white border-l border-(--color-border-strong) shadow-(--shadow-overlay) z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-(--dur-slow) ease-[cubic-bezier(.16,1,.3,1)]"
        >
          {/* Header */}
          <div className="h-11 flex-none border-b border-(--color-border) bg-(--color-surface-alt) flex items-center gap-2.5 px-3.5 select-none">
            <h2 className="text-[15px] font-semibold text-(--color-text) truncate">
              {mode === 'edit' ? 'Ubah kegiatan' : 'Kegiatan baru'}
            </h2>

            <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded-full bg-white border border-(--color-border) text-(--color-text-secondary)">
              {contextPill}
            </span>

            {mode === 'edit' && kegiatanId && (
              <button
                type="button"
                onClick={() => onOpenDetail?.(kegiatanId)}
                className="text-[12px] text-(--color-brand) underline hover:no-underline cursor-pointer"
                title="Lihat detail & riwayat perubahan"
              >
                Riwayat perubahan
              </button>
            )}

            <div className="flex-1" />

            <button
              type="button"
              onClick={handleRequestClose}
              title="Tutup · Esc"
              className="w-6.5 h-6.5 rounded-full flex items-center justify-center text-(--color-text-muted) hover:bg-(--color-surface-sunken) hover:text-(--color-text) transition-colors cursor-pointer"
            >
              <Dismiss16Regular className="text-[13px]" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2">
            {/* Server Error Alert Banner */}
            {serverError && (
              <div
                role="alert"
                className="flex-none rounded-lg border border-(--color-danger) bg-(--color-danger-bg) p-2.5 text-[12.5px] leading-relaxed text-(--color-danger-ink)"
              >
                <div className="flex items-start gap-1.5 font-semibold">
                  <Warning16Regular className="flex-none mt-0.5" />
                  <span>Kegiatan belum tersimpan. {serverError}</span>
                </div>
                <div className="mt-2 pl-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSave(false)}
                    className="h-6.5 px-3 rounded border border-(--color-danger) bg-white text-[12px] font-semibold text-(--color-danger-ink) hover:bg-(--color-danger-bg) cursor-pointer"
                  >
                    Coba lagi
                  </button>
                  <span className="font-mono text-[10.5px] opacity-75">ERROR_SAVE_RETRY</span>
                </div>
              </div>
            )}

            {/* Error Summary Banner */}
            {dicoba && errorSummaryItems.length > 0 && (
              <div className="flex-none">
                <ErrorSummary
                  errors={errorSummaryItems}
                  title={`${errorSummaryItems.length} isian perlu diperbaiki sebelum disimpan`}
                />
              </div>
            )}

            {/* 1. Nama Kegiatan */}
            <div className="flex-none">
              <FormLabel required error={Boolean(dicoba && currentErrors.nama)}>
                Nama kegiatan
              </FormLabel>
              <Input
                ref={namaRef}
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value);
                  markTouched('nama');
                }}
                onBlur={() => markTouched('nama')}
                placeholder="mis. Matematika Kelas SD Sore"
                error={Boolean((dicoba || touched.nama) && currentErrors.nama)}
              />
              {(dicoba || touched.nama) && currentErrors.nama && (
                <InlineError message={currentErrors.nama} />
              )}
            </div>

            {/* 2. Jenis Kegiatan & Tanggal */}
            <div
              className={
                lintasHari
                  ? 'grid grid-cols-[1fr_125px_125px] gap-2.5 items-start flex-none'
                  : 'grid grid-cols-[1fr_132px] gap-2.5 items-start flex-none'
              }
            >
              {/* Jenis Kegiatan */}
              <div className="min-w-0">
                <div className="h-3.5 mb-1 flex items-center">
                  <FormLabel className="mb-0" error={Boolean(dicoba && currentErrors.jenis)}>
                    Jenis kegiatan
                  </FormLabel>
                </div>
                <Select
                  ref={jenisRef}
                  value={jenis}
                  onValueChange={(val) => {
                    setJenis(val);
                    const selectedKind = jenisList.find((j) => j.id === val);
                    if (!selectedKind?.materiWajib) {
                      setMapel('');
                      setMateri('');
                    }
                    markTouched('jenis');
                  }}
                  placeholder="Pilih jenis (opsional)"
                  options={[
                    { value: '', label: 'Tanpa jenis (opsional)' },
                    ...jenisList.map((j) => ({
                      value: j.id,
                      label: j.nama,
                    })),
                  ]}
                  error={Boolean((dicoba || touched.jenis) && currentErrors.jenis)}
                />
                {(dicoba || touched.jenis) && currentErrors.jenis && (
                  <InlineError message={currentErrors.jenis} />
                )}
                {currentJenisData && (
                  <p className="mt-1 text-[11px] text-(--color-text-muted) leading-4">
                    {currentJenisData.materiWajib
                      ? 'Jenis ini mewajibkan mata pelajaran dan materi.'
                      : 'Jenis ini tidak memakai materi.'}
                  </p>
                )}
              </div>

              {/* Tanggal */}
              <div className="min-w-0">
                <div className="h-3.5 mb-1 flex items-center">
                  <FormLabel className="mb-0" required error={Boolean(dicoba && currentErrors.tanggal)}>
                    {lintasHari ? 'Tgl mulai' : 'Tanggal'}
                  </FormLabel>
                </div>
                <DatePicker
                  ref={tanggalRef}
                  value={tanggal}
                  onChange={(val) => {
                    const oldStart = tanggal;
                    setTanggal(val);
                    if (lintasHari) {
                      if (!tanggalSelesai || tanggalSelesai <= val) {
                        setTanggalSelesai(toIso(addDays(toDate(val), 1)));
                      } else if (oldStart) {
                        const oldTime = toDate(oldStart).getTime();
                        const newTime = toDate(val).getTime();
                        const diffDays = Math.round((newTime - oldTime) / 86400000);
                        if (diffDays > 0) {
                          // Tgl mulai diganti ke depan: tgl selesai ikut maju menyesuaikan
                          setTanggalSelesai((prev) => toIso(addDays(toDate(prev), diffDays)));
                        }
                      }
                    }
                    markTouched('tanggal');
                  }}
                  formatDisplay="dd/MM/yyyy"
                  placeholder="Pilih tanggal"
                  error={Boolean((dicoba || touched.tanggal) && currentErrors.tanggal)}
                  className="font-mono text-[12.5px]"
                />
                {(dicoba || touched.tanggal) && currentErrors.tanggal && (
                  <InlineError message={currentErrors.tanggal} />
                )}
              </div>

              {/* Tanggal Selesai (jika lintas hari) */}
              {lintasHari && (
                <div className="min-w-0">
                  <div className="h-3.5 mb-1 flex items-center">
                    <FormLabel
                      className="mb-0"
                      required
                      error={Boolean(dicoba && currentErrors.tanggalSelesai)}
                    >
                      Tgl selesai
                    </FormLabel>
                  </div>
                  <DatePicker
                    ref={tanggalSelesaiRef}
                    value={tanggalSelesai}
                    minDate={tanggal ? toIso(addDays(toDate(tanggal), 1)) : undefined}
                    onChange={(val) => {
                      setTanggalSelesai(val);
                      markTouched('tanggalSelesai');
                    }}
                    formatDisplay="dd/MM/yyyy"
                    placeholder="Pilih tgl"
                    error={Boolean((dicoba || touched.tanggalSelesai) && currentErrors.tanggalSelesai)}
                    className="font-mono text-[12.5px]"
                  />
                  {(dicoba || touched.tanggalSelesai) && currentErrors.tanggalSelesai && (
                    <InlineError message={currentErrors.tanggalSelesai} />
                  )}
                </div>
              )}
            </div>

            {/* 3. Waktu & Tempat */}
            <div className="flex flex-col gap-1.5 flex-none">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-semibold text-[#5C5A58]">WAKTU & TEMPAT</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[12px] text-(--color-text-secondary) hover:text-(--color-text) select-none">
                    <input
                      type="checkbox"
                      checked={lintasHari}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setLintasHari(checked);
                        if (checked) {
                          // Default tgl selesai selalu H+1 dari tgl mulai
                          const base = tanggal ? toDate(tanggal) : new Date();
                          setTanggalSelesai(toIso(addDays(base, 1)));
                        }
                        setIsDirty(true);
                      }}
                      className="rounded border-(--color-border-strong) text-(--color-brand) focus:ring-(--color-brand) w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="font-medium">Lintas hari</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[12px] text-(--color-text-secondary) hover:text-(--color-text) select-none">
                    <input
                      type="checkbox"
                      checked={sepanjangHari}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSepanjangHari(checked);
                        if (checked) {
                          setMulai('07:00');
                          setSelesai('18:00');
                        }
                        setIsDirty(true);
                      }}
                      className="rounded border-(--color-border-strong) text-(--color-brand) focus:ring-(--color-brand) w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="font-medium">Sepanjang hari</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.35fr)] gap-2.5 items-start">
                {sepanjangHari ? (
                  <div className="col-span-2 min-w-0">
                    <div className="h-3.5 mb-1 flex items-center">
                      <FormLabel className="mb-0">Waktu</FormLabel>
                    </div>
                    <div className="h-(--density-control-h) px-2.5 rounded-md bg-(--color-canvas) border border-(--color-border) text-(--color-text-muted) text-[12.5px] flex items-center font-medium select-none truncate">
                      Sepanjang hari
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Mulai */}
                    <div className="min-w-0">
                      <div className="h-3.5 mb-1 flex items-center">
                        <FormLabel className="mb-0" required error={Boolean(dicoba && currentErrors.mulai)}>
                          Mulai
                        </FormLabel>
                      </div>
                      <TimePicker
                        ref={mulaiRef}
                        value={mulai}
                        onChange={(val) => {
                          setMulai(val);
                          markTouched('mulai');
                        }}
                        onBlur={() => markTouched('mulai')}
                        error={Boolean((dicoba || touched.mulai) && currentErrors.mulai)}
                      />
                      {(dicoba || touched.mulai) && currentErrors.mulai && (
                        <InlineError message={currentErrors.mulai} />
                      )}
                    </div>

                    {/* Selesai */}
                    <div className="min-w-0">
                      <div className="h-3.5 mb-1 flex items-center">
                        <FormLabel className="mb-0" required error={Boolean(dicoba && currentErrors.selesai)}>
                          Selesai
                        </FormLabel>
                      </div>
                      <TimePicker
                        ref={selesaiRef}
                        value={selesai}
                        onChange={(val) => {
                          setSelesai(val);
                          markTouched('selesai');
                        }}
                        onBlur={() => markTouched('selesai')}
                        error={Boolean((dicoba || touched.selesai) && currentErrors.selesai)}
                      />
                      {(dicoba || touched.selesai) && currentErrors.selesai && (
                        <InlineError message={currentErrors.selesai} />
                      )}
                    </div>
                  </>
                )}

                {/* Tempat (Dropdown Tempat/Ruangan atau Input Manual) */}
                <div className="min-w-0">
                  <div className="h-3.5 mb-1 flex items-center justify-between">
                    <span className="text-[11.5px] font-medium leading-none text-(--color-text-muted) select-none">
                      Tempat
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomTempat((prev) => !prev);
                        if (!isCustomTempat) setRuangan('');
                        else setTempatCustom('');
                        setIsDirty(true);
                      }}
                      className="p-0 m-0 border-none bg-transparent text-[11.5px] font-medium leading-none text-(--color-brand) hover:underline cursor-pointer outline-none focus:outline-none"
                    >
                      {isCustomTempat ? 'Pilih dari daftar' : 'Tempat lain'}
                    </button>
                  </div>
                  {isCustomTempat ? (
                    <input
                      type="text"
                      placeholder="Misal: Ruang Zoom, Kafe, Rumah Siswa..."
                      value={tempatCustom}
                      onChange={(e) => {
                        setTempatCustom(e.target.value);
                        setIsDirty(true);
                      }}
                      className="block w-full min-w-0 h-(--density-control-h) px-2 rounded-md text-[12.5px] bg-white text-(--color-text) border border-(--color-border-strong) hover:border-[#8A8886] focus:border-(--color-brand) focus:shadow-[inset_0_-1px_0_0_var(--color-brand)] focus:outline-none transition-colors"
                    />
                  ) : (
                    <GroupedRuanganSelect
                      ref={ruanganRef}
                      groups={tempatRuanganGroups}
                      value={ruangan}
                      onValueChange={(val) => {
                        setRuangan(val);
                        markTouched('ruangan');
                      }}
                      allowNone
                      noneLabel="Tanpa tempat"
                      placeholder="Pilih tempat / ruangan"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 3b. Pengulangan Jadwal */}
            {mode === 'edit' && initialData?.seriId && (
              <div className="flex-none flex items-center gap-2 p-2 rounded-md bg-(--color-surface-alt) border border-(--color-border) text-[11.5px] text-(--color-text-secondary)">
                <ArrowSync16Regular className="text-(--color-brand) shrink-0" />
                <span>
                  Bagian dari kegiatan berulang (<strong>Pertemuan {initialData.urutanSeri ?? 1} dari {initialData.totalSeri ?? '?'}</strong>). Perubahan disimpan untuk pertemuan ini saja.
                </span>
              </div>
            )}

            {mode === 'create' && (
              <div
                className={cn(
                  'flex-none border border-(--color-border) rounded-md bg-(--color-surface-subtle) transition-all',
                  isRecurring ? 'p-2.5 flex flex-col gap-2' : 'px-2.5 py-1.5 flex items-center justify-between'
                )}
              >
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => {
                        setIsRecurring(e.target.checked);
                        setIsDirty(true);
                      }}
                      className="rounded border-(--color-border-strong) text-(--color-brand) focus:ring-(--color-brand) w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-[12px] font-semibold text-(--color-text)">
                      Jadwal berulang
                    </span>
                  </label>
                </div>

                {isRecurring && (
                  <div className="pt-2 border-t border-(--color-border) flex flex-col gap-2.5 animate-in fade-in-50 duration-150">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <FormLabel className="text-[11.5px] mb-1">Frekuensi</FormLabel>
                        <Select
                          value={recurringFreq}
                          onValueChange={(val) => {
                            setRecurringFreq(val as FrekuensiPengulangan);
                            setIsDirty(true);
                          }}
                          options={[
                            { value: 'mingguan', label: 'Setiap minggu' },
                            { value: 'dua_mingguan', label: 'Setiap 2 minggu' },
                            { value: 'bulanan', label: 'Setiap bulan' },
                          ]}
                        />
                      </div>

                      <div>
                        <FormLabel className="text-[11.5px] mb-1">Batas pengulangan</FormLabel>
                        <Select
                          value={recurringEndType}
                          onValueChange={(val) => {
                            setRecurringEndType(val as TipeBerakhirPengulangan);
                            setIsDirty(true);
                          }}
                          options={[
                            { value: 'pertemuan', label: 'Jumlah pertemuan' },
                            { value: 'tanggal', label: 'Sampai tanggal' },
                          ]}
                        />
                      </div>
                    </div>

                    {recurringEndType === 'pertemuan' ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <FormLabel className="mb-0 text-[12px] text-(--color-text-secondary) whitespace-nowrap">
                            Total pertemuan:
                          </FormLabel>
                          <input
                            type="number"
                            min={2}
                            max={52}
                            value={recurringCount}
                            onChange={(e) => {
                              const val = Math.max(2, Math.min(52, parseInt(e.target.value) || 2));
                              setRecurringCount(val);
                              setIsDirty(true);
                            }}
                            className="w-18 h-(--density-control-h) px-2 rounded-md text-[12.5px] bg-white text-(--color-text) border border-(--color-border-strong) text-center focus:border-(--color-brand) focus:outline-none"
                          />
                          <span className="text-[12px] text-(--color-text-muted)">kali</span>
                        </div>
                        {dicoba && currentErrors.recurringCount && (
                          <InlineError message={currentErrors.recurringCount} />
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <FormLabel className="mb-0 text-[12px] text-(--color-text-secondary) whitespace-nowrap">
                            Sampai tanggal:
                          </FormLabel>
                          <div className="w-44">
                            <DatePicker
                              value={recurringUntilDate}
                              onChange={(val) => {
                                setRecurringUntilDate(val);
                                setIsDirty(true);
                              }}
                              formatDisplay="dd/MM/yyyy"
                              placeholder="Pilih batas tanggal"
                              className="font-mono text-[12px]"
                            />
                          </div>
                        </div>
                        {dicoba && currentErrors.recurringUntilDate && (
                          <InlineError message={currentErrors.recurringUntilDate} />
                        )}
                      </div>
                    )}

                    {/* Ringkasan jadwal pengulangan */}
                    <div className="text-[11.5px] text-(--color-text-secondary) bg-white p-2 rounded border border-(--color-border) flex items-start gap-1.5 leading-relaxed">
                      <span className="font-semibold text-(--color-text)">Ringkasan:</span>
                      <span>{summaryRecurringText}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Conflict Warnings (Kuning non-blocking) */}
            {conflicts.length > 0 && (
              <div className="flex-none flex flex-col gap-2">
                {conflicts.map((item, idx) => (
                  <ConflictWarning
                    key={`${item.tipe}-${item.kegiatanBentrokId}-${idx}`}
                    title={item.keterangan || `${item.entitasNama} bentrok pada jam ini.`}
                    evidence={`${item.kegiatanBentrokNama} · ${item.mulai}–${item.selesai}`}
                    onHighlightInCalendar={() =>
                      onHighlightConflict?.(item.kegiatanBentrokId, tanggal)
                    }
                    onChangeRoomOrSubject={() => {
                      if (item.tipe === 'ruangan') ruanganRef.current?.focus();
                      else mulaiRef.current?.focus();
                    }}
                    onProceedAnyway={() => {
                      handleSave(false);
                    }}
                    actionLabels={{
                      highlight: 'Sorot di kalender',
                      change: item.tipe === 'ruangan' ? 'Pilih ruangan lain' : 'Ubah jam kegiatan',
                      proceed: 'Simpan tetap',
                    }}
                  />
                ))}
              </div>
            )}

            {/* 5. Mapel & Materi (Only if jenis mewajibkan materi or mapel is selected) */}
            {(currentJenisData?.materiWajib || mapel) && (
              <div className="grid grid-cols-2 gap-2.5 items-start flex-none">
                {/* Mapel */}
                <div>
                  <FormLabel required error={Boolean(dicoba && currentErrors.mapel)}>
                    Mata pelajaran
                  </FormLabel>
                  <Select
                    ref={mapelRef}
                    value={mapel}
                    onValueChange={(val) => {
                      setMapel(val);
                      setMateri('');
                      markTouched('mapel');
                    }}
                    placeholder="Pilih mata pelajaran"
                    options={mapelList.map((m) => ({
                      value: m.id,
                      label: m.nama,
                    }))}
                    error={Boolean((dicoba || touched.mapel) && currentErrors.mapel)}
                  />
                  {(dicoba || touched.mapel) && currentErrors.mapel && (
                    <InlineError message={currentErrors.mapel} />
                  )}
                </div>

                {/* Materi */}
                <div>
                  <FormLabel required error={Boolean(dicoba && currentErrors.materi)}>
                    Materi
                  </FormLabel>
                  <Select
                    ref={materiRef}
                    value={materi}
                    disabled={!mapel}
                    onValueChange={(val) => {
                      setMateri(val);
                      markTouched('materi');
                    }}
                    placeholder={
                      !mapel
                        ? 'Pilih mata pelajaran dulu'
                        : availableMateriOptions.length > 0
                        ? 'Pilih materi'
                        : 'Tidak ada materi yang cocok'
                    }
                    options={availableMateriOptions}
                    error={Boolean((dicoba || touched.materi) && currentErrors.materi)}
                  />
                  {(dicoba || touched.materi) && currentErrors.materi && (
                    <InlineError message={currentErrors.materi} />
                  )}
                  {mapel && selectedStudentJenjang.length > 0 && (
                    <p className="mt-1 text-[11px] text-(--color-text-muted) leading-tight">
                      Disaring untuk jenjang {selectedStudentJenjang.join(', ')} sesuai siswa
                      terpilih.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 6. Subjek */}
            <div className="flex flex-col gap-1.5 flex-none">
              <FormLabel error={Boolean(dicoba && currentErrors.subjek)}>
                Subjek
              </FormLabel>

              <div className="flex flex-wrap items-center gap-1.5 min-h-6">
                {subjek.map((item, idx) => {
                  const s = subjekList.find((x) => x.id === item.id);
                  const namaSubjek = s ? s.nama : 'Subjek';
                  return (
                    <SubjekChip
                      key={`${item.id}-${idx}`}
                      nama={namaSubjek}
                      peran={item.peran as SubjekPeran}
                      isPrimary={item.peran === 'Pengisi'}
                      availablePeran={['Pengisi', 'Pendamping', 'Pengganti', 'Support']}
                      onPeranChange={(newPeran) => handleChangeSubjekPeran(idx, newPeran)}
                      onRemove={() => handleRemoveSubjek(idx)}
                    />
                  );
                })}

                {subjek.length === 0 && subjekList.length === 0 && (
                  <span className="text-[11.5px] text-(--color-text-muted) italic">
                    Belum ada data subjek.
                  </span>
                )}

                {/* "+ tambah" Button with Popover (only shown when master subjek has data) */}
                {subjekList.length > 0 && (
                  <PopoverPrimitive.Root
                    open={menuTambahSubjekOpen}
                    onOpenChange={setMenuTambahSubjekOpen}
                  >
                    <PopoverPrimitive.Trigger asChild>
                      <AddSubjekButton
                        disabled={remainingSubjek.length === 0}
                        title={
                          remainingSubjek.length === 0
                            ? 'Semua subjek aktif sudah dipakai'
                            : 'Tambah subjek dari daftar aktif'
                        }
                      />
                    </PopoverPrimitive.Trigger>
                    <PopoverPrimitive.Portal>
                      <PopoverPrimitive.Content
                        align="start"
                        sideOffset={4}
                        className="z-50 w-56 max-h-50 overflow-y-auto rounded-md border border-(--color-border) bg-white p-1 text-[12px] shadow-(--shadow-overlay) animate-in fade-in-0 zoom-in-95"
                      >
                        <div className="px-2 py-1 text-[10.5px] font-semibold text-(--color-text-muted) uppercase tracking-wider">
                          Tambah Subjek
                        </div>
                        {remainingSubjek.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleAddSubjek(s.id)}
                            className="w-full text-left px-2 py-1.5 rounded-sm hover:bg-(--color-surface-alt) text-(--color-text) cursor-pointer flex items-center"
                          >
                            <span className="truncate">{s.nama}</span>
                          </button>
                        ))}
                      </PopoverPrimitive.Content>
                    </PopoverPrimitive.Portal>
                  </PopoverPrimitive.Root>
                )}
              </div>

              {(dicoba || touched.subjek) && currentErrors.subjek && (
                <InlineError message={currentErrors.subjek} />
              )}
            </div>

            {/* 7. Siswa Checklist */}
            <div className="flex flex-col gap-1 flex-1 min-h-60">
              <div className="flex items-center justify-between flex-none">
                <FormLabel
                  required={Boolean(currentJenisData?.siswaWajib)}
                  error={Boolean(dicoba && currentErrors.siswa)}
                  className="mb-0"
                >
                  Siswa ·{' '}
                  <strong className="font-mono text-(--color-text) font-semibold">
                    {selectedSiswaIds.length}
                  </strong>{' '}
                  dipilih
                </FormLabel>

                {/* "+ Dari kelas" Button with Popover */}
                <PopoverPrimitive.Root
                  open={menuDariKelasOpen}
                  onOpenChange={setMenuDariKelasOpen}
                >
                  <PopoverPrimitive.Trigger asChild>
                    <button
                      type="button"
                      className="h-6 px-2.5 rounded border border-(--color-border-strong) bg-white text-[11.5px] font-medium text-(--color-text) hover:bg-(--color-surface-alt) transition-colors cursor-pointer inline-flex items-center gap-1"
                      title="Salin siswa dari satu kelas sekaligus"
                    >
                      <Add16Regular className="text-[11px]" />
                      <span>Dari kelas</span>
                      <ChevronDown12Regular className="text-[10px] opacity-70" />
                    </button>
                  </PopoverPrimitive.Trigger>
                  <PopoverPrimitive.Portal>
                    <PopoverPrimitive.Content
                      align="end"
                      sideOffset={4}
                      className="z-50 w-64 max-h-56 overflow-y-auto rounded-md border border-(--color-border) bg-white p-1 text-[12px] shadow-(--shadow-overlay) animate-in fade-in-0 zoom-in-95"
                    >
                      <div className="px-2 py-1 text-[10.5px] font-semibold text-(--color-text-muted) uppercase tracking-wider">
                        Pilih Kelas
                      </div>
                      {kelasList.map((k) => {
                        const count = activeSiswa.filter(
                          (s) => k.anggota?.includes(s.id) || s.daftarKelas?.includes(k.id)
                        ).length;
                        return (
                          <button
                            key={k.id}
                            type="button"
                            onClick={() => handleCopyClass(k.id)}
                            className="w-full text-left px-2 py-1.5 rounded-sm hover:bg-(--color-surface-alt) text-(--color-text) cursor-pointer flex flex-col"
                          >
                            <span className="font-semibold text-[12px] truncate">{k.nama}</span>
                            <span className="text-[10.5px] text-(--color-text-muted)">
                              {count} siswa aktif
                            </span>
                          </button>
                        );
                      })}
                    </PopoverPrimitive.Content>
                  </PopoverPrimitive.Portal>
                </PopoverPrimitive.Root>
              </div>

              {/* Copied Classes Chips */}
              {copiedClasses.length > 0 && (
                <div className="flex flex-wrap gap-1 flex-none">
                  {copiedClasses.map((item) => (
                    <div
                      key={item.kelasId}
                      className="inline-flex items-center gap-1.5 h-6 pl-2.5 pr-1 rounded-full border border-(--color-border) bg-(--color-surface-alt) text-[11.5px] text-(--color-text)"
                    >
                      <span className="font-semibold text-(--color-brand-ink)">{item.nama}</span>
                      <span className="text-(--color-text-muted)">· {item.count} disalin</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCopiedClass(item.kelasId)}
                        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-(--color-danger-bg) hover:text-(--color-danger) cursor-pointer"
                        title={`Hapus siswa dari ${item.nama}`}
                      >
                        <Dismiss16Regular className="text-[10px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Student Search & Checklist Container */}
              <div className="flex-1 min-h-50 flex flex-col border border-(--color-border) rounded-md bg-white overflow-hidden text-[12px]">
                {/* Search Header */}
                <div className="p-1.5 border-b border-(--color-border-subtle) bg-(--color-surface-alt) flex items-center gap-2 flex-none">
                  <SearchInput
                    placeholder="Cari nama siswa..."
                    value={searchSiswa}
                    onChange={(e) => setSearchSiswa(e.target.value)}
                    onClear={() => setSearchSiswa('')}
                    className="h-6.5 text-[12px]"
                  />
                </div>

                {/* Bulk Select Toolbar */}
                <div className="h-6 px-2 border-b border-(--color-border-subtle) bg-(--color-surface) flex items-center justify-between text-[11px] text-(--color-text-muted) flex-none">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allVisibleAreSelected}
                      onChange={handleToggleAllVisible}
                      className="w-3.5 h-3.5 accent-(--color-brand) cursor-pointer"
                    />
                    <span>Pilih semua yang tampil</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleClearAllStudents}
                    disabled={selectedSiswaIds.length === 0}
                    className={cn(
                      'text-[11px] cursor-pointer',
                      selectedSiswaIds.length > 0
                        ? 'text-(--color-brand) hover:underline'
                        : 'text-(--color-text-muted) cursor-not-allowed opacity-50'
                    )}
                  >
                    Kosongkan
                  </button>
                </div>

                {/* Grouped Checklist */}
                <div className="flex-1 min-h-35 overflow-y-auto divide-y divide-(--color-border-subtle)">
                  {activeSiswa.length === 0 ? (
                    <div className="p-4 text-center text-(--color-text-muted) text-[11.5px]">
                      Belum ada data siswa di master data.
                    </div>
                  ) : groupedStudents.length === 0 ? (
                    <div className="p-4 text-center text-(--color-text-muted) text-[11.5px]">
                      Tidak ada siswa yang cocok dengan &quot;{searchSiswa}&quot;.
                    </div>
                  ) : (
                    groupedStudents.map((group) => (
                      <div key={group.label} className="p-1">
                        <div className="px-2 py-0.5 text-[10px] font-semibold text-(--color-text-muted) uppercase tracking-wider bg-(--color-surface-alt) rounded-xs mb-1">
                          {group.label}
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 px-1">
                          {group.students.map((student) => {
                            const isChecked = selectedSiswaIds.includes(student.id);
                            const kelas = kelasList.find(
                              (k) =>
                                k.anggota?.includes(student.id) ||
                                student.daftarKelas?.includes(k.id)
                            );
                            return (
                              <label
                                key={student.id}
                                className={cn(
                                  'flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm hover:bg-(--color-surface-alt) cursor-pointer select-none transition-colors',
                                  isChecked && 'bg-(--color-brand-subtle)/35 font-medium'
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleStudent(student.id)}
                                  className="w-3.5 h-3.5 accent-(--color-brand) cursor-pointer flex-none"
                                />
                                <span className="truncate flex-1 text-[12px]">{student.nama}</span>
                                {kelas ? (
                                  <span className="font-mono text-[9.5px] text-(--color-text-muted) truncate max-w-20">
                                    {kelas.nama}
                                  </span>
                                ) : student.jenjang ? (
                                  <span className="font-mono text-[9.5px] text-(--color-text-muted)">
                                    {student.jenjang}
                                  </span>
                                ) : null}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {(dicoba || touched.siswa) && currentErrors.siswa && (
                <div className="flex-none">
                  <InlineError message={currentErrors.siswa} />
                </div>
              )}
            </div>

            {/* 8. Catatan Rencana */}
            <div className="flex-none">
              <FormLabel>Catatan rencana</FormLabel>
              <Textarea
                rows={2}
                value={catatan}
                onChange={(e) => {
                  setCatatan(e.target.value);
                  markTouched('catatan');
                }}
                placeholder="Catatan tambahan (opsional)"
                className="resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="h-12 flex-none border-t border-(--color-border) bg-(--color-surface-alt) flex items-center gap-2 px-3.5 select-none">
            <div className="flex-1 min-w-0 font-mono text-[11px] text-(--color-text-muted) truncate">
              {draftTime}
              {conflicts.length > 0 && ` · ${conflicts.length} peringatan bentrok`}
            </div>

            <Button variant="secondary" onClick={handleRequestClose}>
              Batal
            </Button>

            <Button
              variant="secondary"
              onClick={() => handleSave(true)}
              disabled={isSaveDisabled || isSaving}
              title={isSaveDisabled ? 'Perbaiki isian yang ditandai merah dulu' : undefined}
            >
              Simpan &amp; buat lagi
            </Button>

            <Button
              variant="primary"
              onClick={() => handleSave(false)}
              disabled={isSaveDisabled || isSaving}
              title={isSaveDisabled ? 'Perbaiki isian yang ditandai merah dulu' : undefined}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </aside>
      </div>

      {/* Confirmation Dialog on Discard Unsaved Changes */}
      <Dialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <DialogContent className="max-w-122 p-4">
          <h3 className="text-[15px] font-semibold text-(--color-text)">
            Tutup form tanpa menyimpan?
          </h3>
          <p className="text-[13px] text-(--color-text-secondary) mt-1.5 leading-relaxed">
            {mode === 'edit'
              ? `Perubahan pada "${nama || 'kegiatan ini'}" belum disimpan. Menutup form sekarang membuang perubahan itu.`
              : 'Isian kegiatan baru ini belum disimpan. Menutup form sekarang membuang semuanya.'}
          </p>

          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-(--color-border-subtle)">
            <Button
              variant="primary"
              onClick={() => {
                setShowDiscardConfirm(false);
              }}
            >
              Lanjutkan mengisi
            </Button>

            <Button
              variant="danger"
              onClick={() => {
                setShowDiscardConfirm(false);
                setIsDirty(false);
                onClose();
              }}
            >
              Tutup, buang isian
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
