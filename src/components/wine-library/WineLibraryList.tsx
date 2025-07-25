import React from 'react';
import { Wine, Heart, Star, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { WineLibraryItem } from '@/services/wineLibraryService';
import { formatDistanceToNow } from 'date-fns';

interface WineLibraryListProps {
  wines: WineLibraryItem[];
  onRate: (wine: WineLibraryItem) => void;
  onRemove: (wineId: string) => void;
  getWineType: (wineStyle: string) => string;
  favorites: Set<string>;
}

const wineTypeConfig = {
  red: { badge: 'bg-red-100 text-red-700', icon: '🍷' },
  white: { badge: 'bg-yellow-100 text-yellow-700', icon: '🥂' },
  rosé: { badge: 'bg-pink-100 text-pink-700', icon: '🌸' },
  sparkling: { badge: 'bg-blue-100 text-blue-700', icon: '🍾' },
  unknown: { badge: 'bg-slate-100 text-slate-700', icon: '🍷' }
};

const WineLibraryList = ({ wines, onRate, onRemove, getWineType, favorites }: WineLibraryListProps) => {
  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-xs text-muted-foreground">Not rated</span>;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={cn(
              "w-3 h-3",
              star <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'
            )} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {wines.map((wine) => {
        const wineType = getWineType(wine.wine_style);
        const config = wineTypeConfig[wineType as keyof typeof wineTypeConfig] || wineTypeConfig.unknown;
        
        return (
          <div
            key={wine.id}
            className="bg-background rounded-lg p-4 border border-border hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-2">
                  {/* Wine Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {wine.wine_name}
                      </h3>
                      {favorites.has(wine.id) && (
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn("text-xs", config.badge)}>
                        <span className="mr-1">{config.icon}</span>
                        {wineType.charAt(0).toUpperCase() + wineType.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{wine.wine_style}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Paired with:</span> {wine.dish_paired_with || 'No dish specified'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(wine.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>

                    {wine.wine_description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {wine.wine_description}
                      </p>
                    )}
                  </div>

                  {/* Price & Rating */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="font-semibold text-emerald-600">{wine.price}</span>
                    <div className="flex items-center gap-2">
                      {renderStars(wine.rating)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRate(wine)}
                className="text-xs"
              >
                <Star className="w-3 h-3 mr-1" />
                {wine.rating ? 'Update Rating' : 'Rate Wine'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(wine.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WineLibraryList;