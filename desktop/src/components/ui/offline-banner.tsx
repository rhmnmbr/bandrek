import * as React from "react";
import { cn } from "@/lib/utils";

export interface OfflineBannerProps {
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  onRetry,
  isRetrying = false,
  className,
}) => {
  return (
    <div
      role="status"
      className={cn(
        "w-full bg-[var(--color-warning-bg)] border-b border-[var(--color-warning)] text-[var(--color-warning-ink)] px-4 py-1.5 flex items-center justify-between text-[12px] select-none",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-bold text-[13px] leading-none">⚠</span>
        <span>
          <strong>Mode baca (offline)</strong> — Sambungan ke server terputus. Data ditampilkan dari cache lokal. Perubahan hanya bisa dilakukan saat online.
        </span>
      </div>

      {onRetry && (
        <button
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
          className="h-[22px] px-2.5 rounded-[var(--radius-sm)] border border-[var(--color-warning-ink)] bg-white text-[11px] font-medium text-[var(--color-warning-ink)] hover:bg-[var(--color-warning-bg)] cursor-pointer select-none transition-colors disabled:opacity-50"
        >
          {isRetrying ? "Menyambung..." : "Coba sambung lagi"}
        </button>
      )}
    </div>
  );
};

