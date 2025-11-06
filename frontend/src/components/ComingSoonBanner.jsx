import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isFeatureEnabled, getComingSoonMessage, getOrderingPlatforms } from '../config/featureFlags';
import { useCMS } from '../Context/CMSContext';

const ComingSoonBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { cmsData } = useCMS();
  
  // Don't show banner if shopping is enabled
  if (!isFeatureEnabled('SHOW_COMING_SOON_BANNER') || !isVisible) {
    return null;
  }

  const storePhone = cmsData?.storeInfo?.phone;
  const storeAddress = cmsData?.storeInfo?.address;
  const platforms = getOrderingPlatforms();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-white border-b-2 border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="relative max-w-7xl mx-auto px-4 py-4 md:py-5">
          {/* Main Content */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Message */}
            <div className="flex items-center gap-4 flex-1">
              <div className="hidden md:flex items-center justify-center w-14 h-14 bg-[#FAFAFA] rounded-xl border border-gray-200">
                <svg className="w-7 h-7 text-[var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              
              <div className="text-center md:text-left">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1 flex items-center justify-center md:justify-start gap-2">
                  <svg className="md:hidden w-6 h-6 text-[var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Order Now on UberEats & Postmates
                </h2>
                <p className="text-xs md:text-sm text-gray-600">
                  While we build our online store, shop our full selection on delivery apps
                </p>
              </div>
            </div>

            {/* Right: Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3">
              {platforms.ubereats && (
                <motion.a
                  href={platforms.ubereats}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white text-gray-700 rounded-lg font-semibold text-sm border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  Order on UberEats
                </motion.a>
              )}
              
              {platforms.postmates && (
                <motion.a
                  href={platforms.postmates}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white text-gray-700 rounded-lg font-semibold text-sm border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  Order on Postmates
                </motion.a>
              )}
            </div>
          </div>

          {/* Features Row */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 pt-3 border-t border-gray-200"
          >
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-xs md:text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Browse Full Catalog Here</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                <span>Order on Delivery Apps</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Website Ordering Soon</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close banner"
        >
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default ComingSoonBanner;
