// Pull-to-refresh hook for mobile native apps
import { useState, useEffect, useRef } from 'react';
import { platformUtils } from './platformUtils';

export const usePullToRefresh = (onRefresh) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const scrollableRef = useRef(null);

  const isNative = platformUtils.isNative();
  const threshold = 80; // Minimum pull distance to trigger refresh

  useEffect(() => {
    if (!isNative || !scrollableRef.current) return;

    const element = scrollableRef.current;
    let startY = 0;
    let currentY = 0;
    let isTracking = false;

    const handleTouchStart = (e) => {
      // Only trigger if at top of scroll
      if (element.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isTracking = true;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e) => {
      if (!isTracking || element.scrollTop > 0) return;

      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      if (deltaY > 0) {
        e.preventDefault();
        const distance = Math.min(deltaY * 0.5, threshold + 20);
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = () => {
      if (!isTracking) return;

      isTracking = false;
      setIsPulling(false);

      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        onRefresh().finally(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        });
      } else {
        setPullDistance(0);
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isNative, onRefresh, pullDistance, threshold]);

  return {
    isRefreshing,
    pullDistance,
    isPulling,
    scrollableRef,
    isNative
  };
};
