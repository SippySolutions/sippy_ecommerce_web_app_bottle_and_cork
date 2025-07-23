import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { fetchfeturedProducts } from '../services/api';
import InlineLoader from './InlineLoader';

function FeaturedSection({ 
  type, 
  title, 
  subtitle, 
  showSidebar = false, 
  backgroundColor = "bg-white" 
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products based on type
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await fetchfeturedProducts(type);
        setProducts(data.products);
      } catch (err) {
        setError(err.message || `Failed to fetch ${type} products`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <InlineLoader 
          text={`Loading ${typeof title === 'string' ? title.toLowerCase() : type}...`} 
          size="medium"
        />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
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
    <section className={`${backgroundColor} py-12`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
          <Link
            to="/products"
            className="text-red-500 text-sm font-bold hover:underline"
          >
            View All &gt;
          </Link>
        </div>

        {/* Content Layout */}
        <div className={showSidebar ? "flex flex-col lg:flex-row gap-8" : ""}>
          {/* Left Sidebar: Product Names (conditional) */}
          {showSidebar && (
            <div className="lg:w-1/4 w-full mb-6 lg:mb-0">
              <ul className="space-y-4">
                {products.map((product, index) => (
                  <li
                    key={index}
                    className="text-gray-600 hover:text-black cursor-pointer truncate"
                    title={product.name}
                  >
                    {product.name}
                  </li>
                ))}
              </ul>
              <button className="mt-6 text-red-500 text-sm font-bold hover:underline">
                View More
              </button>
            </div>
          )}

          {/* Horizontal Scrollable Product List */}
          <motion.div
            className="flex space-x-4 overflow-x-auto scrollbar-hide"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {products.map((product) => (
              <motion.div
                key={product._id}
                variants={itemVariants}
                className="flex-shrink-0 w-[250px]"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedSection;
