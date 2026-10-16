import * as React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft16Regular,
  Warning16Regular,
  Clock16Regular,
  ArrowSync16Regular,
} from '@fluentui/react-icons';
import { KegiatanBadge, KehadiranBadge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  useKegiatanDetail,
  useKegiatanDaftar,
  useSubjekList,
  useSiswaList,
  useKelasList,
  useRuanganList,
  useTempatList,
  useJenisKegiatanList,
  useMapelList,
  useAllMateriList,
} from '@/data/hooks';
import { FormKegiatanPanel } from '@/components/kegiatan/FormKegiatanPanel';
import { BatalkanKegiatanModal } from '@/components/kegiatan/BatalkanKegiatanModal';
import { JadwalUlangModal } from '@/components/kegiatan/JadwalUlangModal';
import { DetailKegiatanSkeleton } from '@/components/skeleton';
import {
  formatTanggalRingkas,
  formatTanggalPendek,
  menit,
} from '@/lib/dateUtils';
import type { StatusKegiatan, Kegiatan } from '@/data/types';
import { cn } from '@/lib/utils';

const FROM_MAP: Record<string, { title: string; path: string }> = {
  kalender: { title: 'Kalender', path: '/kalender' },
  daftar: { title: 'Kegiatan', path: '/kegiatan' },
  kegiatan: { title: 'Kegiatan', path: '/kegiatan' },
  matriks: { title: 'Matriks belajar', path: '/matriks' },
  siswa: { title: 'Siswa', path: '/master/siswa' },
  subjek: { title: 'Subjek', path: '/master/subjek' },
};

export const DetailKegiatanScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [formEditOpen, setFormEditOpen] = React.useState(false);
  const [modalBatalOpen, setModalBatalOpen] = React.useState(false);
  const [modalUlangState, setModalUlangState] = React.useState<{ open: boolean; dariBatal?: boolean }>({
    open: false,
    dariBatal: false,
  });
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Source & Breadcrumb
  const sourceKey = location.state?.from as string | undefined;
  const mappedSource = sourceKey && FROM_MAP[sourceKey] ? FROM_MAP[sourceKey] : null;
  const breadcrumbAsal = location.state?.fromTitle || mappedSource?.title || 'Kalender';
  const breadcrumbPath = location.state?.fromPath || mappedSource?.path || '/kalender';

  // Queries
  const { data: kegiatan, isLoading, isError } = useKegiatanDetail(id || '');
  const { data: semuaKegiatan = [] } = useKegiatanDaftar();
  const { data: subjekList = [] } = useSubjekList();
  const { data: siswaList = [] } = useSiswaList();
  const { data: kelasList = [] } = useKelasList();
  const { data: ruanganList = [] } = useRuanganList();
  const { data: tempatList = [] } = useTempatList();
  const { data: jenisList = [] } = useJenisKegiatanList();
  const { data: mapelList = [] } = useMapelList();
  const { data: materiList = [] } = useAllMateriList();

  // Master Data Lookups
  const subjekMap = React.useMemo(() => new Map(subjekList.map((s) => [s.id, s])), [subjekList]);
  const siswaMap = React.useMemo(() => new Map(siswaList.map((s) => [s.id, s])), [siswaList]);
  const kelasMap = React.useMemo(() => new Map(kelasList.map((k) => [k.id, k])), [kelasList]);
  const ruanganMap = React.useMemo(() => new Map(ruanganList.map((r) => [r.id, r])), [ruanganList]);
  const tempatMap = React.useMemo(() => new Map(tempatList.map((t) => [t.id, t])), [tempatList]);
  const jenisMap = React.useMemo(() => new Map(jenisList.map((j) => [j.id, j])), [jenisList]);
  const mapelMap = React.useMemo(() => new Map(mapelList.map((m) => [m.id, m])), [mapelList]);
  const materiMap = React.useMemo(() => new Map(materiList.map((m) => [m.id, m])), [materiList]);

  // Click outside to close dropdown menu
  React.useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Handle Back Navigation
  const handleKembali = React.useCallback(() => {
    if (location.state?.fromPath) {
      navigate(location.state.fromPath);
    } else if (mappedSource?.path) {
      navigate(mappedSource.path);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/kalender');
    }
  }, [location.state?.fromPath, mappedSource?.path, navigate]);

  // Keyboard shortcut Esc
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (menuOpen) {
          e.preventDefault();
          setMenuOpen(false);
        } else if (!formEditOpen && !modalBatalOpen && !modalUlangState.open) {
          e.preventDefault();
          handleKembali();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen, formEditOpen, modalBatalOpen, modalUlangState.open, handleKembali]);

  if (isLoading) {
    return <DetailKegiatanSkeleton />;
  }

  if (isError || !kegiatan) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-(--color-surface-sunken) p-6 gap-3">
        <div className="text-[15px] font-semibold text-(--color-text)">
          Kegiatan tidak ditemukan
        </div>
        <p className="text-[13px] text-(--color-text-secondary)">
          Kegiatan dengan ID ini tidak ada atau telah dihapus.
        </p>
        <button
          type="button"
          onClick={() => navigate('/kalender')}
          className="mt-2 h-7 px-3.5 rounded text-xs font-semibold bg-(--color-brand) text-white hover:bg-(--color-brand-pressed) cursor-pointer"
        >
          Kembali ke Kalender
        </button>
      </div>
    );
  }

  const bolehUbah = kegiatan.status === 'terjadwal' || kegiatan.status === 'belum_direalisasi';
  const bolehRealisasi = Boolean(kegiatan.aksiDiizinkan?.includes('isi_realisasi'));
  const isDibatalkan = kegiatan.status === 'dibatalkan';
  const isMasaMendatang = kegiatan.status === 'terjadwal' && !bolehRealisasi;

  const alasanTeks = (o?: { alasan?: string; keterangan?: string } | null) => {
    if (!o) return 'Tanpa alasan tercatat';
    return (o.alasan ? o.alasan : 'Tanpa alasan tercatat') + (o.keterangan ? ' — ' + o.keterangan : '');
  };

  // Rencana details
  const ru = kegiatan.ruangan ? ruanganMap.get(kegiatan.ruangan) : null;
  const tp = ru ? tempatMap.get(ru.tempat) : null;
  const tempatStr = kegiatan.tempatCustom || (ru ? `${tp?.nama || ''} · ${ru.nama}` : 'Tanpa tempat');

  const jn = kegiatan.jenis ? jenisMap.get(kegiatan.jenis) : null;
  const jenisStr = jn ? jn.nama : '—';

  const mp = kegiatan.mapel ? mapelMap.get(kegiatan.mapel) : null;
  const mt = kegiatan.materi ? materiMap.get(kegiatan.materi) : null;
  const materiStr = mt ? `${mp?.nama || ''} › ${mt.nama}` : '—';

  const kl = kegiatan.kelas ? kelasMap.get(kegiatan.kelas) : null;
  const kelasStr = kl ? kl.nama : '—';

  const subjekStr = kegiatan.subjek.length
    ? kegiatan.subjek
        .map((x) => {
          const nm = x.nama || subjekMap.get(x.id)?.nama || x.id;
          const hasPeran = x.peran && x.peran !== 'Tanpa peran';
          return `${nm}${hasPeran ? ` (${x.peran})` : ''}`;
        })
        .join(', ')
    : '—';

  // Realisasi details
  const re = kegiatan.realisasi;
  let telat = 0;
  let telatStr = '';
  let hitungHadir = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
  let realisasiMateriStr = '—';
  let ketuntasanLabel = '—';

  if (re) {
    telat = menit(re.mulai) - menit(kegiatan.mulai);
    telatStr =
      telat > 0
        ? `  (mulai telat ${telat} mnt)`
        : telat < 0
          ? `  (mulai lebih awal ${-telat} mnt)`
          : '  (sesuai rencana)';

    Object.keys(re.kehadiran || {}).forEach((k) => {
      const st = re.kehadiran[k];
      if (st && hitungHadir[st] !== undefined) hitungHadir[st]++;
    });

    if (re.materi) {
      const reMt = materiMap.get(re.materi);
      const reMp = reMt ? mapelMap.get(reMt.mapel) : null;
      const kesesuaian = re.materi === kegiatan.materi ? ' (sesuai rencana)' : ' (berbeda dari rencana)';
      realisasiMateriStr = `${reMp?.nama || ''} › ${reMt?.nama || ''}${kesesuaian}`;
    }

    if (re.ketuntasan === 'tuntas') ketuntasanLabel = 'Tuntas';
    else if (re.ketuntasan === 'sebagian') ketuntasanLabel = 'Tuntas sebagian';
    else if (re.ketuntasan === 'tidak') ketuntasanLabel = 'Tidak';
  }

  // Peserta list
  const pesertaList = kegiatan.siswa.map((sid) => {
    const sw = siswaMap.get(sid);
    const kh = re && re.kehadiran && re.kehadiran[sid] ? re.kehadiran[sid] : null;
    return {
      id: sid,
      nama: (sw?.nama || sid) + (sw?.aktif === false ? ' · nonaktif' : ''),
      jenjang: sw?.jenjang || '—',
      aktif: sw?.aktif !== false,
      kehadiranStatus: kh,
      catatan: (re && re.catatanSiswa && re.catatanSiswa[sid]) ? re.catatanSiswa[sid] : '—',
    };
  });

  // Timeline Riwayat
  const riwayat: Array<{
    judul: string;
    waktu: string;
    adaKet: boolean;
    ket: string;
    dotBg: string;
    dotBrd: string;
  }> = [];

  if (re) {
    riwayat.push({
      judul: 'Realisasi diisi',
      waktu: `${re.diisiPada} · ${re.diisiOleh}`,
      adaKet: false,
      ket: '',
      dotBg: '#4CAF50',
      dotBrd: '#2E7D32',
    });
  }
  if (kegiatan.pembatalan) {
    riwayat.push({
      judul: 'Kegiatan dibatalkan',
      waktu: kegiatan.pembatalan.pada,
      adaKet: true,
      ket: alasanTeks(kegiatan.pembatalan),
      dotBg: '#FDE7E9',
      dotBrd: '#C50F1F',
    });
  }
  if (kegiatan.penjadwalanUlang) {
    riwayat.push({
      judul: 'Kegiatan dijadwalkan ulang',
      waktu: kegiatan.penjadwalanUlang.pada,
      adaKet: true,
      ket: alasanTeks(kegiatan.penjadwalanUlang),
      dotBg: '#F3EFFA',
      dotBrd: '#8764B8',
    });
  }
  if (kegiatan.jadwalUlangDari) {
    const src = semuaKegiatan.find((x) => x.id === kegiatan.jadwalUlangDari);
    riwayat.push({
      judul: 'Dibuat dari penjadwalan ulang',
      waktu: src ? `${formatTanggalRingkas(src.tanggal)} · ${src.mulai}` : 'waktu tidak tercatat',
      adaKet: Boolean(src),
      ket: src ? `Pindahan dari "${src.nama}".` : '',
      dotBg: '#EBF3FC',
      dotBrd: '#0F6CBD',
    });
  }
  riwayat.push({
    judul: 'Kegiatan dibuat',
    waktu: 'waktu pembuatan tidak tercatat di data contoh',
    adaKet: false,
    ket: '',
    dotBg: '#FFFFFF',
    dotBrd: '#C8C6C4',
  });

  // Kegiatan Terkait
  const terkait: Array<{
    id: string;
    nama: string;
    waktu: string;
    status: StatusKegiatan;
  }> = [];

  const tambahTerkait = (target?: Kegiatan | null) => {
    if (!target || terkait.some((t) => t.id === target.id)) return;
    const namaTerkait = target.materi
      ? `${mapelMap.get(target.mapel || '')?.nama || ''} · ${materiMap.get(target.materi)?.nama || ''}`
      : target.nama;

    terkait.push({
      id: target.id,
      nama: namaTerkait,
      waktu: `${formatTanggalPendek(target.tanggal)} · ${target.mulai}`,
      status: target.status,
    });
  };

  if (kegiatan.jadwalUlangKe) {
    tambahTerkait(semuaKegiatan.find((x) => x.id === kegiatan.jadwalUlangKe));
  }
  if (kegiatan.jadwalUlangDari) {
    tambahTerkait(semuaKegiatan.find((x) => x.id === kegiatan.jadwalUlangDari));
  }

  if (kegiatan.seriId) {
    semuaKegiatan
      .filter((x) => x.id !== kegiatan.id && x.seriId === kegiatan.seriId)
      .sort((a, b) => (a.tanggal < b.tanggal ? -1 : 1))
      .slice(0, 4)
      .forEach((k) => tambahTerkait(k));
  }

  semuaKegiatan
    .filter(
      (x) =>
        x.id !== kegiatan.id &&
        x.mapel &&
        x.mapel === kegiatan.mapel &&
        x.kelas === kegiatan.kelas
    )
    .sort((a, b) => (a.tanggal < b.tanggal ? -1 : 1))
    .slice(0, 3)
    .forEach((k) => tambahTerkait(k));

  // Action button click handlers
  const handleUtamaClick = () => {
    if (bolehUbah) {
      setFormEditOpen(true);
    } else if (kegiatan.status === 'terealisasi') {
      navigate(`/kegiatan/${kegiatan.id}/realisasi`, {
        state: { fromTitle: 'Kegiatan', fromPath: `/kegiatan/${kegiatan.id}` },
      });
    }
  };

  const handleIsiRealisasi = () => {
    if (!bolehRealisasi) return;
    navigate(`/kegiatan/${kegiatan.id}/realisasi`, {
      state: { fromTitle: 'Kegiatan', fromPath: `/kegiatan/${kegiatan.id}` },
    });
  };

  const handleJadwalUlang = () => {
    setMenuOpen(false);
    setModalUlangState({ open: true, dariBatal: false });
  };

  const handleBatalkan = () => {
    setMenuOpen(false);
    setModalBatalOpen(true);
  };

  // Warning text for Realisasi Kosong
  const kosongJudul =
    kegiatan.status === 'dibatalkan'
      ? 'Kegiatan dibatalkan, tidak ada realisasi'
      : kegiatan.status === 'dijadwal_ulang'
        ? 'Kegiatan dijadwalkan ulang, tidak ada realisasi'
        : isMasaMendatang
          ? 'Kegiatan belum berlangsung'
          : 'Realisasi belum diisi';

  const kosongTeks =
    kegiatan.status === 'dibatalkan'
      ? 'Karena dibatalkan, materi kegiatan ini tetap belum tersampaikan di matriks belajar.'
      : kegiatan.status === 'dijadwal_ulang'
        ? 'Realisasi akan diisi pada jadwal barunya, bukan di sini.'
        : isMasaMendatang
          ? 'Realisasi kehadiran dan materi dapat dicatat setelah kegiatan dimulai.'
          : 'Kehadiran dan ketuntasan belum tercatat, jadi materi ini belum masuk matriks belajar.';

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white select-none">
      {/* 1. Header / Top Toolbar (H: 44px) */}
      <div className="h-11 flex-none border-b border-(--color-border) bg-white flex items-center gap-2.5 px-3.5 select-none z-10">
        {/* Back Button (Ghost Icon Button) */}
        <button
          type="button"
          onClick={handleKembali}
          title={`Kembali ke ${breadcrumbAsal} · Esc`}
          className="w-7 h-7 flex-none rounded flex items-center justify-center text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-surface-sunken) active:bg-(--color-surface-alt) cursor-pointer transition-colors"
        >
          <ArrowLeft16Regular className="text-[16px]" />
        </button>

        {/* Activity Name */}
        <div
          className={cn(
            'text-[17px] font-semibold text-(--color-text) whitespace-nowrap overflow-hidden text-ellipsis max-w-120',
            isDibatalkan && 'line-through text-(--color-text-muted)'
          )}
          title={kegiatan.nama}
        >
          {kegiatan.nama}
        </div>

        {/* Activity Status Badge Pill */}
        <KegiatanBadge status={kegiatan.status} />

        {kegiatan.seriId && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11.5px] font-medium bg-(--color-surface-alt) text-(--color-text-secondary) border border-(--color-border)">
            <ArrowSync16Regular className="w-3.5 h-3.5 text-(--color-brand)" />
            Pertemuan {kegiatan.urutanSeri ?? 1} dari {kegiatan.totalSeri ?? '?'}
          </span>
        )}

        <div className="flex-1" />

        {/* Action: Cetak (disabled) */}
        <button
          type="button"
          disabled
          title="Cetak menyusul di tahap berikutnya"
          className="flex-none h-6.5 px-2.75 rounded border border-(--color-border) bg-(--color-surface-sunken) text-(--color-text-muted) text-xs cursor-not-allowed"
        >
          Cetak
        </button>

        {/* Action: Tombol Utama */}
        {bolehUbah ? (
          <button
            type="button"
            onClick={handleUtamaClick}
            className="flex-none h-6.5 px-3 rounded text-xs font-semibold bg-(--color-brand) text-white hover:bg-(--color-brand-pressed) active:translate-y-px transition-all cursor-pointer whitespace-nowrap"
          >
            Ubah kegiatan
          </button>
        ) : kegiatan.status === 'terealisasi' ? (
          <button
            type="button"
            onClick={handleUtamaClick}
            className="flex-none h-6.5 px-3 rounded text-xs font-semibold bg-(--color-brand) text-white hover:bg-(--color-brand-pressed) active:translate-y-px transition-all cursor-pointer whitespace-nowrap"
          >
            Ubah realisasi
          </button>
        ) : (
          <button
            type="button"
            disabled
            title="Kegiatan ini hanya bisa dibaca"
            className="flex-none h-6.5 px-3 rounded text-xs font-semibold bg-[#EDEBE9] text-[#8A8886] cursor-not-allowed whitespace-nowrap"
          >
            Ubah kegiatan
          </button>
        )}

        {/* Action: Menu ··· (if editable) */}
        {bolehUbah && (
          <div ref={menuRef} className="relative flex-none">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              title="Aksi lain"
              className="w-7 h-6.5 rounded border border-(--color-border-strong) bg-white text-(--color-text) hover:bg-(--color-surface-sunken) flex items-center justify-center cursor-pointer text-[13px] font-bold transition-colors"
            >
              ···
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-7.5 z-30 min-w-49 bg-white border border-(--color-border-strong) rounded-md shadow-(--shadow-overlay) p-0.75 flex flex-col gap-px animate-in fade-in-0 zoom-in-95 duration-(--dur-fast)">
                <button
                  type="button"
                  onClick={handleJadwalUlang}
                  className="text-left h-7 px-2 rounded text-[12.5px] bg-transparent text-(--color-text) hover:bg-(--color-brand-subtle) cursor-pointer transition-colors"
                >
                  Jadwalkan ulang
                </button>
                <button
                  type="button"
                  onClick={handleBatalkan}
                  className="text-left h-7 px-2 rounded text-[12.5px] bg-transparent text-[#9B0C18] hover:bg-[#FDF3F4] cursor-pointer transition-colors"
                >
                  Batalkan kegiatan
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Main Content Frame (Left Panel + Right Sidebar) */}
      <div className="flex-1 min-h-0 flex bg-(--color-surface-alt)">
        {/* Left Scrollable Area */}
        <div className="flex-1 min-w-0 overflow-y-auto p-3 flex flex-col gap-3">
          {/* Kartu 1: RENCANA */}
          <div className="rounded-lg border border-(--color-border) bg-white overflow-hidden shadow-xs">
            <div className="h-6.5 px-3 bg-(--color-surface-alt) border-b border-(--color-border-subtle) flex items-center text-[10.5px] font-semibold tracking-wider text-(--color-text-secondary) uppercase">
              RENCANA
            </div>
            <div className="p-3 flex gap-4">
              {/* Kolom Kiri */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                  <span className="w-15.5 flex-none text-(--color-text-secondary)">Mulai</span>
                  <span className="flex-1 min-w-0 font-mono text-(--color-text)">
                    {formatTanggalRingkas(kegiatan.tanggal)}{kegiatan.sepanjangHari ? ' (Sepanjang hari)' : `, ${kegiatan.mulai}`}
                  </span>
                </div>
                <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                  <span className="w-15.5 flex-none text-(--color-text-secondary)">Selesai</span>
                  <span className="flex-1 min-w-0 font-mono text-(--color-text)">
                    {formatTanggalRingkas(kegiatan.tanggalSelesai || kegiatan.tanggal)}{kegiatan.sepanjangHari ? ' (Sepanjang hari)' : `, ${kegiatan.selesai}`}
                  </span>
                </div>
                <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                  <span className="w-15.5 flex-none text-(--color-text-secondary)">Tempat</span>
                  <span className="flex-1 min-w-0 text-(--color-text)">{tempatStr}</span>
                </div>
                <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                  <span className="w-15.5 flex-none text-(--color-text-secondary)">Subjek</span>
                  <span className="flex-1 min-w-0 text-(--color-text)">{subjekStr}</span>
                </div>
                <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                  <span className="w-15.5 flex-none text-(--color-text-secondary)">Catatan</span>
                  <span className="flex-1 min-w-0 text-(--color-text)">{kegiatan.catatan || '—'}</span>
                </div>
                {kegiatan.seriId && (
                  <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                    <span className="w-15.5 flex-none text-(--color-text-secondary)">Pengulangan</span>
                    <span className="flex-1 min-w-0 text-(--color-text) flex items-center gap-1.5">
                      <ArrowSync16Regular className="w-3.5 h-3.5 text-(--color-brand)" />
                      Pertemuan {kegiatan.urutanSeri ?? 1} dari {kegiatan.totalSeri ?? '?'}
                    </span>
                  </div>
                )}
              </div>

              {/* Kolom Kanan */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                  <span className="w-15.5 flex-none text-(--color-text-secondary)">Jenis</span>
                  <span className="flex-1 min-w-0 text-(--color-text)">{jenisStr}</span>
                </div>
                <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                  <span className="w-15.5 flex-none text-(--color-text-secondary)">Materi</span>
                  <span className="flex-1 min-w-0 text-(--color-text)">{materiStr}</span>
                </div>
                <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                  <span className="w-15.5 flex-none text-(--color-text-secondary)">Kelas</span>
                  <span className="flex-1 min-w-0 text-(--color-text)">{kelasStr}</span>
                </div>
                {kegiatan.pembatalan && (
                  <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                    <span className="w-15.5 flex-none text-(--color-text-secondary)">Dibatalkan</span>
                    <span className="flex-1 min-w-0 text-(--color-text)">
                      {alasanTeks(kegiatan.pembatalan)}
                    </span>
                  </div>
                )}
                {kegiatan.penjadwalanUlang && (
                  <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                    <span className="w-15.5 flex-none text-(--color-text-secondary)">Alasan</span>
                    <span className="flex-1 min-w-0 text-(--color-text)">
                      {alasanTeks(kegiatan.penjadwalanUlang)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Kartu 2: REALISASI (Ada vs Kosong) */}
          {re ? (
            <div className="rounded-lg border border-[#4CAF50] bg-[#F6FBF7] overflow-hidden shadow-xs">
              <div className="h-6.5 px-3 bg-[#E8F5E9] border-b border-[#CDE8CF] flex items-center justify-between text-[10.5px] font-semibold tracking-wider text-[#2E7D32]">
                <span>REALISASI</span>
                <span className="text-[11px] font-normal tracking-normal text-[#2E7D32]">
                  diisi {re.diisiOleh} · {re.diisiPada}
                </span>
              </div>
              <div className="p-3 flex gap-4">
                {/* Kolom Kiri */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                    <span className="w-15.5 flex-none text-(--color-text-secondary)">Jam aktual</span>
                    <span className="flex-1 min-w-0 font-mono text-(--color-text)">
                      {re.mulai}–{re.selesai}
                      <span className="text-(--color-text-secondary) font-sans">{telatStr}</span>
                    </span>
                  </div>
                  <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                    <span className="w-15.5 flex-none text-(--color-text-secondary)">Materi</span>
                    <span className="flex-1 min-w-0 text-(--color-text)">{realisasiMateriStr}</span>
                  </div>
                  <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                    <span className="w-15.5 flex-none text-(--color-text-secondary)">Catatan</span>
                    <span className="flex-1 min-w-0 text-(--color-text)">{re.catatan || '—'}</span>
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                    <span className="w-15.5 flex-none text-(--color-text-secondary)">Kehadiran</span>
                    <span className="flex-1 min-w-0 text-(--color-text)">
                      {kegiatan.siswa.length
                        ? `${hitungHadir.hadir} hadir · ${hitungHadir.izin} izin · ${hitungHadir.sakit} sakit · ${hitungHadir.alpa} alpa`
                        : 'Tanpa siswa'}
                    </span>
                  </div>
                  <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                    <span className="w-15.5 flex-none text-(--color-text-secondary)">Ketuntasan</span>
                    <span className="flex-1 min-w-0 text-(--color-text)">{ketuntasanLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'rounded-lg p-3 flex gap-2.5 items-start',
                isMasaMendatang
                  ? 'border border-(--color-border) bg-(--color-surface-alt)'
                  : 'border border-[#F0A82E] bg-[#FFF3E0]'
              )}
            >
              {isMasaMendatang ? (
                <Clock16Regular className="text-(--color-text-muted) w-4 h-4 flex-none mt-0.5" />
              ) : (
                <Warning16Regular className="text-[#8A5200] w-4 h-4 flex-none mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    'text-[13px] font-semibold',
                    isMasaMendatang ? 'text-(--color-text)' : 'text-[#8A5200]'
                  )}
                >
                  {kosongJudul}
                </div>
                <div
                  className={cn(
                    'text-[12.5px] leading-relaxed mt-0.75',
                    isMasaMendatang ? 'text-(--color-text-secondary)' : 'text-[#8A5200]'
                  )}
                >
                  {kosongTeks}
                </div>
                <div className="mt-2 flex gap-1.5">
                  {bolehRealisasi && (
                    <button
                      type="button"
                      onClick={handleIsiRealisasi}
                      title="Catat kehadiran dan hasil sesi ini"
                      className="h-6.5 px-2.75 rounded text-xs font-semibold bg-(--color-brand) text-white hover:bg-(--color-brand-pressed) active:translate-y-px cursor-pointer whitespace-nowrap"
                    >
                      Isi realisasi
                    </button>
                  )}
                  {bolehUbah && (
                    <button
                      type="button"
                      onClick={() => setFormEditOpen(true)}
                      className={cn(
                        'h-6.5 px-2.75 rounded text-xs font-normal transition-all cursor-pointer whitespace-nowrap active:translate-y-px',
                        isMasaMendatang
                          ? 'border border-(--color-border-strong) bg-white text-(--color-text) hover:bg-(--color-surface-sunken)'
                          : 'border border-[#8A5200] bg-white text-[#8A5200] hover:bg-[#FFF8EE]'
                      )}
                    >
                      Ubah kegiatan
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Kartu 3: PESERTA */}
          <div className="rounded-lg border border-(--color-border) bg-white overflow-hidden shadow-xs">
            <div className="h-6.5 px-3 bg-(--color-surface-alt) border-b border-(--color-border-subtle) flex items-center justify-between text-[10.5px] font-semibold tracking-wider text-(--color-text-secondary)">
              <span>PESERTA · {pesertaList.length ? `${pesertaList.length} SISWA` : 'TANPA SISWA'}</span>
              <span className="text-[11px] font-normal tracking-normal text-(--color-text-secondary)">
                {re ? 'kehadiran & catatan per siswa' : 'kehadiran belum diisi'}
              </span>
            </div>

            {pesertaList.length > 0 ? (
              <div className="max-h-72 overflow-y-auto">
                {/* Table Header (Sticky so it stays visible and aligns with body scrollbar) */}
                <div className="sticky top-0 z-10 flex items-center h-6 px-3 border-b border-(--color-border-subtle) bg-white text-[11px] font-semibold tracking-wider text-(--color-text-secondary) uppercase select-none">
                  <span className="flex-1 min-w-0">NAMA</span>
                  <span className="w-16 flex-none">JENJANG</span>
                  <span className="w-23 flex-none">KEHADIRAN</span>
                  <span className="w-58 flex-none">CATATAN</span>
                </div>

                {/* Table Body */}
                {pesertaList.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center h-8 px-3 border-b border-(--color-border-subtle) last:border-b-0 text-[12.5px] hover:bg-(--color-surface-alt) transition-colors"
                  >
                    <span
                      className={cn(
                        'flex-1 min-w-0 truncate',
                        p.aktif ? 'text-(--color-text)' : 'text-(--color-text-secondary)'
                      )}
                      title={p.nama}
                    >
                      {p.nama}
                    </span>
                    <span className="w-16 flex-none text-[#424242]">{p.jenjang}</span>
                    <span className="w-23 flex-none">
                      {p.kehadiranStatus ? (
                        <KehadiranBadge status={p.kehadiranStatus as any} />
                      ) : (
                        <span className="inline-flex items-center gap-1 h-4.5 px-1.75 rounded-full text-[10.5px] font-semibold border border-(--color-border) bg-(--color-canvas) text-(--color-text-muted)">
                          <span className="opacity-60">·</span>
                          <span>Belum diisi</span>
                        </span>
                      )}
                    </span>
                    <span
                      className="w-58 flex-none text-[#424242] truncate"
                      title={p.catatan}
                    >
                      {p.catatan}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 text-[12.5px] text-(--color-text-secondary) leading-relaxed">
                Kegiatan ini tanpa siswa — rapat dan pelatihan memang begitu. Yang tercatat hanya
                subjek yang hadir.
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (330px) */}
        <div className="w-82.5 flex-none border-l border-(--color-border) bg-white overflow-y-auto p-3 flex flex-col gap-2">
          {/* Section 1: RIWAYAT KEGIATAN */}
          <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-secondary) uppercase mb-1">
            RIWAYAT KEGIATAN
          </div>
          <div className="flex flex-col gap-2.25">
            {riwayat.map((r, i) => (
              <div key={i} className="flex gap-2.25">
                <span
                  style={{
                    backgroundColor: r.dotBg,
                    borderColor: r.dotBrd,
                  }}
                  className="w-2.25 h-2.25 flex-none mt-1 rounded-full border"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold leading-snug text-(--color-text)">
                    {r.judul}
                  </div>
                  <div className="text-[11.5px] text-(--color-text-secondary) font-mono leading-relaxed">
                    {r.waktu}
                  </div>
                  {r.adaKet && (
                    <div className="text-xs text-[#424242] leading-relaxed mt-px">
                      {r.ket}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Section 2: KEGIATAN TERKAIT */}
          <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-secondary) uppercase mt-2.5 mb-1">
            KEGIATAN TERKAIT
          </div>
          {terkait.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {terkait.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    navigate(`/kegiatan/${t.id}`, {
                      state: { fromTitle: breadcrumbAsal, fromPath: breadcrumbPath },
                    })
                  }
                  className="text-left border border-(--color-border) rounded-md bg-white p-2 hover:bg-(--color-surface-alt) hover:border-(--color-border-strong) cursor-pointer flex flex-col gap-0.75 transition-all"
                >
                  <span className="text-[12.5px] font-semibold leading-snug text-(--color-text) line-clamp-1">
                    {t.nama}
                  </span>
                  <span className="text-[11.5px] text-(--color-text-secondary) font-mono">
                    {t.waktu}
                  </span>
                  <KegiatanBadge status={t.status} className="self-start mt-0.5" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-[12.5px] text-(--color-text-secondary) leading-relaxed">
              Belum ada kegiatan lain dengan mata pelajaran dan kelas yang sama.
            </div>
          )}

          {kegiatan.mapel && kegiatan.kelas && (
            <div className="text-[11.5px] text-(--color-text-secondary) leading-relaxed mt-1">
              Daftar lengkap {mapelMap.get(kegiatan.mapel)?.nama || ''} untuk{' '}
              {kelasMap.get(kegiatan.kelas)?.nama || 'kelas ini'} ada di layar Kegiatan.
            </div>
          )}
        </div>
      </div>

      {/* 3. Side Panel: Form Kegiatan (Edit mode triggered from Ubah kegiatan) */}
      {formEditOpen && (
        <FormKegiatanPanel
          open={formEditOpen}
          initialData={{
            mode: 'edit',
            kegiatanId: kegiatan.id,
            nama: kegiatan.nama,
            jenis: kegiatan.jenis,
            tanggal: kegiatan.tanggal,
            tanggalSelesai: kegiatan.tanggalSelesai,
            mulai: kegiatan.mulai,
            selesai: kegiatan.selesai,
            sepanjangHari: Boolean(kegiatan.sepanjangHari),
            ruangan: kegiatan.ruangan || '',
            tempatCustom: kegiatan.tempatCustom || '',
            mapel: kegiatan.mapel || '',
            materi: kegiatan.materi || '',
            subjek: kegiatan.subjek,
            siswa: kegiatan.siswa,
            catatan: kegiatan.catatan || '',
            seriId: kegiatan.seriId,
            urutanSeri: kegiatan.urutanSeri,
            totalSeri: kegiatan.totalSeri,
          }}
          onClose={() => setFormEditOpen(false)}
          onSuccess={(saved) => {
            setFormEditOpen(false);
            showToast({
              message: `Perubahan "${saved.nama}" berhasil disimpan`,
              type: 'success',
            });
          }}
        />
      )}

      {/* A6 Batalkan Kegiatan Modal */}
      {modalBatalOpen && (
        <BatalkanKegiatanModal
          open={modalBatalOpen}
          kegiatan={kegiatan}
          onClose={() => setModalBatalOpen(false)}
          onOpenJadwalUlang={(_kegiatanId, dariBatal) => {
            setModalUlangState({ open: true, dariBatal });
          }}
        />
      )}

      {/* A7 Jadwal Ulang Kegiatan Modal */}
      {modalUlangState.open && (
        <JadwalUlangModal
          open={modalUlangState.open}
          kegiatan={kegiatan}
          dariBatal={modalUlangState.dariBatal}
          onClose={() => setModalUlangState({ open: false, dariBatal: false })}
          onNavigateBaru={(baruId) => {
            navigate(`/kegiatan/${baruId}`, {
              state: { fromTitle: breadcrumbAsal, fromPath: location.state?.fromPath },
            });
          }}
        />
      )}
    </div>
  );
};
