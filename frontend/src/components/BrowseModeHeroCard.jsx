import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { isFeatureEnabled, getOrderingPlatforms } from '../config/featureFlags';
import { useCMS } from '../Context/CMSContext';

const BrowseModeHeroCard = () => {
  const { cmsData } = useCMS();

  // Don't show if shopping is enabled
  if (isFeatureEnabled('ENABLE_CART')) {
    return null;
  }

  const platforms = getOrderingPlatforms();
  const storeAddress = cmsData?.storeInfo?.address;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative overflow-hidden bg-[#FAFAFA] rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12 mb-8"
    >
      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Left: Icon and Text */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border border-gray-200 shadow-sm">
                <svg className="w-10 h-10 text-[var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Order Now & Browse Our Catalog
            </h2>
            <p className="text-lg md:text-xl text-gray-700 mb-2">
              Shop on UberEats & Postmates Today!
            </p>
            <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto md:mx-0">
              While we build our website store, browse our full catalog here and order 
              for delivery through UberEats or Postmates. Website ordering coming soon!
            </p>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <Link
              to="/products"
              className="group relative overflow-hidden px-8 py-4 bg-[var(--color-accent)] text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3"
            >
              <span className="relative z-10">Browse Products</span>
              <svg className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {platforms.ubereats && (
                <a
                  href={platforms.ubereats}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <span>UberEats</span>
                </a>
              )}

              {platforms.postmates && (
                <a
                  href={platforms.postmates}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <span>Postmates</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-gray-200"
        >
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Browse Full Catalog Here</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              <span>Order on Delivery Apps</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Website Shopping Soon</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BrowseModeHeroCard;
