import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  cause: string; // Explains the reason
  primaryAction: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  metaSummary?: React.ReactNode; // e.g. "48 siswa · 6 subjek sudah terdaftar" or active filter chips
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  cause,
  primaryAction,
  secondaryAction,
  metaSummary,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-6 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-white max-w-[480px] mx-auto",
        className
      )}
    >
      {metaSummary && <div className="mb-3">{metaSummary}</div>}

      {icon && (
        <div className="mb-2 text-[24px] text-[var(--color-brand)] flex items-center justify-center">
          {icon}
        </div>
      )}

      <h3 className="text-[15px] font-semibold text-[var(--color-text)]">
        {title}
      </h3>

      <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--color-text-secondary)] max-w-[360px]">
        &ldquo;{cause}&rdquo;
      </p>

      {/* Two action buttons: one to advance, one to exit state */}
      <div className="mt-4 flex items-center gap-2">
        <Button
          variant={primaryAction.variant || "primary"}
          onClick={primaryAction.onClick}
        >
          {primaryAction.label}
        </Button>

        {secondaryAction && (
          <Button
            variant={secondaryAction.variant || "secondary"}
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
};

