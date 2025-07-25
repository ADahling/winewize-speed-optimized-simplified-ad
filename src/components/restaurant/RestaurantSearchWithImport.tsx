import React, { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge"
import RestaurantUploadFlow from '@/components/upload/RestaurantUploadFlow';

interface RestaurantSearchWithImportProps {
  onRestaurantSelect?: (restaurant: any) => void;
}

interface ExistingMenuData {
  hasMenus: boolean;
  hasWines: boolean;
}

const RestaurantSearchWithImport = ({ onRestaurantSelect }: RestaurantSearchWithImportProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckingData, setIsCheckingData] = useState(false);
  const [existingMenuData, setExistingMenuData] = useState<ExistingMenuData>({ hasMenus: false, hasWines: false });

  const searchRestaurants = useCallback(async (term: string) => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .ilike('name', `%${term}%`)
        .limit(5);

      if (error) {
        console.error('Search error:', error);
        toast.error('Failed to search restaurants. Please try again.');
        return;
      }

      setSearchResults(data || []);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 2) {
      searchRestaurants(term);
    } else {
      setSearchResults([]);
    }
  };

  const checkExistingMenuData = useCallback(async (restaurantId: string) => {
    if (!restaurantId) return { hasMenus: false, hasWines: false };

    try {
      console.log('Checking existing menu data for restaurant:', restaurantId);

      const [menuResult, wineResult] = await Promise.all([
        supabase
          .from('restaurant_menus')
          .select('id', { count: 'exact', head: true })
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true),
        supabase
          .from('restaurant_wines')
          .select('id', { count: 'exact', head: true })
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
      ]);

      const { count: menuCount, error: menuError } = menuResult;
      const { count: wineCount, error: wineError } = wineResult;

      if (menuError) {
        console.error('Error checking menu data:', menuError);
      }

      if (wineError) {
        console.error('Error checking wine data:', wineError);
      }

      const hasMenus = !menuError && menuCount && menuCount > 0;
      const hasWines = !wineError && wineCount && wineCount > 0;

      console.log('Menu data check results:', {
        restaurantId,
        hasMenus,
        hasWines,
        menuCount: menuCount || 0,
        wineCount: wineCount || 0,
        menuError: menuError?.message,
        wineError: wineError?.message
      });

      return { hasMenus, hasWines };
    } catch (error) {
      console.error('Failed to check existing menu data:', error);
      return { hasMenus: false, hasWines: false };
    }
  }, []);

  const handleRestaurantSelect = useCallback(async (restaurant: any) => {
    try {
      setIsCheckingData(true);
      setSelectedRestaurant(restaurant);
      
      console.log('Selected restaurant:', restaurant);
      
      localStorage.setItem('currentRestaurantId', restaurant.id);
      
      const { hasMenus, hasWines } = await checkExistingMenuData(restaurant.id);
      
      setExistingMenuData({ hasMenus, hasWines });
      
      onRestaurantSelect?.(restaurant);
      
      if (hasMenus && hasWines) {
        toast.success('Restaurant selected! Menu and wine data are available.');
      } else if (hasMenus || hasWines) {
        toast.success('Restaurant selected! Some menu data is available.');
      } else {
        toast.info('Restaurant selected! No existing menu data found - you can import new data.');
      }
      
    } catch (error) {
      console.error('Error selecting restaurant:', error);
      toast.error('Failed to select restaurant. Please try again.');
    } finally {
      setIsCheckingData(false);
    }
  }, [onRestaurantSelect, checkExistingMenuData]);

  const RestaurantSearchInput = ({ onRestaurantSelect, isLoading }: { onRestaurantSelect: (restaurant: any) => void, isLoading: boolean }) => {
    return (
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for a restaurant..."
          value={searchTerm}
          onChange={handleSearchInputChange}
          disabled={isLoading}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        {isSearching && (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-50 opacity-50 z-10 rounded-md">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              Loading...
            </div>
          </div>
        )}
        {searchResults.length > 0 && (
          <div className="absolute left-0 mt-2 w-full bg-white border rounded-md shadow-md z-20">
            {searchResults.map(restaurant => (
              <button
                key={restaurant.id}
                onClick={() => onRestaurantSelect(restaurant)}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                {restaurant.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const SelectedRestaurantDisplay = ({ restaurant, isCheckingData, existingMenuData }: { restaurant: any, isCheckingData: boolean, existingMenuData: ExistingMenuData }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Selected Restaurant</CardTitle>
          <CardDescription>
            {restaurant.name} - {restaurant.location}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCheckingData ? (
            <div>Checking for existing menu data...</div>
          ) : (
            <div>
              {existingMenuData.hasMenus && (
                <Badge variant="secondary" className="mr-2">Menu Data Available</Badge>
              )}
              {existingMenuData.hasWines && (
                <Badge variant="secondary">Wine Data Available</Badge>
              )}
              {!existingMenuData.hasMenus && !existingMenuData.hasWines && (
                <Badge variant="outline">No Menu Data Found</Badge>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => setSelectedRestaurant(null)}>Clear Selection</Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Restaurant Search */}
      <div className="space-y-4">
        <RestaurantSearchInput
          onRestaurantSelect={handleRestaurantSelect}
          isLoading={isCheckingData}
        />
        
        {selectedRestaurant && (
          <SelectedRestaurantDisplay
            restaurant={selectedRestaurant}
            isCheckingData={isCheckingData}
            existingMenuData={existingMenuData}
          />
        )}
      </div>

      {/* Import Section - Show regardless of existing data */}
      {selectedRestaurant && (
        <div className="border-t pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Import Menu Data</h3>
              {existingMenuData.hasMenus || existingMenuData.hasWines ? (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Update Existing Data
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-100 text-gray-600">
                  Import New Data
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600">
              {existingMenuData.hasMenus || existingMenuData.hasWines
                ? 'Upload new images to update or add to the existing menu data.'
                : 'Upload menu images to extract dishes and wines for this restaurant.'
              }
            </p>
            
            {/* Restaurant Upload Flow Component */}
            <RestaurantUploadFlow
              restaurantId={selectedRestaurant.id}
              restaurantName={selectedRestaurant.name}
              onUploadComplete={() => {
                // Refresh the menu data check after successful upload
                checkExistingMenuData(selectedRestaurant.id).then(setExistingMenuData);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantSearchWithImport;
