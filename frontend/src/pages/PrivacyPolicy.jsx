import React from 'react';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useCMS } from '../Context/CMSContext';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { cmsData } = useCMS();
  const storeName = cmsData?.storeInfo?.name || 'Bottle and Cork';
  const storeEmail = cmsData?.storeInfo?.email || 'info@sippysolutions.com';
  
  // Format address - handle both object and string formats
  const formatAddress = (address) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const { street, city, state, zipCode, country } = address;
      return `${street || ''}, ${city || ''}, ${state || ''} ${zipCode || ''}${country ? ', ' + country : ''}`.replace(/,\s*,/g, ',').trim();
    }
    return '';
  };
  
  const storeAddress = formatAddress(cmsData?.storeInfo?.address);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors duration-200"
          >
            <ArrowBack className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{storeName} Privacy Policy</h1>
          <p className="text-gray-600">Last Updated: June 23, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-8 prose prose-lg max-w-none">
            
            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {storeName} ("we," "us," or "our") respects your privacy. This Privacy Policy describes our practices regarding the information we collect from you when you use or access our website and mobile application (the "Site"). Our Site is powered in part by Sippy Solution LLC, an independent company whose own website is currently under development. Sippy Solution LLC processes certain data on our behalf to enable site functionality, analytics, and support. Please note that this Privacy Policy does not reference or apply to any other websites or companies with similar names.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                2. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We collect information that can identify, contact, or locate you ("Personal Information"), such as:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                    <li>Name, address, email address, phone number</li>
                    <li>Date of birth (for age verification)</li>
                    <li>Payment information (when making purchases)</li>
                    <li>Government-issued ID (for age verification and compliance with liquor laws)</li>
                  </ul>
                </div>
                <div>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We also collect usage data, such as:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Device type, browser, IP address</li>
                    <li>Order history, preferences, and analytics data</li>
                    <li>Information from cookies and similar technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                3. How We Collect Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 leading-relaxed mb-3">We collect information when you:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                    <li>Register for an account or use guest checkout</li>
                    <li>Make a purchase</li>
                    <li>Log in or use our Site or app</li>
                    <li>Communicate with us or use customer support</li>
                    <li>Use our Site or app (including automatic data collection through cookies and server logs)</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Age Verification for All Users</h3>
                  <p className="text-gray-700 leading-relaxed">
                    All users, including those using guest checkout, are required to verify their age during the checkout process and, where applicable, at the point of delivery or pickup. We collect date of birth and, when necessary, government-issued ID for this purpose.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                4. How We Use Your Information
              </h2>
              <div>
                <p className="text-gray-700 leading-relaxed mb-3">We use your information to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Process and fulfill your orders for delivery or pickup</li>
                  <li>Verify your age and identity as required by law</li>
                  <li>Communicate with you about your orders and account</li>
                  <li>Provide customer support</li>
                  <li>Improve our services and personalize your experience</li>
                  <li>Send marketing communications (with your consent)</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                5. How We Share Your Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 leading-relaxed mb-3">We may share your information with:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                    <li>Third-party service providers (e.g., payment processors, delivery partners)</li>
                    <li>Authorize.net as our payment gateway to process your payments securely</li>
                    <li>Sippy Solution LLC for site functionality, analytics, and support</li>
                    <li>Other partners as necessary for business operations</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Payment Security:</strong> We do not store your payment card details on our servers. All payment information is securely processed by Authorize.net, which is PCI DSS compliant and follows industry-standard security measures to protect your data.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                6. Data Retention
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your information as long as necessary to provide our services and as required by law. You may request deletion of your data at any time.
              </p>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                7. Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar technologies to collect data about your use of our Site. You can manage cookie preferences in your browser settings.
              </p>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                8. Your Rights
              </h2>
              <div>
                <p className="text-gray-700 leading-relaxed mb-3">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                  <li>Access, update, or delete your information</li>
                  <li>Withdraw consent for marketing communications</li>
                  <li>Opt out of certain data collection</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  To exercise these rights, contact us using the information below.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                9. Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We implement reasonable security measures to protect your information. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            {/* Section 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                10. Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We do not knowingly collect information from children under 13, and no part of our Site is directed to children under 13. If we learn that we have collected Personal Information from a child under 13, we will promptly delete it.
              </p>
            </section>

            {/* Section 11 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                11. Changes to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this policy from time to time. We will notify you of significant changes by posting the new policy on our Site or by email.
              </p>
            </section>

            {/* Section 12 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                12. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:{' '}
                <a 
                  href={`mailto:${storeEmail}`}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {storeEmail}
                </a>
              </p>
              {storeAddress && (
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Store Location:</strong>{' '}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                    title="Click for directions"
                  >
                    {storeAddress}
                  </a>
                </p>
              )}
              <p className="text-gray-700 leading-relaxed mt-4">
                You can also review our{' '}
                <Link to="/terms-and-conditions" className="text-blue-600 hover:text-blue-800 underline">
                  Terms & Conditions
                </Link>{' '}
                for additional information about using our services.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
