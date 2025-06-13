import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(
      {
        ...product,
        salePrice:
          typeof product.saleprice === 'number' && product.saleprice > 0
            ? product.saleprice
            : product.price,
        // Optionally, you can also keep the original saleprice field if you use it elsewhere
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

  // You may want to adjust these fields based on your product model
  const size = product.size || product.volume || '';
  const category = product.category || product.subcategory || product.department || '';

  return (
    <div
      className="border border-[var(--color-accent)] rounded-lg flex flex-col text-center shadow-md relative cursor-pointer hover:shadow-lg transition-shadow h-[350px] sm:h-[400px] w-[200px] sm:w-[250px] mx-auto"
      onClick={handleCardClick}
    >
      {/* Best Seller Badge */}
      {product.bestseller && (
        <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
          Best Seller
        </span>
      )}

      {/* Discount Badge */}
      {product.saleprice > 0 && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          Sale
        </span>
      )}

      {/* Product Image */}
      <div className="flex-grow flex items-center justify-center p-4">
        <img
          src={product.productimg || '/placeholder-image.png'}
          alt={product.name}
          className="h-[120px] sm:h-[150px] w-auto object-contain"
        />
      </div>

      {/* Muted Background Section */}
      <div className="mt-auto w-full bg-[var(--color-muted)] p-3 sm:p-4 rounded-b-lg flex flex-col items-center">
        {/* Size and Category/Department */}
        <div className="flex justify-between w-full text-xs sm:text-sm text-gray-500 mb-1">
          <span>{size}</span>
          <span>{category}</span>
        </div>

        {/* Product Name */}
        <h3
          className="text-sm sm:text-lg font-bold text-gray-800 mb-2 w-full truncate"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.name}
        </h3>

        {/* Product Price */}
        <div className="mb-2 w-full text-left">
          {product.saleprice > 0 ? (
            <div className="text-red-500 font-bold">
              ${product.saleprice.toFixed(2)}{' '}
              <span className="line-through text-gray-500">
                ${product.price.toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="text-gray-800 font-bold">${product.price.toFixed(2)}</div>
          )}
        </div>

        {/* Stock Status */}
        <div
          className={`text-xs sm:text-sm mb-2 w-full text-left ${
            product.totalqty > 0 ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {product.totalqty > 0 ? 'In Stock' : 'Out of Stock'}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`w-full px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-bold ${
            product.totalqty > 0
              ? 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-background)]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={product.totalqty <= 0}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;