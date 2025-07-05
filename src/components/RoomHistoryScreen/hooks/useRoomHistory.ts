import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAppStore } from '../../../lib/store';
import { RoomHistoryItem } from '../types';

export function useRoomHistory() {
  const { auth: { user } } = useAppStore();
  const [roomHistory, setRoomHistory] = useState<RoomHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoomHistory = async () => {
    if (!user) return;
    
    setIsLoading(true);
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
        
      if (roomsError) throw roomsError;
      
      if (!roomsData || roomsData.length === 0) {
        setRoomHistory([]);
        return;
      }
      
      // Get voting results for all these rooms
      const roomIds = roomsData.map(item => item.room_id);
      const { data: votingResults, error: votingError } = await supabase
        .from('voting_results')
        .select(`
          room_id,
          suggestion_id,
          winning_option_id,
          votes_count,
          winning_option:suggestion_options!voting_results_winning_option_id_fkey (
            id,
            text
          )
        `)
        .in('room_id', roomIds);
        
      if (votingError) {
        console.warn('Error loading voting results:', votingError);
        // Continue without voting results rather than failing completely
      }
      
      // Combine the data
      const formattedHistory = roomsData.map(item => ({
        id: `${item.room_id}-${user.id}`, // Create a unique ID for the history entry
        joined_at: item.joined_at,
        room_id: item.room_id,
        rooms: {
          ...item.rooms,
          voting_results: votingResults?.filter(vr => vr.room_id === item.room_id) || []
        }
      }));
      
      setRoomHistory(formattedHistory);
    } catch (err) {
      console.error('Error loading room history:', err);
      setError('Failed to load room history. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoomHistory();
  }, []);

  return { roomHistory, isLoading, error, refetch: loadRoomHistory };
} 