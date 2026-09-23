import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ChevronDown12Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options?: SelectOption[];
  disabled?: boolean;
  error?: boolean | string;
  density?: "compact" | "comfortable";
  className?: string;
  name?: string;
  children?: React.ReactNode;
}

// ============================================================================
// Select (Standard Custom Fluent Dropdown)
// ============================================================================

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      value: propValue,
      defaultValue,
      onValueChange,
      placeholder = "Pilih opsi...",
      options,
      disabled = false,
      error = false,
      density = "compact",
      className,
      name,
      children,
    },
    ref
  ) => {
    // Parse options from props or children (<option value="...">label</option>)
    const parsedOptions: SelectOption[] = React.useMemo(() => {
      if (options && options.length > 0) return options;
      const list: SelectOption[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === "option" || (child.props as any).value !== undefined) {
            list.push({
              value: String((child.props as any).value ?? ""),
              label: (child.props as any).children ?? String((child.props as any).value ?? ""),
              disabled: (child.props as any).disabled,
            });
          }
        }
      });
      return list;
    }, [options, children]);

    const isControlled = propValue !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string>(() => {
      if (defaultValue !== undefined) return defaultValue;
      return parsedOptions[0]?.value ?? "";
    });

    const currentValue = isControlled ? propValue : uncontrolledValue;
    const [open, setOpen] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);
    const optionsContainerRef = React.useRef<HTMLDivElement>(null);

    // Selected option label
    const selectedOption = parsedOptions.find((opt) => opt.value === currentValue);
    const displayLabel = selectedOption
      ? selectedOption.label
      : currentValue === "" && parsedOptions.some((o) => o.value === "")
      ? parsedOptions.find((o) => o.value === "")?.label
      : placeholder;

    // Reset or initialize highlighted index when opening
    React.useEffect(() => {
      if (open) {
        const idx = parsedOptions.findIndex((o) => o.value === currentValue);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
    }, [open, currentValue, parsedOptions]);

    const handleSelect = (val: string) => {
      if (!isControlled) {
        setUncontrolledValue(val);
      }
      onValueChange?.(val);
      setOpen(false);
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (!open) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev + 1;
          while (next < parsedOptions.length && parsedOptions[next]?.disabled) {
            next++;
          }
          if (next >= parsedOptions.length) next = 0;
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev - 1;
          while (next >= 0 && parsedOptions[next]?.disabled) {
            next--;
          }
          if (next < 0) next = parsedOptions.length - 1;
          return next;
        });
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const target = parsedOptions[highlightedIndex];
        if (target && !target.disabled) {
          handleSelect(target.value);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "Tab") {
        setOpen(false);
      }
    };

    // Scroll highlighted item into view
    React.useEffect(() => {
      if (open && highlightedIndex >= 0 && optionsContainerRef.current) {
        const itemEl = optionsContainerRef.current.children[highlightedIndex] as HTMLElement;
        if (itemEl && typeof itemEl.scrollIntoView === "function") {
          itemEl.scrollIntoView({ block: "nearest" });
        }
      }
    }, [open, highlightedIndex]);

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        {name && <input type="hidden" name={name} value={currentValue} />}
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex w-full items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-surface)] text-[var(--color-text)] transition-colors duration-[var(--dur-fast)] cursor-pointer select-none",
              "focus:outline-none",
              density === "compact"
                ? "h-[var(--density-control-h)] px-2 text-[13px]"
                : "h-[32px] px-3 text-[13.5px]",
              error
                ? "border border-[var(--color-danger)] shadow-[inset_0_-1px_0_0_var(--color-danger)] text-[var(--color-danger-ink)]"
                : "border border-[var(--color-border-strong)] hover:border-[#8A8886] focus:border-[var(--color-brand)] focus:shadow-[inset_0_-1px_0_0_var(--color-brand)] data-[state=open]:border-[var(--color-brand)] data-[state=open]:shadow-[inset_0_-1px_0_0_var(--color-brand)]",
              disabled &&
                "cursor-not-allowed border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)]",
              className
            )}
          >
            <span
              className={cn(
                "truncate text-left flex-1",
                !selectedOption && currentValue === "" && "text-[var(--color-text)]"
              )}
            >
              {displayLabel}
            </span>
            <ChevronDown12Regular
              className={cn(
                "text-[#8A8886] flex-none ml-1.5 transition-transform duration-150",
                open && "rotate-180"
              )}
            />
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            side="bottom"
            align="start"
            sideOffset={3}
            avoidCollisions={false}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onKeyDown={handleKeyDown}
            className={cn(
              "z-50 w-[var(--radix-popover-trigger-width)] min-w-full max-h-[260px] overflow-y-auto rounded-[6px] border border-[#C8C6C4] bg-white p-1 text-[var(--color-text)] shadow-[0_8px_16px_rgba(0,0,0,0.14),0_0_2px_rgba(0,0,0,0.12)] outline-none duration-75",
              "animate-in fade-in-0 zoom-in-95",
              "flex flex-col gap-[1px]",
              "[scrollbar-width:thin] [scrollbar-color:#C8C6C4_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C8C6C4] [&::-webkit-scrollbar-track]:bg-transparent"
            )}
          >
            <div ref={optionsContainerRef} className="flex flex-col gap-[1px]">
              {parsedOptions.map((opt, idx) => {
                const isSelected = opt.value === currentValue;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      "w-full text-left px-[9px] py-[6px] border-none rounded-[4px] cursor-pointer text-[12.5px] whitespace-nowrap transition-colors select-none outline-none",
                      isSelected
                        ? "bg-[#EBF3FC] text-[#0C548F] font-semibold"
                        : isHighlighted
                        ? "bg-[#EBF3FC] text-[#242424] font-normal"
                        : "bg-transparent text-[#242424] font-normal hover:bg-[#EBF3FC]",
                      opt.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  }
);
Select.displayName = "Select";

// ============================================================================
// GroupedRuanganSelect (Grouped by Tempat with Capacity)
// ============================================================================

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

export interface GroupedRuanganSelectProps {
  groups: TempatRuanganGroup[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  allowNone?: boolean;
  noneLabel?: string;
  placeholder?: string;
  error?: boolean | string;
  density?: "compact" | "comfortable";
  disabled?: boolean;
  className?: string;
  name?: string;
}

export const GroupedRuanganSelect = React.forwardRef<
  HTMLButtonElement,
  GroupedRuanganSelectProps
>(
  (
    {
      groups,
      value: propValue,
      defaultValue,
      onValueChange,
      allowNone = true,
      noneLabel = "Tanpa ruangan",
      placeholder = "Pilih ruangan",
      error = false,
      density = "compact",
      disabled = false,
      className,
      name,
    },
    ref
  ) => {
    const isControlled = propValue !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string>(
      defaultValue ?? ""
    );
    const currentValue = isControlled ? propValue : uncontrolledValue;
    const [open, setOpen] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);
    const listRef = React.useRef<HTMLDivElement>(null);

    // Flatten all selectable options for keyboard navigation & label lookup
    interface FlatOption {
      id: string;
      label: string;
    }

    const flatOptions: FlatOption[] = React.useMemo(() => {
      const list: FlatOption[] = [];
      if (allowNone) {
        list.push({ id: "", label: noneLabel });
      }
      groups.forEach((g) => {
        g.ruangan.forEach((r) => {
          list.push({
            id: r.id,
            label: `${r.nama}${r.kapasitas !== undefined ? ` · kapasitas ${r.kapasitas}` : ""}`,
          });
        });
      });
      return list;
    }, [groups, allowNone, noneLabel]);

    // Determine current display label on trigger
    const selectedItem = flatOptions.find((o) => o.id === currentValue);
    const displayLabel = selectedItem
      ? selectedItem.label
      : currentValue === "" && allowNone
      ? noneLabel
      : placeholder;

    // Initialize highlight to current item on open
    React.useEffect(() => {
      if (open) {
        const idx = flatOptions.findIndex((o) => o.id === currentValue);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
    }, [open, currentValue, flatOptions]);

    const handleSelect = (val: string) => {
      if (!isControlled) {
        setUncontrolledValue(val);
      }
      onValueChange?.(val);
      setOpen(false);
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (!open) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1 >= flatOptions.length ? 0 : prev + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 < 0 ? flatOptions.length - 1 : prev - 1));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const target = flatOptions[highlightedIndex];
        if (target) {
          handleSelect(target.id);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "Tab") {
        setOpen(false);
      }
    };

    // Scroll highlighted option into view
    React.useEffect(() => {
      if (open && highlightedIndex >= 0 && listRef.current) {
        const itemEl = listRef.current.querySelector<HTMLElement>(
          `[data-option-index="${highlightedIndex}"]`
        );
        if (itemEl && typeof itemEl.scrollIntoView === "function") {
          itemEl.scrollIntoView({ block: "nearest" });
        }
      }
    }, [open, highlightedIndex]);

    let optionCounter = 0;

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        {name && <input type="hidden" name={name} value={currentValue} />}
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex w-full items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-surface)] text-[var(--color-text)] transition-colors duration-[var(--dur-fast)] cursor-pointer select-none",
              "focus:outline-none",
              density === "compact"
                ? "h-[var(--density-control-h)] px-2 text-[13px]"
                : "h-[32px] px-3 text-[13.5px]",
              error
                ? "border border-[var(--color-danger)] shadow-[inset_0_-1px_0_0_var(--color-danger)] text-[var(--color-danger-ink)]"
                : "border border-[var(--color-border-strong)] hover:border-[#8A8886] focus:border-[var(--color-brand)] focus:shadow-[inset_0_-1px_0_0_var(--color-brand)] data-[state=open]:border-[var(--color-brand)] data-[state=open]:shadow-[inset_0_-1px_0_0_var(--color-brand)]",
              disabled &&
                "cursor-not-allowed border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)]",
              className
            )}
          >
            <span className="truncate text-left flex-1">{displayLabel}</span>
            <ChevronDown12Regular
              className={cn(
                "text-[#8A8886] flex-none ml-1.5 transition-transform duration-150",
                open && "rotate-180"
              )}
            />
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            side="bottom"
            align="start"
            sideOffset={3}
            avoidCollisions={false}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onKeyDown={handleKeyDown}
            className={cn(
              "z-50 min-w-[max(220px,var(--radix-popover-trigger-width))] w-max max-w-[360px] max-h-[320px] overflow-y-auto rounded-[6px] border border-[#C8C6C4] bg-white p-1 text-[var(--color-text)] shadow-[0_8px_16px_rgba(0,0,0,0.14),0_0_2px_rgba(0,0,0,0.12)] outline-none duration-75",
              "animate-in fade-in-0 zoom-in-95",
              "flex flex-col gap-[1px]",
              "[scrollbar-width:thin] [scrollbar-color:#C8C6C4_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C8C6C4] [&::-webkit-scrollbar-track]:bg-transparent"
            )}
          >
            <div ref={listRef} className="flex flex-col gap-[1px]">
              {/* Top Option: Tanpa Ruangan */}
              {allowNone && (() => {
                const thisIdx = optionCounter++;
                const isSelected = currentValue === "";
                const isHighlighted = thisIdx === highlightedIndex;

                return (
                  <button
                    key="__none__"
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-option-index={thisIdx}
                    onClick={() => handleSelect("")}
                    onMouseEnter={() => setHighlightedIndex(thisIdx)}
                    className={cn(
                      "w-full text-left px-[9px] py-[6px] border-none rounded-[4px] cursor-pointer text-[12.5px] whitespace-nowrap transition-colors select-none outline-none",
                      isSelected
                        ? "bg-[#EBF3FC] text-[#0C548F] font-semibold"
                        : isHighlighted
                        ? "bg-[#EBF3FC] text-[#242424] font-normal"
                        : "bg-transparent text-[#242424] font-normal hover:bg-[#EBF3FC]"
                    )}
                  >
                    {noneLabel}
                  </button>
                );
              })()}

              {/* Grouped Ruangan per Tempat */}
              {groups.map((group) => (
                <div key={group.id} className="flex flex-col gap-[1px]">
                  {group.nama && (
                    <div className="px-[9px] pt-1.5 pb-[3px] text-[10.5px] font-semibold tracking-wider text-[#5C5A58] select-none">
                      {group.nama}
                    </div>
                  )}
                  {group.ruangan.map((r) => {
                    const thisIdx = optionCounter++;
                    const isSelected = currentValue === r.id;
                    const isHighlighted = thisIdx === highlightedIndex;
                    const labelText = `${r.nama}${r.kapasitas !== undefined ? ` · kapasitas ${r.kapasitas}` : ""}`;

                    return (
                      <button
                        key={r.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        data-option-index={thisIdx}
                        onClick={() => handleSelect(r.id)}
                        onMouseEnter={() => setHighlightedIndex(thisIdx)}
                        className={cn(
                          "w-full text-left px-[9px] py-[6px] border-none rounded-[4px] cursor-pointer text-[12.5px] whitespace-nowrap transition-colors select-none outline-none",
                          isSelected
                            ? "bg-[#EBF3FC] text-[#0C548F] font-semibold"
                            : isHighlighted
                            ? "bg-[#EBF3FC] text-[#242424] font-normal"
                            : "bg-transparent text-[#242424] font-normal hover:bg-[#EBF3FC]"
                        )}
                      >
                        {labelText}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  }
);
GroupedRuanganSelect.displayName = "GroupedRuanganSelect";

// ============================================================================
// Legacy Compound Compatibility Exports
// ============================================================================
export const SelectRoot = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const SelectGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const SelectValue = ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>;
export const SelectTrigger = Select;
export const SelectContent = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const SelectItem = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const SelectLabel = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <div className={cn("px-[9px] pt-1.5 pb-[3px] text-[10.5px] font-semibold tracking-wider text-[#5C5A58]", className)}>
    {children}
  </div>
);
export const SelectSeparator = () => null;
