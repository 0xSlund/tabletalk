-- Add is_archived column to rooms table
ALTER TABLE rooms 
ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;

-- Add index for better query performance
CREATE INDEX idx_rooms_archived ON rooms(is_archived);

-- Add index for cleanup queries (expired + old + not archived)
CREATE INDEX idx_rooms_cleanup ON rooms(expires_at, created_at, is_archived); 