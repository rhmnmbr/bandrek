import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const FluentProgressRing: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn("animate-spin flex-none", className)}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="8"
      cy="8"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
      className="opacity-25"
    />
    <path
      d="M14 8a6 6 0 0 0-6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] text-[12px] font-medium transition-[background-color,border-color,box-shadow] duration-[var(--dur-fast)] cursor-pointer select-none disabled:pointer-events-none disabled:cursor-not-allowed focus-visible:outline-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-brand)] border border-[var(--color-brand)] text-white font-semibold hover:bg-[var(--color-brand-pressed)] active:bg-[var(--color-brand-pressed)] disabled:bg-[#EDEBE9] disabled:text-[#8A8886] disabled:border-transparent focus-visible:border-black focus-visible:shadow-[inset_0_0_0_1px_#000000,inset_0_0_0_2px_#ffffff]",
        secondary:
          "bg-[var(--color-surface)] border border-[var(--color-border-strong)] text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] active:bg-[var(--color-surface-sunken)] disabled:text-[#8A8886] disabled:border-[var(--color-border-subtle)] focus-visible:border-black focus-visible:shadow-[inset_0_0_0_1px_#000000]",
        ghost:
          "bg-transparent border border-transparent text-[var(--color-brand)] hover:bg-[var(--color-brand-subtle)] active:bg-[#DCE9F9] disabled:text-[#8A8886] focus-visible:border-black focus-visible:shadow-[inset_0_0_0_1px_#000000]",
        danger:
          "bg-[var(--color-surface)] border border-[var(--color-danger)] text-[var(--color-danger-ink)] hover:bg-[var(--color-danger-bg)] active:bg-[#FAD3D7] disabled:text-[#8A8886] disabled:border-[var(--color-border-subtle)] focus-visible:border-black focus-visible:shadow-[inset_0_0_0_1px_#000000] focus-visible:bg-[var(--color-danger-bg)]",
      },
      size: {
        compact: "h-[26px] px-2.5 text-[12px]",
        icon: "h-[26px] w-[26px] p-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "compact",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <FluentProgressRing className="w-3 h-3 mr-1.5" />
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants, FluentProgressRing };
