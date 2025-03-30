/*
  # Fix Timer and Add Expired Room Support

  1. Changes
    - Add a function to properly calculate room expiration time
    - Add a view to get room status (active/expired)
    - Add a winners table to store voting results
  
  2. Security
    - Maintain existing security model
    - Add appropriate RLS policies for new tables
*/

-- Create a function to properly calculate room expiration time
CREATE OR REPLACE FUNCTION calculate_expiration_time(duration_minutes INTEGER)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN NOW() + (duration_minutes * INTERVAL '1 minute');
END;
$$ LANGUAGE plpgsql;

-- Create a view to easily check if a room is active or expired
CREATE OR REPLACE VIEW room_status AS
SELECT 
  id,
  name,
  code,
  created_at,
  expires_at,
  CASE WHEN expires_at > NOW() THEN true ELSE false END AS is_active
FROM rooms;

-- Create a table to store voting winners
CREATE TABLE IF NOT EXISTS voting_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  suggestion_id UUID REFERENCES suggestions(id) ON DELETE CASCADE NOT NULL,
  winning_option_id UUID REFERENCES suggestion_options(id) ON DELETE CASCADE NOT NULL,
  votes_count INTEGER NOT NULL,
  determined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(room_id, suggestion_id)
);

-- Enable RLS on the new table
ALTER TABLE voting_results ENABLE ROW LEVEL SECURITY;

-- Create policies for voting_results
CREATE POLICY "Anyone can view voting results for rooms they're in"
  ON voting_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_participants
      WHERE room_participants.room_id = voting_results.room_id
      AND room_participants.profile_id = auth.uid()
    )
  );

-- Create a policy for inserting voting results
CREATE POLICY "Users can record voting results for rooms they're in"
  ON voting_results FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM room_participants
      WHERE room_participants.room_id = voting_results.room_id
      AND room_participants.profile_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM suggestions
        WHERE suggestions.id = voting_results.suggestion_id
        AND suggestions.room_id = voting_results.room_id
      )
    )
  );