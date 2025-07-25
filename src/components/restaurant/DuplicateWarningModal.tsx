
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DuplicateWarningModalProps {
  isVisible: boolean;
  existingRestaurant: any;
  onUseDuplicate: () => void;
  onEditDetails: () => void;
}

const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  isVisible,
  existingRestaurant,
  onUseDuplicate,
  onEditDetails
}) => {
  if (!isVisible || !existingRestaurant) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-amber-800 mb-1">Restaurant Already Exists</h4>
          <p className="text-amber-700 text-sm mb-3">
            A restaurant with this name and location already exists:
          </p>
          <div className="bg-white rounded p-3 mb-3">
            <p className="font-medium text-slate-800">{existingRestaurant.name}</p>
            <p className="text-slate-600 text-sm">{existingRestaurant.location}</p>
            {existingRestaurant.cuisine_type && (
              <p className="text-slate-500 text-xs">{existingRestaurant.cuisine_type}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onUseDuplicate}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Use Existing Restaurant
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onEditDetails}
              className="border-amber-300"
            >
              Edit Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateWarningModal;
