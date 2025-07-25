
import React from 'react';
import { Wine } from 'lucide-react';

const WinePreferencesLoading: React.FC = () => {
  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-8">
            <Wine className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Loading Your Preferences...</h1>
        </div>
      </div>
    </div>
  );
};

export default WinePreferencesLoading;
