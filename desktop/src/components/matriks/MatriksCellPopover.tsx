import * as React from 'react';
import {
  Checkmark16Regular,
  Circle12Filled,
  CircleHalfFill16Regular,
  Mail16Regular,
  Dismiss16Regular,
  Edit16Regular,
} from '@fluentui/react-icons';
import { DatePicker } from '@/components/ui/date-picker';
import { formatTanggalPendek } from '@/lib/dateUtils';
import type { SelMatriks, KolomMateri, BarisSiswa } from '@/data/types';

interface MatriksCellPopoverProps {
  open: boolean;
  onClose: () => void;
  cell: SelMatriks;
  siswa: BarisSiswa;
  materi: KolomMateri;
  namaMapel: string;
  anchorRect: DOMRect | null;
  onSaveManual: (siswaId: string, materiId: string, tanggal?: string | null, catatan?: string) => void;
  onRemoveManual: (siswaId: string, materiId: string, ceklisId?: string) => void;
  onNavigateToKegiatan: (kegiatanId: string) => void;
}

const BADGE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; bg: string; border: string; text: string; italic?: boolean }
> = {
  tersampaikan: { label: 'Tersampaikan', icon: <Checkmark16Regular className="w-3 h-3 text-current flex-none" />, bg: '#E8F5E9', border: '#81C784', text: '#2E7D32' },
  selesai_manual: { label: 'Ditandai manual', icon: <Edit16Regular className="w-3 h-3 text-current flex-none" />, bg: '#E0F2F1', border: '#80CBC4', text: '#00695C', italic: true },
  terjadwal: { label: 'Sudah dijadwalkan', icon: <Circle12Filled className="w-2.5 h-2.5 text-current flex-none" />, bg: '#FAFAFA', border: '#C8C6C4', text: '#5C5A58' },
  sakit: { label: 'Sakit', icon: <CircleHalfFill16Regular className="w-2.5 h-2.5 text-current flex-none" />, bg: '#FFF3E0', border: '#FFB74D', text: '#8A5200' },
  izin: { label: 'Izin', icon: <Mail16Regular className="w-2.5 h-2.5 text-current flex-none" />, bg: '#EBF3FC', border: '#90CAF9', text: '#0C548F' },
  alpa: { label: 'Alpa', icon: <Dismiss16Regular className="w-2.5 h-2.5 text-current flex-none" />, bg: '#FDE7E9', border: '#EF9A9A', text: '#9B0C18' },
  kosong: { label: 'Belum dijadwalkan', icon: <span className="size-1 rounded-full bg-current opacity-60 flex-none" />, bg: '#FFFFFF', border: '#C8C6C4', text: '#8A8886' },
};

const PRESENCE_CONFIG: Record<string, { label: string; icon: React.ReactNode; bg: string; border: string; text: string }> = {
  hadir: { label: 'Hadir', icon: <Checkmark16Regular className="w-3 h-3 text-current flex-none" />, bg: '#E8F5E9', border: '#81C784', text: '#2E7D32' },
  izin: { label: 'Izin', icon: <Mail16Regular className="w-2.5 h-2.5 text-current flex-none" />, bg: '#EBF3FC', border: '#90CAF9', text: '#0C548F' },
  sakit: { label: 'Sakit', icon: <CircleHalfFill16Regular className="w-2.5 h-2.5 text-current flex-none" />, bg: '#FFF3E0', border: '#FFB74D', text: '#8A5200' },
  alpa: { label: 'Alpa', icon: <Dismiss16Regular className="w-2.5 h-2.5 text-current flex-none" />, bg: '#FDE7E9', border: '#EF9A9A', text: '#9B0C18' },
};

export const MatriksCellPopover: React.FC<MatriksCellPopoverProps> = ({
  open,
  onClose,
  cell,
  siswa,
  materi,
  namaMapel,
  anchorRect,
  onSaveManual,
  onRemoveManual,
  onNavigateToKegiatan,
}) => {
  const isTersampaikanOtomatis = cell.keadaan === 'tersampaikan';
  const initialChecked = cell.keadaan === 'selesai_manual' || Boolean(cell.ceklisManualId);
  const initialTanggal = cell.tanggal || '';
  const initialCatatan = cell.catatanManual || '';

  const [checked, setChecked] = React.useState(initialChecked);
  const [tanggal, setTanggal] = React.useState(initialTanggal);
  const [catatan, setCatatan] = React.useState(initialCatatan);

  // Sync state when cell changes
  React.useEffect(() => {
    setChecked(initialChecked);
    setTanggal(initialTanggal);
    setCatatan(initialCatatan);
  }, [cell.siswaId, cell.materiId, initialChecked, initialTanggal, initialCatatan]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !anchorRect) return null;

  // Calculate coordinates clamped to viewport
  const width = 360;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = Math.round(anchorRect.left + anchorRect.width / 2 - width / 2);
  if (left + width > viewportWidth - 12) left = viewportWidth - width - 12;
  if (left < 12) left = 12;

  let top = Math.round(anchorRect.bottom + 6);
  if (top + 340 > viewportHeight - 12) {
    top = Math.round(anchorRect.top - 346);
  }
  if (top < 12) top = 12;

  const badge = BADGE_CONFIG[cell.keadaan] || BADGE_CONFIG.kosong;

  const isChanged =
    checked !== initialChecked ||
    (checked && (tanggal !== initialTanggal || catatan.trim() !== initialCatatan.trim()));

  const handleSave = () => {
    if (checked) {
      onSaveManual(siswa.id, materi.id, tanggal || null, catatan.trim());
    } else {
      onRemoveManual(siswa.id, materi.id, cell.ceklisManualId);
    }
    onClose();
  };

  const saveLabel = checked
    ? initialChecked
      ? 'Perbarui ceklis'
      : 'Simpan ceklis'
    : initialChecked
    ? 'Lepas ceklis'
    : 'Simpan ceklis';

  // Finding activity that was presence source if tersampaikan
  const sourceHadirKeg = cell.riwayat.find((k) => k.kehadiran === 'hadir');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Invisible backdrop to dismiss */}
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />

      {/* Popover Frame */}
      <div
        role="dialog"
        aria-modal="true"
        style={{ left: `${left}px`, top: `${top}px`, width: `${width}px` }}
        className="fixed z-50 flex flex-col rounded-lg border border-[#C8C6C4] bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start gap-2.5 p-[12px_14px_0_14px]">
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold leading-[1.3] text-[#242424] truncate">
              {siswa.nama}
            </div>
            <div className="mt-0.5 text-[12.5px] leading-[1.4] text-[#5C5A58] truncate">
              {siswa.jenjang} · {namaMapel} › {materi.nama}
            </div>
          </div>
          <div
            style={{
              borderColor: badge.border,
              backgroundColor: badge.bg,
              color: badge.text,
            }}
            className="flex-none inline-flex items-center gap-1.5 h-5 rounded-full border px-2 text-[11px] font-semibold leading-none whitespace-nowrap"
          >
            <span className="flex items-center justify-center flex-none">{badge.icon}</span>
            <span className="leading-none">{badge.label}</span>
          </div>
        </div>

        {/* Section: Kegiatan Terkait */}
        <div className="p-[11px_14px_0_14px] text-[10.5px] tracking-[0.09em] font-semibold text-[#5C5A58] uppercase">
          Kegiatan Terkait
        </div>

        {cell.riwayat.length > 0 ? (
          <div className="m-[6px_14px_0_14px] max-h-[168px] overflow-y-auto rounded-md border border-[#E1DFDD]">
            {cell.riwayat.map((k, idx) => {
              const pres = k.kehadiran ? PRESENCE_CONFIG[k.kehadiran] : null;
              const presenceLabel = pres
                ? pres.label
                : k.realisasiAda
                ? 'Tanpa status'
                : 'Belum direalisasi';
              const presenceIcon = pres ? (
                pres.icon
              ) : (
                <span className="size-1 rounded-full bg-current opacity-60 flex-none" />
              );
              const presenceBg = pres ? pres.bg : '#F5F5F5';
              const presenceBorder = pres ? pres.border : '#C8C6C4';
              const presenceText = pres ? pres.text : '#5C5A58';

              let ketuntasanLabel = 'Tanpa ketuntasan';
              if (!k.realisasiAda) ketuntasanLabel = 'Belum direalisasi';
              else if (k.ketuntasan === 'tuntas') ketuntasanLabel = 'Tuntas';
              else if (k.ketuntasan === 'sebagian') ketuntasanLabel = 'Tuntas sebagian';
              else if (k.ketuntasan === 'tidak') ketuntasanLabel = 'Tidak tuntas';

              return (
                <button
                  key={`${k.kegiatanId}-${idx}`}
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToKegiatan(k.kegiatanId);
                  }}
                  title="Buka kegiatan ini"
                  className="w-full flex flex-col gap-1 p-[7px_9px] text-left border-none border-b border-[#EDEBE9] last:border-b-0 bg-white hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <span className="flex-none font-mono text-[11px] text-[#5C5A58]">
                      {formatTanggalPendek(k.tanggal)}
                    </span>
                    <span className="flex-1 min-w-0 text-[12.5px] text-[#242424] truncate">
                      {k.namaKegiatan}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span
                      style={{
                        backgroundColor: presenceBg,
                        borderColor: presenceBorder,
                        color: presenceText,
                      }}
                      className="inline-flex items-center gap-1.5 h-[18px] px-2 rounded-full border text-[10.5px] font-semibold leading-none whitespace-nowrap"
                    >
                      <span className="flex items-center justify-center flex-none">{presenceIcon}</span>
                      <span className="relative -top-px leading-none">{presenceLabel}</span>
                    </span>
                    <span className="inline-flex items-center h-[18px] px-2 rounded-full border border-[#E1DFDD] bg-white text-[#424242] text-[10.5px] leading-none whitespace-nowrap">
                      <span className="relative -top-px leading-none">{ketuntasanLabel}</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="m-[5px_14px_0_14px] text-[12px] leading-normal text-[#5C5A58]">
            Belum ada kegiatan dengan materi ini untuk {siswa.nama}. Kegiatan yang dibatalkan dan dijadwalkan ulang tidak dihitung.
          </div>
        )}

        {/* Section: Tandai sudah dipelajari (Ceklis Manual) */}
        <div className="mt-3 border-t border-[#E1DFDD] bg-[#FAFAFA] p-[11px_14px]">
          {isTersampaikanOtomatis ? (
            <div className="flex items-start gap-1.5 text-[12px] leading-normal text-[#2E7D32]">
              <Checkmark16Regular className="w-4 h-4 text-[#2E7D32] flex-none mt-0.5" />
              <div className="flex-1 min-w-0">
                Sudah tersampaikan lewat kehadiran di “{sourceHadirKeg?.namaKegiatan || 'kegiatan'}” pada{' '}
                {sourceHadirKeg ? formatTanggalPendek(sourceHadirKeg.tanggal) : 'sesi terkait'}. Ceklis manual hanya untuk materi yang tidak punya jejak kehadiran — kalau catatan kehadirannya keliru, perbaiki lewat “Ubah realisasi” di kegiatan itu.
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-[12.5px] text-[#242424] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="w-3.5 h-3.5 m-0 accent-(--color-brand) cursor-pointer translate-y-px"
                />
                <span className="leading-none">Tandai sudah dipelajari</span>
              </label>

              {checked && (
                <div className="flex flex-col gap-2 pt-1 animate-in fade-in duration-100">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11.5px] text-[#5C5A58]">Tanggal dipelajari</label>
                    <DatePicker
                      value={tanggal}
                      onChange={setTanggal}
                      placeholder="Pilih tanggal"
                      density="compact"
                      className="h-[26px] w-[160px] bg-white font-mono text-[11.5px]"
                    />
                    <div className="text-[11px] text-[#5C5A58]">
                      Boleh dikosongkan kalau tidak ingat kapan.
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11.5px] text-[#5C5A58]">Catatan</label>
                    <input
                      type="text"
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="mis. sudah dikuasai dari sekolah asal"
                      className="h-[26px] rounded border border-[#C8C6C4] bg-white px-2 text-[12.5px] text-[#242424] placeholder:text-[#8A8886] hover:border-[#8A8886] focus:border-[#0F6CBD] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {cell.olehManual && (
                <div className="mt-1 text-[11px] leading-[1.45] text-[#5C5A58]">
                  Dicentang {cell.olehManual} pada {cell.dicatatManual}
                  {cell.tanggal ? ` untuk pembelajaran ${formatTanggalPendek(cell.tanggal)}.` : ', tanpa tanggal pembelajaran.'}
                </div>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="mt-2.5 flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="h-[26px] px-3 rounded border border-[#C8C6C4] bg-white text-[12px] text-[#242424] hover:bg-[#FAFAFA] cursor-pointer whitespace-nowrap"
            >
              Tutup
            </button>
            {!isTersampaikanOtomatis && (
              <button
                type="button"
                disabled={!isChanged}
                onClick={handleSave}
                title={isChanged ? 'Simpan perubahan ceklis manual' : 'Belum ada yang diubah'}
                className={`h-[26px] px-3 rounded text-[12px] font-semibold whitespace-nowrap transition-colors ${
                  isChanged
                    ? 'bg-[#0F6CBD] text-white hover:brightness-95 cursor-pointer'
                    : 'bg-[#EDEBE9] text-[#8A8886] cursor-not-allowed'
                }`}
              >
                {saveLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
