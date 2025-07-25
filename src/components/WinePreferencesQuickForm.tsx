import React, { useState } from 'react';
import { Wine, DollarSign, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WinePreferencesQuickFormProps {
  onSubmit: (preferences: WinePreferences) => void;
  onSkip: () => void;
}

interface WinePreferences {
  wineType: string;
  serviceType: string;
  budget: string;
  timestamp?: number;
}

const WinePreferencesQuickForm = ({ onSubmit, onSkip }: WinePreferencesQuickFormProps) => {
  const [wineType, setWineType] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [budget, setBudget] = useState('');

  const handleSubmit = () => {
    onSubmit({ 
      wineType, 
      serviceType, 
      budget,
      timestamp: Date.now()
    });
  };

  const isComplete = wineType && serviceType && budget;

  return (
    <div className="space-y-3">
      {/* Wine Type Tonight - Mobile Optimized 2x2 + 1 Grid */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <Wine className="w-4 h-4 inline mr-1" />
          What style wine tonight?
        </label>
        <div className="space-y-2">
          {/* First row: Red & White */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Red', value: 'Red' },
              { label: 'White', value: 'White' }
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setWineType(type.value)}
                className={`p-3 text-sm font-medium rounded-lg border text-center transition-all touch-manipulation ${
                  wineType === type.value
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          
          {/* Second row: Rosé & Sparkling */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Rosé', value: 'Rosé' },
              { label: 'Sparkling', value: 'Sparkling' }
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setWineType(type.value)}
                className={`p-3 text-sm font-medium rounded-lg border text-center transition-all touch-manipulation ${
                  wineType === type.value
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          
          {/* Third row: Surprise me (centered) */}
          <div className="flex justify-center">
            <button
              onClick={() => setWineType('Any')}
              className={`px-6 py-3 text-sm font-medium rounded-lg border text-center transition-all touch-manipulation ${
                wineType === 'Any'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
              }`}
            >
              Surprise me!
            </button>
          </div>
        </div>
      </div>

      {/* Service Preference - Mobile Optimized */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Service preference?
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Glass', value: 'glass' },
            { label: 'Bottle', value: 'bottle' },
            { label: 'Either', value: 'either' }
          ].map((service) => (
            <button
              key={service.value}
              onClick={() => setServiceType(service.value)}
              className={`p-2.5 text-xs font-medium rounded-lg border text-center transition-all touch-manipulation ${
                serviceType === service.value
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
              }`}
            >
              {service.label}
            </button>
          ))}
        </div>
      </div>

      {/* Budget per bottle/glass - Mobile Optimized */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <DollarSign className="w-4 h-4 inline mr-1" />
          Budget per bottle/glass?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: '$25-45', sub: 'value', value: '$25-45' },
            { label: '$45-75', sub: 'mid-range', value: '$45-75' },
            { label: '$75+', sub: 'premium', value: '$75+' },
            { label: 'No limit', sub: '', value: 'unlimited' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setBudget(range.value)}
              className={`p-2.5 text-center rounded-lg border transition-all touch-manipulation ${
                budget === range.value
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
              }`}
            >
              <div className="text-sm font-medium">{range.label}</div>
              {range.sub && <div className="text-xs opacity-75">{range.sub}</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Actions - Mobile Optimized */}
      <div className="flex gap-2 pt-3">
        <Button
          variant="outline"
          onClick={onSkip}
          className="flex-1 border-slate-300 py-3 text-sm touch-manipulation"
        >
          Skip for now
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isComplete}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 text-sm touch-manipulation"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default WinePreferencesQuickForm;