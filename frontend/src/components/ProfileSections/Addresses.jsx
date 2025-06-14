import React, { useState, useEffect } from 'react';
import { addAddress, updateAddress, deleteAddress } from '../../services/api';

const emptyAddress = {
  id: '',
  label: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  isDefault: false,
};

const Addresses = ({ addresses: initialAddresses = [], refreshUser }) => {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editing, setEditing] = useState(null); // id or null
  const [form, setForm] = useState(emptyAddress);
  const [showForm, setShowForm] = useState(false);

  // Update addresses when prop changes
  useEffect(() => {
    setAddresses(initialAddresses);
  }, [initialAddresses]);

  // Handle form field changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update address
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const res = await updateAddress(form.id, form);
        setAddresses(res.addresses);
      } else {
        const res = await addAddress(form);
        setAddresses(res.addresses);
      }
      setForm(emptyAddress);
      setEditing(null);
      setShowForm(false);
      
      if (refreshUser) {
        refreshUser();
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  // Edit address
  const handleEdit = (address) => {
    setForm(address);
    setEditing(address.id);
    setShowForm(true);
  };

  // Delete address
  const handleDelete = async (id) => {
    try {
      const res = await deleteAddress(id);
      setAddresses(res.addresses);
      if (editing === id) {
        setEditing(null);
        setShowForm(false);
        setForm(emptyAddress);
      }
      
      if (refreshUser) {
        refreshUser();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  // Set default address
  const handleSetDefault = async (id) => {
    try {
      const address = addresses.find(addr => addr.id === id);
      if (!address) return;

      const res = await updateAddress(id, { ...address, isDefault: true });
      setAddresses(res.addresses);
      
      if (refreshUser) {
        refreshUser();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-primary)] flex items-center">
              <i className="material-icons mr-2">home</i> 
              ADDRESSES ({addresses.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your delivery addresses for faster checkout
            </p>
          </div>
          <button
            className="inline-flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primaryHover)] transition-colors duration-200"
            onClick={() => {
              setForm(emptyAddress);
              setEditing(null);
              setShowForm(true);
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Address
          </button>
        </div>
        
        <div className="space-y-4">
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <div key={address.id} className="border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-bold text-gray-800">{address.label}</h3>
                      {address.isDefault && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">
                      {address.street}, {address.city}, {address.state} {address.zip}, {address.country}
                    </p>
                    {!address.isDefault && (
                      <button
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set as default
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      onClick={() => handleEdit(address)}
                    >
                      <i className="material-icons mr-1 text-sm">edit</i> Edit
                    </button>
                    <button
                      className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      onClick={() => handleDelete(address.id)}
                    >
                      <i className="material-icons mr-1 text-sm">delete</i> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add your first delivery address to get started.
              </p>
            </div>
          )}
        </div>

        {showForm && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editing ? 'Edit Address' : 'Add New Address'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label (e.g. Home, Work) *
                  </label>
                  <input
                    type="text"
                    name="label"
                    placeholder="Enter address label"
                    value={form.label}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    placeholder="Enter street address"
                    value={form.street}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="Enter state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zip"
                    placeholder="Enter ZIP code"
                    value={form.zip}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    placeholder="Enter country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                    setForm(emptyAddress);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primaryHover)] transition-colors duration-200"
                >
                  {editing ? 'Update Address' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Addresses;
