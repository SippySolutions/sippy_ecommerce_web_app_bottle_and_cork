import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for implementing intersection observer
 * Used for lazy loading and infinite scroll
 */
export const useIntersectionObserver = ({
  threshold = 0.1,
  root = null,
  rootMargin = '0px',
  triggerOnce = false
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersectingNow = entry.isIntersecting;
        
        if (triggerOnce) {
          if (isIntersectingNow && !hasTriggered) {
            setIsIntersecting(true);
            setHasTriggered(true);
          }
        } else {
          setIsIntersecting(isIntersectingNow);
        }
      },
      {
        threshold,
        root,
        rootMargin
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [threshold, root, rootMargin, triggerOnce, hasTriggered]);

  return { targetRef, isIntersecting };
};

/**
 * Custom hook for infinite scroll
 */
export const useInfiniteScroll = ({
  fetchMore,
  hasMore,
  threshold = 0.1,
  rootMargin = '100px'
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin
  });

  useEffect(() => {
    if (isIntersecting && hasMore && !isFetching) {
      setIsFetching(true);
      fetchMore().finally(() => {
        setIsFetching(false);
      });
    }
  }, [isIntersecting, hasMore, isFetching, fetchMore]);

  return { targetRef, isFetching };
};

/**
 * Lazy loaded image component with optimized loading
 */
export const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = null,
  onLoad = () => {},
  onError = () => {},
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const { targetRef, isIntersecting } = useIntersectionObserver({
    triggerOnce: true,
    rootMargin: '50px'
  });

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsError(true);
    onError();
  }, [onError]);

  return (
    <div ref={targetRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder/skeleton */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          {placeholder || (
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      )}
      
      {/* Actual image - only load when in viewport */}
      {isIntersecting && (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}
      
      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Failed to load</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Skeleton loader for product cards
 */
export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
        
        {/* Price skeleton */}
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        
        {/* Button skeleton */}
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
};

/**
 * Grid of skeleton loaders
 */
export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};
