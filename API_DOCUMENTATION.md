# TableTalk - API Documentation

## Overview

TableTalk uses Supabase as its backend-as-a-service platform, providing real-time database functionality, authentication, and API endpoints. This documentation covers all the technical aspects of how features are implemented and how to interact with the system.

## Authentication System

### Supabase Auth Integration

**Provider:** Supabase Authentication  
**Methods:** Email/Password, Social OAuth (planned)  
**Session Management:** JWT tokens with automatic refresh

#### Authentication Flow

```typescript
// Login Process
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "securepassword",
});

// Session Management
const {
  data: { session },
} = await supabase.auth.getSession();
```

#### User Profile Management

```typescript
// Profile Structure
interface UserProfile {
  id: string; // UUID from auth.users
  username: string; // Display name
  email: string; // Email address
  avatar_url?: string; // Optional profile image
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

#### Security Features

- **Row Level Security (RLS)**: All database operations are secured
- **JWT Validation**: Automatic token verification
- **Password Requirements**: Minimum 8 characters
- **Session Timeout**: Configurable session expiry

## Database Schema

### Core Tables

#### 1. Rooms Table

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(6) UNIQUE NOT NULL,
  creator_id UUID REFERENCES auth.users(id),
  food_mode VARCHAR(20) DEFAULT 'both',
  max_participants INTEGER DEFAULT NULL,
  timer_duration INTEGER DEFAULT NULL,
  deadline_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);
```

**Key Features:**

- **Unique Room Codes**: 6-character alphanumeric codes
- **Food Mode**: 'dining', 'cooking', or 'both'
- **Flexible Timing**: Timer duration or specific deadline
- **Status Tracking**: 'active', 'completed', 'expired', 'archived'

#### 2. Room Participants Table

```sql
CREATE TABLE room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(room_id, user_id)
);
```

#### 3. Food Suggestions Table

```sql
CREATE TABLE food_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cuisine_type VARCHAR(100),
  price_range INTEGER DEFAULT NULL,
  suggested_by UUID REFERENCES auth.users(id),
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. Votes Table

```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  suggestion_id UUID REFERENCES food_suggestions(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL, -- 'like', 'love', 'fire'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id, suggestion_id)
);
```

#### 5. Room Templates Table

```sql
CREATE TABLE room_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6. Messages Table

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Database Functions

#### 1. Room Management Functions

**Create Room Function:**

```sql
CREATE OR REPLACE FUNCTION create_room(
  p_name VARCHAR(255),
  p_food_mode VARCHAR(20) DEFAULT 'both',
  p_max_participants INTEGER DEFAULT NULL,
  p_timer_duration INTEGER DEFAULT NULL,
  p_deadline_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS rooms AS $$
DECLARE
  new_room rooms;
  room_code VARCHAR(6);
BEGIN
  -- Generate unique room code
  LOOP
    room_code := generate_room_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM rooms WHERE code = room_code);
  END LOOP;

  -- Insert new room
  INSERT INTO rooms (name, code, creator_id, food_mode, max_participants, timer_duration, deadline_at)
  VALUES (p_name, room_code, auth.uid(), p_food_mode, p_max_participants, p_timer_duration, p_deadline_at)
  RETURNING * INTO new_room;

  -- Add creator as participant
  INSERT INTO room_participants (room_id, user_id)
  VALUES (new_room.id, auth.uid());

  RETURN new_room;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Join Room Function:**

```sql
CREATE OR REPLACE FUNCTION join_room(p_room_code VARCHAR(6))
RETURNS room_participants AS $$
DECLARE
  target_room rooms;
  new_participant room_participants;
BEGIN
  -- Find room by code
  SELECT * INTO target_room FROM rooms WHERE code = p_room_code AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found or inactive';
  END IF;

  -- Check participant limit
  IF target_room.max_participants IS NOT NULL THEN
    IF (SELECT COUNT(*) FROM room_participants WHERE room_id = target_room.id AND is_active = TRUE) >= target_room.max_participants THEN
      RAISE EXCEPTION 'Room is at capacity';
    END IF;
  END IF;

  -- Add participant
  INSERT INTO room_participants (room_id, user_id)
  VALUES (target_room.id, auth.uid())
  ON CONFLICT (room_id, user_id) DO UPDATE SET is_active = TRUE, joined_at = NOW()
  RETURNING * INTO new_participant;

  RETURN new_participant;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 2. Voting Functions

**Cast Vote Function:**

```sql
CREATE OR REPLACE FUNCTION cast_vote(
  p_room_id UUID,
  p_suggestion_id UUID,
  p_vote_type VARCHAR(10)
) RETURNS votes AS $$
DECLARE
  new_vote votes;
BEGIN
  -- Validate vote type
  IF p_vote_type NOT IN ('like', 'love', 'fire') THEN
    RAISE EXCEPTION 'Invalid vote type';
  END IF;

  -- Insert or update vote
  INSERT INTO votes (room_id, user_id, suggestion_id, vote_type)
  VALUES (p_room_id, auth.uid(), p_suggestion_id, p_vote_type)
  ON CONFLICT (room_id, user_id, suggestion_id)
  DO UPDATE SET vote_type = p_vote_type, updated_at = NOW()
  RETURNING * INTO new_vote;

  RETURN new_vote;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Get Vote Results Function:**

```sql
CREATE OR REPLACE FUNCTION get_vote_results(p_room_id UUID)
RETURNS TABLE(
  suggestion_id UUID,
  suggestion_name VARCHAR(255),
  like_count INTEGER,
  love_count INTEGER,
  fire_count INTEGER,
  total_votes INTEGER,
  score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fs.id,
    fs.name,
    COALESCE(SUM(CASE WHEN v.vote_type = 'like' THEN 1 ELSE 0 END), 0)::INTEGER AS like_count,
    COALESCE(SUM(CASE WHEN v.vote_type = 'love' THEN 1 ELSE 0 END), 0)::INTEGER AS love_count,
    COALESCE(SUM(CASE WHEN v.vote_type = 'fire' THEN 1 ELSE 0 END), 0)::INTEGER AS fire_count,
    COALESCE(COUNT(v.id), 0)::INTEGER AS total_votes,
    (COALESCE(SUM(CASE WHEN v.vote_type = 'like' THEN 1 WHEN v.vote_type = 'love' THEN 2 WHEN v.vote_type = 'fire' THEN 3 ELSE 0 END), 0))::INTEGER AS score
  FROM food_suggestions fs
  LEFT JOIN votes v ON fs.id = v.suggestion_id
  WHERE fs.room_id = p_room_id
  GROUP BY fs.id, fs.name
  ORDER BY score DESC, total_votes DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Real-time Features

### Supabase Realtime Integration

TableTalk uses Supabase's real-time capabilities for live updates across all connected clients.

#### Subscription Setup

```typescript
// Room Updates Subscription
const roomSubscription = supabase
  .channel(`room:${roomId}`)
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "votes" },
    (payload) => {
      // Handle vote updates
      updateVoteDisplay(payload);
    }
  )
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "room_participants" },
    (payload) => {
      // Handle participant changes
      updateParticipantList(payload);
    }
  )
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "messages" },
    (payload) => {
      // Handle new messages
      displayNewMessage(payload);
    }
  )
  .subscribe();
```

#### Real-time Events

- **Vote Changes**: Instant vote updates across all clients
- **Participant Join/Leave**: Live participant list updates
- **New Messages**: Real-time chat functionality
- **Room Status Changes**: Timer updates and room completion
- **Suggestion Updates**: New suggestions appear immediately

### WebSocket Connection Management

```typescript
// Connection State Management
const handleRealtimeStatus = (status: string) => {
  switch (status) {
    case "SUBSCRIBED":
      setConnectionStatus("connected");
      break;
    case "CLOSED":
      setConnectionStatus("disconnected");
      // Implement reconnection logic
      break;
    case "CHANNEL_ERROR":
      setConnectionStatus("error");
      // Handle connection errors
      break;
  }
};
```

## API Endpoints

### REST API Functions

#### 1. Room Management

**Create Room:**

```http
POST /rest/v1/rpc/create_room
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "p_name": "Team Lunch Friday",
  "p_food_mode": "dining",
  "p_max_participants": 10,
  "p_timer_duration": 3600
}
```

**Join Room:**

```http
POST /rest/v1/rpc/join_room
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "p_room_code": "ABC123"
}
```

**Get Room Details:**

```http
GET /rest/v1/rooms?id=eq.{room_id}&select=*,room_participants(*),food_suggestions(*)
Authorization: Bearer {jwt_token}
```

#### 2. Voting System

**Cast Vote:**

```http
POST /rest/v1/rpc/cast_vote
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "p_room_id": "uuid-here",
  "p_suggestion_id": "uuid-here",
  "p_vote_type": "fire"
}
```

**Get Vote Results:**

```http
POST /rest/v1/rpc/get_vote_results
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "p_room_id": "uuid-here"
}
```

#### 3. Food Suggestions

**Add Suggestion:**

```http
POST /rest/v1/food_suggestions
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "room_id": "uuid-here",
  "name": "Pizza Palace",
  "description": "Great Italian pizza place",
  "cuisine_type": "Italian",
  "price_range": 2
}
```

**Get Suggestions:**

```http
GET /rest/v1/food_suggestions?room_id=eq.{room_id}&select=*,votes(*)
Authorization: Bearer {jwt_token}
```

### Error Handling

#### Standard Error Responses

```json
{
  "error": {
    "message": "Room not found or inactive",
    "code": "ROOM_NOT_FOUND",
    "details": "The specified room code does not exist or has expired"
  }
}
```

#### Common Error Codes

- **AUTH_REQUIRED**: Authentication token missing or invalid
- **ROOM_NOT_FOUND**: Room code doesn't exist or is inactive
- **ROOM_FULL**: Room has reached maximum participants
- **INVALID_VOTE_TYPE**: Vote type must be 'like', 'love', or 'fire'
- **PERMISSION_DENIED**: User doesn't have permission for this action
- **RATE_LIMIT_EXCEEDED**: Too many requests in time window

## Security Implementation

### Row Level Security (RLS)

#### Rooms Table Security

```sql
-- Users can only see rooms they participate in
CREATE POLICY "Users can view rooms they participate in" ON rooms
  FOR SELECT USING (
    id IN (
      SELECT room_id FROM room_participants
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- Users can only create rooms for themselves
CREATE POLICY "Users can create rooms" ON rooms
  FOR INSERT WITH CHECK (creator_id = auth.uid());
```

#### Votes Table Security

```sql
-- Users can only vote in rooms they've joined
CREATE POLICY "Users can vote in joined rooms" ON votes
  FOR ALL USING (
    room_id IN (
      SELECT room_id FROM room_participants
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- Users can only modify their own votes
CREATE POLICY "Users can modify own votes" ON votes
  FOR UPDATE USING (user_id = auth.uid());
```

### API Security Features

- **JWT Token Validation**: All requests require valid authentication
- **Rate Limiting**: Prevents abuse with request throttling
- **Input Validation**: All inputs are sanitized and validated
- **CORS Configuration**: Proper cross-origin request handling
- **SQL Injection Prevention**: Parameterized queries only

## Performance Optimization

### Database Optimization

#### Indexes

```sql
-- Room lookup optimization
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_status ON rooms(status);

-- Vote aggregation optimization
CREATE INDEX idx_votes_room_suggestion ON votes(room_id, suggestion_id);
CREATE INDEX idx_votes_type ON votes(vote_type);

-- Participant lookup optimization
CREATE INDEX idx_room_participants_room_user ON room_participants(room_id, user_id);
```

#### Query Optimization

- **Selective Queries**: Only fetch required columns
- **Pagination**: Limit large result sets
- **Aggregation**: Use database functions for calculations
- **Caching**: Redis caching for frequently accessed data (planned)

### Frontend Optimization

#### React Performance

```typescript
// Memoized voting component
const VotingButton = React.memo(({ suggestion, onVote }) => {
  const handleVote = useCallback(
    (voteType) => {
      onVote(suggestion.id, voteType);
    },
    [suggestion.id, onVote]
  );

  return <button onClick={() => handleVote("fire")}>🔥 Fire</button>;
});

// Optimized vote results display
const VoteResults = ({ votes }) => {
  const sortedResults = useMemo(() => {
    return votes.sort((a, b) => b.score - a.score);
  }, [votes]);

  return (
    <div>
      {sortedResults.map((result) => (
        <VoteResultItem key={result.id} result={result} />
      ))}
    </div>
  );
};
```

#### Bundle Optimization

- **Code Splitting**: Route-based lazy loading
- **Tree Shaking**: Remove unused code
- **Asset Optimization**: Compressed images and fonts
- **CDN Delivery**: Fast global content delivery

## Integration Points

### External Services

#### AI Food Suggestions (Planned)

```typescript
// AI service integration
interface AIService {
  generateSuggestions(params: {
    cuisine: string[];
    foodMode: "dining" | "cooking" | "both";
    priceRange: number;
    location?: string;
  }): Promise<FoodSuggestion[]>;
}

// Implementation example
const aiSuggestions = await aiService.generateSuggestions({
  cuisine: ["Italian", "Mexican"],
  foodMode: "dining",
  priceRange: 2,
  location: "San Francisco, CA",
});
```

#### Restaurant API Integration (Planned)

```typescript
// Restaurant data service
interface RestaurantService {
  searchRestaurants(params: {
    location: string;
    cuisine?: string;
    priceRange?: number;
    radius?: number;
  }): Promise<Restaurant[]>;
}
```

### Webhook Integration

#### Room Event Webhooks

```typescript
// Webhook payload structure
interface RoomWebhook {
  event: "room.created" | "room.completed" | "room.expired";
  room_id: string;
  room_code: string;
  data: {
    name: string;
    creator_id: string;
    participant_count: number;
    vote_count: number;
    winner?: FoodSuggestion;
  };
  timestamp: string;
}
```

## Development Tools

### Database Migration System

```sql
-- Migration file example: 20250115000001_add_room_archiving.sql
ALTER TABLE rooms ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

CREATE INDEX idx_rooms_archived ON rooms(archived_at) WHERE archived_at IS NOT NULL;

-- Add archiving function
CREATE OR REPLACE FUNCTION archive_room(p_room_id UUID)
RETURNS rooms AS $$
DECLARE
  archived_room rooms;
BEGIN
  UPDATE rooms
  SET archived_at = NOW(), status = 'archived'
  WHERE id = p_room_id AND creator_id = auth.uid()
  RETURNING * INTO archived_room;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found or access denied';
  END IF;

  RETURN archived_room;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Testing Framework

#### Database Testing

```typescript
// Test helper for database operations
const testHelper = {
  async createTestRoom(overrides = {}) {
    const { data } = await supabase.rpc("create_room", {
      p_name: "Test Room",
      p_food_mode: "both",
      ...overrides,
    });
    return data;
  },

  async cleanupTestData() {
    // Clean up test rooms, votes, etc.
    await supabase.from("rooms").delete().ilike("name", "Test%");
  },
};
```

#### API Testing

```typescript
// Integration test example
describe("Voting System", () => {
  test("should cast vote successfully", async () => {
    const room = await testHelper.createTestRoom();
    const suggestion = await testHelper.createTestSuggestion(room.id);

    const { data, error } = await supabase.rpc("cast_vote", {
      p_room_id: room.id,
      p_suggestion_id: suggestion.id,
      p_vote_type: "fire",
    });

    expect(error).toBeNull();
    expect(data.vote_type).toBe("fire");
  });
});
```

## Monitoring & Analytics

### Performance Monitoring

- **Query Performance**: Monitor slow queries and optimize
- **Real-time Connections**: Track WebSocket connection health
- **Error Rates**: Monitor and alert on error spikes
- **User Engagement**: Track feature usage and adoption

### Analytics Events

```typescript
// Analytics event tracking
const analytics = {
  trackRoomCreated(roomId: string, mode: string) {
    // Track room creation events
  },

  trackVoteCast(roomId: string, voteType: string) {
    // Track voting behavior
  },

  trackRoomCompleted(roomId: string, participantCount: number) {
    // Track successful room completions
  },
};
```

---

_This documentation is maintained alongside the codebase. For the latest updates, refer to the version in the repository._

_Last updated: January 2025_
