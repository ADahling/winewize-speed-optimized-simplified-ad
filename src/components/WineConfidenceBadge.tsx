
import React from 'react';

interface WineConfidenceBadgeProps {
  confidenceLevel: string;
}

const WineConfidenceBadge = ({ confidenceLevel }: WineConfidenceBadgeProps) => {
  const getConfidenceColor = (level: string) => {
    const cleanLevel = level.replace('%', '').toLowerCase();
    if (cleanLevel.includes('high') || parseInt(cleanLevel) >= 85) return 'bg-green-100 text-green-800 border-green-200';
    if (cleanLevel.includes('medium') || parseInt(cleanLevel) >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getConfidenceColor(confidenceLevel)}`}>
      {confidenceLevel} Confidence
    </span>
  );
};

export default WineConfidenceBadge;
