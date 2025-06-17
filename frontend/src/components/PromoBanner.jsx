import React, { useState, useEffect } from 'react';
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
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!cmsData?.promo_banner) {
    return null;
  }

  const { promo_1, promo_2, promo_3 } = cmsData.promo_banner;
  const promoImages = [promo_1, promo_2, promo_3].filter(Boolean);

  if (promoImages.length === 0) {
    return null;
  }

  // Auto-advance carousel for full-width banners
  useEffect(() => {
    if (type === 'carousel' && promoImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % promoImages.length);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [type, promoImages.length]);

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
  };if (type === 'carousel') {
    // Full-width carousel - for under navbar
    return (
      <div className={`full-width bg-gray-100 ${className}`}>
        <div className="relative w-full h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 overflow-hidden">
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
              className="absolute inset-0"
            >
              <img
                src={promoImages[currentIndex]}
                alt={`Promotional Banner ${currentIndex + 1}`}
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </motion.div>
          </AnimatePresence>          {/* Navigation dots */}
          {promoImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
              {promoImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${
                    index === currentIndex 
                      ? 'bg-white border-white scale-125 shadow-lg' 
                      : 'bg-transparent border-white/70 hover:border-white hover:bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Progress bar */}
          {promoImages.length > 1 && (
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
    const randomImage = promoImages[Math.floor(Math.random() * promoImages.length)];
    return (
      <motion.div
        className={`w-full my-8 ${className}`}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div
          className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative w-full" style={{ paddingBottom: '25%' }}>
            <img
              src={randomImage}
              alt="Promotional Banner"
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="lazy"
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
          {promoImages.map((image, index) => (
            <motion.div
              key={index}
              className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative w-full" style={{ paddingBottom: '60%' }}>
                <img
                  src={image}
                  alt={`Promotional Banner ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  loading="lazy"
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
        {promoImages.map((image, index) => (
          <motion.div
            key={index}
            className="flex-1 relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative w-full" style={{ paddingBottom: '40%' }}>
              <img
                src={image}
                alt={`Promotional Banner ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover object-center"
                loading="lazy"
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
