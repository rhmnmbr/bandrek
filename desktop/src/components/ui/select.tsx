import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean | string;
  density?: "compact" | "comfortable";
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, density = "compact", disabled, children, ...props }, ref) => {
    return (
      <div className="relative inline-block w-full">
        <select
          disabled={disabled}
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-[var(--radius-md)] bg-[var(--color-surface)] text-[var(--color-text)] transition-colors duration-[var(--dur-fast)] cursor-pointer pr-7",
            "focus:outline-none",
            density === "compact"
              ? "h-[var(--density-control-h)] px-2 text-[12.5px]"
              : "h-[32px] px-3 text-[13.5px]",
            error
              ? "border border-[var(--color-danger)] border-b-2 border-b-[var(--color-danger)] text-[var(--color-danger-ink)]"
              : disabled
              ? "border border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] cursor-not-allowed border-b"
              : "border border-[var(--color-border-strong)] hover:border-[#8A8886] focus:border-[var(--color-brand)] focus:border-b-2 focus:border-b-[var(--color-brand)]",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-text-muted)]">
          ▾
        </span>
      </div>
    );
  }
);
Select.displayName = "Select";

export interface RuanganOption {
  id: string;
  nama: string;
  kapasitas?: number;
}

export interface TempatRuanganGroup {
  id: string;
  nama: string;
  ruangan: RuanganOption[];
}

export interface GroupedRuanganSelectProps extends Omit<SelectProps, "children"> {
  groups: TempatRuanganGroup[];
  allowNone?: boolean;
  noneLabel?: string;
}

export const GroupedRuanganSelect = React.forwardRef<HTMLSelectElement, GroupedRuanganSelectProps>(
  ({ groups, allowNone = true, noneLabel = "Tanpa ruangan", ...props }, ref) => {
    return (
      <Select ref={ref} {...props}>
        {allowNone && <option value="">{noneLabel}</option>}
        {groups.map((group) => (
          <optgroup key={group.id} label={group.nama} className="font-semibold text-[var(--color-text-muted)]">
            {group.ruangan.map((r) => (
              <option key={r.id} value={r.id} className="font-normal text-[var(--color-text)]">
                {r.nama} {r.kapasitas ? `(kapasitas ${r.kapasitas})` : ""}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
    );
  }
);
GroupedRuanganSelect.displayName = "GroupedRuanganSelect";

