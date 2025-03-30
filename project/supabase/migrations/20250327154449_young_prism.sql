/*
  # Add Initial Recipe Data

  1. Changes
    - Add cuisines data
    - Add recipes with their details
    - Add recipe ingredients, instructions, and tips
  
  2. Security
    - Maintain existing security model
    - Use proper data types and constraints
*/

-- First, let's add some basic cuisines
INSERT INTO cuisines (name, description, image_url) VALUES
('American', 'Classic American comfort food and modern interpretations', 'https://images.unsplash.com/photo-1555196301-9acc011afd9c?auto=format&fit=crop&w=1200&q=80'),
('Italian', 'Traditional Italian dishes with Mediterranean flavors', 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?auto=format&fit=crop&w=1200&q=80'),
('Asian Fusion', 'A blend of various Asian culinary traditions', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=1200&q=80'),
('Mediterranean', 'Healthy and flavorful Mediterranean cuisine', 'https://images.unsplash.com/photo-1523986371872-9d3ba2e2a389?auto=format&fit=crop&w=1200&q=80'),
('Mexican', 'Vibrant and spicy Mexican dishes', 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=1200&q=80'),
('Breakfast & Brunch', 'Morning favorites and brunch classics', 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=80'),
('Vegetarian', 'Creative and satisfying vegetarian dishes', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80'),
('Seafood', 'Fresh and flavorful seafood preparations', 'https://images.unsplash.com/photo-1579631542720-3a87824fff86?auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (name) DO NOTHING;

-- Function to get cuisine ID by name
CREATE OR REPLACE FUNCTION get_cuisine_id(cuisine_name TEXT)
RETURNS UUID AS $$
DECLARE
  cuisine_id UUID;
BEGIN
  SELECT id INTO cuisine_id FROM cuisines WHERE name = cuisine_name LIMIT 1;
  RETURN cuisine_id;
END;
$$ LANGUAGE plpgsql;

-- Add breakfast recipes
DO $$ 
DECLARE
  cuisine_id UUID;
BEGIN
  cuisine_id := get_cuisine_id('Breakfast & Brunch');
  
  INSERT INTO recipes (name, cuisine_id, description, prep_time, servings, difficulty, meal_type)
  VALUES 
    ('Fluffy Pancakes', cuisine_id, 'Classic buttermilk pancakes with maple syrup.', '20 minutes', 4, 1, 'breakfast'),
    ('Avocado Toast with Poached Egg', cuisine_id, 'Creamy avocado on toast with a runny poached egg.', '15 minutes', 2, 1, 'breakfast'),
    ('Greek Yogurt Parfait', cuisine_id, 'Layered yogurt with granola, berries, and honey.', '10 minutes', 1, 1, 'breakfast'),
    ('Veggie Omelette', cuisine_id, 'Fluffy eggs stuffed with peppers, onions, and cheese.', '15 minutes', 1, 1, 'breakfast'),
    ('Shakshuka', cuisine_id, 'Eggs poached in spiced tomato-pepper sauce.', '30 minutes', 4, 2, 'breakfast')
  ON CONFLICT DO NOTHING;
END $$;

-- Add main course recipes
DO $$ 
DECLARE
  italian_id UUID;
  american_id UUID;
  asian_id UUID;
  mediterranean_id UUID;
  mexican_id UUID;
BEGIN
  italian_id := get_cuisine_id('Italian');
  american_id := get_cuisine_id('American');
  asian_id := get_cuisine_id('Asian Fusion');
  mediterranean_id := get_cuisine_id('Mediterranean');
  mexican_id := get_cuisine_id('Mexican');
  
  INSERT INTO recipes (name, cuisine_id, description, prep_time, servings, difficulty, meal_type)
  VALUES 
    ('Spaghetti Carbonara', italian_id, 'Creamy pasta with pancetta and egg.', '25 minutes', 4, 2, 'main_course'),
    ('Margherita Pizza', italian_id, 'Classic pizza with tomato, mozzarella, and basil.', '45 minutes', 4, 2, 'main_course'),
    ('Chicken Parmesan', italian_id, 'Breaded chicken topped with marinara and cheese.', '40 minutes', 4, 2, 'main_course'),
    
    ('Classic Beef Tacos', mexican_id, 'Seasoned ground beef in crispy tortillas.', '30 minutes', 6, 1, 'main_course'),
    ('Fish Tacos', mexican_id, 'Crispy fish with slaw and chipotle mayo.', '35 minutes', 4, 2, 'main_course'),
    
    ('Beef and Broccoli Stir-Fry', asian_id, 'Tender beef and broccoli in garlic sauce.', '30 minutes', 4, 2, 'main_course'),
    ('Pad Thai', asian_id, 'Stir-fried rice noodles with shrimp and peanuts.', '35 minutes', 4, 2, 'main_course'),
    
    ('Greek Salad', mediterranean_id, 'Cucumber, tomatoes, olives, and feta cheese.', '15 minutes', 4, 1, 'soups_salads'),
    ('Ratatouille', mediterranean_id, 'Provençal stewed vegetables with herbs.', '45 minutes', 6, 2, 'main_course')
  ON CONFLICT DO NOTHING;
END $$;

-- Add appetizers and snacks
DO $$ 
DECLARE
  mediterranean_id UUID;
  american_id UUID;
BEGIN
  mediterranean_id := get_cuisine_id('Mediterranean');
  american_id := get_cuisine_id('American');
  
  INSERT INTO recipes (name, cuisine_id, description, prep_time, servings, difficulty, meal_type)
  VALUES 
    ('Caprese Skewers', mediterranean_id, 'Mozzarella, tomato, and basil drizzled with balsamic.', '15 minutes', 6, 1, 'appetizers_snacks'),
    ('Stuffed Mushrooms', american_id, 'Mushrooms filled with herbed cream cheese.', '30 minutes', 8, 2, 'appetizers_snacks'),
    ('Buffalo Chicken Wings', american_id, 'Crispy wings tossed in spicy buffalo sauce.', '45 minutes', 6, 2, 'appetizers_snacks')
  ON CONFLICT DO NOTHING;
END $$;

-- Add desserts
DO $$ 
DECLARE
  american_id UUID;
  italian_id UUID;
BEGIN
  american_id := get_cuisine_id('American');
  italian_id := get_cuisine_id('Italian');
  
  INSERT INTO recipes (name, cuisine_id, description, prep_time, servings, difficulty, meal_type)
  VALUES 
    ('Classic Chocolate Chip Cookies', american_id, 'Chewy cookies with melty chocolate chips.', '30 minutes', 24, 1, 'dessert'),
    ('New York Cheesecake', american_id, 'Creamy cheesecake with graham cracker crust.', '90 minutes', 12, 3, 'dessert'),
    ('Tiramisu', italian_id, 'Coffee-flavored Italian dessert with mascarpone.', '60 minutes', 8, 2, 'dessert')
  ON CONFLICT DO NOTHING;
END $$;

-- Add some recipe ingredients (example for a few recipes)
DO $$
DECLARE
  recipe_id UUID;
BEGIN
  -- Get Spaghetti Carbonara recipe ID
  SELECT id INTO recipe_id FROM recipes WHERE name = 'Spaghetti Carbonara' LIMIT 1;
  IF recipe_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, text) VALUES
      (recipe_id, '1 pound spaghetti'),
      (recipe_id, '4 ounces pancetta or guanciale, diced'),
      (recipe_id, '4 large eggs'),
      (recipe_id, '1 cup freshly grated Pecorino Romano'),
      (recipe_id, '1 cup freshly grated Parmigiano-Reggiano'),
      (recipe_id, 'Freshly ground black pepper'),
      (recipe_id, 'Salt to taste')
    ON CONFLICT DO NOTHING;
    
    INSERT INTO recipe_instructions (recipe_id, step_number, text) VALUES
      (recipe_id, 1, 'Bring a large pot of salted water to boil'),
      (recipe_id, 2, 'Cook spaghetti according to package directions'),
      (recipe_id, 3, 'Meanwhile, cook pancetta until crispy'),
      (recipe_id, 4, 'Whisk eggs and cheese in a bowl'),
      (recipe_id, 5, 'Toss hot pasta with pancetta'),
      (recipe_id, 6, 'Add egg mixture and toss quickly'),
      (recipe_id, 7, 'Season with black pepper and serve immediately')
    ON CONFLICT DO NOTHING;
    
    INSERT INTO recipe_tips (recipe_id, text) VALUES
      (recipe_id, 'Reserve some pasta water to adjust consistency'),
      (recipe_id, 'Work quickly when adding the egg mixture to prevent scrambling'),
      (recipe_id, 'Use room temperature eggs for best results')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Get Chocolate Chip Cookies recipe ID
  SELECT id INTO recipe_id FROM recipes WHERE name = 'Classic Chocolate Chip Cookies' LIMIT 1;
  IF recipe_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, text) VALUES
      (recipe_id, '2 1/4 cups all-purpose flour'),
      (recipe_id, '1 cup unsalted butter, softened'),
      (recipe_id, '3/4 cup granulated sugar'),
      (recipe_id, '3/4 cup packed brown sugar'),
      (recipe_id, '2 large eggs'),
      (recipe_id, '1 teaspoon vanilla extract'),
      (recipe_id, '1 teaspoon baking soda'),
      (recipe_id, '1/2 teaspoon salt'),
      (recipe_id, '2 cups semi-sweet chocolate chips')
    ON CONFLICT DO NOTHING;
    
    INSERT INTO recipe_instructions (recipe_id, step_number, text) VALUES
      (recipe_id, 1, 'Preheat oven to 375°F (190°C)'),
      (recipe_id, 2, 'Cream together butter and sugars'),
      (recipe_id, 3, 'Beat in eggs and vanilla'),
      (recipe_id, 4, 'Mix in dry ingredients'),
      (recipe_id, 5, 'Stir in chocolate chips'),
      (recipe_id, 6, 'Drop rounded tablespoons onto baking sheets'),
      (recipe_id, 7, 'Bake for 9 to 11 minutes or until golden brown')
    ON CONFLICT DO NOTHING;
    
    INSERT INTO recipe_tips (recipe_id, text) VALUES
      (recipe_id, 'Chill dough for 24 hours for better flavor'),
      (recipe_id, 'Use room temperature eggs for better mixing'),
      (recipe_id, 'Line baking sheets with parchment paper for easy cleanup')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Create an index for meal type queries
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON recipes(meal_type);

-- Create an index for recipe difficulty
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty);