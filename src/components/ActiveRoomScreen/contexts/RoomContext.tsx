import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../../../lib/store';
import { handleExpiredRoom } from '../utils/expiredRoomHandler';
import { supabase } from '../../../lib/supabase';

// Room context type definitions
interface RoomContextType {
  isLoading: boolean;
  error: string | null;
  roomName: string;
  participantCount: number;
  roomExpired: boolean;
  remainingTime: number;
  phase: 'suggestion' | 'discussion' | 'voting' | 'results';
  setRoomName: (name: string) => void;
  setPhase: (phase: 'suggestion' | 'discussion' | 'voting' | 'results') => void;
  voteForSuggestion: (suggestionId: string, reaction: 'love' | 'like' | 'neutral' | 'dislike') => Promise<boolean>;
}

// Default context values
const defaultContextValue: RoomContextType = {
  isLoading: true,
  error: null,
  roomName: '',
  participantCount: 0,
  roomExpired: false,
  remainingTime: 0,
  phase: 'suggestion',
  setRoomName: () => {},
  setPhase: () => {},
  voteForSuggestion: async () => false,
};

// Create the context
export const RoomContext = createContext<RoomContextType>(defaultContextValue);

// Custom hook to use the room context
export const useRoomContext = () => useContext(RoomContext);

// Provider component
export const RoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { currentRoom } = useAppStore();
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomName, setRoomName] = useState('');
  const [participantCount, setParticipantCount] = useState(0);
  const [roomExpired, setRoomExpired] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [phase, setPhase] = useState<'suggestion' | 'discussion' | 'voting' | 'results'>('suggestion');
  
  // Flag to prevent multiple calls to handleExpiredRoom
  const [expiredRoomHandled, setExpiredRoomHandled] = useState(false);
  
  // Vote for a suggestion
  const voteForSuggestion = async (suggestionId: string, reaction: 'love' | 'like' | 'neutral' | 'dislike'): Promise<boolean> => {
    // Implement voting logic here
    console.log(`Voting for suggestion: ${suggestionId} with reaction: ${reaction}`);
    
    // In a real implementation, update the database and local state
    const { voteForSuggestion: recordVote } = useAppStore.getState();
    
    try {
      // Record the vote in Supabase
      const success = await recordVote(suggestionId, reaction);
      if (success) {
        console.log('Vote recorded successfully');
        // We don't need to manually update state here as it's handled in the store
        return true;
      } else {
        console.error('Failed to record vote');
        return false;
      }
    } catch (error) {
      console.error('Error recording vote:', error);
      return false;
    }
  };

  // Effect to load room when component mounts
  useEffect(() => {
    if (roomCode && !currentRoom?.id) {
      setIsLoading(true);
      
      // Load room data using getState to avoid function dependency
      const loadRoom = async () => {
        try {
          const { joinRoom } = useAppStore.getState();
          await joinRoom(roomCode);
          setIsLoading(false);
        } catch (err) {
          setError('Failed to load room data');
          setIsLoading(false);
        }
      };
      
      loadRoom();
    }
  }, [roomCode, currentRoom?.id]); // Only depend on primitives

  // Effect to update local state when currentRoom changes
  useEffect(() => {
    if (currentRoom) {
      setRoomName(currentRoom.name || '');
      setParticipantCount(currentRoom.participants?.length || 0);
      
      // Only run expiry check if room is marked as active to prevent unnecessary processing
      if (currentRoom.isActive !== false) {
        // Check if the room is expired
        const expiresAt = new Date(currentRoom.expiresAt);
        const now = new Date();
        const isExpired = expiresAt <= now;
        
        // Update room expired state
        setRoomExpired(isExpired);
        
        // If the room is expired and hasn't been handled yet, handle it
        if (isExpired && currentRoom.id && !expiredRoomHandled) {
          console.log('Room expired detected, handling...');
          setExpiredRoomHandled(true); // Prevent multiple calls
          
          // Update room status in the database only
          const updateRoomStatus = async () => {
            try {
              const { error } = await supabase
                .from('rooms')
                .update({ is_active: false })
                .eq('id', currentRoom.id);
                
              if (error) {
                console.error('Error updating room status:', error);
              }
            } catch (err) {
              console.error('Exception updating room status:', err);
            }
          };
          
          updateRoomStatus();
          handleExpiredRoom(currentRoom.id);
        }
      } else {
        // Room is already inactive, just set the expired state
        setRoomExpired(true);
      }
      
      // Start an interval to update the remaining time (only if room is active)
      if (currentRoom.isActive !== false) {
        const timer = setInterval(() => {
          const now = new Date();
          const expiresAt = new Date(currentRoom.expiresAt);
          
          if (now >= expiresAt) {
            // Room has expired
            setRoomExpired(true);
            setRemainingTime(0);
            clearInterval(timer);
            
            // Don't handle expiry here since it's handled above to prevent duplicate calls
          } else {
            // Room is still active
            const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
            setRemainingTime(timeRemaining);
          }
        }, 1000);
        
        return () => clearInterval(timer);
      }
    }
  }, [currentRoom?.id, currentRoom?.expiresAt, currentRoom?.isActive, currentRoom?.name, currentRoom?.participants]);
  
  // Reset expired room handled flag when room ID changes
  useEffect(() => {
    setExpiredRoomHandled(false);
  }, [currentRoom?.id]);

  // Provide the context value
  const contextValue: RoomContextType = {
    isLoading,
    error,
    roomName,
    participantCount,
    roomExpired,
    remainingTime,
    phase,
    setRoomName,
    setPhase,
    voteForSuggestion
  };

  return (
    <RoomContext.Provider value={contextValue}>
      {children}
    </RoomContext.Provider>
  );
}; 