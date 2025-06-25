-- Create messages table for room discussions
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_profile_id ON messages(profile_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for messages

-- Select: Users can view messages in rooms they're part of
CREATE POLICY "Users can view messages in rooms they're in"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM room_participants 
      WHERE room_participants.room_id = messages.room_id 
      AND room_participants.profile_id = auth.uid()
    )
  );

-- Insert: Users can send messages to rooms they're part of
CREATE POLICY "Users can send messages to rooms they're in"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM room_participants 
      WHERE room_participants.room_id = messages.room_id 
      AND room_participants.profile_id = auth.uid()
    )
    AND profile_id = auth.uid()
  );

-- Update: Users can only update their own messages (for editing functionality)
CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Delete: Users can only delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (profile_id = auth.uid()); 