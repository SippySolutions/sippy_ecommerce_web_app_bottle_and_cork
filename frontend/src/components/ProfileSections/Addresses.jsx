import React, { useState } from 'react';
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

const Addresses = ({ addresses: initialAddresses = [] }) => {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editing, setEditing] = useState(null); // id or null
  const [form, setForm] = useState(emptyAddress);
  const [showForm, setShowForm] = useState(false);

  // Handle form field changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update address
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      const res = await updateAddress(form.id, form);
      setAddresses(res.addresses); // Use backend response
    } else {
      const res = await addAddress(form);
      setAddresses(res.addresses); // Use backend response
    }
    setForm(emptyAddress);
    setEditing(null);
    setShowForm(false);
  };

  // Edit address
  const handleEdit = (address) => {
    setForm(address);
    setEditing(address.id);
    setShowForm(true);
  };

  // Delete address
  const handleDelete = async (id) => {
    const res = await deleteAddress(id);
    setAddresses(res.addresses); // Use backend response
    if (editing === id) {
      setEditing(null);
      setShowForm(false);
      setForm(emptyAddress);
    }
  };

  // Set default address
  const handleSetDefault = async (id) => {
    // Find the address to update
    const address = addresses.find(addr => addr.id === id);
    if (!address) return;

    // Send update to backend, setting isDefault: true
    const res = await updateAddress(id, { ...address, isDefault: true });
    setAddresses(res.addresses); // Use backend response to update state
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4 flex items-center">
        <i className="material-icons mr-2">home</i> ADDRESSES ({addresses.length})
      </h2>
      <div className="space-y-4">
        {addresses.map((address) => (
          <div key={address.id} className="border rounded-lg shadow-md p-4">
            <h3 className="font-bold text-gray-800">{address.label}</h3>
            <p className="text-gray-600">
              {address.street}, {address.city}, {address.state} {address.zip}, {address.country}
            </p>
            <div className="text-sm text-gray-500 mt-2">
              {address.isDefault ? 'Default for delivery' : (
                <button
                  className="text-blue-600 underline ml-2"
                  onClick={() => handleSetDefault(address.id)}
                >
                  Set as default
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-4">
              <button
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                onClick={() => handleEdit(address)}
              >
                <i className="material-icons mr-2">edit</i> Edit
              </button>
              <button
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                onClick={() => handleDelete(address.id)}
              >
                <i className="material-icons mr-2">delete</i> Delete
              </button>
            </div>
          </div>
        ))}
        <button
          className="mt-4 px-6 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primaryHover)]"
          onClick={() => {
            setForm(emptyAddress);
            setEditing(null);
            setShowForm(true);
          }}
        >
          Add New Address
        </button>
        {showForm && (
          <form
            className="mt-6 bg-white border rounded-lg shadow-md p-4 flex flex-col gap-2"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              name="label"
              placeholder="Label (e.g. Home, Work)"
              value={form.label}
              onChange={handleChange}
              className="border rounded px-2 py-1"
              required
            />
            <input
              type="text"
              name="street"
              placeholder="Street Address"
              value={form.street}
              onChange={handleChange}
              className="border rounded px-2 py-1"
              required
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              className="border rounded px-2 py-1"
              required
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
              className="border rounded px-2 py-1"
              required
            />
            <input
              type="text"
              name="zip"
              placeholder="ZIP Code"
              value={form.zip}
              onChange={handleChange}
              className="border rounded px-2 py-1"
              required
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={form.country}
              onChange={handleChange}
              className="border rounded px-2 py-1"
              required
            />
            <div className="flex space-x-4 mt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primaryHover)]"
              >
                {editing ? 'Update Address' : 'Add Address'}
              </button>
              <button
                type="button"
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setForm(emptyAddress);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Addresses;