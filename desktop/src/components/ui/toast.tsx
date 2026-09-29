import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Checkmark16Regular,
  Dismiss12Regular,
  ErrorCircle16Regular,
  Info16Regular,
  Warning16Regular,
} from "@fluentui/react-icons";

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastItem {
  id: string;
  type?: ToastType;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // ms, default 5000ms or 8000ms if action
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id">) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const isUrungkan = toast.action?.label?.toLowerCase().includes("urung");
      const defaultDuration = toast.type === "error" ? 0 : isUrungkan ? 8000 : 5000;
      const newToast: ToastItem = {
        ...toast,
        id,
        duration: toast.duration ?? defaultDuration,
      };

      setToasts((prev) => {
        // Max 3 stacked per DESIGN.md §3.8
        const next = [...prev, newToast];
        if (next.length > 3) {
          return next.slice(next.length - 3);
        }
        return next;
      });

      return id;
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

export const ToastCard: React.FC<{
  toast: ToastItem;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (!toast.duration || toast.duration <= 0 || isPaused) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.duration, isPaused, onDismiss]);

  const renderIcon = () => {
    switch (toast.type) {
      case "error":
        return <ErrorCircle16Regular className="text-(--color-danger-ink) flex-none" />;
      case "warning":
        return <Warning16Regular className="text-(--color-warning-ink) flex-none" />;
      case "info":
        return <Info16Regular className="text-(--color-info-ink) flex-none" />;
      case "success":
      default:
        return <Checkmark16Regular className="text-(--color-success-ink) flex-none" />;
    }
  };

  const isError = toast.type === "error";

  return (
    <div
      role="status"
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className={cn(
        "pointer-events-auto w-77.5 rounded-lg p-2.5 flex items-center gap-2.5 text-[12.5px] leading-snug select-none",
        "shadow-(--shadow-toast) transition-all duration-(--dur-normal) animate-in slide-in-from-bottom-2",
        "focus-visible:outline-none focus-visible:border-black focus-visible:shadow-[inset_0_0_0_1px_#000000]",
        isError
          ? "border border-(--color-danger) bg-(--color-danger-bg) text-(--color-danger-ink)"
          : "border border-(--color-border-strong) bg-white text-(--color-text)"
      )}
    >
      <div className="flex-none flex items-center justify-center">{renderIcon()}</div>

      <div className="flex-1 truncate">{toast.message}</div>

      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onDismiss();
          }}
          className={cn(
            "flex-none text-[12px] font-medium hover:underline cursor-pointer",
            isError ? "text-(--color-danger-ink) underline" : "text-(--color-brand)"
          )}
        >
          {toast.action.label}
        </button>
      )}

      <button
        type="button"
        onClick={onDismiss}
        title="Tutup pemberitahuan"
        className="flex-none text-(--color-text-muted) hover:text-(--color-text) cursor-pointer p-0.5 rounded-sm flex items-center justify-center"
      >
        <Dismiss12Regular />
      </button>
    </div>
  );
};

