
import React, { useEffect, useRef } from 'react';
import { useForceLogout } from '@/hooks/useForceLogout';
import { useAuth } from '@/contexts/AuthContext';

const SessionValidator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { checkAndFixJWTIssue } = useForceLogout();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (user && !hasChecked.current) {
      hasChecked.current = true;
      // Check for JWT issues when the component mounts
      checkAndFixJWTIssue();
    }
  }, [user, checkAndFixJWTIssue]);

  return <>{children}</>;
};

export default SessionValidator;
