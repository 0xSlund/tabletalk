import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAppStore } from '../../../lib/store';
import { RoomHistoryItem } from '../types';

// Simple in-memory cache for room history data
const roomHistoryCache = new Map<string, { data: RoomHistoryItem[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useRoomHistory() {
  const { auth: { user } } = useAppStore();
  const [roomHistory, setRoomHistory] = useState<RoomHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      console.log('Using cached room history data');
      setRoomHistory(cached.data);
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
      // Get all rooms the user has participated in via room_participants
      const { data: roomsData, error: roomsError } = await supabase
        .from('room_participants')
        .select(`
          joined_at,
          room_id,
          rooms:room_id (
            id,
            name,
            code,
            created_at,
            expires_at
          )
        `)
        .eq('profile_id', user.id)
        .order('joined_at', { ascending: false });
        
      if (roomsError) {
        console.error('Error fetching rooms:', roomsError);
        throw roomsError;
      }
      
      if (!mountedRef.current) return;
      
      if (!roomsData || roomsData.length === 0) {
        console.log('No room history found for user');
        setRoomHistory([]);
        setIsLoading(false);
        return;
      }
      
      // Get food votes for all these rooms to determine if they have results
      const roomIds = roomsData.map(item => item.room_id);
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
        console.log('Processing food votes for room history:', foodVotes.length, 'votes found');
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
         
        console.log('Voting results by room:', Object.keys(votingResultsByRoom).length, 'rooms have results');
      }
      
      // Combine the data
      const formattedHistory = roomsData
        .filter(item => item.rooms) // Filter out items with null rooms
        .map(item => ({
          id: `${item.room_id}-${user.id}`, // Create a unique ID for the history entry
          joined_at: item.joined_at,
          room_id: item.room_id,
          rooms: {
            ...item.rooms!,
            voting_results: votingResultsByRoom[item.room_id] || []
          }
        }));
      
      const formattedData = formattedHistory as unknown as RoomHistoryItem[];
      
      if (!mountedRef.current) return;
      
      setRoomHistory(formattedData);
      
      // Cache the results
      roomHistoryCache.set(cacheKey, { 
        data: formattedData, 
        timestamp: Date.now() 
      });
      
    } catch (err) {
      if (!mountedRef.current) return; // Don't set error if component unmounted
      console.error('Error loading room history:', err);
      setError('Failed to load room history. Please try again later.');
      setRoomHistory([]); // Set empty array on error
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

  return { roomHistory, isLoading, error, refetch: loadRoomHistory };
} 