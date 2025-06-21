import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchProductGroups } from '../services/api';
import { useCMS } from '../Context/CMSContext';
import InlineLoader from '../components/InlineLoader';
import { toast } from 'react-toastify';

const AllCollections = () => {
  const navigate = useNavigate();
  const { getTheme, loading: cmsLoading } = useCMS();
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
      setCollections(data);
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

  if (cmsLoading || loading) {
    return <InlineLoader />;
  }

  return (
    <div 
      className="min-h-screen py-8"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <h1 
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: 'var(--color-headingText)' }}
          >
            Our Collections
          </h1>
          <p 
            className="text-lg lg:text-xl max-w-2xl mx-auto mb-6"
            style={{ color: 'var(--color-bodyText)' }}
          >
            Discover our carefully curated collections of premium products, each featuring unique selections for every taste and occasion.
          </p>
          <div 
            className="w-24 h-1 mx-auto rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
          ></div>
        </motion.div>

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-headingText)' }}>
              No Collections Available
            </h3>
            <p className="text-lg mb-6" style={{ color: 'var(--color-bodyText)' }}>
              We're working on adding new collections. Check back soon!
            </p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
              style={{ 
                backgroundColor: 'var(--color-accent)',
                color: 'white'
              }}
            >
              Browse All Products
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {collections.map((collection) => (
              <motion.div
                key={collection._id}
                variants={fadeInUp}
                className="group cursor-pointer"
                onClick={() => handleCollectionClick(collection._id)}
              >
                <div className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
                  {/* Collection Image */}
                  <div 
                    className="h-64 bg-cover bg-center relative"
                    style={{
                      backgroundImage: collection.bannerImage 
                        ? `url(${collection.bannerImage})` 
                        : `linear-gradient(135deg, var(--color-accent), var(--color-secondary))`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent group-hover:from-black/80 transition-all duration-300"></div>
                    
                    {/* Collection Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--color-accent)] transition-colors duration-200">
                        {collection.name}
                      </h3>
                      {collection.description && (
                        <p className="text-sm opacity-90 line-clamp-3 mb-3">
                          {collection.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm opacity-75 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          {collection.products?.length || 0} Products
                        </span>
                        <div className="flex items-center text-sm group-hover:text-[var(--color-accent)] transition-colors duration-200">
                          <span className="mr-1">Explore</span>
                          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Back to Home Button */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center mt-12"
        >
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 rounded-lg font-medium transition-all duration-200 border-2 hover:shadow-lg"
            style={{ 
              borderColor: 'var(--color-accent)',
              color: 'var(--color-accent)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--color-accent)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'var(--color-accent)';
            }}
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AllCollections;
