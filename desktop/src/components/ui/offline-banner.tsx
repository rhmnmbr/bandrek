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

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  cachedAt = "16 Sep 2026, 11:45",
  onRetry,
  isRetrying = false,
  variant = "dark-charcoal",
  className,
}) => {
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
            "bg-[var(--color-danger-bg)] border-b border-[var(--color-danger)] text-[var(--color-danger-ink)]",
          icon: <Warning16Regular className="text-[var(--color-danger-ink)] flex-none" />,
          badge: "bg-[var(--color-danger)] text-white",
          btn: "border-[var(--color-danger)] text-[var(--color-danger-ink)] bg-white hover:bg-[var(--color-danger-bg)]",
        };
      case "surface-sunken":
        return {
          container:
            "bg-[var(--color-surface-sunken)] border-b border-[var(--color-border-strong)] text-[var(--color-text)]",
          icon: <PlugDisconnected16Regular className="text-[var(--color-text-secondary)] flex-none" />,
          badge: "bg-[var(--color-border-strong)] text-[var(--color-text)]",
          btn: "border-[var(--color-border-strong)] text-[var(--color-text)] bg-white hover:bg-[var(--color-surface-alt)]",
        };
      case "warning":
        return {
          container:
            "bg-[var(--color-warning-bg)] border-b border-[var(--color-warning)] text-[var(--color-warning-ink)]",
          icon: <Warning16Regular className="text-[var(--color-warning-ink)] flex-none" />,
          badge: "bg-[var(--color-warning)] text-white",
          btn: "border-[var(--color-warning-ink)] text-[var(--color-warning-ink)] bg-white hover:bg-[var(--color-warning-bg)]",
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
        "sticky top-0 z-50 w-full px-4 py-1.5 flex items-center justify-between text-[12px] select-none transition-colors duration-[var(--dur-fast)]",
        styles.container,
        className
      )}
    >
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="flex-none flex items-center justify-center">
          {styles.icon}
        </span>
        <span className={cn("px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[10.5px] font-semibold uppercase tracking-wider", styles.badge)}>
          Mode Baca
        </span>
        <span>
          <strong>Sambungan ke server terputus.</strong> Menampilkan data dari cache lokal (dimuat:{" "}
          <span className="font-mono font-medium">{cachedAt}</span>). Semua aksi tulis dinonaktifkan.
        </span>
      </div>

      {onRetry && (
        <button
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
          className={cn(
            "h-[22px] px-2.5 rounded-[var(--radius-sm)] border text-[11px] font-medium cursor-pointer select-none transition-colors disabled:opacity-50 ml-3 flex-none",
            styles.btn
          )}
        >
          {isRetrying ? "Menyambung..." : "Coba sambung lagi"}
        </button>
      )}
    </div>
  );
};
