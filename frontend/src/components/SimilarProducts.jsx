import React, { useEffect, useState } from 'react';
import { fetchSimilarProducts, fetchfeturedProducts } from '../services/api'; // API function to fetch similar products
import ProductCard from './ProductCard'; // Import ProductCard component
import { motion } from 'framer-motion';
import InlineLoader from './InlineLoader'; // Import branded loader

const SimilarProducts = ({ department, category, subcategory, priceRange }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showingFeatured, setShowingFeatured] = useState(false);
  useEffect(() => {
    const getSimilarProducts = async () => {
      try {
        setLoading(true);
        setShowingFeatured(false);
        
        // Ensure we have valid parameters
        if (!department || !priceRange) {
          setSimilarProducts([]);
          await getFeaturedFallback();
          return;
        }
        
        const products = await fetchSimilarProducts(department, category, subcategory, priceRange);
        const similarProductsArray = products?.products || [];
        setSimilarProducts(similarProductsArray);
        
        // If no similar products found, fetch mixed featured products
        if (similarProductsArray.length === 0) {
          await getFeaturedFallback();
        }
      } catch (error) {
        console.error('Error fetching similar products:', error);
        setSimilarProducts([]);
        await getFeaturedFallback();
      } finally {
        setLoading(false);
      }
    };

    const getFeaturedFallback = async () => {
      try {
        setShowingFeatured(true);
        
        // Fetch different types of featured products and mix them
        const featuredTypes = ['bestseller', 'staffpick', 'exclusive'];
        const allFeaturedProducts = [];
        
        for (const type of featuredTypes) {
          try {
            const response = await fetchfeturedProducts(type);
            const products = response?.products || [];
            // Take up to 4 products from each type
            allFeaturedProducts.push(...products.slice(0, 4));
          } catch (error) {
            console.error(`Error fetching ${type} products:`, error);
          }
        }
        
        // Shuffle the mixed array to randomize the order
        const shuffledProducts = allFeaturedProducts.sort(() => Math.random() - 0.5);
        
        // Limit to 12 products maximum
        setFeaturedProducts(shuffledProducts.slice(0, 12));
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setFeaturedProducts([]);
      }
    };

    getSimilarProducts();
  }, [department, category, subcategory, priceRange]);
  if (loading) {
    return (
      <div className="text-center py-12">
        <InlineLoader 
          text="Loading similar products..." 
          size="medium"
        />
      </div>
    );
  }

  // Don't render anything if no products to show
  if (similarProducts.length === 0 && featuredProducts.length === 0) {
    return null;
  }

  // Determine which products to display
  const productsToShow = similarProducts.length > 0 ? similarProducts : featuredProducts;
  const sectionTitle = showingFeatured ? "Featured Products" : "You May Also Like";

 
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
      <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4">{sectionTitle}</h3>
       {/* Horizontal Scrollable Product List */}
        <motion.div
          className="flex space-x-4 overflow-x-auto scrollbar-hide"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >          {productsToShow.map((product) => (
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