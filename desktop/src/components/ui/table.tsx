import * as React from "react";
import { cn } from "@/lib/utils";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  density?: "compact";
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, density = "compact", ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn(
          "w-full caption-bottom text-[12.5px] border-collapse text-left [--row-h:32px]",
          className
        )}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "sticky top-0 z-10 bg-(--color-surface-alt) border-b border-(--color-border) uppercase text-[11px] font-semibold tracking-[0.09em] text-(--color-text-muted)",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  warning?: boolean; // Needs action
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected = false, warning = false, ...props }, ref) => (
    <tr
      ref={ref}
      tabIndex={0}
      className={cn(
        "h-8 border-b border-(--color-border-subtle) transition-colors duration-(--dur-instant) cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_#000000]",
        warning
          ? "bg-(--color-warning-bg) text-(--color-warning-ink) hover:bg-[#FFE8CC]"
          : selected
          ? "bg-(--color-brand-subtle) text-(--color-brand-ink) shadow-[inset_3px_0_0_var(--color-brand)] font-medium"
          : "bg-white hover:bg-(--color-surface-alt) text-(--color-text)",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-7 px-3 font-semibold text-[10.5px] tracking-[0.09em] text-(--color-text-muted) align-middle uppercase",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  mono?: boolean;
  alignRight?: boolean;
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, mono = false, alignRight = false, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "px-3 align-middle truncate",
        mono && "font-mono tabular-nums",
        alignRight && "text-right",
        className
      )}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";

