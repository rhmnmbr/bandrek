import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * If true (default), uses the linear shimmer gradient animation.
   * If false, falls back to standard Tailwind pulse.
   */
  shimmer?: boolean;
}

export function Skeleton({
  className,
  shimmer = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-md',
        shimmer ? 'skeleton-shimmer' : 'animate-pulse bg-(--color-surface-sunken)',
        className
      )}
      {...props}
    />
  );
}

export interface SkeletonTextProps extends SkeletonProps {
  lines?: number;
  gap?: string;
  lastLineWidth?: string;
}

export function SkeletonText({
  lines = 1,
  className,
  gap = 'gap-1.5',
  lastLineWidth = 'w-3/4',
  ...props
}: SkeletonTextProps) {
  if (lines <= 1) {
    return <Skeleton className={cn('h-3.5 w-full', className)} {...props} />;
  }

  return (
    <div className={cn('flex flex-col', gap)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => {
        const isLast = index === lines - 1;
        return (
          <Skeleton
            key={index}
            className={cn('h-3.5', isLast ? lastLineWidth : 'w-full', className)}
            {...props}
          />
        );
      })}
    </div>
  );
}

export function SkeletonAvatar({
  className,
  rounded = 'rounded-full',
  size = 'w-8 h-8',
  ...props
}: SkeletonProps & { rounded?: string; size?: string }) {
  return (
    <Skeleton
      className={cn('shrink-0', size, rounded, className)}
      {...props}
    />
  );
}

export function SkeletonBadge({
  className,
  ...props
}: SkeletonProps) {
  return (
    <Skeleton
      className={cn('h-5 w-16 rounded-(--radius-pill)', className)}
      {...props}
    />
  );
}

export function SkeletonButton({
  className,
  ...props
}: SkeletonProps) {
  return (
    <Skeleton
      className={cn('h-6.5 w-24 rounded-md', className)}
      {...props}
    />
  );
}
