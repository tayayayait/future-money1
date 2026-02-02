import { useState, useCallback, useRef, useEffect } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // Pull distance to trigger refresh
  maxPull?: number;   // Maximum pull distance
}

interface UsePullToRefreshReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
}

/**
 * Pull-to-Refresh 제스처 훅
 * 
 * @example
 * const { containerRef, isRefreshing, pullDistance } = usePullToRefresh({
 *   onRefresh: async () => {
 *     await queryClient.refetchQueries();
 *   }
 * });
 * 
 * return (
 *   <div ref={containerRef}>
 *     {pullDistance > 0 && <RefreshIndicator distance={pullDistance} />}
 *     <Content />
 *   </div>
 * );
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPull = 120,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      setPullDistance(0);
      return;
    }
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0) {
      // Resistance factor for pull
      const distance = Math.min(diff * 0.5, maxPull);
      setPullDistance(distance);
      
      // Prevent default scroll when pulling
      if (diff > 10) {
        e.preventDefault();
      }
    } else {
      setPullDistance(0);
    }
  }, [isPulling, isRefreshing, maxPull]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold / 2); // Show partial indicator during refresh
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    isPulling,
  };
}

/**
 * Pull-to-Refresh 인디케이터 컴포넌트
 */
interface PullToRefreshIndicatorProps {
  distance: number;
  threshold?: number;
  isRefreshing?: boolean;
}

export function PullToRefreshIndicator({
  distance,
  threshold = 80,
  isRefreshing = false,
}: PullToRefreshIndicatorProps) {
  const progress = Math.min(distance / threshold, 1);
  const rotation = progress * 360;

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center justify-center overflow-hidden pointer-events-none z-50"
      style={{ height: distance }}
    >
      <div
        className={`w-8 h-8 rounded-full border-2 border-primary border-t-transparent transition-opacity ${
          isRefreshing ? 'animate-spin' : ''
        }`}
        style={{
          opacity: progress,
          transform: `rotate(${rotation}deg)`,
        }}
      />
    </div>
  );
}
