
import React from 'react';
import { AlertTriangle, Calendar, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OldMenuNotificationProps {
  restaurantName: string;
  lastUpdated: string;
  onUseExisting: () => void;
  onUploadNew: () => void;
  onClose: () => void;
}

const OldMenuNotification = ({
  restaurantName,
  lastUpdated,
  onUseExisting,
  onUploadNew,
  onClose
}: OldMenuNotificationProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Menu Update Notice
            </h3>
            <p className="text-slate-600 leading-relaxed">
              We've noticed <strong>{restaurantName}</strong>'s menu and wine list haven't been updated recently.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              Last updated: <strong>{formatDate(lastUpdated)}</strong>
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-sm text-slate-600">
            Would you like to continue with the existing version or upload fresh images for the most accurate wine recommendations?
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onUploadNew}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Upload New Images
          </Button>
          
          <Button
            onClick={onUseExisting}
            variant="outline"
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 py-3"
          >
            <Check className="w-4 h-4 mr-2" />
            Use Existing Version
          </Button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default OldMenuNotification;
