import * as React from "react";
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
          "w-full rounded-[var(--radius-md)] bg-[var(--color-surface)] text-[var(--color-text)] transition-colors duration-[var(--dur-fast)]",
          "placeholder:text-[var(--color-text-muted)] focus:outline-none",
          density === "compact"
            ? "h-[var(--density-control-h)] px-2 text-[12.5px]"
            : "h-[32px] px-3 text-[13.5px]",
          mono && "font-mono",
          // States
          error
            ? "border border-[var(--color-danger)] border-b-2 border-b-[var(--color-danger)]"
            : disabled
            ? "border border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] cursor-not-allowed border-b"
            : "border border-[var(--color-border-strong)] hover:border-[#8A8886] focus:border-[var(--color-brand)] focus:border-b-2 focus:border-b-[var(--color-brand)]",
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
  ({ className, value, onClear, density = "compact", ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <span className="absolute left-2.5 text-[var(--color-text-muted)] text-[12px] pointer-events-none select-none">
          ⌕
        </span>
        <Input
          ref={ref}
          type="search"
          value={value}
          density={density}
          className={cn("pl-7 rounded-full", Boolean(value) && onClear && "pr-7", className)}
          {...props}
        />
        {Boolean(value) && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-[11px] p-0.5 cursor-pointer"
            title="Hapus pencarian"
          >
            ✕
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
          "w-full rounded-[var(--radius-md)] bg-[var(--color-surface)] text-[var(--color-text)] p-2 text-[12.5px] transition-colors duration-[var(--dur-fast)]",
          "placeholder:text-[var(--color-text-muted)] focus:outline-none resize-y min-h-[60px]",
          mono && "font-mono",
          error
            ? "border border-[var(--color-danger)] border-b-2 border-b-[var(--color-danger)]"
            : disabled
            ? "border border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] cursor-not-allowed"
            : "border border-[var(--color-border-strong)] hover:border-[#8A8886] focus:border-[var(--color-brand)] focus:border-b-2 focus:border-b-[var(--color-brand)]",
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
        error ? "text-[var(--color-danger-ink)]" : "text-[var(--color-text-muted)]",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
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
        "mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-snug text-[var(--color-danger-ink)]",
        className
      )}
      role="alert"
    >
      <span className="font-bold flex-none">⚠</span>
      <span>{message}</span>
    </div>
  );
};

