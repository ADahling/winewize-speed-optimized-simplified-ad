
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useDishesSelection = () => {
  const { toast } = useToast();
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);

  const handleDishSelect = (dishId: string) => {
    if (selectedDishes.includes(dishId)) {
      setSelectedDishes(prev => prev.filter(id => id !== dishId));
    } else {
      if (selectedDishes.length >= 4) {
        toast({
          title: "Selection limit reached",
          description: "Please select up to 4 dishes only.",
          variant: "destructive",
        });
        return;
      }
      setSelectedDishes(prev => [...prev, dishId]);
    }
  };

  const clearAllSelections = () => {
    setSelectedDishes([]);
  };

  return {
    selectedDishes,
    handleDishSelect,
    clearAllSelections,
  };
};
