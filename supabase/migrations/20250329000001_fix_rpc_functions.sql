/*
  Migration to fix RPC functions and ensure they're properly working
  This specifically addresses the get_filtered_recipes function and adds
  functions for saving and removing favorites
*/

-- Create custom type for meal_type if it doesn't exist already
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meal_type') THEN
    CREATE TYPE meal_type AS ENUM (
      'breakfast', 
      'lunch', 
      'dinner', 
      'dessert', 
      'appetizers_snacks', 
      'soups_salads', 
      'side_dishes'
    );
  END IF;
END$$;

-- Ensure meal_type column exists in recipes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'recipes'
    AND column_name = 'meal_type'
  ) THEN
    ALTER TABLE recipes ADD COLUMN meal_type meal_type;
  END IF;
END$$;

-- Re-create the functions for matching dietary restrictions and mood
CREATE OR REPLACE FUNCTION matches_dietary_restrictions(
  recipe_restrictions JSONB,
  user_restrictions JSONB
) RETURNS BOOLEAN AS $$
BEGIN
  -- If the user has no restrictions, all recipes match
  IF user_restrictions IS NULL OR jsonb_array_length(user_restrictions) = 0 THEN
    RETURN TRUE;
  END IF;
  
  -- If the recipe accommodates all the user's restrictions, it's a match
  RETURN (
    SELECT bool_and(
      EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(recipe_restrictions) AS recipe_restriction
        WHERE recipe_restriction = user_restriction
      )
    )
    FROM jsonb_array_elements_text(user_restrictions) AS user_restriction
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION matches_mood(
  recipe_moods JSONB,
  user_mood TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- If no mood is specified, all recipes match
  IF user_mood IS NULL OR user_mood = '' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if the recipe's moods include the user's mood
  RETURN EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(recipe_moods) AS mood
    WHERE mood = user_mood
  );
END;
$$ LANGUAGE plpgsql;

-- Re-create the get_filtered_recipes function with proper typing
CREATE OR REPLACE FUNCTION get_filtered_recipes(
  p_meal_type meal_type DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_price_range INTEGER DEFAULT NULL,
  p_max_distance FLOAT DEFAULT NULL,
  p_mood TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 1
)
RETURNS TABLE (
  recipe_id UUID,
  recipe_name TEXT,
  recipe_description TEXT,
  recipe_image_url TEXT,
  recipe_prep_time TEXT,
  recipe_servings INTEGER,
  recipe_difficulty INTEGER,
  recipe_meal_type meal_type,
  recipe_price_range INTEGER,
  recipe_distance FLOAT,
  recipe_mood_tags JSONB,
  recipe_dietary_restrictions JSONB,
  cuisine_name TEXT,
  is_saved BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH user_preferences AS (
    SELECT 
      p.dietary_preferences->>'diets' AS diets,
      p.dietary_preferences->>'allergies' AS allergies
    FROM profiles p
    WHERE p.id = p_user_id
  ),
  saved_recipes AS (
    SELECT recipe_id
    FROM saved_suggestions
    WHERE profile_id = p_user_id
  )
  SELECT 
    r.id AS recipe_id,
    r.name AS recipe_name,
    r.description AS recipe_description,
    r.image_url AS recipe_image_url,
    r.prep_time AS recipe_prep_time,
    r.servings AS recipe_servings,
    r.difficulty AS recipe_difficulty,
    r.meal_type AS recipe_meal_type,
    r.price_range AS recipe_price_range,
    r.distance AS recipe_distance,
    r.mood_tags AS recipe_mood_tags,
    r.dietary_restrictions AS recipe_dietary_restrictions,
    c.name AS cuisine_name,
    EXISTS (SELECT 1 FROM saved_recipes sr WHERE sr.recipe_id = r.id) AS is_saved
  FROM recipes r
  JOIN cuisines c ON c.id = r.cuisine_id
  LEFT JOIN user_preferences up ON p_user_id IS NOT NULL
  WHERE 
    (p_meal_type IS NULL OR r.meal_type = p_meal_type)
    AND (p_price_range IS NULL OR r.price_range <= p_price_range)
    AND (p_max_distance IS NULL OR r.distance <= p_max_distance)
    AND (p_mood IS NULL OR matches_mood(r.mood_tags, p_mood))
    AND (
      p_user_id IS NULL 
      OR matches_dietary_restrictions(
        r.dietary_restrictions,
        CASE 
          WHEN up.diets IS NOT NULL AND up.diets <> 'null' THEN up.diets::jsonb
          ELSE '[]'::jsonb
        END
      )
    )
  ORDER BY RANDOM()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create function to save a recipe to favorites
CREATE OR REPLACE FUNCTION save_recipe_to_favorites(
  p_user_id UUID,
  p_recipe_id UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO saved_suggestions (profile_id, recipe_id)
  VALUES (p_user_id, p_recipe_id)
  ON CONFLICT (profile_id, recipe_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Create function to remove a recipe from favorites
CREATE OR REPLACE FUNCTION remove_recipe_from_favorites(
  p_user_id UUID,
  p_recipe_id UUID
) RETURNS VOID AS $$
BEGIN
  DELETE FROM saved_suggestions
  WHERE profile_id = p_user_id
  AND recipe_id = p_recipe_id;
END;
$$ LANGUAGE plpgsql; 