
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wine, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { PageLoader } from '@/components/LoadingStates';
import { useWineLibrary } from '@/hooks/useWineLibrary';
import WineLibraryControls from '@/components/wine-library/WineLibraryControls';
import WineLibraryGrid from '@/components/wine-library/WineLibraryGrid';
import WineLibraryList from '@/components/wine-library/WineLibraryList';
import WineLibraryStats from '@/components/wine-library/WineLibraryStats';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Library = () => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedWine, setSelectedWine] = useState<any>(null);
  const [rating, setRating] = useState(0);
  
  const {
    wines,
    isLoading,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    searchTerm,
    setSearchTerm,
    favorites,
    updateWineRating,
    removeWine,
    getWineType,
    getWineStats
  } = useWineLibrary();

  const handleRateWine = (wine: any) => {
    setSelectedWine(wine);
    setRating(wine.rating || 0);
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!selectedWine) return;
    await updateWineRating(selectedWine.id, rating);
    setShowRatingModal(false);
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

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/pairings">
            <ArrowLeft className="w-6 h-6 text-slate-600 hover:text-slate-800" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">My Wine Library</h1>
        </div>

        {/* Stats */}
        <WineLibraryStats stats={getWineStats()} />

        {/* Controls */}
        <WineLibraryControls
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          totalWines={getWineStats().totalWines}
          filteredCount={wines.length}
        />

        {/* Wine Library */}
        {wines.length > 0 ? (
          viewMode === 'grid' ? (
            <WineLibraryGrid
              wines={wines}
              onRate={handleRateWine}
              onRemove={removeWine}
              getWineType={getWineType}
              favorites={favorites}
            />
          ) : (
            <WineLibraryList
              wines={wines}
              onRate={handleRateWine}
              onRemove={removeWine}
              getWineType={getWineType}
              favorites={favorites}
            />
          )
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 text-center">
            <Wine className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Your Library is Empty</h2>
            <p className="text-slate-600 mb-6">
              Start discovering wines by exploring restaurant pairings!
            </p>
            <Link to="/welcome">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Discover Wines
              </Button>
            </Link>
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
    </div>
  );
};

export default Library;
