
// Standardized types matching Supabase table schemas exactly

export interface Restaurant {
  id?: string;
  name: string;
  location?: string;
  cuisine_type?: string;
}

export interface MenuItem {
  id?: string;
  restaurant_id?: string;
  dish_name: string;
  description?: string;
  price?: string;
  dish_type?: string;
  ingredients?: string[];
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface Wine {
  id?: string;
  restaurant_id?: string;
  name: string;
  vintage?: string;
  varietal?: string;
  region?: string;
  price_bottle?: string;
  price_glass?: string;
  wine_type?: string;
  ww_style?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface UserPreferences {
  budget?: number;
  ww_red_style?: string;
  ww_white_style?: string;
  preferred_red_style?: string;
  preferred_white_style?: string;
  sweetness?: string;
  acidity?: string;
  tannin?: string;
  alcohol?: string;
}

export interface WineRecommendation {
  wineName: string;
  wineType: string;
  wineStyle: string;
  description: string;
  confidenceLevel: string;
  price: string;
}

export interface DishRecommendation {
  dish: string;
  dishDescription: string;
  dishPrice: string;
  pairings: WineRecommendation[];
}

export interface PairingRequest {
  dishes: MenuItem[];
  availableWines: Wine[];
  userPreferences?: UserPreferences | null;
  budget?: number;
  restaurantName: string;
  restaurantId?: string;
}
