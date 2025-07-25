
import React from 'react';
import { Wine } from 'lucide-react';
import WinePreferencesHeader from '@/components/wine-preferences/WinePreferencesHeader';
import WinePreferencesLoading from '@/components/wine-preferences/WinePreferencesLoading';
import WinePreferencesFormContent from '@/components/wine-preferences/WinePreferencesFormContent';
import { useWinePreferences } from '@/hooks/useWinePreferences';

interface WinePreferencesFormProps {
  userId: string;
  onComplete: () => void;
}

const WinePreferencesForm: React.FC<WinePreferencesFormProps> = ({ userId, onComplete }) => {
  const {
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
    isLoadingPreferences,
    hasExistingPreferences,
    setBudget,
    setWhiteWineRank,
    setRedWineRank,
    setRoseWineRank,
    setSparklingWineRank,
    setSweetness,
    setAcidity,
    setAlcohol,
    setTannin,
    setWwWhiteStyle,
    setWwRedStyle,
    handleSubmit,
  } = useWinePreferences({ userId, onComplete });

  // Show loading state while fetching existing preferences
  if (isLoadingPreferences) {
    return <WinePreferencesLoading />;
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="w-full max-w-4xl mx-auto">
        <WinePreferencesHeader hasExistingPreferences={hasExistingPreferences} />

        <WinePreferencesFormContent
          budget={budget}
          whiteWineRank={whiteWineRank}
          redWineRank={redWineRank}
          roseWineRank={roseWineRank}
          sparklingWineRank={sparklingWineRank}
          sweetness={sweetness}
          acidity={acidity}
          alcohol={alcohol}
          tannin={tannin}
          wwWhiteStyle={wwWhiteStyle}
          wwRedStyle={wwRedStyle}
          isLoading={isLoading}
          hasExistingPreferences={hasExistingPreferences}
          onBudgetChange={setBudget}
          onWhiteWineChange={setWhiteWineRank}
          onRedWineChange={setRedWineRank}
          onRoseWineChange={setRoseWineRank}
          onSparklingWineChange={setSparklingWineRank}
          onSweetnessChange={setSweetness}
          onAcidityChange={setAcidity}
          onAlcoholChange={setAlcohol}
          onTanninChange={setTannin}
          onWwWhiteStyleChange={setWwWhiteStyle}
          onWwRedStyleChange={setWwRedStyle}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default WinePreferencesForm;
