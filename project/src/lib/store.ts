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
  winningOptions?: Record<string, {
    optionId: string;
    text: string;
    votes: number;
  }>;
}

interface AuthState {
  user: Profile | null;
  session: any | null;
  loading: boolean;
}

interface AppState {
  activeTab: 'home' | 'create' | 'join' | 'trending' | 'quick-decision' | 'explore-cuisines' | 'profile' | 'active-room' | 'result' | 'security' | 'history' | 'dietary' | 'favorites';
  recentRooms: RecentRoom[];
  currentRoom: ActiveRoom;
  auth: AuthState;
  setActiveTab: (tab: AppState['activeTab']) => void;
  updateRoom: (room: ActiveRoom) => void;
  setUser: (user: Profile | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  fetchUserProfile: (userId: string) => Promise<void>;
  fetchRecentRooms: () => Promise<void>;
  fetchRoomHistory: () => Promise<void>;
  signOut: () => Promise<void>;
  createRoom: (roomName: string, timerDuration: number) => Promise<string | null>;
  joinRoom: (roomCode: string) => Promise<boolean>;
  addSuggestion: (roomId: string, text: string, options: string[]) => Promise<boolean>;
  voteForOption: (roomId: string, suggestionId: string, optionId: string) => Promise<boolean>;
  sendMessage: (roomId: string, text: string) => Promise<boolean>;
  recordVotingResult: (roomId: string, suggestionId: string, winningOptionId: string, votesCount: number) => Promise<boolean>;
  removeRoom: (roomId: string) => Promise<boolean>;
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
        isActive: true
      },
      auth: {
        user: null,
        session: null,
        loading: true
      },
      setActiveTab: (tab) => set({ activeTab: tab }),
      updateRoom: (room) => set({ currentRoom: room }),
      setUser: (user) => set((state) => ({ auth: { ...state.auth, user } })),
      setSession: (session) => set((state) => ({ auth: { ...state.auth, session } })),
      setLoading: (loading) => set((state) => ({ auth: { ...state.auth, loading } })),
      
      fetchUserProfile: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (error) {
            throw error;
          }
          
          if (data) {
            set((state) => ({ auth: { ...state.auth, user: data as Profile } }));
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      },
      
      fetchRecentRooms: async () => {
        const { auth } = get();
        if (!auth.user) return;
        
        try {
          // Get rooms where the user is a participant within the last week
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          const { data: participations, error: participationsError } = await supabase
            .from('room_participants')
            .select('room_id, is_host, joined_at')
            .eq('profile_id', auth.user.id)
            .gte('joined_at', oneWeekAgo.toISOString());
            
          if (participationsError) {
            console.error('Error fetching participations:', participationsError);
            return;
          }
          
          if (!participations || participations.length === 0) {
            set({ recentRooms: [] });
            return;
          }
          
          const roomIds = participations.map(p => p.room_id);
          
          // Get room details
          const { data: rooms, error: roomsError } = await supabase
            .from('rooms')
            .select(`
              id,
              name,
              code,
              created_at,
              expires_at,
              room_participants (id),
              voting_results (
                id,
                suggestion_id,
                winning_option_id,
                votes_count,
                suggestion_options (id, text)
              )
            `)
            .in('id', roomIds)
            .order('created_at', { ascending: false });
            
          if (roomsError) {
            console.error('Error fetching rooms:', roomsError);
            return;
          }
          
          if (rooms) {
            const formattedRooms = rooms.map(room => {
              const now = new Date();
              const expiresAt = new Date(room.expires_at);
              const isActive = expiresAt > now;
              
              let winningChoice;
              if (room.voting_results && room.voting_results.length > 0) {
                const latestResult = room.voting_results[0];
                winningChoice = latestResult.suggestion_options?.text;
              }
              
              return {
                id: room.id,
                name: room.name,
                participants: room.room_participants?.length || 0,
                lastActive: room.created_at,
                isActive,
                expiresAt: room.expires_at,
                winningChoice,
                code: room.code
              };
            });
            
            set({ recentRooms: formattedRooms });
          }
        } catch (error) {
          console.error('Error fetching recent rooms:', error);
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
      
      createRoom: async () => {
        // Implementation will be added later
        return Promise.resolve(null);
      },
      
      joinRoom: async () => {
        // Implementation will be added later
        return Promise.resolve(false);
      },
      
      addSuggestion: async () => {
        // Implementation will be added later
        return Promise.resolve(false);
      },
      
      voteForOption: async () => {
        // Implementation will be added later
        return Promise.resolve(false);
      },
      
      sendMessage: async () => {
        // Implementation will be added later
        return Promise.resolve(false);
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
      }),
    }
  )
);