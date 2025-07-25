
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface WineCharacteristicsSectionProps {
  sweetness: string;
  acidity: string;
  alcohol: string;
  tannin: string;
  onSweetnessChange: (value: string) => void;
  onAcidityChange: (value: string) => void;
  onAlcoholChange: (value: string) => void;
  onTanninChange: (value: string) => void;
}

const WineCharacteristicsSection: React.FC<WineCharacteristicsSectionProps> = ({
  sweetness,
  acidity,
  alcohol,
  tannin,
  onSweetnessChange,
  onAcidityChange,
  onAlcoholChange,
  onTanninChange,
}) => {
  return (
    <div>
      <Label className="text-slate-800 text-lg font-semibold mb-6 block">
        How do you prefer your wine?
      </Label>
      
      <div className="space-y-8">
        <div>
          <Label className="text-slate-700 font-medium mb-4 block">Sweetness</Label>
          <RadioGroup value={sweetness} onValueChange={onSweetnessChange}>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Dry" id="dry" className="border-slate-300 text-purple-600" />
              <Label htmlFor="dry" className="text-slate-700">Dry</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Off-Dry" id="off-dry" className="border-slate-300 text-purple-600" />
              <Label htmlFor="off-dry" className="text-slate-700">Off-Dry</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Sweet" id="sweet" className="border-slate-300 text-purple-600" />
              <Label htmlFor="sweet" className="text-slate-700">Sweet</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-slate-700 font-medium mb-4 block">Acidity</Label>
          <RadioGroup value={acidity} onValueChange={onAcidityChange}>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Low" id="low-acidity" className="border-slate-300 text-purple-600" />
              <Label htmlFor="low-acidity" className="text-slate-700">Low</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Medium" id="medium-acidity" className="border-slate-300 text-purple-600" />
              <Label htmlFor="medium-acidity" className="text-slate-700">Medium</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="High" id="high-acidity" className="border-slate-300 text-purple-600" />
              <Label htmlFor="high-acidity" className="text-slate-700">High</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-slate-700 font-medium mb-4 block">Tannin</Label>
          <RadioGroup value={tannin} onValueChange={onTanninChange}>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Smooth" id="smooth" className="border-slate-300 text-purple-600" />
              <Label htmlFor="smooth" className="text-slate-700">Smooth</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Medium" id="medium-tannin" className="border-slate-300 text-purple-600" />
              <Label htmlFor="medium-tannin" className="text-slate-700">Medium</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Grippy" id="grippy" className="border-slate-300 text-purple-600" />
              <Label htmlFor="grippy" className="text-slate-700">Grippy</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-slate-700 font-medium mb-4 block">Alcohol</Label>
          <RadioGroup value={alcohol} onValueChange={onAlcoholChange}>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Low" id="low-alcohol" className="border-slate-300 text-purple-600" />
              <Label htmlFor="low-alcohol" className="text-slate-700">Low</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Medium" id="medium-alcohol" className="border-slate-300 text-purple-600" />
              <Label htmlFor="medium-alcohol" className="text-slate-700">Medium</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="High" id="high-alcohol" className="border-slate-300 text-purple-600" />
              <Label htmlFor="high-alcohol" className="text-slate-700">High</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default WineCharacteristicsSection;
