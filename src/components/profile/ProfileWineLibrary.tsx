
import React, { useState } from 'react';
import { Wine, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WineLibraryEntry {
  id: string;
  wine_name: string;
  dish_paired_with: string;
  rating: number | null;
  created_at: string;
}

interface ProfileWineLibraryProps {
  isLoading: boolean;
  wineLibrary: WineLibraryEntry[];
}

const ProfileWineLibrary: React.FC<ProfileWineLibraryProps> = ({ isLoading, wineLibrary: initialWineLibrary }) => {
  const [wineLibrary, setWineLibrary] = useState(initialWineLibrary);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedWine, setSelectedWine] = useState<WineLibraryEntry | null>(null);
  const [rating, setRating] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  // Update local state when prop changes
  React.useEffect(() => {
    setWineLibrary(initialWineLibrary);
  }, [initialWineLibrary]);

  const handleRateWine = async (wine: WineLibraryEntry) => {
    setSelectedWine(wine);
    setRating(wine.rating || 0);
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!selectedWine || !user) return;

    try {
      const { error } = await supabase
        .from('user_wine_library')
        .update({ rating })
        .eq('id', selectedWine.id);

      if (error) throw error;

      // Track rating interaction
      await supabase
        .from('wine_interactions')
        .insert({
          user_id: user.id,
          interaction_type: 'rate',
          wine_name: selectedWine.wine_name,
          wine_style: '',
          dish_name: selectedWine.dish_paired_with,
          rating
        });

      // Update local state
      setWineLibrary(wineLibrary.map(wine => 
        wine.id === selectedWine.id ? { ...wine, rating } : wine
      ));

      toast({
        title: "Rating saved!",
        description: `You rated ${selectedWine.wine_name} ${rating} star${rating !== 1 ? 's' : ''}`,
      });

      setShowRatingModal(false);
    } catch (error) {
      console.error('Error saving rating:', error);
      toast({
        title: "Error",
        description: "Failed to save rating",
        variant: "destructive",
      });
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 1: return "Not my favorite";
      case 2: return "Not great";
      case 3: return "I'd drink it again";
      case 4: return "Really good";
      case 5: return "I want more!";
      default: return "Rate this wine";
    }
  };

  const renderStars = (rating: number | null, interactive: boolean = false, wine?: WineLibraryEntry) => {
    if (!interactive && !rating) return <span className="text-sm text-slate-500">Not rated</span>;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-4 h-4 ${star <= (rating || 0) ? 'text-amber-400 fill-current' : 'text-slate-300'}`} 
          />
        ))}
        {interactive && wine && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRateWine(wine)}
            className="text-xs text-purple-600 hover:text-purple-700 ml-2"
          >
            {rating ? 'Update' : 'Rate'}
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Wine className="w-5 h-5" />
          Your Wine Library
        </h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : wineLibrary.length > 0 ? (
          <div className="space-y-3">
            {wineLibrary.map((wine) => (
              <div key={wine.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-slate-800">{wine.wine_name}</div>
                  <div className="text-sm text-slate-600">
                    Paired with: {wine.dish_paired_with || 'No dish specified'}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(wine.rating, true, wine)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Wine className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>No wines in your library yet</p>
            <p className="text-sm">Start exploring restaurants to build your collection!</p>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Rate Your Wine</DialogTitle>
          </DialogHeader>
          <div className="text-center">
            {selectedWine && (
              <>
                <h3 className="font-semibold text-lg mb-4">{selectedWine.wine_name}</h3>
                <p className="text-slate-600 mb-6">How would you rate this wine?</p>
                
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`w-8 h-8 ${
                        rating >= star ? 'text-amber-400' : 'text-slate-300'
                      } hover:text-amber-400 transition-colors`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
                
                <p className="text-sm text-slate-600 mb-6">{getRatingLabel(rating)}</p>
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowRatingModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    onClick={submitRating}
                    disabled={rating === 0}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    Save Rating
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileWineLibrary;
