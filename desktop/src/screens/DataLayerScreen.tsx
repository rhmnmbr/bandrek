import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { KegiatanBadge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { useToast } from '@/components/ui/toast';
import {
  useKegiatanKalender,
  usePerluRealisasiCount,
  useMatriks,
  useCekBentrok,
  useSiswaList,
  useSubjekList,
  useRuanganList,
  useMapelList,
  useSimulasi,
} from '@/data/hooks';
import type { ErrorInjectionType } from '@/data/types';
import {
  ArrowLeft16Regular,
  ArrowClockwise16Regular,
  Warning16Regular,
  Checkmark16Regular,
  Flash16Regular,
  TableSimple16Regular,
  Calendar16Regular,
} from '@fluentui/react-icons';

export function DataLayerScreen() {
  const { showToast } = useToast();
  const { config, updateConfig, resetData } = useSimulasi();

  // Queries
  const { data: perluRealisasiCount, isLoading: loadingPerlu } = usePerluRealisasiCount();
  const { data: siswaList, isLoading: loadingSiswa } = useSiswaList({ status: 'semua' });
  const { data: subjekList } = useSubjekList();
  const { data: ruanganList } = useRuanganList();
  const { data: mapelList } = useMapelList();

  // Kalender query around seed today (2026-09-16)
  const [kalenderRange] = React.useState({
    rentangMulai: '2026-09-14',
    rentangSelesai: '2026-09-20',
  });
  const {
    data: kegiatanList,
    isLoading: loadingKegiatan,
    isError: errorKegiatan,
    error: errKegiatanObj,
    refetch: refetchKegiatan,
  } = useKegiatanKalender(kalenderRange);

  // Matriks query
  const [selectedMapel, setSelectedMapel] = React.useState('M1'); // Matematika
  const [selectedJenjang, setSelectedJenjang] = React.useState<'SD' | 'SMP' | 'SMA'>('SD');
  const {
    data: matriksData,
    isLoading: loadingMatriks,
  } = useMatriks(selectedMapel, selectedJenjang);

  // Bentrok checker mutation
  const cekBentrokMutation = useCekBentrok();
  const [bentrokForm, setBentrokForm] = React.useState({
    tanggal: '2026-09-16',
    mulai: '08:00',
    selesai: '09:30',
    ruangan: 'R1',
    subjek: 'U2',
    siswa: 'S1',
  });

  const handleTestBentrok = () => {
    cekBentrokMutation.mutate(
      {
        tanggal: bentrokForm.tanggal,
        mulai: bentrokForm.mulai,
        selesai: bentrokForm.selesai,
        ruangan: bentrokForm.ruangan,
        subjek: [bentrokForm.subjek],
        siswa: [bentrokForm.siswa],
      },
      {
        onSuccess: (res) => {
          if (res.adaBentrok) {
            showToast({
              message: `Bentrok Terdeteksi: ${res.ringkasan}`,
              type: 'warning',
            });
          } else {
            showToast({
              message: 'Jadwal Aman: Tidak ada bentrok ruangan, subjek, maupun siswa.',
              type: 'success',
            });
          }
        },
        onError: (err) => {
          showToast({
            message: `Gagal mengecek bentrok: ${(err as Error).message}`,
            type: 'error',
          });
        },
      }
    );
  };

  const handleResetData = () => {
    resetData();
    showToast({
      message: 'Data mock berhasil direset kembali ke seed awal (80 siswa, 134 kegiatan).',
      type: 'success',
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-(--color-canvas) text-(--color-text) pb-12">
      {/* Offline Banner if simulated offline */}
      {config.offlineBannerVisible && (
        <OfflineBanner
          variant="surface-sunken"
          cachedAt="16 Sep 2026, 11:39"
          onRetry={() => updateConfig({ errorType: 'none' })}
        />
      )}

      {/* Header bar */}
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-(--color-border) bg-(--color-surface) px-6 shadow-(--shadow-raised)">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="compact" className="inline-flex items-center gap-1.5">
              <ArrowLeft16Regular />
              <span>Beranda</span>
            </Button>
          </Link>
          <div className="h-5 w-px bg-(--color-border-subtle)" />
          <div>
            <h1 className="text-[15px] font-semibold text-(--color-text)">
              Phase 3 — Data Layer &amp; Mock Inspection
            </h1>
            <p className="text-[11px] text-(--color-text-muted)">
              Verifikasi Tipe, Interface Repository, Perhitungan Server-Authoritative, &amp; Simulasi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/katalog">
            <Button variant="secondary" size="compact">
              Katalog UI
            </Button>
          </Link>
          <Button
            variant="danger"
            size="compact"
            className="inline-flex items-center gap-1.5"
            onClick={handleResetData}
          >
            <ArrowClockwise16Regular />
            <span>Reset Seed Data</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
        {/* SECTION 1: SIMULASI CONTROLS */}
        <section className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-raised)">
          <div className="flex items-center justify-between border-b border-(--color-border-subtle) pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Flash16Regular className="text-(--color-brand)" />
              <h2 className="text-[14px] font-semibold text-(--color-text)">
                Kontrol Simulasi Server (Latency &amp; Error Injection)
              </h2>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-(--color-border) bg-(--color-surface-alt)">
              Mock Layer (Phase 3)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Latency toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-(--color-text-secondary)">
                Simulasi Latency Jaringan
              </label>
              <div className="flex gap-1.5">
                {[0, 150, 500, 1000].map((ms) => (
                  <Button
                    key={ms}
                    size="compact"
                    variant={config.latencyMs === ms ? 'primary' : 'secondary'}
                    onClick={() => {
                      updateConfig({ latencyMs: ms });
                      showToast({
                        message: `Latency jaringan diatur ke ${ms}ms.`,
                        type: 'info',
                      });
                    }}
                  >
                    {ms === 0 ? '0ms' : `${ms}ms`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Error Injection toggle */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[12px] font-medium text-(--color-text-secondary)">
                Injeksi Error (Error Injection Toggle)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'none', label: 'Normal (Tanpa Error)' },
                    { id: 'offline', label: 'Offline (Koneksi Putus)' },
                    { id: 'unauthorized', label: '401 Unauthorized' },
                    { id: 'concurrency_conflict', label: '409 Conflict' },
                    { id: 'update_required', label: '426 Update Required' },
                  ] as Array<{ id: ErrorInjectionType; label: string }>
                ).map((item) => (
                  <Button
                    key={item.id}
                    size="compact"
                    variant={config.errorType === item.id ? 'primary' : 'secondary'}
                    onClick={() => {
                      updateConfig({ errorType: item.id });
                      refetchKegiatan();
                      showToast({
                        message: `Status injeksi error diatur ke: ${item.label}`,
                        type: item.id === 'none' ? 'info' : 'warning',
                      });
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: LIVE METRICS SUMMARY */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
            <div className="text-[11px] font-medium text-(--color-text-muted)">Total Siswa Terdaftar</div>
            <div className="text-[22px] font-bold text-(--color-text) mt-1">
              {loadingSiswa ? '...' : siswaList?.length ?? 0}
            </div>
            <div className="text-[11px] text-(--color-text-secondary) mt-1">
              Aktif: {siswaList?.filter((s) => s.aktif).length ?? 0} · Nonaktif:{' '}
              {siswaList?.filter((s) => !s.aktif).length ?? 0}
            </div>
          </div>

          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
            <div className="text-[11px] font-medium text-(--color-text-muted)">Perlu Realisasi (Server-computed)</div>
            <div className="text-[22px] font-bold text-(--color-kegiatan-belum-direalisasi-text) mt-1">
              {loadingPerlu ? '...' : perluRealisasiCount ?? 0}
            </div>
            <div className="text-[11px] text-(--color-text-secondary) mt-1">
              Status turunan tanggal lewat tanpa realisasi
            </div>
          </div>

          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
            <div className="text-[11px] font-medium text-(--color-text-muted)">Master Data Terload</div>
            <div className="text-[22px] font-bold text-(--color-text) mt-1">
              {ruanganList?.length ?? 0} Ruangan
            </div>
            <div className="text-[11px] text-(--color-text-secondary) mt-1">
              {subjekList?.length ?? 0} Subjek · {mapelList?.length ?? 0} Mapel
            </div>
          </div>

          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
            <div className="text-[11px] font-medium text-(--color-text-muted)">Simulasi "Hari Ini"</div>
            <div className="text-[18px] font-semibold text-(--color-brand) mt-1">
              {config.simulatedToday}
            </div>
            <div className="text-[11px] text-(--color-text-secondary) mt-1">
              Jam Patokan: {config.simulatedNow} (Rabu)
            </div>
          </div>
        </section>

        {/* SECTION 3: KALENDER DATA & SERVER-COMPUTED STATUS */}
        <section className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-raised)">
          <div className="flex items-center justify-between border-b border-(--color-border-subtle) pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Calendar16Regular className="text-(--color-brand)" />
              <h2 className="text-[14px] font-semibold text-(--color-text)">
                Kegiatan Kalender (Minggu 14–20 Sep 2026) — Status &amp; Aksi Turunan Server
              </h2>
            </div>
            <Button
              size="compact"
              variant="secondary"
              className="inline-flex items-center gap-1.5"
              onClick={() => refetchKegiatan()}
            >
              <ArrowClockwise16Regular />
              <span>Refresh</span>
            </Button>
          </div>

          {errorKegiatan ? (
            <div className="rounded-lg border border-(--color-danger-border) bg-(--color-danger-subtle) p-4 text-(--color-danger-text) text-[13px]">
              <div className="font-semibold flex items-center gap-1.5">
                <Warning16Regular /> Terjadi Error Simulasi:
              </div>
              <div className="mt-1">{(errKegiatanObj as Error)?.message}</div>
            </div>
          ) : loadingKegiatan ? (
            <div className="py-8 text-center text-(--color-text-muted) text-[13px]">
              Memuat data kegiatan melalui useKegiatanKalender...
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Nama Kegiatan</TableHead>
                    <TableHead>Ruangan &amp; Tempat</TableHead>
                    <TableHead>Pengisi</TableHead>
                    <TableHead>Peserta</TableHead>
                    <TableHead>Status Turunan</TableHead>
                    <TableHead>Aksi yang Diizinkan (Server-owned)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kegiatanList?.slice(0, 10).map((k) => (
                    <TableRow key={k.id}>
                      <TableCell className="whitespace-nowrap font-mono text-[12px]">
                        {k.tanggal} {k.mulai}–{k.selesai}
                      </TableCell>
                      <TableCell className="font-medium text-(--color-text)">
                        {k.nama}
                      </TableCell>
                      <TableCell className="text-(--color-text-secondary) text-[12px]">
                        {k.namaRuangan} ({k.namaTempat})
                      </TableCell>
                      <TableCell className="text-[12px]">
                        {k.pengisiUtama?.nama || '-'}
                      </TableCell>
                      <TableCell className="text-[12px]">
                        {k.jumlahSiswa} siswa
                      </TableCell>
                      <TableCell>
                        <KegiatanBadge status={k.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {k.aksiDiizinkan.map((aksi) => (
                            <span
                              key={aksi}
                              className="rounded px-1.5 py-0.5 text-[10px] font-mono bg-(--color-surface-alt) border border-(--color-border-subtle) text-(--color-text-secondary)"
                            >
                              {aksi}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-2 text-right text-[11px] text-(--color-text-muted)">
                Menampilkan 10 dari {kegiatanList?.length ?? 0} kegiatan di minggu ini
              </div>
            </div>
          )}
        </section>

        {/* SECTION 4: SERVER-COMPUTED SCHEDULE CONFLICTS */}
        <section className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-raised)">
          <div className="flex items-center justify-between border-b border-(--color-border-subtle) pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Warning16Regular className="text-(--color-warning-icon)" />
              <h2 className="text-[14px] font-semibold text-(--color-text)">
                Deteksi Bentrok Jadwal Real-time (useCekBentrok)
              </h2>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-(--color-border) bg-(--color-surface-alt)">
              Aturan Bisnis Server
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
            <div>
              <label className="text-[11px] font-medium text-(--color-text-muted)">Tanggal</label>
              <input
                className="w-full h-8 px-2 text-[12px] rounded border border-(--color-border) bg-(--color-surface)"
                value={bentrokForm.tanggal}
                onChange={(e) => setBentrokForm({ ...bentrokForm, tanggal: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-(--color-text-muted)">Jam Mulai</label>
              <input
                className="w-full h-8 px-2 text-[12px] rounded border border-(--color-border) bg-(--color-surface)"
                value={bentrokForm.mulai}
                onChange={(e) => setBentrokForm({ ...bentrokForm, mulai: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-(--color-text-muted)">Jam Selesai</label>
              <input
                className="w-full h-8 px-2 text-[12px] rounded border border-(--color-border) bg-(--color-surface)"
                value={bentrokForm.selesai}
                onChange={(e) => setBentrokForm({ ...bentrokForm, selesai: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-(--color-text-muted)">Ruangan</label>
              <Select
                value={bentrokForm.ruangan}
                onValueChange={(val: string) => setBentrokForm({ ...bentrokForm, ruangan: val })}
                options={ruanganList?.map((r) => ({ value: r.id, label: r.nama })) || []}
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-(--color-text-muted)">Pengisi / Subjek</label>
              <Select
                value={bentrokForm.subjek}
                onValueChange={(val: string) => setBentrokForm({ ...bentrokForm, subjek: val })}
                options={subjekList?.map((s) => ({ value: s.id, label: s.nama })) || []}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="primary"
                className="w-full"
                disabled={cekBentrokMutation.isPending}
                onClick={handleTestBentrok}
              >
                Uji Bentrok
              </Button>
            </div>
          </div>

          {cekBentrokMutation.data && (
            <div
              className={`rounded-lg border p-4 text-[13px] ${
                cekBentrokMutation.data.adaBentrok
                  ? 'border-(--color-warning-border) bg-(--color-warning-subtle) text-(--color-warning-text)'
                  : 'border-(--color-success-border) bg-(--color-success-subtle) text-(--color-success-text)'
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5">
                {cekBentrokMutation.data.adaBentrok ? (
                  <Warning16Regular />
                ) : (
                  <Checkmark16Regular />
                )}
                <span>{cekBentrokMutation.data.ringkasan}</span>
              </div>
              {cekBentrokMutation.data.daftarBentrok.length > 0 && (
                <ul className="mt-2 space-y-1 list-disc list-inside text-[12px]">
                  {cekBentrokMutation.data.daftarBentrok.map((b, idx) => (
                    <li key={idx}>{b.keterangan}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        {/* SECTION 5: MATRIKS BELAJAR DATA */}
        <section className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-raised)">
          <div className="flex items-center justify-between border-b border-(--color-border-subtle) pb-3 mb-4">
            <div className="flex items-center gap-2">
              <TableSimple16Regular className="text-(--color-brand)" />
              <h2 className="text-[14px] font-semibold text-(--color-text)">
                Kalkulasi Matriks Belajar (useMatriks) — Server-Computed
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-(--color-text-secondary)">Mapel:</span>
                <Select
                  value={selectedMapel}
                  onValueChange={(val: string) => setSelectedMapel(val)}
                  options={mapelList?.map((m) => ({ value: m.id, label: m.nama })) || []}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-(--color-text-secondary)">Jenjang:</span>
                <Select
                  value={selectedJenjang}
                  onValueChange={(val: string) => setSelectedJenjang(val as 'SD' | 'SMP' | 'SMA')}
                  options={[
                    { value: 'SD', label: 'SD' },
                    { value: 'SMP', label: 'SMP' },
                    { value: 'SMA', label: 'SMA' },
                  ]}
                />
              </div>
            </div>
          </div>

          {loadingMatriks ? (
            <div className="py-8 text-center text-(--color-text-muted) text-[13px]">
              Menghitung sel dan ringkasan matriks melalui useMatriks...
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-(--color-border-subtle) bg-(--color-surface-alt)">
                  <div className="text-[11px] text-(--color-text-muted)">Cakupan Matriks</div>
                  <div className="text-[16px] font-semibold text-(--color-text) mt-0.5">
                    {matriksData?.namaMapel} · {matriksData?.jenjang}
                  </div>
                  <div className="text-[11px] text-(--color-text-secondary) mt-0.5">
                    {matriksData?.kolom.length} materi · {matriksData?.baris.length} siswa
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-(--color-border-subtle) bg-(--color-surface-alt)">
                  <div className="text-[11px] text-(--color-text-muted)">
                    Siswa Tertinggal (&ge; {matriksData?.ambangTertinggal.minBelum} dari {matriksData?.ambangTertinggal.totalMateri} materi)
                  </div>
                  <div className="text-[16px] font-semibold text-(--color-danger-text) mt-0.5">
                    {matriksData?.siswaTertinggal.length} Siswa
                  </div>
                  <div className="text-[11px] text-(--color-text-secondary) mt-0.5">
                    Ambang batas: &ge; 40% kolom tampil
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-(--color-border-subtle) bg-(--color-surface-alt)">
                  <div className="text-[11px] text-(--color-text-muted)">Materi Paling Tertinggal</div>
                  <div className="text-[16px] font-semibold text-(--color-warning-text) mt-0.5 truncate">
                    {matriksData?.materiPalingTertinggal?.nama || 'Merata'}
                  </div>
                  <div className="text-[11px] text-(--color-text-secondary) mt-0.5 truncate">
                    {matriksData?.materiPalingTertinggal?.alasan || 'Semua materi telah merata'}
                  </div>
                </div>
              </div>

              {/* Matrix Table Preview */}
              <div className="overflow-x-auto max-h-80 border border-(--color-border) rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-(--color-surface) z-10 min-w-48">
                        Nama Siswa
                      </TableHead>
                      {matriksData?.kolom.map((col) => (
                        <TableHead key={col.id} className="text-center text-[11px] min-w-24">
                          {col.nama}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matriksData?.baris.slice(0, 8).map((siswa) => (
                      <TableRow key={siswa.id}>
                        <TableCell className="sticky left-0 bg-(--color-surface) z-10 font-medium text-[12px] truncate max-w-48">
                          {siswa.nama}
                        </TableCell>
                        {matriksData?.kolom.map((col) => {
                          const cell = matriksData.sel[siswa.id]?.[col.id];
                          const state = cell?.keadaan || 'kosong';
                          return (
                            <TableCell key={col.id} className="text-center p-1">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  state === 'tersampaikan'
                                    ? 'bg-(--color-matriks-tersampaikan-bg) text-(--color-matriks-tersampaikan-text)'
                                    : state === 'selesai_manual'
                                    ? 'bg-(--color-matriks-selesai-manual-bg) text-(--color-matriks-selesai-manual-text)'
                                    : state === 'terjadwal'
                                    ? 'bg-(--color-matriks-terjadwal-bg) text-(--color-matriks-terjadwal-text)'
                                    : state === 'alpa'
                                    ? 'bg-(--color-matriks-alpa-bg) text-(--color-matriks-alpa-text)'
                                    : state === 'izin'
                                    ? 'bg-(--color-matriks-izin-bg) text-(--color-matriks-izin-text)'
                                    : state === 'sakit'
                                    ? 'bg-(--color-matriks-sakit-bg) text-(--color-matriks-sakit-text)'
                                    : 'text-(--color-text-muted)'
                                }`}
                              >
                                {state}
                              </span>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
