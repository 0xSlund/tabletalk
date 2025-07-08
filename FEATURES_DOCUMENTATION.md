# TableTalk App - Features Documentation

## Overview

TableTalk is a collaborative food decision-making application that helps groups decide where to eat or what to cook together. The app features real-time voting, room-based discussions, and AI-powered food suggestions.

**Version:** 1.0.0  
**Tech Stack:** React, TypeScript, Supabase, Framer Motion, Tailwind CSS

## Core Features

### 1. Authentication & User Management

- **Supabase Auth Integration**: Email/password authentication with secure session management
- **User Profiles**: Username, avatar, and preference management
- **Password Reset**: Secure password reset flow via email
- **Session Persistence**: Automatic login state restoration

### 2. Room Management System

#### Room Creation

- **Quick Create**: Fast room setup with predefined templates

  - Theme selection (Cozy, Surprise, Burst animations)
  - Food mode selection (Dining Out, Cooking, Both)
  - Location and price range sliders
  - Time-based settings

- **Custom Create**: Advanced room configuration
  - **Basic Info Step**: Room name, cuisine selection, food mode
  - **Settings Step**: Participant limits, timer settings, deadlines, reminders
  - **Invite Step**: Contact management and room sharing
  - **Template Saving**: Save configurations for future use

#### Room Features

- **Unique Room Codes**: Short, shareable codes for easy joining
- **Participant Limits**: Configurable (up to 50 participants)
- **Timer System**: Customizable voting deadlines with visual countdowns
- **Real-time Updates**: Live participant count and activity

### 3. Food Suggestion & Voting System

#### Suggestion Management

- **AI-Powered Suggestions**: Intelligent restaurant and cuisine recommendations
- **Manual Suggestions**: Users can add custom food options
- **Cuisine Filtering**: Filter by cuisine type, price range, location
- **Suggestion Limits**: Max 20 suggestions per room, 10 options per suggestion

#### Voting Mechanism

- **Olympic-Style Voting**: Three reaction types (👍, ❤️, 🔥)
- **Real-time Vote Updates**: Live vote counts and participant reactions
- **Vote Visualization**: Progress bars and participant indicators
- **Results Display**: Winner announcements with podium-style results

### 4. Room Experience

#### Active Room Interface

- **Sidebar Navigation**: Room info, participants, sharing options
- **Discussion Area**: Real-time chat and food discussions
- **Voting Interface**: Interactive voting with visual feedback
- **Food Suggestions Grid**: Organized display of all options

#### Room States

- **Active Rooms**: Ongoing voting and discussion
- **Expired Rooms**: Results view with voting history
- **Archived Rooms**: Historical room data with cleanup options

### 5. Navigation & User Interface

#### Main Navigation (TabBar)

- **Home**: Dashboard with recent rooms and quick actions
- **Create**: Room creation wizard
- **Join**: Room joining interface
- **Explore**: Cuisine exploration and discovery
- **Profile**: User settings and preferences

#### Additional Screens

- **Room History**: Browse past rooms with filtering and search
- **Favorites**: Saved restaurants and cuisines
- **Dietary Preferences**: Manage dietary restrictions and preferences
- **Security Settings**: Account security and privacy controls
- **AI Food Assistant**: AI-powered food recommendation tool

### 6. Sharing & Collaboration

#### Room Sharing

- **Multiple Platforms**: WhatsApp, Telegram, Twitter, Email
- **Web Share API**: Native sharing on supported devices
- **Clipboard Copy**: Fallback sharing method
- **QR Code Generation**: Visual room joining (planned)

#### Real-time Collaboration

- **Live Updates**: Real-time room state synchronization
- **Participant Tracking**: Active user indicators
- **Message System**: In-room chat functionality
- **Notification System**: Vote reminders and updates

### 7. Data Management

#### Local Storage

- **User Preferences**: Theme, settings, recent rooms
- **Form Persistence**: Save room creation progress
- **Performance Optimization**: Reduce API calls with caching

#### Database Integration

- **Supabase Backend**: PostgreSQL with real-time subscriptions
- **Row Level Security**: Secure data access patterns
- **Migration System**: Database schema versioning

## Technical Architecture

### Frontend

- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Zustand**: Lightweight state management
- **Framer Motion**: Smooth animations and transitions
- **Tailwind CSS**: Utility-first styling

### Backend

- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Primary database
- **Real-time**: WebSocket connections for live updates
- **Auth**: JWT-based authentication
- **Storage**: File uploads and management

### Performance Features

- **Lazy Loading**: Component-based code splitting
- **Optimistic Updates**: Immediate UI feedback
- **Caching**: Strategic data caching
- **Responsive Design**: Mobile-first approach

## User Flows

### 1. New User Onboarding

1. User visits app → Auth screen
2. Sign up with email/password
3. Profile creation
4. Dashboard with tutorial highlights

### 2. Creating a Room

1. Navigate to Create tab
2. Choose Quick or Custom creation
3. Configure room settings
4. Invite participants
5. Room activation and sharing

### 3. Joining a Room

1. Receive room code/link
2. Enter code or click link
3. Join room interface
4. Participate in voting and discussion

### 4. Voting Process

1. View food suggestions
2. Vote with reactions (👍, ❤️, 🔥)
3. See real-time results
4. View final results when voting ends

### 5. Room Management

1. View room history
2. Archive or delete old rooms
3. Save favorite configurations as templates
4. Manage participant lists

## Configuration & Limits

### App Limits

- **Max Room Participants**: 50
- **Max Suggestions per Room**: 20
- **Max Options per Suggestion**: 10
- **Default Room Expiry**: 30 minutes
- **Max Message Length**: 500 characters

### Customizable Settings

- **Timer Duration**: 15 minutes to 24 hours
- **Participant Limits**: 2-50 people
- **Reminder Settings**: Configurable notifications
- **Privacy Settings**: Room visibility controls

## Security Features

### Data Protection

- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Client and server-side validation
- **Rate Limiting**: API abuse prevention

### Privacy Controls

- **Room Privacy**: Private/public room options
- **Data Retention**: Automatic cleanup of old data
- **User Consent**: Clear privacy policies
- **Secure Sharing**: Encrypted room codes

## Accessibility Features

### Current Implementation

- **Keyboard Navigation**: Basic keyboard support
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Color Contrast**: Accessible color schemes
- **Responsive Design**: Mobile and desktop optimization

### Planned Improvements

- **Enhanced Screen Reader Support**: More comprehensive ARIA implementation
- **Voice Commands**: Voice-based navigation
- **High Contrast Mode**: Better accessibility options
- **Font Size Controls**: User-adjustable text sizes

## Integration Points

### External Services

- **Supabase**: Primary backend service
- **Email Services**: Password reset and notifications
- **Social Platforms**: Sharing integration
- **Maps Integration**: Location-based features (planned)

### API Endpoints

- **Room Management**: CRUD operations for rooms
- **User Management**: Profile and authentication
- **Voting System**: Vote recording and retrieval
- **Real-time Updates**: WebSocket connections

## Development Roadmap

### Phase 1: Core Features (Complete)

- ✅ User authentication
- ✅ Room creation and joining
- ✅ Basic voting system
- ✅ Real-time updates

### Phase 2: Enhanced Features (In Progress)

- 🔄 Advanced voting analytics
- 🔄 Improved mobile experience
- 🔄 Enhanced sharing options
- 🔄 Performance optimizations

### Phase 3: Advanced Features (Planned)

- 📋 AI-powered recommendations
- 📋 Integration with restaurant APIs
- 📋 Advanced user preferences
- 📋 Group management features

### Phase 4: Scale & Polish (Future)

- 📋 Offline support
- 📋 Progressive Web App features
- 📋 Advanced analytics
- 📋 Enterprise features

## Known Issues & Technical Debt

### TypeScript Issues

- Several `@ts-ignore` comments need proper typing
- `any` types in global state management
- Missing type definitions for some components

### Performance Concerns

- Global state management could be optimized
- Some components re-render unnecessarily
- Database queries could be more efficient

### Missing Features

- `recordVotingResult()` function not implemented
- `removeRoom()` function not implemented
- Offline support not available
- Push notifications not implemented

## Support & Maintenance

### Monitoring

- Error tracking and reporting
- Performance monitoring
- User analytics
- Database health checks

### Updates

- Regular security updates
- Feature releases
- Bug fixes
- Performance improvements

---

_Last updated: January 2025_
_For technical support or feature requests, contact the development team._
