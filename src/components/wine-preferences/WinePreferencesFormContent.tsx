
import React from 'react';
import { Button } from '@/components/ui/button';
import BudgetSelector from '@/components/wine-preferences/BudgetSelector';
import WineRatingSection from '@/components/wine-preferences/WineRatingSection';
import WineCharacteristicsSection from '@/components/wine-preferences/WineCharacteristicsSection';
import WineStyleSelector from '@/components/wine-preferences/WineStyleSelector';

interface WinePreferencesFormContentProps {
  budget: number;
  whiteWineRank: number;
  redWineRank: number;
  roseWineRank: number;
  sparklingWineRank: number;
  sweetness: string;
  acidity: string;
  alcohol: string;
  tannin: string;
  wwWhiteStyle: string;
  wwRedStyle: string;
  isLoading: boolean;
  hasExistingPreferences: boolean;
  onBudgetChange: (budget: number) => void;
  onWhiteWineChange: (rating: number) => void;
  onRedWineChange: (rating: number) => void;
  onRoseWineChange: (rating: number) => void;
  onSparklingWineChange: (rating: number) => void;
  onSweetnessChange: (value: string) => void;
  onAcidityChange: (value: string) => void;
  onAlcoholChange: (value: string) => void;
  onTanninChange: (value: string) => void;
  onWwWhiteStyleChange: (value: string) => void;
  onWwRedStyleChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const WinePreferencesFormContent: React.FC<WinePreferencesFormContentProps> = ({
  budget,
  whiteWineRank,
  redWineRank,
  roseWineRank,
  sparklingWineRank,
  sweetness,
  acidity,
  alcohol,
  tannin,
  wwWhiteStyle,
  wwRedStyle,
  isLoading,
  hasExistingPreferences,
  onBudgetChange,
  onWhiteWineChange,
  onRedWineChange,
  onRoseWineChange,
  onSparklingWineChange,
  onSweetnessChange,
  onAcidityChange,
  onAlcoholChange,
  onTanninChange,
  onWwWhiteStyleChange,
  onWwRedStyleChange,
  onSubmit,
}) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
      <form onSubmit={onSubmit} className="space-y-10">
        <BudgetSelector budget={budget} onChange={onBudgetChange} />
        
        <WineRatingSection
          whiteWineRank={whiteWineRank}
          redWineRank={redWineRank}
          roseWineRank={roseWineRank}
          sparklingWineRank={sparklingWineRank}
          onWhiteWineChange={onWhiteWineChange}
          onRedWineChange={onRedWineChange}
          onRoseWineChange={onRoseWineChange}
          onSparklingWineChange={onSparklingWineChange}
        />

        <WineCharacteristicsSection
          sweetness={sweetness}
          acidity={acidity}
          alcohol={alcohol}
          tannin={tannin}
          onSweetnessChange={onSweetnessChange}
          onAcidityChange={onAcidityChange}
          onAlcoholChange={onAlcoholChange}
          onTanninChange={onTanninChange}
        />

        <WineStyleSelector
          wwWhiteStyle={wwWhiteStyle}
          wwRedStyle={wwRedStyle}
          onWwWhiteStyleChange={onWwWhiteStyleChange}
          onWwRedStyleChange={onWwRedStyleChange}
        />

        <Button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-4 text-lg"
        >
          {isLoading ? (hasExistingPreferences ? 'Updating Preferences...' : 'Saving Preferences...') : (hasExistingPreferences ? 'Update Preferences' : 'Save Preferences')}
        </Button>
      </form>
    </div>
  );
};

export default WinePreferencesFormContent;
