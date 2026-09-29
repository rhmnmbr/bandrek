import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Warning16Regular, Info16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-(--scrim) transition-opacity duration-(--dur-slow) animate-in fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-122 rounded-xl bg-white border border-(--color-border-strong) p-0 shadow-(--shadow-overlay) duration-(--dur-slow) animate-in fade-in-0 zoom-in-95 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string; // Must be a question e.g. "Nonaktifkan siswa ini?"
  consequence: string; // Explains what will happen
  summaryObject?: {
    title: string;
    details?: string;
  };
  impactCard?: {
    type?: "warning" | "info" | "neutral";
    text: React.ReactNode;
  };
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  onConfirm: () => void;
  children?: React.ReactNode; // e.g. optional reason dropdown
  width?: "normal" | "wide";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  consequence,
  summaryObject,
  impactCard,
  confirmLabel,
  cancelLabel = "Tutup",
  confirmVariant = "primary",
  onConfirm,
  children,
  width = "normal",
}) => {
  const cancelBtnRef = React.useRef<HTMLButtonElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          width === "wide" ? "max-w-186" : "max-w-122"
        )}
        onOpenAutoFocus={(e) => {
          // Focus safe button initially per DESIGN.md §3.9
          e.preventDefault();
          cancelBtnRef.current?.focus();
        }}
      >
        <div className="p-4 pb-0">
          <DialogPrimitive.Title className="text-[15px] font-semibold leading-snug text-(--color-text)">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-[12.5px] leading-relaxed text-(--color-text-secondary) mt-1">
            {consequence}
          </DialogPrimitive.Description>
        </div>

        {summaryObject && (
          <div className="mx-4 my-3 p-2.5 rounded-lg border border-(--color-border) bg-(--color-surface-alt) text-[12.5px] leading-snug">
            <div className="font-semibold text-(--color-text)">{summaryObject.title}</div>
            {summaryObject.details && (
              <div className="text-(--color-text-muted) mt-0.5 text-[12px]">
                {summaryObject.details}
              </div>
            )}
          </div>
        )}

        {impactCard && (
          <div
            className={cn(
              "mx-4 my-2.5 p-2.5 rounded-lg border text-[12px] leading-snug flex gap-2 items-start",
              impactCard.type === "warning"
                ? "border-(--color-warning) bg-(--color-warning-bg) text-(--color-warning-ink)"
                : impactCard.type === "info"
                ? "border-(--color-info) bg-(--color-info-bg) text-(--color-info-ink)"
                : "border-(--color-border) bg-white text-(--color-text-secondary)"
            )}
          >
            {impactCard.type === "warning" ? (
              <Warning16Regular className="flex-none text-(--color-warning-ink) mt-0.5" />
            ) : (
              <Info16Regular className="flex-none text-(--color-info-ink) mt-0.5" />
            )}
            <div className="flex-1">{impactCard.text}</div>
          </div>
        )}

        {children && <div className="px-4 py-2">{children}</div>}

        <div className="px-4 pb-4 pt-3 flex items-center justify-end gap-2 border-t border-(--color-border-subtle) mt-2">
          <Button
            ref={cancelBtnRef}
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>

          <Button
            variant={confirmVariant}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

