import * as React from "react";
import { Checkmark12Regular, Warning12Regular, ArrowClockwise12Regular } from "@fluentui/react-icons";
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
        return <Checkmark12Regular className="text-(--color-success-ink)" />;
      case "belum":
        return <Warning12Regular className="text-(--color-warning-ink)" />;
      case "dijadwal-ulang":
        return <ArrowClockwise12Regular className="text-[#5B4394]" />;
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
        "rounded-[3px] text-left transition-all duration-(--dur-fast) cursor-pointer select-none overflow-hidden",
        "p-1.5 leading-[1.3] text-[12px]",
        // Status border & background overrides
        isBatal
          ? "border border-(--color-border) bg-(--color-canvas) text-(--color-text-muted)"
          : isBelum
          ? "border border-(--color-warning) border-l-4 border-l-(--color-warning) bg-(--color-warning-bg) text-(--color-warning-ink) shadow-(--shadow-raised)"
          : isDijadwalUlang
          ? "border border-dashed border-[#8764B8] border-l-4 border-l-solid border-l-[#8764B8] bg-[#F3EFFA] text-[#5B4394] shadow-(--shadow-raised)"
          : "border-l-4 shadow-(--shadow-raised)",
        selected && "shadow-[inset_0_0_0_2px_#000000]",
        "focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_#000000]",
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
        "w-full h-5.5 px-2 rounded-sm border border-(--color-border) bg-(--color-surface-alt)",
        "text-[11px] font-medium text-(--color-brand) hover:bg-(--color-brand-subtle) hover:border-(--color-brand)",
        "transition-colors flex items-center justify-center cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:border-black focus-visible:shadow-[inset_0_0_0_1px_#000000]",
        className
      )}
      {...props}
    >
      +{count} lainnya
    </button>
  );
};

