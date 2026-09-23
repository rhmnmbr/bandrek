import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  shortcut?: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value?: T | null;
  onChange: (value: T) => void;
  error?: boolean;
  disabled?: boolean;
  size?: "compact" | "attendance";
  className?: string;
  onKeyDownNextRow?: () => void;
  onKeyDownPrevRow?: () => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  error = false,
  disabled = false,
  size = "compact",
  className,
  onKeyDownNextRow,
  onKeyDownPrevRow,
}: SegmentedControlProps<T>) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const currentIndex = options.findIndex((opt) => opt.value === value);
      const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
      onChange(options[nextIndex].value);
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const currentIndex = options.findIndex((opt) => opt.value === value);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
      onChange(options[prevIndex].value);
      return;
    }

    if (e.key === "ArrowDown" && onKeyDownNextRow) {
      e.preventDefault();
      onKeyDownNextRow();
      return;
    }

    if (e.key === "ArrowUp" && onKeyDownPrevRow) {
      e.preventDefault();
      onKeyDownPrevRow();
      return;
    }

    // Check letter shortcut (case-insensitive)
    const keyChar = e.key.toUpperCase();
    const match = options.find(
      (opt) => opt.shortcut?.toUpperCase() === keyChar || opt.label[0].toUpperCase() === keyChar
    );
    if (match) {
      e.preventDefault();
      onChange(match.value);
    }
  };

  const heightClass = size === "attendance" ? "h-[34px]" : "h-[26px]";

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex rounded-[var(--radius-md)] overflow-hidden select-none transition-colors border",
        heightClass,
        "focus-visible:outline-none focus-visible:border-[var(--color-focus-ring)] focus-visible:shadow-[inset_0_0_0_1px_var(--color-focus-ring)]",
        error
          ? "border-[var(--color-danger)] bg-[var(--color-danger-bg)]"
          : "border-[var(--color-border-strong)] bg-white hover:border-[#8A8886]",
        disabled && "opacity-50 pointer-events-none bg-[var(--color-surface-sunken)]",
        className
      )}
    >
      {options.map((opt, idx) => {
        const isSelected = value === opt.value;
        return (
          <button
            type="button"
            key={opt.value}
            role="radio"
            aria-checked={isSelected}
            tabIndex={-1}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 px-3 flex items-center justify-center text-[12px] font-medium leading-none cursor-pointer transition-colors duration-[var(--dur-fast)] whitespace-nowrap",
              idx > 0 &&
                (error
                  ? "border-l border-[var(--color-danger-subtle, #F3C6CA)]"
                  : "border-l border-[var(--color-border-subtle)]"),
              isSelected
                ? "bg-[var(--color-brand)] text-white font-semibold"
                : error
                ? "text-[var(--color-danger-ink)] hover:bg-[#FAD3D7]"
                : "text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export type KehadiranValue = "hadir" | "izin" | "sakit" | "alpa";

export const KehadiranSegmentedControl: React.FC<{
  value?: KehadiranValue | null;
  onChange: (val: KehadiranValue) => void;
  error?: boolean;
  disabled?: boolean;
  size?: "compact" | "attendance";
  className?: string;
  onKeyDownNextRow?: () => void;
  onKeyDownPrevRow?: () => void;
}> = (props) => {
  const options: SegmentedOption<KehadiranValue>[] = [
    { value: "hadir", label: "Hadir", shortcut: "H" },
    { value: "izin", label: "Izin", shortcut: "I" },
    { value: "sakit", label: "Sakit", shortcut: "S" },
    { value: "alpa", label: "Alpa", shortcut: "A" },
  ];
  return <SegmentedControl options={options} {...props} />;
};

export type KetuntasanValue = "tuntas" | "sebagian" | "tidak";

export const KetuntasanSegmentedControl: React.FC<{
  value?: KetuntasanValue | null;
  onChange: (val: KetuntasanValue) => void;
  error?: boolean;
  disabled?: boolean;
  size?: "compact";
  className?: string;
}> = (props) => {
  const options: SegmentedOption<KetuntasanValue>[] = [
    { value: "tuntas", label: "Tuntas", shortcut: "T" },
    { value: "sebagian", label: "Sebagian", shortcut: "S" },
    { value: "tidak", label: "Tidak", shortcut: "B" },
  ];
  return <SegmentedControl options={options} {...props} />;
};

