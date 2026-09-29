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
  | "belum_direalisasi"
  | "terealisasi"
  | "dibatalkan"
  | "dijadwal-ulang"
  | "dijadwal_ulang";

export type KehadiranStatus = "hadir" | "sakit" | "izin" | "alpa";

export type MasterStatus = "aktif" | "nonaktif";

export interface KegiatanBadgeProps {
  status: KegiatanStatus;
  label?: string;
  className?: string;
}

export const KegiatanBadge: React.FC<KegiatanBadgeProps> = ({ status, label, className }) => {
  const normalizedStatus =
    status === "belum_direalisasi"
      ? "belum"
      : status === "dijadwal_ulang"
      ? "dijadwal-ulang"
      : status;

  const configs: Record<
    "terjadwal" | "belum" | "terealisasi" | "dibatalkan" | "dijadwal-ulang",
    { icon: React.ReactNode; defaultLabel: string; className: string }
  > = {
    terjadwal: {
      icon: (
        <svg
          viewBox="0 0 8 8"
          className="w-2 h-2 overflow-visible flex-none"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="4" cy="4" r="3" />
        </svg>
      ),
      defaultLabel: "Terjadwal",
      className: "border-(--color-event-terjadwal) text-(--color-brand-ink) bg-white",
    },
    belum: {
      icon: <Warning12Regular className="text-[10px] flex-none translate-y-px" />,
      defaultLabel: "Belum direalisasi",
      className:
        "border-(--color-event-belum) text-(--color-warning-ink) bg-(--color-warning-bg)",
    },
    terealisasi: {
      icon: <Checkmark12Regular className="text-[11.5px] flex-none translate-y-[0.75px]" />,
      defaultLabel: "Terealisasi",
      className: "border-(--color-event-terealisasi) text-(--color-success-ink) bg-white",
    },
    dibatalkan: {
      icon: <Dismiss12Regular className="w-2.5 h-2.5 text-[10px] flex-none" />,
      defaultLabel: "Dibatalkan",
      className:
        "border-(--color-event-dibatalkan) text-(--color-text-muted) bg-(--color-canvas)",
    },
    "dijadwal-ulang": {
      icon: <ArrowClockwise12Regular className="text-[10.5px] flex-none" />,
      defaultLabel: "Dijadwal ulang",
      className:
        "border-dashed border-(--color-event-dijadwal-ulang) text-[#5B4394] bg-white",
    },
  };

  const config = configs[normalizedStatus] || configs.terjadwal;
  return (
    <span
      className={cn(
        "inline-flex items-center h-4.5 pr-2 rounded-full border text-[10.5px] font-semibold whitespace-nowrap select-none",
        config.className,
        className
      )}
    >
      <span className="w-5 h-full flex-none flex items-center justify-center">
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
        "border-(--color-status-hadir) bg-(--color-status-hadir-bg) text-(--color-status-hadir-ink)",
    },
    sakit: {
      icon: <CircleHalfFill12Regular className="text-[10px] flex-none" />,
      defaultLabel: "Sakit",
      className:
        "border-(--color-status-sakit) bg-(--color-status-sakit-bg) text-(--color-status-sakit-ink)",
    },
    izin: {
      icon: <Mail12Regular className="w-3.5 h-3.5 flex-none" />,
      defaultLabel: "Izin",
      className:
        "border-(--color-status-izin) bg-(--color-status-izin-bg) text-(--color-status-izin-ink)",
    },
    alpa: {
      icon: <Dismiss12Regular className="w-2.5 h-2.5 text-[10px] flex-none" />,
      defaultLabel: "Alpa",
      className:
        "border-(--color-status-alpa) bg-(--color-status-alpa-bg) text-(--color-status-alpa-ink)",
    },
  };

  const config = configs[status];
  return (
    <span
      className={cn(
        "inline-flex items-center h-4.5 pr-2 rounded-full border text-[10.5px] font-semibold whitespace-nowrap select-none",
        config.className,
        className
      )}
    >
      <span className="w-5 h-full flex-none flex items-center justify-center">
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
        "inline-flex items-center h-4.5 px-2 rounded-full border text-[10.5px] font-semibold whitespace-nowrap select-none",
        isAktif
          ? "border-(--color-success) text-(--color-success-ink) bg-white"
          : "border-(--color-border-strong) text-(--color-text-muted) bg-(--color-canvas)",
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
        "inline-flex items-center gap-1.5 h-6 rounded-full border text-[11.5px] whitespace-nowrap select-none transition-colors",
        onRemove ? "pl-2.5 pr-1" : "px-2.5",
        active
          ? "border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand-ink) font-medium"
          : "border-(--color-border-strong) bg-white text-(--color-text) hover:bg-(--color-surface-alt)",
        className
      )}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="w-4 h-4 -ml-1 flex-none rounded-full cursor-pointer text-inherit flex items-center justify-center transition-colors hover:bg-(--color-surface-sunken) hover:text-(--color-text) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--color-focus-ring)"
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
            className="w-2.5 h-2.5 flex-none"
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

