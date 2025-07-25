
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const useRestaurantContext = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getRestaurantContext = () => {
    // FIXED: Use standardized localStorage key and add fallback logic
    const restaurantName = localStorage.getItem('currentRestaurantName') || 
                          localStorage.getItem('restaurantName') || 
                          'Unknown Restaurant';
    
    // If no restaurant context found, redirect back to restaurant selection
    if (restaurantName === 'Unknown Restaurant') {
      console.error('No restaurant context found during upload');
      
      toast({
        title: "Please select a restaurant first",
        description: "You need to select a restaurant before uploading images",
        variant: "destructive",
      });
      
      navigate('/restaurant');
      return null;
    }

    console.log(`Processing images for restaurant: ${restaurantName}`);
    return restaurantName;
  };

  return {
    getRestaurantContext
  };
};
