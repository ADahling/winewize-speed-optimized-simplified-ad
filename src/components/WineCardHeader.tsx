
import React from 'react';
import WineConfidenceBadge from './WineConfidenceBadge';

interface WineCardHeaderProps {
  wineName: string;
  wineType: string;
  wineStyle: string;
  confidenceLevel: string;
  pairingType?: string;
  preferenceMatch?: boolean;
}

const WineCardHeader = ({ wineName, wineType, confidenceLevel, pairingType, preferenceMatch }: WineCardHeaderProps) => {
  
  // PHASE 1.5: Get pairing type styling
  const getPairingTypeStyle = (type?: string) => {
    switch (type) {
      case 'Traditional':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'Regional':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Creative':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'Safe Alternative':
        return 'bg-gray-50 text-gray-700 border border-gray-200';
      default:
        return '';
    }
  };
  return (
    <div className="mb-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-bold text-slate-800 text-base leading-tight flex-1">
          {wineName}
        </h4>
        <WineConfidenceBadge confidenceLevel={confidenceLevel} />
      </div>
      
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-sm text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">
          {wineType}
        </span>
        
        {/* PHASE 1.5: Show pairing type indicator */}
        {pairingType && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPairingTypeStyle(pairingType)}`}>
            {pairingType}
          </span>
        )}
        
        {/* PHASE 1.5: Show preference match indicator */}
        {preferenceMatch === false && pairingType === 'Creative' && (
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-200">
            Outside your usual style
          </span>
        )}
      </div>
    </div>
  );
};

export default WineCardHeader;
