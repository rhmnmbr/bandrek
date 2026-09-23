import * as React from "react";
import { Warning16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/utils";

export interface ErrorSummaryItem {
  id?: string;
  field?: string;
  message: string;
  onFocusField?: () => void;
}

export interface ErrorSummaryProps {
  errors: ErrorSummaryItem[];
  title?: string;
  className?: string;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({
  errors,
  title,
  className,
}) => {
  if (!errors || errors.length === 0) return null;

  const displayTitle =
    title ||
    `${errors.length} isian perlu diperbaiki sebelum disimpan`;

  return (
    <div
      role="alert"
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-danger)] bg-[var(--color-danger-bg)] p-2.5 text-[12.5px] leading-relaxed text-[var(--color-danger-ink)]",
        className
      )}
    >
      <div className="flex items-center gap-1.5 font-semibold">
        <Warning16Regular className="flex-none" />
        <span>{displayTitle}</span>
      </div>

      <ul className="mt-1.5 list-disc pl-7 space-y-1 text-[12px]">
        {errors.map((item, idx) => (
          <li key={item.id || idx}>
            {item.onFocusField ? (
              <button
                type="button"
                onClick={item.onFocusField}
                className="text-left font-medium underline hover:no-underline cursor-pointer text-[var(--color-danger-ink)]"
              >
                {item.field ? `${item.field} — ` : ""}
                {item.message}
              </button>
            ) : (
              <span>
                {item.field && <strong>{item.field} — </strong>}
                {item.message}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

