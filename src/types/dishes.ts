// Shared types for dishes functionality

export interface MenuItem {
  id: string;
  dish_name: string;
  description?: string;
  price?: string;
  dish_type?: string;
  ingredients?: string[];
  restaurant_id?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface SessionRestaurant {
  id: string;
  name: string;
  location?: string;
  cuisine_type?: string;
}

export interface SessionResults {
  menuItems: MenuItem[];
  wines: Wine[];
  restaurantName: string;
  restaurantId: string;
  timestamp: number;
  sessionOnly?: boolean;
}

export interface Wine {
  id: string;
  name: string;
  varietal?: string;
  region?: string;
  price_bottle?: string;
  price_glass?: string;
  wine_type?: string;
  ww_style?: string;
  description?: string;
}

export interface UsageStats {
  subscriptionTier: string;
  pairingsUsed: number;
  pairingsLimit: number;
}

export interface DishesHandlersProps {
  selectedDishes: string[];
  getSelectedDishObjects: () => MenuItem[];
  sessionRestaurant: SessionRestaurant | null;
  user: any;
}