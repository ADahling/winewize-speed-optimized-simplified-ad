import { User as SupabaseUser } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  subscriptionTier: 'free' | 'premium' | 'professional'
  expertiseLevel: 'beginner' | 'enthusiast' | 'sommelier' | 'collector'
  ageVerified: boolean
  ageVerifiedAt?: string
  createdAt: string
  updatedAt: string
  tasteProfile?: TasteProfile
  preferences?: UserPreferences
}

export interface TasteProfile {
  favoriteTypes: WineType[]
  preferredRegions: string[]
  flavorPreferences: string[]
  priceRange: PriceRange
}

export interface UserPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  language: string
  currency: string
}

export type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'dessert' | 'fortified'
export type PriceRange = '$' | '$$' | '$$$' | '$$$$' | '$$$$$'

export interface AuthUser extends SupabaseUser {
  profile?: UserProfile
}

export interface WineStats {
  totalScans: number
  uniqueWines: number
  averageRating: number
  favoriteType: WineType
  totalReviews: number
  cellarValue: number
  lastScanDate?: string
}

// Type guard to check if user has profile
export function hasProfile(user: AuthUser): user is AuthUser & { profile: UserProfile } {
  return user.profile !== undefined
}
