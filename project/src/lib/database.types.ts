export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          created_at: string
          updated_at: string
          is_admin: boolean
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          is_admin?: boolean
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          is_admin?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      rooms: {
        Row: {
          id: string
          name: string
          code: string
          created_by: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_by: string
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_by?: string
          created_at?: string
          expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      room_participants: {
        Row: {
          id: string
          room_id: string
          profile_id: string
          is_host: boolean
          joined_at: string
        }
        Insert: {
          id?: string
          room_id: string
          profile_id: string
          is_host?: boolean
          joined_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          profile_id?: string
          is_host?: boolean
          joined_at?: string
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
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      suggestions: {
        Row: {
          id: string
          room_id: string
          text: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          text: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          text?: string
          created_by?: string
          created_at?: string
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
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      suggestion_options: {
        Row: {
          id: string
          suggestion_id: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          suggestion_id: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          suggestion_id?: string
          text?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_options_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          }
        ]
      }
      votes: {
        Row: {
          id: string
          option_id: string
          profile_id: string
          created_at: string
        }
        Insert: {
          id?: string
          option_id: string
          profile_id: string
          created_at?: string
        }
        Update: {
          id?: string
          option_id?: string
          profile_id?: string
          created_at?: string
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
          }
        ]
      }
      messages: {
        Row: {
          id: string
          room_id: string
          profile_id: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          profile_id: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          profile_id?: string
          text?: string
          created_at?: string
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
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      cuisines: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          id: string
          name: string
          cuisine_id: string
          description: string | null
          image_url: string | null
          prep_time: string | null
          servings: number | null
          difficulty: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          cuisine_id: string
          description?: string | null
          image_url?: string | null
          prep_time?: string | null
          servings?: number | null
          difficulty?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          cuisine_id?: string
          description?: string | null
          image_url?: string | null
          prep_time?: string | null
          servings?: number | null
          difficulty?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_cuisine_id_fkey"
            columns: ["cuisine_id"]
            isOneToOne: false
            referencedRelation: "cuisines"
            referencedColumns: ["id"]
          }
        ]
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
          }
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
          }
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
          }
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