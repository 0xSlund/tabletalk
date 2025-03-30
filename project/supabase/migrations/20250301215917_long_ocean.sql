/*
  # Simple fix for room_participants policy recursion

  1. Changes
    - Drop all existing policies on room_participants
    - Create a single, simple policy that only allows users to see their own participation
  
  2. Security
    - Simplifies the security model to eliminate recursion
    - Focuses on the core requirement: users can see their own participation
*/

-- Drop all existing policies on room_participants
DROP POLICY IF EXISTS "Anyone can view participants of rooms they're in" ON room_participants;
DROP POLICY IF EXISTS "Users can view their own participation" ON room_participants;
DROP POLICY IF EXISTS "Users can view other participants in their rooms" ON room_participants;
DROP POLICY IF EXISTS "Users can join rooms" ON room_participants;

-- Create a single, simple policy for viewing participation
CREATE POLICY "users_see_own_participation" 
  ON room_participants
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Recreate the policy for joining rooms
CREATE POLICY "Users can join rooms"
  ON room_participants FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());