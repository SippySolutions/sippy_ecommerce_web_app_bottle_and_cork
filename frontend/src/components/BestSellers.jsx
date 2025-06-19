import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import framer-motion
import ProductCard from './ProductCard'; // Import the ProductCard component
import { fetchfeturedProducts } from '../services/api'; // Import the API function
import InlineLoader from './InlineLoader'; // Import branded loader

function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch best sellers from the backend
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const data = await fetchfeturedProducts('bestseller'); // Pass 'bestseller' as the type
        setProducts(data.products);
      } catch (err) {
        setError(err.message || 'Failed to fetch best sellers');
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);
  if (loading) {
    return (
      <div className="text-center py-12">
        <InlineLoader 
          text="Loading best sellers..." 
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
        staggerChildren: 0.2, // Stagger animation for child elements
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Best Sellers</h2>
            <p className="text-sm text-gray-500">
              The best selection of whiskey, vodka, and liquor
            </p>
          </div>
          <Link
            to="/products"
            className="text-red-500 text-sm font-bold hover:underline"
          >
            View All &gt;
          </Link>
        </div>

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
              <ProductCard product={product} /> {/* Use ProductCard here */}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default BestSellers;