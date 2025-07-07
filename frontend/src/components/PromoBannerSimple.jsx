import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMS } from '../Context/CMSContext';

const PromoBannerSimple = ({ 
  type = 'horizontal', 
  className = '' 
}) => {
  const { cmsData } = useCMS();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!cmsData?.promo_banner) {
    return null;
  }

  const { promo_1, promo_2, promo_3 } = cmsData.promo_banner;
  const promoItems = [promo_1, promo_2, promo_3].filter(item => item && item.image);

  if (promoItems.length === 0) {
    return null;
  }

  const handleBannerClick = (promoItem) => {
    try {
      console.log('PromoBanner: Click detected', promoItem);
      navigate('/products');
    } catch (error) {
      console.error('PromoBanner: Navigation error:', error);
    }
  };

  // Auto-advance carousel
  useEffect(() => {
    if (type === 'carousel' && promoItems.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % promoItems.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [type, promoItems.length]);

  if (type === 'carousel') {
    return (
      <div className={`w-full bg-gray-100 ${className}`}>
        <div className="relative w-full h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 overflow-hidden">
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => handleBannerClick(promoItems[currentIndex])}
            style={{
              backgroundImage: `url(${promoItems[currentIndex]?.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Simple dots */}
          {promoItems.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {promoItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default horizontal layout
  return (
    <div className={`w-full my-8 ${className}`}>
      <div className="flex gap-4 overflow-x-auto">
        {promoItems.map((promoItem, index) => (
          <div
            key={index}
            className="min-w-[200px] h-32 relative rounded-lg overflow-hidden cursor-pointer"
            onClick={() => handleBannerClick(promoItem)}
            style={{
              backgroundImage: `url(${promoItem?.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PromoBannerSimple;
