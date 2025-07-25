
import { useState, useEffect } from 'react';

const AGE_VERIFICATION_KEY = 'wine-wize-age-verified';
const VERIFICATION_EXPIRY_DAYS = 30;

interface AgeVerificationData {
  verified: boolean;
  timestamp: number;
  expires: number;
}

export const useAgeVerification = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAgeVerification();
  }, []);

  const checkAgeVerification = () => {
    try {
      const storedData = localStorage.getItem(AGE_VERIFICATION_KEY);
      
      if (!storedData) {
        setShowModal(true);
        setIsLoading(false);
        return;
      }

      const verificationData: AgeVerificationData = JSON.parse(storedData);
      const now = Date.now();

      // Check if verification has expired
      if (now > verificationData.expires) {
        localStorage.removeItem(AGE_VERIFICATION_KEY);
        setShowModal(true);
        setIsLoading(false);
        return;
      }

      // User is verified and not expired
      setShowModal(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking age verification:', error);
      // If there's an error reading localStorage, show modal to be safe
      setShowModal(true);
      setIsLoading(false);
    }
  };

  const verifyAge = (isOfAge: boolean) => {
    if (isOfAge) {
      const verificationData: AgeVerificationData = {
        verified: true,
        timestamp: Date.now(),
        expires: Date.now() + (VERIFICATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
      };
      
      localStorage.setItem(AGE_VERIFICATION_KEY, JSON.stringify(verificationData));
      setShowModal(false);
      return true;
    } else {
      // Redirect to age restriction page
      window.location.href = '/age-restricted';
      return false;
    }
  };

  const clearVerification = () => {
    localStorage.removeItem(AGE_VERIFICATION_KEY);
    setShowModal(true);
  };

  return {
    showModal,
    isLoading,
    verifyAge,
    clearVerification
  };
};
