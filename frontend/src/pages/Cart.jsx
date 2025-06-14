import React, { useEffect, useState } from 'react';
import { useCart } from '../Context/CartContext';
import SimilarProducts from '../components/SimilarProducts';
import { useNavigate } from 'react-router-dom';
import { fetchCMSData } from '../services/api';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const [taxRate, setTaxRate] = useState(0);

  useEffect(() => {
    async function getTax() {
      const cms = await fetchCMSData();
      if (cms && cms.storeInfo && cms.storeInfo.tax && cms.storeInfo.tax.rate) {
        setTaxRate(Number(cms.storeInfo.tax.rate));
      }
    }
    getTax();
  }, []);

  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      ((item.salePrice && item.salePrice < item.price ? item.salePrice : item.price) * item.quantity),
    0
  );
  const taxAmount = subtotal * (taxRate / 100);
  const totalWithTax = subtotal + taxAmount;

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel: Cart Items */}
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold mb-4">Your Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 flex flex-col items-center">
            <div>Your cart is empty.</div>
            <button
              className="mt-6 px-6 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-accent)] font-bold"
              onClick={() => navigate('/products')}
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between border-b pb-4"
              >
                {/* Product Image */}
                <img
                  src={item.productimg}
                  alt={item.name}
                  className="h-16 w-16 object-contain"
                />

                {/* Product Details */}
                <div className="flex-1 px-4">
                  <h2 className="text-lg font-bold">{item.name}</h2>
                  {item.salePrice && item.salePrice < item.price ? (
                    <div>
                      <span className="text-gray-400 line-through mr-2">${item.price.toFixed(2)}</span>
                      <span className="text-red-600 font-bold">${item.salePrice.toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">${item.price.toFixed(2)}</span>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item._id, parseInt(e.target.value) || 1)
                    }
                    className="w-12 text-center border rounded"
                  />
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:underline p-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel: Summary */}
      <div className="bg-[var(--color-muted)] p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold mb-4">Order Summary</h2>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-bold">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="text-gray-600">Tax</span>
          <span className="font-bold">${taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold mb-6">
          <span>Total</span>
          <span>${totalWithTax.toFixed(2)}</span>
        </div>
        <button
          onClick={() =>
            navigate('/checkout', {
              state: {
                cartItems,
                totalPrice: cartItems.reduce(
                  (total, item) =>
                    total +
                    ((item.salePrice && item.salePrice < item.price ? item.salePrice : item.price) * item.quantity),
                  0
                ),
              }
            })
          }
          className="w-full bg-[var(--color-background)] text-[var(--color-headingText)] py-3 rounded-lg font-bold hover:bg-[var(--color-accent)] transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={cartItems.length === 0}
        >
          Proceed to Checkout
        </button>
      </div>

      {/* Bottom Section: Recommendations */}
      <div className="lg:col-span-3 mt-8">
        <SimilarProducts department="WINE" priceRange="10-50" />
      </div>
    </div>
  );
};

export default Cart;