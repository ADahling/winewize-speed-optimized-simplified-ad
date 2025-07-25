import React, { useState, useEffect } from 'react';
import { Loader2, Lightbulb } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { supabase } from '@/integrations/supabase/client';
import WinePreferencesStepForm from './wine-preferences/WinePreferencesStepForm';

interface UnifiedProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep?: string;
  progress?: number;
  showTips?: boolean;
  onPreferencesSubmit?: (preferences: any) => void;
}

interface WineTip {
  id: string;
  tip_text: string;
  category: string | null;
}

const UnifiedProcessingModal = ({ 
  isOpen, 
  onClose, 
  currentStep = 'processing',
  progress = 0,
  showTips = true,
  onPreferencesSubmit 
}: UnifiedProcessingModalProps) => {
  const [currentTip, setCurrentTip] = useState<WineTip | null>(null);
  const [allTips, setAllTips] = useState<WineTip[]>([]);
  const [tipIndex, setTipIndex] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferencesSubmitted, setPreferencesSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProcessingTime(0);
      setTipIndex(0);
      setCurrentTip(null);
      setShowPreferences(false);
      setPreferencesSubmitted(false);
      return;
    }

    // Start processing timer
    const timer = setInterval(() => {
      setProcessingTime(prev => prev + 1);
    }, 1000);

    // Only show preferences if onPreferencesSubmit callback is provided (Upload flow)
    let preferencesTimer: NodeJS.Timeout | null = null;
    if (onPreferencesSubmit) {
      preferencesTimer = setTimeout(() => {
        setShowPreferences(true);
      }, 3000);
    }

    // Show tips after 3 seconds if no preferences, or after 10 seconds if preferences shown
    const tipsDelay = onPreferencesSubmit ? 10000 : 3000;
    const tipsTimer = setTimeout(() => {
      if (!showPreferences || preferencesSubmitted) {
        fetchWineTips();
      }
    }, tipsDelay);

    return () => {
      clearInterval(timer);
      if (preferencesTimer) clearTimeout(preferencesTimer);
      clearTimeout(tipsTimer);
    };
  }, [isOpen, showTips, showPreferences, preferencesSubmitted, onPreferencesSubmit]);

  // Cycle tips every 7 seconds
  useEffect(() => {
    if (!showTips || allTips.length === 0) return;

    const cycleTimer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % allTips.length);
    }, 7000);

    return () => clearInterval(cycleTimer);
  }, [showTips, allTips.length]);

  // Update current tip when index changes
  useEffect(() => {
    if (allTips.length > 0) {
      setCurrentTip(allTips[tipIndex]);
    }
  }, [tipIndex, allTips]);

  const fetchWineTips = async () => {
    try {
      const { data, error } = await supabase
        .from('quick_vino_tips')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('Error fetching wine tips:', error);
        return;
      }

      if (data && data.length > 0) {
        // Shuffle tips for variety
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setAllTips(shuffled);
        setCurrentTip(shuffled[0]);
      }
    } catch (error) {
      console.error('Error fetching wine tips:', error);
    }
  };

  const handlePreferencesSubmit = (preferences: any) => {
    setPreferencesSubmitted(true);
    setShowPreferences(false);
    
    // Store preferences in session storage for later use
    sessionStorage.setItem('tonightsWinePreferences', JSON.stringify(preferences));
    
    // Notify parent component
    onPreferencesSubmit?.(preferences);
    
    // Show tips after preferences are submitted
    setTimeout(() => {
      fetchWineTips();
    }, 1000);
  };

  const handleSkipPreferences = () => {
    setPreferencesSubmitted(true);
    setShowPreferences(false);
    
    // Show tips immediately after skipping
    setTimeout(() => {
      fetchWineTips();
    }, 500);
  };

  // Show preferences form during processing
  if (showPreferences && !preferencesSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg bg-white border border-purple-200 max-h-[90vh] overflow-y-auto">
          <div className="py-4 px-2">
            {/* Processing status header */}
            <div className="mb-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                <span className="text-sm text-slate-600">Processing menu... {processingTime}s</span>
              </div>
              <div className="w-full bg-purple-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <div className="max-h-[70vh] overflow-y-auto">
              <WinePreferencesStepForm 
                onSubmit={handlePreferencesSubmit}
                onSkip={handleSkipPreferences}
                onClose={handleSkipPreferences}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border border-purple-200">
        <VisuallyHidden>
          <DialogTitle>Wine Processing</DialogTitle>
          <DialogDescription>Finding your perfect wine pairings</DialogDescription>
        </VisuallyHidden>
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          </div>
          
          <h3 className="text-2xl font-bold text-slate-800 mb-3">
            🍷✨ Finding Your Perfect Wine
          </h3>
          
          <p className="text-lg text-purple-600 font-medium mb-6">
            Our AI sommelier is crafting amazing wine matches just for you...
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-purple-100 rounded-full h-3 mb-6">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Quick Vino Tips Section */}
          {showTips && currentTip && (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <h4 className="text-lg font-semibold text-amber-800">Quick Vino Tip!</h4>
              </div>
              
              <p className="text-slate-700 text-base leading-relaxed mb-3">
                {currentTip.tip_text}
              </p>
              
              {currentTip.category && (
                <span className="inline-block bg-amber-200 text-amber-800 text-sm px-3 py-1 rounded-full font-medium">
                  {currentTip.category}
                </span>
              )}
              
              {allTips.length > 1 && (
                <div className="text-xs text-amber-700 mt-3">
                  Tip {tipIndex + 1} of {allTips.length} • New tip every 7 seconds
                </div>
              )}
            </div>
          )}
          
          <div className="text-sm text-slate-500">
            Processing time: {processingTime}s
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedProcessingModal;