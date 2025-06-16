import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { CartContext } from '../Context/CartContext';
import { AuthContext } from '../components/AuthContext';
import { useCMS } from '../Context/CMSContext';
import { useAgeVerification } from '../Context/AgeVerificationContext';
import AcceptJSForm from '../components/Payment/AcceptJSForm';
import axios from 'axios';
import { processCheckout, processSavedCardCheckout, processGuestCheckout } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();  const { cartItems, getTotalPrice, clearCart } = useContext(CartContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  const { cmsData } = useCMS();
  const { getAgeVerificationStatus } = useAgeVerification();

  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState('delivery');
  const [step, setStep] = useState(1); // 1: Addresses, 2: Payment, 3: Review
  const [tip, setTip] = useState(0);  const [paymentMethod, setPaymentMethod] = useState('new'); // 'new' or 'saved'
  const [selectedCard, setSelectedCard] = useState(null);
  const [saveCard, setSaveCard] = useState(false);
  
  // Guest checkout fields
  const [guestInfo, setGuestInfo] = useState({
    email: '',
    phone: ''
  });
  
  // Get bag fee and delivery fee from CMS data
  const bagFee = cmsData?.storeInfo?.bag || 0.5;
  const deliveryFeeAmount = cmsData?.storeInfo?.delivery?.fee || 5;
  const deliveryMinimum = cmsData?.storeInfo?.delivery?.under || 30;

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
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Pre-populate addresses from user profile if authenticated
    if (isAuthenticated && user?.addresses?.length > 0) {
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
    if (isAuthenticated && user?.billing?.length > 0) {
      setPaymentMethod('saved');
      const defaultCard = user.billing.find(card => card.isDefault) || user.billing[0];
      setSelectedCard(defaultCard);
    }
  }, [isAuthenticated, user, cartItems, navigate]);

  // Sync billing address with shipping if same
  useEffect(() => {
    if (sameAsShipping) {
      setBillingAddress({ ...shippingAddress });
    }  }, [shippingAddress, sameAsShipping]);

  // Helper function to round to 2 decimal places
  const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  const subtotal = roundToTwo(getTotalPrice());
  const tax = roundToTwo(subtotal * 0.08); // 8% tax
  
  // Calculate conditional delivery fee
  const deliveryFee = (orderType === 'delivery' && subtotal < deliveryMinimum) ? roundToTwo(deliveryFeeAmount) : 0;
  
  const total = roundToTwo(subtotal + tax + tip + (orderType === 'delivery' ? roundToTwo(bagFee) + deliveryFee : 0));

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
      // Validate guest info for non-authenticated users
      if (!isAuthenticated) {
        if (!guestInfo.email || !guestInfo.phone) {
          toast.error('Please fill in your email and phone number');
          return;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guestInfo.email)) {
          toast.error('Please enter a valid email address');
          return;
        }
      }
      
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
  };  const handleAcceptJSToken = async (tokenData) => {
    if (loading) return; // Prevent double submission
    setLoading(true);
    try {
      // Get age verification data
      const ageVerificationData = getAgeVerificationStatus();
      const ageVerified = Boolean(ageVerificationData);
      const ageVerifiedAt = ageVerified ? new Date(ageVerificationData) : null;

      if (isAuthenticated) {
        // Authenticated user checkout
        // Check if user wants to save card but has reached limit
        const shouldSaveCard = saveCard && user?.billing?.length < 3;
        
        if (saveCard && user?.billing?.length >= 3) {
          toast.warning('Card limit reached. Processing payment without saving card.');
        }

        const orderData = {
          dataDescriptor: tokenData.dataDescriptor,
          dataValue: tokenData.dataValue,
          amount: total,
          cartItems: cartItems.map(item => ({
            product: item._id,
            quantity: item.quantity
          })),
          shippingAddress: orderType === 'delivery' ? shippingAddress : null,
          billingAddress: billingAddress,
          orderType: orderType,
          tip: tip,
          bagFee: orderType === 'delivery' ? bagFee : 0,
          deliveryFee: orderType === 'delivery' ? deliveryFee : 0,
          saveCard: shouldSaveCard,
          ageVerified: ageVerified,
          ageVerifiedAt: ageVerifiedAt
        };

        const response = await processCheckout(orderData);

        if (response.success) {
          toast.success('Order placed successfully!');
          clearCart();
          navigate(`/orders/${response.order._id}`);
        } else {
          throw new Error(response.message);
        }
      } else {
        // Guest checkout
        // Validate guest info
        if (!guestInfo.email || !guestInfo.phone) {
          toast.error('Email and phone number are required for guest checkout');
          return;
        }

        const orderData = {
          dataDescriptor: tokenData.dataDescriptor,
          dataValue: tokenData.dataValue,
          amount: total,
          cartItems: cartItems.map(item => ({
            product: item._id,
            quantity: item.quantity
          })),
          shippingAddress: orderType === 'delivery' ? shippingAddress : null,
          billingAddress: billingAddress,
          orderType: orderType,
          tip: tip,
          bagFee: orderType === 'delivery' ? bagFee : 0,
          deliveryFee: orderType === 'delivery' ? deliveryFee : 0,
          ageVerified: ageVerified,
          ageVerifiedAt: ageVerifiedAt,
          guestInfo: {
            email: guestInfo.email,
            phone: guestInfo.phone
          }
        };

        const response = await processGuestCheckout(orderData);

        if (response.success) {
          toast.success('Order placed successfully!');
          clearCart();
          navigate('/'); // Redirect to home for guest users
        } else {
          throw new Error(response.message);
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };
  const handleSavedCardPayment = async () => {
    if (!selectedCard) {
      toast.error('Please select a payment method');
      return;
    }

    if (loading) return; // Prevent double submission
    setLoading(true);
    try {
      // Get age verification data
      const ageVerificationData = getAgeVerificationStatus();
      const ageVerified = Boolean(ageVerificationData);
      const ageVerifiedAt = ageVerified ? new Date(ageVerificationData) : null;

      const orderData = {
        paymentMethodId: selectedCard.id,
        amount: total,
        cartItems: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity
        })),
        shippingAddress: orderType === 'delivery' ? shippingAddress : null,
        billingAddress: billingAddress,
        orderType: orderType,
        tip: tip,
        bagFee: orderType === 'delivery' ? bagFee : 0,
        deliveryFee: orderType === 'delivery' ? deliveryFee : 0,
        ageVerified: ageVerified,
        ageVerifiedAt: ageVerifiedAt
      };const response = await processSavedCardCheckout(orderData);

      if (response.success) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/orders/${response.order._id}`);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error?.message || 'Payment failed');
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
                      </button>                    </div>
                  </div>

                  {/* Guest Information */}
                  {!isAuthenticated && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={guestInfo.email}
                            onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={guestInfo.phone}
                            onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="(555) 123-4567"
                            required
                          />
                        </div>
                      </div>                      <p className="text-sm text-gray-600 mt-2">
                        * Required for order confirmation and delivery updates
                      </p>
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>Want to save time next time?</strong>{' '}
                          <button
                            onClick={() => navigate('/account')}
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Create an account
                          </button>{' '}
                          to save your information and track orders.
                        </p>
                      </div>
                    </div>
                  )}

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
                  </div>                  {/* Payment Method Selection */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                    
                    {isAuthenticated && user?.billing?.length > 0 && (
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
                        </div>                        {paymentMethod === 'saved' && (
                          <div className="space-y-3">
                            {user.billing && user.billing.length > 0 ? (
                              user.billing.map((card) => (
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
                                      <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center text-xs font-medium text-white">
                                        {card.cardType?.substring(0, 4) || 'CARD'}
                                      </div>
                                      <div>
                                        <div className="font-medium">
                                          {card.cardType || 'Card'} ending in {card.lastFour || '****'}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          Expires {card.expiryMonth}/{card.expiryYear}
                                        </div>
                                        {card.billingAddress && (
                                          <div className="text-xs text-gray-500">
                                            {card.billingAddress.city}, {card.billingAddress.state}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {card.isDefault && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                          Default
                                        </span>
                                      )}
                                      {selectedCard?.id === card.id && (
                                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <p>No saved payment methods found</p>
                                <button
                                  onClick={() => setPaymentMethod('new')}
                                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Add a new payment method
                                </button>
                              </div>
                            )}
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
                          billingAddress={billingAddress}                        />

                        {isAuthenticated && (
                          <div className="mt-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={saveCard}
                                onChange={(e) => setSaveCard(e.target.checked)}
                                disabled={user?.billing?.length >= 3}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                              />
                              <span className="text-sm text-gray-700">
                                Save this card for future purchases
                                {user?.billing?.length >= 3 && (
                                  <span className="text-red-600 ml-1">
                                    (Maximum 3 cards - delete one to save new)
                                  </span>
                                )}
                              </span>
                            </label>
                            {user?.billing?.length >= 3 && (
                              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-sm text-yellow-800">
                                  <strong>Card limit reached:</strong> You have {user.billing.length}/3 saved cards. 
                                  Go to your profile to manage saved payment methods.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
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
                    <div className="space-y-4 mb-6">                      {cartItems.map((item) => (
                        <div key={item._id} className="flex items-center space-x-4 p-4 border rounded-lg">
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
                          </div>                        )}
                        {orderType === 'delivery' && (
                          <>
                            <div className="flex justify-between">
                              <span>Bag Fee</span>
                              <span>${bagFee.toFixed(2)}</span>                            </div>
                            <div className="flex justify-between">
                              <span>
                                Delivery Fee
                                {subtotal >= deliveryMinimum && (
                                  <span className="text-green-600 text-xs ml-1">(Free over ${deliveryMinimum})</span>
                                )}
                              </span>
                              <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                                {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                              </span>
                            </div>
                          </>
                        )}                        <div className="flex justify-between text-lg font-semibold border-t pt-2">
                          <span>Total</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Free Delivery Incentive */}
                      {orderType === 'delivery' && subtotal < deliveryMinimum && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 text-blue-800">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium">
                              Add ${(deliveryMinimum - subtotal).toFixed(2)} more to get FREE delivery!
                            </span>
                          </div>
                        </div>
                      )}
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
              
              <div className="space-y-3 mb-4">                {cartItems.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
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
                  </div>                )}
                {orderType === 'delivery' && (
                  <>
                    <div className="flex justify-between">
                      <span>Bag Fee</span>
                      <span>${bagFee.toFixed(2)}</span>                    </div>
                    <div className="flex justify-between">
                      <span>
                        Delivery Fee
                        {subtotal >= deliveryMinimum && (
                          <span className="text-green-600 text-xs ml-1">(Free over ${deliveryMinimum})</span>
                        )}
                      </span>
                      <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                        {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                  </>
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