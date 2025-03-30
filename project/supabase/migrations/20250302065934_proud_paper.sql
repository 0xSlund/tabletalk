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