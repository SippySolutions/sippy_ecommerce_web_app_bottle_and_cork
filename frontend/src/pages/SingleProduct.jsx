import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import { useCart } from '../Context/CartContext';
import { useWishlist } from '../Context/WishlistContext';
import { useCMS } from '../Context/CMSContext';
import SimilarProducts from '../components/SimilarProducts';
import PromoBanner from '../components/PromoBanner';
import { toast } from 'react-toastify';
import InlineLoader from '../components/InlineLoader'; // Import branded loader

function SingleProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { getTheme } = useCMS();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  
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

            {/* Size Selection */}
            {product.size && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Size</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border-2 border-gray-900 rounded-md font-medium bg-gray-900 text-white">
                    {product.size}
                  </button>
                  {/* Additional size options could be added here */}
                </div>
              </div>
            )}

            {/* Pack Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Pack</h3>
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

            {/* Add to Cart */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-red-700 text-white py-4 px-6 rounded-md font-semibold text-lg hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
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
                <div className="px-4 py-2 font-bold text-lg bg-red-700 text-white min-w-[50px] text-center">
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
            </div>
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