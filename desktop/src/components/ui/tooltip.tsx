import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipPortal = TooltipPrimitive.Portal;

export const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-[4px] bg-[#242424] px-2.5 py-1 text-[11.5px] text-white shadow-md border border-[#383838] leading-tight select-none',
        'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 duration-(--dur-fast)',
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * Convenient wrapper for declarative tooltip usage:
 * <TooltipWrapper content="Tooltip text">
 *   <button>Hover me</button>
 * </TooltipWrapper>
 */
export interface TooltipWrapperProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  delayDuration?: number;
  className?: string;
  asChild?: boolean;
}

export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  content,
  children,
  side = 'top',
  align = 'center',
  sideOffset = 4,
  delayDuration = 350,
  className,
  asChild = true,
}) => {
  if (!content) return children;

  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align} sideOffset={sideOffset} className={className}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
};

interface TooltipState {
  text: string;
  targetRect: DOMRect;
  left: number;
  top: number;
}

/**
 * GlobalTooltip replaces native browser tooltips across the entire application.
 * It listens via event delegation on any element with `title` or `data-tooltip`,
 * suppresses the browser native tooltip box, and renders a sleek Fluent-styled floating tooltip
 * that never clips outside viewport boundaries or prematurely squishes words.
 */
export const GlobalTooltip: React.FC = () => {
  const [tooltipState, setTooltipState] = React.useState<TooltipState | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const timerRef = React.useRef<number | null>(null);
  const currentTargetRef = React.useRef<HTMLElement | null>(null);

  // Synchronous position measurement & exact bounds clamping before browser paint
  React.useLayoutEffect(() => {
    const el = tooltipRef.current;
    if (!el || !tooltipState) return;

    const tooltipRect = el.getBoundingClientRect();
    const { targetRect } = tooltipState;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // 1. Horizontal: center over target, clamp to stay at least 8px from viewport edges
    let left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
    if (left + tooltipRect.width > viewportW - 8) {
      left = viewportW - 8 - tooltipRect.width;
    }
    if (left < 8) {
      left = 8;
    }

    // 2. Vertical:
    // If target is in top header/bar (top < 44), always show below to avoid window titlebar collision.
    // Otherwise show above if there is enough clearance, else show below.
    let top: number;
    if (targetRect.top >= 44 && targetRect.top - tooltipRect.height - 6 >= 6) {
      top = targetRect.top - tooltipRect.height - 6;
    } else {
      top = targetRect.bottom + 6;
    }

    // Clamp vertical inside viewport
    if (top + tooltipRect.height > viewportH - 8) {
      top = Math.max(8, viewportH - 8 - tooltipRect.height);
    }

    el.style.left = `${Math.round(left)}px`;
    el.style.top = `${Math.round(top)}px`;
    el.style.opacity = '1';
    el.style.transform = 'scale(1)';
  }, [tooltipState]);

  React.useEffect(() => {
    const handlePointerOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[title], [data-tooltip]');
      if (!target) return;

      // Swap title attribute to data-tooltip to suppress native browser tooltip
      const rawTitle = target.getAttribute('title');
      if (rawTitle) {
        target.setAttribute('data-tooltip', rawTitle);
        target.removeAttribute('title');
        if (!target.getAttribute('aria-label') && !target.getAttribute('aria-labelledby')) {
          target.setAttribute('aria-label', rawTitle);
        }
      }

      const text = target.getAttribute('data-tooltip');
      if (!text || !text.trim()) return;

      currentTargetRef.current = target;

      const showTooltip = () => {
        if (!currentTargetRef.current) return;
        const rect = currentTargetRef.current.getBoundingClientRect();
        const viewportW = window.innerWidth;
        const spaceAbove = rect.top;
        const placeTop = spaceAbove >= 44 && rect.top - 32 >= 6;
        const initTop = placeTop ? rect.top - 32 : rect.bottom + 6;
        const initLeft = Math.max(8, Math.min(viewportW - 120, rect.left + rect.width / 2 - 50));

        setTooltipState({
          text,
          targetRect: rect,
          left: Math.round(initLeft),
          top: Math.round(initTop),
        });
      };

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      // Deliberate hover delay (~650ms like native web) so glancing cursor movement doesn't flicker tooltips
      const delay = 650;
      timerRef.current = window.setTimeout(showTooltip, delay);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!currentTargetRef.current) return;
      const target = e.target as Node | null;
      if (target && !currentTargetRef.current.contains(target)) {
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        currentTargetRef.current = null;
        setTooltipState(null);
      }
    };

    const handlePointerOut = (e: PointerEvent) => {
      if (!currentTargetRef.current) return;
      const related = e.relatedTarget as Node | null;
      if (!related || !currentTargetRef.current.contains(related)) {
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        currentTargetRef.current = null;
        setTooltipState(null);
      }
    };

    const handleDismiss = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      currentTargetRef.current = null;
      setTooltipState(null);
    };

    document.addEventListener('pointerover', handlePointerOver, { passive: true });
    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerout', handlePointerOut, { passive: true });
    document.addEventListener('mouseleave', handleDismiss, { passive: true });
    window.addEventListener('scroll', handleDismiss, { passive: true, capture: true });
    window.addEventListener('click', handleDismiss, { passive: true });
    window.addEventListener('blur', handleDismiss);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') handleDismiss();
    });

    return () => {
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerout', handlePointerOut);
      document.removeEventListener('mouseleave', handleDismiss);
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('click', handleDismiss);
      window.removeEventListener('blur', handleDismiss);
    };
  }, []);

  if (!tooltipState) return null;

  const isShortText = tooltipState.text.length <= 45;

  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'fixed',
        left: `${tooltipState.left}px`,
        top: `${tooltipState.top}px`,
        opacity: 0,
        transform: 'scale(0.96)',
      }}
      className={cn(
        'pointer-events-none z-99999 rounded-[4px] bg-[#242424] px-2.5 py-1 text-[11.5px] leading-snug font-normal text-white shadow-md border border-[#383838] select-none',
        'transition-[opacity,transform] duration-100 ease-out',
        isShortText ? 'whitespace-nowrap w-max' : 'max-w-70 w-max whitespace-normal wrap-break-word'
      )}
    >
      {tooltipState.text}
    </div>
  );
};
