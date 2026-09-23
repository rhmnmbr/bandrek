import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] text-[12px] font-medium transition-[background-color,transform] duration-[var(--dur-fast)] cursor-pointer select-none disabled:pointer-events-none disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-brand)] text-white font-semibold hover:bg-[var(--color-brand-pressed)] active:bg-[var(--color-brand-pressed)] active:translate-y-[1px] disabled:bg-[#EDEBE9] disabled:text-[#8A8886]",
        secondary:
          "bg-[var(--color-surface)] border border-[var(--color-border-strong)] text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] active:bg-[var(--color-surface-sunken)] disabled:text-[#8A8886] disabled:border-[var(--color-border-subtle)]",
        ghost:
          "bg-transparent text-[var(--color-brand)] hover:bg-[var(--color-brand-subtle)] active:bg-[#DCE9F9] disabled:text-[#8A8886]",
        danger:
          "bg-[var(--color-surface)] border border-[var(--color-danger)] text-[var(--color-danger-ink)] hover:bg-[var(--color-danger-bg)] active:bg-[#FAD3D7] disabled:text-[#8A8886] disabled:border-[var(--color-border-subtle)]",
      },
      size: {
        compact: "h-[26px] px-2.5 text-[12px]",
        comfortable: "h-[32px] px-3.5 text-[13.5px]",
        icon: "h-[26px] w-[26px] p-0",
        "icon-comfortable": "h-[32px] w-[32px] p-0",
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
          <span className="inline-block animate-spin mr-1.5 text-[11px] leading-none select-none">
            ◌
          </span>
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
