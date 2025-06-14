import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useCMS } from '../Context/CMSContext';
import { toast } from 'react-toastify';

// Minimal icon components
const StarIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const DiamondIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h2a1 1 0 01.894 1.447l-8 16a1 1 0 01-1.788 0l-8-16A1 1 0 013 6h2V4zm2 2V4h6v2H7z" />
  </svg>
);

const UserGroupIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
  </svg>
);

const ShoppingCartIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const ExclamationIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getTheme } = useCMS();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const theme = getTheme();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(
      {
        ...product,
        salePrice:
          typeof product.saleprice === 'number' && product.saleprice > 0
            ? product.saleprice
            : product.price,
      },
      1
    );
    toast.success(`${product.name} added to cart!`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleCardClick = (e) => {
    if (e.target.tagName === 'BUTTON') return;
    navigate(`/products/${product._id}`);
  };

  // Helper functions
  const getDiscountPercentage = () => {
    if (product.saleprice > 0 && product.price > product.saleprice) {
      return Math.round(((product.price - product.saleprice) / product.price) * 100);
    }
    return 0;
  };

  const getStockLevel = () => {
    if (product.totalqty === 0) return 'out-of-stock';
    if (product.totalqty <= 5) return 'low-stock';
    return 'in-stock';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <div
      className="group relative bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden w-full h-[420px] flex flex-col"
      onClick={handleCardClick}
    >
      {/* Status Badges */}
      <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
        <div className="flex flex-col gap-1">
          {product.bestseller && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-accent/10 text-accent border border-accent/20">
              <StarIcon className="w-3 h-3" />
              Best Seller
            </span>
          )}
          {product.exclusive && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <DiamondIcon className="w-3 h-3" />
              Exclusive
            </span>
          )}
          {product.staffpick && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
              <UserGroupIcon className="w-3 h-3" />
              Staff Pick
            </span>
          )}
        </div>

        {getDiscountPercentage() > 0 && (
          <div className="bg-accent text-white px-2 py-1 rounded-md text-xs font-bold">
            -{getDiscountPercentage()}%
          </div>
        )}
      </div>

      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <img
          src={product.productimg || '/placeholder-image.png'}
          alt={product.name}
          className={`h-full w-auto object-contain transition-all duration-300 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse bg-gray-300 rounded w-16 h-20"></div>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Category & Brand */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {(product.category || product.department) && (
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md truncate">
              {product.category || product.department}
            </span>
          )}
          {product.brand && (
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md truncate">
              {product.brand}
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors flex-shrink-0">
          {product.name}
        </h3>

        {/* Product Details - Only show most important ones */}
        <div className="text-xs text-gray-600 space-y-1 mb-3 flex-1">
          {product.vintage && product.vintage !== "No Vintage" && (
            <div className="truncate">Vintage: {product.vintage}</div>
          )}
          {product.abv && (
            <div>ABV: {product.abv}%</div>
          )}
          {product.size && (
            <div className="truncate">Size: {product.size}</div>
          )}
          {product.country && product.country !== "NAN" && (
            <div className="truncate">Origin: {product.country}</div>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-3">
          {getStockLevel() === 'out-of-stock' ? (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <XIcon className="w-3 h-3 flex-shrink-0" />
              Out of Stock
            </div>
          ) : getStockLevel() === 'low-stock' ? (
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <ExclamationIcon className="w-3 h-3 flex-shrink-0" />
              {product.totalqty} left
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckIcon className="w-3 h-3 flex-shrink-0" />
              In Stock
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="mb-3">
          {product.saleprice > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-accent">
                {formatPrice(product.saleprice)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.totalqty <= 0}
          className={`w-full py-2.5 px-4 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            product.totalqty > 0
              ? 'bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.totalqty > 0 ? (
            <>
              <ShoppingCartIcon className="w-4 h-4" />
              Add to Cart
            </>
          ) : (
            <>
              <XIcon className="w-4 h-4" />
              Out of Stock
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
