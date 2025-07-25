
import React, { useState, useEffect } from 'react';
import { Loader2, Wine, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface ProcessingPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WineTip {
  id: string;
  tip_text: string;
  category: string | null;
}

const ProcessingPopup = ({ isOpen, onClose }: ProcessingPopupProps) => {
  const [currentTip, setCurrentTip] = useState<WineTip | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setShowTips(false);
      setProcessingTime(0);
      setCurrentTip(null);
      return;
    }

    // Start processing timer
    const timer = setInterval(() => {
      setProcessingTime(prev => prev + 1);
    }, 1000);

    // Show tips popup after 5 seconds
    const tipsTimer = setTimeout(() => {
      setShowTips(true);
      fetchRandomTip();
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(tipsTimer);
    };
  }, [isOpen]);

  const fetchRandomTip = async () => {
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
        const randomTip = data[Math.floor(Math.random() * data.length)];
        setCurrentTip(randomTip);
      }
    } catch (error) {
      console.error('Error fetching wine tips:', error);
    }
  };

  const getNextTip = () => {
    fetchRandomTip();
  };

  if (!showTips) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Processing Your Images
            </h3>
            <p className="text-lg text-purple-600 font-medium">
              Hang Tight! And get ready to select your dishes!
            </p>
            <div className="mt-4 text-sm text-slate-500">
              Processing time: {processingTime}s
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-purple-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Quick Vino Tip!
          </h3>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-slate-700">
              {currentTip?.tip_text || 'Loading tip...'}
            </p>
            {currentTip?.category && (
              <div className="mt-2">
                <span className="inline-block bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full">
                  {currentTip.category}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button onClick={getNextTip} variant="outline" className="w-full">
              <Wine className="w-4 h-4 mr-2" />
              Another Tip
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
            <span className="text-sm text-slate-500">
              Still processing... {processingTime}s
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessingPopup;
