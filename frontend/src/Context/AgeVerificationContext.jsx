import React, { createContext, useContext, useState, useEffect } from 'react';

const AgeVerificationContext = createContext();

export const useAgeVerification = () => {
  const context = useContext(AgeVerificationContext);
  if (!context) {
    throw new Error('useAgeVerification must be used within an AgeVerificationProvider');
  }
  return context;
};

export const AgeVerificationProvider = ({ children }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isDenied, setIsDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already been verified
    const storedVerification = localStorage.getItem('ageVerified');
    
    if (storedVerification) {
      try {
        const verification = JSON.parse(storedVerification);
        const now = Date.now();
        const verificationAge = now - verification.timestamp;
        
        // Verification expires after 24 hours (86400000 ms)
        if (verification.verified && verificationAge < 86400000) {
          setIsVerified(true);
        } else {
          // Remove expired verification
          localStorage.removeItem('ageVerified');
        }
      } catch (error) {
        console.error('Error parsing age verification:', error);
        localStorage.removeItem('ageVerified');
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleVerified = () => {
    setIsVerified(true);
    setIsDenied(false);
  };

  const handleDenied = () => {
    setIsVerified(false);
    setIsDenied(true);
    // Remove any existing verification
    localStorage.removeItem('ageVerified');
  };

  const getAgeVerificationStatus = () => {
    const storedVerification = localStorage.getItem('ageVerified');
    if (storedVerification) {
      try {
        const verification = JSON.parse(storedVerification);
        return verification.verified && verification.timestamp;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  const value = {
    isVerified,
    isDenied,
    isLoading,
    handleVerified,
    handleDenied,
    getAgeVerificationStatus
  };

  return (
    <AgeVerificationContext.Provider value={value}>
      {children}
    </AgeVerificationContext.Provider>
  );
};

export default AgeVerificationContext;
