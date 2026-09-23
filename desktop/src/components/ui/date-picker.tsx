import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  format,
  parseISO,
  isValid,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  setMonth,
  setYear,
  getYear,
  getMonth,
} from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar16Regular,
  ChevronLeft12Regular,
  ChevronRight12Regular,
  ChevronDown12Regular,
} from "@fluentui/react-icons";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value?: string | Date;
  defaultValue?: string | Date;
  onChange?: (dateIso: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean | string;
  density?: "compact" | "comfortable";
  formatDisplay?: string;
  showDayName?: boolean;
  className?: string;
}

function normalizeDate(val?: string | Date): Date | undefined {
  if (!val) return undefined;
  if (val instanceof Date) return isNaN(val.getTime()) ? undefined : val;
  try {
    const parsed = parseISO(val);
    return isValid(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

const MONTHS_LIST = [
  { index: 0, full: "Januari", short: "Jan" },
  { index: 1, full: "Februari", short: "Feb" },
  { index: 2, full: "Maret", short: "Mar" },
  { index: 3, full: "April", short: "Apr" },
  { index: 4, full: "Mei", short: "Mei" },
  { index: 5, full: "Juni", short: "Jun" },
  { index: 6, full: "Juli", short: "Jul" },
  { index: 7, full: "Agustus", short: "Agu" },
  { index: 8, full: "September", short: "Sep" },
  { index: 9, full: "Oktober", short: "Okt" },
  { index: 10, full: "November", short: "Nov" },
  { index: 11, full: "Desember", short: "Des" },
];

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value: propValue,
      defaultValue,
      onChange,
      placeholder = "Pilih tanggal",
      disabled = false,
      error = false,
      density = "compact",
      formatDisplay = "d MMM yyyy",
      showDayName = false,
      className,
    },
    ref
  ) => {
    const [internalDate, setInternalDate] = React.useState<Date | undefined>(() =>
      normalizeDate(propValue ?? defaultValue)
    );
    const [open, setOpen] = React.useState(false);
    const [viewMode, setViewMode] = React.useState<"days" | "months" | "years">("days");

    // Synchronize controlled value
    React.useEffect(() => {
      if (propValue !== undefined) {
        setInternalDate(normalizeDate(propValue));
      }
    }, [propValue]);

    // Active month view in calendar
    const [viewDate, setViewDate] = React.useState<Date>(() => internalDate ?? new Date());

    // Decade range start for years view
    const [yearRangeStart, setYearRangeStart] = React.useState<number>(() =>
      Math.floor(getYear(viewDate) / 12) * 12
    );

    // When calendar opens, navigate to the selected date's month if present and reset view to days
    React.useEffect(() => {
      if (open) {
        if (internalDate) {
          setViewDate(internalDate);
          setYearRangeStart(Math.floor(getYear(internalDate) / 12) * 12);
        } else {
          setYearRangeStart(Math.floor(getYear(viewDate) / 12) * 12);
        }
      } else {
        setViewMode("days");
      }
    }, [open]);

    const handleSelectDay = (day: Date) => {
      setInternalDate(day);
      const isoStr = format(day, "yyyy-MM-dd");
      onChange?.(isoStr);
      setOpen(false);
    };

    const handleClear = () => {
      setInternalDate(undefined);
      onChange?.("");
      setOpen(false);
    };

    const handleToday = () => {
      const today = new Date();
      setInternalDate(today);
      const isoStr = format(today, "yyyy-MM-dd");
      onChange?.(isoStr);
      setViewDate(today);
      setYearRangeStart(Math.floor(getYear(today) / 12) * 12);
      setViewMode("days");
      setOpen(false);
    };

    const displayLabel = React.useMemo(() => {
      if (!internalDate) return null;
      if (showDayName) {
        return format(internalDate, "EEEE, d MMM yyyy", { locale: id });
      }
      return format(internalDate, formatDisplay, { locale: id });
    }, [internalDate, showDayName, formatDisplay]);

    // Build days for the 7-column calendar grid (weeks start on Monday per AGENTS.md)
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const daysInView = eachDayOfInterval({ start: calStart, end: calEnd });

    const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

    // 12-year window for years view
    const yearsInView = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);

    // Navigation previous / next
    const handlePrev = () => {
      if (viewMode === "days") {
        setViewDate((prev) => subMonths(prev, 1));
      } else if (viewMode === "months") {
        setViewDate((prev) => setYear(prev, getYear(prev) - 1));
      } else if (viewMode === "years") {
        setYearRangeStart((prev) => prev - 12);
      }
    };

    const handleNext = () => {
      if (viewMode === "days") {
        setViewDate((prev) => addMonths(prev, 1));
      } else if (viewMode === "months") {
        setViewDate((prev) => setYear(prev, getYear(prev) + 1));
      } else if (viewMode === "years") {
        setYearRangeStart((prev) => prev + 12);
      }
    };

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            className={cn(
              "flex w-full items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-surface)] text-[var(--color-text)] transition-colors duration-[var(--dur-fast)] cursor-pointer select-none",
              "focus:outline-none",
              density === "compact"
                ? "h-[var(--density-control-h)] px-2 text-[12.5px]"
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
                !displayLabel && "text-[var(--color-text-muted)]"
              )}
            >
              {displayLabel ?? placeholder}
            </span>
            <Calendar16Regular
              className={cn(
                "flex-none ml-1.5",
                error
                  ? "text-[var(--color-danger)]"
                  : disabled
                  ? "text-[var(--color-text-muted)]"
                  : "text-[var(--color-icon-faint)]"
              )}
            />
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={3}
            className={cn(
              "z-50 w-[260px] rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-white p-3 text-[var(--color-text)] shadow-[var(--shadow-overlay)] outline-none duration-75",
              "animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1"
            )}
          >
            {/* Calendar Navigation Header */}
            <div className="flex items-center justify-between mb-2">
              {/* Header Title with interactive quick jump buttons */}
              {viewMode === "days" && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Pilih bulan"
                    onClick={() => setViewMode("months")}
                    className="flex items-center gap-1 font-semibold text-[13px] text-[var(--color-text)] hover:text-[var(--color-brand)] hover:bg-[var(--color-surface-sunken)] px-1.5 py-0.5 rounded-[var(--radius-sm)] cursor-pointer transition-colors capitalize"
                  >
                    <span>{format(viewDate, "MMMM", { locale: id })}</span>
                    <ChevronDown12Regular className="text-[var(--color-text-muted)] w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    title="Pilih tahun"
                    onClick={() => {
                      setYearRangeStart(Math.floor(getYear(viewDate) / 12) * 12);
                      setViewMode("years");
                    }}
                    className="flex items-center gap-1 font-semibold text-[13px] text-[var(--color-text)] hover:text-[var(--color-brand)] hover:bg-[var(--color-surface-sunken)] px-1.5 py-0.5 rounded-[var(--radius-sm)] cursor-pointer transition-colors"
                  >
                    <span>{format(viewDate, "yyyy")}</span>
                    <ChevronDown12Regular className="text-[var(--color-text-muted)] w-3 h-3" />
                  </button>
                </div>
              )}

              {viewMode === "months" && (
                <div className="flex items-center gap-1 font-semibold text-[13px] text-[var(--color-text)]">
                  <span className="text-[var(--color-text-muted)] font-normal text-[12px]">Bulan —</span>
                  <button
                    type="button"
                    title="Pilih tahun"
                    onClick={() => {
                      setYearRangeStart(Math.floor(getYear(viewDate) / 12) * 12);
                      setViewMode("years");
                    }}
                    className="flex items-center gap-1 hover:text-[var(--color-brand)] hover:bg-[var(--color-surface-sunken)] px-1.5 py-0.5 rounded-[var(--radius-sm)] cursor-pointer transition-colors"
                  >
                    <span>{getYear(viewDate)}</span>
                    <ChevronDown12Regular className="text-[var(--color-text-muted)] w-3 h-3" />
                  </button>
                </div>
              )}

              {viewMode === "years" && (
                <div className="font-semibold text-[13px] text-[var(--color-text)] px-1.5 py-0.5 select-none">
                  {yearRangeStart} – {yearRangeStart + 11}
                </div>
              )}

              {/* Prev and Next navigation chevrons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title={
                    viewMode === "days"
                      ? "Bulan sebelumnya"
                      : viewMode === "months"
                      ? "Tahun sebelumnya"
                      : "12 tahun sebelumnya"
                  }
                  onClick={handlePrev}
                  className="h-[22px] w-[22px] flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)] cursor-pointer transition-colors"
                >
                  <ChevronLeft12Regular />
                </button>
                <button
                  type="button"
                  title={
                    viewMode === "days"
                      ? "Bulan berikutnya"
                      : viewMode === "months"
                      ? "Tahun berikutnya"
                      : "12 tahun berikutnya"
                  }
                  onClick={handleNext}
                  className="h-[22px] w-[22px] flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)] cursor-pointer transition-colors"
                >
                  <ChevronRight12Regular />
                </button>
              </div>
            </div>

            {/* ============================================================== */}
            {/* VIEW 1: DAYS (Default)                                         */}
            {/* ============================================================== */}
            {viewMode === "days" && (
              <>
                {/* Days of Week Row */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {weekDays.map((d) => (
                    <div
                      key={d}
                      className="text-[10.5px] font-semibold text-[var(--color-text-muted)] py-0.5 select-none"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {daysInView.map((day) => {
                    const inCurrentMonth = isSameMonth(day, viewDate);
                    const selected = internalDate && isSameDay(day, internalDate);
                    const today = isToday(day);

                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        onClick={() => handleSelectDay(day)}
                        className={cn(
                          "h-[26px] w-[26px] mx-auto flex items-center justify-center rounded-full text-[12px] font-normal cursor-pointer select-none transition-colors",
                          selected &&
                            "bg-[var(--color-brand)] text-white font-semibold hover:bg-[var(--color-brand)]",
                          !selected &&
                            today &&
                            "ring-1 ring-[var(--color-brand)] text-[var(--color-brand-ink)] font-semibold hover:bg-[var(--color-brand-subtle)]",
                          !selected &&
                            !today &&
                            inCurrentMonth &&
                            "text-[var(--color-text)] hover:bg-[var(--color-brand-subtle)]",
                          !selected &&
                            !today &&
                            !inCurrentMonth &&
                            "text-[var(--color-icon-faint)] hover:bg-[var(--color-surface-alt)]"
                        )}
                      >
                        {format(day, "d")}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ============================================================== */}
            {/* VIEW 2: MONTHS (Quick Month Picker)                            */}
            {/* ============================================================== */}
            {viewMode === "months" && (
              <div className="grid grid-cols-3 gap-1.5 py-1">
                {MONTHS_LIST.map((m) => {
                  const isSelected =
                    internalDate &&
                    getMonth(internalDate) === m.index &&
                    getYear(internalDate) === getYear(viewDate);
                  const isThisMonth =
                    getMonth(new Date()) === m.index && getYear(new Date()) === getYear(viewDate);

                  return (
                    <button
                      key={m.index}
                      type="button"
                      onClick={() => {
                        setViewDate((prev) => setMonth(prev, m.index));
                        setViewMode("days");
                      }}
                      className={cn(
                        "h-[34px] rounded-[var(--radius-md)] text-[12px] font-medium transition-colors cursor-pointer select-none flex items-center justify-center",
                        isSelected
                          ? "bg-[var(--color-brand)] text-white font-semibold"
                          : isThisMonth
                          ? "ring-1 ring-[var(--color-brand)] text-[var(--color-brand-ink)] font-semibold hover:bg-[var(--color-brand-subtle)]"
                          : "text-[var(--color-text)] hover:bg-[var(--color-brand-subtle)]"
                      )}
                    >
                      {m.full}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ============================================================== */}
            {/* VIEW 3: YEARS (Quick Year Picker)                              */}
            {/* ============================================================== */}
            {viewMode === "years" && (
              <div className="grid grid-cols-3 gap-1.5 py-1">
                {yearsInView.map((yr) => {
                  const isSelected = internalDate && getYear(internalDate) === yr;
                  const isThisYear = getYear(new Date()) === yr;

                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        setViewDate((prev) => setYear(prev, yr));
                        setViewMode("months");
                      }}
                      className={cn(
                        "h-[34px] rounded-[var(--radius-md)] text-[12.5px] font-mono transition-colors cursor-pointer select-none flex items-center justify-center",
                        isSelected
                          ? "bg-[var(--color-brand)] text-white font-semibold"
                          : isThisYear
                          ? "ring-1 ring-[var(--color-brand)] text-[var(--color-brand-ink)] font-semibold hover:bg-[var(--color-brand-subtle)]"
                          : "text-[var(--color-text)] hover:bg-[var(--color-brand-subtle)]"
                      )}
                    >
                      {yr}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Footer Clear & Today / Back Actions */}
            <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] mt-2.5 pt-2 text-[12px]">
              {viewMode === "days" ? (
                <>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-[var(--color-brand)] hover:underline cursor-pointer select-none"
                  >
                    Bersihkan
                  </button>
                  <button
                    type="button"
                    onClick={handleToday}
                    className="text-[var(--color-brand)] font-medium hover:underline cursor-pointer select-none"
                  >
                    Hari ini
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setViewMode("days")}
                    className="text-[var(--color-brand)] hover:underline cursor-pointer select-none"
                  >
                    Kembali ke tanggal
                  </button>
                  <button
                    type="button"
                    onClick={handleToday}
                    className="text-[var(--color-brand)] font-medium hover:underline cursor-pointer select-none"
                  >
                    Hari ini
                  </button>
                </>
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  }
);

DatePicker.displayName = "DatePicker";
