import * as React from "react";
import { cn } from "@/lib/utils";
import { PlugDisconnected16Regular, Warning16Regular } from "@fluentui/react-icons";

export type OfflineBannerVariant =
  | "dark-charcoal" // Proposal 1: OS/System-level dark charcoal (recommended)
  | "danger-subtle" // Proposal 2: Danger-subtle (Principle 4: Errors/blocks are red)
  | "surface-sunken" // Proposal 3: Muted surface sunken with locked icon
  | "warning"; // Legacy/prototype warning (for comparison)

export interface OfflineBannerProps {
  cachedAt?: string; // Timestamp per DOMAIN.md §13, e.g. "16 Sep 2026, 11:45"
  onRetry?: () => void;
  isRetrying?: boolean;
  variant?: OfflineBannerVariant;
  className?: string;
}

const formatCachedAt = (rawDate?: string): string => {
  if (!rawDate) return "16 Sep 2026, 11:45";
  if (rawDate.includes(',') && !rawDate.includes('T')) return rawDate;
  const d = new Date(rawDate);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return rawDate;
};

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  cachedAt = "16 Sep 2026, 11:45",
  onRetry,
  isRetrying = false,
  variant = "warning",
  className,
}) => {
  const formattedCachedAt = React.useMemo(() => formatCachedAt(cachedAt), [cachedAt]);

  const getVariantStyles = (): {
    container: string;
    icon: React.ReactNode;
    badge: string;
    btn: string;
  } => {
    switch (variant) {
      case "danger-subtle":
        return {
          container:
            "bg-(--color-danger-bg) border-b border-(--color-danger) text-(--color-danger-ink)",
          icon: <Warning16Regular className="text-(--color-danger-ink) flex-none" />,
          badge: "bg-(--color-danger) text-white",
          btn: "border-(--color-danger) text-(--color-danger-ink) bg-white hover:bg-(--color-danger-bg)",
        };
      case "surface-sunken":
        return {
          container:
            "bg-(--color-surface-sunken) border-b border-(--color-border-strong) text-(--color-text)",
          icon: <PlugDisconnected16Regular className="text-(--color-text-secondary) flex-none" />,
          badge: "bg-(--color-border-strong) text-(--color-text)",
          btn: "border-(--color-border-strong) text-(--color-text) bg-white hover:bg-(--color-surface-alt)",
        };
      case "warning":
        return {
          container:
            "bg-(--color-warning-bg) border-b border-(--color-warning) text-(--color-warning-ink)",
          icon: <PlugDisconnected16Regular className="text-(--color-warning-ink) flex-none" />,
          badge: "bg-(--color-warning) text-white",
          btn: "border-(--color-warning-ink) text-(--color-warning-ink) bg-white hover:bg-(--color-warning-bg)",
        };
      case "dark-charcoal":
      default:
        return {
          container:
            "bg-[#242424] border-b border-[#3B3A39] text-[#F3F2F1]",
          icon: <PlugDisconnected16Regular className="text-[#F3F2F1] flex-none" />,
          badge: "bg-[#3B3A39] text-[#F3F2F1]",
          btn: "border-[#484644] text-[#F3F2F1] bg-[#2D2C2B] hover:bg-[#3B3A39]",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      role="status"
      className={cn(
        "sticky top-0 z-50 w-full px-3.5 py-1 min-h-7.5 flex items-center justify-between text-[12px] select-none transition-colors duration-(--dur-fast)",
        styles.container,
        className
      )}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex-none flex items-center justify-center">
          {styles.icon}
        </span>
        <span className={cn("px-1.5 py-0.5 rounded-sm text-[10.5px] font-semibold uppercase tracking-wider", styles.badge)}>
          Mode Baca
        </span>
        <span className="leading-snug">
          <strong>Sambungan ke server terputus.</strong> Menampilkan data dari cache lokal (dimuat:{" "}
          <span className="font-mono font-medium">{formattedCachedAt}</span>). Semua aksi tulis dinonaktifkan.
        </span>
      </div>

      {onRetry && (
        <button
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
          className={cn(
            "h-6 px-2.5 rounded border text-[11px] font-medium cursor-pointer select-none transition-colors disabled:opacity-50 ml-3 flex-none shadow-2xs",
            styles.btn
          )}
        >
          {isRetrying ? "Menyambung..." : "Coba sambung lagi"}
        </button>
      )}
    </div>
  );
};
