
import { supabase } from '@/integrations/supabase/client';
import { validateRequestPayload } from '@/utils/imageValidation';

interface RequestPayload {
  images: string[];
  analysisType: string;
  menuCount: number;
  wineCount: number;
  selectedWineTypes: string[];
  budget: number;
  restaurantName: string;
}

export const useAnalysisRequest = () => {
  const sendAnalysisRequest = async (
    base64Images: string[],
    menuImages: File[],
    wineImages: File[],
    selectedWineTypes: string[],
    userBudget: number,
    restaurantName: string,
    setProcessingProgress: (progress: number) => void,
    setProcessingStep: (step: string) => void
  ) => {
    setProcessingStep('analyze');

    // Prepare properly formatted request payload with restaurant info
    const requestPayload: RequestPayload = { 
      images: base64Images,
      analysisType: 'combined',
      menuCount: menuImages.length,
      wineCount: wineImages.length,
      selectedWineTypes,
      budget: userBudget,
      restaurantName: restaurantName
    };

    // Validate request payload before sending
    validateRequestPayload(requestPayload);

    console.log(`Sending edge function request: images(${requestPayload.images.length}), menuCount(${requestPayload.menuCount}), wineCount(${requestPayload.wineCount}), restaurant(${requestPayload.restaurantName})`);

    // Enhanced request with increased timeout and retry logic
    console.log('Starting edge function call...');
    setProcessingStep('connecting');
    setProcessingProgress(25);

    const startTime = Date.now();
    let lastError: Error | null = null;
    
    // Retry configuration
    const MAX_RETRIES = 3;
    const TIMEOUT_MS = 180000; // 3 minutes
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`=== ATTEMPT ${attempt}/${MAX_RETRIES} ===`);
        console.log(`Starting edge function call attempt ${attempt}...`);
        
        // Create timeout promise that rejects
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Request timeout after ${TIMEOUT_MS/1000} seconds (attempt ${attempt})`)), TIMEOUT_MS);
        });

        // Update progress to show connection attempt
        setProcessingStep('connecting');
        setProcessingProgress(30 + (attempt - 1) * 10);

        const functionCall = supabase.functions.invoke('analyze-menu', {
          body: requestPayload
        });

        console.log(`Attempt ${attempt}: Waiting for edge function response...`);
        setProcessingStep('analyzing');
        setProcessingProgress(40 + (attempt - 1) * 10);

        const result = await Promise.race([functionCall, timeoutPromise]);
        const { data, error } = result;

        const requestTime = Date.now() - startTime;
        console.log(`=== EDGE FUNCTION RESPONSE (${requestTime}ms, attempt ${attempt}) ===`);
        console.log('Response data:', data);
        console.log('Response error:', error);

        setProcessingProgress(80);

        // Handle Supabase function invocation errors
        if (error) {
          console.error(`Supabase function invocation error on attempt ${attempt}:`, error);
          lastError = new Error(`Edge function invocation failed (attempt ${attempt}): ${error.message || 'Unknown invocation error'}`);
          
          // Retry on network/connection errors
          if (attempt < MAX_RETRIES && (
            error.message?.includes('NetworkError') || 
            error.message?.includes('fetch') ||
            error.message?.includes('timeout') ||
            error.message?.includes('connection') ||
            error.message?.includes('Failed to fetch')
          )) {
            console.log(`Network error on attempt ${attempt}, retrying in ${2000 * attempt}ms...`);
            setProcessingStep('retrying');
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }
          
          throw lastError;
        }

        // Handle missing response data
        if (!data) {
          console.error(`No data received from edge function on attempt ${attempt}`);
          lastError = new Error(`No response data received from edge function (attempt ${attempt})`);
          
          if (attempt < MAX_RETRIES) {
            console.log(`No data on attempt ${attempt}, retrying in ${2000 * attempt}ms...`);
            setProcessingStep('retrying');
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }
          
          throw lastError;
        }

        // Handle edge function application errors (data.success = false)
        if (!data.success) {
          const errorMessage = data.error || 'Edge function returned success: false';
          console.error(`Edge function application error on attempt ${attempt}:`, errorMessage);
          lastError = new Error(`Analysis failed: ${errorMessage}`);
          
          // Don't retry on application logic errors
          throw lastError;
        }

        // Validate response data structure
        if (!data.restaurantId) {
          console.error(`Invalid response: missing restaurantId on attempt ${attempt}`);
          lastError = new Error(`Invalid response: no restaurant ID returned`);
          throw lastError;
        }

        if ((!data.menuItems || data.menuItems.length === 0) && 
            (!data.wines || data.wines.length === 0)) {
          console.error(`Invalid response: no data extracted on attempt ${attempt}`);
          lastError = new Error(`No menu items or wines were extracted from the images`);
          throw lastError;
        }

        // Success! Return the data
        console.log(`=== SUCCESS ON ATTEMPT ${attempt} ===`);
        console.log(`Extracted ${data.menuItems?.length || 0} menu items and ${data.wines?.length || 0} wines`);
        return data;

      } catch (error) {
        lastError = error as Error;
        console.error(`=== ATTEMPT ${attempt} FAILED ===`, error);
        
        // If this is the last attempt, throw the error
        if (attempt === MAX_RETRIES) {
          console.error(`=== ALL ATTEMPTS FAILED ===`);
          throw lastError;
        }
        
        // For network-related errors, retry with exponential backoff
        if (error.message?.includes('timeout') || 
            error.message?.includes('NetworkError') || 
            error.message?.includes('fetch') ||
            error.message?.includes('connection') ||
            error.message?.includes('Failed to fetch')) {
          const backoffDelay = Math.min(3000 * Math.pow(2, attempt - 1), 15000); // Max 15s
          console.log(`Network error on attempt ${attempt}, retrying in ${backoffDelay}ms...`);
          setProcessingStep('retrying');
          setProcessingProgress(35 + (attempt - 1) * 5);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        } else {
          // For non-network errors, don't retry
          console.error(`Non-retryable error on attempt ${attempt}:`, error.message);
          throw lastError;
        }
      }
    }
    
    // This should never be reached, but just in case
    throw lastError || new Error('All retry attempts failed');
  };

  return {
    sendAnalysisRequest
  };
};
