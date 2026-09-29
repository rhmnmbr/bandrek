import * as React from "react";
import {
  CircleHalfFill16Regular,
  Mail16Regular,
  Dismiss16Regular,
  Circle12Filled,
} from "@fluentui/react-icons";
import { cn } from "@/lib/utils";

export type MatrixCellState =
  | "tersampaikan"
  | "selesai_manual"
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
  isSelected?: boolean;
}

export const MatrixCell = React.forwardRef<HTMLButtonElement, MatrixCellProps>(
  ({ state, size = "compact", count, isSelected, className, ...props }, ref) => {

    const renderContent = () => {
      switch (state) {
        case "tersampaikan":
          return <span className="font-semibold text-[12.5px] leading-none">✓</span>;
        case "selesai_manual":
          return <span className="font-semibold italic text-[12.5px] leading-none">✓</span>;
        case "sakit":
          return <CircleHalfFill16Regular className="text-current text-[11px]" />;
        case "izin":
          return <Mail16Regular className="text-current text-[11px]" />;
        case "alpa":
          return <Dismiss16Regular className="text-current text-[11px]" />;
        case "batal":
          return <Dismiss16Regular className="text-current opacity-60 text-[11px]" />;
        case "terjadwal":
          return <Circle12Filled className="text-current text-[10px]" />;
        case "kosong":
        default:
          return <span className="text-[12.5px] leading-none opacity-60">·</span>;
      }
    };

    const getStateClasses = () => {
      if (isSelected) {
        return "bg-[#EBF3FC] text-[#0C548F] outline-2 outline-[#0F6CBD] -outline-offset-2 z-10";
      }

      switch (state) {
        case "tersampaikan":
          return "bg-[#E8F5E9] text-[#2E7D32] border-r border-[#EDEBE9]";
        case "selesai_manual":
          return "bg-[#F2FAF3] text-[#2E7D32] shadow-[inset_0_0_0_1px_#9CCBA0] border-r border-[#EDEBE9]";
        case "sakit":
          return "bg-[#FFF3E0] text-[#8A5200] shadow-[inset_0_0_0_1px_#F0A82E] border-r border-[#EDEBE9]";
        case "izin":
          return "bg-[#EBF3FC] text-[#0C548F] shadow-[inset_0_0_0_1px_#0F6CBD] border-r border-[#EDEBE9]";
        case "alpa":
          return "bg-[#FDE7E9] text-[#9B0C18] shadow-[inset_0_0_0_1px_#C50F1F] border-r border-[#EDEBE9]";
        case "batal":
          return "bg-(--color-canvas) text-(--color-text-muted) border-r border-[#EDEBE9]";
        case "terjadwal":
          return "bg-[#FAFAFA] text-[#5C5A58] shadow-[inset_0_0_0_1px_#C8C6C4] border-r border-[#EDEBE9]";
        case "kosong":
        default:
          return "bg-transparent text-[#8A8886] border-r border-[#EDEBE9] hover:bg-[#FAFAFA]";
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

