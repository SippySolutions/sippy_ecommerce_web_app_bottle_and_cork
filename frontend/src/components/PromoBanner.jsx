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

  // Debug logging for mobile
  useEffect(() => {
    console.log('PromoBanner: Component mounted with type:', type);
    console.log('PromoBanner: Platform check:', {
      isCapacitor: window.Capacitor,
      userAgent: navigator.userAgent,
      platform: navigator.platform
    });
  }, [type]);

  if (!cmsData?.promo_banner) {
    console.warn('PromoBanner: No promo_banner data in CMS');
    return null;
  }

  const { promo_1, promo_2, promo_3 } = cmsData.promo_banner;
  
  // Extract promo items with both image and action data
  const promoItems = [promo_1, promo_2, promo_3].filter(item => item && item.image);

  console.log('PromoBanner: CMS data:', cmsData.promo_banner);
  console.log('PromoBanner: Filtered promo items:', promoItems);

  if (promoItems.length === 0) {
    console.warn('PromoBanner: No valid promo items found');
    return null;
  }

  // Handle click navigation based on action
  const handleBannerClick = (promoItem) => {
    try {
      if (!promoItem?.action) {
        console.warn('PromoBanner: No action defined for promo item');
        return;
      }

      console.log('PromoBanner: Navigating with action:', promoItem.action, promoItem);

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
      console.error('PromoBanner: Navigation error:', error);
      // Fallback navigation
      navigate('/products');
    }
  };

  // Auto-advance carousel for full-width banners
  useEffect(() => {
    if (type === 'carousel' && promoItems.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % promoItems.length);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [type, promoItems.length]);

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
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };  if (type === 'carousel') {
    // Full-width carousel - for under navbar
    return (
      <div className={`full-width bg-gray-100 ${className}`}>
        <div className="relative w-full h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 overflow-hidden promo-banner-container promo-banner-mobile promo-banner-tablet promo-banner-desktop">
          <AnimatePresence initial={false} custom={currentIndex}>
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
              className="absolute inset-0 cursor-pointer touch-manipulation"
              onClick={() => handleBannerClick(promoItems[currentIndex])}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleBannerClick(promoItems[currentIndex]);
              }}
            >
              <img
                src={promoItems[currentIndex]?.image}
                alt={`Promotional Banner ${currentIndex + 1}`}
                className="promo-banner-image"
                loading="lazy"
                onError={(e) => {
                  console.error('PromoBanner: Image load error:', e.target.src);
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </motion.div>
          </AnimatePresence>          {/* Navigation dots */}
          {promoItems.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
              {promoItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 border-2 touch-manipulation ${
                    index === currentIndex 
                      ? 'bg-white border-white scale-125 shadow-lg' 
                      : 'bg-transparent border-white/70 hover:border-white hover:bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Progress bar */}
          {promoItems.length > 1 && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
              <motion.div
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
                key={currentIndex}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
  if (type === 'single') {
    // Single banner display - good for between products
    const randomPromoItem = promoItems[Math.floor(Math.random() * promoItems.length)];
    return (
      <motion.div
        className={`w-full my-8 ${className}`}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div
          className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer touch-manipulation"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          onClick={() => handleBannerClick(randomPromoItem)}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleBannerClick(randomPromoItem);
          }}
        >
          <div className="relative w-full aspect-[4/1] min-h-[120px] max-h-[300px] promo-banner-container">
            <img
              src={randomPromoItem?.image}
              alt="Promotional Banner"
              className="promo-banner-image"
              loading="lazy"
              onError={(e) => {
                console.error('PromoBanner: Image load error:', e.target.src);
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </motion.div>
    );
  }
  if (type === 'grid') {
    // Grid layout for multiple banners
    return (
      <motion.div
        className={`w-full my-8 ${className}`}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promoItems.map((promoItem, index) => (
            <motion.div
              key={index}
              className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer touch-manipulation"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleBannerClick(promoItem)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleBannerClick(promoItem);
              }}
            >
              <div className="relative w-full aspect-[3/2] min-h-[180px] max-h-[280px] promo-banner-container">
                <img
                  src={promoItem?.image}
                  alt={`Promotional Banner ${index + 1}`}
                  className="promo-banner-image"
                  loading="lazy"
                  onError={(e) => {
                    console.error('PromoBanner: Image load error:', e.target.src);
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }
  // Horizontal carousel layout - default
  return (
    <motion.div
      className={`w-full my-8 ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {promoItems.map((promoItem, index) => (
          <motion.div
            key={index}
            className="flex-1 relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer touch-manipulation"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleBannerClick(promoItem)}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleBannerClick(promoItem);
            }}
          >
            <div className="relative w-full aspect-[5/2] min-h-[120px] max-h-[250px] promo-banner-container">
              <img
                src={promoItem?.image}
                alt={`Promotional Banner ${index + 1}`}
                className="promo-banner-image"
                loading="lazy"
                onError={(e) => {
                  console.error('PromoBanner: Image load error:', e.target.src);
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PromoBanner;
