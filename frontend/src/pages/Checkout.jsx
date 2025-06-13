import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { CartContext } from '../Context/CartContext';
import { AuthContext } from '../components/AuthContext';
import AcceptJSForm from '../components/Payment/AcceptJSForm';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useContext(CartContext);
  const { user, isAuthenticated } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState('delivery');
  const [step, setStep] = useState(1); // 1: Addresses, 2: Payment, 3: Review
  const [tip, setTip] = useState(0);
  const [bagFee] = useState(0.99); // Fixed bag fee
  const [paymentMethod, setPaymentMethod] = useState('new'); // 'new' or 'saved'
  const [selectedCard, setSelectedCard] = useState(null);
  const [saveCard, setSaveCard] = useState(false);

  // Form data
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  });

  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/account');
      return;
    }

    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Pre-populate addresses from user profile
    if (user?.addresses?.length > 0) {
      const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
      setShippingAddress({
        firstName: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        address: defaultAddress.street,
        city: defaultAddress.city,
        state: defaultAddress.state,
        zip: defaultAddress.zip,
        country: defaultAddress.country
      });
    }

    // Set default payment method if user has saved cards
    if (user?.billing?.length > 0) {
      setPaymentMethod('saved');
      const defaultCard = user.billing.find(card => card.isDefault) || user.billing[0];
      setSelectedCard(defaultCard);
    }
  }, [isAuthenticated, user, cartItems, navigate]);

  // Sync billing address with shipping if same
  useEffect(() => {
    if (sameAsShipping) {
      setBillingAddress({ ...shippingAddress });
    }
  }, [shippingAddress, sameAsShipping]);

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax + tip + (orderType === 'delivery' ? bagFee : 0);

  const handleAddressChange = (type, field, value) => {
    if (type === 'shipping') {
      setShippingAddress(prev => ({ ...prev, [field]: value }));
    } else {
      setBillingAddress(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateAddress = (address) => {
    const required = ['firstName', 'lastName', 'address', 'city', 'state', 'zip'];
    return required.every(field => address[field] && address[field].trim());
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validate addresses
      if (orderType === 'delivery' && !validateAddress(shippingAddress)) {
        toast.error('Please fill in all shipping address fields');
        return;
      }
      if (!validateAddress(billingAddress)) {
        toast.error('Please fill in all billing address fields');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleAcceptJSToken = async (tokenData) => {
    setLoading(true);
    try {
      const orderData = {
        dataDescriptor: tokenData.dataDescriptor,
        dataValue: tokenData.dataValue,
        amount: total,
        cartItems: cartItems.map(item => ({
          product: item.id,
          quantity: item.quantity
        })),
        shippingAddress: orderType === 'delivery' ? shippingAddress : null,
        billingAddress: billingAddress,
        orderType: orderType,
        tip: tip,
        bagFee: orderType === 'delivery' ? bagFee : 0,
        saveCard: saveCard
      };

      const response = await axios.post('/api/checkout/process', orderData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/orders/${response.data.order._id}`);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSavedCardPayment = async () => {
    if (!selectedCard) {
      toast.error('Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        paymentMethodId: selectedCard.id,
        amount: total,
        cartItems: cartItems.map(item => ({
          product: item.id,
          quantity: item.quantity
        })),
        shippingAddress: orderType === 'delivery' ? shippingAddress : null,
        billingAddress: billingAddress,
        orderType: orderType,
        tip: tip,
        bagFee: orderType === 'delivery' ? bagFee : 0
      };

      const response = await axios.post('/api/checkout/process-saved-card', orderData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/orders/${response.data.order._id}`);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const tipOptions = [
    { label: 'No tip', value: 0 },
    { label: '15%', value: subtotal * 0.15 },
    { label: '18%', value: subtotal * 0.18 },
    { label: '20%', value: subtotal * 0.20 },
    { label: 'Custom', value: 'custom' }
  ];

  const AddressForm = ({ address, onChange, title, type }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            value={address.firstName}
            onChange={(e) => onChange(type, 'firstName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            value={address.lastName}
            onChange={(e) => onChange(type, 'lastName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <input
            type="text"
            value={address.address}
            onChange={(e) => onChange(type, 'address', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => onChange(type, 'city', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <input
            type="text"
            value={address.state}
            onChange={(e) => onChange(type, 'state', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code *
          </label>
          <input
            type="text"
            value={address.zip}
            onChange={(e) => onChange(type, 'zip', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= stepNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Shipping & Billing</span>
            <span>Payment</span>
            <span>Review Order</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Order Type */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Order Type</h3>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setOrderType('delivery')}
                        className={`px-6 py-3 rounded-md font-medium transition-colors ${
                          orderType === 'delivery'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Delivery
                      </button>
                      <button
                        onClick={() => setOrderType('pickup')}
                        className={`px-6 py-3 rounded-md font-medium transition-colors ${
                          orderType === 'pickup'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Pickup
                      </button>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {orderType === 'delivery' && (
                    <AddressForm
                      address={shippingAddress}
                      onChange={handleAddressChange}
                      title="Shipping Address"
                      type="shipping"
                    />
                  )}

                  {/* Billing Address */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Billing Address</h3>
                      {orderType === 'delivery' && (
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={sameAsShipping}
                            onChange={(e) => setSameAsShipping(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Same as shipping</span>
                        </label>
                      )}
                    </div>
                    {!sameAsShipping && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.firstName}
                            onChange={(e) => handleAddressChange('billing', 'firstName', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.lastName}
                            onChange={(e) => handleAddressChange('billing', 'lastName', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.address}
                            onChange={(e) => handleAddressChange('billing', 'address', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.city}
                            onChange={(e) => handleAddressChange('billing', 'city', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.state}
                            onChange={(e) => handleAddressChange('billing', 'state', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ZIP Code *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.zip}
                            onChange={(e) => handleAddressChange('billing', 'zip', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Tip Selection */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Add a Tip</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {tipOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (option.value === 'custom') {
                              // Handle custom tip
                              const customTip = prompt('Enter custom tip amount:');
                              if (customTip && !isNaN(customTip)) {
                                setTip(parseFloat(customTip));
                              }
                            } else {
                              setTip(option.value);
                            }
                          }}
                          className={`p-3 rounded-md border font-medium transition-colors ${
                            Math.abs(tip - option.value) < 0.01
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          {option.label}
                          {option.value !== 'custom' && option.value !== 0 && (
                            <div className="text-sm">${option.value.toFixed(2)}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                    
                    {user?.billing?.length > 0 && (
                      <div className="mb-6">
                        <div className="flex space-x-4 mb-4">
                          <button
                            onClick={() => setPaymentMethod('saved')}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${
                              paymentMethod === 'saved'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            Saved Cards
                          </button>
                          <button
                            onClick={() => setPaymentMethod('new')}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${
                              paymentMethod === 'new'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            New Card
                          </button>
                        </div>

                        {paymentMethod === 'saved' && (
                          <div className="space-y-3">
                            {user.billing.map((card) => (
                              <div
                                key={card.id}
                                onClick={() => setSelectedCard(card)}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                  selectedCard?.id === card.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                                      {card.cardType}
                                    </div>
                                    <div>
                                      <div className="font-medium">**** **** **** {card.lastFour}</div>
                                      <div className="text-sm text-gray-600">
                                        Expires {card.expiryMonth}/{card.expiryYear}
                                      </div>
                                    </div>
                                  </div>
                                  {card.isDefault && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {paymentMethod === 'new' && (
                      <div>
                        <AcceptJSForm
                          amount={total}
                          onTokenReceived={handleAcceptJSToken}
                          disabled={loading}
                          billingAddress={billingAddress}
                        />
                        <div className="mt-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={saveCard}
                              onChange={(e) => setSaveCard(e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              Save this card for future purchases
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Order Review */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Review Your Order</h3>
                    
                    {/* Order Items */}
                    <div className="space-y-4 mb-6">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img
                            src={item.productimg}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-lg font-semibold">
                            ${((item.saleprice || item.price) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        {tip > 0 && (
                          <div className="flex justify-between">
                            <span>Tip</span>
                            <span>${tip.toFixed(2)}</span>
                          </div>
                        )}
                        {orderType === 'delivery' && (
                          <div className="flex justify-between">
                            <span>Bag Fee</span>
                            <span>${bagFee.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-semibold border-t pt-2">
                          <span>Total</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Place Order Button */}
                    <div className="mt-6">
                      {paymentMethod === 'saved' ? (
                        <button
                          onClick={handleSavedCardPayment}
                          disabled={loading || !selectedCard}
                          className="w-full bg-green-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
                        </button>
                      ) : (
                        <div className="text-center text-gray-600">
                          Use the payment form above to complete your order
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevStep}
                disabled={step === 1}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {step < 3 && (
                <button
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>${((item.saleprice || item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {tip > 0 && (
                  <div className="flex justify-between">
                    <span>Tip</span>
                    <span>${tip.toFixed(2)}</span>
                  </div>
                )}
                {orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Bag Fee</span>
                    <span>${bagFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;