import React, { useState } from 'react';

const OrderDetailsForm = ({
  user,
  recipient,
  setRecipient,
  phone,
  setPhone,
  email,
  setEmail,
  isGift,
  setIsGift,
  deliveryAddress,
  setDeliveryAddress,
  showGiftOption = true,
}) => {
  // For guest checkout
  const [localEmail, setLocalEmail] = useState('');
  const [localPhone, setLocalPhone] = useState('');

  // For gift recipient
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftDeliveryAddress, setGiftDeliveryAddress] = useState('');

  // If not logged in, show email and phone fields
  if (!user) {
    return (
      <div className="bg-white rounded shadow p-4 mb-4">
        <div className="mb-2 font-bold">Contact Information</div>
        <div className="mb-2">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            className="border rounded px-2 py-1 w-full"
            value={localEmail}
            onChange={e => {
              setLocalEmail(e.target.value);
              setEmail && setEmail(e.target.value);
            }}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Phone Number</label>
          <input
            type="tel"
            className="border rounded px-2 py-1 w-full"
            value={localPhone}
            onChange={e => {
              setLocalPhone(e.target.value);
              setPhone && setPhone(e.target.value);
            }}
            required
          />
        </div>
      </div>
    );
  }

  // If logged in, show gift option and recipient details if needed
  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <div className="mb-2 font-bold">Order Details</div>
      <div className="mb-2">
        <span>
          <b>Email:</b> {user.email}
        </span>
      </div>
      <div className="mb-2">
        <span>
          <b>Phone:</b> {user.phone}
        </span>
      </div>
      {showGiftOption && (
        <div className="mb-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={isGift}
              onChange={e => setIsGift(e.target.checked)}
              className="mr-2"
            />
            Is this order a gift?
          </label>
        </div>
      )}
      {isGift && (
        <div className="mt-2 p-2 border rounded bg-gray-50">
          <div className="mb-2">
            <label className="block mb-1">Recipient Name</label>
            <input
              type="text"
              className="border rounded px-2 py-1 w-full"
              value={giftRecipient}
              onChange={e => {
                setGiftRecipient(e.target.value);
                setRecipient && setRecipient(e.target.value);
              }}
              required
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Recipient Delivery Address</label>
            <input
              type="text"
              className="border rounded px-2 py-1 w-full"
              value={giftDeliveryAddress}
              onChange={e => {
                setGiftDeliveryAddress(e.target.value);
                setDeliveryAddress && setDeliveryAddress(e.target.value);
              }}
              required
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsForm;