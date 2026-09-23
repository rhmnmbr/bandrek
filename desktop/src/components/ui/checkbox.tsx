import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "checked" | "onChange"> {
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      id,
      checked,
      defaultChecked,
      onCheckedChange,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    const generatedId = React.useId();
    const checkboxId = id || (label ? generatedId : undefined);

    const isIndeterminate = checked === "indeterminate";
    const isControlled = checked !== undefined;

    // Keep forwardRef and innerRef in sync
    const setRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [ref]
    );

    // Sync indeterminate property to the native DOM element
    React.useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = isIndeterminate;
      }
    }, [isIndeterminate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    const inputNode = (
      <input
        ref={setRef}
        type="checkbox"
        id={checkboxId}
        disabled={disabled}
        checked={isControlled ? checked === true : undefined}
        defaultChecked={defaultChecked}
        onChange={handleChange}
        className={cn(
          "w-[14px] h-[14px] accent-[var(--color-brand)] cursor-pointer m-0 flex-none",
          "disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );

    if (!label) {
      return inputNode;
    }

    return (
      <div className="inline-flex items-center gap-2">
        {inputNode}
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
  }
);
Checkbox.displayName = "Checkbox";
