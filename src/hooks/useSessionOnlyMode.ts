
import { useState, useEffect, useCallback } from 'react';

export const useSessionOnlyMode = () => {
  const [isSessionOnly, setIsSessionOnly] = useState(false);

  useEffect(() => {
    const sessionOnlyFlag = sessionStorage.getItem('sessionOnlyMode');
    setIsSessionOnly(sessionOnlyFlag === 'true');
  }, []);

  const enableSessionOnlyMode = useCallback(() => {
    sessionStorage.setItem('sessionOnlyMode', 'true');
    sessionStorage.setItem('sessionOnlyRestaurant', JSON.stringify({
      id: 'session-only',
      name: 'Current Session'
    }));
    setIsSessionOnly(true);
  }, []);

  const disableSessionOnlyMode = useCallback(() => {
    sessionStorage.removeItem('sessionOnlyMode');
    sessionStorage.removeItem('sessionOnlyRestaurant');
    setIsSessionOnly(false);
  }, []);

  const getSessionRestaurant = useCallback(() => {
    if (!isSessionOnly) return null;
    const stored = sessionStorage.getItem('sessionOnlyRestaurant');
    return stored ? JSON.parse(stored) : null;
  }, [isSessionOnly]);

  return {
    isSessionOnly,
    enableSessionOnlyMode,
    disableSessionOnlyMode,
    getSessionRestaurant
  };
};
