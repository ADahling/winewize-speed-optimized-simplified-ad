
import React from 'react';
import { Wine } from 'lucide-react';

interface WinePreferencesHeaderProps {
  hasExistingPreferences: boolean;
}

const WinePreferencesHeader: React.FC<WinePreferencesHeaderProps> = ({ hasExistingPreferences }) => {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-8">
        <Wine className="w-10 h-10 text-white" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
        {hasExistingPreferences ? 'Update Your Wine Preferences' : 'Tell Us Your Wine Preferences'}
      </h1>
      <p className="text-xl text-slate-600 max-w-3xl mx-auto">
        {hasExistingPreferences ? 'Modify your wine preferences below' : 'Help us personalize your wine recommendations'}
      </p>
    </div>
  );
};

export default WinePreferencesHeader;
