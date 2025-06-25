-- Add food_mode column to rooms table
-- This migration adds the missing food_mode column that the application code expects

-- Add food_mode column to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS food_mode TEXT;

-- Create index for better performance on food_mode queries
CREATE INDEX IF NOT EXISTS idx_rooms_food_mode ON rooms(food_mode);

-- Add comment to document the column
COMMENT ON COLUMN rooms.food_mode IS 'The food mode selected for the room: dining-out, cooking, both, or neutral'; 