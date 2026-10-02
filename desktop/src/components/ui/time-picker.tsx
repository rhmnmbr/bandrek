import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Clock16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/utils";

export interface TimePickerProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (time: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean | string;
  density?: "compact" | "comfortable";
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

export const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  (
    {
      id,
      name,
      value: propValue,
      defaultValue,
      onChange,
      onBlur,
      placeholder = "00:00",
      disabled = false,
      error = false,
      density = "compact",
      className,
    },
    ref
  ) => {
    const [internalTime, setInternalTime] = React.useState<string>(
      propValue ?? defaultValue ?? ""
    );
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
      if (propValue !== undefined) {
        setInternalTime(propValue);
      }
    }, [propValue]);

    const [currentHour, currentMinute] = React.useMemo(() => {
      const parts = (internalTime || "").split(":");
      return [parts[0] || "", parts[1] || ""];
    }, [internalTime]);

    const hourContainerRef = React.useRef<HTMLDivElement>(null);
    const minuteContainerRef = React.useRef<HTMLDivElement>(null);

    // Scroll active values into view when popover opens
    React.useEffect(() => {
      if (open) {
        requestAnimationFrame(() => {
          if (hourContainerRef.current) {
            const activeH = hourContainerRef.current.querySelector<HTMLElement>(
              `[data-active="true"]`
            );
            if (activeH) {
              activeH.scrollIntoView({ block: "center" });
            }
          }
          if (minuteContainerRef.current) {
            const activeM = minuteContainerRef.current.querySelector<HTMLElement>(
              `[data-active="true"]`
            );
            if (activeM) {
              activeM.scrollIntoView({ block: "center" });
            }
          }
        });
      }
    }, [open]);

    const handleSelectHour = (h: string) => {
      const m = currentMinute || "00";
      const newTime = `${h}:${m}`;
      setInternalTime(newTime);
      onChange?.(newTime);
    };

    const handleSelectMinute = (m: string) => {
      const h = currentHour || "08";
      const newTime = `${h}:${m}`;
      setInternalTime(newTime);
      onChange?.(newTime);
      setOpen(false);
      onBlur?.();
    };

    return (
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            onBlur?.();
          }
        }}
      >
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            id={id}
            name={name}
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
                "cursor-not-allowed border-(--color-border-subtle) bg-(--color-canvas) text-(--color-text-muted)",
              className
            )}
          >
            <span
              className={cn(
                "truncate text-left flex-1 font-mono tracking-tight",
                !internalTime && "text-(--color-text-muted) font-normal"
              )}
            >
              {internalTime || placeholder}
            </span>
            <Clock16Regular
              className={cn(
                "flex-none ml-1.5 w-3.5 h-3.5",
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
              "z-50 w-32 overflow-hidden rounded-md border border-[#C8C6C4] bg-white p-0 text-(--color-text) shadow-(--shadow-overlay) outline-none duration-75",
              "animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1"
            )}
          >
            {/* Pinned Header: Jam & Menit menempel langsung di atas */}
            <div className="grid grid-cols-2 border-b border-(--color-border-subtle) bg-(--color-surface-alt) py-1 text-[10.5px] font-semibold text-(--color-text-muted) text-center select-none">
              <div className="border-r border-(--color-border-subtle)">Jam</div>
              <div>Menit</div>
            </div>

            <div className="flex h-45 divide-x divide-(--color-border-subtle)">
              {/* Hours Column */}
              <div
                ref={hourContainerRef}
                data-time-column
                className="flex-1 overflow-y-auto p-1 space-y-0.5 scrollbar-thin [scrollbar-color:#C8C6C4_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C8C6C4] [&::-webkit-scrollbar-track]:bg-transparent"
              >
                {HOURS.map((h) => {
                  const isSelected = h === currentHour;
                  return (
                    <button
                      key={h}
                      type="button"
                      data-active={isSelected}
                      onClick={() => handleSelectHour(h)}
                      className={cn(
                        "w-full h-6 text-center text-[12px] font-mono rounded-sm cursor-pointer select-none transition-colors",
                        isSelected
                          ? "bg-(--color-brand) text-white font-semibold"
                          : "text-(--color-text) hover:bg-(--color-brand-subtle)"
                      )}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>

              {/* Minutes Column */}
              <div
                ref={minuteContainerRef}
                data-time-column
                className="flex-1 overflow-y-auto p-1 space-y-0.5 scrollbar-thin [scrollbar-color:#C8C6C4_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C8C6C4] [&::-webkit-scrollbar-track]:bg-transparent"
              >
                {MINUTES.map((m) => {
                  const isSelected = m === currentMinute;
                  return (
                    <button
                      key={m}
                      type="button"
                      data-active={isSelected}
                      onClick={() => handleSelectMinute(m)}
                      className={cn(
                        "w-full h-6 text-center text-[12px] font-mono rounded-sm cursor-pointer select-none transition-colors",
                        isSelected
                          ? "bg-(--color-brand) text-white font-semibold"
                          : "text-(--color-text) hover:bg-(--color-brand-subtle)"
                      )}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  }
);

TimePicker.displayName = "TimePicker";

export interface TimeRangePickerProps {
  start?: string;
  end?: string;
  defaultStart?: string;
  defaultEnd?: string;
  onChange?: (start: string, end: string) => void;
  disabled?: boolean;
  error?: boolean | string;
  density?: "compact" | "comfortable";
  className?: string;
}

export const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  start = "08:00",
  end = "09:30",
  defaultStart,
  defaultEnd,
  onChange,
  disabled,
  error,
  density = "compact",
  className,
}) => {
  const [startTime, setStartTime] = React.useState(start ?? defaultStart ?? "08:00");
  const [endTime, setEndTime] = React.useState(end ?? defaultEnd ?? "09:30");

  const handleStartChange = (val: string) => {
    setStartTime(val);
    onChange?.(val, endTime);
  };

  const handleEndChange = (val: string) => {
    setEndTime(val);
    onChange?.(startTime, val);
  };

  return (
    <div className={cn("flex items-center gap-1.5 w-full", className)}>
      <TimePicker
        value={startTime}
        onChange={handleStartChange}
        disabled={disabled}
        error={error}
        density={density}
      />
      <span className="text-(--color-text-muted) text-[12px] flex-none select-none">–</span>
      <TimePicker
        value={endTime}
        onChange={handleEndChange}
        disabled={disabled}
        error={error}
        density={density}
      />
    </div>
  );
};
