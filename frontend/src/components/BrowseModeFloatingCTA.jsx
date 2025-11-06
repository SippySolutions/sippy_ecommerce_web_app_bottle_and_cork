import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isFeatureEnabled, getOrderingPlatforms } from '../config/featureFlags';

const BrowseModeFloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't show if shopping is enabled
  if (isFeatureEnabled('ENABLE_CART')) {
    return null;
  }

  const platforms = getOrderingPlatforms();

  // Show after scrolling down a bit
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!platforms.ubereats) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-6 right-6 z-50"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <motion.a
            href={platforms.ubereats}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[var(--color-accent)] text-white rounded-full shadow-xl hover:shadow-2xl transition-all overflow-hidden px-6 py-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="whitespace-nowrap font-semibold">
              <div className="text-sm">Order on UberEats</div>
              <div className="text-xs opacity-90">Fast Delivery Available</div>
            </div>
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrowseModeFloatingCTA;
