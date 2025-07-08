import React, { useState, useEffect, useRef } from 'react';

const PullToRefreshSimple = ({ onRefresh, children, threshold = 70 }) => {
  const [startY, setStartY] = useState(0);
  const [pullY, setPullY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  // Check if we can pull (at top of page)
  const canPull = () => {
    return window.scrollY === 0 && window.pageYOffset === 0;
  };

  const handleTouchStart = (e) => {
    if (canPull() && !isRefreshing) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling || !canPull()) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0) {
      // Prevent default scroll behavior
      e.preventDefault();
      
      // Calculate pull distance with resistance
      const resistance = 0.4;
      const pullDistance = Math.min(deltaY * resistance, threshold * 1.5);
      
      setPullY(pullDistance);
      
      // Update content transform
      if (contentRef.current) {
        contentRef.current.style.transform = `translateY(${pullDistance}px)`;
        contentRef.current.style.transition = 'none';
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);
    
    // Check if we should trigger refresh
    const shouldRefresh = pullY >= threshold;
    
    if (shouldRefresh && !isRefreshing) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      }
      
      setIsRefreshing(false);
    }
    
    // Reset position
    setPullY(0);
    setStartY(0);
    
    // Animate back to original position
    if (contentRef.current) {
      contentRef.current.style.transform = 'translateY(0)';
      contentRef.current.style.transition = 'transform 0.3s ease-out';
    }
  };

  // Keyboard shortcut for desktop testing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        onRefresh();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRefresh]);

  const refreshProgress = Math.min(pullY / threshold, 1);
  const shouldTrigger = pullY >= threshold;

  return (
    <div
      ref={containerRef}
      className="pull-to-refresh-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        overflow: 'hidden',
        touchAction: isPulling ? 'none' : 'auto'
      }}
    >
      {/* Refresh indicator */}
      {(pullY > 0 || isRefreshing) && (
        <div
          className="refresh-indicator"
          style={{
            opacity: isRefreshing ? 1 : refreshProgress,
            transform: `translateY(${isRefreshing ? 0 : -60 + (pullY * 0.8)}px)`
          }}
        >
          <div className="flex items-center gap-2">
            {isRefreshing ? (
              <>
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-gray-700">Refreshing...</span>
              </>
            ) : (
              <>
                <div 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    shouldTrigger ? 'transform rotate-180 text-green-500' : 'text-gray-400'
                  }`}
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${shouldTrigger ? 'text-green-500' : 'text-gray-500'}`}>
                  {shouldTrigger ? 'Release to refresh' : 'Pull to refresh'}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div
        ref={contentRef}
        className="pull-to-refresh-content"
        style={{
          minHeight: '100vh',
          transform: 'translateY(0)',
          transition: 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefreshSimple;
