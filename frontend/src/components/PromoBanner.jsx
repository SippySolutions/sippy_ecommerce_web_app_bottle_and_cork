import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMS } from '../Context/CMSContext';
import { motion, AnimatePresence } from 'framer-motion';

const PromoBanner = ({ 
  type = 'horizontal', 
  className = '', 
  title, 
  description, 
  ctaText, 
  ctaLink 
}) => {
  const { cmsData, getTheme } = useCMS();
  const theme = getTheme();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!cmsData?.promo_banner) {
    return null;
  }

  const { promo_1, promo_2, promo_3 } = cmsData.promo_banner;
  
  // Extract promo items with both image and action data
  const promoItems = [promo_1, promo_2, promo_3].filter(item => item && item.image);

  if (promoItems.length === 0) {
    return null;
  }

  // Get fallback text for promo items
  const getPromoContent = (promoItem, index) => {
    const defaultTitles = ['Special Offer', 'Limited Time', 'Exclusive Deal'];
    const defaultDescriptions = ['Amazing deals await you', 'Don\'t miss out on savings', 'Premium products at great prices'];
    const defaultCTA = ['Shop Now', 'Unlock Deal', 'Get Started'];
    
    return {
      title: promoItem.title || title || defaultTitles[index] || 'Special Offer',
      description: promoItem.description || description || defaultDescriptions[index] || 'Amazing deals await you',
      ctaText: promoItem.cta_text || ctaText || defaultCTA[index] || 'Shop Now'
    };
  };

  // Handle click navigation based on action
  const handleBannerClick = (promoItem) => {
    try {
      if (!promoItem?.action) {
        return;
      }

      switch (promoItem.action) {
        case 'products':
          navigate('/products');
          break;
        case 'product-group':
          if (promoItem.group_id) {
            navigate(`/collections/${promoItem.group_id}`);
          } else {
            navigate('/collections');
          }
          break;
        case 'brand':
          if (promoItem.brand) {
            navigate(`/products?brand=${encodeURIComponent(promoItem.brand)}`);
          } else {
            navigate('/products');
          }
          break;
        case 'department':
          if (promoItem.department) {
            navigate(`/products?department=${encodeURIComponent(promoItem.department)}`);
          } else {
            navigate('/products');
          }
          break;
        case 'category':
          if (promoItem.category && promoItem.department) {
            navigate(`/products?department=${encodeURIComponent(promoItem.department)}&category=${encodeURIComponent(promoItem.category)}`);
          } else {
            navigate('/products');
          }
          break;
        default:
          navigate('/products');
          break;
      }
    } catch (error) {
      // Fallback navigation
      navigate('/products');
    }
  };

  // Auto-advance carousel for mobile and carousel type
  useEffect(() => {
    if ((isMobile || type === 'carousel') && promoItems.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % promoItems.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isMobile, type, promoItems.length]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  // Handle swipe navigation on mobile with better touch sensitivity
  const handleSwipe = (direction) => {
    if (isMobile && promoItems.length > 1) {
      if (direction === 'left') {
        setCurrentIndex((prev) => (prev + 1) % promoItems.length);
      } else if (direction === 'right') {
        setCurrentIndex((prev) => (prev - 1 + promoItems.length) % promoItems.length);
      }
    }
  };

  // Handle banner click with drag detection
  const handleBannerClickWithDrag = (promoItem, isDragging) => {
    if (isDragging) return; // Don't navigate if user was dragging
    handleBannerClick(promoItem);
  };
  // Main horizontal layout - new design inspired by the example
  return (
    <motion.div
      className={`w-full my-8 ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {isMobile ? (
        // Mobile Carousel View
        <div className="relative px-4">
          <div className="relative h-44 overflow-hidden rounded-2xl">
            <AnimatePresence initial={false} custom={currentIndex} mode="wait">
              <motion.div
                key={currentIndex}
                custom={currentIndex}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute inset-0"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.3}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  const swipeThreshold = 15000; // Increased threshold for less sensitivity
                  
                  if (swipe < -swipeThreshold) {
                    handleSwipe('left');
                  } else if (swipe > swipeThreshold) {
                    handleSwipe('right');
                  }
                  
                  // Reset dragging state after a short delay
                  setTimeout(() => setIsDragging(false), 100);
                }}
              >
                {(() => {
                  const promoItem = promoItems[currentIndex];
                  const content = getPromoContent(promoItem, currentIndex);
                  return (
                    <div
                      className="w-full h-full relative bg-zinc-800 rounded-2xl overflow-hidden cursor-pointer group"
                      onClick={() => handleBannerClickWithDrag(promoItem, isDragging)}
                    >
                      {/* Background Image */}
                      <div className="absolute inset-0">
                        <img
                          src={promoItem?.image}
                          alt={content.title}
                          className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Content Overlay */}
                      <div className="relative z-10 h-full px-6 py-5 flex flex-col justify-between">
                        <div className="space-y-3">
                          <h3 className="text-white text-2xl font-medium font-['Play'] leading-tight">
                            {content.title}
                          </h3>
                          <p className="text-white/90 text-xs font-normal font-['Play'] leading-relaxed">
                            {content.description}
                          </p>
                        </div>
                        
                        <button className="w-fit px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200 group-hover:scale-105 transform">
                          <span className="text-white text-xs font-bold font-['Play'] uppercase tracking-wide">
                            {content.ctaText}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation dots for mobile */}
          {promoItems.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {promoItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-red-500 w-6' 
                      : 'bg-gray-400 hover:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Desktop Horizontal Layout
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 px-4 lg:px-8">
          {promoItems.map((promoItem, index) => {
            const content = getPromoContent(promoItem, index);
            return (
              <motion.div
                key={index}
                className="flex-1 relative h-44 bg-zinc-800 rounded-2xl overflow-hidden cursor-pointer group"
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleBannerClick(promoItem)}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={promoItem?.image}
                    alt={content.title}
                    className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                    loading="lazy"
                  />
                </div>
                
                {/* Content Overlay */}
                <div className="relative z-10 h-full px-6 py-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-white text-2xl font-medium font-['Play'] leading-tight">
                      {content.title}
                    </h3>
                    <p className="text-white/90 text-xs font-normal font-['Play'] leading-relaxed max-w-80">
                      {content.description}
                    </p>
                  </div>
                  
                  <button className="w-fit px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200 group-hover:scale-105 transform">
                    <span className="text-white text-xs font-bold font-['Play'] uppercase tracking-wide">
                      {content.ctaText}
                    </span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default PromoBanner;
