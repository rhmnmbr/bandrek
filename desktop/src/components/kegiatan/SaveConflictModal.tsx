import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Warning16Regular, Dismiss16Regular } from '@fluentui/react-icons';
import { cn } from '@/lib/utils';

export interface ConflictDiffItem {
  field: string;
  serverValue: string;
  localValue: string;
}

export interface SaveConflictModalProps {
  open: boolean;
  onClose: () => void;
  onUseMine: () => void;
  onUseServer: () => void;
  onCompare?: () => void;
  title?: string;
  message?: string;
  diffs?: ConflictDiffItem[];
  kegiatanNama?: string;
}

const DEFAULT_DIFFS: ConflictDiffItem[] = [
  {
    field: 'Waktu kegiatan',
    serverValue: '08:30–10:00',
    localValue: '08:00–09:30',
  },
];

export const SaveConflictModal: React.FC<SaveConflictModalProps> = ({
  open,
  onClose,
  onUseMine,
  onUseServer,
  onCompare,
  title = 'Data berubah di jendela lain',
  message = 'Jam mulai diubah menjadi 08:30 dari jendela lain. Suntingan Anda belum disimpan.',
  diffs = DEFAULT_DIFFS,
  kegiatanNama,
}) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-(--scrim) transition-opacity duration-(--dur-slow) animate-in fade-in-0" />
        <DialogPrimitive.Content
          data-screen-label="B6-konflik"
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-[520px] rounded-lg bg-white border border-(--color-border-strong)',
            'shadow-(--shadow-overlay) duration-(--dur-fast) animate-in fade-in-0 zoom-in-95 overflow-hidden select-none'
          )}
        >
          {/* Header */}
          <div className="flex h-9 items-center justify-between border-b border-(--color-border) px-3.5 bg-white">
            <div className="flex items-center gap-2.5">
              <DialogPrimitive.Title className="text-[14px] font-semibold text-(--color-text-primary)">
                {title}
              </DialogPrimitive.Title>
              <span className="text-[10.5px] uppercase tracking-wider text-(--color-text-muted) font-medium">
                KONFLIK SUNTINGAN
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              title="Tutup dialog (Esc)"
              className="flex h-6 w-6 items-center justify-center rounded text-(--color-text-secondary) hover:bg-(--color-surface-alt) hover:text-(--color-text-primary) transition-colors cursor-pointer"
            >
              <Dismiss16Regular className="text-[14px]" />
            </button>
          </div>

          {/* Body */}
          <div className="p-3.5 flex flex-col gap-2.5">
            {/* Amber Warning Box */}
            <div className="rounded-md border border-[#F0A82E] bg-[#FFF3E0] p-2.5 text-[12.5px] leading-relaxed text-[#8A5200]">
              <div className="flex items-center gap-1.5 font-semibold">
                <Warning16Regular className="text-[15px] flex-none text-[#C47D00]" />
                <span>
                  {kegiatanNama
                    ? `Kegiatan "${kegiatanNama}" baru saja diubah`
                    : 'Kegiatan ini baru saja diubah'}
                </span>
              </div>
              <div className="mt-1 text-[12px] leading-normal">{message}</div>
            </div>

            {/* Comparison Grid */}
            <div className="flex flex-col gap-2">
              {diffs.map((diff, idx) => (
                <div key={idx} className="flex gap-2 text-[12px]">
                  {/* Left: Server Version */}
                  <div className="flex-1 min-w-0 rounded-md border border-(--color-border) bg-white p-2 leading-tight">
                    <div className="text-[10.5px] font-semibold uppercase tracking-wider text-(--color-text-muted)">
                      VERSI TERSIMPAN {diff.field ? `· ${diff.field}` : ''}
                    </div>
                    <div className="mt-1 font-mono text-[12.5px] text-(--color-text-primary) wrap-break-word font-medium">
                      {diff.serverValue}
                    </div>
                  </div>

                  {/* Right: User / Local Version */}
                  <div className="flex-1 min-w-0 rounded-md border border-(--color-brand) bg-(--color-brand-subtle) p-2 leading-tight text-(--color-brand-ink)">
                    <div className="text-[10.5px] font-semibold uppercase tracking-wider text-(--color-brand-ink)">
                      MILIK ANDA {diff.field ? `· ${diff.field}` : ''}
                    </div>
                    <div className="mt-1 font-mono text-[12.5px] text-(--color-brand-ink) wrap-break-word font-semibold">
                      {diff.localValue}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Explanatory note */}
            <div className="text-[11.5px] text-(--color-text-muted) leading-snug">
              Pilih <strong className="text-(--color-text-secondary)">Pakai punya saya</strong> untuk menimpa perubahan dari jendela lain, atau <strong className="text-(--color-text-secondary)">Pakai versi tersimpan</strong> untuk membuang suntingan lokal Anda dan memuat data terbaru.
            </div>

            {/* Action Buttons */}
            <div className="mt-1 flex items-center gap-2 pt-1 border-t border-(--color-border-subtle)">
              <button
                type="button"
                onClick={onUseMine}
                className="flex h-7 items-center justify-center rounded-sm bg-(--color-brand) px-3 text-[12px] font-medium text-white transition-colors duration-(--dur-fast) hover:bg-(--color-brand-hover) cursor-pointer"
              >
                Pakai punya saya
              </button>

              <button
                type="button"
                onClick={onUseServer}
                className="flex h-7 items-center justify-center rounded-sm border border-(--color-border-strong) bg-white px-3 text-[12px] font-medium text-(--color-text-primary) transition-colors duration-(--dur-fast) hover:bg-(--color-surface-alt) cursor-pointer"
              >
                Pakai versi tersimpan
              </button>

              {onCompare && (
                <button
                  type="button"
                  onClick={onCompare}
                  className="flex h-7 items-center justify-center rounded-sm px-2.5 text-[12px] font-medium text-(--color-brand) hover:bg-(--color-brand-subtle) transition-colors cursor-pointer"
                >
                  Bandingkan
                </button>
              )}

              <div className="flex-1" />

              <button
                type="button"
                onClick={onClose}
                className="flex h-7 items-center justify-center rounded-sm px-2 text-[12px] font-normal text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
