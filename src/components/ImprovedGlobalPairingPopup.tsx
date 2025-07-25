import React, { useState, useEffect } from 'react';
import { X, Wine, Lightbulb, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePairingPopup } from '@/contexts/PairingPopupContext';
import { supabase } from '@/integrations/supabase/client';
import LoadingAnimation from '@/components/LoadingAnimation';

interface WineTip {
  id: string;
  tip_text: string;
  category: string | null;
}

const ImprovedGlobalPairingPopup = () => {
  const { isVisible, hidePopup } = usePairingPopup();
  const [showInitialModal, setShowInitialModal] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [currentTip, setCurrentTip] = useState<WineTip | null>(null);
  const [allTips, setAllTips] = useState<WineTip[]>([]);
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer for elapsed time
  useEffect(() => {
    if (!isVisible) {
      setElapsedTime(0);
      setShowInitialModal(true);
      setShowTips(false);
      setTipIndex(0);
      setCurrentTip(null);
      return;
    }

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  // Show initial modal for 2-3 seconds, then switch to tips
  useEffect(() => {
    if (!isVisible) return;

    const initialTimer = setTimeout(() => {
      setShowInitialModal(false);
      setShowTips(true);
      fetchWineTips();
    }, 2500); // 2.5 seconds

    return () => clearTimeout(initialTimer);
  }, [isVisible]);

  // Cycle tips every 7 seconds (optimized interval)
  useEffect(() => {
    if (!showTips || allTips.length === 0) return;

    const cycleTimer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % allTips.length);
    }, 7000); // 7 seconds as suggested

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (!isVisible) return null;

  // Initial "Finding Your Perfect Wine" modal
  if (showInitialModal) {
    return (
      <Dialog open={isVisible} onOpenChange={hidePopup}>
        <DialogContent className="sm:max-w-sm w-full">
          <DialogTitle className="sr-only">
            Wine Pairing Generation
          </DialogTitle>
          <DialogDescription className="sr-only">
            AI is analyzing your selected dishes and generating personalized wine recommendations
          </DialogDescription>
          
          <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <Wine className="w-10 h-10 text-purple-600 animate-pulse" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-800">
                Finding Your Perfect Wine
              </h3>
              <p className="text-slate-600">
                Our AI sommelier is crafting personalized recommendations...
              </p>
            </div>

            <LoadingAnimation />

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              <span>{formatTime(elapsedTime)}</span>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={hidePopup}
              className="mt-4"
            >
              <X className="w-4 h-4 mr-2" />
              Dismiss
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Quick Vino Tips modal
  return (
    <Dialog open={isVisible} onOpenChange={hidePopup}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">
          Quick Vino Tip
        </DialogTitle>
        <DialogDescription className="sr-only">
          Wine tips and education while your pairings are being generated
        </DialogDescription>
        
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-10 h-10 text-amber-600" />
          </div>
          
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Quick Vino Tip!
          </h3>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 mb-6">
            <p className="text-slate-700 text-lg leading-relaxed">
              {currentTip?.tip_text || 'Loading tip...'}
            </p>
            {currentTip?.category && (
              <div className="mt-4">
                <span className="inline-block bg-purple-200 text-purple-800 text-sm px-3 py-1 rounded-full font-medium">
                  {currentTip.category}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
              <span className="text-slate-600 text-sm">
                Generating pairings...
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
          </div>

          {allTips.length > 1 && (
            <div className="text-sm text-slate-500 mb-4">
              Tip {tipIndex + 1} of {allTips.length} • New tip every 7 seconds
            </div>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={hidePopup}
            className="border-slate-300"
          >
            <X className="w-4 h-4 mr-2" />
            Dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImprovedGlobalPairingPopup;