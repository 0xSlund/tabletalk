/*
  # Initial schema setup for food voting app

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `avatar_url` (text, nullable)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
    - `rooms`
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text, unique)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp with time zone)
      - `expires_at` (timestamp with time zone)
    - `room_participants`
      - `id` (uuid, primary key)
      - `room_id` (uuid, references rooms)
      - `profile_id` (uuid, references profiles)
      - `is_host` (boolean)
      - `joined_at` (timestamp with time zone)
    - `suggestions`
      - `id` (uuid, primary key)
      - `room_id` (uuid, references rooms)
      - `text` (text)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp with time zone)
    - `suggestion_options`
      - `id` (uuid, primary key)
      - `suggestion_id` (uuid, references suggestions)
      - `text` (text)
      - `created_at` (timestamp with time zone)
    - `votes`
      - `id` (uuid, primary key)
      - `option_id` (uuid, references suggestion_options)
      - `profile_id` (uuid, references profiles)
      - `created_at` (timestamp with time zone)
    - `messages`
      - `id` (uuid, primary key)
      - `room_id` (uuid, references rooms)
      - `profile_id` (uuid, references profiles)
      - `text` (text)
      - `created_at` (timestamp with time zone)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for room participants to access room data
*/

-- Create profiles table that extends the auth.users table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Create room_participants table
CREATE TABLE IF NOT EXISTS room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_host BOOLEAN DEFAULT false NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(room_id, profile_id)
);

-- Create suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create suggestion_options table
CREATE TABLE IF NOT EXISTS suggestion_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID REFERENCES suggestions(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID REFERENCES suggestion_options(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(option_id, profile_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for rooms
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

CREATE POLICY "Users can create rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Create policies for room_participants
CREATE POLICY "Anyone can view participants of rooms they're in"
  ON room_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_participants AS rp
      WHERE rp.room_id = room_participants.room_id
      AND rp.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms"
  ON room_participants FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- Create policies for suggestions
CREATE POLICY "Anyone can view suggestions in rooms they're in"
  ON suggestions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_participants
      WHERE room_participants.room_id = suggestions.room_id
      AND room_participants.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create suggestions in rooms they're in"
  ON suggestions FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM room_participants
      WHERE room_participants.room_id = suggestions.room_id
      AND room_participants.profile_id = auth.uid()
    )
  );

-- Create policies for suggestion_options
CREATE POLICY "Anyone can view options in rooms they're in"
  ON suggestion_options FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suggestions
      JOIN room_participants ON room_participants.room_id = suggestions.room_id
      WHERE suggestions.id = suggestion_options.suggestion_id
      AND room_participants.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create options for their suggestions"
  ON suggestion_options FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM suggestions
      WHERE suggestions.id = suggestion_options.suggestion_id
      AND suggestions.created_by = auth.uid()
    )
  );

-- Create policies for votes
CREATE POLICY "Anyone can view votes in rooms they're in"
  ON votes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suggestion_options
      JOIN suggestions ON suggestions.id = suggestion_options.suggestion_id
      JOIN room_participants ON room_participants.room_id = suggestions.room_id
      WHERE suggestion_options.id = votes.option_id
      AND room_participants.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can vote in rooms they're in"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM suggestion_options
      JOIN suggestions ON suggestions.id = suggestion_options.suggestion_id
      JOIN room_participants ON room_participants.room_id = suggestions.room_id
      WHERE suggestion_options.id = votes.option_id
      AND room_participants.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can change their own votes"
  ON votes FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());

-- Create policies for messages
CREATE POLICY "Anyone can view messages in rooms they're in"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_participants
      WHERE room_participants.room_id = messages.room_id
      AND room_participants.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in rooms they're in"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM room_participants
      WHERE room_participants.room_id = messages.room_id
      AND room_participants.profile_id = auth.uid()
    )
  );

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(gen_random_uuid()::text, 1, 8)),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();