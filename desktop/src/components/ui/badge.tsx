import * as React from "react";
import {
  Warning12Regular,
  Checkmark12Regular,
  Dismiss12Regular,
  ArrowClockwise12Regular,
  CircleHalfFill12Regular,
  Mail12Regular,
} from "@fluentui/react-icons";
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
    { icon: React.ReactNode; defaultLabel: string; className: string }
  > = {
    terjadwal: {
      icon: (
        <svg
          viewBox="0 0 8 8"
          className="w-[8px] h-[8px] overflow-visible flex-none"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="4" cy="4" r="3" />
        </svg>
      ),
      defaultLabel: "Terjadwal",
      className: "border-[var(--color-event-terjadwal)] text-[var(--color-brand-ink)] bg-white",
    },
    belum: {
      icon: <Warning12Regular className="text-[10px] flex-none translate-y-[1px]" />,
      defaultLabel: "Belum direalisasi",
      className:
        "border-[var(--color-event-belum)] text-[var(--color-warning-ink)] bg-[var(--color-warning-bg)]",
    },
    terealisasi: {
      icon: <Checkmark12Regular className="text-[11.5px] flex-none translate-y-[0.75px]" />,
      defaultLabel: "Terealisasi",
      className: "border-[var(--color-event-terealisasi)] text-[var(--color-success-ink)] bg-white",
    },
    dibatalkan: {
      icon: <Dismiss12Regular className="w-[10px] h-[10px] text-[10px] flex-none" />,
      defaultLabel: "Dibatalkan",
      className:
        "border-[var(--color-event-dibatalkan)] text-[var(--color-text-muted)] bg-[var(--color-canvas)]",
    },
    "dijadwal-ulang": {
      icon: <ArrowClockwise12Regular className="text-[10.5px] flex-none" />,
      defaultLabel: "Dijadwal ulang",
      className:
        "border-dashed border-[var(--color-event-dijadwal-ulang)] text-[#5B4394] bg-white",
    },
  };

  const config = configs[status];
  return (
    <span
      className={cn(
        "inline-flex items-center h-[18px] pr-2 rounded-full border text-[10.5px] font-semibold whitespace-nowrap select-none",
        config.className,
        className
      )}
    >
      <span className="w-[20px] h-full flex-none flex items-center justify-center">
        {config.icon}
      </span>
      <span className="leading-none">{label || config.defaultLabel}</span>
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
    { icon: React.ReactNode; defaultLabel: string; className: string }
  > = {
    hadir: {
      icon: <Checkmark12Regular className="text-[11.5px] flex-none translate-y-[0.75px]" />,
      defaultLabel: "Hadir",
      className:
        "border-[var(--color-status-hadir)] bg-[var(--color-status-hadir-bg)] text-[var(--color-status-hadir-ink)]",
    },
    sakit: {
      icon: <CircleHalfFill12Regular className="text-[10px] flex-none" />,
      defaultLabel: "Sakit",
      className:
        "border-[var(--color-status-sakit)] bg-[var(--color-status-sakit-bg)] text-[var(--color-status-sakit-ink)]",
    },
    izin: {
      icon: <Mail12Regular className="w-[14px] h-[14px] flex-none" />,
      defaultLabel: "Izin",
      className:
        "border-[var(--color-status-izin)] bg-[var(--color-status-izin-bg)] text-[var(--color-status-izin-ink)]",
    },
    alpa: {
      icon: <Dismiss12Regular className="w-[10px] h-[10px] text-[10px] flex-none" />,
      defaultLabel: "Alpa",
      className:
        "border-[var(--color-status-alpa)] bg-[var(--color-status-alpa-bg)] text-[var(--color-status-alpa-ink)]",
    },
  };

  const config = configs[status];
  return (
    <span
      className={cn(
        "inline-flex items-center h-[18px] pr-2 rounded-full border text-[10.5px] font-semibold whitespace-nowrap select-none",
        config.className,
        className
      )}
    >
      <span className="w-[20px] h-full flex-none flex items-center justify-center">
        {config.icon}
      </span>
      <span className="leading-none">{label || config.defaultLabel}</span>
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
        "inline-flex items-center h-[18px] px-2 rounded-full border text-[10.5px] font-semibold whitespace-nowrap select-none",
        isAktif
          ? "border-[var(--color-success)] text-[var(--color-success-ink)] bg-white"
          : "border-[var(--color-border-strong)] text-[var(--color-text-muted)] bg-[var(--color-canvas)]",
        className
      )}
    >
      <span className="leading-none">
        {label || (isAktif ? "Aktif" : "Nonaktif")}
      </span>
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
        "inline-flex items-center gap-1.5 h-[24px] rounded-full border text-[11.5px] whitespace-nowrap select-none transition-colors",
        onRemove ? "pl-2.5 pr-1" : "px-2.5",
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
          className="w-4 h-4 -ml-1 flex-none rounded-full cursor-pointer text-inherit flex items-center justify-center transition-colors hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-focus-ring)]"
          title={`Hapus filter ${label}`}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            className="w-[10px] h-[10px] flex-none"
            aria-hidden="true"
          >
            <line x1="4" y1="4" x2="12" y2="12" />
            <line x1="12" y1="4" x2="4" y2="12" />
          </svg>
        </button>
      )}
    </span>
  );
};

