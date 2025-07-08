import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PullToRefresh = ({ onRefresh, children, threshold = 80 }) => {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    // Only trigger if at the top of the page
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling || startY === 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (diff > 0) {
      // Prevent default scrolling when pulling down
      e.preventDefault();
      
      // Apply resistance for smoother feel
      const resistance = 0.5;
      const distance = Math.min(diff * resistance, threshold * 1.5);
      
      setPullDistance(distance);
      setCurrentY(currentY);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);
    setStartY(0);
    setCurrentY(0);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh error:', error);
      }
      setIsRefreshing(false);
    }

    setPullDistance(0);
  };

  // Mouse events for desktop testing
  const handleMouseDown = (e) => {
    if (window.scrollY === 0) {
      setStartY(e.clientY);
      setIsPulling(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isPulling || startY === 0) return;

    const currentY = e.clientY;
    const diff = currentY - startY;

    if (diff > 0) {
      const resistance = 0.5;
      const distance = Math.min(diff * resistance, threshold * 1.5);
      setPullDistance(distance);
      setCurrentY(currentY);
    }
  };

  const handleMouseUp = async () => {
    if (!isPulling) return;

    setIsPulling(false);
    setStartY(0);
    setCurrentY(0);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh error:', error);
      }
      setIsRefreshing(false);
    }

    setPullDistance(0);
  };

  useEffect(() => {
    // Add mouse event listeners for desktop testing
    if (isPulling) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPulling, startY, pullDistance]);

  const refreshOpacity = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ 
              opacity: isRefreshing ? 1 : refreshOpacity,
              y: isRefreshing ? 0 : -60 + (pullDistance * 0.8)
            }}
            exit={{ opacity: 0, y: -60 }}
            className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center"
            style={{
              height: '60px',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center gap-2">
              {isRefreshing ? (
                <>
                  <svg 
                    className="animate-spin h-5 w-5 text-blue-600" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeDasharray="31.416"
                      strokeDashoffset="31.416"
                      className="opacity-25"
                    />
                    <path 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      className="opacity-75"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Refreshing...
                  </span>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ 
                      rotate: shouldTrigger ? 180 : 0,
                      scale: shouldTrigger ? 1.1 : 1
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg 
                      className={`h-5 w-5 ${shouldTrigger ? 'text-green-600' : 'text-gray-400'}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                      />
                    </svg>
                  </motion.div>
                  <span className={`text-sm font-medium ${shouldTrigger ? 'text-green-600' : 'text-gray-500'}`}>
                    {shouldTrigger ? 'Release to refresh' : 'Pull to refresh'}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
