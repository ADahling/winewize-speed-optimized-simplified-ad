
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface WineStyleSelectorProps {
  wwWhiteStyle: string;
  wwRedStyle: string;
  onWwWhiteStyleChange: (value: string) => void;
  onWwRedStyleChange: (value: string) => void;
}

const WineStyleSelector: React.FC<WineStyleSelectorProps> = ({
  wwWhiteStyle,
  wwRedStyle,
  onWwWhiteStyleChange,
  onWwRedStyleChange,
}) => {
  const whiteWineStyles = [
    {
      value: 'FRESH & CRISP',
      description: 'Light, crisp and refreshing white wines with citrus and tree fruit as predominant flavors. Tart acidity. Likely from cool climates, fermented in stainless steel and low alcohol.'
    },
    {
      value: 'FUNKY & FLORAL',
      description: 'Highly aromatic wines with ripe fruits, baking spices, florals and potpourri aromas and flavors. Full mouth coating feel from medium to high alcohol and ripe or baked fruit flavors.'
    },
    {
      value: 'RICH & CREAMY',
      description: 'With oak, lees or malo influences, these wines deliver buttery, baking spice or toasty aromas and flavors which counter-balance rich, ripe, juicy stone fruit and tropical fruit flavors.'
    }
  ];

  const redWineStyles = [
    {
      value: 'FRESH & FRUITY',
      description: 'Light, fresh, juicy and abundantly fruity red wines with red fruit as predominant flavors. Balanced acidity. Likely from cool climates, fermented in stainless steel and low alcohol.'
    },
    {
      value: 'DRY & DIRTY',
      description: 'Dried, baked red to black fruits take 2nd stage to earth, wood, compost, mushroom, dried leaf flavors. Moderate tannins & dryness enhance the non-fruit flavors and aromas.'
    },
    {
      value: 'PACKED WITH A PUNCH',
      description: 'Full flavored, red and black fruity wines with significant tannins, spices, and oak influences. Often high alcohol, dense, and grippy, these wines pack bold flavors and linger long after each sip.'
    }
  ];

  return (
    <div className="space-y-10">
      {/* White Wine Style Preference */}
      <div>
        <Label className="text-slate-800 text-lg font-semibold mb-6 block">
          Which white wine style best describes what you enjoy? (Optional)
        </Label>
        
        <RadioGroup value={wwWhiteStyle} onValueChange={onWwWhiteStyleChange}>
          {whiteWineStyles.map((style) => (
            <div key={style.value} className="space-y-3 p-4 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={style.value} id={`white-${style.value}`} className="border-slate-300 text-purple-600" />
                <Label htmlFor={`white-${style.value}`} className="text-slate-800 font-semibold">
                  {style.value}
                </Label>
              </div>
              <p className="text-slate-600 text-sm ml-7">{style.description}</p>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Red Wine Style Preference */}
      <div>
        <Label className="text-slate-800 text-lg font-semibold mb-6 block">
          Which red wine style best describes what you enjoy? (Optional)
        </Label>
        
        <RadioGroup value={wwRedStyle} onValueChange={onWwRedStyleChange}>
          {redWineStyles.map((style) => (
            <div key={style.value} className="space-y-3 p-4 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={style.value} id={`red-${style.value}`} className="border-slate-300 text-purple-600" />
                <Label htmlFor={`red-${style.value}`} className="text-slate-800 font-semibold">
                  {style.value}
                </Label>
              </div>
              <p className="text-slate-600 text-sm ml-7">{style.description}</p>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};

export default WineStyleSelector;
