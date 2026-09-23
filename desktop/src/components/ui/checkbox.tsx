import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, id, disabled, ...props }, ref) => {
  const generatedId = React.useId();
  const checkboxId = id || (label ? generatedId : undefined);

  const checkboxNode = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={checkboxId}
      disabled={disabled}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-[var(--radius-sm)] border transition-colors duration-[var(--dur-fast)] cursor-pointer select-none",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:bg-[var(--color-surface-sunken)] disabled:border-[var(--color-border-subtle)]",
        "data-[state=unchecked]:bg-[var(--color-surface)] data-[state=unchecked]:border-[var(--color-border-strong)] data-[state=unchecked]:hover:border-[#8A8886]",
        "data-[state=checked]:bg-[var(--color-brand)] data-[state=checked]:border-[var(--color-brand)] data-[state=checked]:text-white",
        "data-[state=indeterminate]:bg-[var(--color-brand)] data-[state=indeterminate]:border-[var(--color-brand)] data-[state=indeterminate]:text-white",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <span className="text-[12px] font-bold leading-none select-none">✓</span>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (!label) {
    return checkboxNode;
  }

  return (
    <div className="inline-flex items-center gap-2">
      {checkboxNode}
      <label
        htmlFor={checkboxId}
        className={cn(
          "text-[12.5px] select-none cursor-pointer leading-none",
          disabled ? "text-[var(--color-text-muted)] cursor-not-allowed" : "text-[var(--color-text)]"
        )}
      >
        {label}
      </label>
    </div>
  );
});
Checkbox.displayName = "Checkbox";

