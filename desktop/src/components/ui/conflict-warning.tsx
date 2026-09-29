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
        "rounded-lg border border-(--color-warning) bg-(--color-warning-bg) p-2.5 text-[12.5px] leading-relaxed text-(--color-warning-ink)",
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
            className="h-6 px-2.5 rounded-md border border-(--color-warning-ink) bg-white text-[11.5px] font-medium text-(--color-warning-ink) hover:bg-(--color-warning-bg) cursor-pointer select-none transition-colors"
          >
            {actionLabels.highlight}
          </button>
        )}

        {onChangeRoomOrSubject && (
          <button
            type="button"
            onClick={onChangeRoomOrSubject}
            className="h-6 px-2.5 rounded-md border border-(--color-warning-ink) bg-white text-[11.5px] font-medium text-(--color-warning-ink) hover:bg-(--color-warning-bg) cursor-pointer select-none transition-colors"
          >
            {actionLabels.change}
          </button>
        )}

        {onProceedAnyway && (
          <button
            type="button"
            onClick={onProceedAnyway}
            className="h-6 px-2 text-[11.5px] text-(--color-warning-ink) underline hover:no-underline cursor-pointer select-none"
          >
            {actionLabels.proceed}
          </button>
        )}
      </div>
    </div>
  );
};

