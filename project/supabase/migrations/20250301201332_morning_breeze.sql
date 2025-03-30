/*
  # Food Database Schema

  1. New Tables
    - `cuisines` - Stores different cuisine types
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text, nullable)
      - `image_url` (text, nullable)
      - `created_at` (timestamp)
    
    - `recipes` - Stores recipe information
      - `id` (uuid, primary key)
      - `name` (text)
      - `cuisine_id` (uuid, foreign key to cuisines)
      - `description` (text, nullable)
      - `image_url` (text, nullable)
      - `prep_time` (text, nullable)
      - `servings` (integer, nullable)
      - `difficulty` (integer, check between 1-3)
      - `created_at` (timestamp)
    
    - `recipe_ingredients` - Stores ingredients for recipes
      - `id` (uuid, primary key)
      - `recipe_id` (uuid, foreign key to recipes)
      - `text` (text)
    
    - `recipe_instructions` - Stores step-by-step instructions
      - `id` (uuid, primary key)
      - `recipe_id` (uuid, foreign key to recipes)
      - `step_number` (integer)
      - `text` (text)
    
    - `recipe_tips` - Stores chef's tips for recipes
      - `id` (uuid, primary key)
      - `recipe_id` (uuid, foreign key to recipes)
      - `text` (text)
  
  2. Security
    - Enable RLS on all tables
    - Create policies for authenticated users to view data
*/

-- Create cuisines table
CREATE TABLE IF NOT EXISTS cuisines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cuisine_id UUID REFERENCES cuisines(id) ON DELETE CASCADE NOT NULL,
  description TEXT,
  image_url TEXT,
  prep_time TEXT,
  servings INTEGER,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 3),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create recipe_ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL
);

-- Create recipe_instructions table
CREATE TABLE IF NOT EXISTS recipe_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  text TEXT NOT NULL
);

-- Create recipe_tips table
CREATE TABLE IF NOT EXISTS recipe_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tips ENABLE ROW LEVEL SECURITY;

-- Create policies for cuisines
CREATE POLICY "Anyone can view cuisines"
  ON cuisines FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for recipes
CREATE POLICY "Anyone can view recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for recipe_ingredients
CREATE POLICY "Anyone can view recipe ingredients"
  ON recipe_ingredients FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for recipe_instructions
CREATE POLICY "Anyone can view recipe instructions"
  ON recipe_instructions FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for recipe_tips
CREATE POLICY "Anyone can view recipe tips"
  ON recipe_tips FOR SELECT
  TO authenticated
  USING (true);

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  -- Check if the profiles table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    -- Check if is_admin column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_admin'
    ) THEN
      -- Get admin status
      SELECT is_admin INTO admin_status FROM profiles WHERE id = user_id;
      RETURN COALESCE(admin_status, false);
    END IF;
  END IF;
  
  -- Default to false if table or column doesn't exist
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Create policies for admin operations on cuisines
CREATE POLICY "Admins can insert cuisines"
  ON cuisines FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update cuisines"
  ON cuisines FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create policies for admin operations on recipes
CREATE POLICY "Admins can insert recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create policies for admin operations on recipe_ingredients
CREATE POLICY "Admins can insert recipe ingredients"
  ON recipe_ingredients FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Create policies for admin operations on recipe_instructions
CREATE POLICY "Admins can insert recipe instructions"
  ON recipe_instructions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Create policies for admin operations on recipe_tips
CREATE POLICY "Admins can insert recipe tips"
  ON recipe_tips FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));