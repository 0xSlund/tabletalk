import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAppStore } from '../../../lib/store';
import { RoomHistoryItem } from '../types';

// Simple in-memory cache for room history data
const roomHistoryCache = new Map<string, { data: RoomHistoryItem[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useRoomHistory() {
  const { auth: { user } } = useAppStore();
  const [rooms, setRooms] = useState<RoomHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const loadRoomHistory = useCallback(async (forceRefresh = false) => {
    if (!user || !mountedRef.current) {
      setIsLoading(false);
      return;
    }
    
    // Check cache first (unless force refresh)
    const cacheKey = user.id;
    const cached = roomHistoryCache.get(cacheKey);
    const now = Date.now();
    
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
      setRooms(cached.data);
      setIsLoading(false);
      setError(null);
      return;
    }
    
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);
    
    try {
      setIsLoading(true);
      setError(null);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: roomParticipants, error } = await supabase
        .from('room_participants')
        .select(`
          room_id,
          joined_at,
          rooms (
            id,
            name,
            code,
            created_at,
            expires_at
          )
        `)
        .eq('profile_id', user.id)
        .gte('joined_at', thirtyDaysAgo.toISOString())
        .order('joined_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching rooms:', error);
        throw error;
      }

      // Filter out participants without valid rooms
      const validRoomParticipants = roomParticipants.filter(rp => rp.rooms && rp.rooms.id);
        
      if (!mountedRef.current) return;
      
      if (validRoomParticipants.length === 0) {
        setRooms([]);
        setHasMore(false);
        setIsLoading(false);
        return;
      }
      
      // Get room IDs for additional queries
      const roomIds = validRoomParticipants.map(rp => rp.rooms.id);
      
      // Get participant counts for each room
      const { data: participantCounts } = await supabase
        .from('room_participants')
        .select('room_id')
        .in('room_id', roomIds);
      
      // Count participants per room
      const participantCountMap: Record<string, number> = {};
      if (participantCounts) {
        participantCounts.forEach(p => {
          participantCountMap[p.room_id] = (participantCountMap[p.room_id] || 0) + 1;
        });
      }
      
      // Get food votes for all these rooms to determine if they have results
      const { data: foodVotes, error: votesError } = await supabase
        .from('food_votes')
        .select(`
          room_id,
          suggestion_id,
          reaction,
          food_suggestions!inner (
            id,
            name
          )
        `)
        .in('room_id', roomIds);
        
      if (votesError) {
        console.warn('Error loading food votes:', votesError);
        // Continue without voting results rather than failing completely
      }
      
      if (!mountedRef.current) return;
      
      // Process votes to create voting results format
      const votingResultsByRoom: Record<string, any[]> = {};
      if (foodVotes && foodVotes.length > 0) {
        // Group votes by room and count them
        const votesByRoom = foodVotes.reduce((acc, vote) => {
          if (!acc[vote.room_id]) acc[vote.room_id] = {};
          if (!acc[vote.room_id][vote.suggestion_id]) {
            acc[vote.room_id][vote.suggestion_id] = {
              suggestion_id: vote.suggestion_id,
              suggestion_name: (vote.food_suggestions as any).name,
              votes: []
            };
          }
          acc[vote.room_id][vote.suggestion_id].votes.push(vote.reaction);
          return acc;
        }, {} as Record<string, Record<string, any>>);
        
        // Convert to voting results format for each room
        Object.keys(votesByRoom).forEach(roomId => {
          const roomVotes = Object.values(votesByRoom[roomId]);
          if (roomVotes.length > 0) {
            // Find the suggestion with the most votes (simple winner determination)
            const winner = roomVotes.reduce((best, current) => 
              current.votes.length > best.votes.length ? current : best
            );
            
            votingResultsByRoom[roomId] = [{
              room_id: roomId,
              suggestion_id: winner.suggestion_id,
              winning_option_id: winner.suggestion_id,
              votes_count: winner.votes.length,
              winning_option: {
                id: winner.suggestion_id,
                text: winner.suggestion_name
              }
            }];
          }
        });
      }
      
      // Format rooms for history display
      const formattedHistory = validRoomParticipants.map(rp => {
        const room = rp.rooms;
        
        // Format createdAt for display
        const createdDate = new Date(room.created_at);
        const formattedDate = createdDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: createdDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
        
        return {
          id: `${room.id}-${user.id}`, // Create a unique ID for the history entry
          joined_at: rp.joined_at,
          room_id: room.id,
          rooms: {
            id: room.id,
            name: room.name,
            code: room.code,
            created_at: room.created_at,
            expires_at: room.expires_at,
            voting_results: votingResultsByRoom[room.id] || [],
            participants: participantCountMap[room.id] || 1,
            createdAt: formattedDate
          }
        };
      });
      
      if (!mountedRef.current) return;
      
      setRooms(formattedHistory);
      setHasMore(formattedHistory.length === 20); // Assuming 20 is the limit for now
      
      // Cache the results
      roomHistoryCache.set(cacheKey, { 
        data: formattedHistory, 
        timestamp: Date.now() 
      });
      
    } catch (err) {
      if (!mountedRef.current) return; // Don't set error if component unmounted
      console.error('Error loading room history:', err);
      setError('Failed to load room history. Please try again later.');
      setRooms([]); // Set empty array on error
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    loadRoomHistory();
  }, [loadRoomHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { rooms, isLoading, error, hasMore, refetch: loadRoomHistory };
} 