-- Fix Schema Issues Migration
-- This migration addresses the mismatches between code expectations and database schema

-- 1. Add missing is_active column to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for better performance on room status queries
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms(is_active);

-- 2. Create food_suggestions table (the code expects this name, not just 'suggestions')
-- Check if the table already exists with the expected structure
CREATE TABLE IF NOT EXISTS food_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for food_suggestions
CREATE INDEX IF NOT EXISTS idx_food_suggestions_room_id ON food_suggestions(room_id);
CREATE INDEX IF NOT EXISTS idx_food_suggestions_created_by ON food_suggestions(created_by);

-- Enable RLS on food_suggestions table
ALTER TABLE food_suggestions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for food_suggestions
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view food suggestions" ON food_suggestions;
DROP POLICY IF EXISTS "Users can add food suggestions to rooms they're in" ON food_suggestions;

-- Select: Anyone in the room can see suggestions
CREATE POLICY "Anyone can view food suggestions" 
  ON food_suggestions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM room_participants 
      WHERE room_participants.room_id = food_suggestions.room_id 
      AND room_participants.profile_id = auth.uid()
    )
  );

-- Insert: Anyone in the room can add suggestions
CREATE POLICY "Users can add food suggestions to rooms they're in" 
  ON food_suggestions FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM room_participants 
      WHERE room_participants.room_id = food_suggestions.room_id 
      AND room_participants.profile_id = auth.uid()
    ) 
    AND created_by = auth.uid()
  );

-- 3. Create food_votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS food_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  suggestion_id UUID NOT NULL REFERENCES food_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(suggestion_id, user_id) -- One vote per user per suggestion
);

-- Create indexes for food_votes
CREATE INDEX IF NOT EXISTS idx_food_votes_room_id ON food_votes(room_id);
CREATE INDEX IF NOT EXISTS idx_food_votes_suggestion_id ON food_votes(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_food_votes_user_id ON food_votes(user_id);

-- Enable RLS on food_votes table
ALTER TABLE food_votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for food_votes
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view food votes" ON food_votes;
DROP POLICY IF EXISTS "Users can vote for food suggestions in rooms they're in" ON food_votes;
DROP POLICY IF EXISTS "Users can update their own food votes" ON food_votes;

-- Select: Anyone in the room can see votes
CREATE POLICY "Anyone can view food votes" 
  ON food_votes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM room_participants 
      WHERE room_participants.room_id = food_votes.room_id 
      AND room_participants.profile_id = auth.uid()
    )
  );

-- Insert: Users can add their own votes
CREATE POLICY "Users can vote for food suggestions in rooms they're in" 
  ON food_votes FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM room_participants 
      WHERE room_participants.room_id = food_votes.room_id 
      AND room_participants.profile_id = auth.uid()
    ) 
    AND user_id = auth.uid()
  );

-- Update: Users can update their own votes
CREATE POLICY "Users can update their own food votes" 
  ON food_votes FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. If there's existing data in the 'suggestions' table, migrate it to 'food_suggestions'
-- This is safe because it only inserts if the food_suggestions table was empty
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suggestions') THEN
    -- Check if food_suggestions table is empty and suggestions table has data
    IF (SELECT COUNT(*) FROM food_suggestions) = 0 AND (SELECT COUNT(*) FROM suggestions) > 0 THEN
      -- Migrate data from suggestions to food_suggestions
      INSERT INTO food_suggestions (id, room_id, name, created_by, created_at)
      SELECT 
        id,
        room_id, 
        text as name,
        created_by,
        created_at
      FROM suggestions;
      
      RAISE NOTICE 'Migrated % rows from suggestions to food_suggestions', (SELECT COUNT(*) FROM suggestions);
    END IF;
  END IF;
END $$;

-- 5. Create room_name_suggestions table if it doesn't exist
CREATE TABLE IF NOT EXISTS room_name_suggestions (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  text TEXT NOT NULL,
  food_mode TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Update database types and relationships to ensure proper foreign key relationships
-- Make sure the profiles table exists with the expected structure
-- (This should already exist, but we check for safety)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      username TEXT UNIQUE NOT NULL,
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      is_admin BOOLEAN DEFAULT false
    );
    
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$; 