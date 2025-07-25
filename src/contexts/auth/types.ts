
import { User, Session } from '@supabase/supabase-js';

export interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authReady: boolean;
  subscriptionInfo: SubscriptionInfo;
  preferences?: any; // Add the missing preferences property
  signUp: (email: string, password: string, firstName: string, lastName: string, location: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  saveWinePreferences: (userId: string, preferences: any) => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  createCheckout: (priceId: string, planType: string) => Promise<{ url?: string; error?: string }>;
  openCustomerPortal: () => Promise<{ url?: string; error?: string }>;
}
