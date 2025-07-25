
export interface Restaurant {
  id: string;
  name: string;
  location: string;
  cuisine_type: string;
  last_menu_update?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RestaurantData extends Restaurant {
  last_menu_update?: string;
  created_at: string;
  updated_at: string;
}
