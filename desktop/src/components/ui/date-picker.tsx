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
  minDate?: string | Date;
  maxDate?: string | Date;
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
      minDate,
      maxDate,
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

    const minIso = React.useMemo(() => {
      if (!minDate) return undefined;
      if (minDate instanceof Date) return format(minDate, "yyyy-MM-dd");
      return minDate;
    }, [minDate]);

    const maxIso = React.useMemo(() => {
      if (!maxDate) return undefined;
      if (maxDate instanceof Date) return format(maxDate, "yyyy-MM-dd");
      return maxDate;
    }, [maxDate]);

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
        } else if (minIso) {
          const mDate = normalizeDate(minIso);
          if (mDate) {
            setViewDate(mDate);
            setYearRangeStart(Math.floor(getYear(mDate) / 12) * 12);
          }
        } else {
          setYearRangeStart(Math.floor(getYear(viewDate) / 12) * 12);
        }
      } else {
        setViewMode("days");
      }
    }, [open, minIso]);

    const handleSelectDay = (day: Date) => {
      const isoStr = format(day, "yyyy-MM-dd");
      if (minIso && isoStr < minIso) return;
      if (maxIso && isoStr > maxIso) return;
      setInternalDate(day);
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
      const isoStr = format(today, "yyyy-MM-dd");
      if (minIso && isoStr < minIso) return;
      if (maxIso && isoStr > maxIso) return;
      setInternalDate(today);
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
              "flex w-full items-center justify-between rounded-md bg-(--color-surface) text-(--color-text) transition-colors duration-(--dur-fast) cursor-pointer select-none",
              "focus:outline-none",
              density === "compact"
                ? "h-(--density-control-h) px-2 text-[12.5px]"
                : "h-8 px-3 text-[13.5px]",
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
                !displayLabel && "text-(--color-text-muted)"
              )}
            >
              {displayLabel ?? placeholder}
            </span>
            <Calendar16Regular
              className={cn(
                "flex-none ml-1.5",
                error
                  ? "text-(--color-danger)"
                  : disabled
                  ? "text-(--color-text-muted)"
                  : "text-(--color-icon-faint)"
              )}
            />
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={3}
            className={cn(
              "z-50 w-52 rounded-[6px] border border-[#C8C6C4] bg-white p-2 text-(--color-text) shadow-(--shadow-overlay) outline-none duration-75 select-none",
              "animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1"
            )}
          >
            {/* Calendar Navigation Header */}
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              {/* Header Title with interactive quick jump buttons */}
              {viewMode === "days" && (
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    title="Pilih bulan"
                    onClick={() => setViewMode("months")}
                    className="flex items-center gap-0.5 font-semibold text-[12px] text-(--color-text) hover:text-(--color-brand) hover:bg-(--color-surface-sunken) px-1 py-0.5 rounded-[3px] cursor-pointer transition-colors capitalize"
                  >
                    <span>{format(viewDate, "MMMM", { locale: id })}</span>
                    <ChevronDown12Regular className="text-(--color-text-muted) w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    title="Pilih tahun"
                    onClick={() => {
                      setYearRangeStart(Math.floor(getYear(viewDate) / 12) * 12);
                      setViewMode("years");
                    }}
                    className="flex items-center gap-0.5 font-semibold text-[12px] text-(--color-text) hover:text-(--color-brand) hover:bg-(--color-surface-sunken) px-1 py-0.5 rounded-[3px] cursor-pointer transition-colors"
                  >
                    <span>{format(viewDate, "yyyy")}</span>
                    <ChevronDown12Regular className="text-(--color-text-muted) w-3 h-3" />
                  </button>
                </div>
              )}

              {viewMode === "months" && (
                <div className="flex items-center">
                  <button
                    type="button"
                    title="Pilih tahun"
                    onClick={() => {
                      setYearRangeStart(Math.floor(getYear(viewDate) / 12) * 12);
                      setViewMode("years");
                    }}
                    className="flex items-center gap-0.5 font-semibold text-[12px] text-(--color-text) hover:text-(--color-brand) hover:bg-(--color-surface-sunken) px-1 py-0.5 rounded-[3px] cursor-pointer transition-colors"
                  >
                    <span>{getYear(viewDate)}</span>
                    <ChevronDown12Regular className="text-(--color-text-muted) w-3 h-3" />
                  </button>
                </div>
              )}

              {viewMode === "years" && (
                <div className="font-semibold text-[12px] text-(--color-text) px-1 py-0.5 select-none">
                  {yearRangeStart} – {yearRangeStart + 11}
                </div>
              )}

              {/* Prev and Next navigation chevrons */}
              <div className="flex items-center gap-0.5">
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
                  className="h-5 w-5 flex items-center justify-center rounded-[3px] text-(--color-text-secondary) hover:bg-(--color-surface-sunken) hover:text-(--color-text) cursor-pointer transition-colors"
                >
                  <ChevronLeft12Regular className="w-3.5 h-3.5" />
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
                  className="h-5 w-5 flex items-center justify-center rounded-[3px] text-(--color-text-secondary) hover:bg-(--color-surface-sunken) hover:text-(--color-text) cursor-pointer transition-colors"
                >
                  <ChevronRight12Regular className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ============================================================== */}
            {/* VIEW 1: DAYS (Default)                                         */}
            {/* ============================================================== */}
            {viewMode === "days" && (
              <>
                {/* Days of Week Row */}
                <div className="grid grid-cols-7 gap-0.5 text-center mb-0.5">
                  {weekDays.map((d) => (
                    <div
                      key={d}
                      className="text-[10px] font-semibold text-(--color-text-muted) py-0.5 select-none"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-0.5">
                  {daysInView.map((day) => {
                    const inCurrentMonth = isSameMonth(day, viewDate);
                    const selected = internalDate && isSameDay(day, internalDate);
                    const today = isToday(day);
                    const dayIso = format(day, "yyyy-MM-dd");
                    const isDayDisabled = Boolean(
                      (minIso && dayIso < minIso) || (maxIso && dayIso > maxIso)
                    );

                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        disabled={isDayDisabled}
                        onClick={() => handleSelectDay(day)}
                        className={cn(
                          "h-6 w-6 mx-auto flex items-center justify-center rounded-full text-[11.5px] font-normal select-none transition-colors border",
                          isDayDisabled
                            ? "border-transparent text-(--color-text-muted) opacity-25 cursor-not-allowed pointer-events-none hover:bg-transparent"
                            : "cursor-pointer",
                          !isDayDisabled &&
                            selected &&
                            "border-(--color-brand) bg-(--color-brand) text-white font-semibold hover:bg-(--color-brand)",
                          !isDayDisabled &&
                            !selected &&
                            today &&
                            "border-(--color-brand) text-(--color-brand) font-semibold hover:bg-(--color-brand-subtle)",
                          !isDayDisabled &&
                            !selected &&
                            !today &&
                            inCurrentMonth &&
                            "border-transparent text-(--color-text) hover:bg-(--color-brand-subtle)",
                          !isDayDisabled &&
                            !selected &&
                            !today &&
                            !inCurrentMonth &&
                            "border-transparent text-(--color-icon-faint) hover:bg-(--color-surface-alt)"
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
              <div className="grid grid-cols-4 gap-1 py-1">
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
                      title={m.full}
                      onClick={() => {
                        setViewDate((prev) => setMonth(prev, m.index));
                        setViewMode("days");
                      }}
                      className={cn(
                        "h-6.5 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer select-none flex items-center justify-center border",
                        isSelected
                          ? "border-(--color-brand) bg-(--color-brand) text-white font-semibold"
                          : isThisMonth
                          ? "border-(--color-brand) text-(--color-brand) font-semibold hover:bg-(--color-brand-subtle)"
                          : "border-transparent text-(--color-text) hover:bg-(--color-brand-subtle)"
                      )}
                    >
                      {m.short}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ============================================================== */}
            {/* VIEW 3: YEARS (Quick Year Picker)                              */}
            {/* ============================================================== */}
            {viewMode === "years" && (
              <div className="grid grid-cols-4 gap-1 py-1">
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
                        "h-6.5 rounded-[4px] text-[11px] font-mono transition-colors cursor-pointer select-none flex items-center justify-center border",
                        isSelected
                          ? "border-(--color-brand) bg-(--color-brand) text-white font-semibold"
                          : isThisYear
                          ? "border-(--color-brand) text-(--color-brand) font-semibold hover:bg-(--color-brand-subtle)"
                          : "border-transparent text-(--color-text) hover:bg-(--color-brand-subtle)"
                      )}
                    >
                      {yr}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Footer Clear & Today / Back Actions */}
            <div className="flex items-center justify-between border-t border-(--color-border-subtle) mt-1.5 pt-1.5 px-0.5 text-[11.5px]">
              {viewMode === "days" ? (
                <>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-(--color-brand) hover:underline cursor-pointer select-none"
                  >
                    Bersihkan
                  </button>
                  <button
                    type="button"
                    onClick={handleToday}
                    disabled={Boolean(
                      (minIso && format(new Date(), "yyyy-MM-dd") < minIso) ||
                      (maxIso && format(new Date(), "yyyy-MM-dd") > maxIso)
                    )}
                    className="text-(--color-brand) font-medium hover:underline cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                  >
                    Hari ini
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setViewMode("days")}
                    className="text-(--color-brand) hover:underline cursor-pointer select-none"
                  >
                    Kembali ke tanggal
                  </button>
                  <button
                    type="button"
                    onClick={handleToday}
                    disabled={Boolean(
                      (minIso && format(new Date(), "yyyy-MM-dd") < minIso) ||
                      (maxIso && format(new Date(), "yyyy-MM-dd") > maxIso)
                    )}
                    className="text-(--color-brand) font-medium hover:underline cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
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
