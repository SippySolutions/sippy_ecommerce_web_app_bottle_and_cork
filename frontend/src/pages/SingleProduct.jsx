import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchProductById } from '../services/api';
import { useCart } from '../Context/CartContext';
import { useWishlist } from '../Context/WishlistContext';
import { useCMS } from '../Context/CMSContext';
import { isFeatureEnabled, getOrderingPlatforms } from '../config/featureFlags';
import SimilarProducts from '../components/SimilarProducts';
import PromoBanner from '../components/PromoBanner';
import { toast } from 'react-toastify';
import InlineLoader from '../components/InlineLoader'; // Import branded loader
import { formatStoreHours } from '../utils/timeFormat';

function SingleProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { getTheme, getStoreInfo, getCurrentStoreStatus } = useCMS();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const theme = getTheme();

  // Helper function to format phone numbers
  const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  // Helper function to get today's hours
  const getTodaysHours = () => {
    const storeInfo = getStoreInfo();
    if (!storeInfo?.hours) return null;
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const todayHours = storeInfo.hours[today];
    
    if (!todayHours || !todayHours.open || !todayHours.close) return null;
    return formatStoreHours(todayHours.open, todayHours.close);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const productData = await fetchProductById(id);
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    
    // Scroll to top when product page loads
    window.scrollTo(0, 0);
  }, [id]);
  const handleAddToCart = () => {
    if (product) {
      addToCart(
        {
          ...product,
          salePrice: typeof product.saleprice === 'number' && product.saleprice > 0
            ? product.saleprice
            : product.price,
        },
        quantity
      );
      const stockMessage = product.totalqty > 0 ? '' : ' (Out of Stock)';
      toast.success(`${quantity} ${product.name} added to cart!${stockMessage}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Product link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    const isCurrentlyInWishlist = isInWishlist(product.id);
    
    if (isCurrentlyInWishlist) {
      removeFromWishlist(product.id);
      toast.success(`${product.name} removed from wishlist!`, {
        position: "top-right",
        autoClose: 2000,
      });
    } else {
      addToWishlist(product);
      toast.success(`${product.name} added to wishlist!`, {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };
  const getDiscountPercentage = () => {
    if (product?.saleprice > 0 && product?.price > product?.saleprice) {
      return Math.round(((product.price - product.saleprice) / product.price) * 100);
    }
    return 0;
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <InlineLoader 
          text="Loading product details..." 
          size="large"
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: theme.primary }}
          >
            Browse All Products
          </button>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Simple Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 py-8">
          {/* Product Image - Reduced size */}
          <div className="relative lg:col-span-2">
            {getDiscountPercentage() > 0 && (
              <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-md text-sm font-semibold z-10">
                %{getDiscountPercentage()} off
              </div>
            )}
            <div className="aspect-square bg-gray-50 flex items-center justify-center rounded-lg overflow-hidden max-w-md mx-auto lg:mx-0">
              <img
                src={product.productimg || '/placeholder-image.png'}
                alt={product.name}
                className={`max-h-full max-w-full object-contain transition-all duration-500 ${
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="animate-pulse bg-gray-300 w-48 h-64"></div>
              )}
            </div>
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
              </svg>
            </button>
          </div>

          {/* Product Details - Takes more space */}
          <div className="space-y-6 lg:col-span-3">
            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="space-y-2">
              {product.saleprice > 0 ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-red-600">
                    {formatPrice(product.saleprice)}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Size and Pack Selection - Combined for mobile */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:gap-8 gap-4">
                {/* Size Selection */}
                {product.size && (
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 border-2 border-gray-900 rounded-md font-medium bg-gray-900 text-white">
                        {product.size}
                      </button>
                      {/* Additional size options could be added here */}
                    </div>
                  </div>
                )}

                {/* Pack Selection */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Pack</h3>
                  <div className="flex gap-2 flex-wrap">
                    {product.packname ? (
                      <button className="px-4 py-2 border-2 border-gray-900 rounded-md font-medium bg-gray-900 text-white">
                        {product.packname}
                      </button>
                    ) : (
                      <>
                        <button className="px-4 py-2 border border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                          Single
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                          4
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                          6
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                          12
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                          18
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Cart - Only show if cart is enabled */}
            {isFeatureEnabled('ENABLE_CART') && (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[var(--color-accent)] text-white py-4 px-6 rounded-md font-semibold text-lg hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5-5M7 13l-2.5 5M17 17a2 2 0 11-4 0 2 2 0 014 0zM9 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  ADD TO CART
                </button>
                
                {/* Quantity controls */}
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </button>
                  <div className="px-4 py-2 font-bold text-lg bg-[var(--color-accent)] text-white min-w-[50px] text-center">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-2 hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                
                {isFeatureEnabled('ENABLE_WISHLIST') && (
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3 border rounded-md transition-colors ${
                      product && isInWishlist(product.id)
                        ? 'border-pink-500 bg-pink-50 text-pink-500'
                        : 'border-gray-300 hover:bg-pink-50 hover:border-pink-300 text-gray-600 hover:text-pink-500'
                    }`}
                    title={product && isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <svg 
                      className={`w-6 h-6 ${
                        product && isInWishlist(product.id) ? 'fill-current' : ''
                      }`} 
                      fill={product && isInWishlist(product.id) ? "currentColor" : "none"} 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            
            {/* Browse Mode Message - Show when cart is disabled */}
            {!isFeatureEnabled('ENABLE_CART') && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden bg-[#FAFAFA] rounded-2xl p-6 border border-gray-200 shadow-md"
              >
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-200">
                      <svg className="w-6 h-6 text-[var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Order This Product Now!
                      </h3>
                      <p className="text-sm text-gray-600">
                        Get this product delivered fast through our trusted delivery partners UberEats & Postmates!
                      </p>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <a
                      href={getOrderingPlatforms().ubereats}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-[var(--color-accent)] text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all"
                    >
                      <span>Order on UberEats</span>
                    </a>
                    
                    <a
                      href={getOrderingPlatforms().postmates}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-[var(--color-accent)] text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all"
                       >
                      <span>Order on Postmates</span>
                    </a>
                  </div>

                  {/* Store Info */}
                  {getStoreInfo() && (
                    <div className="bg-white rounded-xl p-4 space-y-2 border border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {getStoreInfo().phone && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                            </svg>
                            <span className="font-medium">{formatPhone(getStoreInfo().phone)}</span>
                          </div>
                        )}
                        
                        {getCurrentStoreStatus() && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                            </svg>
                            <span className={`font-medium ${getCurrentStoreStatus().isOpen ? 'text-green-600' : 'text-red-600'}`}>
                              {getCurrentStoreStatus().isOpen ? 'Open Now' : 'Closed'}
                            </span>
                            {getTodaysHours() && <span className="text-gray-500">• {getTodaysHours()}</span>}
                          </div>
                        )}
                      </div>
                      
                      {getStoreInfo().address && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${getStoreInfo().address.street}, ${getStoreInfo().address.city}, ${getStoreInfo().address.state} ${getStoreInfo().address.zipCode}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 text-gray-700 text-sm pt-2 border-t border-gray-200 hover:text-indigo-600 transition-colors cursor-pointer group"
                          title="Click for directions"
                        >
                          <svg className="w-4 h-4 text-indigo-600 mt-0.5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                          </svg>
                          <span className="group-hover:underline">
                            {getStoreInfo().address.street}, {getStoreInfo().address.city}, {getStoreInfo().address.state} {getStoreInfo().address.zipCode}
                          </span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>        {/* Simple Product Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Details */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Product Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Brand:</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="text-gray-900">{product.category || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">SKU:</span>
                  <span className="text-gray-900">{product.sku || '00000'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Department:</span>
                  <span className="text-gray-900">{product.department || '00000'}</span>
                </div>
                {product.abv && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">ABV:</span>
                    <span className="text-gray-900">{product.abv}%</span>
                  </div>
                )}
                {product.country && product.country !== "NAN" && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Origin:</span>
                    <span className="text-gray-900">{product.country}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <div className="text-gray-700 leading-relaxed">
                {product.description || 'No description available for this product.'}
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        <div className="mb-8">
          <SimilarProducts
            department={product.department}
            category={product.category}
            subcategory={product.subcategory}
            priceRange={`${Math.max(0, (product.price || 0) - 50)}-${(product.price || 0) + 50}`}
          />
        </div>
         
        {/* Promotional Banner */}
        <div className="mb-8">
          <PromoBanner type="grid" />
        </div>  
      </div>
    </div>
  );
}

export default SingleProduct;