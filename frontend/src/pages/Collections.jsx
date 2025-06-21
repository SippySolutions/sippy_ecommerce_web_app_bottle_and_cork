import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchProductsByGroupId, fetchProductGroupById } from '../services/api';
import ProductCard from '../components/ProductCard';
import InlineLoader from '../components/InlineLoader';
import { useCMS } from '../Context/CMSContext';
import { toast } from 'react-toastify';

const Collections = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { getTheme, loading: cmsLoading } = useCMS();
  
  const [products, setProducts] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Get theme colors
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

  // Load collection data
  useEffect(() => {
    if (groupId) {
      loadCollectionData();
    }
  }, [groupId, currentPage, sortOption, sortOrder]);

  const loadCollectionData = async () => {
    try {
      setLoading(true);
      
      // Fetch both group info and products
      const [groupResponse, productsResponse] = await Promise.all([
        fetchProductGroupById(groupId),
        fetchProductsByGroupId(groupId, currentPage, 20, sortOption, sortOrder)
      ]);      setGroupInfo(groupResponse);
      setProducts(productsResponse.products);
      setPagination(productsResponse.pagination);
      
      // Debug logging
      console.log('Group Info:', groupResponse);
      console.log('Products Response:', productsResponse);
      console.log('Products:', productsResponse.products);
      console.log('Pagination:', productsResponse.pagination);
      
    } catch (error) {
      console.error('Error loading collection:', error);
      toast.error('Failed to load collection');
      
      // Redirect to home if collection not found
      if (error.response?.status === 404) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e) => {
    const [sort, order] = e.target.value.split('_');
    setSortOption(sort);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 mx-1 rounded-lg font-medium transition-all duration-200 hover:bg-[var(--color-accent)] hover:text-white"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-bodyText)'
          }}
        >
          Previous
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 mx-1 rounded-lg font-medium transition-all duration-200 ${
            currentPage === i 
              ? 'text-white' 
              : 'hover:bg-[var(--color-accent)] hover:text-white'
          }`}
          style={{ 
            backgroundColor: currentPage === i ? 'var(--color-accent)' : 'var(--color-muted)',
            color: currentPage === i ? 'white' : 'var(--color-bodyText)'
          }}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < pagination.totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 mx-1 rounded-lg font-medium transition-all duration-200 hover:bg-[var(--color-accent)] hover:text-white"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-bodyText)'
          }}
        >
          Next
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-8">
        {pages}
      </div>
    );
  };

  if (cmsLoading || loading) {
    return <InlineLoader />;
  }

  if (!groupInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-headingText)' }}>
            Collection Not Found
          </h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
            style={{ 
              backgroundColor: 'var(--color-accent)',
              color: 'white'
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8 bg-white"
    >
      <div className="container mx-auto px-4">
        {/* Collection Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-8"
        >          {/* Banner Image */}
          {groupInfo.bannerImage && (
            <div 
              className="relative h-64 lg:h-80 rounded-lg mb-6 shadow-lg overflow-hidden"
              style={{
                background: groupInfo.bannerImage 
                  ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${groupInfo.bannerImage}) center/cover no-repeat`
                  : `linear-gradient(135deg, var(--color-accent), var(--color-secondary))`
              }}
              onError={(e) => {
                console.error('Banner image failed to load:', groupInfo.bannerImage);
                e.target.style.background = 'linear-gradient(135deg, var(--color-accent), var(--color-secondary))';              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h1 className="text-4xl lg:text-6xl font-bold mb-4">
                    {groupInfo.name}
                  </h1>
                  {groupInfo.description && (
                    <p className="text-lg lg:text-xl opacity-90 max-w-2xl mx-auto">
                      {groupInfo.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Title and Description (fallback if no banner) */}
          {!groupInfo.bannerImage && (
            <div className="text-center mb-8">
              <h1 
                className="text-4xl lg:text-5xl font-bold mb-4"
                style={{ color: 'var(--color-headingText)' }}
              >
                {groupInfo.name}
              </h1>
              {groupInfo.description && (
                <p 
                  className="text-lg lg:text-xl max-w-2xl mx-auto"
                  style={{ color: 'var(--color-bodyText)' }}
                >
                  {groupInfo.description}
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Filter and Sort */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
        >
          <div className="flex items-center gap-4">
            <span style={{ color: 'var(--color-bodyText)' }} className="font-medium">
              {pagination?.total || 0} Products
            </span>
          </div>

          <div className="flex items-center gap-4">
            <label htmlFor="sort" className="text-sm font-medium" style={{ color: 'var(--color-bodyText)' }}>
              Sort by:
            </label>
            <select
              id="sort"
              value={`${sortOption}_${sortOrder}`}
              onChange={handleSortChange}
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-bodyText)',
                borderColor: 'var(--color-secondary)'
              }}
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
              <option value="price_asc">Price Low to High</option>
              <option value="price_desc">Price High to Low</option>
            </select>
          </div>
        </motion.div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-headingText)' }}>
              No Products Found
            </h3>
            <p className="text-lg mb-6" style={{ color: 'var(--color-bodyText)' }}>
              This collection doesn't have any products yet.
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
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {products.map((product) => (
              <motion.div key={product._id} variants={fadeInUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  );
};

export default Collections;
