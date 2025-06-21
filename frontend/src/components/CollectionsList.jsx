import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchProductGroups } from '../services/api';
import { useCMS } from '../Context/CMSContext';
import InlineLoader from './InlineLoader';
import { toast } from 'react-toastify';

const CollectionsList = ({ title = "Shop by Collections", limit = null }) => {
  const navigate = useNavigate();
  const { getTheme } = useCMS();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const theme = getTheme();

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const data = await fetchProductGroups();
      
      // Limit collections if specified
      const collectionsToShow = limit ? data.slice(0, limit) : data;
      setCollections(collectionsToShow);
    } catch (error) {
      console.error('Error loading collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionClick = (collectionId) => {
    navigate(`/collections/${collectionId}`);
  };

  if (loading) {
    return <InlineLoader />;
  }

  if (collections.length === 0) {
    return null;
  }

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        {/* Section Title */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center mb-8"
        >
          <h2 
            className="text-3xl lg:text-4xl font-bold mb-4"
            style={{ color: 'var(--color-headingText)' }}
          >
            {title}
          </h2>
          <div 
            className="w-24 h-1 mx-auto rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
          ></div>
        </motion.div>

        {/* Collections Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {collections.map((collection) => (
            <motion.div
              key={collection._id}
              variants={fadeInUp}
              className="group cursor-pointer"
              onClick={() => handleCollectionClick(collection._id)}
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                {/* Collection Image */}
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{
                    backgroundImage: collection.bannerImage 
                      ? `url(${collection.bannerImage})` 
                      : `linear-gradient(135deg, var(--color-accent), var(--color-secondary))`
                  }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300"></div>
                </div>

                {/* Collection Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-lg font-bold mb-1">
                    {collection.name}
                  </h3>
                  {collection.description && (
                    <p className="text-sm opacity-90 line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-75">
                      {collection.products?.length || 0} Products
                    </span>
                    <div className="flex items-center text-xs group-hover:text-[var(--color-accent)] transition-colors duration-200">
                      <span className="mr-1">Explore</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Collections Button */}
        {limit && collections.length >= limit && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mt-8"
          >
            <button
              onClick={() => navigate('/collections')}
              className="px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: 'var(--color-accent)',
                color: 'white'
              }}
            >
              View All Collections
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CollectionsList;
