import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface ColumnSkeletonDef {
  width: string;
  headerTitle?: string;
  headerWidth?: string;
  align?: 'left' | 'right' | 'center';
  isFlex?: boolean;
}

export interface MasterTableSkeletonProps {
  columns: ColumnSkeletonDef[];
  rowCount?: number;
  minWidth?: string;
  className?: string;
  hasFooter?: boolean;
  footerWidth?: string;
}

export function MasterTableSkeleton({
  columns,
  rowCount = 9,
  minWidth,
  className,
  hasFooter = true,
  footerWidth,
}: MasterTableSkeletonProps) {
  return (
    <div className={cn('flex flex-1 min-h-0 flex-col overflow-hidden', className)}>
      <div className="flex-1 min-h-0 overflow-auto">
        <div className={cn('flex flex-col min-h-full w-full', minWidth)}>
          {/* Sticky Header */}
          <div className="sticky top-0 z-3 flex h-6.5 shrink-0 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
            {columns.map((col, idx) => (
              <div
                key={idx}
                className={cn(
                  col.isFlex ? 'flex-1' : col.width,
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  'shrink-0 pr-2'
                )}
              >
                {col.headerTitle ? (
                  <span>{col.headerTitle}</span>
                ) : (
                  <Skeleton className={cn('h-2.5', col.headerWidth || 'w-16')} />
                )}
              </div>
            ))}
          </div>

          {/* Shimmer Rows */}
          <div className="flex flex-col">
            {Array.from({ length: rowCount }).map((_, rIdx) => (
              <div
                key={rIdx}
                className="flex h-8 shrink-0 items-center border-b border-(--color-border-subtle) px-3.5 bg-(--color-surface)"
              >
                {columns.map((col, cIdx) => (
                  <div
                    key={cIdx}
                    className={cn(
                      col.isFlex ? 'flex-1' : col.width,
                      col.align === 'right' && 'flex justify-end',
                      col.align === 'center' && 'flex justify-center',
                      'shrink-0 pr-2'
                    )}
                  >
                    <Skeleton
                      className={cn(
                        'h-3.5',
                        cIdx === 0
                          ? 'w-4/5'
                          : col.align === 'right'
                          ? 'w-8'
                          : cIdx % 2 === 0
                          ? 'w-3/5'
                          : 'w-4/6'
                      )}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      {hasFooter && (
        <div className="flex h-7.5 shrink-0 items-center border-t border-(--color-border) bg-(--color-surface-alt) px-3.5">
          <Skeleton className={cn('h-3', footerWidth || 'w-48')} />
        </div>
      )}
    </div>
  );
}
