import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { fetchfeturedProducts } from '../services/api';
import { motion } from 'framer-motion';

function Exclusive() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch exclusive products from the backend
  useEffect(() => {
    const fetchExclusives = async () => {
      try {
        const data = await fetchfeturedProducts('exclusive');
        setProducts(data.products);
        setCategories(data.categories || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch exclusives');
      } finally {
        setLoading(false);
      }
    };

    fetchExclusives();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
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
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Our <span className="text-black">Exclusives</span>
          </h2>
          <Link
            to="/products"
            className="text-red-500 text-sm font-bold hover:underline"
          >
            View All &gt;
          </Link>
        </div>

        {/* Flex Layout: Sidebar + Product Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar: Product Names */}
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
      </div>
    </section>
  );
}

export default Exclusive;