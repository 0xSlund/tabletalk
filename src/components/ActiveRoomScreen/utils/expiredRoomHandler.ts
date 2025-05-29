import { supabase } from '../../../lib/supabase';
import { useAppStore } from '../../../lib/store';

/**
 * A utility function to properly handle data loading for expired rooms,
 * ensuring votes are loaded and the winners podium is shown.
 */
export const handleExpiredRoom = async (roomId: string): Promise<boolean> => {
  if (!roomId) {
    console.error('No room ID provided to handleExpiredRoom');
    return false;
  }

  try {
    console.log('Handling expired room:', roomId);
    
    // Get the current user
    const auth = useAppStore.getState().auth;
    if (!auth.user) {
      console.error('No authenticated user found');
      return false;
    }
    
    // Make sure we have the current room data
    const currentRoom = useAppStore.getState().currentRoom;
    if (!currentRoom || !currentRoom.id) {
      console.error('Current room data not available');
      return false;
    }
    
    // Fetch latest suggestions for this room to ensure we have the complete data
    const { data: suggestions, error: suggestionsError } = await supabase
      .from('food_suggestions')
      .select(`
        id,
        name,
        emoji,
        description,
        created_by,
        created_at,
        profiles(id, username, avatar_url)
      `)
      .eq('room_id', roomId);
    
    if (suggestionsError) {
      console.error('Error fetching suggestions for expired room:', suggestionsError);
      // Continue anyway, we might have suggestions in currentRoom
    }
    
    // Process and format suggestions
    const formattedSuggestions = suggestions?.map(s => ({
      id: s.id,
      name: s.name || 'Unnamed Suggestion',
      emoji: s.emoji || '🍽️',
      description: s.description || '',
      author: s.profiles?.username || 'Unknown',
      timestamp: s.created_at,
      votes: 0 // Will be updated when we process votes
    })) || [];
    
    // 1. Fetch all votes for this room to ensure we have the latest data
    const { data: allVotes, error: votesError } = await supabase
      .from('food_votes')
      .select(`
        id,
        suggestion_id,
        user_id,
        reaction,
        room_id,
        profiles(id, username, avatar_url)
      `)
      .eq('room_id', roomId);
      
    if (votesError) {
      console.error('Error fetching votes for expired room:', votesError);
      // Continue anyway, we might not have votes
    }
    
    console.log('Fetched votes for expired room:', allVotes);
    
    // 2. Create vote mappings
    const votesMap: Record<string, string> = {};
    const userVotesReactions: Record<string, string> = {};
    const otherUserVotesData: Record<string, { reaction: string, name: string }> = {};
    
    if (allVotes && allVotes.length > 0) {
      allVotes.forEach(vote => {
        // Basic vote mapping (user_id -> suggestion_id)
        votesMap[vote.user_id] = vote.suggestion_id;
        
        // If this is the current user's vote, add it to userVotesReactions
        if (vote.user_id === auth.user.id) {
          userVotesReactions[vote.suggestion_id] = vote.reaction;
        } else {
          // Add to other users' votes
          otherUserVotesData[vote.user_id] = {
            reaction: vote.reaction,
            name: vote.profiles ? (vote.profiles as any).username || 'User' : 'User'
          };
        }
      });
    }
    
    // Merge current room's suggestions with the ones we just fetched
    let mergedSuggestions = [...formattedSuggestions];
    
    // If we have suggestions in the current room, merge them
    if (currentRoom.suggestions && currentRoom.suggestions.length > 0) {
      // Map to keep track of suggestions we've already included
      const includedSuggestionIds = new Set(formattedSuggestions.map(s => s.id));
      
      // Add any suggestions from currentRoom that we don't already have
      currentRoom.suggestions.forEach(s => {
        if (!includedSuggestionIds.has(s.id)) {
          mergedSuggestions.push({
            id: s.id,
            name: s.name || s.text || 'Unnamed Suggestion',
            emoji: s.emoji || '🍽️',
            description: s.description || '',
            author: s.author || 'Unknown',
            timestamp: s.timestamp || new Date().toISOString(),
            votes: 0
          });
        }
      });
    }
    
    // 3. Update the store with the latest room data
    useAppStore.setState({
      currentRoom: {
        ...currentRoom,
        suggestions: mergedSuggestions,
        votes: votesMap,
        isActive: false  // Explicitly set isActive to false for expired rooms
      },
      // Force the viewing completed room state to true to trigger the podium display
      isViewingCompletedRoom: true,
      // Ensure we're in the active-room tab, not the result tab
      activeTab: 'active-room'
    });
    
    // 4. Directly update UI-related states in window's global state for components to access
    // This helps components immediately show the right UI without waiting for re-renders
    
    // Determine if there are actually any votes cast
    const hasVotes = (allVotes && allVotes.length > 0) || Object.keys(userVotesReactions).length > 0;
    
    if (window) {
      // @ts-ignore - Adding dynamic properties to window for components to access
      window.__tabletalk_state = {
        ...(window.__tabletalk_state || {}),
        showVotingResults: true,
        showOlympicResults: true,
        userVotesReactions,
        otherUserVotesData,
        votesMap,
        roomExpired: true,
        // Only set noVotes to true if there are actually no votes
        noVotes: !hasVotes,
        suggestions: mergedSuggestions
      };
    }
    
    // 5. Log detailed information for debugging
    console.log('Updated expired room data:', {
      votesMap,
      userVotesReactions,
      otherUserVotesData,
      totalVotes: allVotes?.length || 0,
      hasVotes,
      isViewingCompletedRoom: true,
      suggestions: mergedSuggestions
    });
    
    return true;
  } catch (error) {
    console.error('Error handling expired room:', error);
    return false;
  }
}; 