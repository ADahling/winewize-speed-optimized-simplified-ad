
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
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantCuisine?: string;
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
