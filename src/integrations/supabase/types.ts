export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      favorite_wines: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          pairing_note: string
          price: string
          user_id: string
          varietal: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          pairing_note: string
          price: string
          user_id: string
          varietal: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          pairing_note?: string
          price?: string
          user_id?: string
          varietal?: string
        }
        Relationships: []
      }
      master_wine_library: {
        Row: {
          confidence_level: string
          created_at: string
          id: string
          price: string
          times_selected: number | null
          updated_at: string
          wine_description: string
          wine_name: string
          wine_style: string
        }
        Insert: {
          confidence_level: string
          created_at?: string
          id?: string
          price: string
          times_selected?: number | null
          updated_at?: string
          wine_description: string
          wine_name: string
          wine_style: string
        }
        Update: {
          confidence_level?: string
          created_at?: string
          id?: string
          price?: string
          times_selected?: number | null
          updated_at?: string
          wine_description?: string
          wine_name?: string
          wine_style?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          location: string
          monthly_searches_used: number | null
          role: string | null
          stripe_customer_id: string | null
          subscription_level: string
          subscription_status: string | null
          subscription_type: string
          trial_end_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          location: string
          monthly_searches_used?: number | null
          role?: string | null
          stripe_customer_id?: string | null
          subscription_level?: string
          subscription_status?: string | null
          subscription_type?: string
          trial_end_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          location?: string
          monthly_searches_used?: number | null
          role?: string | null
          stripe_customer_id?: string | null
          subscription_level?: string
          subscription_status?: string | null
          subscription_type?: string
          trial_end_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      quick_vino_tips: {
        Row: {
          category: string | null
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean
          tip_text: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          tip_text: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          tip_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurant_menus: {
        Row: {
          created_at: string
          description: string | null
          dish_name: string
          dish_type: string | null
          id: string
          ingredients: string[] | null
          is_active: boolean | null
          price: string | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          dish_name: string
          dish_type?: string | null
          id?: string
          ingredients?: string[] | null
          is_active?: boolean | null
          price?: string | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          dish_name?: string
          dish_type?: string | null
          id?: string
          ingredients?: string[] | null
          is_active?: boolean | null
          price?: string | null
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_menus_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_ownership_log: {
        Row: {
          change_type: string
          changed_by: string | null
          created_at: string | null
          id: string
          new_owner_id: string | null
          notes: string | null
          old_owner_id: string | null
          restaurant_id: string
        }
        Insert: {
          change_type: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_owner_id?: string | null
          notes?: string | null
          old_owner_id?: string | null
          restaurant_id: string
        }
        Update: {
          change_type?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_owner_id?: string | null
          notes?: string | null
          old_owner_id?: string | null
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_ownership_log_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_specials: {
        Row: {
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          price: string | null
          restaurant_id: string
          special_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          price?: string | null
          restaurant_id: string
          special_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          price?: string | null
          restaurant_id?: string
          special_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_restaurant_specials_restaurant_id"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_staff: {
        Row: {
          email: string
          first_name: string
          inserted_at: string
          last_name: string
          restaurant_code: string
          restaurant_id: string
          role: string
          staff_id: string
          status: string
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          email: string
          first_name: string
          inserted_at?: string
          last_name: string
          restaurant_code: string
          restaurant_id: string
          role: string
          staff_id?: string
          status?: string
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          email?: string
          first_name?: string
          inserted_at?: string
          last_name?: string
          restaurant_code?: string
          restaurant_id?: string
          role?: string
          staff_id?: string
          status?: string
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_staff_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_wines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price_bottle: string | null
          price_glass: string | null
          region: string | null
          restaurant_id: string
          updated_at: string
          varietal: string | null
          vintage: string | null
          wine_type: string | null
          ww_style: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price_bottle?: string | null
          price_glass?: string | null
          region?: string | null
          restaurant_id: string
          updated_at?: string
          varietal?: string | null
          vintage?: string | null
          wine_type?: string | null
          ww_style?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_bottle?: string | null
          price_glass?: string | null
          region?: string | null
          restaurant_id?: string
          updated_at?: string
          varietal?: string | null
          vintage?: string | null
          wine_type?: string | null
          ww_style?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_wines_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string
          cuisine_type: string | null
          id: string
          last_activity_check: string | null
          last_menu_update: string | null
          location: string | null
          manual_entry: boolean | null
          name: string
          ownership_status: string | null
          ownership_transferred_at: string | null
          postal_code: string | null
          restaurant_code: string
          state: string | null
          subscription_tier: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by: string
          cuisine_type?: string | null
          id?: string
          last_activity_check?: string | null
          last_menu_update?: string | null
          location?: string | null
          manual_entry?: boolean | null
          name: string
          ownership_status?: string | null
          ownership_transferred_at?: string | null
          postal_code?: string | null
          restaurant_code?: string
          state?: string | null
          subscription_tier?: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string
          cuisine_type?: string | null
          id?: string
          last_activity_check?: string | null
          last_menu_update?: string | null
          location?: string | null
          manual_entry?: boolean | null
          name?: string
          ownership_status?: string | null
          ownership_transferred_at?: string | null
          postal_code?: string | null
          restaurant_code?: string
          state?: string | null
          subscription_tier?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_wine_library: {
        Row: {
          confidence_level: string
          created_at: string
          dish_paired_with: string
          id: string
          price: string
          rating: number | null
          updated_at: string
          user_id: string
          wine_description: string
          wine_name: string
          wine_style: string
        }
        Insert: {
          confidence_level: string
          created_at?: string
          dish_paired_with: string
          id?: string
          price: string
          rating?: number | null
          updated_at?: string
          user_id: string
          wine_description: string
          wine_name: string
          wine_style: string
        }
        Update: {
          confidence_level?: string
          created_at?: string
          dish_paired_with?: string
          id?: string
          price?: string
          rating?: number | null
          updated_at?: string
          user_id?: string
          wine_description?: string
          wine_name?: string
          wine_style?: string
        }
        Relationships: []
      }
      wine_interactions: {
        Row: {
          created_at: string
          dish_name: string | null
          id: string
          interaction_type: string
          rating: number | null
          user_id: string
          wine_name: string
          wine_style: string | null
        }
        Insert: {
          created_at?: string
          dish_name?: string | null
          id?: string
          interaction_type: string
          rating?: number | null
          user_id: string
          wine_name: string
          wine_style?: string | null
        }
        Update: {
          created_at?: string
          dish_name?: string | null
          id?: string
          interaction_type?: string
          rating?: number | null
          user_id?: string
          wine_name?: string
          wine_style?: string | null
        }
        Relationships: []
      }
      wine_preferences: {
        Row: {
          acidity: string | null
          alcohol: string | null
          budget: number
          created_at: string
          id: string
          preferred_style: string | null
          red_wine_rank: number | null
          rose_wine_rank: number | null
          sparkling_wine_rank: number | null
          sweetness: string | null
          tannin: string | null
          updated_at: string
          user_id: string
          white_wine_rank: number | null
          ww_red_style: string | null
          ww_white_style: string | null
        }
        Insert: {
          acidity?: string | null
          alcohol?: string | null
          budget?: number
          created_at?: string
          id?: string
          preferred_style?: string | null
          red_wine_rank?: number | null
          rose_wine_rank?: number | null
          sparkling_wine_rank?: number | null
          sweetness?: string | null
          tannin?: string | null
          updated_at?: string
          user_id: string
          white_wine_rank?: number | null
          ww_red_style?: string | null
          ww_white_style?: string | null
        }
        Update: {
          acidity?: string | null
          alcohol?: string | null
          budget?: number
          created_at?: string
          id?: string
          preferred_style?: string | null
          red_wine_rank?: number | null
          rose_wine_rank?: number | null
          sparkling_wine_rank?: number | null
          sweetness?: string | null
          tannin?: string | null
          updated_at?: string
          user_id?: string
          white_wine_rank?: number | null
          ww_red_style?: string | null
          ww_white_style?: string | null
        }
        Relationships: []
      }
      wine_rating_reminders: {
        Row: {
          created_at: string
          id: string
          scheduled_for: string
          sent: boolean | null
          user_id: string
          wine_library_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          scheduled_for: string
          sent?: boolean | null
          user_id: string
          wine_library_id: string
        }
        Update: {
          created_at?: string
          id?: string
          scheduled_for?: string
          sent?: boolean | null
          user_id?: string
          wine_library_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wine_rating_reminders_wine_library_id_fkey"
            columns: ["wine_library_id"]
            isOneToOne: false
            referencedRelation: "user_wine_library"
            referencedColumns: ["id"]
          },
        ]
      }
      wine_varietal_definitions: {
        Row: {
          common_names: string[]
          created_at: string
          id: string
          varietal_name: string
          wine_color: string
        }
        Insert: {
          common_names?: string[]
          created_at?: string
          id?: string
          varietal_name: string
          wine_color: string
        }
        Update: {
          common_names?: string[]
          created_at?: string
          id?: string
          varietal_name?: string
          wine_color?: string
        }
        Relationships: []
      }
      wines: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          price_bottle: string | null
          price_glass: string | null
          region: string | null
          restaurant_id: string | null
          updated_at: string
          varietal: string | null
          vintage: string | null
          wine_style: string | null
          wine_type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          price_bottle?: string | null
          price_glass?: string | null
          region?: string | null
          restaurant_id?: string | null
          updated_at?: string
          varietal?: string | null
          vintage?: string | null
          wine_style?: string | null
          wine_type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          price_bottle?: string | null
          price_glass?: string | null
          region?: string | null
          restaurant_id?: string | null
          updated_at?: string
          varietal?: string | null
          vintage?: string | null
          wine_style?: string | null
          wine_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wines_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      ww_wine_style_definitions: {
        Row: {
          created_at: string
          description: string
          id: string
          keywords: string[]
          style_name: string
          updated_at: string
          wine_color: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          keywords?: string[]
          style_name: string
          updated_at?: string
          wine_color: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          keywords?: string[]
          style_name?: string
          updated_at?: string
          wine_color?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_expire_specials: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_restaurant_duplicate: {
        Args: { check_name: string; check_location: string }
        Returns: boolean
      }
      claim_orphaned_restaurant: {
        Args: { restaurant_id: string; new_owner_id: string }
        Returns: boolean
      }
      cleanup_old_restaurant_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_or_find_restaurant_by_user: {
        Args: {
          restaurant_name: string
          restaurant_location?: string
          restaurant_cuisine?: string
          user_id_param?: string
        }
        Returns: string
      }
      delete_old_inactive_staff: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_active_specials: {
        Args: { p_restaurant_id: string }
        Returns: {
          id: string
          restaurant_id: string
          special_name: string
          description: string
          price: string
          is_active: boolean
          created_at: string
          expires_at: string
        }[]
      }
      get_my_claim: {
        Args: { claim: string }
        Returns: Json
      }
      hard_delete_old_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_restaurant_admin: {
        Args: { restaurant_id: string }
        Returns: boolean
      }
      identify_at_risk_restaurants: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      increment_wine_selection: {
        Args: { wine_name_param: string; wine_style_param: string }
        Returns: undefined
      }
      is_admin: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      is_original_creator: {
        Args: { user_id: string; restaurant_id: string }
        Returns: boolean
      }
      is_restaurant_admin: {
        Args: { user_id: string; restaurant_id: string }
        Returns: boolean
      }
      is_site_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      mark_orphaned_restaurants: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      restaurant_has_admin: {
        Args: { restaurant_id: string }
        Returns: boolean
      }
      safe_create_policy: {
        Args: {
          policy_name: string
          table_name: string
          schema_name?: string
          action?: string
          roles?: string
          using_expr?: string
          check_expr?: string
        }
        Returns: undefined
      }
      search_restaurants_case_insensitive: {
        Args: { search_name: string; search_location?: string }
        Returns: {
          id: string
          name: string
          location: string
          cuisine_type: string
          last_menu_update: string
          created_at: string
          updated_at: string
        }[]
      }
      update_restaurant_menu_timestamp: {
        Args: { restaurant_uuid: string }
        Returns: undefined
      }
      user_has_active_subscription: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
