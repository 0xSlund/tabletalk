-- Create a function to properly calculate room expiration time
CREATE OR REPLACE FUNCTION calculate_expiration_time(duration_minutes INTEGER)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN NOW() + (duration_minutes * INTERVAL '1 minute');
END;
$$ LANGUAGE plpgsql;

-- Add a view to easily check if a room is active or expired
CREATE OR REPLACE VIEW room_status AS
SELECT 
  id,
  name,
  code,
  created_at,
  expires_at,
  CASE WHEN expires_at > NOW() THEN true ELSE false END AS is_active
FROM rooms;

-- Add a function to get the winning choice for a room
CREATE OR REPLACE FUNCTION get_room_winning_choice(room_id UUID)
RETURNS TEXT AS $$
DECLARE
  winning_text TEXT;
BEGIN
  SELECT so.text INTO winning_text
  FROM voting_results vr
  JOIN suggestion_options so ON so.id = vr.winning_option_id
  WHERE vr.room_id = $1
  ORDER BY vr.determined_at DESC
  LIMIT 1;
  
  RETURN winning_text;
END;
$$ LANGUAGE plpgsql;

-- Add a function to check if a room has expired
CREATE OR REPLACE FUNCTION is_room_expired(room_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_expired BOOLEAN;
BEGIN
  SELECT expires_at <= NOW() INTO is_expired
  FROM rooms
  WHERE id = $1;
  
  RETURN is_expired;
END;
$$ LANGUAGE plpgsql;

-- Add a function to get all winning options for a room
CREATE OR REPLACE FUNCTION get_room_winning_options(room_id UUID)
RETURNS TABLE(
  suggestion_id UUID,
  winning_option_id UUID,
  option_text TEXT,
  votes_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vr.suggestion_id,
    vr.winning_option_id,
    so.text AS option_text,
    vr.votes_count
  FROM voting_results vr
  JOIN suggestion_options so ON so.id = vr.winning_option_id
  WHERE vr.room_id = $1;
END;
$$ LANGUAGE plpgsql;