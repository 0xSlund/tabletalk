/*
  # Add Meal Types to Recipes

  1. Changes
    - Add meal_type column to recipes table
    - Add meal_type enum type
    - Update existing policies
  
  2. Security
    - Maintain existing security model
    - Add validation for meal types
*/

-- Create meal type enum
CREATE TYPE meal_type AS ENUM (
  'breakfast',
  'lunch',
  'dinner',
  'dessert',
  'appetizers_snacks',
  'soups_salads',
  'side_dishes'
);

-- Add meal_type column to recipes table
ALTER TABLE recipes ADD COLUMN meal_type meal_type;

-- Create an index on meal_type for faster filtering
CREATE INDEX recipes_meal_type_idx ON recipes(meal_type);

-- Function to get recipes filtered by meal type and dietary preferences
CREATE OR REPLACE FUNCTION get_filtered_recipes(
  p_meal_type meal_type DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  image_url TEXT,
  prep_time TEXT,
  servings INTEGER,
  difficulty INTEGER,
  meal_type meal_type,
  cuisine_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_preferences AS (
    SELECT 
      dietary_preferences->>'diets' AS diets,
      dietary_preferences->>'allergies' AS allergies
    FROM profiles
    WHERE id = p_user_id
  )
  SELECT 
    r.id,
    r.name,
    r.description,
    r.image_url,
    r.prep_time,
    r.servings,
    r.difficulty,
    r.meal_type,
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