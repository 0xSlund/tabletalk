import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { SupabaseDatabase, FilteredRecipe, MealType } from './database.functions';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Better error handling for missing environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing'
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
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
      eventsPerSecond: 2 // Reduced from 10 to 2 to minimize network requests
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

// Helper function to fetch a random recipe for AI Food Assistant with updated types
export async function fetchRandomRecipe(mealType?: MealType | null, userId?: string | null): Promise<FilteredRecipe | null> {
  try {
    // Convert meal type to match database enum
    const dbMealType = mealType === 'all' ? null : mealType;
    
    const { data, error } = await supabase
      .rpc('get_filtered_recipes', {
        p_meal_type: dbMealType,
        p_user_id: userId || null,
        p_price_range: null, // Let it use default (all price ranges)
        p_max_distance: null, // Let it use default (all distances)
        p_mood: null, // Let it use default (all moods)
        p_limit: 1
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
      recipe_price_range: recipe.recipe_price_range,
      recipe_distance: recipe.recipe_distance,
      recipe_mood_tags: recipe.recipe_mood_tags,
      recipe_dietary_restrictions: recipe.recipe_dietary_restrictions,
      cuisine_name: recipe.cuisine_name,
      is_saved: recipe.is_saved || false
    };
    
    return filteredRecipe;
  } catch (error) {
    console.error('Error in fetchRandomRecipe:', error);
    return null;
  }
}

// Helper function to fetch multiple filtered recipes for AI Food Assistant
export async function fetchFilteredRecipes(
  mealType?: MealType | null, 
  userId?: string | null, 
  count: number = 5,
  abortSignal?: AbortSignal
): Promise<FilteredRecipe[]> {
  const maxRetries = 2;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Check if request was aborted before starting
      if (abortSignal?.aborted) {
        throw new Error('Request was aborted');
      }
      
      // Step 1: Get saved recipes for the user (if user provided) - with quick fallback
      let savedRecipeIds: string[] = [];
      if (userId) {
        try {
          // Simple, fast query with short timeout
          const { data: savedData, error: savedError } = await supabase
            .from('saved_suggestions')
            .select('recipe_id')
            .eq('profile_id', userId)
            .limit(50); // Limit to prevent large queries
          
          if (!savedError && savedData) {
            savedRecipeIds = savedData.map(s => s.recipe_id);
          }
        } catch (error) {
          // Continue without saved recipes - don't let this block the main query
          console.warn('Saved recipes query failed, continuing without saved state:', error);
        }
      }
      
      // Check if request was aborted after saved recipes query
      if (abortSignal?.aborted) {
        throw new Error('Request was aborted');
      }
      
      // Step 2: Build the main query with direct table access - simplified and optimized
      let query = supabase
        .from('recipes')
        .select(`
          id,
          name,
          description,
          image_url,
          prep_time,
          servings,
          difficulty,
          meal_type,
          cuisine_id
        `);
      
      // Add meal type filter if specified
      if (mealType && mealType !== 'all') {
        query = query.eq('meal_type', mealType);
      }
      
      // Use a more efficient approach - get more records and shuffle in JS
      query = query.limit(count * 3); // Get more records to ensure variety
      
      // Add timeout and abort handling for main query
      const mainQueryPromise = query;
      const mainTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Main recipes query timeout')), 5000); // Reduced to 5 second timeout
      });
      
      const mainAbortPromise = abortSignal ? new Promise((_, reject) => {
        abortSignal.addEventListener('abort', () => reject(new Error('Request was aborted')));
      }) : Promise.resolve();
      
      let recipes, error;
      try {
        const result = await Promise.race([
          mainQueryPromise,
          mainTimeoutPromise,
          mainAbortPromise
        ]) as any;
        
        recipes = result.data;
        error = result.error;
      } catch (queryError) {
        if (queryError instanceof Error && queryError.message === 'Request was aborted') {
          throw queryError;
        }
        throw new Error(`Database query failed: ${queryError instanceof Error ? queryError.message : 'Unknown error'}`);
      }
      
      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }
      
      if (!recipes || recipes.length === 0) {
        return [];
      }
      
      // Check if request was aborted before processing results
      if (abortSignal?.aborted) {
        throw new Error('Request was aborted');
      }
      
      // Step 3: Get cuisine names for the recipes - with timeout
      const cuisineIds = [...new Set(recipes.map((recipe: any) => recipe.cuisine_id))];
      
      // Check if request was aborted before cuisine query
      if (abortSignal?.aborted) {
        throw new Error('Request was aborted');
      }
      
      const cuisineQueryPromise = supabase
        .from('cuisines')
        .select('id, name')
        .in('id', cuisineIds);
      
      const cuisineTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Cuisine query timeout')), 3000); // 3 second timeout for cuisine query
      });
      
      const cuisineAbortPromise = abortSignal ? new Promise((_, reject) => {
        abortSignal.addEventListener('abort', () => reject(new Error('Request was aborted')));
      }) : Promise.resolve();
      
      let cuisines, cuisineError;
      try {
        const cuisineResult = await Promise.race([
          cuisineQueryPromise,
          cuisineTimeoutPromise,
          cuisineAbortPromise
        ]) as any;
        
        cuisines = cuisineResult.data;
        cuisineError = cuisineResult.error;
      } catch (cuisineQueryError) {
        if (cuisineQueryError instanceof Error && cuisineQueryError.message === 'Request was aborted') {
          throw cuisineQueryError;
        }
        console.warn('Cuisine query failed, continuing with default names:', cuisineQueryError);
        cuisines = [];
        cuisineError = null;
      }
      
      // Create a map of cuisine_id to cuisine_name
      const cuisineMap = new Map();
      if (cuisines && !cuisineError) {
        cuisines.forEach((cuisine: any) => {
          cuisineMap.set(cuisine.id, cuisine.name);
        });
      }
      
      // Step 4: Transform the data to match expected format
      const transformedRecipes: FilteredRecipe[] = recipes.map((recipe: any) => ({
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        recipe_description: recipe.description,
        recipe_image_url: recipe.image_url,
        recipe_prep_time: recipe.prep_time,
        recipe_servings: recipe.servings,
        recipe_difficulty: recipe.difficulty,
        recipe_meal_type: recipe.meal_type,
        recipe_price_range: null, // Simplified - not using price range for now
        recipe_distance: null, // Simplified - not using distance for now
        recipe_mood_tags: null, // Simplified - not using mood tags for now
        recipe_dietary_restrictions: null, // Simplified - not using dietary restrictions for now
        cuisine_name: cuisineMap.get(recipe.cuisine_id) || 'Unknown',
        is_saved: savedRecipeIds.includes(recipe.id)
      }));
      
      // Step 5: Randomize and return requested count
      const shuffled = transformedRecipes.sort(() => Math.random() - 0.5);
      const result = shuffled.slice(0, count);
      
      return result;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        console.error(`❌ fetchFilteredRecipes failed after ${maxRetries + 1} attempts:`, lastError);
        throw lastError;
      }
      
      // If it's an abort error, don't retry
      if (lastError.message === 'Request was aborted') {
        throw lastError;
      }
      
      // Wait a bit before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 100; // 100ms, 200ms, 400ms
      console.warn(`⚠️ fetchFilteredRecipes attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached, but just in case
  throw lastError || new Error('Unknown error occurred');
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