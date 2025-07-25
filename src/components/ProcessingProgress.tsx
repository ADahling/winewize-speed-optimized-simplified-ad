
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, Wifi, AlertCircle, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface ProcessingProgressProps {
  isOpen: boolean;
  currentStep: string;
  progress: number;
  menuCount: number;
  wineCount: number;
}

const ProcessingProgress = ({ 
  isOpen, 
  currentStep, 
  progress, 
  menuCount, 
  wineCount 
}: ProcessingProgressProps) => {
  
  const getStepInfo = (step: string) => {
    switch (step) {
      case 'optimize':
        return {
          title: 'Optimizing Images',
          description: 'Preparing your images for analysis...',
          icon: <Loader2 className="w-6 h-6 animate-spin text-purple-600" />,
          estimatedTime: '10-15 seconds'
        };
      case 'connecting':
        return {
          title: 'Connecting to AI Service',
          description: 'Establishing secure connection...',
          icon: <Wifi className="w-6 h-6 animate-pulse text-blue-600" />,
          estimatedTime: '15-30 seconds'
        };
      case 'retrying':
        return {
          title: 'Retrying Connection',
          description: 'Network issue detected, retrying...',
          icon: <RotateCcw className="w-6 h-6 animate-spin text-amber-600" />,
          estimatedTime: '5-10 seconds'
        };
      case 'analyzing':
      case 'analyze':
        return {
          title: 'AI Analysis in Progress',
          description: `Analyzing ${menuCount} menu pages and ${wineCount} wine pages...`,
          icon: <Loader2 className="w-6 h-6 animate-spin text-purple-600" />,
          estimatedTime: getTotalEstimatedTime()
        };
      case 'verify':
        return {
          title: 'Verifying Results',
          description: 'Checking analysis quality and saving data...',
          icon: <Loader2 className="w-6 h-6 animate-spin text-green-600" />,
          estimatedTime: '10-20 seconds'
        };
      case 'complete':
        return {
          title: 'Analysis Complete!',
          description: 'Your menu and wine data has been processed successfully.',
          icon: <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">✓</div>,
          estimatedTime: 'Done'
        };
      default:
        return {
          title: 'Processing...',
          description: 'Please wait while we analyze your images.',
          icon: <Loader2 className="w-6 h-6 animate-spin text-purple-600" />,
          estimatedTime: getTotalEstimatedTime()
        };
    }
  };

  const getTotalEstimatedTime = () => {
    const totalImages = menuCount + wineCount;
    if (totalImages <= 2) return '1-2 minutes';
    if (totalImages <= 4) return '2-3 minutes';
    if (totalImages <= 6) return '3-4 minutes';
    return '4-5 minutes';
  };

  const stepInfo = getStepInfo(currentStep);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Icon */}
          <div className="flex items-center justify-center">
            {stepInfo.icon}
          </div>

          {/* Title and Description */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-slate-800">
              {stepInfo.title}
            </h3>
            <p className="text-sm text-slate-600">
              {stepInfo.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{progress}% complete</span>
              <span>ETA: {stepInfo.estimatedTime}</span>
            </div>
          </div>

          {/* Processing Details */}
          <div className="bg-slate-50 p-3 rounded-lg w-full">
            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Menu pages:</span>
                <span className="font-medium">{menuCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Wine pages:</span>
                <span className="font-medium">{wineCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total images:</span>
                <span className="font-medium">{menuCount + wineCount}</span>
              </div>
            </div>
          </div>

          {/* Network Status Indicator */}
          {(currentStep === 'connecting' || currentStep === 'retrying') && (
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1 h-3 bg-purple-600 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <span>
                {currentStep === 'retrying' 
                  ? 'Retrying connection...' 
                  : 'Establishing connection...'
                }
              </span>
            </div>
          )}

          {/* Helpful tip based on step */}
          {currentStep === 'analyzing' && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg w-full">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Processing in progress</p>
                  <p>Our AI is carefully reading each menu item and wine. This ensures the most accurate pairings for you.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessingProgress;
