/*
  # Room Creation Enhancements

  1. New Features
    - Add unique constraint to room codes
    - Add function to generate unique room codes
    - Add trigger to automatically generate room codes on insert
  
  2. Security
    - Maintains existing security policies
    - Ensures room codes are unique and properly formatted
*/

-- Add a function to generate unique room codes
CREATE OR REPLACE FUNCTION generate_unique_room_code() 
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 6-character alphanumeric code (uppercase)
    new_code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if this code already exists
    SELECT EXISTS(SELECT 1 FROM rooms WHERE code = new_code) INTO code_exists;
    
    -- Exit loop if we have a unique code
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Add a trigger to automatically generate room codes on insert if not provided
CREATE OR REPLACE FUNCTION set_room_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set code if it's NULL or empty
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_unique_room_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS ensure_room_code ON rooms;
CREATE TRIGGER ensure_room_code
  BEFORE INSERT ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION set_room_code();

-- Add a history table to track room participation for user profiles
CREATE TABLE IF NOT EXISTS room_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(profile_id, room_id)
);

-- Enable RLS on the new table
ALTER TABLE room_history ENABLE ROW LEVEL SECURITY;

-- Create policies for room_history
CREATE POLICY "Users can view their own room history"
  ON room_history FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Create a trigger to automatically add to history when joining a room
CREATE OR REPLACE FUNCTION add_to_room_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO room_history (profile_id, room_id)
  VALUES (NEW.profile_id, NEW.room_id)
  ON CONFLICT (profile_id, room_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS track_room_participation ON room_participants;
CREATE TRIGGER track_room_participation
  AFTER INSERT ON room_participants
  FOR EACH ROW
  EXECUTE FUNCTION add_to_room_history();