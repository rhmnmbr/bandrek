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
          return "bg-(--color-success-bg) text-(--color-success-ink) border-r border-b border-(--color-border-subtle)";
        case "sakit":
          return "bg-(--color-warning-bg) text-(--color-warning-ink) shadow-[inset_0_0_0_1px_var(--color-warning)] border-r border-b border-(--color-border-subtle)";
        case "izin":
          return "bg-(--color-info-bg) text-(--color-info-ink) shadow-[inset_0_0_0_1px_var(--color-info)] border-r border-b border-(--color-border-subtle)";
        case "alpa":
          return "bg-(--color-danger-bg) text-(--color-danger-ink) shadow-[inset_0_0_0_1px_var(--color-danger)] border-r border-b border-(--color-border-subtle)";
        case "batal":
          return "bg-(--color-canvas) text-(--color-text-muted) border-r border-b border-(--color-border-subtle)";
        case "terjadwal":
          return "bg-(--color-brand-subtle) text-(--color-brand-ink) border-r border-b border-(--color-border-subtle)";
        case "kosong":
        default:
          return "bg-white text-(--color-icon-faint) border-r border-b border-(--color-border-subtle) hover:bg-(--color-surface-alt)";
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex items-center justify-center font-mono select-none cursor-pointer transition-colors duration-(--dur-instant)",
          "w-7 h-7 text-[12px]",
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

