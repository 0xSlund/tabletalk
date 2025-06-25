export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cuisines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          profile_id: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          profile_id: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          profile_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      food_suggestions: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          emoji: string | null
          id: string
          name: string
          room_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          name: string
          room_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          name?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_suggestions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_suggestions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_suggestions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      food_votes: {
        Row: {
          created_at: string | null
          id: string
          reaction: string
          room_id: string
          suggestion_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reaction: string
          room_id: string
          suggestion_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reaction?: string
          room_id?: string
          suggestion_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_votes_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_votes_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_votes_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "food_suggestions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          room_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          room_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          room_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about_me: string | null
          avatar_url: string | null
          created_at: string
          dietary_preferences: Json | null
          id: string
          social_links: Json | null
          updated_at: string
          username: string
        }
        Insert: {
          about_me?: string | null
          avatar_url?: string | null
          created_at?: string
          dietary_preferences?: Json | null
          id: string
          social_links?: Json | null
          updated_at?: string
          username: string
        }
        Update: {
          about_me?: string | null
          avatar_url?: string | null
          created_at?: string
          dietary_preferences?: Json | null
          id?: string
          social_links?: Json | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          text: string
        }
        Insert: {
          id?: string
          recipe_id: string
          text: string
        }
        Update: {
          id?: string
          recipe_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_instructions: {
        Row: {
          id: string
          recipe_id: string
          step_number: number
          text: string
        }
        Insert: {
          id?: string
          recipe_id: string
          step_number: number
          text: string
        }
        Update: {
          id?: string
          recipe_id?: string
          step_number?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_instructions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_tips: {
        Row: {
          id: string
          recipe_id: string
          text: string
        }
        Insert: {
          id?: string
          recipe_id: string
          text: string
        }
        Update: {
          id?: string
          recipe_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_tips_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string
          cuisine_id: string
          description: string | null
          difficulty: number | null
          id: string
          image_url: string | null
          meal_type: Database["public"]["Enums"]["meal_type"] | null
          name: string
          prep_time: string | null
          servings: number | null
        }
        Insert: {
          created_at?: string
          cuisine_id: string
          description?: string | null
          difficulty?: number | null
          id?: string
          image_url?: string | null
          meal_type?: Database["public"]["Enums"]["meal_type"] | null
          name: string
          prep_time?: string | null
          servings?: number | null
        }
        Update: {
          created_at?: string
          cuisine_id?: string
          description?: string | null
          difficulty?: number | null
          id?: string
          image_url?: string | null
          meal_type?: Database["public"]["Enums"]["meal_type"] | null
          name?: string
          prep_time?: string | null
          servings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_cuisine_id_fkey"
            columns: ["cuisine_id"]
            isOneToOne: false
            referencedRelation: "cuisines"
            referencedColumns: ["id"]
          },
        ]
      }
      room_history: {
        Row: {
          id: string
          joined_at: string
          profile_id: string
          room_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          profile_id: string
          room_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          profile_id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_history_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_history_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_name_suggestions: {
        Row: {
          category: string
          created_at: string | null
          food_mode: string | null
          id: number
          text: string
        }
        Insert: {
          category: string
          created_at?: string | null
          food_mode?: string | null
          id?: number
          text: string
        }
        Update: {
          category?: string
          created_at?: string | null
          food_mode?: string | null
          id?: number
          text?: string
        }
        Relationships: []
      }
      room_participants: {
        Row: {
          id: string
          is_host: boolean
          joined_at: string
          profile_id: string
          room_id: string
        }
        Insert: {
          id?: string
          is_host?: boolean
          joined_at?: string
          profile_id: string
          room_id: string
        }
        Update: {
          id?: string
          is_host?: boolean
          joined_at?: string
          profile_id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          code: string
          created_at: string
          created_by: string
          expires_at: string
          food_mode: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          expires_at: string
          food_mode?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          food_mode?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestion_options: {
        Row: {
          created_at: string
          id: string
          suggestion_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          suggestion_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          suggestion_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_options_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions: {
        Row: {
          created_at: string
          created_by: string
          id: string
          room_id: string
          text: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          room_id: string
          text: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          room_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "suggestion_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voting_results: {
        Row: {
          determined_at: string
          id: string
          room_id: string
          suggestion_id: string
          votes_count: number
          winning_option_id: string
        }
        Insert: {
          determined_at?: string
          id?: string
          room_id: string
          suggestion_id: string
          votes_count: number
          winning_option_id: string
        }
        Update: {
          determined_at?: string
          id?: string
          room_id?: string
          suggestion_id?: string
          votes_count?: number
          winning_option_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voting_results_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voting_results_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voting_results_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voting_results_winning_option_id_fkey"
            columns: ["winning_option_id"]
            isOneToOne: false
            referencedRelation: "suggestion_options"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      room_status: {
        Row: {
          code: string | null
          created_at: string | null
          expires_at: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          is_active?: never
          name?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          is_active?: never
          name?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_expiration_time: {
        Args: { duration_minutes: number }
        Returns: string
      }
      generate_unique_room_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_cuisine_id: {
        Args: { cuisine_name: string }
        Returns: string
      }
      get_filtered_recipes: {
        Args: {
          p_meal_type?: Database["public"]["Enums"]["meal_type"]
          p_user_id?: string
        }
        Returns: {
          recipe_id: string
          recipe_name: string
          recipe_description: string
          recipe_image_url: string
          recipe_prep_time: string
          recipe_servings: number
          recipe_difficulty: number
          recipe_meal_type: Database["public"]["Enums"]["meal_type"]
          cuisine_name: string
        }[]
      }
      get_room_winning_choice: {
        Args: { room_id: string }
        Returns: string
      }
      get_room_winning_options: {
        Args: { room_id: string }
        Returns: {
          suggestion_id: string
          winning_option_id: string
          option_text: string
          votes_count: number
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_room_expired: {
        Args: { room_id: string }
        Returns: boolean
      }
    }
    Enums: {
      meal_type:
        | "breakfast"
        | "lunch"
        | "dinner"
        | "dessert"
        | "appetizers_snacks"
        | "soups_salads"
        | "side_dish"
        | "main_course"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      meal_type: [
        "breakfast",
        "lunch",
        "dinner",
        "dessert",
        "appetizers_snacks",
        "soups_salads",
        "side_dish",
        "main_course",
      ],
    },
  },
} as const