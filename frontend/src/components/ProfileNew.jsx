import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { AuthContext } from './AuthContext';
import AcceptJSForm from './Payment/AcceptJSForm';
import axios from 'axios';

const Profile = () => {
  const { user, updateUser, isAuthenticated, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Profile form data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: ''
  });

  // Address form data
  const [addressData, setAddressData] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put('/api/users/me', profileData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/users/me/addresses', addressData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        updateUser({ ...user, addresses: response.data.addresses });
        setAddressData({
          label: '',
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'US',
          isDefault: false
        });
        setShowAddAddress(false);
        toast.success('Address added successfully');
      }
    } catch (error) {
      console.error('Add address error:', error);
      toast.error(error.response?.data?.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await axios.delete(`/api/users/me/addresses/${addressId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        updateUser({ ...user, addresses: response.data.addresses });
        toast.success('Address deleted successfully');
      }
    } catch (error) {
      console.error('Delete address error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleAddCard = async (tokenData) => {
    setLoading(true);

    try {
      const billingAddress = {
        firstName: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        address: user.addresses?.[0]?.street || '',
        city: user.addresses?.[0]?.city || '',
        state: user.addresses?.[0]?.state || '',
        zip: user.addresses?.[0]?.zip || '',
        country: 'US'
      };

      const response = await axios.post('/api/users/me/billing', {
        dataDescriptor: tokenData.dataDescriptor,
        dataValue: tokenData.dataValue,
        billingAddress: billingAddress,
        isDefault: user.billing?.length === 0
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        updateUser({ ...user, billing: response.data.billing });
        setShowAddCard(false);
        toast.success('Card added successfully');
      }
    } catch (error) {
      console.error('Add card error:', error);
      toast.error(error.response?.data?.message || 'Failed to add card');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (billingId) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const response = await axios.delete(`/api/users/me/billing/${billingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        updateUser({ ...user, billing: response.data.billing });
        toast.success('Payment method deleted successfully');
      }
    } catch (error) {
      console.error('Delete card error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete payment method');
    }
  };

  const handleSetDefaultCard = async (billingId) => {
    try {
      const response = await axios.put(`/api/users/me/billing/${billingId}`, {
        isDefault: true
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        updateUser({ ...user, billing: response.data.billing });
        toast.success('Default payment method updated');
      }
    } catch (error) {
      console.error('Set default card error:', error);
      toast.error(error.response?.data?.message || 'Failed to update default payment method');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
          <button 
            onClick={() => window.location.href = '/account'}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile Information' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'payment', label: 'Payment Methods' },
    { id: 'orders', label: 'Order History' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Account</h1>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-200 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={profileData.dob}
                      onChange={(e) => setProfileData(prev => ({ ...prev, dob: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'addresses' && (
            <motion.div
              key="addresses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Saved Addresses</h2>
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Address
                  </button>
                </div>

                {user?.addresses?.length > 0 ? (
                  <div className="space-y-4">
                    {user.addresses.map((address) => (
                      <div key={address.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{address.label}</h3>
                            <p className="text-gray-600">
                              {address.street}<br />
                              {address.city}, {address.state} {address.zip}
                            </p>
                            {address.isDefault && (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-2">
                                Default
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No addresses saved yet.</p>
                )}
              </div>

              {/* Add Address Modal */}
              {showAddAddress && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
                    
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Label *
                        </label>
                        <input
                          type="text"
                          value={addressData.label}
                          onChange={(e) => setAddressData(prev => ({ ...prev, label: e.target.value }))}
                          placeholder="e.g., Home, Work"
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={addressData.street}
                          onChange={(e) => setAddressData(prev => ({ ...prev, street: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            value={addressData.city}
                            onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
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
                            value={addressData.state}
                            onChange={(e) => setAddressData(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          value={addressData.zip}
                          onChange={(e) => setAddressData(prev => ({ ...prev, zip: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={addressData.isDefault}
                            onChange={(e) => setAddressData(prev => ({ ...prev, isDefault: e.target.checked }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Set as default address</span>
                        </label>
                      </div>
                      
                      <div className="flex space-x-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowAddAddress(false)}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {loading ? 'Adding...' : 'Add Address'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Saved Payment Methods</h2>
                  <button
                    onClick={() => setShowAddCard(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Card
                  </button>
                </div>

                {user?.billing?.length > 0 ? (
                  <div className="space-y-4">
                    {user.billing.map((card) => (
                      <div key={card.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                              {card.cardType}
                            </div>
                            <div>
                              <div className="font-medium">**** **** **** {card.lastFour}</div>
                              <div className="text-sm text-gray-600">
                                Expires {card.expiryMonth}/{card.expiryYear}
                              </div>
                            </div>
                            {card.isDefault && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {!card.isDefault && (
                              <button
                                onClick={() => handleSetDefaultCard(card.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No payment methods saved yet.</p>
                )}
              </div>

              {/* Add Card Modal */}
              {showAddCard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-screen overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Add New Payment Method</h3>
                      <button
                        onClick={() => setShowAddCard(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <AcceptJSForm
                      onTokenReceived={handleAddCard}
                      onPaymentError={(error) => {
                        console.error('Payment error:', error);
                        toast.error(error.message || 'Failed to add payment method');
                        setLoading(false);
                      }}
                      billingAddress={{
                        firstName: user.name.split(' ')[0] || '',
                        lastName: user.name.split(' ').slice(1).join(' ') || '',
                        address: user.addresses?.[0]?.street || '',
                        city: user.addresses?.[0]?.city || '',
                        state: user.addresses?.[0]?.state || '',
                        zip: user.addresses?.[0]?.zip || ''
                      }}
                      buttonText="Save Payment Method"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-6">Order History</h2>
              
              {user?.orders?.length > 0 ? (
                <div className="space-y-4">
                  {user.orders.map((order) => (
                    <div key={order._id} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Order #{order.orderNumber}</h3>
                          <p className="text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Status: <span className="capitalize">{order.status}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${order.total?.toFixed(2)}</div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm mt-1">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No orders yet.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
