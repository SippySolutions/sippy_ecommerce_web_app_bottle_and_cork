import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMS } from '../Context/CMSContext';

const PromoBannerDebug = ({ 
  type = 'horizontal', 
  className = '', 
  title, 
  description, 
  ctaText, 
  ctaLink 
}) => {
  const { cmsData } = useCMS();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [debugInfo, setDebugInfo] = useState({});

  // Debug logging for mobile
  useEffect(() => {
    const info = {
      type,
      isCapacitor: !!window.Capacitor,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      cmsDataExists: !!cmsData,
      promoBannerExists: !!cmsData?.promo_banner,
      promoBannerData: cmsData?.promo_banner
    };
    
    console.log('PromoBannerDebug: Debug info:', info);
    setDebugInfo(info);
  }, [type, cmsData]);

  if (!cmsData?.promo_banner) {
    return (
      <div className={`bg-yellow-100 p-4 rounded-lg ${className}`}>
        <h3 className="font-bold text-yellow-800">Debug: No promo_banner data</h3>
        <pre className="text-xs text-yellow-700 mt-2">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    );
  }

  const { promo_1, promo_2, promo_3 } = cmsData.promo_banner;
  const promoItems = [promo_1, promo_2, promo_3].filter(item => item && item.image);

  if (promoItems.length === 0) {
    return (
      <div className={`bg-red-100 p-4 rounded-lg ${className}`}>
        <h3 className="font-bold text-red-800">Debug: No valid promo items</h3>
        <pre className="text-xs text-red-700 mt-2">
          {JSON.stringify({ promo_1, promo_2, promo_3 }, null, 2)}
        </pre>
      </div>
    );
  }

  const handleBannerClick = (promoItem) => {
    try {
      console.log('PromoBannerDebug: Click detected', promoItem);
      
      if (!promoItem?.action) {
        console.warn('PromoBannerDebug: No action defined');
        return;
      }

      // Simple navigation test
      navigate('/products');
    } catch (error) {
      console.error('PromoBannerDebug: Navigation error:', error);
    }
  };

  // Simple version for debugging
  return (
    <div className={`w-full my-4 ${className}`}>
      <div className="bg-green-100 p-2 rounded-lg mb-4">
        <h3 className="font-bold text-green-800">Debug: PromoBanner Working</h3>
        <p className="text-xs text-green-700">Type: {type}, Items: {promoItems.length}</p>
      </div>
      
      <div className="flex gap-4 overflow-x-auto">
        {promoItems.map((promoItem, index) => (
          <div
            key={index}
            className="min-w-[200px] h-32 relative rounded-lg overflow-hidden cursor-pointer bg-gray-200 border-2 border-blue-500"
            onClick={() => handleBannerClick(promoItem)}
          >
            <img
              src={promoItem?.image}
              alt={`Debug Banner ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('PromoBannerDebug: Image load error:', e.target.src);
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
              <span className="text-white font-bold">Click {index + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromoBannerDebug;
