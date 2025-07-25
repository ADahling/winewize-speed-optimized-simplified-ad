
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
  preparation?: string;
  cuisine?: string;
  dietary_info?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface WineData {
  id?: string;
  restaurant_id?: string;
  name: string;
  wine_name?: string;
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
  formattedPrice?: string;
  confidence_level?: string;
  source?: string;
}

export interface DishData {
  id: string;
  dish_name: string;
  name?: string;
  description?: string;
  price?: string;
  ingredients?: string[];
  preparation?: string;
  cuisine?: string;
  dietary_info?: string;
  dish_type?: string;
  type?: string;
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

export interface StructuralCompatibility {
  acidity: string;
  tannin?: string;
  sweetness: string;
  body: string;
  flavor?: string;
}

export interface WineRecommendation {
  wineName: string;
  wineType: string;
  wineStyle: string;
  pairingApproach?: string;
  description: string;
  structuralCompatibility?: StructuralCompatibility;
  confidenceLevel: string;
  price: string;
}

export interface DishCompatibility {
  dish: string;
  compatibilityScore: string;
  interactionNotes: string;
}

export interface ConsolidatedWineRecommendation {
  wineName: string;
  wineType: string;
  wineStyle: string;
  pairingApproach: string;
  description: string;
  structuralCompatibility: StructuralCompatibility;
  confidenceLevel: string;
  price: string;
  dishCompatibility: DishCompatibility[];
}

export interface DishAnalysis {
  dish: string;
  dishDescription: string;
  dishPrice: string;
  keyElements?: string;
}

export interface DishRecommendation {
  dish: string;
  dishDescription: string;
  dishPrice: string;
  dishAnalysis?: string;
  pairings: WineRecommendation[];
}

export interface ConsolidatedPairingResponse {
  dishAnalysis: DishAnalysis[];
  commonThreads: string;
  challengingElements: string;
  tablePairings: ConsolidatedWineRecommendation[];
}

export interface PairingRequest {
  dishes: DishData[];
  availableWines: WineData[];
  userPreferences?: UserPreferences | null;
  budget?: number;
  restaurantName: string;
  sessionMode?: boolean;
  consolidatedMode?: boolean;
}

export interface AnalysisResult {
  menuItems?: MenuItem[];
  wines?: WineData[];
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
  wines?: WineData[];
  totalExtracted: number;
  imageCount: number;
}
