export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      enquiries: {
        Row: {
          booking_type: string | null
          client_email: string
          client_id: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          id: string
          location: string | null
          message: string
          photographer_id: string
          photographer_reply: string | null
          replied_at: string | null
          shoot_date: string | null
          shoot_type: string | null
          status: string
        }
        Insert: {
          booking_type?: string | null
          client_email: string
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          id?: string
          location?: string | null
          message: string
          photographer_id: string
          photographer_reply?: string | null
          replied_at?: string | null
          shoot_date?: string | null
          shoot_type?: string | null
          status?: string
        }
        Update: {
          booking_type?: string | null
          client_email?: string
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          id?: string
          location?: string | null
          message?: string
          photographer_id?: string
          photographer_reply?: string | null
          replied_at?: string | null
          shoot_date?: string | null
          shoot_type?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photographer_profiles: {
        Row: {
          available_for_travel: boolean
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          id: string
          instagram_handle: string | null
          is_available: boolean
          is_published: boolean
          profile_views: number
          rating: number
          specializations: string[]
          total_reviews: number
          updated_at: string
          user_id: string
          website_url: string | null
          whatsapp_number: string | null
          years_experience: string | null
        }
        Insert: {
          available_for_travel?: boolean
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          instagram_handle?: string | null
          is_available?: boolean
          is_published?: boolean
          profile_views?: number
          rating?: number
          specializations?: string[]
          total_reviews?: number
          updated_at?: string
          user_id: string
          website_url?: string | null
          whatsapp_number?: string | null
          years_experience?: string | null
        }
        Update: {
          available_for_travel?: boolean
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          instagram_handle?: string | null
          is_available?: boolean
          is_published?: boolean
          profile_views?: number
          rating?: number
          specializations?: string[]
          total_reviews?: number
          updated_at?: string
          user_id?: string
          website_url?: string | null
          whatsapp_number?: string | null
          years_experience?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photographer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          id: string
          media_type: string
          photographer_id: string
          public_url: string
          storage_path: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          media_type?: string
          photographer_id: string
          public_url: string
          storage_path: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          media_type?: string
          photographer_id?: string
          public_url?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing: {
        Row: {
          created_at: string
          currency: string
          custom_project_available: boolean
          custom_project_note: string | null
          full_day_rate: number | null
          half_day_rate: number | null
          hourly_rate: number | null
          id: string
          photographer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          custom_project_available?: boolean
          custom_project_note?: string | null
          full_day_rate?: number | null
          half_day_rate?: number | null
          hourly_rate?: number | null
          id?: string
          photographer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          custom_project_available?: boolean
          custom_project_note?: string | null
          full_day_rate?: number | null
          half_day_rate?: number | null
          hourly_rate?: number | null
          id?: string
          photographer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: true
            referencedRelation: "photographer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_verified: boolean
          phone: string | null
          updated_at: string
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_verified?: boolean
          phone?: string | null
          updated_at?: string
          user_type: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean
          phone?: string | null
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          client_id: string
          comment: string | null
          created_at: string
          id: string
          photographer_id: string
          rating: number
          shoot_type: string | null
        }
        Insert: {
          client_id: string
          comment?: string | null
          created_at?: string
          id?: string
          photographer_id: string
          rating: number
          shoot_type?: string | null
        }
        Update: {
          client_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          photographer_id?: string
          rating?: number
          shoot_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_photographers: {
        Row: {
          client_id: string
          created_at: string
          id: string
          photographer_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          photographer_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          photographer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_photographers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_photographers_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
