
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onVerify: (isOfAge: boolean) => void;
}

const AgeVerificationModal = ({ isOpen, onVerify }: AgeVerificationModalProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border-0 p-8"
        hideCloseButton={true}
      >
        <div className="text-center space-y-6">
          {/* Logo/Brand */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Wine Wize
            </h1>
          </div>

          {/* Age Verification Content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-800">
              Age Verification Required
            </h2>
            <p className="text-slate-600 leading-relaxed">
              You must be 21 years of age or older to access this wine recommendation platform.
            </p>
            <p className="text-lg font-medium text-slate-800">
              Are you 21 years of age or older?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => onVerify(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Yes, I am 21 or older
            </Button>
            
            <Button
              onClick={() => onVerify(false)}
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 py-3 text-lg rounded-xl transition-all duration-200"
            >
              No, I am under 21
            </Button>
          </div>

          {/* Legal Notice */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              By clicking "Yes", you certify that you are 21 years of age or older and agree to our terms of service.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgeVerificationModal;
