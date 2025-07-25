
export interface TestResult {
  table: string;
  operation: string;
  success: boolean;
  error?: string;
  authUid?: string;
  recordCount?: number;
  details?: any;
}

export type AllowedTables = 
  | 'profiles' 
  | 'subscribers' 
  | 'wine_interactions' 
  | 'user_wine_library' 
  | 'favorite_wines' 
  | 'wine_preferences'
  | 'restaurants'
  | 'restaurant_menus'
  | 'restaurant_wines';
