import * as React from "react";
import { Warning16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/utils";

export interface ConflictWarningProps {
  title: string;
  evidence: string;
  onHighlightInCalendar?: () => void;
  onChangeRoomOrSubject?: () => void;
  onProceedAnyway?: () => void;
  actionLabels?: {
    highlight?: string;
    change?: string;
    proceed?: string;
  };
  className?: string;
}

export const ConflictWarning: React.FC<ConflictWarningProps> = ({
  title,
  evidence,
  onHighlightInCalendar,
  onChangeRoomOrSubject,
  onProceedAnyway,
  actionLabels = {
    highlight: "Lihat di kalender",
    change: "Pilih ruangan lain",
    proceed: "Simpan tetap",
  },
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-warning)] bg-[var(--color-warning-bg)] p-2.5 text-[12.5px] leading-relaxed text-[var(--color-warning-ink)]",
        className
      )}
    >
      <div className="flex items-start gap-1.5 font-semibold">
        <Warning16Regular className="flex-none mt-0.5" />
        <span>{title}</span>
      </div>

      <div className="mt-1 text-[12px] opacity-95 pl-5">
        {evidence}
      </div>

      <div className="mt-2.5 flex items-center gap-2 pl-5 flex-wrap">
        {onHighlightInCalendar && (
          <button
            type="button"
            onClick={onHighlightInCalendar}
            className="h-[24px] px-2.5 rounded-[var(--radius-md)] border border-[var(--color-warning-ink)] bg-white text-[11.5px] font-medium text-[var(--color-warning-ink)] hover:bg-[var(--color-warning-bg)] cursor-pointer select-none transition-colors"
          >
            {actionLabels.highlight}
          </button>
        )}

        {onChangeRoomOrSubject && (
          <button
            type="button"
            onClick={onChangeRoomOrSubject}
            className="h-[24px] px-2.5 rounded-[var(--radius-md)] border border-[var(--color-warning-ink)] bg-white text-[11.5px] font-medium text-[var(--color-warning-ink)] hover:bg-[var(--color-warning-bg)] cursor-pointer select-none transition-colors"
          >
            {actionLabels.change}
          </button>
        )}

        {onProceedAnyway && (
          <button
            type="button"
            onClick={onProceedAnyway}
            className="h-[24px] px-2 text-[11.5px] text-[var(--color-warning-ink)] underline hover:no-underline cursor-pointer select-none"
          >
            {actionLabels.proceed}
          </button>
        )}
      </div>
    </div>
  );
};

