-- Create food_suggestions table
CREATE TABLE IF NOT EXISTS food_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for food_suggestions
CREATE INDEX IF NOT EXISTS food_suggestions_room_id_idx ON food_suggestions(room_id);
CREATE INDEX IF NOT EXISTS food_suggestions_created_by_idx ON food_suggestions(created_by);

-- Create food_votes table
CREATE TABLE IF NOT EXISTS food_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  suggestion_id UUID NOT NULL REFERENCES food_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(suggestion_id, user_id) -- One vote per user per suggestion
);

-- Create indexes for food_votes
CREATE INDEX IF NOT EXISTS food_votes_room_id_idx ON food_votes(room_id);
CREATE INDEX IF NOT EXISTS food_votes_suggestion_id_idx ON food_votes(suggestion_id);
CREATE INDEX IF NOT EXISTS food_votes_user_id_idx ON food_votes(user_id);

-- Create RLS policies for food_suggestions

-- Select: Anyone in the room can see suggestions
CREATE POLICY "Anyone can view suggestions" 
  ON food_suggestions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM room_participants 
      WHERE room_participants.room_id = food_suggestions.room_id 
      AND room_participants.profile_id = auth.uid()
    )
  );

-- Insert: Anyone in the room can add suggestions
CREATE POLICY "Users can add suggestions to rooms they're in" 
  ON food_suggestions FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM room_participants 
      WHERE room_participants.room_id = food_suggestions.room_id 
      AND room_participants.profile_id = auth.uid()
    ) 
    AND created_by = auth.uid()
  );

-- Create RLS policies for food_votes

-- Select: Anyone in the room can see votes
CREATE POLICY "Anyone can view votes" 
  ON food_votes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM room_participants 
      WHERE room_participants.room_id = food_votes.room_id 
      AND room_participants.profile_id = auth.uid()
    )
  );

-- Insert: Users can add their own votes
CREATE POLICY "Users can vote for suggestions in rooms they're in" 
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
CREATE POLICY "Users can update their own votes" 
  ON food_votes FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Enable RLS
ALTER TABLE food_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_votes ENABLE ROW LEVEL SECURITY; 