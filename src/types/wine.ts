export interface WineRecommendation {
  wineName: string;
  wineType: string;
  wineStyle?: string;
  description: string;
  price: string;
  confidence?: number;
  confidenceLevel?: string;
  dishCompatibility?: string;
}

export interface DishRecommendation {
  dish: string;
  dishDescription: string;
  dishPrice: string;
  pairings: WineRecommendation[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: string;
  category?: string;
}

export interface UsageDataPoint {
  date: string;
  count: number;
  tier: string;
}

export interface TrendDataPoint {
  month: string;
  free: number;
  premium: number;
  professional: number;
}
