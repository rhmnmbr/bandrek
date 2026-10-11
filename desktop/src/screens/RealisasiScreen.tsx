import * as React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft16Regular,
  Warning16Regular,
  Warning12Regular,
  Checkmark16Regular,
} from '@fluentui/react-icons';
import { KegiatanBadge } from '@/components/ui/badge';
import {
  useKegiatanDetail,
  useKegiatanDaftar,
  useSimpanRealisasi,
  useSubjekList,
  useSiswaList,
  useRuanganList,
  useTempatList,
  useJenisKegiatanList,
  useMapelList,
  useAllMateriList,
} from '@/data/hooks';
import type { StatusKehadiran, KetuntasanMateri } from '@/data/types/realisasi';
import {
  KehadiranSegmentedControl,
  KetuntasanSegmentedControl,
  type KehadiranValue,
  type KetuntasanValue,
} from '@/components/ui/segmented-control';
import { ConfirmDialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { TimePicker } from '@/components/ui/time-picker';
import { useToast } from '@/components/ui/toast';
import {
  menit,
  formatTanggalRingkas,
  toDate,
} from '@/lib/dateUtils';
import { BANDREK_EVENTS, dispatchBandrekEvent } from '@/lib/keyboardShortcuts';
import { cn } from '@/lib/utils';

const KEHADIRAN_ITEMS: StatusKehadiran[] = ['hadir', 'izin', 'sakit', 'alpa'];

const KEHADIRAN_CONFIG: Record<
  StatusKehadiran,
  { label: string; glyph: string; brd: string; bg: string; ink: string }
> = {
  hadir: { label: 'Hadir', glyph: '✓', brd: '#4CAF50', bg: '#E8F5E9', ink: '#2E7D32' },
  izin: { label: 'Izin', glyph: '✉', brd: '#0F6CBD', bg: '#EBF3FC', ink: '#0C548F' },
  sakit: { label: 'Sakit', glyph: '◐', brd: '#F0A82E', bg: '#FFF3E0', ink: '#8A5200' },
  alpa: { label: 'Alpa', glyph: '✕', brd: '#C50F1F', bg: '#FDE7E9', ink: '#9B0C18' },
};

export const RealisasiScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // Queries
  const { data: kegiatan, isLoading, isError } = useKegiatanDetail(id || '');
  const { data: semuaKegiatan = [] } = useKegiatanDaftar();
  const { data: subjekList = [] } = useSubjekList();
  const { data: siswaList = [] } = useSiswaList();
  const { data: ruanganList = [] } = useRuanganList();
  const { data: tempatList = [] } = useTempatList();
  const { data: jenisList = [] } = useJenisKegiatanList();
  const { data: mapelList = [] } = useMapelList();
  const { data: materiList = [] } = useAllMateriList();

  const simpanRealisasiMutation = useSimpanRealisasi();

  // Master data lookups
  const subjekMap = React.useMemo(() => new Map(subjekList.map((s) => [s.id, s])), [subjekList]);
  const siswaMap = React.useMemo(() => new Map(siswaList.map((s) => [s.id, s])), [siswaList]);
  const ruanganMap = React.useMemo(() => new Map(ruanganList.map((r) => [r.id, r])), [ruanganList]);
  const tempatMap = React.useMemo(() => new Map(tempatList.map((t) => [t.id, t])), [tempatList]);
  const jenisMap = React.useMemo(() => new Map(jenisList.map((j) => [j.id, j])), [jenisList]);
  const mapelMap = React.useMemo(() => new Map(mapelList.map((m) => [m.id, m])), [mapelList]);
  const materiMap = React.useMemo(() => new Map(materiList.map((m) => [m.id, m])), [materiList]);

  // Screen Mode ('baru' vs 'ubah')
  const mode = kegiatan?.realisasi ? 'ubah' : 'baru';

  // Form State
  const [mulai, setMulai] = React.useState<string>('');
  const [selesai, setSelesai] = React.useState<string>('');
  const [sama, setSama] = React.useState<boolean>(true);
  const [materi, setMateri] = React.useState<string>('');
  const [ketuntasan, setKetuntasan] = React.useState<KetuntasanValue | ''>('');
  const [catatan, setCatatan] = React.useState<string>('');
  const [kehadiran, setKehadiran] = React.useState<Record<string, StatusKehadiran>>({});
  const [catatanSiswa, setCatatanSiswa] = React.useState<Record<string, string>>({});
  const [kehadiranSubjek, setKehadiranSubjek] = React.useState<Record<string, StatusKehadiran>>({});
  const [catatanSubjek, setCatatanSubjek] = React.useState<Record<string, string>>({});
  const [lanjutan, setLanjutan] = React.useState<boolean>(false);

  // Status & Validation State
  const [dicoba, setDicoba] = React.useState<boolean>(false);
  const [isDirty, setIsDirty] = React.useState<boolean>(false);
  const [drafTime, setDrafTime] = React.useState<string | null>(null);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = React.useState<boolean>(false);

  // Field refs for auto-focus/scrolling
  const mulaiRef = React.useRef<HTMLButtonElement>(null);
  const materiRef = React.useRef<HTMLButtonElement>(null);
  const siswaScrollRef = React.useRef<HTMLDivElement>(null);
  const subjekScrollRef = React.useRef<HTMLDivElement>(null);

  // Load initial data from draft or kegiatan
  React.useEffect(() => {
    if (!kegiatan) return;

    const draftKey = `bandrek:realisasi:draft:${kegiatan.id}`;
    const savedDraft = sessionStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setMulai(parsed.mulai ?? kegiatan.mulai);
        setSelesai(parsed.selesai ?? kegiatan.selesai);
        setSama(Boolean(parsed.sama));
        setMateri(parsed.materi ?? kegiatan.materi ?? '');
        setKetuntasan(parsed.ketuntasan ?? '');
        setCatatan(parsed.catatan ?? '');
        setKehadiran(parsed.kehadiran ?? {});
        setCatatanSiswa(parsed.catatanSiswa ?? {});
        setKehadiranSubjek(parsed.kehadiranSubjek ?? {});
        setCatatanSubjek(parsed.catatanSubjek ?? {});
        setLanjutan(Boolean(parsed.lanjutan));
        setDrafTime(parsed.drafTime ?? null);
        setIsDirty(false);
        return;
      } catch (err) {
        console.error('Failed to parse draft from sessionStorage', err);
      }
    }

    if (kegiatan.realisasi) {
      const re = kegiatan.realisasi;
      setMulai(re.mulai);
      setSelesai(re.selesai);
      setSama(re.mulai === kegiatan.mulai && re.selesai === kegiatan.selesai);
      setMateri(re.materi || kegiatan.materi || '');
      setKetuntasan((re.ketuntasan as KetuntasanValue) || '');
      setCatatan(re.catatan || '');
      setKehadiran({ ...(re.kehadiran || {}) });
      setCatatanSiswa({ ...(re.catatanSiswa || {}) });
      setKehadiranSubjek({ ...(re.kehadiranSubjek || {}) });
      setCatatanSubjek({ ...(re.catatanSubjek || {}) });
      setLanjutan(false);
    } else {
      setMulai(kegiatan.mulai);
      setSelesai(kegiatan.selesai);
      setSama(true);
      setMateri(kegiatan.materi || '');
      setKetuntasan('');
      setCatatan('');
      // DOMAIN.md §9: Status default KOSONG, BUKAN Hadir!
      setKehadiran({});
      setCatatanSiswa({});
      setKehadiranSubjek({});
      setCatatanSubjek({});
      setLanjutan(false);
    }
    setDrafTime(null);
    setIsDirty(false);
  }, [kegiatan]);

  // Derived master data & kind properties
  const currentJenis = kegiatan ? jenisMap.get(kegiatan.jenis) : null;
  const pakaiMateri = Boolean(currentJenis?.materiWajib);

  const currentRuangan = kegiatan?.ruangan ? ruanganMap.get(kegiatan.ruangan) : null;
  const currentTempat = currentRuangan ? tempatMap.get(currentRuangan.tempat) : null;

  // Time & Duration Calculations
  const timeValid = Boolean(mulai && selesai && menit(selesai) > menit(mulai));
  const timeError = !mulai || !selesai
    ? 'Jam mulai dan jam selesai aktual harus diisi.'
    : menit(selesai) <= menit(mulai)
      ? `Jam selesai aktual harus setelah jam mulai. Ubah menjadi setelah ${mulai}.`
      : null;

  const durasiStr = timeValid ? `${menit(selesai) - menit(mulai)} menit` : '—';
  const dMulai = kegiatan && mulai ? menit(mulai) - menit(kegiatan.mulai) : 0;
  const adaSelisih = Boolean(mulai && dMulai !== 0);
  const selisihStr = dMulai > 0 ? `mulai telat ${dMulai} menit` : `mulai ${-dMulai} menit lebih awal`;

  // Materi discrepancy detection
  const plannedMateriObj = kegiatan?.materi ? materiMap.get(kegiatan.materi) : null;
  const plannedMapelObj = plannedMateriObj ? mapelMap.get(plannedMateriObj.mapel) : null;
  const plannedMateriNama = plannedMateriObj
    ? `${plannedMapelObj?.nama || '—'} › ${plannedMateriObj.nama}`
    : '—';

  const currentMateriObj = materi ? materiMap.get(materi) : null;
  const currentMapelObj = currentMateriObj ? mapelMap.get(currentMateriObj.mapel) : null;
  const currentMateriNama = currentMateriObj
    ? `${currentMapelObj?.nama || '—'} › ${currentMateriObj.nama}`
    : '—';

  const materiBeda = Boolean(pakaiMateri && materi && kegiatan?.materi && materi !== kegiatan.materi);
  const materiBedaTeks = `Berbeda dari rencana (${plannedMateriNama}). Matriks belajar akan mencatat materi ini, dan materi rencana tetap belum tersampaikan.`;

  // Validation Checks
  const siswaMissing = (kegiatan?.siswa || []).filter((sid) => !kehadiran[sid]);
  const subjekMissing = (kegiatan?.subjek || []).filter((s) => !kehadiranSubjek[s.id]);

  const materiError = pakaiMateri && !materi
    ? 'Pilih materi yang benar-benar disampaikan — ini yang dibaca matriks belajar, bukan materi rencana.'
    : null;

  const ketuntasanError = pakaiMateri && !ketuntasan
    ? 'Pilih ketuntasan materi.'
    : null;

  const hasErrors = Boolean(
    timeError ||
    materiError ||
    ketuntasanError ||
    siswaMissing.length > 0 ||
    subjekMissing.length > 0
  );

  // Summary counts for attendance
  const hitungKehadiran = (
    ids: string[],
    records: Record<string, StatusKehadiran>
  ) => {
    const counts: Record<StatusKehadiran, number> = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
    let belumDiisi = 0;
    ids.forEach((id) => {
      const v = records[id];
      if (v && counts[v] !== undefined) {
        counts[v]++;
      } else {
        belumDiisi++;
      }
    });
    return { counts, belumDiisi };
  };

  const siswaCounts = React.useMemo(
    () => hitungKehadiran(kegiatan?.siswa || [], kehadiran),
    [kegiatan?.siswa, kehadiran]
  );

  const subjekCounts = React.useMemo(
    () => hitungKehadiran((kegiatan?.subjek || []).map((s) => s.id), kehadiranSubjek),
    [kegiatan?.subjek, kehadiranSubjek]
  );

  // Materi Options
  const opsiMateri = React.useMemo(() => {
    if (!kegiatan?.mapel) return [];
    const list = materiList
      .filter((t) => t.mapel === kegiatan.mapel && (t.aktif || t.id === materi))
      .map((t) => ({
        id: t.id,
        nama: `${mapelMap.get(t.mapel)?.nama || '—'} › ${t.nama}`,
      }));
    if (materi && !list.some((o) => o.id === materi)) {
      list.unshift({ id: materi, nama: currentMateriNama });
    }
    return list;
  }, [kegiatan?.mapel, materiList, materi, mapelMap, currentMateriNama]);

  // Other pending activities counter
  const menungguCount = React.useMemo(() => {
    if (!kegiatan) return 0;
    return semuaKegiatan.filter(
      (k) => k.id !== kegiatan.id && (k.status === 'belum_direalisasi' || k.status === 'terjadwal')
    ).length;
  }, [semuaKegiatan, kegiatan]);

  // Breadcrumb Asal
  const breadcrumbAsal = location.state?.fromTitle || 'Kalender';
  const breadcrumbPath = location.state?.fromPath || '/kalender';

  // Navigation Back Handlers
  const handleKembali = React.useCallback(() => {
    if (isDirty) {
      setConfirmDiscardOpen(true);
      return;
    }
    if (breadcrumbPath) {
      navigate(breadcrumbPath);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/kalender');
    }
  }, [isDirty, breadcrumbPath, navigate]);

  // Esc listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleKembali();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKembali]);

  // Bulk Attendance Actions
  const handleTandaiSemuaHadirSiswa = () => {
    if (!kegiatan) return;
    setKehadiran((prev) => {
      const next = { ...prev };
      kegiatan.siswa.forEach((sid) => {
        if (!next[sid]) next[sid] = 'hadir';
      });
      return next;
    });
    setIsDirty(true);
  };

  const handleKosongkanSiswa = () => {
    if (!kegiatan) return;
    setKehadiran((prev) => {
      const next = { ...prev };
      kegiatan.siswa.forEach((sid) => {
        delete next[sid];
      });
      return next;
    });
    setIsDirty(true);
  };

  const handleTandaiSemuaHadirSubjek = () => {
    if (!kegiatan) return;
    setKehadiranSubjek((prev) => {
      const next = { ...prev };
      kegiatan.subjek.forEach((s) => {
        if (!next[s.id]) next[s.id] = 'hadir';
      });
      return next;
    });
    setIsDirty(true);
  };

  const handleKosongkanSubjek = () => {
    if (!kegiatan) return;
    setKehadiranSubjek((prev) => {
      const next = { ...prev };
      kegiatan.subjek.forEach((s) => {
        delete next[s.id];
      });
      return next;
    });
    setIsDirty(true);
  };

  // Toggle single presence (clicking active deselects it)
  const handleToggleKehadiranSiswa = (sid: string, val: KehadiranValue) => {
    setKehadiran((prev) => {
      const next = { ...prev };
      if (next[sid] === val) {
        delete next[sid];
      } else {
        next[sid] = val;
      }
      return next;
    });
    setIsDirty(true);
  };

  const handleToggleKehadiranSubjek = (subjekId: string, val: KehadiranValue) => {
    setKehadiranSubjek((prev) => {
      const next = { ...prev };
      if (next[subjekId] === val) {
        delete next[subjekId];
      } else {
        next[subjekId] = val;
      }
      return next;
    });
    setIsDirty(true);
  };

  // Draft Save Handler
  const handleSimpanDraf = () => {
    if (!kegiatan) return;
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const draftPayload = {
      mulai,
      selesai,
      sama,
      materi,
      ketuntasan,
      catatan,
      kehadiran,
      catatanSiswa,
      kehadiranSubjek,
      catatanSubjek,
      lanjutan,
      drafTime: nowTime,
    };
    sessionStorage.setItem(`bandrek:realisasi:draft:${kegiatan.id}`, JSON.stringify(draftPayload));
    setDrafTime(nowTime);
    setIsDirty(false);
    showToast({
      message: 'Draf realisasi disimpan. Kegiatan belum ditandai terealisasi.',
      type: 'info',
    });
  };

  // Auto-scroll to error helper
  const scrollToErrorRow = (kunci: string) => {
    const el = document.querySelector(`[data-rel-row="${kunci}"]`) as HTMLElement;
    if (!el) return;
    const container = el.closest('[data-rel-scroll]') as HTMLElement;
    if (!container) return;
    const offset = el.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollTop = container.scrollTop + offset - Math.max(0, container.clientHeight / 3);
  };

  // Final Save Handler
  const handleSimpan = async () => {
    if (!kegiatan) return;

    if (hasErrors) {
      setDicoba(true);
      if (timeError) {
        mulaiRef.current?.focus();
      } else if (materiError) {
        materiRef.current?.focus();
      } else if (subjekMissing.length > 0) {
        setTimeout(() => scrollToErrorRow(`subjek:${subjekMissing[0]}`), 60);
      } else if (siswaMissing.length > 0) {
        setTimeout(() => scrollToErrorRow(`siswa:${siswaMissing[0]}`), 60);
      }
      return;
    }

    try {
      const siswaIds = kegiatan.siswa;
      const subjekIds = kegiatan.subjek.map((s) => s.id);

      // Cleaned presence and text records
      const cleanKehadiranSiswa: Record<string, StatusKehadiran> = {};
      const cleanCatatanSiswa: Record<string, string> = {};
      siswaIds.forEach((sid) => {
        if (kehadiran[sid]) cleanKehadiranSiswa[sid] = kehadiran[sid];
        const c = String(catatanSiswa[sid] || '').trim();
        if (c) cleanCatatanSiswa[sid] = c;
      });

      const cleanKehadiranSubjek: Record<string, StatusKehadiran> = {};
      const cleanCatatanSubjek: Record<string, string> = {};
      subjekIds.forEach((sid) => {
        if (kehadiranSubjek[sid]) cleanKehadiranSubjek[sid] = kehadiranSubjek[sid];
        const c = String(catatanSubjek[sid] || '').trim();
        if (c) cleanCatatanSubjek[sid] = c;
      });

      // Find principal pengisi
      const pengisiRole = kegiatan.subjek.find((s) => s.peran === 'Pengisi') || kegiatan.subjek[0];
      const pengisiObj = pengisiRole ? subjekMap.get(pengisiRole.id) : null;
      const diisiOleh = pengisiObj?.nama || 'Pengisi';

      await simpanRealisasiMutation.mutateAsync({
        kegiatanId: kegiatan.id,
        input: {
          mulai,
          selesai,
          materi: pakaiMateri ? (materi || kegiatan.materi || null) : null,
          ketuntasan: pakaiMateri ? (ketuntasan as KetuntasanMateri) : null,
          catatan: catatan.trim(),
          kehadiranSiswa: cleanKehadiranSiswa,
          catatanSiswa: cleanCatatanSiswa,
          kehadiranSubjek: cleanKehadiranSubjek,
          catatanSubjek: cleanCatatanSubjek,
          diisiOleh,
        },
      });

      // Clear draft on successful save
      sessionStorage.removeItem(`bandrek:realisasi:draft:${kegiatan.id}`);
      setIsDirty(false);

      showToast({
        message: mode === 'ubah' ? 'Realisasi diperbarui.' : 'Realisasi disimpan.',
        type: 'success',
        action: {
          label: 'Lihat detail',
          onClick: () => navigate(`/kegiatan/${kegiatan.id}`),
        },
      });

      // Follow-up activity chain if requested
      const shouldChainFollowUp = Boolean(
        lanjutan && pakaiMateri && (ketuntasan === 'sebagian' || ketuntasan === 'tidak')
      );

      navigate(breadcrumbPath);

      if (shouldChainFollowUp) {
        setTimeout(() => {
          dispatchBandrekEvent(BANDREK_EVENTS.NEW_KEGIATAN, {
            mode: 'create',
            nama: kegiatan.nama,
            jenis: kegiatan.jenis,
            tanggal: '',
            mulai: kegiatan.mulai,
            selesai: kegiatan.selesai,
            sepanjangHari: Boolean(kegiatan.sepanjangHari),
            ruangan: kegiatan.ruangan || '',
            tempatCustom: kegiatan.tempatCustom || '',
            mapel: kegiatan.mapel || '',
            materi: materi || kegiatan.materi || '',
            subjek: kegiatan.subjek,
            siswa: kegiatan.siswa,
            catatan: `Lanjutan dari ${formatTanggalRingkas(kegiatan.tanggal)} — materi belum tuntas.`,
          });
        }, 100);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan realisasi';
      showToast({ message: msg, type: 'error' });
    }
  };

  // Listen to global Ctrl+S save shortcut
  React.useEffect(() => {
    const handleGlobalSave = () => {
      handleSimpan();
    };
    window.addEventListener(BANDREK_EVENTS.SAVE, handleGlobalSave);
    return () => window.removeEventListener(BANDREK_EVENTS.SAVE, handleGlobalSave);
  });

  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center bg-white text-(--color-text-secondary) text-[13px]">
        Memuat data realisasi kegiatan...
      </div>
    );
  }

  if (isError || !kegiatan) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-(--color-surface-alt) p-6 gap-3">
        <div className="text-[15px] font-semibold text-(--color-text)">
          Kegiatan tidak ditemukan
        </div>
        <button
          type="button"
          onClick={() => navigate('/kalender')}
          className="h-6.5 px-3 rounded border border-(--color-border-strong) bg-white text-[12.5px] cursor-pointer"
        >
          Kembali ke Kalender
        </button>
      </div>
    );
  }

  // Derive status pill
  let pilLabel = 'Terjadwal';

  if (kegiatan.status === 'belum_direalisasi') {
    const telatHari = Math.round((new Date().getTime() - toDate(kegiatan.tanggal).getTime()) / 86400000);
    pilLabel = telatHari > 0 ? `Belum direalisasi · telat ${telatHari} hari` : 'Belum direalisasi';
  } else if (kegiatan.status === 'terealisasi') {
    pilLabel = 'Terealisasi';
  }

  // Error summary list
  const ringkasanErrors: string[] = [];
  if (timeError) ringkasanErrors.push(timeError);
  if (materiError) ringkasanErrors.push(materiError);
  if (ketuntasanError) ringkasanErrors.push(ketuntasanError);
  if (subjekMissing.length > 0) {
    const names = subjekMissing
      .map((s) => subjekMap.get(s.id)?.nama || s.id)
      .join(', ');
    ringkasanErrors.push(
      `${subjekMissing.length} subjek belum punya status kehadiran: ${names}.`
    );
  }
  if (siswaMissing.length > 0) {
    const previewNames = siswaMissing
      .slice(0, 3)
      .map((sid) => siswaMap.get(sid)?.nama || sid)
      .join(', ');
    const moreText = siswaMissing.length > 3 ? ` dan ${siswaMissing.length - 3} lainnya` : '';
    ringkasanErrors.push(
      `${siswaMissing.length} siswa belum punya status kehadiran: ${previewNames}${moreText}.`
    );
  }

  // Primary save button state
  const saveDisabled = dicoba && hasErrors;

  // Status Box Details (bottom right)
  let statusBoxTitle = 'Siap disimpan';
  let statusBoxTeks = `Kehadiran lengkap. Menyimpan menandai kegiatan ini terealisasi${
    pakaiMateri && materi ? ` dan mencatat ${currentMateriNama} untuk siswa yang hadir.` : '.'
  }`;
  let statusBoxBrd = '#4CAF50';
  let statusBoxBg = '#E8F5E9';
  let statusBoxInk = '#2E7D32';
  let statusBoxGlyph = '✓';

  if (hasErrors) {
    statusBoxTitle = 'Belum lengkap';
    statusBoxBrd = '#F0A82E';
    statusBoxBg = '#FFF3E0';
    statusBoxInk = '#8A5200';
    statusBoxGlyph = '⚠';
    const parts: string[] = [];
    if (subjekMissing.length > 0) parts.push(`${subjekMissing.length} subjek belum punya status kehadiran`);
    if (siswaMissing.length > 0) parts.push(`${siswaMissing.length} siswa belum punya status kehadiran`);
    if (materiError || ketuntasanError) parts.push('materi dan ketuntasan belum lengkap');
    if (timeError) parts.push('jam aktual belum benar');
    statusBoxTeks = `${parts.join('. ')}. ${
      siswaMissing.length > 0 || subjekMissing.length > 0
        ? 'Isi kehadiran mereka atau tandai semua hadir dulu.'
        : ''
    }`;
  }

  if (drafTime) {
    statusBoxTeks += ` Draf terakhir ${drafTime}.`;
  }

  return (
    <div className="h-full w-full flex-1 min-h-0 flex flex-col bg-white select-none">
      {/* 1. Header / Top Toolbar (H: 44px) */}
      <div className="h-11 flex-none border-b border-(--color-border) bg-white flex items-center gap-2.25 px-3.5 select-none z-10">
        {/* [<] Back Button */}
        <button
          type="button"
          onClick={handleKembali}
          title="Kembali · Esc"
          className="w-6.5 h-6.5 flex-none rounded border border-(--color-border-strong) bg-white text-(--color-text) hover:bg-(--color-surface-alt) flex items-center justify-center cursor-pointer transition-colors text-xs"
        >
          <ChevronLeft16Regular className="text-[12px]" />
        </button>

        {/* Breadcrumb Asal Link */}
        <button
          type="button"
          onClick={handleKembali}
          className="bg-transparent border-none p-0 text-[12.5px] text-(--color-brand) hover:text-(--color-brand-pressed) cursor-pointer font-normal whitespace-nowrap"
        >
          {breadcrumbAsal}
        </button>

        <span className="text-[#8A8886]">›</span>

        {/* Screen Title */}
        <div className="text-[18px] font-semibold text-(--color-text) whitespace-nowrap">
          {mode === 'ubah' ? 'Ubah realisasi' : 'Isi realisasi'}
        </div>

        {/* Status Pill */}
        <KegiatanBadge
          status={
            kegiatan.status === 'terealisasi'
              ? 'terealisasi'
              : kegiatan.status === 'belum_direalisasi'
              ? 'belum'
              : 'terjadwal'
          }
          label={pilLabel}
        />

        <div className="flex-1" />

        {/* Pending Realization Counter Link */}
        {menungguCount > 0 && (
          <button
            type="button"
            onClick={() => navigate('/kegiatan?filter=perlu_realisasi')}
            title="Lihat kegiatan lain yang belum direalisasi"
            className="flex-none bg-transparent border-none px-2 py-1 rounded text-xs text-(--color-text-secondary) hover:bg-(--color-surface-alt) hover:text-(--color-text) cursor-pointer whitespace-nowrap"
          >
            {menungguCount} kegiatan lain menunggu
          </button>
        )}

        {/* Simpan draf Button */}
        <button
          type="button"
          onClick={handleSimpanDraf}
          title="Simpan isian sementara tanpa menandai terealisasi"
          className="flex-none h-6.5 px-2.75 border border-(--color-border-strong) rounded bg-white text-[12.5px] text-(--color-text) cursor-pointer whitespace-nowrap hover:bg-(--color-surface-alt) active:bg-(--color-surface-sunken) transition-colors"
        >
          Simpan draf
        </button>

        {/* Primary Save Button */}
        <button
          type="button"
          onClick={handleSimpan}
          disabled={saveDisabled}
          title={saveDisabled ? 'Lengkapi status kehadiran dulu' : 'Tandai kegiatan ini terealisasi'}
          className={cn(
            'flex-none h-6.5 px-3 rounded border-none font-semibold text-[12.5px] whitespace-nowrap flex items-center gap-1.75 transition-all',
            saveDisabled
              ? 'bg-[#EDEBE9] text-[#8A8886] cursor-not-allowed'
              : 'bg-(--color-brand) text-white hover:brightness-95 active:translate-y-px cursor-pointer'
          )}
        >
          <span>{mode === 'ubah' ? 'Simpan perubahan' : 'Simpan realisasi'}</span>
          <span className="font-mono text-[10px] opacity-75">Ctrl S</span>
        </button>
      </div>

      {/* 2. Main Content (Two Columns Layout) */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left Column (flex-1) */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-y-auto">
          {/* Error Summary Banner (shown if attempted and errors exist) */}
          {dicoba && ringkasanErrors.length > 0 && (
            <div className="flex-none mx-3.5 mt-3.25 border border-(--color-danger) rounded-md bg-(--color-danger-bg) p-2.5 text-xs leading-normal text-(--color-danger-ink)">
              <div className="font-semibold flex items-center gap-1.75">
                <Warning16Regular className="text-sm flex-none" />
                <span>Realisasi belum bisa disimpan — {ringkasanErrors.length} hal perlu dibereskan:</span>
              </div>
              <ul className="mt-1 ml-6 list-disc list-outside space-y-0.5">
                {ringkasanErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Rencana Kegiatan (Context Bar) */}
          <div className="flex-none mx-3.5 mt-3.25 border border-(--color-border) rounded-lg bg-(--color-surface-alt) p-2.5 px-3 flex items-center gap-3.5 text-[12.5px]">
            <div className="flex-none max-w-[65%] leading-snug">
              <div className="text-[14px] font-semibold text-(--color-text) truncate">
                {kegiatan.nama}
              </div>
              <div className="font-mono text-[11.5px] text-(--color-text-secondary) truncate mt-0.5">
                {formatTanggalRingkas(kegiatan.tanggal)} ·{' '}
                {kegiatan.sepanjangHari ? 'Sepanjang hari' : `${kegiatan.mulai}–${kegiatan.selesai}`}
                {' · '}
                {kegiatan.tempatCustom
                  ? kegiatan.tempatCustom
                  : currentRuangan
                  ? `${currentTempat?.nama || '—'} › ${currentRuangan.nama}`
                  : 'Tanpa tempat'}
              </div>
            </div>

            <div className="w-px h-7.5 flex-none bg-(--color-border)" />

            <div className="flex-none leading-snug">
              <div className="text-[10px] font-semibold tracking-wider text-[#5C5A58] uppercase">
                RENCANA MATERI
              </div>
              <div
                className="text-[#242424] text-[12.5px] truncate mt-0.5"
                title={plannedMateriObj ? plannedMateriNama : 'Tanpa materi'}
              >
                {plannedMateriObj ? plannedMateriNama : 'Tanpa materi'}
              </div>
            </div>
          </div>

          {/* Actual Time Controls */}
          <div className="flex-none px-3.5 pt-3 flex gap-2.5 items-end">
            {/* Jam Mulai Aktual */}
            <div className="w-26 flex-none flex flex-col gap-1">
              <label
                htmlFor="rel-jam-mulai"
                className={cn(
                  'text-[11.5px]',
                  dicoba && timeError ? 'text-(--color-danger-ink)' : 'text-(--color-text-secondary)'
                )}
              >
                Jam mulai aktual <span className="text-(--color-danger)">*</span>
              </label>
              <div className="relative">
                <TimePicker
                  id="rel-jam-mulai"
                  ref={mulaiRef}
                  value={mulai}
                  disabled={sama}
                  onChange={(val) => {
                    setMulai(val);
                    setSama(false);
                    setIsDirty(true);
                  }}
                  error={Boolean(dicoba && timeError)}
                />
              </div>
            </div>

            {/* Jam Selesai Aktual */}
            <div className="w-26 flex-none flex flex-col gap-1">
              <label
                htmlFor="rel-jam-selesai"
                className={cn(
                  'text-[11.5px]',
                  dicoba && timeError ? 'text-(--color-danger-ink)' : 'text-(--color-text-secondary)'
                )}
              >
                Jam selesai aktual <span className="text-(--color-danger)">*</span>
              </label>
              <div className="relative">
                <TimePicker
                  id="rel-jam-selesai"
                  value={selesai}
                  disabled={sama}
                  onChange={(val) => {
                    setSelesai(val);
                    setSama(false);
                    setIsDirty(true);
                  }}
                  error={Boolean(dicoba && timeError)}
                />
              </div>
            </div>

            {/* Duration & Delta Badges */}
            <div className="flex-none h-6.5 flex items-center gap-1.75 text-xs text-(--color-text-secondary)">
              <span className="font-mono whitespace-nowrap">{durasiStr}</span>
              {adaSelisih && (
                <span className="border border-[#F0A82E] bg-[#FFF3E0] text-[#8A5200] rounded-full px-2 py-px text-[11px] whitespace-nowrap">
                  {selisihStr}
                </span>
              )}
            </div>

            <div className="flex-1" />

            {/* Sama dengan rencana Checkbox */}
            <label className="flex-none h-6.5 flex items-center gap-1.75 text-xs text-(--color-text-secondary) cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sama}
                onChange={() => {
                  if (sama) {
                    setSama(false);
                  } else {
                    setSama(true);
                    setMulai(kegiatan.mulai);
                    setSelesai(kegiatan.selesai);
                  }
                  setIsDirty(true);
                }}
                className="w-3.25 h-3.25 rounded accent-(--color-brand) cursor-pointer m-0"
              />
              <span>Sama dengan rencana</span>
            </label>
          </div>

          {/* Time Inline Error */}
          {dicoba && timeError && (
            <div className="flex-none px-3.5 pt-1 text-[11px] text-(--color-danger-ink) flex items-center gap-1">
              <Warning12Regular className="w-3.5 h-3.5 flex-none" />
              <span>{timeError}</span>
            </div>
          )}

          {/* Actual Materi & Ketuntasan Row (if kind uses materi) */}
          {pakaiMateri && (
            <div className="flex-none px-3.5 pt-3 flex gap-2.5 items-start">
              {/* Materi Dropdown */}
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <label
                  htmlFor="rel-materi-select"
                  className={cn(
                    'text-[11.5px]',
                    dicoba && materiError ? 'text-(--color-danger-ink)' : 'text-(--color-text-secondary)'
                  )}
                >
                  Materi yang benar-benar disampaikan <span className="text-(--color-danger)">*</span>
                </label>
                <Select
                  ref={materiRef}
                  value={materi}
                  onValueChange={(val) => {
                    setMateri(val);
                    setIsDirty(true);
                  }}
                  placeholder="Pilih materi yang disampaikan"
                  error={Boolean(dicoba && materiError)}
                  density="compact"
                >
                  <option value="">Pilih materi yang disampaikan</option>
                  {opsiMateri.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.nama}
                    </option>
                  ))}
                </Select>

                {/* Materi Inline Error */}
                {dicoba && materiError && (
                  <div className="text-[11px] text-(--color-danger-ink) leading-tight flex items-center gap-1 mt-0.5">
                    <Warning12Regular className="w-3.5 h-3.5 flex-none" />
                    <span>{materiError}</span>
                  </div>
                )}

                {/* Materi Discrepancy Notice */}
                {materiBeda && (
                  <div className="text-[11px] text-[#8A5200] leading-tight flex items-start gap-1 mt-0.5">
                    <Warning12Regular className="w-3.5 h-3.5 flex-none mt-0.5" />
                    <span>{materiBedaTeks}</span>
                  </div>
                )}
              </div>

              {/* Ketuntasan Segmented Buttons */}
              <div className="w-55 flex-none flex flex-col gap-1">
                <label
                  className={cn(
                    'text-[11.5px]',
                    dicoba && ketuntasanError ? 'text-(--color-danger-ink)' : 'text-(--color-text-secondary)'
                  )}
                >
                  Ketuntasan materi <span className="text-(--color-danger)">*</span>
                </label>
                <KetuntasanSegmentedControl
                  value={ketuntasan || null}
                  onChange={(val) => {
                    setKetuntasan(val);
                    setIsDirty(true);
                  }}
                  error={Boolean(dicoba && ketuntasanError)}
                />
                {dicoba && ketuntasanError && (
                  <div className="text-[11px] text-(--color-danger-ink) leading-tight flex items-center gap-1 mt-0.5">
                    <Warning12Regular className="w-3.5 h-3.5 flex-none" />
                    <span>{ketuntasanError}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Combined Kehadiran Container (Subjek & Siswa) */}
          <div className="flex-1 min-h-0 mx-3.5 my-3.5 border border-(--color-border) rounded-lg flex flex-col overflow-hidden bg-white">
            {/* Section A: Kehadiran Subjek */}
            <div
              className={cn(
                'flex flex-col overflow-hidden',
                kegiatan.siswa.length > 0
                  ? 'flex-none max-h-56 border-b border-(--color-border)'
                  : 'flex-1 min-h-0'
              )}
            >
              {/* Header bar Subjek */}
              <div className="flex-none h-9 px-3 bg-(--color-surface-alt) border-b border-(--color-border) flex items-center gap-2.25 select-none">
                <span className="flex-none text-[10.5px] tracking-wider text-[#5C5A58] uppercase font-medium">
                  KEHADIRAN SUBJEK · {kegiatan.subjek.length} ORANG
                </span>
                <button
                  type="button"
                  onClick={handleTandaiSemuaHadirSubjek}
                  className="flex-none h-6 px-2.25 rounded border border-(--color-border-strong) bg-white text-[11.5px] text-(--color-text) hover:bg-(--color-surface-alt) active:bg-(--color-surface-sunken) cursor-pointer"
                >
                  Tandai semua hadir
                </button>
                <button
                  type="button"
                  onClick={handleKosongkanSubjek}
                  disabled={subjekCounts.belumDiisi === kegiatan.subjek.length}
                  className={cn(
                    'flex-none h-6 px-2.25 rounded border-none bg-transparent text-[11.5px]',
                    subjekCounts.belumDiisi === kegiatan.subjek.length
                      ? 'text-[#A19F9D] cursor-not-allowed'
                      : 'text-(--color-brand) hover:bg-[#EBF3FC] cursor-pointer'
                  )}
                >
                  Kosongkan
                </button>

                <div className="flex-1 min-w-2" />

                {/* Subjek Attendance Status Counts */}
                <div className="flex-none flex items-center text-xs whitespace-nowrap">
                  {KEHADIRAN_ITEMS.map((key) => {
                    const count = subjekCounts.counts[key];
                    const cfg = KEHADIRAN_CONFIG[key];
                    return (
                      <span
                        key={key}
                        style={{ color: count ? cfg.ink : '#8A8886' }}
                        className="mr-1"
                      >
                        {count} {cfg.label.toLowerCase()} ·
                      </span>
                    );
                  })}
                  <span
                    style={{
                      color:
                        subjekCounts.belumDiisi > 0
                          ? dicoba
                            ? '#9B0C18'
                            : '#8A5200'
                          : '#2E7D32',
                    }}
                    className="font-semibold"
                  >
                    {subjekCounts.belumDiisi} belum diisi
                  </span>
                </div>
              </div>

              {/* Scrollable Subjek Table Body with Sticky Header */}
              <div
                ref={subjekScrollRef}
                data-rel-scroll="subjek"
                className="flex-1 min-h-0 overflow-y-auto"
              >
                {/* Table Header Subjek (Sticky) */}
                <div className="sticky top-0 z-10 flex-none h-6 px-3 bg-white border-b border-[#EDEBE9] flex items-center text-[10.5px] tracking-wider text-[#5C5A58] uppercase select-none">
                  <div className="w-6 flex-none">#</div>
                  <div className="flex-1 min-w-0">NAMA</div>
                  <div className="w-17.5 flex-none text-left">PERAN</div>
                  <div className="w-53 flex-none">
                    KEHADIRAN <span className="text-(--color-danger)">*</span>
                  </div>
                  <div className="w-72.5 flex-none">KETERANGAN</div>
                </div>

                {kegiatan.subjek.length > 0 ? (
                  kegiatan.subjek.map((sb, idx) => {
                    const sbObj = subjekMap.get(sb.id);
                    const isError = Boolean(dicoba && !kehadiranSubjek[sb.id]);
                    const currentStatus = kehadiranSubjek[sb.id] || null;

                    return (
                      <div key={sb.id} data-rel-row={`subjek:${sb.id}`}>
                        <div
                          style={{
                            backgroundColor: isError ? '#FDE7E9' : '#FFFFFF',
                            boxShadow: isError ? 'inset 3px 0 0 #C50F1F' : 'none',
                          }}
                          className="h-8.5 px-3 border-b border-[#EDEBE9] flex items-center text-[12.5px] transition-colors"
                        >
                          {/* Row Number */}
                          <div
                            style={{ color: isError ? '#9B0C18' : '#5C5A58' }}
                            className="w-6 flex-none font-mono text-[11px]"
                          >
                            {idx + 1}
                          </div>

                          {/* Subjek Name */}
                          <div className="flex-1 min-w-0 truncate text-[#242424]">
                            {sbObj?.nama || sb.id}
                          </div>

                          {/* Peran */}
                          <div className="w-17.5 flex-none text-[#424242]">
                            {sb.peran}
                          </div>

                          {/* Segmented Buttons for Presence */}
                          <div className="w-53 flex-none">
                            <KehadiranSegmentedControl
                              value={currentStatus}
                              onChange={(val) => handleToggleKehadiranSubjek(sb.id, val)}
                              error={isError}
                            />
                          </div>

                          {/* Keterangan Subjek */}
                          <input
                            type="text"
                            value={catatanSubjek[sb.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCatatanSubjek((prev) => ({ ...prev, [sb.id]: val }));
                              setIsDirty(true);
                            }}
                            placeholder="keterangan singkat"
                            className="w-72.5 flex-none h-6.5 px-2 rounded border border-[#EDEBE9] hover:border-[#8A8886] focus:border-(--color-brand) bg-white text-xs outline-none transition-colors"
                          />
                        </div>

                        {/* Error banner below invalid row */}
                        {isError && (
                          <div className="flex items-center gap-1.25 px-3 py-1 pl-9 border-b border-[#EDEBE9] bg-[#FDE7E9] text-[11px] leading-tight text-(--color-danger-ink)">
                            <Warning12Regular className="w-3.5 h-3.5 flex-none" />
                            <span>Pilih status kehadiran untuk {sbObj?.nama || sb.id}.</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 text-[12.5px] leading-relaxed text-[#5C5A58]">
                    Kegiatan ini tidak punya subjek tercatat. Tambahkan lewat “Ubah kegiatan” kalau memang ada yang mengisi.
                  </div>
                )}
              </div>
            </div>

            {/* Section B: Kehadiran Siswa */}
            {kegiatan.siswa.length > 0 ? (
              <div className="flex-1 min-h-33 flex flex-col overflow-hidden">
                {/* Header bar Siswa */}
                <div className="flex-none h-9 px-3 bg-(--color-surface-alt) border-b border-(--color-border) flex items-center gap-2.25 select-none">
                  <span className="flex-none text-[10.5px] tracking-wider text-[#5C5A58] uppercase font-medium">
                    KEHADIRAN · {kegiatan.siswa.length} SISWA
                  </span>
                  <button
                    type="button"
                    onClick={handleTandaiSemuaHadirSiswa}
                    className="flex-none h-6 px-2.25 rounded border border-(--color-border-strong) bg-white text-[11.5px] text-(--color-text) hover:bg-(--color-surface-alt) active:bg-(--color-surface-sunken) cursor-pointer"
                  >
                    Tandai semua hadir
                  </button>
                  <button
                    type="button"
                    onClick={handleKosongkanSiswa}
                    disabled={siswaCounts.belumDiisi === kegiatan.siswa.length}
                    className={cn(
                      'flex-none h-6 px-2.25 rounded border-none bg-transparent text-[11.5px]',
                      siswaCounts.belumDiisi === kegiatan.siswa.length
                        ? 'text-[#A19F9D] cursor-not-allowed'
                        : 'text-(--color-brand) hover:bg-[#EBF3FC] cursor-pointer'
                    )}
                  >
                    Kosongkan
                  </button>

                  <div className="flex-1 min-w-2" />

                  {/* Siswa Attendance Status Counts */}
                  <div className="flex-none flex items-center text-xs whitespace-nowrap">
                    {KEHADIRAN_ITEMS.map((key) => {
                      const count = siswaCounts.counts[key];
                      const cfg = KEHADIRAN_CONFIG[key];
                      return (
                        <span
                          key={key}
                          style={{ color: count ? cfg.ink : '#8A8886' }}
                          className="mr-1"
                        >
                          {count} {cfg.label.toLowerCase()} ·
                        </span>
                      );
                    })}
                    <span
                      style={{
                        color:
                          siswaCounts.belumDiisi > 0
                            ? dicoba
                              ? '#9B0C18'
                              : '#8A5200'
                            : '#2E7D32',
                      }}
                      className="font-semibold"
                    >
                      {siswaCounts.belumDiisi} belum diisi
                    </span>
                  </div>
                </div>

                {/* Scrollable Student Table Body with Sticky Header */}
                <div
                  ref={siswaScrollRef}
                  data-rel-scroll="siswa"
                  className="flex-1 min-h-0 overflow-y-auto"
                >
                  {/* Table Header Siswa (Sticky) */}
                  <div className="sticky top-0 z-10 flex-none h-6 px-3 bg-white border-b border-[#EDEBE9] flex items-center text-[10.5px] tracking-wider text-[#5C5A58] uppercase select-none">
                    <div className="w-6 flex-none">#</div>
                    <div className="flex-1 min-w-0">NAMA</div>
                    <div className="w-17.5 flex-none text-left">JENJANG</div>
                    <div className="w-53 flex-none">
                      KEHADIRAN <span className="text-(--color-danger)">*</span>
                    </div>
                    <div className="w-72.5 flex-none">CATATAN SISWA</div>
                  </div>

                  {kegiatan.siswa.map((sid, idx) => {
                    const sw = siswaMap.get(sid);
                    const isError = Boolean(dicoba && !kehadiran[sid]);
                    const currentStatus = kehadiran[sid] || null;

                    return (
                      <div key={sid} data-rel-row={`siswa:${sid}`}>
                        <div
                          style={{
                            backgroundColor: isError ? '#FDE7E9' : '#FFFFFF',
                            boxShadow: isError ? 'inset 3px 0 0 #C50F1F' : 'none',
                          }}
                          className="h-8.5 px-3 border-b border-[#EDEBE9] flex items-center text-[12.5px] transition-colors"
                        >
                          {/* Row Number */}
                          <div
                            style={{ color: isError ? '#9B0C18' : '#5C5A58' }}
                            className="w-6 flex-none font-mono text-[11px]"
                          >
                            {idx + 1}
                          </div>

                          {/* Student Name */}
                          <div
                            className={cn(
                              'flex-1 min-w-0 truncate',
                              sw?.aktif === false ? 'text-[#5C5A58]' : 'text-[#242424]'
                            )}
                          >
                            {sw?.nama || sid}
                            {sw?.aktif === false && ' · nonaktif'}
                          </div>

                          {/* Jenjang */}
                          <div className="w-17.5 flex-none text-[#424242]">
                            {sw?.jenjang || '—'}
                          </div>

                          {/* Segmented Buttons for Presence */}
                          <div className="w-53 flex-none">
                            <KehadiranSegmentedControl
                              value={currentStatus}
                              onChange={(val) => handleToggleKehadiranSiswa(sid, val)}
                              error={isError}
                            />
                          </div>

                          {/* Catatan Siswa */}
                          <input
                            type="text"
                            value={catatanSiswa[sid] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCatatanSiswa((prev) => ({ ...prev, [sid]: val }));
                              setIsDirty(true);
                            }}
                            placeholder="catatan singkat"
                            className="w-72.5 flex-none h-6.5 px-2 rounded border border-[#EDEBE9] hover:border-[#8A8886] focus:border-(--color-brand) bg-white text-xs outline-none transition-colors"
                          />
                        </div>

                        {/* Error banner below invalid row */}
                        {isError && (
                          <div className="flex items-center gap-1.25 px-3 py-1 pl-9 border-b border-[#EDEBE9] bg-[#FDE7E9] text-[11px] leading-tight text-(--color-danger-ink)">
                            <Warning12Regular className="w-3.5 h-3.5 flex-none" />
                            <span>Pilih status kehadiran untuk {sw?.nama || sid}.</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Tanpa Siswa Notice */
              <div className="flex-none p-3 bg-(--color-surface-alt) text-[12.5px] leading-relaxed text-[#5C5A58]">
                Kegiatan ini tanpa siswa.
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (310px fixed width) */}
        <div className="w-77.5 flex-none border-l border-(--color-border) bg-(--color-surface-alt) p-3.5 flex flex-col gap-3 overflow-y-auto select-none">
          {/* Catatan Kegiatan */}
          <div className="flex-none text-[10.5px] tracking-wider text-[#5C5A58] uppercase font-medium">
            CATATAN KEGIATAN
          </div>
          <textarea
            value={catatan}
            onChange={(e) => {
              setCatatan(e.target.value);
              setIsDirty(true);
            }}
            rows={5}
            placeholder="Apa yang benar-benar terjadi di sesi ini"
            className="flex-none h-26 rounded border border-(--color-border-strong) hover:border-[#8A8886] focus:border-(--color-brand) bg-white p-2.5 text-[12.5px] leading-relaxed resize-y outline-none transition-colors"
          />
          <div className="flex-none text-[11.5px] text-[#5C5A58] leading-tight -mt-1">
            Muncul di detail kegiatan dan rekap matriks.
          </div>

          {/* Tindak Lanjut (Follow-up) Section */}
          {pakaiMateri && (ketuntasan === 'sebagian' || ketuntasan === 'tidak') && (
            <div className="flex-none flex flex-col gap-2 mt-1">
              <div className="text-[10.5px] tracking-wider text-[#5C5A58] uppercase font-medium mt-1">
                TINDAK LANJUT
              </div>
              <label className="flex items-start gap-1.75 text-[12.5px] text-[#424242] cursor-pointer">
                <input
                  type="checkbox"
                  checked={lanjutan}
                  onChange={(e) => {
                    setLanjutan(e.target.checked);
                    setIsDirty(true);
                  }}
                  className="w-3.25 h-3.25 flex-none mt-0.5 rounded accent-(--color-brand) cursor-pointer"
                />
                <span className="leading-snug">
                  Buat kegiatan lanjutan untuk materi yang belum tuntas
                </span>
              </label>
              {lanjutan && (
                <div className="border border-(--color-border) rounded-md bg-white p-2.5 text-xs leading-relaxed text-[#424242]">
                  Setelah disimpan, form kegiatan baru terbuka dengan materi, subjek, dan siswa yang sama — tinggal pilih tanggal.
                </div>
              )}
            </div>
          )}

          <div className="flex-1 min-h-3" />

          {/* Status Box at bottom */}
          <div
            style={{
              borderColor: statusBoxBrd,
              backgroundColor: statusBoxBg,
              color: statusBoxInk,
            }}
            className="flex-none border rounded-md p-2.5 text-xs leading-normal flex gap-2"
          >
            <span className="flex-none flex items-center mt-0.5">
              {statusBoxGlyph === '✓' ? (
                <Checkmark16Regular className="w-4 h-4 text-[#2E7D32]" />
              ) : (
                <Warning16Regular className="w-4 h-4 text-[#8A5200]" />
              )}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{statusBoxTitle}</div>
              <div className="mt-0.5 leading-relaxed">{statusBoxTeks}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog on Discard Unsaved Changes */}
      <ConfirmDialog
        open={confirmDiscardOpen}
        onOpenChange={setConfirmDiscardOpen}
        title="Tinggalkan halaman realisasi?"
        consequence="Perubahan yang belum disimpan akan hilang."
        cancelLabel="Lanjut mengedit"
        confirmLabel="Tinggalkan"
        confirmVariant="danger"
        onConfirm={() => {
          setConfirmDiscardOpen(false);
          setIsDirty(false);
          navigate(breadcrumbPath);
        }}
      />
    </div>
  );
};
