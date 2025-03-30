/*
  # Fix Room History Policy

  1. Changes
    - Fix the RLS policy for room_history table
    - Add a policy for users to insert into room_history
    - Ensure the trigger can properly add history entries
  
  2. Security
    - Maintains security while allowing proper history tracking
    - Users can still only see their own room history
*/

-- Drop the problematic policy for room_history
DROP POLICY IF EXISTS "Users can view their own room history" ON room_history;

-- Create a new policy that allows users to view their own history
CREATE POLICY "Users can view their own room history"
  ON room_history FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Create a policy that allows the trigger to insert history entries
CREATE POLICY "System can insert room history"
  ON room_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Modify the trigger function to use security definer
CREATE OR REPLACE FUNCTION add_to_room_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO room_history (profile_id, room_id)
  VALUES (NEW.profile_id, NEW.room_id)
  ON CONFLICT (profile_id, room_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS track_room_participation ON room_participants;
CREATE TRIGGER track_room_participation
  AFTER INSERT ON room_participants
  FOR EACH ROW
  EXECUTE FUNCTION add_to_room_history();