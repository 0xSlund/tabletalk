-- Add about_me field to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'about_me'
  ) THEN
    ALTER TABLE profiles ADD COLUMN about_me TEXT;
  END IF;
END $$;

-- Add social_links field to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'social_links'
  ) THEN
    ALTER TABLE profiles ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add dietary_preferences field to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'dietary_preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN dietary_preferences JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('restaurant', 'dish')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on favorites table
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for favorites
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own favorites"
  ON favorites FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());