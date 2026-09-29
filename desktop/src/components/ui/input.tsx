import * as React from "react";
import { Search12Regular, Dismiss12Regular, Warning12Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string;
  density?: "compact" | "comfortable";
  mono?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, density = "compact", mono = false, disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        disabled={disabled}
        ref={ref}
        className={cn(
          "w-full rounded-md bg-(--color-surface) text-(--color-text) transition-colors duration-(--dur-fast)",
          "placeholder:text-(--color-text-muted) focus:outline-none",
          density === "compact"
            ? "h-(--density-control-h) px-2 text-[12.5px]"
            : "h-8 px-3 text-[13.5px]",
          mono && "font-mono",
          // States
          error
            ? "border border-(--color-danger) shadow-[inset_0_-1px_0_0_var(--color-danger)]"
            : disabled
            ? "border border-(--color-border-subtle) bg-(--color-surface-sunken) text-(--color-text-muted) cursor-not-allowed"
            : "border border-(--color-border-strong) hover:border-[#8A8886] focus:border-(--color-brand) focus:shadow-[inset_0_-1px_0_0_var(--color-brand)]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface SearchInputProps extends Omit<InputProps, "type"> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value: propValue, defaultValue, onChange, onClear, density = "compact", ...props }, ref) => {
    const isControlled = propValue !== undefined;
    const [internalVal, setInternalVal] = React.useState<string>(
      (propValue ?? defaultValue ?? "") as string
    );

    const currentVal = isControlled ? (propValue as string) : internalVal;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalVal(e.target.value);
      }
      onChange?.(e);
    };

    const handleClear = () => {
      if (!isControlled) {
        setInternalVal("");
      }
      onClear?.();
    };

    const hasValue = Boolean(currentVal && String(currentVal).length > 0);

    return (
      <div className="relative flex items-center w-full">
        <span className="absolute left-2.5 text-(--color-text-muted) pointer-events-none select-none flex items-center justify-center">
          <Search12Regular />
        </span>
        <Input
          ref={ref}
          type="search"
          value={isControlled ? propValue : internalVal}
          onChange={handleChange}
          density={density}
          className={cn("pl-7 rounded-full", hasValue && onClear && "pr-7", className)}
          {...props}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 text-(--color-text-muted) hover:text-(--color-text) p-0.5 rounded-sm cursor-pointer flex items-center justify-center"
            title="Hapus pencarian"
          >
            <Dismiss12Regular />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean | string;
  mono?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, mono = false, disabled, ...props }, ref) => {
    return (
      <textarea
        disabled={disabled}
        ref={ref}
        className={cn(
          "w-full rounded-md bg-(--color-surface) text-(--color-text) p-2 text-[12.5px] transition-colors duration-(--dur-fast)",
          "placeholder:text-(--color-text-muted) focus:outline-none resize-y min-h-15",
          mono && "font-mono",
          error
            ? "border border-(--color-danger) border-b-2 border-b-(--color-danger)"
            : disabled
            ? "border border-(--color-border-subtle) bg-(--color-surface-sunken) text-(--color-text-muted) cursor-not-allowed"
            : "border border-(--color-border-strong) hover:border-[#8A8886] focus:border-(--color-brand) focus:border-b-2 focus:border-b-(--color-brand)",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: boolean;
}

export const FormLabel: React.FC<FormLabelProps> = ({
  children,
  className,
  required,
  error,
  ...props
}) => {
  return (
    <label
      className={cn(
        "block text-[11.5px] font-medium leading-none mb-1",
        error ? "text-(--color-danger-ink)" : "text-(--color-text-muted)",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-(--color-danger) ml-0.5">*</span>}
    </label>
  );
};

export interface InlineErrorProps {
  message?: string;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ message, className }) => {
  if (!message) return null;
  return (
    <div
      className={cn(
        "mt-1 flex items-start gap-1 text-[11px] leading-4 text-(--color-danger-ink)",
        className
      )}
      role="alert"
    >
      <span className="flex-none h-4 flex items-center justify-center text-(--color-danger) translate-y-[0.5px]">
        <Warning12Regular />
      </span>
      <span>{message}</span>
    </div>
  );
};

