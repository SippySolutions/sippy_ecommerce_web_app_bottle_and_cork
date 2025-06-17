import React, { useEffect, useState } from 'react';
import { fetchSimilarProducts } from '../services/api'; // API function to fetch similar products
import ProductCard from './ProductCard'; // Import ProductCard component
import { motion } from 'framer-motion';
import BestSellers from './BestSellers';

const SimilarProducts = ({ department, category, subcategory, priceRange }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getSimilarProducts = async () => {
      try {
        setLoading(true);
        
        // Ensure we have valid parameters
        if (!department || !priceRange) {
          setSimilarProducts([]);
          return;
        }
        
        const products = await fetchSimilarProducts(department, category, subcategory, priceRange);
        setSimilarProducts(products?.products || []); // Access the `products` array with fallback
      } catch (error) {
        console.error('Error fetching similar products:', error);
        setSimilarProducts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    getSimilarProducts();
  }, [department, category, subcategory, priceRange]);

  if (loading) {
    return <div>Loading similar products...</div>;
  }

  if (similarProducts.length === 0) {
    // Show Best Sellers if no similar products found
    return (
      <div>
          <BestSellers />
      </div>
    );
  }

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  return (
    <div className="similar-products">
      <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4">You May Also Like</h3>
       {/* Horizontal Scrollable Product List */}
        <motion.div
          className="flex space-x-4 overflow-x-auto scrollbar-hide"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >          {similarProducts.map((product) => (
            <motion.div
              key={product?._id || Math.random()}
              variants={itemVariants}
              className="flex-shrink-0 w-[250px]"
            >
              {product && <ProductCard product={product} />}
            </motion.div>
          ))}
        </motion.div>

    </div>
  );
};

export default SimilarProducts;