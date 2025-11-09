import React from 'react';
import { useCMS } from '../Context/CMSContext';

const AgeDenied = () => {
  const { getTheme, cmsData } = useCMS();
  const theme = getTheme();

  const handleRetry = () => {
    // Refresh the page to show age verification again
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
        {/* Logo */}
        {cmsData?.logo && (
          <div className="mb-6">
            <img 
              src={cmsData.logo} 
              alt="Store Logo" 
              className="h-16 mx-auto object-contain"
            />
          </div>
        )}

        {/* Restriction Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-12 h-12 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Restricted
        </h1>

        {/* Message */}
        <div className="mb-8">
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            We're sorry, but you must be 21 years or older to access this website.
          </p>
          <p className="text-gray-500 text-sm">
            This website contains information about alcoholic beverages and is intended for adults of legal drinking age only.
          </p>
        </div>

        {/* Legal Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Legal Notice</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            In accordance with local and federal laws, we are required to verify that all visitors to this website are of legal drinking age. We take this responsibility seriously and appreciate your understanding.
          </p>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full py-3 px-6 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: theme.primary }}
          >
            Return to Age Verification
          </button>
          
          <p className="text-xs text-gray-500">
            If you believe this is an error, please refresh the page and try again.
          </p>
        </div>

        {/* Store Information */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">
            {cmsData?.storeInfo?.name || 'Store Information'}
          </h4>
          {cmsData?.storeInfo?.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                typeof cmsData.storeInfo.address === 'string' 
                  ? cmsData.storeInfo.address 
                  : `${cmsData.storeInfo.address.street}, ${cmsData.storeInfo.address.city}, ${cmsData.storeInfo.address.state} ${cmsData.storeInfo.address.zipCode}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 mb-1 hover:text-blue-600 transition-colors inline-block"
              title="Click for directions"
            >
              {typeof cmsData.storeInfo.address === 'string' 
                ? cmsData.storeInfo.address 
                : `${cmsData.storeInfo.address.street}, ${cmsData.storeInfo.address.city}, ${cmsData.storeInfo.address.state} ${cmsData.storeInfo.address.zipCode}`
              }
            </a>
          )}
          {cmsData?.storeInfo?.phone && (
            <p className="text-sm text-gray-600">
              Phone: {cmsData.storeInfo.phone}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgeDenied;
