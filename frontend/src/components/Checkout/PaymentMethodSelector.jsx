import React, { useState, useEffect } from 'react';

const cardTypeIcons = {
  Visa: '💳',
  MasterCard: '💳',
  Amex: '💳',
  Discover: '💳',
};

const PaymentMethodSelector = ({
  user,
  paymentMethod,
  setPaymentMethod,
  tipPercent,
  setTipPercent,
  customTip,
  setCustomTip,
  colorAccent,
  totalPrice,
  cardNumber,
  setCardNumber,
  expirationDate,
  setExpirationDate,
  cvv,
  setCvv,
  selectedCardIndex,
  setSelectedCardIndex,
}) => {
  const [showNewCard, setShowNewCard] = useState(false);

  // When user.billing changes, select default card
  useEffect(() => {
    if (user?.billing?.length > 0 && !showNewCard) {
      const defaultIdx = user.billing.findIndex(card => card.isDefault);
      const initialCardIndex = defaultIdx !== -1 ? defaultIdx : 0;
      setSelectedCardIndex(initialCardIndex);
      setPaymentMethod('saved');
      // Autofill card fields for backend (if needed)
      const card = user.billing[initialCardIndex];
      if (card) {
        setCardNumber(''); // Don't autofill full card number for security
        setExpirationDate(`${card.expiryMonth}/${card.expiryYear}`);
        setCvv('');
      }
    }
  // eslint-disable-next-line
  }, [user?.billing, setSelectedCardIndex, setPaymentMethod]);

  // Handle card selection
  const handleSelectCard = (idx) => {
    setSelectedCardIndex(idx);
    setShowNewCard(false);
    setPaymentMethod('saved');
    const card = user.billing[idx];
    setCardNumber(''); // Don't autofill full card number
    setExpirationDate(`${card.expiryMonth}/${card.expiryYear}`);
    setCvv('');
  };
  // Handle new card selection
  const handleSelectNewCard = () => {
    setShowNewCard(true);
    setSelectedCardIndex(null);
    setPaymentMethod('new');
    setCardNumber('');
    setExpirationDate('');
    setCvv('');
  };

  // Tip options
  const tipOptions = [0, 10, 15, 20];

  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <div className="font-bold mb-2">Payment Method</div>
      {user?.billing?.length > 0 && (
        <div className="mb-2">
          <div className="font-semibold mb-1">Saved Cards</div>
          {user.billing.map((card, idx) => (
            <label
              key={card.lastFour + card.expiryYear}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer border ${
                selectedCardIndex === idx && !showNewCard
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200'
              } mb-1`}
              style={{
                borderColor:
                  selectedCardIndex === idx && !showNewCard
                    ? colorAccent
                    : '#e5e7eb',
              }}
            >
              <input
                type="radio"
                name="paymentCard"
                checked={selectedCardIndex === idx && !showNewCard}
                onChange={() => handleSelectCard(idx)}
              />
              <span className="text-2xl">{cardTypeIcons[card.cardType] || '💳'}</span>
              <span>
                {card.cardType} **** {card.lastFour} (Exp: {card.expiryMonth}/{card.expiryYear})
              </span>
              {card.isDefault && (
                <span className="bg-blue-600 text-white rounded px-2 py-0.5 text-xs ml-2">
                  Default
                </span>
              )}
            </label>
          ))}
          <label
            className={`flex items-center gap-2 p-2 rounded cursor-pointer border ${
              showNewCard ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
            }`}
            style={{
              borderColor: showNewCard ? colorAccent : '#e5e7eb',
            }}
          >
            <input
              type="radio"
              name="paymentCard"
              checked={showNewCard}
              onChange={handleSelectNewCard}
            />
            <span className="text-2xl">➕</span>
            <span>Add New Card</span>
          </label>
        </div>
      )}
      {(!user?.billing?.length || showNewCard) && (
        <div className="mt-2">
          <div className="font-semibold mb-1">Enter Card Details</div>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value)}
              maxLength={19}
              className="border rounded px-2 py-1"
              autoComplete="cc-number"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="MM/YY"
                value={expirationDate}
                onChange={e => setExpirationDate(e.target.value)}
                maxLength={5}
                className="border rounded px-2 py-1 w-20"
                autoComplete="cc-exp"
              />
              <input
                type="text"
                placeholder="CVV"
                value={cvv}
                onChange={e => setCvv(e.target.value)}
                maxLength={4}
                className="border rounded px-2 py-1 w-20"
                autoComplete="cc-csc"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tip Selection */}
      <div className="mt-4">
        <div className="font-semibold mb-1">Tip</div>
        <div className="flex gap-2">
          {tipOptions.map(opt => (
            <button
              key={opt}
              type="button"
              className={`px-3 py-1 rounded border ${
                tipPercent === opt && !customTip
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100'
              }`}
              style={{
                borderColor:
                  tipPercent === opt && !customTip
                    ? colorAccent
                    : '#e5e7eb',
                background:
                  tipPercent === opt && !customTip
                    ? colorAccent
                    : '#f3f4f6',
                color:
                  tipPercent === opt && !customTip
                    ? '#fff'
                    : '#222',
              }}
              onClick={() => {
                setTipPercent(opt);
                setCustomTip('');
              }}
            >
              {opt === 0 ? 'No Tip' : `${opt}%`}
            </button>
          ))}
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Custom"
            value={customTip}
            onChange={e => setCustomTip(e.target.value)}
            className="border rounded px-2 py-1 w-20"
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Tip amount: $
          {customTip
            ? Number(customTip).toFixed(2)
            : ((totalPrice * tipPercent) / 100).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;