import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import { useAlasanBatal, useBatalkanKegiatan, useSubjekList } from '@/data/hooks';
import { useToast } from '@/components/ui/toast';
import { Select } from '@/components/ui/select';
import { formatTanggalRingkas } from '@/lib/dateUtils';
import type { Kegiatan } from '@/data/types';
import { cn } from '@/lib/utils';

export interface BatalkanKegiatanModalProps {
  open: boolean;
  kegiatan: Kegiatan | null;
  onClose: () => void;
  onSuccess?: (cancelledId: string, sekalianJadwalUlang: boolean) => void;
  onOpenJadwalUlang?: (kegiatanId: string, dariBatal: boolean) => void;
}

export const BatalkanKegiatanModal: React.FC<BatalkanKegiatanModalProps> = ({
  open,
  kegiatan,
  onClose,
  onSuccess,
  onOpenJadwalUlang,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: daftarAlasan = [] } = useAlasanBatal();
  const { data: subjekList = [] } = useSubjekList();
  const batalkanMutation = useBatalkanKegiatan();

  const [alasan, setAlasan] = React.useState('');
  const [keterangan, setKeterangan] = React.useState('');
  const [sekalian, setSekalian] = React.useState(false);
  const [dicoba, setDicoba] = React.useState(false);

  const cancelBtnRef = React.useRef<HTMLButtonElement>(null);
  const alasanSelectRef = React.useRef<HTMLButtonElement>(null);

  // Reset form when modal opens with a new kegiatan
  React.useEffect(() => {
    if (open) {
      setAlasan('');
      setKeterangan('');
      setSekalian(false);
      setDicoba(false);
    }
  }, [open, kegiatan?.id]);

  if (!kegiatan) return null;

  const subjekMap = new Map(subjekList.map((s) => [s.id, s.nama]));
  const subjekStr = kegiatan.subjek.length
    ? kegiatan.subjek
        .map((x) => `${subjekMap.get(x.id) || x.id} (${x.peran})`)
        .join(', ')
    : '—';

  const pesertaStr = kegiatan.siswa.length
    ? `${subjekStr} · ${kegiatan.siswa.length} siswa`
    : `${subjekStr} · tanpa siswa`;

  const errAda = dicoba && !alasan;
  const off = dicoba && !alasan;

  const handleKonfirmasi = async () => {
    if (!alasan) {
      setDicoba(true);
      alasanSelectRef.current?.focus();
      return;
    }

    try {
      await batalkanMutation.mutateAsync({
        id: kegiatan.id,
        input: {
          alasan,
          keterangan: keterangan.trim(),
          sekalianJadwalUlang: sekalian,
        },
      });

      showToast({
        message: 'Kegiatan dibatalkan. Bloknya disembunyikan dari kalender.',
        type: 'warning',
      });

      const kegiatanId = kegiatan.id;
      const mauSekalian = sekalian;
      onClose();
      onSuccess?.(kegiatanId, mauSekalian);

      if (mauSekalian && onOpenJadwalUlang) {
        setTimeout(() => {
          onOpenJadwalUlang(kegiatanId, true);
        }, 80);
      }
    } catch {
      showToast({
        message: 'Gagal membatalkan kegiatan. Terjadi kesalahan pada server.',
        type: 'error',
      });
    }
  };

  const handleLihatMatriks = () => {
    onClose();
    navigate('/matriks');
  };

  const adaSiswa = kegiatan.siswa.length > 0;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-(--scrim) transition-opacity duration-(--dur-slow) animate-in fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-130 rounded-lg bg-white border border-(--color-border-strong)',
            'shadow-(--shadow-overlay) duration-(--dur-fast) animate-in fade-in-0 zoom-in-95 overflow-hidden'
          )}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            cancelBtnRef.current?.focus();
          }}
        >
          {/* Header */}
          <div className="pt-3.5 px-4 pb-0">
            <DialogPrimitive.Title className="text-[15px] font-semibold leading-snug text-(--color-text)">
              Batalkan kegiatan ini?
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-[12.5px] leading-relaxed text-(--color-text-secondary) mt-1">
              Kegiatan tetap tersimpan dan terlihat di kalender dengan tanda dibatalkan. Tidak ada data yang dihapus.
            </DialogPrimitive.Description>
          </div>

          {/* Activity Summary Box */}
          <div className="mx-4 my-2.75 p-2.75 border border-(--color-border) rounded-md bg-(--color-surface-sunken) text-[12.5px] leading-relaxed flex flex-col gap-0.5">
            <div className="font-semibold text-(--color-text)">{kegiatan.nama}</div>
            <div className="font-mono text-[11.5px] text-(--color-text-secondary)">
              {formatTanggalRingkas(kegiatan.tanggal)} · {kegiatan.mulai}–{kegiatan.selesai}
            </div>
            <div className="text-(--color-text)">{pesertaStr}</div>
          </div>

          {/* Reason Selection & Notes */}
          <div className="px-4 flex flex-col gap-1.25">
            <label
              htmlFor="alasan-batal-select"
              className={cn(
                'text-[11.5px] font-medium transition-colors',
                errAda ? 'text-(--color-danger)' : 'text-(--color-text-secondary)'
              )}
            >
              Alasan pembatalan <span className="text-(--color-danger)">*</span>
            </label>
            <Select
              ref={alasanSelectRef}
              value={alasan}
              onValueChange={(val) => {
                setAlasan(val);
                if (val) setDicoba(false);
              }}
              placeholder="Pilih alasan pembatalan"
              density="compact"
              error={errAda}
            >
              <option value="">Pilih alasan pembatalan</option>
              {daftarAlasan.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>

            {errAda && (
              <div className="text-[11px] text-(--color-danger) leading-relaxed flex items-center gap-1.25">
                <span>⚠</span>
                <span>Pilih alasan pembatalan. Alasan ini yang dipakai laporan "kenapa jadwal meleset".</span>
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

          {/* Impact Warning Box */}
          <div className="mx-4 my-2.75 p-2.5 border border-[#F0A82E] rounded-md bg-[#FFF3E0] text-[12px] leading-relaxed text-[#8A5200] flex gap-2">
            <span className="flex-none font-bold text-[13px]">⚠</span>
            <div className="flex-1 min-w-0">
              {adaSiswa ? (
                <div>
                  Materi ini belum tersampaikan ke {kegiatan.siswa.length} siswa. Catatannya di matriks belajar akan tetap kosong sampai dijadwalkan ulang.
                </div>
              ) : (
                <div>Kegiatan ini tanpa siswa, jadi tidak ada dampak ke matriks belajar.</div>
              )}
              {adaSiswa && (
                <button
                  type="button"
                  onClick={handleLihatMatriks}
                  title="Buka matriks belajar untuk materi ini"
                  className="mt-1.75 h-6 px-2.25 rounded border border-[#8A5200] bg-white text-[#8A5200] hover:bg-[#FFF8EE] text-[11.5px] font-medium cursor-pointer transition-colors whitespace-nowrap"
                >
                  Lihat matriks
                </button>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-4 pb-3.5 flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-(--color-text) cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sekalian}
                onChange={(e) => setSekalian(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-(--color-brand) cursor-pointer"
              />
              <span>Sekalian jadwalkan ulang</span>
            </label>

            <div className="flex-1" />

            <button
              ref={cancelBtnRef}
              type="button"
              onClick={onClose}
              className="h-6.5 px-3 rounded border border-(--color-border-strong) bg-white text-(--color-text) hover:bg-(--color-surface-sunken) text-xs font-normal cursor-pointer transition-colors"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handleKonfirmasi}
              disabled={off || batalkanMutation.isPending}
              title={off ? 'Pilih alasan pembatalan dulu' : 'Kegiatan tetap tersimpan dengan tanda dibatalkan'}
              className={cn(
                'h-6.5 px-3 rounded text-xs font-semibold whitespace-nowrap transition-colors border',
                off
                  ? 'bg-(--color-surface-disabled) text-(--color-text-disabled) border-(--color-border) cursor-not-allowed'
                  : 'bg-white text-(--color-danger) border-(--color-danger) hover:bg-[#FDF3F4] cursor-pointer'
              )}
            >
              {batalkanMutation.isPending ? 'Membatalkan...' : 'Batalkan kegiatan'}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
