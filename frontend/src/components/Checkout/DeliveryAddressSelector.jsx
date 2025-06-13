import React, { useState, useEffect } from 'react';

const DeliveryAddressSelector = ({
  addresses = [],
  selectedAddress,
  setSelectedAddress,
  showAddressForm,
  setShowAddressForm,
  onNext,
  colorAccent,
}) => {
  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });
  const [confirmed, setConfirmed] = useState(false);

  // Auto-select default address if available
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress && !showAddressForm) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [addresses, selectedAddress, showAddressForm, setSelectedAddress]);

  // Reset confirmation if address changes or form is shown
  useEffect(() => {
    setConfirmed(false);
  }, [showAddressForm, selectedAddress]);

  // When an address is selected, confirm immediately
  useEffect(() => {
    if (selectedAddress && !showAddressForm) {
      setConfirmed(true);
      if (onNext) onNext();
    }
  }, [selectedAddress, showAddressForm, onNext]);

  if (confirmed && selectedAddress) {
    return (
      <div className="flex justify-between items-center">
        <div>
          <div className="font-bold mb-1">Delivery Address</div>
          <div className="font-semibold">{selectedAddress.label}</div>
          <div className="text-sm">{selectedAddress.address}</div>
        </div>
        <button
          className="text-blue-600 underline ml-4"
          onClick={() => setConfirmed(false)}
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="font-bold mb-2">Delivery Address</div>
      {addresses.length > 0 && !showAddressForm ? (
        <>
          <div className="flex flex-col gap-2 mb-2">
            {addresses.map(addr => (
              <button
                key={addr.id}
                className={`border rounded p-2 text-left ${
                  selectedAddress?.id === addr.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
                onClick={() => setSelectedAddress(addr)}
              >
                <div className="font-semibold">{addr.label}</div>
                <div className="text-sm">
                  {addr.street}, {addr.city}, {addr.state} {addr.zip}, {addr.country}
                </div>
                {addr.isDefault && (
                  <span className="text-xs text-green-600 ml-2">(Default)</span>
                )}
              </button>
            ))}
          </div>
          <button
            className="text-blue-600 underline mb-2"
            onClick={() => setShowAddressForm(true)}
          >
            + Add New Address
          </button>
        </>
      ) : (
        <form
          className="flex flex-col gap-2"
          onSubmit={e => {
            e.preventDefault();
            const addressWithId = { ...newAddress, id: Date.now().toString() };
            setSelectedAddress(addressWithId);
            setShowAddressForm(false);
            setNewAddress({
              label: '',
              street: '',
              city: '',
              state: '',
              zip: '',
              country: '',
            });
            if (onNext) onNext();
          }}
        >
          <input
            type="text"
            placeholder="Label (e.g. Home, Work)"
            value={newAddress.label}
            onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="text"
            placeholder="Street Address"
            value={newAddress.street}
            onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="text"
            placeholder="City"
            value={newAddress.city}
            onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="text"
            placeholder="State"
            value={newAddress.state}
            onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="text"
            placeholder="ZIP Code"
            value={newAddress.zip}
            onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })}
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="text"
            placeholder="Country"
            value={newAddress.country}
            onChange={e => setNewAddress({ ...newAddress, country: e.target.value })}
            className="border rounded px-2 py-1"
            required
          />
          <button
            type="submit"
            className="mt-2 px-6 py-2 rounded-full font-bold"
            style={{
              background: colorAccent,
              color: '#fff',
              minWidth: 100,
              display: 'inline-block'
            }}
          >
            Save
          </button>
          {addresses.length > 0 && (
            <button
              type="button"
              className="text-blue-600 underline mt-2"
              onClick={() => setShowAddressForm(false)}
            >
              Cancel
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default DeliveryAddressSelector;