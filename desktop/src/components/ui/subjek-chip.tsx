import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

export type SubjekPeran = "Pengisi" | "Support" | "Pendamping" | string;

export interface SubjekChipProps {
  nama: string;
  peran?: SubjekPeran;
  isPrimary?: boolean;
  onRemove?: () => void;
  onPeranChange?: (peran: SubjekPeran) => void;
  availablePeran?: string[];
  disabled?: boolean;
  className?: string;
}

export const SubjekChip: React.FC<SubjekChipProps> = ({
  nama,
  peran = "Pengisi",
  isPrimary = true,
  onRemove,
  onPeranChange,
  availablePeran = ["Pengisi", "Support", "Pendamping"],
  disabled = false,
  className,
}) => {
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  return (
    <PopoverPrimitive.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
      <span
        tabIndex={disabled ? -1 : 0}
        className={cn(
          "inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-full border text-[11.5px] whitespace-nowrap select-none transition-colors",
          "focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] focus-visible:outline-offset-2",
          isPrimary
            ? "border-[var(--color-brand)] bg-[var(--color-brand-subtle)] text-[var(--color-brand-ink)] font-medium"
            : "border-[var(--color-border-strong)] bg-white text-[var(--color-text-secondary)]",
          disabled && "opacity-60 pointer-events-none",
          className
        )}
      >
        <span>{nama}</span>
        {peran && (
          <>
            <span className="opacity-50">·</span>
            {onPeranChange ? (
              <PopoverPrimitive.Trigger asChild>
                <button
                  type="button"
                  disabled={disabled}
                  className="hover:underline cursor-pointer font-normal flex items-center gap-0.5 focus:outline-none"
                  title="Ganti peran subjek"
                >
                  <span>{peran}</span>
                  <span className="text-[9px] opacity-70">▾</span>
                </button>
              </PopoverPrimitive.Trigger>
            ) : (
              <span className="font-normal opacity-90">{peran}</span>
            )}
          </>
        )}

        {onRemove && (
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] ml-0.5 p-0.5 cursor-pointer leading-none"
            title={`Hapus ${nama}`}
          >
            ✕
          </button>
        )}
      </span>

      {onPeranChange && (
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-50 w-36 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-1 text-[12px] shadow-[var(--shadow-overlay)] animate-in fade-in-0 zoom-in-95"
          >
            <div className="px-2 py-1 text-[10.5px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Pilih Peran
            </div>
            {availablePeran.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => {
                  onPeranChange(p);
                  setPopoverOpen(false);
                }}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded-[var(--radius-sm)] flex items-center justify-between cursor-pointer",
                  p === peran
                    ? "bg-[var(--color-brand-subtle)] text-[var(--color-brand-ink)] font-semibold"
                    : "hover:bg-[var(--color-surface-alt)] text-[var(--color-text)]"
                )}
              >
                <span>{p}</span>
                {p === peran && <span className="font-bold text-[11px]">✓</span>}
              </button>
            ))}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      )}
    </PopoverPrimitive.Root>
  );
};

export interface AddSubjekButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const AddSubjekButton: React.FC<AddSubjekButtonProps> = ({ className, ...props }) => {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1 h-[24px] px-2.5 rounded-full border border-dashed border-[#8A8886] bg-transparent text-[11.5px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:border-[var(--color-text)] cursor-pointer select-none transition-colors",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] focus-visible:outline-offset-2",
        className
      )}
      {...props}
    >
      <span>+ tambah</span>
    </button>
  );
};

