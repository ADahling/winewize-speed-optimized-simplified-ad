
import { useEffect, useRef } from 'react';

// SIMPLIFIED: Remove complex stream tracking that was causing issues
export const useCameraCleanup = () => {
  const hasCleanedUpRef = useRef(false);

  // Simple cleanup that only runs once
  const stopAllStreams = () => {
    if (hasCleanedUpRef.current) return;
    
    console.log('Simple camera cleanup triggered');
    hasCleanedUpRef.current = true;
    
    // Force stop any active camera streams (iOS compatibility)
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(() => {
        // Ignore errors, cleanup is best effort
      });
  };

  // Only cleanup on page unload/navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopAllStreams();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      stopAllStreams();
    };
  }, []);

  // Return minimal interface - no registerStream needed
  return {
    stopAllStreams
  };
};
