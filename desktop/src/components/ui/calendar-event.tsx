import * as React from "react";
import { cn } from "@/lib/utils";
import type { KegiatanStatus } from "./badge";

export type JenisKegiatanKey =
  | "pembelajaran"
  | "rapat"
  | "olahraga"
  | "ujian"
  | "kunjungan"
  | "konsultasi"
  | "pelatihan"
  | "lainnya";

export interface CalendarEventProps extends React.HTMLAttributes<HTMLDivElement> {
  jenis?: JenisKegiatanKey;
  status?: KegiatanStatus;
  jamMulai: string;
  jamSelesai: string;
  judul: string;
  ruangan?: string;
  subjek?: string;
  jumlahSiswa?: number;
  selected?: boolean;
  compact?: boolean;
}

export const jenisColorMap: Record<
  JenisKegiatanKey,
  { border: string; bg: string; ink: string; label: string }
> = {
  pembelajaran: {
    border: "var(--color-jenis-pembelajaran)",
    bg: "var(--color-jenis-pembelajaran-bg)",
    ink: "var(--color-jenis-pembelajaran-ink)",
    label: "Pembelajaran",
  },
  rapat: {
    border: "var(--color-jenis-rapat)",
    bg: "var(--color-jenis-rapat-bg)",
    ink: "var(--color-jenis-rapat-ink)",
    label: "Rapat",
  },
  olahraga: {
    border: "var(--color-jenis-olahraga)",
    bg: "var(--color-jenis-olahraga-bg)",
    ink: "var(--color-jenis-olahraga-ink)",
    label: "Olahraga",
  },
  ujian: {
    border: "var(--color-jenis-ujian)",
    bg: "var(--color-jenis-ujian-bg)",
    ink: "var(--color-jenis-ujian-ink)",
    label: "Ujian",
  },
  kunjungan: {
    border: "var(--color-jenis-kunjungan)",
    bg: "var(--color-jenis-kunjungan-bg)",
    ink: "var(--color-jenis-kunjungan-ink)",
    label: "Kunjungan",
  },
  konsultasi: {
    border: "var(--color-jenis-konsultasi)",
    bg: "var(--color-jenis-konsultasi-bg)",
    ink: "var(--color-jenis-konsultasi-ink)",
    label: "Konsultasi",
  },
  pelatihan: {
    border: "var(--color-jenis-pelatihan)",
    bg: "var(--color-jenis-pelatihan-bg)",
    ink: "var(--color-jenis-pelatihan-ink)",
    label: "Pelatihan",
  },
  lainnya: {
    border: "var(--color-jenis-lainnya)",
    bg: "var(--color-jenis-lainnya-bg)",
    ink: "var(--color-jenis-lainnya-ink)",
    label: "Lainnya",
  },
};

export const CalendarEvent: React.FC<CalendarEventProps> = ({
  jenis = "pembelajaran",
  status = "terjadwal",
  jamMulai,
  jamSelesai,
  judul,
  ruangan,
  subjek,
  jumlahSiswa,
  selected = false,
  compact = false,
  className,
  ...props
}) => {
  const jenisInfo = jenisColorMap[jenis] || jenisColorMap.pembelajaran;

  // Render status glyph in top-right
  const renderStatusGlyph = () => {
    switch (status) {
      case "terealisasi":
        return <span className="text-[var(--color-success-ink)] font-bold text-[11px]">✓</span>;
      case "belum":
        return <span className="text-[var(--color-warning-ink)] font-bold text-[11px]">⚠</span>;
      case "dijadwal-ulang":
        return <span className="text-[#5B4394] font-bold text-[11px]">↻</span>;
      default:
        return null;
    }
  };

  // Status-specific styles
  const isBatal = status === "dibatalkan";
  const isBelum = status === "belum";
  const isDijadwalUlang = status === "dijadwal-ulang";

  const metaParts: string[] = [];
  if (ruangan) metaParts.push(ruangan);
  if (subjek) metaParts.push(subjek);
  if (jumlahSiswa !== undefined) metaParts.push(`${jumlahSiswa} siswa`);
  const metaText = metaParts.join(" · ");

  return (
    <div
      tabIndex={0}
      role="button"
      className={cn(
        "rounded-[3px] text-left transition-all duration-[var(--dur-fast)] cursor-pointer select-none overflow-hidden",
        "p-1.5 leading-[1.3] text-[12px]",
        // Status border & background overrides
        isBatal
          ? "border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-muted)]"
          : isBelum
          ? "border border-[var(--color-warning)] border-l-[4px] border-l-[var(--color-warning)] bg-[var(--color-warning-bg)] text-[var(--color-warning-ink)] shadow-[var(--shadow-raised)]"
          : isDijadwalUlang
          ? "border border-dashed border-[#8764B8] border-l-[4px] border-l-solid border-l-[#8764B8] bg-[#F3EFFA] text-[#5B4394] shadow-[var(--shadow-raised)]"
          : "border-l-[4px] shadow-[var(--shadow-raised)]",
        selected && "outline-2 outline-[var(--color-focus-ring)] outline-offset-2",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] focus-visible:outline-offset-2",
        className
      )}
      style={
        !isBatal && !isBelum && !isDijadwalUlang
          ? {
              backgroundColor: jenisInfo.bg,
              borderLeftColor: jenisInfo.border,
              color: jenisInfo.ink,
            }
          : undefined
      }
      {...props}
    >
      {/* Row 1: Time + Status icon */}
      <div className="flex items-center justify-between font-mono text-[10px] leading-tight opacity-90">
        <span>{`${jamMulai}–${jamSelesai}`}</span>
        {renderStatusGlyph()}
      </div>

      {/* Row 2: Title */}
      <div
        className={cn(
          "font-semibold text-[12px] truncate mt-0.5",
          isBatal && "line-through opacity-75"
        )}
      >
        {judul}
      </div>

      {/* Row 3: Meta details */}
      {!compact && metaText && (
        <div className="text-[11px] truncate opacity-85 mt-0.5">
          {metaText}
        </div>
      )}
    </div>
  );
};

export interface MoreEventsGroupProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  count: number;
}

export const MoreEventsGroup: React.FC<MoreEventsGroupProps> = ({ count, className, ...props }) => {
  return (
    <button
      type="button"
      className={cn(
        "w-full h-[22px] px-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-alt)]",
        "text-[11px] font-medium text-[var(--color-brand)] hover:bg-[var(--color-brand-subtle)] hover:border-[var(--color-brand)]",
        "transition-colors flex items-center justify-center cursor-pointer select-none",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] focus-visible:outline-offset-1",
        className
      )}
      {...props}
    >
      +{count} lainnya
    </button>
  );
};

