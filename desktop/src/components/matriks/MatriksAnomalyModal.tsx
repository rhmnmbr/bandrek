import * as React from 'react';
import type { CatatanDiLuarJenjang } from '@/data/types';

interface MatriksAnomalyModalProps {
  open: boolean;
  onClose: () => void;
  items: CatatanDiLuarJenjang[];
  totalSiswa: number;
  jenjang: string;
  namaMapel: string;
  onNavigateToKegiatan: (kegiatanId: string) => void;
}

export const MatriksAnomalyModal: React.FC<MatriksAnomalyModalProps> = ({
  open,
  onClose,
  items,
  totalSiswa,
  jenjang,
  namaMapel,
  onNavigateToKegiatan,
}) => {
  // Close on Escape key
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[76px]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/28 transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Frame (W: 620px, max-H: 560px) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="anomaly-dialog-title"
        className="relative z-50 flex flex-col w-[620px] max-h-[560px] overflow-hidden rounded-lg border border-[#C8C6C4] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex-none p-[13px_16px_0_16px]">
          <h2 id="anomaly-dialog-title" className="text-[17px] font-semibold text-[#242424]">
            Catatan di materi luar jenjang
          </h2>
          <p className="mt-1 text-[12.5px] leading-normal text-[#5C5A58]">
            {items.length} catatan dari {totalSiswa} siswa jenjang {jenjang} menempel di materi {namaMapel} yang jenjangnya lain, jadi tidak muncul sebagai kolom di tabel.
          </p>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 min-h-0 overflow-y-auto m-[11px_16px_0_16px] rounded-md border border-[#E1DFDD]">
          {items.map((item, idx) => {
            const hasKegiatan = Boolean(item.kegiatanId);
            return (
              <button
                key={`${item.siswaId}-${item.materiId}-${idx}`}
                type="button"
                onClick={() => {
                  if (item.kegiatanId) {
                    onClose();
                    onNavigateToKegiatan(item.kegiatanId);
                  }
                }}
                disabled={!hasKegiatan}
                title={hasKegiatan ? 'Buka kegiatan ini' : 'Ceklis manual — tidak terkait kegiatan'}
                className={`w-full flex items-center gap-2.5 p-[8px_10px] text-left border-none border-b border-[#EDEBE9] last:border-b-0 transition-colors ${
                  hasKegiatan ? 'cursor-pointer hover:bg-[#FAFAFA]' : 'cursor-default bg-white'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium text-[#242424] truncate">
                    {item.siswaNama} · {item.siswaJenjang || jenjang}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#5C5A58] truncate">
                    {item.sumber || (item.tipe === 'realisasi' ? 'Kehadiran kegiatan' : 'Ceklis manual')}
                  </div>
                </div>

                <div className="flex-none text-[12px] text-[#424242] whitespace-nowrap">
                  {item.materiNama}
                </div>

                <div className="flex-none rounded-full border border-[#F0A82E] bg-[#FFF3E0] px-2 py-0.5 text-[10.5px] font-medium text-[#8A5200] whitespace-nowrap">
                  {item.materiJenjang ? `materi ${item.materiJenjang.join('/')}` : 'materi lain'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex flex-none items-center gap-2 p-[11px_16px]">
          <div className="flex-1 min-w-0 text-[11.5px] leading-[1.45] text-[#5C5A58]">
            Perbaiki lewat “Ubah realisasi” di kegiatannya, atau ubah jenjang materi di layar mata pelajaran.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-none h-[26px] px-3 rounded border border-[#C8C6C4] bg-white text-[12.5px] font-medium text-[#242424] hover:bg-[#FAFAFA] cursor-pointer whitespace-nowrap"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
