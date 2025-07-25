import React from 'react';

interface PairingsSuccessMessageProps {
  recommendationsCount: number;
  isRecentlyGenerated: boolean;
  totalWines?: number;
}

export const PairingsSuccessMessage: React.FC<PairingsSuccessMessageProps> = ({
  recommendationsCount,
  isRecentlyGenerated,
  totalWines
}) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold text-green-800 mb-2 flex items-center gap-2">
        🎉 Perfect Pairings Found!
        {isRecentlyGenerated && (
          <span className="text-sm bg-green-200 text-green-800 px-2 py-1 rounded-full font-normal">
            Newly Generated
          </span>
        )}
      </h2>
      <p className="text-green-700">
        Our AI sommelier analyzed your selections and found excellent wine matches from the restaurant's list.
        <span className="block mt-2 font-medium">
          Pairing recommendations for {recommendationsCount} dish{recommendationsCount > 1 ? 'es' : ''}
          {totalWines && totalWines > 0 && ` with ${totalWines} wine pairings`}
        </span>
      </p>
      <p className="text-green-700 mt-2 text-sm">
        We recognize we may have recommended a wine outside your desired budget, if so, these are identified with a red "💲".
      </p>
    </div>
  );
};