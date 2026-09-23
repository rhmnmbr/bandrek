import * as React from "react";
import {
  Checkmark16Regular,
  CircleHalfFill16Regular,
  Mail16Regular,
  Dismiss16Regular,
  Circle12Filled,
} from "@fluentui/react-icons";
import { cn } from "@/lib/utils";

export type MatrixCellState =
  | "tersampaikan"
  | "sakit"
  | "izin"
  | "alpa"
  | "batal"
  | "terjadwal"
  | "kosong";

export interface MatrixCellProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  state: MatrixCellState;
  size?: "compact";
  count?: number; // Optional number of activities or count
}

export const MatrixCell = React.forwardRef<HTMLButtonElement, MatrixCellProps>(
  ({ state, size = "compact", count, className, ...props }, ref) => {

    const renderContent = () => {
      switch (state) {
        case "tersampaikan":
          return <Checkmark16Regular className="text-current" />;
        case "sakit":
          return <CircleHalfFill16Regular className="text-current" />;
        case "izin":
          return <Mail16Regular className="text-current" />;
        case "alpa":
          return <Dismiss16Regular className="text-current" />;
        case "batal":
          return <Dismiss16Regular className="text-current opacity-60" />;
        case "terjadwal":
          return <Circle12Filled className="text-current text-[10px]" />;
        case "kosong":
        default:
          return <span className="text-[14px] leading-none opacity-60">·</span>;
      }
    };

    const getStateClasses = () => {
      switch (state) {
        case "tersampaikan":
          return "bg-[var(--color-success-bg)] text-[var(--color-success-ink)] border-r border-b border-[var(--color-border-subtle)]";
        case "sakit":
          return "bg-[var(--color-warning-bg)] text-[var(--color-warning-ink)] shadow-[inset_0_0_0_1px_var(--color-warning)] border-r border-b border-[var(--color-border-subtle)]";
        case "izin":
          return "bg-[var(--color-info-bg)] text-[var(--color-info-ink)] shadow-[inset_0_0_0_1px_var(--color-info)] border-r border-b border-[var(--color-border-subtle)]";
        case "alpa":
          return "bg-[var(--color-danger-bg)] text-[var(--color-danger-ink)] shadow-[inset_0_0_0_1px_var(--color-danger)] border-r border-b border-[var(--color-border-subtle)]";
        case "batal":
          return "bg-[var(--color-canvas)] text-[var(--color-text-muted)] border-r border-b border-[var(--color-border-subtle)]";
        case "terjadwal":
          return "bg-[var(--color-brand-subtle)] text-[var(--color-brand-ink)] border-r border-b border-[var(--color-border-subtle)]";
        case "kosong":
        default:
          return "bg-white text-[var(--color-icon-faint)] border-r border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-alt)]";
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex items-center justify-center font-mono select-none cursor-pointer transition-colors duration-[var(--dur-instant)]",
          "w-[28px] h-[28px] text-[12px]",
          "focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_#000000] focus-visible:z-10",
          getStateClasses(),
          className
        )}
        {...props}
      >
        {renderContent()}
      </button>
    );
  }
);
MatrixCell.displayName = "MatrixCell";

