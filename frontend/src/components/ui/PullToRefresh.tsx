import { ReactNode } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  enabled?: boolean;
}

export default function PullToRefresh({
  onRefresh,
  children,
  enabled = true,
}: PullToRefreshProps) {
  const { isPulling, isRefreshing, pullDistance, threshold } = usePullToRefresh({
    onRefresh,
    enabled,
  });

  const showIndicator = isPulling || isRefreshing;
  const shouldRefresh = pullDistance >= threshold;

  return (
    <div className="relative">
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 overflow-hidden',
          showIndicator ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          height: showIndicator ? `${Math.min(pullDistance, 60)}px` : '0px',
        }}
      >
        <div className="flex flex-col items-center gap-1">
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <ArrowDown
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform',
                shouldRefresh && 'rotate-180 text-primary'
              )}
            />
          )}
          <span className="text-xs text-muted-foreground">
            {isRefreshing
              ? 'Refreshing...'
              : shouldRefresh
              ? 'Release to refresh'
              : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className={cn('transition-transform duration-200')}
        style={{
          transform: showIndicator ? `translateY(${Math.min(pullDistance, 60)}px)` : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
