# TableTalk - Technical Architecture Documentation

## System Overview

TableTalk is a modern web application built with React and TypeScript, using Supabase as the backend-as-a-service platform. The application follows a component-based architecture with real-time capabilities for collaborative food decision-making.

## Frontend Architecture

### Technology Stack

- **React 18.2.0**: Core UI framework with concurrent features
- **TypeScript 5.x**: Type-safe development
- **Vite**: Build tool and development server
- **Zustand**: Lightweight state management
- **Framer Motion**: Animation library
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing

### Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── CreateRoom/     # Room creation wizard
│   ├── ActiveRoomScreen/ # Active room interface
│   ├── RoomHistoryScreen/ # Room management
│   └── ...
├── lib/                # Utility libraries
│   ├── store.ts        # Zustand store
│   ├── supabase.ts     # Supabase client
│   ├── constants.ts    # App configuration
│   └── utils.ts        # Helper functions
├── types/              # TypeScript definitions
└── assets/             # Static assets
```

### State Management

#### Zustand Store Structure

```typescript
interface AppState {
  // Navigation
  activeTab: TabType;
  previousPage?: string;

  // User & Auth
  auth: AuthState;

  // Room Management
  recentRooms: RecentRoom[];
  currentRoom: ActiveRoom;
  isViewingCompletedRoom: boolean;
  hasVotedOnAll: boolean;

  // Actions
  setActiveTab: (tab: TabType) => void;
  updateRoom: (room: ActiveRoom) => void;
  createRoom: (
    name: string,
    duration: number,
    foodMode?: string
  ) => Promise<{ roomId: string | null; roomCode: string | null }>;
  joinRoom: (roomCode: string) => Promise<boolean>;
  // ... other actions
}
```

#### Global State Management

- **Window State**: Used for cross-component data sharing (needs refactoring)

```typescript
interface TabletalkState {
  showVotingResults?: boolean;
  showOlympicResults?: boolean;
  userVotes?: Record<string, string>;
  otherUserVotesData?: Record<string, { reaction: string; name: string }>;
  votesMap?: Record<string, string>;
  votesBySuggestion?: Record<string, { count: number; userIds: string[] }>;
  roomExpired?: boolean;
  noVotes?: boolean;
  noOptions?: boolean;
  suggestions?: any[];
}
```

### Component Architecture

#### Component Categories

1. **Layout Components**: AppHeader, TabBar, PageTransition
2. **Screen Components**: HomeScreen, CreateRoomScreen, ActiveRoomScreen
3. **Feature Components**: Voting, FoodSuggestions, RoomSidebar
4. **UI Components**: LoadingSpinner, SkeletonLoader, BackButton
5. **Form Components**: CreatePollForm, AuthForm

#### Key Design Patterns

- **Container/Presentational**: Separation of logic and presentation
- **Compound Components**: Complex UI elements like CreateRoom wizard
- **Render Props**: Flexible component composition
- **Custom Hooks**: Reusable stateful logic

### Routing Structure

```typescript
const routes = [
  { path: "/", component: HomeScreen },
  { path: "/create", component: CreateRoomScreen },
  { path: "/join", component: JoinRoomScreen },
  { path: "/active-room/:roomCode", component: ActiveRoomScreen },
  { path: "/profile", component: ProfileScreen },
  { path: "/history", component: RoomHistoryScreen },
  { path: "/explore", component: ExploreCuisinesScreen },
  // ... other routes
];
```

## Backend Architecture

### Supabase Configuration

- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: JWT-based with email/password
- **Real-time**: WebSocket subscriptions
- **Storage**: File uploads for avatars and assets
- **Edge Functions**: Server-side logic (future implementation)

### Database Schema

#### Core Tables

```sql
-- Users and Authentication
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Room Management
rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  created_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMP,
  food_mode TEXT,
  participant_limit INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Food Suggestions
food_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id),
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Voting System
food_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  suggestion_id UUID REFERENCES food_suggestions(id),
  room_id UUID REFERENCES rooms(id),
  reaction TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Room Participants
room_participants (
  room_id UUID REFERENCES rooms(id),
  user_id UUID REFERENCES profiles(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- Messages
messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id),
  profile_id UUID REFERENCES profiles(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Room Templates
room_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  template_data JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Row Level Security (RLS) Policies

```sql
-- Profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Rooms: Users can see rooms they're participants of
CREATE POLICY "Users can view rooms they joined" ON rooms
  FOR SELECT USING (
    id IN (
      SELECT room_id FROM room_participants
      WHERE user_id = auth.uid()
    )
  );

-- Food votes: Users can see votes in rooms they're in
CREATE POLICY "Users can view votes in their rooms" ON food_votes
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM room_participants
      WHERE user_id = auth.uid()
    )
  );
```

### API Layer

#### Supabase Client Configuration

```typescript
export const supabase = createClient<SupabaseDatabase>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: { "x-application-name": "tabletalk" },
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  }
);
```

#### Real-time Subscriptions

```typescript
// Room updates
supabase
  .channel("room-updates")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "rooms" },
    handleRoomUpdate
  )
  .subscribe();

// Vote updates
supabase
  .channel("vote-updates")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "food_votes" },
    handleVoteUpdate
  )
  .subscribe();
```

## Security Implementation

### Authentication Flow

1. **Sign Up**: Email/password with confirmation
2. **Sign In**: JWT token generation
3. **Session Management**: Automatic token refresh
4. **Password Reset**: Secure email-based reset

### Data Security

- **Row Level Security**: Database-level access control
- **Input Validation**: Client and server-side validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Input sanitization
- **CSRF Protection**: Token-based requests

### Privacy Features

- **Data Minimization**: Only collect necessary data
- **Secure Sharing**: Encrypted room codes
- **Data Retention**: Automatic cleanup of old rooms
- **User Consent**: Clear privacy policies

## Performance Optimization

### Frontend Optimizations

- **Code Splitting**: Route-based lazy loading
- **Component Memoization**: React.memo for expensive components
- **State Optimization**: Zustand for minimal re-renders
- **Asset Optimization**: Image compression and lazy loading

### Backend Optimizations

- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient database connections
- **Caching**: Strategic data caching
- **Real-time Optimization**: Efficient subscription management

### Bundle Analysis

```bash
# Bundle size analysis
npm run build -- --analyze

# Performance monitoring
npm run lighthouse
```

## Development Workflow

### Code Quality

- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

### Testing Strategy

```typescript
// Unit Tests (Jest + Testing Library)
describe("Voting Component", () => {
  test("should handle vote submission", () => {
    // Test implementation
  });
});

// Integration Tests
describe("Room Creation Flow", () => {
  test("should create room and navigate", () => {
    // Test implementation
  });
});

// E2E Tests (Playwright)
test("complete voting flow", async ({ page }) => {
  // Test implementation
});
```

### Build Configuration

#### Vite Configuration

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
          ui: ["framer-motion", "lucide-react"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
```

#### Environment Configuration

```env
# Development
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Production
VITE_SUPABASE_URL=production-url
VITE_SUPABASE_ANON_KEY=production-key
```

## Deployment Architecture

### Production Setup

- **Hosting**: Vercel/Netlify for frontend
- **Database**: Supabase cloud PostgreSQL
- **CDN**: Global content delivery
- **SSL**: Automatic HTTPS

### Environment Management

- **Development**: Local Supabase instance
- **Staging**: Staging Supabase project
- **Production**: Production Supabase project

### Monitoring & Analytics

- **Error Tracking**: Sentry integration
- **Performance Monitoring**: Web Vitals
- **User Analytics**: Privacy-compliant tracking
- **Database Monitoring**: Supabase dashboard

## Migration Strategy

### Database Migrations

```sql
-- Migration example: 20250109000001_room_templates.sql
CREATE TABLE room_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  template_data JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE room_templates ENABLE ROW LEVEL SECURITY;
```

### Code Migration Patterns

- **Gradual Migration**: Feature-by-feature updates
- **Backward Compatibility**: Maintain old API endpoints
- **Feature Flags**: Toggle new features
- **A/B Testing**: Gradual rollout

## Troubleshooting Guide

### Common Issues

1. **Authentication Problems**: Check token expiry, session state
2. **Real-time Issues**: Verify WebSocket connections
3. **Performance Issues**: Check component re-renders
4. **Database Issues**: Review RLS policies and queries

### Debug Tools

- **React DevTools**: Component inspection
- **Supabase Dashboard**: Database monitoring
- **Network Tab**: API call analysis
- **Console Logs**: Application debugging

## Future Architecture Considerations

### Scalability Plans

- **Microservices**: Break down monolithic structure
- **CDN Integration**: Global content delivery
- **Database Sharding**: Horizontal scaling
- **Caching Layer**: Redis integration

### Technology Evolution

- **React Server Components**: Server-side rendering
- **Edge Computing**: Closer data processing
- **WebAssembly**: Performance-critical operations
- **Progressive Web App**: Native app features

---

_Last updated: January 2025_
_For technical questions or architecture discussions, contact the development team._
