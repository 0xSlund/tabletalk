import { Database } from './database.types';

// Define the meal_type enum that's used in the database - updated to match actual DB values
export type MealType = 'all' | 'breakfast' | 'main_course' | 'dessert' | 'appetizers_snacks' | 'soups_salads';

// Response type for get_filtered_recipes function
export interface FilteredRecipe {
  recipe_id: string;
  recipe_name: string;
  recipe_description: string | null;
  recipe_image_url: string | null;
  recipe_prep_time: string | null;
  recipe_servings: number | null;
  recipe_difficulty: number | null;
  recipe_meal_type: MealType | null;
  recipe_price_range: number | null;
  recipe_distance: number | null;
  recipe_mood_tags: string[] | null;
  recipe_dietary_restrictions: string[] | null;
  cuisine_name: string;
  is_saved: boolean;
}

// Parameters for get_filtered_recipes function
export interface FilteredRecipesParams {
  p_meal_type?: MealType | null;
  p_user_id?: string | null;
  p_price_range?: number | null;
  p_max_distance?: number | null;
  p_mood?: string | null;
  p_limit?: number;
}

// Extend the Database type with our function definitions
export interface DatabaseFunctions {
  get_filtered_recipes: (params: FilteredRecipesParams) => FilteredRecipe[];
  save_recipe_to_favorites: (params: { p_user_id: string, p_recipe_id: string }) => null;
  remove_recipe_from_favorites: (params: { p_user_id: string, p_recipe_id: string }) => null;
}

// Create a complete type that includes both tables and functions
export type SupabaseDatabase = Database & {
  public: {
    Functions: DatabaseFunctions;
  };
}; 