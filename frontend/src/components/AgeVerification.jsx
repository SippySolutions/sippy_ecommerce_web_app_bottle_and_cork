import React, { useState } from 'react';
import { useCMS } from '../Context/CMSContext';

const AgeVerification = ({ onVerified, onDenied }) => {
  const { getTheme, cmsData } = useCMS();
  const [isLoading, setIsLoading] = useState(false);
  const theme = getTheme();

  const handleYes = () => {
    setIsLoading(true);
    // Store age verification in localStorage with timestamp
    localStorage.setItem('ageVerified', JSON.stringify({
      verified: true,
      timestamp: Date.now()
    }));
    setTimeout(() => {
      onVerified();
    }, 500);
  };

  const handleNo = () => {
    setIsLoading(true);
    setTimeout(() => {
      onDenied();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
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

        {/* Store Name */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {cmsData?.storeInfo?.name || 'Liquor Store'}
        </h1>

        {/* Age Verification Title */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Age Verification Required
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            You must be 21 years or older to access this website. By continuing, you confirm that you are of legal drinking age.
          </p>
        </div>

        {/* Age Icon */}
        <div className="mb-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${theme.primary}15` }}
          >
            <svg 
              className="w-10 h-10" 
              style={{ color: theme.primary }}
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Are you 21 years or older?
          </h3>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleNo}
            disabled={isLoading}
            className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'No'}
          </button>
          <button
            onClick={handleYes}
            disabled={isLoading}
            className="flex-1 py-3 px-6 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: theme.accent }}
          >
            {isLoading ? 'Loading...' : 'Yes, I am 21+'}
          </button>
        </div>

        {/* Legal Notice */}
        <p className="text-xs text-gray-500 mt-4">
          This website requires users to be of legal drinking age.
        </p>
      </div>
    </div>
  );
};

export default AgeVerification;
