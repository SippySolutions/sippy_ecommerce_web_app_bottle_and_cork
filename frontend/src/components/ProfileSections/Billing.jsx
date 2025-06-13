import React, { useState } from 'react';
import { addBilling, updateBilling, deleteBilling, validateAllBillingMethods } from '../../services/api';

const Billing = ({ billingMethods = [], refreshUser }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cardType: '',
    cardholderName: '',
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validating, setValidating] = useState(false);

  const handleInput = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddCard = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      console.log('🔄 Adding new card to Authorize.Net...');
      const result = await addBilling(form);
      setSuccess(result.message || 'Card added successfully and payment profile created in Authorize.Net!');
      setShowAddForm(false);
      setForm({ cardNumber: '', expiryMonth: '', expiryYear: '', cardType: '', cardholderName: '', isDefault: false });
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error('❌ Error adding card:', err);
      setError(err?.message || err?.response?.data?.message || 'Failed to add card to Authorize.Net.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (card) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await updateBilling(card.id, { isDefault: true });
      setSuccess(result.message || 'Default card updated.');
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error('❌ Error setting default:', err);
      if (err.profileInvalid) {
        setError('This card\'s payment profile is invalid in Authorize.Net. Please delete and re-add the card.');
      } else {
        setError(err?.message || 'Failed to set default.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (card) => {
    if (!window.confirm(`Delete ${card.cardType} ****${card.lastFour}? This will remove it from both the database and Authorize.Net.`)) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      console.log('🔄 Deleting card from Authorize.Net...');
      const result = await deleteBilling(card.id);
      setSuccess(result.message || 'Card deleted from both database and Authorize.Net.');
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error('❌ Error deleting card:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to delete card from Authorize.Net.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateCards = async () => {
    setValidating(true);
    setError('');
    setSuccess('');
    try {
      console.log('🔄 Validating all cards with Authorize.Net...');
      const result = await validateAllBillingMethods();
      
      if (result.invalidCards.length > 0) {
        setError(`Found ${result.invalidCards.length} invalid card(s). These cards may need to be re-added.`);
      } else {
        setSuccess(`All ${result.validCards.length} card(s) are valid in Authorize.Net.`);
      }
      
      console.log('📊 Validation result:', result.summary);
    } catch (err) {
      console.error('❌ Error validating cards:', err);
      setError('Failed to validate cards with Authorize.Net.');
    } finally {
      setValidating(false);
    }
  };

  // Test function for debugging
  const handleTestCard = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const testCardData = {
        cardNumber: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '2025',
        cardType: 'Visa',
        cardholderName: 'Test User',
        isDefault: false
      };
      
      console.log('🔄 Adding test card for debugging...');
      const result = await addBilling(testCardData);
      setSuccess('Test card added successfully! Check console for details.');
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error('❌ Error adding test card:', err);
      setError('Failed to add test card: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">Billing & Payment Methods</h2>
      {error && <div className="text-red-600 mb-2 p-2 bg-red-50 border border-red-200 rounded">{error}</div>}
      {success && <div className="text-green-600 mb-2 p-2 bg-green-50 border border-green-200 rounded">{success}</div>}
        {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded"
          onClick={() => setShowAddForm(f => !f)}
          disabled={loading}
        >
          {showAddForm ? 'Cancel' : 'Add New Card'}
        </button>
        
        {billingMethods.length > 0 && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleValidateCards}
            disabled={validating || loading}
          >
            {validating ? 'Validating...' : 'Validate Cards'}
          </button>
        )}
        
        {/* Debug Test Button */}
        <button
          className="bg-green-600 text-white px-4 py-2 rounded text-sm"
          onClick={handleTestCard}
          disabled={loading}
          title="Add a test Visa card for debugging"
        >
          {loading ? 'Adding...' : '🧪 Add Test Card'}
        </button>
      </div>

      {/* Developer Debug Info */}
      {billingMethods.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
          <details>
            <summary className="cursor-pointer font-semibold text-sm text-gray-700 mb-2">
              🔧 Developer Info (Click to expand)
            </summary>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Total Cards:</strong> {billingMethods.length}</p>
              <p><strong>Cards with Profile IDs:</strong> {billingMethods.filter(c => c.customerProfileId && c.customerPaymentProfileId).length}</p>
              <p><strong>Default Card:</strong> {billingMethods.find(c => c.isDefault)?.cardType || 'None'} ****{billingMethods.find(c => c.isDefault)?.lastFour || 'N/A'}</p>
              <div className="mt-2">
                <strong>Profile IDs:</strong>
                <ul className="ml-4 mt-1">
                  {billingMethods.map(card => (
                    <li key={card.id} className="truncate">
                      {card.cardType} ****{card.lastFour}: 
                      {card.customerProfileId ? ` Customer:${card.customerProfileId}` : ' No Customer ID'} 
                      {card.customerPaymentProfileId ? ` | Payment:${card.customerPaymentProfileId}` : ' | No Payment ID'}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Saved Cards */}
      <div className="mb-6">
        {billingMethods.length === 0 && (
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded">
            <p className="text-gray-600">No cards saved.</p>
            <p className="text-sm text-gray-500 mt-1">Add a card to securely store it in Authorize.Net for future checkout.</p>
          </div>
        )}
        {billingMethods.map(card => (
          <div key={card.id} className="flex items-center justify-between bg-white rounded shadow p-4 mb-2 border">            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{card.cardType}</span> 
                <span>**** {card.lastFour}</span>
                <span className="text-gray-500">(Exp: {card.expiryMonth}/{card.expiryYear})</span>
                {card.isDefault && <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded text-xs">Default</span>}
              </div>
              
              {/* Show profile IDs with status indicator */}
              {card.customerProfileId && card.customerPaymentProfileId && (
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Authorize.Net Profile Active
                  </span>
                  <span className="text-gray-300">|</span>
                  <span>Profile: {card.customerProfileId}</span>
                  <span>Payment: {card.customerPaymentProfileId}</span>
                </div>
              )}
              
              {(!card.customerProfileId || !card.customerPaymentProfileId) && (
                <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  Missing Authorize.Net Profile - Re-add Required
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {!card.isDefault && (
                <button 
                  onClick={() => handleSetDefault(card)} 
                  className="text-blue-600 hover:underline text-sm" 
                  disabled={loading}
                >
                  Set Default
                </button>
              )}
              <button 
                onClick={() => handleDelete(card)} 
                className="text-red-500 hover:underline text-sm" 
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>      {/* Add Card Form */}
      {showAddForm && (
        <form className="bg-white rounded shadow p-4 mt-2 max-w-md border" onSubmit={handleAddCard}>
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">Add New Payment Card</h3>
            <p className="text-sm text-gray-600">
              Your card will be securely tokenized and stored in Authorize.Net. No sensitive card data is stored on our servers.
            </p>
          </div>
          
          <div className="mb-2">
            <label className="block font-semibold mb-1">Cardholder Name</label>
            <input 
              name="cardholderName" 
              value={form.cardholderName} 
              onChange={handleInput} 
              className="border rounded px-2 py-1 w-full" 
              required 
              placeholder="John Doe"
            />
          </div>
          
          <div className="mb-2">
            <label className="block font-semibold mb-1">Card Number</label>
            <input 
              name="cardNumber" 
              value={form.cardNumber} 
              onChange={handleInput} 
              className="border rounded px-2 py-1 w-full" 
              maxLength={19} 
              required 
              placeholder="4111111111111111"
            />
            <p className="text-xs text-gray-500 mt-1">Test cards: Visa 4111111111111111, MC 5424000000000015</p>
          </div>
          
          <div className="flex gap-2 mb-2">
            <div>
              <label className="block font-semibold mb-1">Expiry Month</label>
              <input 
                name="expiryMonth" 
                value={form.expiryMonth} 
                onChange={handleInput} 
                className="border rounded px-2 py-1 w-20" 
                maxLength={2} 
                required 
                placeholder="12"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Expiry Year</label>
              <input 
                name="expiryYear" 
                value={form.expiryYear} 
                onChange={handleInput} 
                className="border rounded px-2 py-1 w-20" 
                maxLength={4} 
                required 
                placeholder="2025"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Card Type</label>
              <select 
                name="cardType" 
                value={form.cardType} 
                onChange={handleInput} 
                className="border rounded px-2 py-1 w-28" 
                required
              >
                <option value="">Select</option>
                <option value="Visa">Visa</option>
                <option value="MasterCard">MasterCard</option>
                <option value="Amex">Amex</option>
                <option value="Discover">Discover</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4 flex items-center gap-2">
            <input 
              type="checkbox" 
              name="isDefault" 
              checked={form.isDefault} 
              onChange={handleInput} 
              id="isDefault" 
            />
            <label htmlFor="isDefault" className="text-sm">Set as default payment method</label>
          </div>
          
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded w-full" 
            disabled={loading}
          >
            {loading ? 'Creating Authorize.Net Profile...' : 'Add Card & Create Payment Profile'}
          </button>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            🔒 Secured by Authorize.Net tokenization
          </p>
        </form>
      )}
    </div>
  );
};

export default Billing;
