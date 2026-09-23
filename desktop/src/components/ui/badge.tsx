import * as React from "react";
import { cn } from "@/lib/utils";

export type KegiatanStatus =
  | "terjadwal"
  | "belum"
  | "terealisasi"
  | "dibatalkan"
  | "dijadwal-ulang";

export type KehadiranStatus = "hadir" | "sakit" | "izin" | "alpa";

export type MasterStatus = "aktif" | "nonaktif";

export interface KegiatanBadgeProps {
  status: KegiatanStatus;
  label?: string;
  className?: string;
}

export const KegiatanBadge: React.FC<KegiatanBadgeProps> = ({ status, label, className }) => {
  const configs: Record<
    KegiatanStatus,
    { glyph: string; defaultLabel: string; className: string }
  > = {
    terjadwal: {
      glyph: "●",
      defaultLabel: "Terjadwal",
      className: "border-[var(--color-event-terjadwal)] text-[var(--color-brand-ink)] bg-white",
    },
    belum: {
      glyph: "⚠",
      defaultLabel: "Belum direalisasi",
      className:
        "border-[var(--color-event-belum)] text-[var(--color-warning-ink)] bg-[var(--color-warning-bg)]",
    },
    terealisasi: {
      glyph: "✓",
      defaultLabel: "Terealisasi",
      className: "border-[var(--color-event-terealisasi)] text-[var(--color-success-ink)] bg-white",
    },
    dibatalkan: {
      glyph: "✕",
      defaultLabel: "Dibatalkan",
      className:
        "border-[var(--color-event-dibatalkan)] text-[var(--color-text-muted)] bg-[var(--color-canvas)] line-through",
    },
    "dijadwal-ulang": {
      glyph: "↻",
      defaultLabel: "Dijadwal ulang",
      className:
        "border-dashed border-[var(--color-event-dijadwal-ulang)] text-[#5B4394] bg-white",
    },
  };

  const config = configs[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-[18px] px-2 rounded-full border text-[10.5px] font-medium leading-none whitespace-nowrap select-none",
        config.className,
        className
      )}
    >
      <span className="leading-none text-[10px]">{config.glyph}</span>
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};

export interface KehadiranBadgeProps {
  status: KehadiranStatus;
  label?: string;
  className?: string;
}

export const KehadiranBadge: React.FC<KehadiranBadgeProps> = ({ status, label, className }) => {
  const configs: Record<
    KehadiranStatus,
    { glyph: string; defaultLabel: string; className: string }
  > = {
    hadir: {
      glyph: "✓",
      defaultLabel: "Hadir",
      className:
        "border-[var(--color-status-hadir)] bg-[var(--color-status-hadir-bg)] text-[var(--color-status-hadir-ink)]",
    },
    sakit: {
      glyph: "◐",
      defaultLabel: "Sakit",
      className:
        "border-[var(--color-status-sakit)] bg-[var(--color-status-sakit-bg)] text-[var(--color-status-sakit-ink)]",
    },
    izin: {
      glyph: "✉",
      defaultLabel: "Izin",
      className:
        "border-[var(--color-status-izin)] bg-[var(--color-status-izin-bg)] text-[var(--color-status-izin-ink)]",
    },
    alpa: {
      glyph: "✕",
      defaultLabel: "Alpa",
      className:
        "border-[var(--color-status-alpa)] bg-[var(--color-status-alpa-bg)] text-[var(--color-status-alpa-ink)]",
    },
  };

  const config = configs[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-[18px] px-2 rounded-full border text-[10.5px] font-medium leading-none whitespace-nowrap select-none",
        config.className,
        className
      )}
    >
      <span className="leading-none font-bold text-[10px]">{config.glyph}</span>
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};

export interface MasterStatusBadgeProps {
  status: MasterStatus;
  label?: string;
  className?: string;
}

export const MasterStatusBadge: React.FC<MasterStatusBadgeProps> = ({
  status,
  label,
  className,
}) => {
  const isAktif = status === "aktif";
  return (
    <span
      className={cn(
        "inline-flex items-center h-[18px] px-2 rounded-full border text-[10.5px] font-medium leading-none whitespace-nowrap select-none",
        isAktif
          ? "border-[var(--color-success)] text-[var(--color-success-ink)] bg-white"
          : "border-[var(--color-border-strong)] text-[var(--color-text-muted)] bg-[var(--color-canvas)]",
        className
      )}
    >
      {label || (isAktif ? "Aktif" : "Nonaktif")}
    </span>
  );
};

export interface FilterChipProps {
  label: string;
  onRemove?: () => void;
  active?: boolean;
  className?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  onRemove,
  active = true,
  className,
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-full border text-[11.5px] whitespace-nowrap select-none transition-colors",
        active
          ? "border-[var(--color-brand)] bg-[var(--color-brand-subtle)] text-[var(--color-brand-ink)] font-medium"
          : "border-[var(--color-border-strong)] bg-white text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]",
        className
      )}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-[10px] hover:font-bold p-0.5 leading-none cursor-pointer"
          title={`Hapus filter ${label}`}
        >
          ✕
        </button>
      )}
    </span>
  );
};

