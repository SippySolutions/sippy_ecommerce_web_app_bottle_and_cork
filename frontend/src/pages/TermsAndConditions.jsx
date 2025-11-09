import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { useCMS } from '../Context/CMSContext';

const TermsAndConditions = () => {
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
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors duration-200"
          >
            <ArrowBack className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{storeName} Terms and Conditions</h1>
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
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms and Conditions ("Terms") govern your access to and use of the {storeName} website and mobile application (the "Site"), including all features, services, and content provided by {storeName}. By accessing or using the Site, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use the Site.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                2. Eligibility and Age Verification
              </h2>
              <p className="text-gray-700 leading-relaxed">
                The Site is intended for adults of legal alcohol purchase age only. By accessing or using the Site, you represent and warrant that you are at least 21 years old. All users, including those using guest checkout, must verify their age at the time of purchase. You may also be required to show proof of age and identity at the point of pickup or delivery.
              </p>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                3. Account Registration and Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                While guest checkout is available, all users are subject to these Terms and Conditions. If you choose to register for an account, you agree to provide accurate and complete information during registration and to update it as needed.
              </p>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                4. Orders and Payments
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Ordering:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    By placing an order through the Site, you agree to pay all charges and taxes associated with your order.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Payment:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We use Authorize.net as our payment gateway. Payment information is processed securely by Authorize.net, and we do not store your payment card details.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Pricing and Availability:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Prices and product availability are subject to change without notice. We reserve the right to limit or cancel orders at our discretion.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                5. Delivery and Pickup
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Delivery:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Orders may be delivered by third-party providers. An adult of legal age must be present to accept delivery and provide valid photo identification.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Pickup:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Orders may be available for in-store pickup. You must be of legal age and present valid identification to collect your order.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Refusal of Service:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to refuse delivery or pickup if the recipient appears intoxicated or cannot provide valid identification.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                6. Data Handling and Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our Site is powered in part by Sippy Solution LLC, an independent company whose own website is currently under development. Sippy Solution LLC processes certain data on our behalf to enable site functionality, analytics, and support. Please refer to our{' '}
                <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">
                  Privacy Policy
                </Link>{' '}
                for details on how we collect, use, and protect your personal information.
              </p>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                7. Intellectual Property
              </h2>
              <p className="text-gray-700 leading-relaxed">
                All content on the Site, including text, graphics, logos, and images, is the property of {storeName} or its licensors and is protected by intellectual property laws. You may not use, copy, or reproduce any content without our express written permission.
              </p>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                8. User Content
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You may be able to post reviews or other content on the Site. By posting content, you grant us a non-exclusive, royalty-free, worldwide license to use, display, and distribute your content.
              </p>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                9. Prohibited Conduct
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Use the Site for any unlawful purpose.</li>
                <li>Attempt to circumvent age verification or other security measures.</li>
                <li>Collect or "scrape" data from the Site.</li>
                <li>Interfere with the operation of the Site or its security.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                10. Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, {storeName} shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the Site or any products purchased through the Site.
              </p>
            </section>

            {/* Section 11 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                11. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these Terms from time to time. We will notify you of significant changes by posting the updated Terms on the Site or by email. Your continued use of the Site after such changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            {/* Section 12 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                12. Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of [Your State/Province]. Any disputes arising under these Terms shall be resolved in the courts of [Your State/Province].
              </p>
            </section>

            {/* Section 13 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                13. Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms, please contact us at:{' '}
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
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
