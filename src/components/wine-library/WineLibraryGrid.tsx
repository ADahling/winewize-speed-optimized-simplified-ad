import React from 'react';
import WineCard from './WineCard';
import { WineLibraryItem } from '@/services/wineLibraryService';

interface WineLibraryGridProps {
  wines: WineLibraryItem[];
  onRate: (wine: WineLibraryItem) => void;
  onRemove: (wineId: string) => void;
  getWineType: (wineStyle: string) => string;
  favorites: Set<string>;
}

const WineLibraryGrid = ({ wines, onRate, onRemove, getWineType, favorites }: WineLibraryGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {wines.map((wine) => (
        <WineCard
          key={wine.id}
          wine={wine}
          onRate={onRate}
          onRemove={onRemove}
          getWineType={getWineType}
          isFavorite={favorites.has(wine.id)}
        />
      ))}
    </div>
  );
};

export default WineLibraryGrid;