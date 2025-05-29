/*
  # Quick Decision Enhancement Schema

  1. Changes
    - Add price_range column to recipes table
    - Add dietary_restrictions column to recipes table
    - Add mood_tags column to recipes table
    - Add distance column to recipes table
    - Create saved_suggestions table to store bookmarked suggestions
    - Update get_filtered_recipes function with new filters
  
  2. Security
    - Maintain existing security model
    - Add appropriate RLS policies for new tables
*/

-- Add price_range column to recipes (1-4, representing $ to $$$$)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS price_range INTEGER CHECK (price_range BETWEEN 1 AND 4);

-- Add dietary_restrictions column to recipes (as a JSON array of restrictions)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS dietary_restrictions JSONB DEFAULT '[]'::jsonb;

-- Add mood_tags column to recipes (as a JSON array of moods)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS mood_tags JSONB DEFAULT '[]'::jsonb;

-- Add distance column to recipes (approximated in miles/km, for demonstration)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS distance FLOAT;

-- Create index for the new columns
CREATE INDEX IF NOT EXISTS idx_recipes_price_range ON recipes(price_range);
CREATE INDEX IF NOT EXISTS idx_recipes_distance ON recipes(distance);

-- Create saved_suggestions table
CREATE TABLE IF NOT EXISTS saved_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  notes TEXT,
  UNIQUE(profile_id, recipe_id)
);

-- Enable RLS on saved_suggestions table
ALTER TABLE saved_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_suggestions
CREATE POLICY "Users can view their own saved suggestions"
  ON saved_suggestions FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own saved suggestions"
  ON saved_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete their own saved suggestions"
  ON saved_suggestions FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());

-- Create functions to check dietary restrictions and mood filters
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

-- Update get_filtered_recipes function to include new filters
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

-- Update some sample recipes with the new data (for testing)
UPDATE recipes
SET 
  price_range = (FLOOR(RANDOM() * 4) + 1)::INTEGER,
  distance = (RANDOM() * 20)::FLOAT,
  mood_tags = jsonb_build_array(
    (ARRAY['comfort_food', 'healthy', 'indulgent', 'light', 'hearty', 'exotic', 'familiar'])[FLOOR(RANDOM() * 7 + 1)],
    (ARRAY['comfort_food', 'healthy', 'indulgent', 'light', 'hearty', 'exotic', 'familiar'])[FLOOR(RANDOM() * 7 + 1)]
  ),
  dietary_restrictions = CASE 
    WHEN RANDOM() < 0.2 THEN jsonb_build_array('vegetarian')
    WHEN RANDOM() < 0.1 THEN jsonb_build_array('vegan')
    WHEN RANDOM() < 0.1 THEN jsonb_build_array('gluten_free')
    WHEN RANDOM() < 0.1 THEN jsonb_build_array('vegetarian', 'gluten_free')
    ELSE '[]'::jsonb
  END
WHERE 1=1; 