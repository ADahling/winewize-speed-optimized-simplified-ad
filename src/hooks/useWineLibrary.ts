import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserWineLibrary, updateWineLibraryItem, WineLibraryItem } from '@/services/wineLibraryService';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export type ViewMode = 'grid' | 'list';
export type SortOption = 'newest' | 'oldest' | 'rating' | 'name' | 'price';
export type FilterOption = 'all' | 'red' | 'white' | 'rosé' | 'sparkling' | 'favorites';

export const useWineLibrary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wines, setWines] = useState<WineLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load wine library
  const loadWineLibrary = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await fetchUserWineLibrary(user.id);
      setWines(data);
      
      // Track favorites
      const favoriteIds = new Set(data.filter(wine => wine.rating && wine.rating >= 4).map(wine => wine.id));
      setFavorites(favoriteIds);
      
      logger.info('Loaded wine library', { count: data.length, userId: user.id });
    } catch (error) {
      logger.error('Error loading wine library', { error, userId: user?.id });
      toast({
        title: "Error",
        description: "Failed to load your wine library",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update wine rating
  const updateWineRating = async (wineId: string, rating: number) => {
    if (!user) return;

    try {
      await updateWineLibraryItem(wineId, { rating });
      
      // Update local state
      setWines(wines.map(wine => 
        wine.id === wineId ? { ...wine, rating } : wine
      ));

      // Update favorites if rating is 4+
      if (rating >= 4) {
        setFavorites(prev => new Set([...prev, wineId]));
      } else {
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(wineId);
          return newFavorites;
        });
      }

      toast({
        title: "Rating saved!",
        description: `Rating updated successfully`,
      });
    } catch (error) {
      logger.error('Error updating wine rating', { error, wineId, rating });
      toast({
        title: "Error",
        description: "Failed to save rating",
        variant: "destructive",
      });
    }
  };

  // Remove wine from library
  const removeWine = async (wineId: string) => {
    try {
      setWines(wines.filter(wine => wine.id !== wineId));
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        newFavorites.delete(wineId);
        return newFavorites;
      });
    } catch (error) {
      logger.error('Error removing wine', { error, wineId });
    }
  };

  // Get wine type from wine_style - maps Wine Wize styles to color categories
  const getWineType = (wineStyle: string): string => {
    const style = wineStyle.toLowerCase();
    
    // Wine Wize style mappings
    if (style.includes('fresh & fruity') || style.includes('dry & dirty') || style.includes('packed with a punch')) {
      return 'red';
    }
    if (style.includes('fresh & crisp') || style.includes('funky & floral') || style.includes('rich & creamy')) {
      return 'white';
    }
    
    // Fallback to wine name/varietal detection
    if (style.includes('red') || style.includes('cabernet') || style.includes('merlot') || style.includes('pinot noir')) return 'red';
    if (style.includes('white') || style.includes('chardonnay') || style.includes('sauvignon') || style.includes('riesling')) return 'white';
    if (style.includes('rosé') || style.includes('rose')) return 'rosé';
    if (style.includes('sparkling') || style.includes('champagne') || style.includes('prosecco')) return 'sparkling';
    
    return 'white'; // Default fallback for Wine Wize styles
  };

  // Filter and sort wines
  const filteredAndSortedWines = wines
    .filter(wine => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          wine.wine_name.toLowerCase().includes(searchLower) ||
          wine.wine_style.toLowerCase().includes(searchLower) ||
          wine.dish_paired_with.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filterBy === 'favorites') {
        return favorites.has(wine.id);
      }
      if (filterBy !== 'all') {
        return getWineType(wine.wine_style) === filterBy;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.wine_name.localeCompare(b.wine_name);
        case 'price':
          const priceA = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
          const priceB = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
          return priceB - priceA;
        default:
          return 0;
      }
    });

  // Get wine stats
  const getWineStats = () => {
    const totalWines = wines.length;
    const ratedWines = wines.filter(wine => wine.rating).length;
    const averageRating = ratedWines > 0 
      ? wines.reduce((sum, wine) => sum + (wine.rating || 0), 0) / ratedWines 
      : 0;
    
    const typeDistribution = wines.reduce((acc, wine) => {
      const type = getWineType(wine.wine_style);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalWines,
      ratedWines,
      averageRating: Math.round(averageRating * 10) / 10,
      favoriteCount: favorites.size,
      typeDistribution
    };
  };

  useEffect(() => {
    if (user) {
      loadWineLibrary();
    }
  }, [user]);

  return {
    wines: filteredAndSortedWines,
    allWines: wines,
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
    loadWineLibrary,
    getWineType,
    getWineStats
  };
};