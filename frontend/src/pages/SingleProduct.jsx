import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import { useCart } from '../Context/CartContext';
import { useCMS } from '../Context/CMSContext';
import SimilarProducts from '../components/SimilarProducts';
import PromoBanner from '../components/PromoBanner';
import { toast } from 'react-toastify';

function SingleProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getTheme } = useCMS();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  const theme = getTheme();
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: theme.primary }}></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
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
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumbs */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => navigate('/')}
              className="hover:text-gray-900 transition-colors"
            >
              Home
            </button>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <button
              onClick={() => navigate('/products')}
              className="hover:text-gray-900 transition-colors"
            >
              Products
            </button>
            {product.department && (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-900 font-medium">{product.department}</span>
              </>
            )}
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image Section */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="aspect-square flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                  src={product.productimg || '/placeholder-image.png'}
                  alt={product.name}
                  className={`max-h-full max-w-full object-contain transition-all duration-500 ${
                    imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse bg-gray-300 rounded-lg w-48 h-64"></div>
                  </div>
                )}
              </div>
              
              {/* Floating badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {product.bestseller && (
                  <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Best Seller
                  </div>
                )}
                {product.exclusive && (
                  <div 
                    className="text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg"
                    style={{ backgroundColor: theme.primary }}
                  >
                    Exclusive
                  </div>
                )}
                {product.staffpick && (
                  <div 
                    className="text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg"
                    style={{ backgroundColor: theme.secondary }}
                  >
                    Staff Pick
                  </div>
                )}
                {getDiscountPercentage() > 0 && (
                  <div 
                    className="text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
                    style={{ backgroundColor: theme.accent }}
                  >
                    -{getDiscountPercentage()}% OFF
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* SKU and Share */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>SKU:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{product.sku}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(product.sku);
                      toast.success('SKU copied to clipboard!');
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copy SKU"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <rect x="1" y="1" width="13" height="13" rx="2" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
                  </svg>
                  <span className="text-sm">Share</span>
                </button>
              </div>

              {/* Product Name & Brand */}
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                  {product.name}
                </h1>
                {product.brand && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Brand:</span>
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {product.brand}
                    </span>
                  </div>
                )}
              </div>

              {/* Price Section */}
              <div className="mb-6">
                {product.saleprice > 0 ? (
                  <div className="flex items-baseline gap-3">
                    <span 
                      className="text-4xl font-bold"
                      style={{ color: theme.accent }}
                    >
                      {formatPrice(product.saleprice)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span 
                      className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-semibold"
                    >
                      Save {formatPrice(product.price - product.saleprice)}
                    </span>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Product Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                {product.size && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Size</div>
                    <div className="font-semibold text-gray-900">{product.size}</div>
                  </div>
                )}
                {product.vintage && product.vintage !== "No Vintage" && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Vintage</div>
                    <div className="font-semibold text-gray-900">{product.vintage}</div>
                  </div>
                )}
                {product.abv && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">ABV</div>
                    <div className="font-semibold text-gray-900">{product.abv}%</div>
                  </div>
                )}
                {product.country && product.country !== "NAN" && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Origin</div>
                    <div className="font-semibold text-gray-900">{product.country}</div>
                  </div>
                )}              </div>
            </div>

            {/* Quantity & Add to Cart Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quantity
                </label>
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden w-fit">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center py-3 border-0 outline-none text-lg font-semibold"
                  />
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  style={{ backgroundColor: theme.accent }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5-5M7 13l-2.5 5M17 17a2 2 0 11-4 0 2 2 0 014 0zM9 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </button>
                
                <button
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-colors group"
                  title="Add to Wishlist"
                >
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3 text-blue-800">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <div>
                    <div className="font-semibold">Free Delivery</div>
                    <div className="text-sm">Estimated delivery: 1-7 working days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>        {/* Product Details Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'description', name: 'Description', icon: '📝' },
                { id: 'specifications', name: 'Specifications', icon: '📋' },
                { id: 'delivery', name: 'Delivery Info', icon: '🚚' },
                { id: 'reviews', name: 'Reviews', icon: '⭐' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-current text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  style={{
                    borderBottomColor: activeTab === tab.id ? theme.primary : 'transparent',
                    color: activeTab === tab.id ? theme.primary : undefined
                  }}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h3>
                <div className="text-gray-700 leading-relaxed">
                  {product.description || 'No description available for this product.'}
                </div>
                {product.brand && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">About {product.brand}</h4>
                    <p className="text-gray-600 text-sm">
                      {product.brand} is known for quality products and exceptional craftsmanship.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'SKU', value: product.sku },
                    { label: 'Brand', value: product.brand },
                    { label: 'Category', value: product.category },
                    { label: 'Department', value: product.department },
                    { label: 'Subcategory', value: product.subcategory },
                    { label: 'Size', value: product.size },
                    { label: 'Vintage', value: product.vintage && product.vintage !== "No Vintage" ? product.vintage : null },                    { label: 'ABV', value: product.abv ? `${product.abv}%` : null },
                    { label: 'Country of Origin', value: product.country && product.country !== "NAN" ? product.country : null },
                    { label: 'Pack Size', value: product.packsize }
                  ].filter(spec => spec.value).map((spec, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">{spec.label}</div>
                      <div className="font-semibold text-gray-900">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Delivery Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Free Standard Delivery</h4>
                      <p className="text-gray-600">Delivered within 1-7 working days to your doorstep.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Express Delivery</h4>
                      <p className="text-gray-600">Next day delivery available for urgent orders (additional charges apply).</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Secure Packaging</h4>
                      <p className="text-gray-600">All products are carefully packaged to ensure safe delivery.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Reviews</h3>
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h4>
                  <p className="text-gray-600 mb-6">Be the first to review this product and help other customers make informed decisions.</p>
                  <button 
                    className="px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: theme.primary }}
                  >
                    Write a Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>        {/* Promotional Banner */}
        <div className="mt-12">
          <PromoBanner type="grid" />
        </div>        {/* Similar Products Section */}
        <div className="mt-16">
          <SimilarProducts
            department={product.department}
            category={product.category}
            subcategory={product.subcategory}
            priceRange={`${Math.max(0, (product.price || 0) - 50)}-${(product.price || 0) + 50}`}
          />
        </div>
      </div>
    </div>
  );
}

export default SingleProduct;