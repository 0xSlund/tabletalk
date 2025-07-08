import { create } from 'zustand';
import { supabase, type Profile, type Room } from './supabase';
import { persist } from 'zustand/middleware';

interface RecentRoom {
  id: string;
  name: string;
  participants: number;
  lastActive: string;
  isActive: boolean;
  expiresAt?: string;
  winningChoice?: string;
  code?: string;
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isHost?: boolean;
}

interface Message {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

interface Suggestion {
  id: string;
  text: string;
  votes: number;
  author: string;
  timestamp: string;
  options: {
    id: string;
    text: string;
    votes: number;
    voters?: string[];
  }[];
}

interface ActiveRoom {
  id: string;
  name: string;
  code?: string;
  participants: Participant[];
  messages: Message[];
  suggestions: Suggestion[];
  createdAt: string;
  expiresAt: string;
  isActive?: boolean;
  foodMode?: string | null;
  winningOptions?: Record<string, {
    optionId: string;
    text: string;
    votes: number;
  }>;
  votes: Record<string, string>;
}

interface AuthState {
  user: Profile | null;
  session: any | null;
  loading: boolean;
}

interface AppState {
  activeTab: 'home' | 'create' | 'join' | 'trending' | 'ai-food-assistant' | 'explore-cuisines' | 'profile' | 'active-room' | 'security' | 'history' | 'dietary' | 'favorites';
  recentRooms: RecentRoom[];
  currentRoom: ActiveRoom;
  auth: AuthState;
  isViewingCompletedRoom: boolean;
  hasVotedOnAll: boolean;
  previousPage?: string;
  setActiveTab: (tab: AppState['activeTab']) => void;
  updateRoom: (room: ActiveRoom) => void;
  setUser: (user: Profile | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  fetchUserProfile: (userId: string) => Promise<void>;
  fetchRecentRooms: () => Promise<void>;
  fetchRoomHistory: () => Promise<void>;
  signOut: () => Promise<void>;
  createRoom: (roomName: string, timerDuration: number, foodMode?: string | null) => Promise<{ roomId: string | null; roomCode: string | null }>;
  joinRoom: (roomCode: string) => Promise<boolean>;
  addSuggestion: (roomId: string, text: string, options: string[]) => Promise<boolean>;
  voteForOption: (roomId: string, suggestionId: string, optionId: string) => Promise<boolean>;
  sendMessage: (roomId: string, text: string) => Promise<boolean>;
  addMessage: (text: string) => Promise<boolean>;
  loadMessages: (roomId: string) => Promise<boolean>;
  recordVotingResult: (roomId: string, suggestionId: string, winningOptionId: string, votesCount: number) => Promise<boolean>;
  removeRoom: (roomId: string) => Promise<boolean>;
  addFoodSuggestion: (name: string, emoji: string, description: string) => Promise<boolean>;
  voteForSuggestion: (suggestionId: string, reaction: string) => Promise<boolean>;
  fetchVotesForRoom: (roomId: string) => Promise<boolean>;
  clearVoteForSuggestion: (suggestionId: string) => Promise<boolean>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTab: 'home',
      recentRooms: [],
      currentRoom: {
        id: '',
        name: '',
        code: '',
        participants: [],
        messages: [],
        suggestions: [],
        createdAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        isActive: true,
        foodMode: null,
        votes: {}
      },
      auth: {
        user: null,
        session: null,
        loading: true
      },
      isViewingCompletedRoom: false,
      hasVotedOnAll: false,
      previousPage: undefined,
      setActiveTab: (tab) => set({ activeTab: tab }),
      updateRoom: (room) => set({ currentRoom: room }),
      setUser: (user) => set((state) => ({ auth: { ...state.auth, user } })),
      setSession: (session) => set((state) => ({ auth: { ...state.auth, session } })),
      setLoading: (loading) => set((state) => ({ auth: { ...state.auth, loading } })),
      
      fetchUserProfile: async (userId) => {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (error) throw error;
          
          if (profile) {
            set((state) => ({ 
              auth: { 
                ...state.auth, 
                user: profile 
              } 
            }));
            
            // Update avatar in current room if user is a participant
            const currentState = get();
            if (currentState.currentRoom && currentState.currentRoom.participants) {
              const updatedParticipants = currentState.currentRoom.participants.map(p => {
                if (p.id === userId) {
                  return {
                    ...p,
                    avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
                  };
                }
                return p;
              });
              
              set({
                currentRoom: {
                  ...currentState.currentRoom,
                  participants: updatedParticipants
                }
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      },
      
      fetchRecentRooms: async () => {
        const { auth } = get();
        if (!auth.user) return;
        
        try {
          
          // Get recent rooms with a single optimized query using joins
          // Limit to last 30 days and max 20 rooms for performance
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const { data: rooms, error } = await supabase
              .from('rooms')
              .select(`
                id,
                name,
                code,
                created_at,
                expires_at,
              room_participants!inner (
                profile_id,
                joined_at
              ),
                voting_results (
                suggestion_options (text)
              )
            `)
            .eq('room_participants.profile_id', auth.user.id)
            .gte('room_participants.joined_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(20); // Limit to 20 most recent rooms for better performance
            
          if (error) {
            console.error('Error fetching rooms:', error);
            set({ recentRooms: [] });
            return;
          }
          
          if (!rooms || rooms.length === 0) {
            set({ recentRooms: [] });
            return;
          }
          
          // Get participant counts in a separate optimized query
          const roomIds = rooms.map(room => room.id);
          const { data: participantCounts } = await supabase
            .from('room_participants')
            .select('room_id')
            .in('room_id', roomIds);
          
          // Count participants per room
          const participantCountMap = {};
          if (participantCounts) {
            participantCounts.forEach(p => {
              participantCountMap[p.room_id] = (participantCountMap[p.room_id] || 0) + 1;
            });
          }
          
          const formattedRooms = rooms.map(room => {
            const now = new Date();
            const expiresAt = new Date(room.expires_at);
            const isActive = expiresAt > now;
            
            let winningChoice;
            if (room.voting_results && room.voting_results.length > 0) {
              const firstResult = room.voting_results[0];
              if (firstResult.suggestion_options && firstResult.suggestion_options.length > 0) {
                winningChoice = firstResult.suggestion_options[0].text;
              }
            }
            
            return {
              id: room.id,
              name: room.name,
              participants: participantCountMap[room.id] || 1,
              lastActive: room.created_at,
              isActive,
              expiresAt: room.expires_at,
              winningChoice,
              code: room.code
            };
          });
          
          set({ recentRooms: formattedRooms });
        } catch (error) {
          console.error('Error fetching recent rooms:', error);
          // Set empty array on error so UI doesn't stay in loading state
          set({ recentRooms: [] });
        }
      },
      
      fetchRoomHistory: async () => {
        // Implementation will be added later
        return Promise.resolve();
      },
      
      signOut: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          set((state) => ({
            auth: {
              user: null,
              session: null,
              loading: false
            }
          }));
          
        } catch (error) {
          console.error('Error signing out:', error);
        }
      },
      
      createRoom: async (roomName: string, timerDuration: number, foodMode?: string | null) => {
        const { auth } = get();
        if (!auth.user) return { roomId: null, roomCode: null };
        
        try {
          console.log(`createRoom: Starting to create room "${roomName}" with duration ${timerDuration} minutes`);
          
          // Generate a random 6-character alphanumeric code
          const generateRoomCode = () => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 6; i++) {
              result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
          };
          
          const roomCode = generateRoomCode();
          
          // Calculate expiry time based on timer duration
          const expiryDate = new Date();
          expiryDate.setMinutes(expiryDate.getMinutes() + timerDuration);
          
          // Format expiry date properly
          const formattedExpiryDate = expiryDate.toISOString();
          
          console.log(`Creating room "${roomName}" with expiry time: ${formattedExpiryDate}, duration: ${timerDuration} minutes, current time: ${new Date().toISOString()}`);
          
          // Create the room in Supabase - creating a simpler data structure
          const newRoom = {
            name: roomName,
            code: roomCode,
            created_by: auth.user.id,
            expires_at: formattedExpiryDate,
            food_mode: foodMode
          };
          
          // Using a more direct approach to insert the room
          const { data: room, error: roomError } = await supabase
            .from('rooms')
            .insert(newRoom)
            .select();
            
          if (roomError) {
            console.error('Error creating room:', roomError);
            throw roomError;
          }
          
          if (!room || room.length === 0) {
            console.error('No room data returned after creation');
            throw new Error('Failed to create room');
          }
          
          const createdRoom = room[0]; // Get the first room from the array
          console.log(`Room created successfully: ${createdRoom.id}, with expiry: ${createdRoom.expires_at}`);
          
          // Add the creator as a participant and host
          const participantData = {
            room_id: createdRoom.id,
            profile_id: auth.user.id,
            is_host: true,
            joined_at: new Date().toISOString()
          };
          
          const { error: participantError } = await supabase
            .from('room_participants')
            .insert(participantData);
            
          if (participantError) {
            console.error('Error adding participant:', participantError);
            throw participantError;
          }
          
          // Set up the current room in the state
          const newRoomState: ActiveRoom = {
            id: createdRoom.id,
            name: createdRoom.name,
            code: createdRoom.code,
            participants: [{
              id: auth.user.id,
              name: auth.user.username || auth.user.email?.split('@')[0] || 'User',
              avatar: auth.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.user.id}`,
              isHost: true
            }],
            messages: [],
            suggestions: [],
            createdAt: createdRoom.created_at,
            expiresAt: createdRoom.expires_at,
            isActive: true,
            foodMode: createdRoom.food_mode,
            votes: {}
          };
          
          console.log('Setting currentRoom with new room:', newRoomState);
          set({ 
            currentRoom: newRoomState,
            activeTab: 'active-room' // Set the active tab to active-room
          });
          
          // Store the room ID in localStorage for navigation purposes
          localStorage.setItem('tabletalk-last-room-id', createdRoom.id);
          
          // Don't automatically fetch recent rooms here to prevent loops
          // The UI will update when the user navigates back to home
          
          return { roomId: createdRoom.id, roomCode: createdRoom.code };
        } catch (error) {
          console.error('Error creating room:', error);
          return { roomId: null, roomCode: null };
        }
      },
      
      joinRoom: async (roomCode) => {
        const { auth } = get();
        if (!auth.user) return false;
        
        try {
          console.log(`Joining room with code ${roomCode}`);
          
          // First check if we're joining via code or ID
          const isJoiningViaId = roomCode.length > 10; // IDs are typically longer than room codes
          
          // Find the room
          let room;
          let roomError;
          
          if (isJoiningViaId) {
            console.log('Joining via room ID');
            // Find the room by ID
            const response = await supabase
              .from('rooms')
              .select(`
                id,
                name,
                code,
                created_at,
                expires_at,
                food_mode,
                room_participants (
                  profile_id,
                  is_host
                )
              `)
              .eq('id', roomCode)
              .single();
              
            roomError = response.error;
            room = response.data;
          } else {
            // Find the room by code
            console.log('Joining via room code');
            const response = await supabase
              .from('rooms')
              .select(`
                id,
                name,
                code,
                created_at,
                expires_at,
                food_mode,
                room_participants (
                  profile_id,
                  is_host
                )
              `)
              .eq('code', roomCode)
              .single();
              
            roomError = response.error;
            room = response.data;
          }
            
          if (roomError) {
            console.error('Error finding room:', roomError);
            return false;
          }
          
          // Check if room is expired
          const now = new Date();
          const expiresAt = new Date(room.expires_at);
          const isExpired = expiresAt <= now;
          
          console.log(`Room expiry status: now=${now.toISOString()}, expires=${expiresAt.toISOString()}, isExpired=${isExpired}`);
          
          // Update room participants (if not already added)
          const isParticipant = room.room_participants.some(p => p.profile_id === auth.user?.id);
          
          if (!isParticipant) {
            const { error: participantError } = await supabase
              .from('room_participants')
              .insert([
                {
                  room_id: room.id,
                  profile_id: auth.user.id,
                  is_host: false,
                  joined_at: new Date().toISOString()
                }
              ]);
              
            if (participantError) {
              console.error('Error adding participant:', participantError);
              // Continue anyway since the user might be rejoining
            }
          }
          
          // Fetch participants details
          const { data: participants, error: participantsError } = await supabase
            .from('room_participants')
            .select(`
              profile_id,
              is_host,
              profiles (
                id,
                username,
                avatar_url
              )
            `)
            .eq('room_id', room.id);
            
          if (participantsError) {
            console.error('Error fetching participants:', participantsError);
            return false;
          }
          
          // Fetch suggestions
          const { data: suggestions, error: suggestionsError } = await supabase
            .from('food_suggestions')
            .select(`
              id,
              name,
              created_at,
              user_id,
              room_id,
              profiles (
                id,
                username,
                avatar_url
              )
            `)
            .eq('room_id', room.id);
            
          if (suggestionsError) {
            console.error('Error fetching suggestions:', suggestionsError);
            return false;
          }
          
          // Map data to our store format
          const formattedParticipants = participants.map(p => ({
            id: p.profile_id,
            name: p.profiles ? p.profiles.username : 'Unknown',
            avatar: p.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.profile_id}`,
            isHost: p.is_host
          }));
          
          const formattedSuggestions = suggestions.map(s => ({
            id: s.id,
            text: s.name,
            votes: 0, // Will be calculated from votes data
            author: s.profiles ? s.profiles.username : 'Unknown',
            timestamp: s.created_at,
            options: [] // Not used in new model
          }));
          
          // Update store
          set({
            currentRoom: {
              id: room.id,
              name: room.name,
              code: room.code,
              participants: formattedParticipants,
              messages: [], // Will be populated if needed
              suggestions: formattedSuggestions,
              createdAt: room.created_at,
              expiresAt: room.expires_at,
              isActive: !isExpired,
              foodMode: room.food_mode,
              votes: {} // Will be updated by fetchVotesForRoom
            },
            activeTab: 'active-room',
            isViewingCompletedRoom: isExpired
          });
          
          // If the room is expired, import and call the expired room handler to ensure voting results show correctly
          if (isExpired) {
            try {
              // Dynamic import to avoid circular dependency
              const { handleExpiredRoom } = await import('../components/ActiveRoomScreen/utils/expiredRoomHandler');
              console.log('Room is expired during join, handling with utility');
              handleExpiredRoom(room.id);
            } catch (error) {
              console.error('Failed to handle expired room:', error);
              // Continue anyway
            }
          }
          
          return true;
        } catch (error) {
          console.error('Error joining room:', error);
          return false;
        }
      },
      
      addSuggestion: async () => {
        // Implementation will be added later
        return Promise.resolve(false);
      },
      
      voteForOption: async () => {
        // Implementation will be added later
        return Promise.resolve(false);
      },
      
      // Add a food suggestion to the current room
      addFoodSuggestion: async (name, emoji, description) => {
        const { currentRoom, auth } = get();
        if (!currentRoom.id || !auth.user) return false;
        
        try {
          // Generate a unique ID for the suggestion
          const suggestionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Insert into Supabase
          const { error } = await supabase
            .from('food_suggestions')
            .insert({
              id: suggestionId,
              room_id: currentRoom.id,
              name: name,
              emoji: emoji,
              description: description,
              created_by: auth.user.id
            });
            
          if (error) throw error;
          
          // Update local state
          const newSuggestion = {
            id: suggestionId,
            name,
            emoji,
            description,
            votes: 0,
            author: auth.user.id,
            timestamp: new Date().toISOString(),
          };
          
          set(state => ({
            currentRoom: {
              ...state.currentRoom,
              suggestions: [...(state.currentRoom.suggestions || []), newSuggestion]
            }
          }));
          
          return true;
        } catch (error) {
          console.error('Error adding food suggestion:', error);
          return false;
        }
      },
      
      // Record a vote for a food suggestion
      voteForSuggestion: async (suggestionId, reaction) => {
        const { currentRoom, auth } = get();
        if (!currentRoom.id || !auth.user || !suggestionId) return false;
        
        try {
          console.log(`Recording vote for suggestion ${suggestionId} with reaction ${reaction} in room ${currentRoom.id}`);
          
          // Check if user already voted for this suggestion
          const { data: existingVote, error: checkError } = await supabase
            .from('food_votes')
            .select('*')
            .eq('suggestion_id', suggestionId)
            .eq('user_id', auth.user.id)
            .single();
            
          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is the error code when no rows found
            throw checkError;
          }
          
          let voteResult;
          
          // If vote exists, update it; otherwise, insert a new vote
          if (existingVote) {
            console.log('Updating existing vote:', existingVote.id);
            const { data, error: updateError } = await supabase
              .from('food_votes')
              .update({ 
                reaction,
                // Ensure timestamp is updated to mark the vote activity
                updated_at: new Date().toISOString()
              })
              .eq('id', existingVote.id)
              .select();
              
            if (updateError) throw updateError;
            voteResult = data;
          } else {
            console.log('Creating new vote for user', auth.user.id);
            const { data, error: insertError } = await supabase
              .from('food_votes')
              .insert({
                suggestion_id: suggestionId,
                user_id: auth.user.id,
                reaction,
                room_id: currentRoom.id
              })
              .select();
              
            if (insertError) throw insertError;
            voteResult = data;
          }
          
          if (!voteResult) {
            console.error('No vote result returned after save operation');
          } else {
            console.log('Vote saved successfully:', voteResult);
          }
          
          // Remove automatic vote refresh - use optimistic updates instead
          // The UI is already updated optimistically, no need to refetch
          // await get().fetchVotesForRoom(currentRoom.id);
          
          return true;
        } catch (error) {
          console.error('Error recording vote:', error);
          return false;
        }
      },
      
      // Clear a vote for a specific suggestion
      clearVoteForSuggestion: async (suggestionId) => {
        const { currentRoom, auth } = get();
        if (!currentRoom.id || !auth.user || !suggestionId) return false;
        
        try {
          console.log(`Clearing vote for suggestion ${suggestionId} by user ${auth.user.id} in room ${currentRoom.id}`);
          
          // Find the vote
          const { data: existingVote, error: findError } = await supabase
            .from('food_votes')
            .select('id')
            .eq('suggestion_id', suggestionId)
            .eq('user_id', auth.user.id)
            .eq('room_id', currentRoom.id)
            .single();
            
          if (findError && findError.code !== 'PGRST116') {
            throw findError;
          }
          
          if (!existingVote) {
            console.log('No vote found to delete');
            return true; // Already deleted
          }
          
          // Delete the vote
          const { error: deleteError } = await supabase
            .from('food_votes')
            .delete()
            .eq('id', existingVote.id);
            
          if (deleteError) throw deleteError;
          
          console.log('Vote deleted successfully:', existingVote.id);
          
          // Remove automatic vote refresh - use optimistic updates instead
          // await get().fetchVotesForRoom(currentRoom.id);
          
          return true;
        } catch (error) {
          console.error('Error clearing vote:', error);
          return false;
        }
      },
      
      // Fetch all votes for a specific room
      fetchVotesForRoom: async (roomId) => {
        const { auth } = get();
        if (!roomId || !auth.user) return false;
        
        try {
          console.log(`Fetching votes for room ${roomId}`);
          
          // Fetch all votes for this room
          const { data: allVotes, error: votesError } = await supabase
            .from('food_votes')
            .select(`
              id,
              suggestion_id,
              user_id,
              reaction,
              profiles(id, username, avatar_url)
            `)
            .eq('room_id', roomId);
            
          if (votesError) {
            console.error('Error fetching votes:', votesError);
            return false;
          }
          
          console.log(`Found ${allVotes?.length || 0} votes for room ${roomId}`);
          
          // Get the current room safely
          const { currentRoom } = get();
          
          // If the current room ID doesn't match the requested roomId,
          // don't proceed with further processing (likely navigated away)
          if (currentRoom.id !== roomId) {
            console.log('Current room has changed, not processing vote data');
            return false;
          }
          
          // Create a mapping of votes: user_id -> suggestion_id
          const votesMap: Record<string, string> = {};
          
          // Also track votes by suggestion for UI purposes
          const votesBySuggestion: Record<string, { count: number, userIds: string[] }> = {};
          
          // Track user votes for the current user
          const userVotes: Record<string, string> = {};
          
          if (allVotes && allVotes.length > 0) {
            allVotes.forEach(vote => {
              // Basic vote mapping for room state
              votesMap[vote.user_id] = vote.suggestion_id;
              
              // Track votes by suggestion for UI
              if (!votesBySuggestion[vote.suggestion_id]) {
                votesBySuggestion[vote.suggestion_id] = {
                  count: 0,
                  userIds: []
                };
              }
              votesBySuggestion[vote.suggestion_id].count++;
              votesBySuggestion[vote.suggestion_id].userIds.push(vote.user_id);
              
              // If this is the current user's vote, add it to userVotes
              if (vote.user_id === auth.user.id) {
                userVotes[vote.suggestion_id] = vote.reaction;
              }
            });
          }
          
          // Update the vote count in suggestions
          const updatedSuggestions = currentRoom.suggestions.map(suggestion => {
            const voteInfo = votesBySuggestion[suggestion.id] || { count: 0, userIds: [] };
            return {
              ...suggestion,
              votes: voteInfo.count
            };
          });
          
          // Check if the room is expired
          const now = new Date();
          const expiresAt = new Date(currentRoom.expiresAt);
          const isExpired = expiresAt <= now;
          
          // Update the current room's isActive status in the store
          const updatedCurrentRoom = {
            ...currentRoom,
            suggestions: updatedSuggestions,
            votes: votesMap,
            isActive: !isExpired
          };
          
          // Save the updated state
          set({
            currentRoom: updatedCurrentRoom
          });
          
          // If the room is expired, update its status in the database and ensure we set isViewingCompletedRoom flag
          if (isExpired) {
            console.log('Room is expired, setting isViewingCompletedRoom flag');
            
            // Only update if needed
            if (!get().isViewingCompletedRoom) {
              set(state => ({
                ...state,
                isViewingCompletedRoom: true
              }));
            }
            
            // Make vote data available via global state for easier access
            if (window) {
              console.log('Storing vote data in window global state');
              // @ts-ignore - Adding dynamic property to window
              window.__tabletalk_state = {
                ...(window.__tabletalk_state || {}),
                votesMap,
                userVotes,
                votesBySuggestion,
                roomExpired: isExpired
              };
            }
          }
          
          console.log('Vote data updated:', {
            votesCount: allVotes?.length || 0,
            votesByUser: Object.keys(votesMap).length,
            votesBySuggestion: Object.keys(votesBySuggestion).length,
            isExpired
          });
          
          return true;
        } catch (error) {
          console.error('Error fetching votes:', error);
          return false;
        }
      },
      
      sendMessage: async (roomId: string, text: string) => {
        const { auth, currentRoom } = get();
        if (!auth.user || !roomId || !text.trim()) return false;

        try {
          // Send message to Supabase
          const { data: message, error } = await supabase
            .from('messages')
            .insert({
              room_id: roomId,
              profile_id: auth.user.id,
              text: text.trim()
            })
            .select(`
              id,
              text,
              created_at,
              profiles!inner(id, username, avatar_url)
            `)
            .single();

          if (error) throw error;

          // Add message to local state
          const newMessage = {
            id: message.id,
            userId: auth.user.id,
            userName: auth.user.username || 'Unknown',
            text: message.text,
            timestamp: message.created_at
          };

          set({
            currentRoom: {
              ...currentRoom,
              messages: [...currentRoom.messages, newMessage]
            }
          });

                    return true;
        } catch (error) {
          console.error('Error sending message:', error);
          return false;
        }
      },

      addMessage: async (text: string) => {
        const { currentRoom } = get();
        if (!currentRoom.id || !text.trim()) return false;
        
        return await get().sendMessage(currentRoom.id, text);
      },

      loadMessages: async (roomId: string) => {
        const { auth, currentRoom } = get();
        if (!auth.user || !roomId) return false;

        try {
          const { data: messages, error } = await supabase
            .from('messages')
            .select(`
              id,
              text,
              created_at,
              profile_id,
              profiles!inner(id, username, avatar_url)
            `)
            .eq('room_id', roomId)
            .order('created_at', { ascending: true });

          if (error) throw error;

          // Transform messages to match the expected format
          const formattedMessages = (messages || []).map(msg => ({
            id: msg.id,
            userId: msg.profile_id,
            userName: msg.profiles.username || 'Unknown',
            text: msg.text,
            timestamp: msg.created_at
          }));

          // Update current room with messages if it's the same room
          if (currentRoom.id === roomId) {
            set({
              currentRoom: {
                ...currentRoom,
                messages: formattedMessages
              }
            });
          }

          return true;
        } catch (error) {
          console.error('Error loading messages:', error);
          return false;
        }
      },

      recordVotingResult: async () => {
        // Implementation will be added later
        return Promise.resolve(false);
      },
      
      removeRoom: async () => {
        // Implementation will be added later
        return Promise.resolve(false);
      }
    }),
    {
      name: 'tabletalk-storage',
      partialize: (state) => ({
        activeTab: state.activeTab,
        currentRoom: state.currentRoom,
        isViewingCompletedRoom: state.isViewingCompletedRoom,
      }),
    }
  )
);