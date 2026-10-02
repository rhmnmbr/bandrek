import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  useAlasanJadwalUlang,
  useJadwalUlangKegiatan,
  useKegiatanDaftar,
  useRuanganList,
  useTempatList,
  useSubjekList,
} from '@/data/hooks';
import { useToast } from '@/components/ui/toast';
import { Select, GroupedRuanganSelect, type TempatRuanganGroup } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { formatTanggalRingkas, menit, toDate, NAMA_HARI, NAMA_BULAN } from '@/lib/dateUtils';
import type { Kegiatan } from '@/data/types';
import { cn } from '@/lib/utils';

export interface JadwalUlangModalProps {
  open: boolean;
  kegiatan: Kegiatan | null;
  dariBatal?: boolean;
  onClose: () => void;
  onSuccess?: (hasil: { kegiatanAsal: Kegiatan; kegiatanBaru: Kegiatan }) => void;
  onNavigateBaru?: (kegiatanBaruId: string) => void;
}

export const JadwalUlangModal: React.FC<JadwalUlangModalProps> = ({
  open,
  kegiatan,
  dariBatal = false,
  onClose,
  onSuccess,
  onNavigateBaru,
}) => {
  const { showToast } = useToast();
  const { data: daftarAlasan = [] } = useAlasanJadwalUlang();
  const { data: semuaKegiatan = [] } = useKegiatanDaftar();
  const { data: ruanganList = [] } = useRuanganList();
  const { data: tempatList = [] } = useTempatList();
  const { data: subjekList = [] } = useSubjekList();
  const jadwalUlangMutation = useJadwalUlangKegiatan();

  // Form states
  const [alasan, setAlasan] = React.useState('');
  const [keterangan, setKeterangan] = React.useState('');
  const [bawa, setBawa] = React.useState(true);
  const [tanggal, setTanggal] = React.useState('');
  const [mulai, setMulai] = React.useState('');
  const [selesai, setSelesai] = React.useState('');
  const [ruangan, setRuangan] = React.useState('');
  const [dicoba, setDicoba] = React.useState(false);

  const cancelBtnRef = React.useRef<HTMLButtonElement>(null);
  const alasanSelectRef = React.useRef<HTMLButtonElement>(null);

  // Initialize or reset form when modal opens
  React.useEffect(() => {
    if (open && kegiatan) {
      setAlasan('');
      setKeterangan('');
      setBawa(true);
      setTanggal(kegiatan.tanggal);
      setMulai(kegiatan.mulai);
      setSelesai(kegiatan.selesai);
      setRuangan(kegiatan.ruangan || '');
      setDicoba(false);
    }
  }, [open, kegiatan]);

  if (!kegiatan) return null;

  // Ruangan & Subjek Map
  const ruanganMap = new Map(ruanganList.map((r) => [r.id, r]));
  const subjekMap = new Map(subjekList.map((s) => [s.id, s.nama]));

  // Old activity meta strings
  const oldRuangan = kegiatan.ruangan ? ruanganMap.get(kegiatan.ruangan) : null;
  const oldRuanganNama = oldRuangan ? oldRuangan.nama : 'Tanpa ruangan';
  const lamaMeta = `${oldRuanganNama} · ${kegiatan.subjek.length} subjek${
    kegiatan.siswa.length ? ` · ${kegiatan.siswa.length} siswa` : ''
  }`;

  // Grouped Ruangan options
  const groupedRuanganForSelect: TempatRuanganGroup[] = React.useMemo(() => {
    return tempatList
      .map((t) => ({
        id: t.id,
        nama: t.nama,
        ruangan: ruanganList
          .filter((r) => r.tempat === t.id)
          .map((r) => ({
            id: r.id,
            nama: `${r.nama} · kapasitas ${r.kapasitas}`,
            kapasitas: r.kapasitas,
          })),
      }))
      .filter((g) => g.ruangan.length > 0);
  }, [tempatList, ruanganList]);

  // Validation
  const waktuSalah =
    !tanggal || !mulai || !selesai || menit(selesai) <= menit(mulai);
  const errAlasan = dicoba && !alasan;
  const errWaktu = dicoba && waktuSalah;
  const off = dicoba && (!alasan || waktuSalah);

  // Time & Slot preview calculations
  const s0 = mulai ? menit(mulai) : 540;
  const e0 = selesai ? menit(selesai) : s0 + 60;
  const jamMulaiInt = Math.floor(s0 / 60);
  const base = Math.max(6, Math.min(20, jamMulaiInt - 1));

  const bentrokDi = (a: number, b: number) =>
    semuaKegiatan.filter(
      (x) =>
        x.id !== kegiatan.id &&
        x.tanggal === tanggal &&
        x.status !== 'dibatalkan' &&
        x.status !== 'dijadwal_ulang' &&
        menit(x.selesai) > a &&
        menit(x.mulai) < b
    );

  const selectedRuanganObj = ruangan ? ruanganMap.get(ruangan) : null;
  const ruanganNama = selectedRuanganObj ? selectedRuanganObj.nama : '';

  const slots = [];
  for (let h = base; h < base + 4; h++) {
    const a = h * 60;
    const b = a + 60;
    const terpilih = !waktuSalah && e0 > a && s0 < b;
    const isi = ruangan ? bentrokDi(a, b).filter((x) => x.ruangan === ruangan) : [];
    slots.push({
      jam: `${String(h).padStart(2, '0')}:00`,
      teks: terpilih
        ? `slot dipilih · ${isi.length ? 'bentrok' : 'bebas'}`
        : isi.length
          ? `${ruanganNama} terisi`
          : 'bebas',
      terpilih,
      isiBentrok: isi.length > 0,
      isLast: h === base + 3,
    });
  }

  // Subject conflict check
  const subjekIds = bawa ? kegiatan.subjek.map((x) => x.id) : [];
  const subjekBentrokList: string[] = [];
  if (!waktuSalah && subjekIds.length) {
    bentrokDi(s0, e0).forEach((x) => {
      x.subjek.forEach((y) => {
        if (subjekIds.includes(y.id) && !subjekBentrokList.includes(y.id)) {
          subjekBentrokList.push(y.id);
        }
      });
    });
  }

  const dTgl = tanggal ? toDate(tanggal) : null;
  const judulPratinjau = dTgl
    ? `PRATINJAU KETERSEDIAAN · ${NAMA_HARI[(dTgl.getDay() + 6) % 7].toUpperCase()} ${dTgl.getDate()} ${NAMA_BULAN[
        dTgl.getMonth()
      ].toUpperCase()}`
    : 'PRATINJAU KETERSEDIAAN';

  const hasilTeks = `Hasil: 1 kegiatan ${
    dariBatal ? 'tetap dibatalkan' : 'ditandai dijadwal ulang'
  } → 1 kegiatan baru pada ${
    dTgl ? `${dTgl.getDate()} ${NAMA_BULAN[dTgl.getMonth()]}` : 'tanggal pilihan Anda'
  }`;

  const handleKonfirmasi = async () => {
    if (!alasan || waktuSalah) {
      setDicoba(true);
      if (!alasan) alasanSelectRef.current?.focus();
      return;
    }

    try {
      const res = await jadwalUlangMutation.mutateAsync({
        id: kegiatan.id,
        input: {
          alasan,
          keterangan: keterangan.trim(),
          tanggalBaru: tanggal,
          mulaiBaru: mulai,
          selesaiBaru: selesai,
          ruanganBaru: ruangan || undefined,
          namaBaru: kegiatan.nama,
          subjekBaru: bawa ? kegiatan.subjek : [],
          siswaBaru: bawa ? kegiatan.siswa : [],
          catatanBaru: bawa ? kegiatan.catatan : '',
        },
      });

      showToast({
        message: 'Kegiatan dijadwalkan ulang.',
        type: 'success',
      });

      onClose();
      onSuccess?.(res);
      if (res.kegiatanBaru && onNavigateBaru) {
        onNavigateBaru(res.kegiatanBaru.id);
      }
    } catch {
      showToast({
        message: 'Gagal menjadwalkan ulang kegiatan. Terjadi kesalahan pada server.',
        type: 'error',
      });
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-(--scrim) transition-opacity duration-(--dur-slow) animate-in fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-186 rounded-lg bg-white border border-(--color-border-strong)',
            'shadow-(--shadow-overlay) duration-(--dur-fast) animate-in fade-in-0 zoom-in-95 overflow-hidden'
          )}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            cancelBtnRef.current?.focus();
          }}
        >
          {/* Header */}
          <div className="pt-3.5 px-4 pb-3 border-b border-(--color-border)">
            <DialogPrimitive.Title className="text-[15px] font-semibold leading-snug text-(--color-text)">
              Jadwalkan ulang kegiatan ini?
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-[12.5px] leading-relaxed text-(--color-text-secondary) mt-1">
              {dariBatal
                ? 'Kegiatan asal tetap berstatus dibatalkan beserta alasannya. Kegiatan baru dibuat pada waktu pilihan Anda dan tertaut ke yang lama.'
                : 'Jadwal lama ditandai dijadwal ulang dan tetap tercatat. Kegiatan baru dibuat pada waktu pilihan Anda, tertaut ke yang lama.'}
            </DialogPrimitive.Description>
          </div>

          {/* Two-Column Body */}
          <div className="flex">
            {/* Left Column: JADWAL LAMA */}
            <div className="flex-1 min-w-0 p-3.5 flex flex-col gap-2.5 border-r border-(--color-border)">
              <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-secondary) uppercase">
                JADWAL LAMA
              </div>

              {/* Old Activity Box */}
              <div className="p-2.5 border border-(--color-border) rounded-md bg-(--color-surface-sunken) text-[12.5px] leading-relaxed flex flex-col gap-0.5">
                <div className="font-semibold text-(--color-text)">{kegiatan.nama}</div>
                <div className="font-mono text-[11.5px] text-(--color-text-secondary) line-through">
                  {formatTanggalRingkas(kegiatan.tanggal)} · {kegiatan.mulai}–{kegiatan.selesai}
                </div>
                <div className="text-(--color-text)">{lamaMeta}</div>
              </div>

              {/* Alasan Penjadwalan Ulang */}
              <div className="flex flex-col gap-1.25">
                <label
                  htmlFor="alasan-ulang-select"
                  className={cn(
                    'text-[11.5px] font-medium transition-colors',
                    errAlasan ? 'text-(--color-danger)' : 'text-(--color-text-secondary)'
                  )}
                >
                  Alasan penjadwalan ulang <span className="text-(--color-danger)">*</span>
                </label>
                <Select
                  ref={alasanSelectRef}
                  value={alasan}
                  onValueChange={(val) => {
                    setAlasan(val);
                    if (val) setDicoba(false);
                  }}
                  placeholder="Pilih alasan penjadwalan ulang"
                  density="compact"
                  error={errAlasan}
                >
                  <option value="">Pilih alasan penjadwalan ulang</option>
                  {daftarAlasan.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>

                {errAlasan && (
                  <div className="text-[11px] text-(--color-danger) leading-relaxed flex items-center gap-1.25">
                    <span>⚠</span>
                    <span>Pilih alasan penjadwalan ulang. Ini bahan laporan "kenapa jadwal meleset".</span>
                  </div>
                )}

                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  rows={2}
                  placeholder="Keterangan tambahan (opsional)"
                  className="mt-1 p-1.5 text-[12.5px] leading-relaxed bg-white border border-(--color-border-strong) rounded outline-none hover:border-(--color-text-secondary) focus:border-(--color-brand) resize-y"
                />
              </div>

              {/* Checkbox Bawa Serta */}
              <label className="flex items-start gap-1.75 text-xs text-(--color-text) cursor-pointer select-none mt-1">
                <input
                  type="checkbox"
                  checked={bawa}
                  onChange={(e) => setBawa(e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 rounded accent-(--color-brand) cursor-pointer flex-none"
                />
                <span className="leading-relaxed font-normal">
                  Bawa serta subjek, siswa, materi, dan catatan rencana
                </span>
              </label>
              <div className="text-[11px] text-(--color-text-secondary) leading-relaxed -mt-1 pl-5.25">
                {bawa
                  ? 'Subjek, siswa, materi, dan catatan rencana disalin ke jadwal baru.'
                  : 'Jadwal baru dibuat kosong — hanya nama, jenis, waktu, dan ruangan yang ikut.'}
              </div>
            </div>

            {/* Right Column: JADWAL BARU */}
            <div className="w-94 flex-none p-3.5 flex flex-col gap-2.5 bg-(--color-surface-sunken)">
              <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-secondary) uppercase">
                JADWAL BARU
              </div>

              {/* Tanggal, Mulai, Selesai Inputs */}
              <div className="flex gap-2 items-start">
                {/* Tanggal */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <label htmlFor="tanggal-baru" className="text-[11.5px] text-(--color-text-secondary) font-medium">
                    Tanggal <span className="text-(--color-danger)">*</span>
                  </label>
                  <DatePicker
                    value={tanggal}
                    onChange={(val) => setTanggal(val)}
                    formatDisplay="dd/MM/yyyy"
                    placeholder="Pilih tanggal"
                    className="font-mono text-xs"
                  />
                </div>

                {/* Mulai */}
                <div className="w-21 flex-none flex flex-col gap-1">
                  <label htmlFor="mulai-baru" className="text-[11.5px] text-(--color-text-secondary) font-medium">
                    Mulai <span className="text-(--color-danger)">*</span>
                  </label>
                  <TimePicker
                    id="mulai-baru"
                    value={mulai}
                    onChange={(val) => setMulai(val)}
                  />
                </div>

                {/* Selesai */}
                <div className="w-21 flex-none flex flex-col gap-1">
                  <label
                    htmlFor="selesai-baru"
                    className={cn(
                      'text-[11.5px] font-medium transition-colors',
                      errWaktu ? 'text-(--color-danger)' : 'text-(--color-text-secondary)'
                    )}
                  >
                    Selesai <span className="text-(--color-danger)">*</span>
                  </label>
                  <TimePicker
                    id="selesai-baru"
                    value={selesai}
                    onChange={(val) => setSelesai(val)}
                    error={Boolean(errWaktu)}
                  />
                </div>
              </div>

              {/* Time Error */}
              {errWaktu && (
                <div className="text-[11px] text-(--color-danger) leading-relaxed flex items-center gap-1 -mt-1">
                  <span>⚠</span>
                  <span>
                    {!tanggal || !mulai || !selesai
                      ? 'Tanggal, jam mulai, dan jam selesai harus terisi.'
                      : `Jam selesai harus setelah jam mulai. Ubah jam selesai menjadi setelah ${mulai}.`}
                  </span>
                </div>
              )}

              {/* Ruangan Dropdown Grouped */}
              <div className="flex flex-col gap-1">
                <label htmlFor="ruangan-baru-select" className="text-[11.5px] text-(--color-text-secondary) font-medium">
                  Ruangan
                </label>
                <GroupedRuanganSelect
                  groups={groupedRuanganForSelect}
                  value={ruangan}
                  onValueChange={setRuangan}
                  density="compact"
                  allowNone={true}
                  noneLabel="Tanpa ruangan"
                  placeholder="Pilih ruangan"
                />
              </div>

              {/* Pratinjau Ketersediaan Title */}
              <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-secondary) uppercase mt-0.5">
                {judulPratinjau}
              </div>

              {/* 4 Hourly Slot Preview Box */}
              <div className="border border-(--color-border) rounded-md bg-white overflow-hidden text-[11.5px]">
                {slots.map((s) => (
                  <div
                    key={s.jam}
                    className={cn(
                      'flex items-center h-6 px-2.25 transition-colors',
                      !s.isLast && 'border-b border-[#EDEBE9]',
                      s.terpilih ? 'bg-[#EBF3FC] text-[#0C548F] font-semibold' : 'text-(--color-text-secondary)'
                    )}
                  >
                    <span className="font-mono flex-none">{s.jam}</span>
                    <div className="flex-1 min-w-2" />
                    <span className="flex-none whitespace-nowrap">{s.teks}</span>
                  </div>
                ))}
              </div>

              {/* Subject Conflict Info Card */}
              <div
                className={cn(
                  'p-2.5 rounded-md text-[12px] leading-relaxed flex items-start gap-1.75 border transition-colors',
                  !subjekIds.length
                    ? 'border-(--color-border) bg-white text-(--color-text-secondary)'
                    : subjekBentrokList.length
                      ? 'border-[#F0A82E] bg-[#FFF3E0] text-[#8A5200]'
                      : 'border-[#4CAF50] bg-[#E8F5E9] text-[#2E7D32]'
                )}
              >
                <span className="flex-none font-bold">
                  {!subjekIds.length ? '·' : subjekBentrokList.length ? '⚠' : '✓'}
                </span>
                <div className="flex-1 min-w-0">
                  {!subjekIds.length ? (
                    'Tidak ada subjek yang dibawa, jadi tidak ada jadwal subjek yang perlu diperiksa.'
                  ) : subjekBentrokList.length ? (
                    <span>
                      {subjekBentrokList.map((id) => subjekMap.get(id) || id).join(', ')} sudah punya kegiatan pada slot
                      ini. Boleh disimpan, tapi jadwalnya bertumpuk.
                    </span>
                  ) : (
                    'Semua subjek bebas pada slot ini.'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-3.5 border-t border-(--color-border) bg-(--color-surface-sunken) flex items-center gap-2">
            <div className="flex-1 min-w-0 text-xs text-(--color-text-secondary) leading-relaxed">
              {hasilTeks}
            </div>

            <button
              ref={cancelBtnRef}
              type="button"
              onClick={onClose}
              className="h-6.5 px-3 rounded border border-(--color-border-strong) bg-white text-(--color-text) hover:bg-(--color-surface-sunken) text-xs font-normal cursor-pointer transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleKonfirmasi}
              disabled={off || jadwalUlangMutation.isPending}
              title={off ? 'Lengkapi alasan dan waktu dulu' : 'Buat jadwal baru dan tandai yang lama'}
              className={cn(
                'h-6.5 px-3.5 rounded text-xs font-semibold whitespace-nowrap transition-colors border-none',
                off
                  ? 'bg-(--color-surface-disabled) text-(--color-text-disabled) cursor-not-allowed'
                  : 'bg-(--color-brand) text-white hover:bg-(--color-brand-hover) cursor-pointer'
              )}
            >
              {jadwalUlangMutation.isPending ? 'Menyimpan...' : 'Jadwalkan ulang'}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
