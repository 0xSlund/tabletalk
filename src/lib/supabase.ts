import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { SupabaseDatabase, FilteredRecipe, MealType } from './database.functions';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with retries and timeout
export const supabase = createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'tabletalk'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export type Profile = {
  id: string;
  username: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
  is_admin?: boolean;
};

export type Room = {
  id: string;
  name: string;
  code: string;
  created_by: string;
  created_at: string;
  expires_at: string;
};

export type RoomParticipant = {
  id: string;
  room_id: string;
  profile_id: string;
  is_host: boolean;
  joined_at: string;
};

export type Suggestion = {
  id: string;
  room_id: string;
  text: string;
  created_by: string;
  created_at: string;
};

export type SuggestionOption = {
  id: string;
  suggestion_id: string;
  text: string;
  created_at: string;
};

export type Vote = {
  id: string;
  option_id: string;
  profile_id: string;
  created_at: string;
};

export type Message = {
  id: string;
  room_id: string;
  profile_id: string;
  text: string;
  created_at: string;
};

export type Cuisine = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

export type Recipe = {
  id: string;
  name: string;
  cuisine_id: string;
  description: string | null;
  image_url: string | null;
  prep_time: string | null;
  servings: number | null;
  difficulty: number | null;
  created_at: string;
  meal_type: string | null;
  recipe_ingredients?: RecipeIngredient[];
  recipe_instructions?: RecipeInstruction[];
  recipe_tips?: RecipeTip[];
};

export type RecipeIngredient = {
  id: string;
  recipe_id: string;
  text: string;
};

export type RecipeInstruction = {
  id: string;
  recipe_id: string;
  step_number: number;
  text: string;
};

export type RecipeTip = {
  id: string;
  recipe_id: string;
  text: string;
};

// Helper function to fetch cuisines
export async function fetchCuisines(): Promise<Cuisine[]> {
  try {
    const { data, error } = await supabase
      .from('cuisines')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching cuisines:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchCuisines:', error);
    return [];
  }
}

// Helper function to fetch recipes by cuisine
export async function fetchRecipesByCuisine(cuisineId: string): Promise<Recipe[]> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (*),
        recipe_instructions (*),
        recipe_tips (*)
      `)
      .eq('cuisine_id', cuisineId)
      .order('name');
      
    if (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchRecipesByCuisine:', error);
    return [];
  }
}

// Helper function to fetch a random recipe for quick decision with updated types
export async function fetchRandomRecipe(mealType?: MealType | null, userId?: string | null): Promise<FilteredRecipe | null> {
  try {
    // Convert meal type to match database enum
    const dbMealType = mealType === 'all' ? null : mealType;
    
    const { data, error } = await supabase
      .rpc('get_filtered_recipes', {
        p_meal_type: dbMealType,
        p_user_id: userId || null
      });
      
    if (error) {
      console.error('Error fetching random recipe:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No recipes found for criteria:', { mealType: dbMealType, userId });
      return null;
    }
    
    // Convert the database result to FilteredRecipe format
    const recipe = data[0];
    const filteredRecipe: FilteredRecipe = {
      recipe_id: recipe.recipe_id,
      recipe_name: recipe.recipe_name,
      recipe_description: recipe.recipe_description,
      recipe_image_url: recipe.recipe_image_url,
      recipe_prep_time: recipe.recipe_prep_time,
      recipe_servings: recipe.recipe_servings,
      recipe_difficulty: recipe.recipe_difficulty,
      recipe_meal_type: recipe.recipe_meal_type,
      recipe_price_range: null, // Not returned by current function
      recipe_distance: null, // Not returned by current function
      recipe_mood_tags: null, // Not returned by current function
      recipe_dietary_restrictions: null, // Not returned by current function
      cuisine_name: recipe.cuisine_name,
      is_saved: false // Default to false, can be updated separately
    };
    
    return filteredRecipe;
  } catch (error) {
    console.error('Error in fetchRandomRecipe:', error);
    return null;
  }
}

// Helper function to fetch multiple filtered recipes for quick decision
export async function fetchFilteredRecipes(
  mealType?: MealType | null, 
  userId?: string | null, 
  count: number = 5
): Promise<FilteredRecipe[]> {
  try {
    const recipes: FilteredRecipe[] = [];
    const maxRetries = count * 2; // Allow some retries for duplicates
    const uniqueRecipeIds = new Set<string>();
    
    // Convert meal type to match database enum
    const dbMealType = mealType === 'all' ? null : mealType;
    
    // Fetch recipes one by one until we have enough unique ones
    for (let i = 0; i < maxRetries && recipes.length < count; i++) {
      try {
        const { data, error } = await supabase
          .rpc('get_filtered_recipes', {
            p_meal_type: dbMealType,
            p_user_id: userId || null
          });
          
        if (error) {
          console.error('Error fetching recipe:', error);
          continue; // Try next iteration
        }
        
        if (data && data.length > 0) {
          const recipe = data[0];
          
          // Check if we already have this recipe
          if (!uniqueRecipeIds.has(recipe.recipe_id)) {
            uniqueRecipeIds.add(recipe.recipe_id);
            
            // Convert the database result to FilteredRecipe format
            const filteredRecipe: FilteredRecipe = {
              recipe_id: recipe.recipe_id,
              recipe_name: recipe.recipe_name,
              recipe_description: recipe.recipe_description,
              recipe_image_url: recipe.recipe_image_url,
              recipe_prep_time: recipe.recipe_prep_time,
              recipe_servings: recipe.recipe_servings,
              recipe_difficulty: recipe.recipe_difficulty,
              recipe_meal_type: recipe.recipe_meal_type,
              recipe_price_range: null, // Not returned by current function
              recipe_distance: null, // Not returned by current function
              recipe_mood_tags: null, // Not returned by current function
              recipe_dietary_restrictions: null, // Not returned by current function
              cuisine_name: recipe.cuisine_name,
              is_saved: false // Default to false, can be updated separately
            };
            
            recipes.push(filteredRecipe);
          }
        }
        
        // Small delay to prevent overwhelming the database
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      } catch (recipeError) {
        console.error('Error fetching individual recipe:', recipeError);
        continue; // Try next iteration
      }
    }
    
    console.log(`Fetched ${recipes.length} unique recipes out of ${count} requested`);
    return recipes;
  } catch (error) {
    console.error('Error in fetchFilteredRecipes:', error);
    return [];
  }
}

// Helper function to check Supabase connection
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}