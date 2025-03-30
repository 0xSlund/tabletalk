/*
  # Fix Ambiguous Column Reference in get_filtered_recipes Function

  1. Changes
    - Update get_filtered_recipes function to use proper table aliases
    - Fix ambiguous column references
    - Improve query structure for better clarity
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_filtered_recipes;

-- Recreate the function with fixed column references
CREATE OR REPLACE FUNCTION get_filtered_recipes(
  p_meal_type meal_type DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
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
  cuisine_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_preferences AS (
    SELECT 
      p.dietary_preferences->>'diets' AS diets,
      p.dietary_preferences->>'allergies' AS allergies
    FROM profiles p
    WHERE p.id = p_user_id
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
    c.name AS cuisine_name
  FROM recipes r
  JOIN cuisines c ON c.id = r.cuisine_id
  LEFT JOIN user_preferences up ON p_user_id IS NOT NULL
  WHERE 
    (p_meal_type IS NULL OR r.meal_type = p_meal_type)
    AND (
      p_user_id IS NULL 
      OR NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(up.diets::jsonb) diet
        WHERE diet IN (
          'vegetarian' -- Filter out non-vegetarian dishes for vegetarians
          -- Add more dietary checks as needed
        )
        -- Add allergy checks here
      )
    )
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;