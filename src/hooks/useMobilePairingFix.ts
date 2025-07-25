import { useState, useMemo } from 'react';

interface MobilePairingOptions {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

export const useMobilePairingFix = (options: Partial<MobilePairingOptions> = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 2000,
    timeout = 15000
  } = options;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  
  const canRetry = useMemo(() => retryCount < maxRetries, [retryCount, maxRetries]);
  
  const executeWithRetry = async <T>(
    fn: () => Promise<T>, 
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ): Promise<T | null> => {
    setIsProcessing(true);
    setLastError(null);
    
    try {
      // Set timeout for mobile connections
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), timeout);
      });
      
      // Execute function with timeout
      const result = await Promise.race([
        fn(),
        timeoutPromise
      ]) as T;
      
      // Success handling
      setIsProcessing(false);
      setSuccessCount(prev => prev + 1);
      setRetryCount(0);
      
      if (onSuccess) onSuccess(result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setLastError(err);
      setRetryCount(prev => prev + 1);
      
      console.error(`Mobile pairing error (attempt ${retryCount + 1}/${maxRetries}):`, err);
      
      if (retryCount + 1 < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return executeWithRetry(fn, onSuccess, onError);
      } else {
        setIsProcessing(false);
        if (onError) onError(err);
        return null;
      }
    }
  };
  
  const resetRetryState = () => {
    setRetryCount(0);
    setLastError(null);
    setIsProcessing(false);
  };
  
  return {
    isProcessing,
    retryCount,
    lastError,
    canRetry,
    successCount,
    executeWithRetry,
    resetRetryState
  };
};