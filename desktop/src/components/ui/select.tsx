import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ChevronDown12Regular, Search16Regular, Dismiss12Regular } from "@fluentui/react-icons";
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
  searchable?: boolean;
  searchPlaceholder?: string;
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
      searchable = false,
      searchPlaceholder,
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
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Clear search and focus search input when opening
    React.useEffect(() => {
      if (open) {
        setSearchQuery("");
        if (searchable) {
          const timer = setTimeout(() => searchInputRef.current?.focus(), 40);
          return () => clearTimeout(timer);
        }
      }
    }, [open, searchable]);

    // Filter options by search query
    const filteredOptions: SelectOption[] = React.useMemo(() => {
      if (!searchable || !searchQuery.trim()) return parsedOptions;
      const q = searchQuery.toLowerCase().trim();
      return parsedOptions.filter((opt) => {
        if (opt.value === "") return true; // keep placeholder
        const text = typeof opt.label === "string" ? opt.label : String(opt.value);
        return text.toLowerCase().includes(q);
      });
    }, [parsedOptions, searchQuery, searchable]);

    // Selected option label
    const selectedOption = parsedOptions.find((opt) => opt.value === currentValue);
    const displayLabel = selectedOption
      ? selectedOption.label
      : currentValue === "" && parsedOptions.some((o) => o.value === "")
      ? parsedOptions.find((o) => o.value === "")?.label
      : placeholder;

    // Reset or initialize highlighted index when opening or filtering
    React.useEffect(() => {
      if (open) {
        const idx = filteredOptions.findIndex((o) => o.value === currentValue);
        const target = idx >= 0 ? idx : 0;
        setHighlightedIndex((prev) => (prev === target ? prev : target));
      }
    }, [open, currentValue, filteredOptions]);

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
          while (next < filteredOptions.length && filteredOptions[next]?.disabled) {
            next++;
          }
          if (next >= filteredOptions.length) next = 0;
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev - 1;
          while (next >= 0 && filteredOptions[next]?.disabled) {
            next--;
          }
          if (next < 0) next = filteredOptions.length - 1;
          return next;
        });
      } else if (e.key === "Enter" || (!searchable && e.key === " ")) {
        e.preventDefault();
        const target = filteredOptions[highlightedIndex];
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
              "flex w-full items-center justify-between rounded-md bg-(--color-surface) text-(--color-text) transition-colors duration-(--dur-fast) cursor-pointer select-none",
              "focus:outline-none",
              density === "compact"
                ? "h-(--density-control-h) pl-2 pr-1.5 text-[12.5px]"
                : "h-8 pl-3 pr-2 text-[13.5px]",
              error
                ? "border border-(--color-danger) shadow-[inset_0_-1px_0_0_var(--color-danger)] text-(--color-danger-ink)"
                : "border border-(--color-border-strong) hover:border-[#8A8886] focus:border-(--color-brand) focus:shadow-[inset_0_-1px_0_0_var(--color-brand)] data-[state=open]:border-(--color-brand) data-[state=open]:shadow-[inset_0_-1px_0_0_var(--color-brand)]",
              disabled &&
                "cursor-not-allowed border-(--color-border-subtle) bg-(--color-surface-sunken) text-(--color-text-muted)",
              className
            )}
          >
            <span
              className={cn(
                "truncate text-left flex-1",
                !selectedOption && currentValue === "" && "text-(--color-text)"
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
            onOpenAutoFocus={(e) => {
              if (searchable) {
                // Let search input focus smoothly
                e.preventDefault();
              } else {
                e.preventDefault();
              }
            }}
            onKeyDown={handleKeyDown}
            className={cn(
              "z-50 w-(--radix-popover-trigger-width) min-w-full max-h-65 overflow-y-auto rounded-[6px] border border-[#C8C6C4] bg-white p-1 text-(--color-text) shadow-[0_8px_16px_rgba(0,0,0,0.14),0_0_2px_rgba(0,0,0,0.12)] outline-none duration-75",
              "animate-in fade-in-0 zoom-in-95",
              "flex flex-col gap-px",
              "scrollbar-thin [scrollbar-color:#C8C6C4_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C8C6C4] [&::-webkit-scrollbar-track]:bg-transparent"
            )}
          >
            {/* Search Input Bar when searchable is enabled */}
            {searchable && (
              <div className="sticky top-0 bg-white pt-0.5 pb-1.5 px-0.5 border-b border-(--color-border) mb-1 z-10">
                <div className="relative flex items-center">
                  <Search16Regular className="absolute left-1.5 text-(--color-text-muted) w-3.5 h-3.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder || "Cari..."}
                    className="w-full h-6 pl-6 pr-5 text-[12px] rounded border border-(--color-border-strong) bg-(--color-surface-sunken) focus:bg-white focus:border-(--color-brand) focus:outline-none transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                        handleKeyDown(e);
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                        const target = filteredOptions[highlightedIndex >= 0 ? highlightedIndex : 0];
                        if (target && !target.disabled) {
                          handleSelect(target.value);
                        }
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        setOpen(false);
                      }
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-1 text-(--color-text-muted) hover:text-(--color-text) cursor-pointer p-0.5"
                    >
                      <Dismiss12Regular className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div ref={optionsContainerRef} className="flex flex-col gap-px">
              {filteredOptions.length === 0 ? (
                <div className="py-2.5 px-2 text-center text-[12px] text-(--color-text-muted)">
                  Tidak ditemukan
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
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
                      title={typeof opt.label === "string" ? opt.label : undefined}
                      className={cn(
                        "w-full text-left px-[9px] py-1.5 border-none rounded-[4px] cursor-pointer text-[12.5px] truncate transition-colors select-none outline-none",
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
                })
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  }
);
Select.displayName = "Select";

// ============================================================================
// MultiSelect (Multi-Option Dropdown with Checkboxes)
// ============================================================================

export interface MultiSelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface MultiSelectProps {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  options?: MultiSelectOption[];
  disabled?: boolean;
  error?: boolean | string;
  density?: "compact" | "comfortable";
  className?: string;
  name?: string;
  children?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      value: propValue,
      defaultValue = [],
      onValueChange,
      placeholder = "Pilih opsi...",
      options,
      disabled = false,
      error = false,
      density = "compact",
      className,
      name,
      children,
      searchable = false,
      searchPlaceholder,
    },
    ref
  ) => {
    // Parse options from props or children (<option value="...">label</option>)
    const parsedOptions: MultiSelectOption[] = React.useMemo(() => {
      if (options && options.length > 0) return options;
      const list: MultiSelectOption[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === "option" || (child.props as any).value !== undefined) {
            const val = String((child.props as any).value ?? "");
            if (val !== "") {
              list.push({
                value: val,
                label: (child.props as any).children ?? val,
                disabled: (child.props as any).disabled,
              });
            }
          }
        }
      });
      return list;
    }, [options, children]);

    const isControlled = propValue !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>(defaultValue);
    const currentValues = isControlled ? (propValue ?? []) : uncontrolledValue;

    const [open, setOpen] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);
    const optionsContainerRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = React.useState("");

    React.useEffect(() => {
      if (open) {
        setSearchQuery("");
        if (searchable) {
          const timer = setTimeout(() => searchInputRef.current?.focus(), 40);
          return () => clearTimeout(timer);
        }
      }
    }, [open, searchable]);

    const filteredOptions: MultiSelectOption[] = React.useMemo(() => {
      if (!searchable || !searchQuery.trim()) return parsedOptions;
      const q = searchQuery.toLowerCase().trim();
      return parsedOptions.filter((opt) => {
        const text = typeof opt.label === "string" ? opt.label : String(opt.value);
        return text.toLowerCase().includes(q);
      });
    }, [parsedOptions, searchQuery, searchable]);

    const handleToggle = (val: string) => {
      const exists = currentValues.includes(val);
      const nextValues = exists
        ? currentValues.filter((v) => v !== val)
        : [...currentValues, val];

      if (!isControlled) {
        setUncontrolledValue(nextValues);
      }
      onValueChange?.(nextValues);
    };

    const handleSelectAll = () => {
      const allSelectable = filteredOptions
        .filter((o) => !o.disabled)
        .map((o) => o.value);
      const combined = Array.from(new Set([...currentValues, ...allSelectable]));
      if (!isControlled) {
        setUncontrolledValue(combined);
      }
      onValueChange?.(combined);
    };

    const handleDeselectAll = () => {
      const filteredSet = new Set(filteredOptions.map((o) => o.value));
      const remaining = currentValues.filter((v) => !filteredSet.has(v));
      if (!isControlled) {
        setUncontrolledValue(remaining);
      }
      onValueChange?.(remaining);
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
          while (next < filteredOptions.length && filteredOptions[next]?.disabled) {
            next++;
          }
          if (next >= filteredOptions.length) next = 0;
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev - 1;
          while (next >= 0 && filteredOptions[next]?.disabled) {
            next--;
          }
          if (next < 0) next = filteredOptions.length - 1;
          return next;
        });
      } else if (e.key === "Enter" || (!searchable && e.key === " ")) {
        e.preventDefault();
        const target = filteredOptions[highlightedIndex];
        if (target && !target.disabled) {
          handleToggle(target.value);
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
        const optionEls = optionsContainerRef.current.querySelectorAll<HTMLButtonElement>(
          "[role='checkbox']"
        );
        const targetEl = optionEls[highlightedIndex];
        if (targetEl && typeof targetEl.scrollIntoView === "function") {
          targetEl.scrollIntoView({ block: "nearest" });
        }
      }
    }, [open, highlightedIndex]);

    const selectedCount = currentValues.length;
    let displayContent: React.ReactNode = placeholder;
    if (selectedCount === 1) {
      const opt = parsedOptions.find((o) => o.value === currentValues[0]);
      displayContent = opt ? opt.label : currentValues[0];
    } else if (selectedCount > 1) {
      const firstOpt = parsedOptions.find((o) => o.value === currentValues[0]);
      const firstLabel = firstOpt ? firstOpt.label : currentValues[0];
      displayContent = (
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="truncate">{firstLabel}</span>
          <span className="flex-none rounded-full bg-(--color-brand-subtle) px-1.5 py-0.5 text-[10px] font-semibold text-(--color-brand-ink) leading-none border border-(--color-brand)">
            +{selectedCount - 1}
          </span>
        </span>
      );
    }

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        {name && (
          <input
            type="hidden"
            name={name}
            value={currentValues.join(",")}
          />
        )}
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex w-full items-center justify-between rounded-md bg-(--color-surface) text-(--color-text) transition-colors duration-(--dur-fast) cursor-pointer select-none",
              "focus:outline-none",
              density === "compact"
                ? "h-(--density-control-h) pl-2 pr-1.5 text-[12.5px]"
                : "h-8 pl-3 pr-2 text-[13.5px]",
              error
                ? "border border-(--color-danger) shadow-[inset_0_-1px_0_0_var(--color-danger)] text-(--color-danger-ink)"
                : selectedCount > 0
                ? "border border-(--color-brand) shadow-[inset_0_-1px_0_0_var(--color-brand)]"
                : "border border-(--color-border-strong) hover:border-[#8A8886] focus:border-(--color-brand) focus:shadow-[inset_0_-1px_0_0_var(--color-brand)] data-[state=open]:border-(--color-brand) data-[state=open]:shadow-[inset_0_-1px_0_0_var(--color-brand)]",
              disabled &&
                "cursor-not-allowed border-(--color-border-subtle) bg-(--color-surface-sunken) text-(--color-text-muted)",
              className
            )}
          >
            <span
              className={cn(
                "truncate text-left flex-1",
                selectedCount === 0
                  ? "text-(--color-text-secondary) font-normal"
                  : "text-(--color-text) font-medium"
              )}
            >
              {displayContent}
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
              "z-50 min-w-[max(220px,var(--radix-popover-trigger-width))] w-max max-w-90 max-h-80 overflow-y-auto rounded-[6px] border border-[#C8C6C4] bg-white p-1 text-(--color-text) shadow-[0_8px_16px_rgba(0,0,0,0.14),0_0_2px_rgba(0,0,0,0.12)] outline-none duration-75",
              "animate-in fade-in-0 zoom-in-95",
              "flex flex-col gap-px",
              "scrollbar-thin [scrollbar-color:#C8C6C4_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C8C6C4] [&::-webkit-scrollbar-track]:bg-transparent"
            )}
          >
            {/* Search Input Bar */}
            {searchable && (
              <div className="sticky top-0 bg-white pt-0.5 pb-1.5 px-0.5 border-b border-(--color-border) mb-1 z-10">
                <div className="relative flex items-center">
                  <Search16Regular className="absolute left-1.5 text-(--color-text-muted) w-3.5 h-3.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder || "Cari..."}
                    className="w-full h-6 pl-6 pr-5 text-[12px] rounded border border-(--color-border-strong) bg-(--color-surface-sunken) focus:bg-white focus:border-(--color-brand) focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-1 text-(--color-text-muted) hover:text-(--color-text) cursor-pointer p-0.5"
                    >
                      <Dismiss12Regular className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions (Pilih semua / Hapus pilihan) */}
            {filteredOptions.length > 1 && (
              <div className="flex items-center justify-between px-2 py-1 text-[11px] border-b border-(--color-border) mb-1 text-(--color-text-secondary)">
                <span>{selectedCount} dipilih</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-(--color-brand) hover:underline cursor-pointer"
                  >
                    Pilih semua
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-(--color-text-muted) hover:text-(--color-text) hover:underline cursor-pointer"
                  >
                    Kosongkan
                  </button>
                </div>
              </div>
            )}

            {/* Options List */}
            <div ref={optionsContainerRef} className="flex flex-col gap-px">
              {filteredOptions.length === 0 ? (
                <div className="py-2.5 px-2 text-center text-[12px] text-(--color-text-muted)">
                  Tidak ditemukan
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = currentValues.includes(opt.value);
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <button
                      key={`${opt.value}-${idx}`}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      disabled={opt.disabled}
                      onClick={() => handleToggle(opt.value)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      title={typeof opt.label === "string" ? opt.label : undefined}
                      className={cn(
                        "w-full text-left px-2 py-1.5 border-none rounded-[4px] cursor-pointer text-[12.5px] transition-colors select-none outline-none flex items-center gap-2",
                        isSelected
                          ? "bg-[#EBF3FC] text-[#0C548F] font-medium"
                          : isHighlighted
                          ? "bg-(--color-surface-sunken) text-(--color-text) font-normal"
                          : "bg-transparent text-(--color-text) font-normal hover:bg-(--color-surface-sunken)",
                        opt.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="h-3.5 w-3.5 rounded accent-(--color-brand) cursor-pointer pointer-events-none flex-none"
                      />
                      <span className="truncate flex-1">{opt.label}</span>
                    </button>
                  );
                })
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  }
);
MultiSelect.displayName = "MultiSelect";

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
        const target = idx >= 0 ? idx : 0;
        setHighlightedIndex((prev) => (prev === target ? prev : target));
      }
    }, [open, currentValue]);

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
              "flex w-full items-center justify-between rounded-md bg-(--color-surface) text-(--color-text) transition-colors duration-(--dur-fast) cursor-pointer select-none",
              "focus:outline-none",
              density === "compact"
                ? "h-(--density-control-h) pl-2 pr-1.5 text-[12.5px]"
                : "h-8 pl-3 pr-2 text-[13.5px]",
              error
                ? "border border-(--color-danger) shadow-[inset_0_-1px_0_0_var(--color-danger)] text-(--color-danger-ink)"
                : "border border-(--color-border-strong) hover:border-[#8A8886] focus:border-(--color-brand) focus:shadow-[inset_0_-1px_0_0_var(--color-brand)] data-[state=open]:border-(--color-brand) data-[state=open]:shadow-[inset_0_-1px_0_0_var(--color-brand)]",
              disabled &&
                "cursor-not-allowed border-(--color-border-subtle) bg-(--color-surface-sunken) text-(--color-text-muted)",
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
              "z-50 min-w-[max(220px,var(--radix-popover-trigger-width))] w-max max-w-90 max-h-80 overflow-y-auto rounded-[6px] border border-[#C8C6C4] bg-white p-1 text-(--color-text) shadow-[0_8px_16px_rgba(0,0,0,0.14),0_0_2px_rgba(0,0,0,0.12)] outline-none duration-75",
              "animate-in fade-in-0 zoom-in-95",
              "flex flex-col gap-px",
              "scrollbar-thin [scrollbar-color:#C8C6C4_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C8C6C4] [&::-webkit-scrollbar-track]:bg-transparent"
            )}
          >
            <div ref={listRef} className="flex flex-col gap-px">
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
                      "w-full text-left px-[9px] py-1.5 border-none rounded-[4px] cursor-pointer text-[12.5px] whitespace-nowrap transition-colors select-none outline-none",
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

              {allowNone && groups.length > 0 && (
                <div className="my-1 border-t border-(--color-border)" />
              )}

              {/* Grouped Ruangan per Tempat */}
              {groups.map((group) => (
                <div key={group.id} className="flex flex-col gap-px">
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
                          "w-full text-left px-[9px] py-1.5 border-none rounded-[4px] cursor-pointer text-[12.5px] whitespace-nowrap transition-colors select-none outline-none",
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
