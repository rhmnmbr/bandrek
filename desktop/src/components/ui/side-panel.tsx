import * as React from "react";
import { Dismiss16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/utils";

export interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  width?: string; // Default "498px"
}

export const SidePanel: React.FC<SidePanelProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className,
  width = "498px",
}) => {
  // Handle Esc key
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* Light scrim allowing calendar context behind it to be read */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#242424]/18 transition-opacity duration-[var(--dur-slow)] animate-in fade-in-0"
      />

      {/* Slide-in panel */}
      <aside
        style={{ width }}
        className={cn(
          "absolute right-0 top-0 bottom-0 bg-white border-l border-[var(--color-border-strong)] shadow-[var(--shadow-overlay)] z-50 flex flex-col overflow-hidden",
          "animate-in slide-in-from-right duration-[var(--dur-slow)] ease-[cubic-bezier(.16,1,.3,1)]",
          className
        )}
      >
        {/* Header */}
        <div className="h-[44px] flex-none border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] flex items-center gap-2 px-3.5">
          <div className="text-[15px] font-semibold text-[var(--color-text)] truncate">
            {title}
          </div>
          {subtitle && <div className="text-[12px]">{subtitle}</div>}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            title="Tutup (Esc)"
            className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            <Dismiss16Regular />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-3">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-none border-t border-[var(--color-border)] bg-white px-3.5 py-2.5">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
};

