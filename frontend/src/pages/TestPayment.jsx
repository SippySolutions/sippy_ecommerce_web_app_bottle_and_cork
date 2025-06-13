import React, { useState } from 'react';
import AcceptJSForm from '../components/Payment/AcceptJSForm';
import { toast } from 'react-toastify';

/**
 * Test page for Accept.js integration
 * Access at: /test-payment
 */
const TestPayment = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTokenReceived = async (tokenData) => {
    setLoading(true);
    console.log('Token received:', tokenData);
    
    try {
      // Test the token by calling our backend
      const response = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          dataDescriptor: tokenData.dataDescriptor,
          dataValue: tokenData.dataValue,
          amount: 1.00, // $1.00 test transaction
          cartItems: [
            {
              product: '60f1b0b5d5c4a12345678901', // Dummy product ID
              quantity: 1
            }
          ],
          billingAddress: {
            firstName: 'Test',
            lastName: 'User',
            address: '123 Test St',
            city: 'Test City',
            state: 'CA',
            zip: '12345',
            country: 'US'
          },
          orderType: 'pickup',
          tip: 0,
          bagFee: 0,
          saveCard: false
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResult({
          success: true,
          message: 'Payment processed successfully!',
          transactionId: result.payment.transactionId,
          orderId: result.order._id
        });
        toast.success('Test payment successful!');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Test payment error:', error);
      setTestResult({
        success: false,
        message: error.message || 'Payment failed'
      });
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setTestResult({
      success: false,
      message: error.message
    });
    toast.error(error.message);
  };

  const testBillingAddress = {
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test Street',
    city: 'Test City',
    state: 'CA',
    zip: '12345',
    country: 'US'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Payment Integration Test
          </h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              Test Instructions
            </h2>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use test card: <strong>4111 1111 1111 1111</strong></li>
              <li>• Expiry: Any future date (e.g., 12/25)</li>
              <li>• CVV: Any 3 digits (e.g., 123)</li>
              <li>• This will process a $1.00 test transaction</li>
            </ul>
          </div>

          <AcceptJSForm
            onTokenReceived={handleTokenReceived}
            onPaymentError={handlePaymentError}
            billingAddress={testBillingAddress}
            disabled={loading}
            buttonText="Test Payment"
            amount={1.00}
          />

          {testResult && (
            <div className={`mt-6 p-4 rounded-lg ${
              testResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className={`font-semibold ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? '✅ Test Result: Success' : '❌ Test Result: Failed'}
              </h3>
              <p className={`mt-2 ${
                testResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {testResult.message}
              </p>
              {testResult.success && testResult.transactionId && (
                <div className="mt-2 text-sm text-green-600">
                  <p>Transaction ID: {testResult.transactionId}</p>
                  <p>Order ID: {testResult.orderId}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Environment Check</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>API Login ID: {process.env.REACT_APP_AUTHORIZE_NET_API_LOGIN_ID ? '✅ Configured' : '❌ Missing'}</p>
              <p>Public Key: {process.env.REACT_APP_AUTHORIZE_NET_PUBLIC_KEY ? '✅ Configured' : '❌ Missing'}</p>
              <p>Accept.js will load from: {process.env.NODE_ENV === 'production' ? 'Production' : 'Sandbox'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPayment;
