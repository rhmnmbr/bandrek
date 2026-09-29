import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ChevronDown12Regular, Checkmark12Regular, Add12Regular } from "@fluentui/react-icons";
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
          "inline-flex items-center gap-1.5 h-6 rounded-full border text-[11.5px] whitespace-nowrap select-none transition-colors",
          onRemove ? "pl-2.5 pr-1" : "px-2.5",
          "focus-visible:outline-none focus-visible:border-(--color-focus-ring) focus-visible:shadow-[inset_0_0_0_1px_var(--color-focus-ring)]",
          isPrimary
            ? "border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand-ink) font-medium"
            : "border-(--color-border-strong) bg-white text-(--color-text-secondary)",
          disabled && "opacity-60 pointer-events-none",
          className
        )}
      >
        <span className="inline-flex items-center">
          <span>{nama}</span>
          {peran && (
            <>
              <span className="mx-1 opacity-50">·</span>
              {onPeranChange ? (
                <PopoverPrimitive.Trigger asChild>
                  <button
                    type="button"
                    disabled={disabled}
                    className="hover:underline cursor-pointer font-normal inline-flex items-center gap-0.5 focus:outline-none"
                    title="Ganti peran subjek"
                  >
                    <span>{peran}</span>
                    <ChevronDown12Regular className="w-2.5 h-2.5 opacity-70 flex-none" />
                  </button>
                </PopoverPrimitive.Trigger>
              ) : (
                <span className="font-normal opacity-90">{peran}</span>
              )}
            </>
          )}
        </span>

        {onRemove && (
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-4 h-4 -ml-1 flex-none rounded-full cursor-pointer text-inherit flex items-center justify-center transition-colors hover:bg-(--color-surface-sunken) hover:text-(--color-text) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--color-focus-ring)"
            title={`Keluarkan ${nama}`}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              className="w-2.5 h-2.5 flex-none"
              aria-hidden="true"
            >
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        )}
      </span>

      {onPeranChange && (
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-50 w-36 rounded-md border border-(--color-border) bg-white p-1 text-[12px] shadow-(--shadow-overlay) animate-in fade-in-0 zoom-in-95"
          >
            <div className="px-2 py-1 text-[10.5px] font-semibold text-(--color-text-muted) uppercase tracking-wider">
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
                  "w-full text-left px-2 py-1.5 rounded-sm flex items-center justify-between cursor-pointer",
                  p === peran
                    ? "bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold"
                    : "hover:bg-(--color-surface-alt) text-(--color-text)"
                )}
              >
                <span>{p}</span>
                {p === peran && <Checkmark12Regular className="text-(--color-brand) flex-none" />}
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
        "inline-flex items-center gap-1 h-6 px-2 rounded-full border border-dashed border-[#8A8886] bg-transparent text-[11.5px] text-(--color-text-secondary) hover:bg-(--color-surface-alt) hover:border-(--color-text) cursor-pointer select-none transition-colors",
        "focus-visible:outline-none focus-visible:border-solid focus-visible:border-(--color-focus-ring) focus-visible:shadow-[inset_0_0_0_1px_var(--color-focus-ring)]",
        className
      )}
      {...props}
    >
      <Add12Regular className="flex-none" />
      <span>tambah</span>
    </button>
  );
};

