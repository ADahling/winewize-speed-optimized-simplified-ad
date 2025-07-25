
// Standardized types matching Supabase table schemas exactly

export interface AnalysisRequest {
  images: string[];
  analysisType?: string;
  menuCount: number;
  wineCount: number;
  selectedWineTypes?: string[];
  budget?: number;
  restaurantName: string;
  restaurantId?: string;
  fastMode?: boolean;
  sessionOnly?: boolean;
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
  price_glass?: string;
  price_bottle?: string;
  wine_type?: string;
  ww_style?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface AnalysisResult {
  menuItems?: MenuItem[];
  wines?: Wine[];
  extractionSummary?: {
    totalItemsFound?: number;
    totalWinesFound?: number;
    sectionsProcessed?: string[];
    categoriesProcessed?: string[];
    completionConfidence?: string;
    errorMessage?: string;
  };
}

export interface ExtractedData {
  menuItems?: MenuItem[];
  wines?: Wine[];
  totalExtracted: number;
  imageCount: number;
}
