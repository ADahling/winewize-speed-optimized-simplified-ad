
import { useState, useEffect } from 'react';
import { sortMenuItems } from '@/utils/dishesUtils';

interface MenuItem {
  id: string;
  dish_name: string;
  description: string;
  price: string;
  dish_type: string;
  ingredients: string[];
  restaurant_id?: string;
}

export const useDishesFiltering = (menuItems: MenuItem[]) => {
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter items based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(menuItems);
    } else {
      const filtered = menuItems.filter(item =>
        item.dish_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.dish_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // Apply sorting to filtered results as well
      setFilteredItems(sortMenuItems(filtered));
    }
  }, [searchTerm, menuItems]);

  return {
    filteredItems,
    searchTerm,
    setSearchTerm,
  };
};
