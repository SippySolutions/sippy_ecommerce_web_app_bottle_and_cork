import React from 'react';

const StoreCredit = ({ storeCredit }) => {
  const remaining = storeCredit.threshold - storeCredit.balance;

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4 flex items-center">
        <i className="material-icons mr-2">credit_card</i> STORE CREDIT
      </h2>

      {/* Store Credit Balance */}
      <div className="text-4xl font-bold text-gray-800 mb-2">${storeCredit.balance.toFixed(2)}</div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div
          className="bg-[var(--color-primary)] h-2.5 rounded-full"
          style={{ width: `${(storeCredit.balance / storeCredit.threshold) * 100}%` }}
        ></div>
      </div>
      <p className="text-gray-600 mb-6">
        {remaining > 0
          ? `Keep shopping, you need $${remaining.toFixed(2)} more to start using your store credit.`
          : 'You can now use your store credit!'}
      </p>

      {/* Store Credit History */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">Store Credit History</h3>
      <div className="space-y-4">
        {storeCredit.history.map((entry, index) => (
          <div
            key={index}
            className="grid grid-cols-3 items-center text-gray-700 border-b pb-2 last:border-b-0"
          >
            <div className="font-bold">${entry.amount.toFixed(2)}</div>
            <div>{entry.description}</div>
            <div className="text-right text-sm text-gray-500">{entry.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreCredit;