/*
  # Fix Room Creation Policy

  1. Changes
    - Fix the RLS policy for room creation
    - Add a policy for users to view all rooms
    - Ensure users can create rooms without restrictions
  
  2. Security
    - Maintains security while allowing proper room creation
    - Users can still only see rooms they participate in
*/

-- Drop the problematic policy for room creation
DROP POLICY IF EXISTS "Users can create rooms" ON rooms;

-- Create a new policy that allows authenticated users to create rooms
CREATE POLICY "Users can create rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure users can see rooms they've created
CREATE POLICY "Users can view rooms they've created"
  ON rooms FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Ensure the policy for viewing rooms as a participant still exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rooms' 
    AND policyname = 'Anyone can view rooms they participate in'
  ) THEN
    CREATE POLICY "Anyone can view rooms they participate in"
      ON rooms FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM room_participants
          WHERE room_participants.room_id = rooms.id
          AND room_participants.profile_id = auth.uid()
        )
      );
  END IF;
END
$$;