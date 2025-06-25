-- Create room_templates table for saving room configurations as templates
CREATE TABLE room_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Room configuration data
  room_name TEXT NOT NULL,
  food_mode TEXT, -- 'dining-out', 'cooking', 'neutral'
  selected_cuisines TEXT[] DEFAULT '{}',
  price_range TEXT[] DEFAULT '{}',
  radius INTEGER,
  
  -- Settings configuration  
  participant_limit INTEGER,
  timer_option TEXT,
  custom_duration TEXT,
  duration_unit TEXT, -- 'minutes' or 'hours'
  deadline TEXT,
  reminders BOOLEAN DEFAULT false,
  access_control TEXT, -- 'anyone', 'approve-first', etc.
  
  -- Template metadata
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  
  -- Invite settings
  selected_contacts TEXT[] DEFAULT '{}'
);

-- Add RLS policies
ALTER TABLE room_templates ENABLE ROW LEVEL SECURITY;

-- Users can view their own templates
CREATE POLICY "Users can view own templates" 
  ON room_templates FOR SELECT 
  USING (auth.uid() = created_by);

-- Users can view public templates
CREATE POLICY "Users can view public templates" 
  ON room_templates FOR SELECT 
  USING (is_public = true);

-- Users can insert their own templates
CREATE POLICY "Users can create templates" 
  ON room_templates FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own templates
CREATE POLICY "Users can update own templates" 
  ON room_templates FOR UPDATE 
  USING (auth.uid() = created_by);

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates" 
  ON room_templates FOR DELETE 
  USING (auth.uid() = created_by);

-- Create index for better performance
CREATE INDEX idx_room_templates_created_by ON room_templates(created_by);
CREATE INDEX idx_room_templates_public ON room_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_room_templates_created_at ON room_templates(created_at DESC);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_room_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
CREATE TRIGGER update_room_templates_updated_at
  BEFORE UPDATE ON room_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_room_templates_updated_at(); 