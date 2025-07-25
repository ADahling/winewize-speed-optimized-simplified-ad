import React, { useState } from 'react';
import { Wine, DollarSign, Sparkles, X, ArrowRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WinePreferencesStepFormProps {
  onSubmit: (preferences: WinePreferences) => void;
  onSkip: () => void;
  onClose: () => void;
}

interface WinePreferences {
  wineType: string;
  serviceType: string;
  budget: string;
  timestamp?: number;
}

const WinePreferencesStepForm = ({ onSubmit, onSkip, onClose }: WinePreferencesStepFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wineType, setWineType] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [budget, setBudget] = useState('');

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit({ 
        wineType, 
        serviceType, 
        budget,
        timestamp: Date.now()
      });
    }
  };

  const handleSkipStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onSkip();
    }
  };

  const handleSkipAll = () => {
    onSkip();
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1: return wineType !== '';
      case 2: return serviceType !== '';
      case 3: return budget !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wine className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              What style wine tonight?
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Choose your preferred wine style for tonight's dining
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Red wines', value: 'Red', desc: 'Bold, rich flavors' },
                { label: 'White wines', value: 'White', desc: 'Crisp, refreshing' },
                { label: 'Rosé', value: 'Rosé', desc: 'Light and fruity' },
                { label: 'Sparkling', value: 'Sparkling', desc: 'Bubbly celebration' },
                { label: 'Surprise me!', value: 'Any', desc: 'Let us choose' }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setWineType(type.value)}
                  className={`p-4 text-left rounded-lg border transition-all ${
                    wineType === type.value
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm opacity-80">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Service preference?
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              How would you like your wine served tonight?
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'By the glass', value: 'glass', desc: 'Perfect for trying different wines' },
                { label: 'Full bottle', value: 'bottle', desc: 'Great for sharing' },
                { label: 'Either works', value: 'either', desc: 'Flexible options' }
              ].map((service) => (
                <button
                  key={service.value}
                  onClick={() => setServiceType(service.value)}
                  className={`p-4 text-left rounded-lg border transition-all ${
                    serviceType === service.value
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="font-medium">{service.label}</div>
                  <div className="text-sm opacity-80">{service.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Budget per bottle/glass?
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              What's your preferred price range for tonight?
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: '$25-45 (value)', value: '$25-45', desc: 'Great quality, accessible pricing' },
                { label: '$45-75 (mid-range)', value: '$45-75', desc: 'Premium selections' },
                { label: '$75+ (premium)', value: '$75+', desc: 'Luxury wine experience' },
                { label: 'No limit', value: 'unlimited', desc: 'Price is no object' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setBudget(range.value)}
                  className={`p-4 text-left rounded-lg border transition-all ${
                    budget === range.value
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="font-medium">{range.label}</div>
                  <div className="text-sm opacity-80">{range.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with close button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Tonight's Wine Preferences
          </h2>
          <p className="text-sm text-slate-600">
            Step {currentStep} of 3 - Quick questions while we analyze your menu
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="flex space-x-2">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`h-2 flex-1 rounded-full transition-all ${
              step <= currentStep ? 'bg-purple-600' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[280px]">
        {renderStep()}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <Button
          variant="outline"
          onClick={handleSkipStep}
          className="flex-1 border-slate-300"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Skip this step
        </Button>
        
        <Button
          variant="outline"
          onClick={handleSkipAll}
          className="border-slate-300"
        >
          Skip all
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!canContinue()}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {currentStep === 3 ? 'Complete' : 'Next'}
          {currentStep < 3 && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
};

export default WinePreferencesStepForm;