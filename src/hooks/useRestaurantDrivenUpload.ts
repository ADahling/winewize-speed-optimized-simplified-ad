
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem, WineRecommendation } from '@/types/wine';

interface ProcessedResults {
  menuItems: MenuItem[];
  wines: WineRecommendation[];
  restaurantName: string;
  restaurantId: string;
  timestamp?: number;
}

export const useRestaurantDrivenUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProcessingPopup, setShowProcessingPopup] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState(0);

  const ensureValidSession = async () => {
    console.log('Checking session validity...');
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('Session check error:', error);
        throw new Error('Session validation failed');
      }
      
      if (!session) {
        console.warn('No active session found');
        throw new Error('No active session');
      }
      
      // Check if token is close to expiry (within 5 minutes)
      const now = Math.floor(Date.now() / 1000);
      const tokenExp = session.expires_at || 0;
      const timeUntilExpiry = tokenExp - now;
      
      console.log(`Token expires in ${timeUntilExpiry} seconds`);
      
      if (timeUntilExpiry < 300) { // Less than 5 minutes
        console.log('Token close to expiry, refreshing session...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('Session refresh failed:', refreshError);
          throw new Error('Session refresh failed');
        }
        
        if (!refreshData.session) {
          throw new Error('Session refresh returned no session');
        }
        
        console.log('Session refreshed successfully');
        return refreshData.session;
      }
      
      console.log('Session is valid and current');
      return session;
    } catch (error) {
      console.error('Session validation error:', error);
      throw error;
    }
  };

  const processImagesForSession = async (
    menuImages: File[],
    wineImages: File[],
    restaurantId: string,
    restaurantName: string
  ): Promise<ProcessedResults | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue",
        variant: "destructive",
      });
      return null;
    }

    if (menuImages.length === 0 && wineImages.length === 0) {
      toast({
        title: "No images to process",
        description: "Please capture some images first",
        variant: "destructive",
      });
      return null;
    }

    console.log('=== STARTING SESSION-ONLY PROCESSING WITH analyze-menu-fast ===');
    console.log(`Restaurant: ${restaurantName} (${restaurantId})`);
    console.log(`Images: ${menuImages.length} menu, ${wineImages.length} wine`);

    setIsProcessing(true);
    setShowProcessingPopup(true);
    setProcessingStep('validating');
    setProcessingProgress(5);

    try {
      // Enhanced session validation
      const session = await ensureValidSession();
      
      // Optimized image processing
      setProcessingStep('optimizing');
      setProcessingProgress(15);

      // Convert images to base64 with progress tracking
      const base64Images: string[] = [];
      const totalImages = menuImages.length + wineImages.length;
      
      for (let i = 0; i < menuImages.length; i++) {
        const file = menuImages[i];
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        base64Images.push(base64.split(',')[1]);
        setProcessingProgress(15 + (i + 1) * 15 / totalImages);
      }
      
      for (let i = 0; i < wineImages.length; i++) {
        const file = wineImages[i];
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        base64Images.push(base64.split(',')[1]);
        setProcessingProgress(15 + (menuImages.length + i + 1) * 15 / totalImages);
      }

      setProcessingStep('analyzing');
      setProcessingProgress(35);

      // CRITICAL FIX: Use analyze-menu-unified for session-only processing
      const requestPayload = {
        menuImages: base64Images.filter((_, index) => index < menuImages.length),
        wineImages: base64Images.filter((_, index) => index >= menuImages.length),
        restaurantName,
        persistMode: 'session',
        restaurantId,
        extractionMethod: 'section',
        fallbackToSection: true,
        useOCR: true,
        cacheDuration: 60
      };

      setProcessingProgress(50);

      // CRITICAL FIX: Use analyze-menu-unified for session-only processing
      const edgeFunction = 'analyze-menu-unified'; // This hook is specifically for session-only processing
      console.log(`🔧 Using ${edgeFunction} for session-only processing`);
      
      const { data, error } = await supabase.functions.invoke(edgeFunction, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: requestPayload
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Analysis failed. Please try again.');
      }

      if (!data || !data.success) {
        console.error('Analysis failed:', data?.error);
        throw new Error(data?.error || 'Analysis failed');
      }

      setProcessingProgress(85);

      // Ensure we have comprehensive data
      const menuItems = data.menuItems || [];
      const wines = data.wines || [];

      console.log(`=== SESSION-ONLY EXTRACTION RESULTS ===`);
      console.log(`Menu items extracted: ${menuItems.length}`);
      console.log(`Wines extracted: ${wines.length}`);
      console.log('Full menuItems array:', menuItems);
      console.log('Full wines array:', wines);

      // Add unique IDs to menu items for session tracking
      const menuItemsWithIds = menuItems.map((item: any, index: number) => ({
        ...item,
        id: `session_menu_${Date.now()}_${index}`
      }));

      // CRITICAL FIX: Clear ALL old wine data before storing new data
      console.log('🧹 CLEARING ALL OLD WINE DATA before storing fresh session results');
      sessionStorage.removeItem('sessionWines');
      sessionStorage.removeItem('wineBackup');
      sessionStorage.removeItem('sessionWinePairings');
      localStorage.removeItem('availableWines');
      localStorage.removeItem('wineList');
      localStorage.removeItem('processedWines');

      // Add timestamp for freshness validation
      const timestamp = Date.now();
      
      // Store results in session storage for immediate use
      const sessionResults: ProcessedResults = {
        menuItems: menuItemsWithIds,
        wines: wines,
        restaurantName,
        restaurantId,
        timestamp // Add timestamp for validation
      };

      sessionStorage.setItem('currentSessionResults', JSON.stringify(sessionResults));
      sessionStorage.setItem('currentSessionRestaurant', JSON.stringify({
        id: restaurantId,
        name: restaurantName,
        timestamp
      }));
      
      // CRITICAL FIX: Store wines with timestamp for freshness validation
      const winesWithTimestamp = { wines, timestamp };
      sessionStorage.setItem('sessionWines', JSON.stringify(winesWithTimestamp));

      console.log(`✅ FRESH WINE DATA STORED: ${wines.length} wines with timestamp ${timestamp}`);

      // Clear any old localStorage data
      localStorage.removeItem('currentRestaurantId');
      localStorage.removeItem('currentRestaurantName');
      localStorage.removeItem('menuItems');

      setProcessingProgress(100);
      setProcessingStep('complete');

      console.log(`SESSION-ONLY processing complete: ${sessionResults.menuItems.length} dishes, ${sessionResults.wines.length} wines`);

      setTimeout(() => {
        setShowProcessingPopup(false);
        toast({
          title: "Menu analyzed!",
          description: `Found ${sessionResults.menuItems.length} dishes and ${sessionResults.wines.length} wines`,
        });
        navigate('/dishes');
      }, 1000);

      return sessionResults;

    } catch (error) {
      console.error('Session-only processing error:', error);
      setShowProcessingPopup(false);
      setIsProcessing(false);
      
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze images. Please try again.",
        variant: "destructive",
      });
      
      return null;
    }
  };

  return {
    isProcessing,
    showProcessingPopup,
    processingStep,
    processingProgress,
    processImagesForSession,
    setShowProcessingPopup
  };
};
