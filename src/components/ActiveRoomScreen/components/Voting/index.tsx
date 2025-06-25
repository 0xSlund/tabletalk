import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Vote, Crown, Award, Meh, Check, Clock, Users, BarChart4, Heart, Star, XCircle, ChevronLeft, ChevronRight, Medal, Trophy } from 'lucide-react';
import { useAppStore } from '../../../../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomContext } from '../../contexts/RoomContext';
import OlympicResults from './OlympicResults';
import { NoVotesExpiredModal } from "../NoVotesExpiredModal";
import { NoOptionsExpiredModal } from "../NoOptionsExpiredModal";
import { WinnersPodiumModal } from "../WinnersPodiumModal";
import { supabase } from '../../../../lib/supabase';

// Define the structure for food suggestions
interface FoodSuggestion {
  id: string;
  name: string;
  emoji: string;
  description: string;
  votes?: number;
  author?: string;
  timestamp?: string;
}

// Reaction types
type ReactionType = 'love' | 'like' | 'neutral' | 'dislike';

interface VoteInfo {
  suggestionId: string;
  reaction: ReactionType;
}

// Extend the current store types for the properties we need
interface EnhancedRoom {
  suggestions: FoodSuggestion[];
  votes?: Record<string, string>;
}

interface VotingProps {
  roomExpired: boolean;
}

export const Voting: React.FC<VotingProps> = ({ roomExpired }) => {
  const { currentRoom } = useAppStore();
  // Access the auth user separately to avoid type errors
  const user = useAppStore.getState().auth.user;
  // Check if we're viewing a completed room from history
  const isViewingCompletedRoom = useAppStore.getState().isViewingCompletedRoom;
  const { voteForSuggestion } = useRoomContext();
  const [selectedReaction, setSelectedReaction] = useState<ReactionType>('like');
  const [pendingVote, setPendingVote] = useState<VoteInfo | null>(null);
  const [animateConfirm, setAnimateConfirm] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<Record<string, ReactionType>>({});
  const [showResults, setShowResults] = useState(isViewingCompletedRoom || false);
  
  // New state for Olympic results popup
  const [showOlympicResults, setShowOlympicResults] = useState(false);
  
  // New state for Winners Podium modal
  const [showWinnersPodiumModal, setShowWinnersPodiumModal] = useState(false);
  
  // New state for showing real-time vote progress after voting
  const [showVoteProgress, setShowVoteProgress] = useState(false);
  
  // Track if all users have voted in the room
  const [allMembersVoted, setAllMembersVoted] = useState(false);
  
  // State for the no votes expired modal
  const [showNoVotesModal, setShowNoVotesModal] = useState(false);
  
  // State for the no options expired modal
  const [showNoOptionsModal, setShowNoOptionsModal] = useState(false);
  
  // Dummy data for other users' votes - in a real app this would come from your store/database
  const [otherUserVotes, setOtherUserVotes] = useState<Record<string, {reaction: ReactionType, name: string}>>({
    'user1': { reaction: 'love', name: 'Maria' },
    'user2': { reaction: 'like', name: 'John' },
    'user3': { reaction: 'neutral', name: 'Alex' },
    'user4': { reaction: 'dislike', name: 'Taylor' },
  });
  
  // Add a state to track vote mappings between users and suggestions
  const [voteMapping, setVoteMapping] = useState<Record<string, string>>({});
  
  // Add a state for rooms that expired with no votes
  const [isNoVotesState, setIsNoVotesState] = useState(false);
  const [hasInitializedVotes, setHasInitializedVotes] = useState(false);
  
  // Safely cast current room to our enhanced type to prevent TypeScript errors
  const enhancedRoom = currentRoom as unknown as EnhancedRoom;
  
  // Use room suggestions instead of hardcoded ones
  const suggestions = enhancedRoom?.suggestions || [] as FoodSuggestion[];
  
  const votes = enhancedRoom?.votes || {};
  
  // Check if the current user has already voted on all suggestions
  const hasVotedOnAll = suggestions.length > 0 && Object.keys(userVotes).length === suggestions.length;
  
  // Store the hasVotedOnAll state in the global store for other components to access
  useEffect(() => {
    if (hasVotedOnAll) {
      useAppStore.setState(state => ({ ...state, hasVotedOnAll: true }));
    } else {
      useAppStore.setState(state => ({ ...state, hasVotedOnAll: false }));
    }
  }, [hasVotedOnAll]);
  
  // Set showResults when user has voted on all suggestions
  useEffect(() => {
    if (hasVotedOnAll && !showOlympicResults) {
      setShowResults(true);
    }
  }, [userVotes, hasVotedOnAll, showOlympicResults]);
  
  // This single, consolidated useEffect will handle all end-of-room scenarios.
  useEffect(() => {
    // Only run this logic if the room has actually expired.
    if (roomExpired) {
      console.log('Room expired. Determining which final view to show...');
      
      // Always switch to the results view layout.
      setShowResults(true);

      const hasSuggestions = suggestions && suggestions.length > 0;
      // Use the length of the keys of the votes object as a reliable check.
      const hasVotes = votes && Object.keys(votes).length > 0;

      // Use a short delay to prevent modals from flashing during render.
      setTimeout(() => {
        if (!hasSuggestions) {
          // SCENARIO 1: Room expired with NO suggestions.
          console.log('Showing "No Options" modal.');
          setShowNoOptionsModal(true);
        } else if (!hasVotes) {
          // SCENARIO 2: Room expired with suggestions but NO votes.
          console.log('Showing "No Votes" modal.');
          setIsNoVotesState(true); // Flag for the OlympicResults component.
          setShowNoVotesModal(true);
        } else {
          // SCENARIO 3: Room expired with both suggestions and votes.
          console.log('Showing "Winners Podium" (OlympicResults).');
          setShowOlympicResults(true);
        }
      }, 500);
    }
  }, [roomExpired, suggestions.length, votes]); // Dependencies are now clean and reactive.
  
  // Initialize user votes from existing votes in the room
  useEffect(() => {
    // First, try to restore votes from global state
    // @ts-ignore - Accessing dynamic property
    const globalState = window?.__tabletalk_state || {};
    let hasRestoredFromGlobal = false;
    
    // If we have votes in the global state, use them first
    if (globalState.userVotes && Object.keys(globalState.userVotes).length > 0) {
      console.log('Restoring votes from global state:', globalState.userVotes);
      
      // Convert reactions to our ReactionType
      const typedReactions: Record<string, ReactionType> = {};
      Object.entries(globalState.userVotes).forEach(([suggestionId, reaction]) => {
        typedReactions[suggestionId] = reaction as ReactionType;
      });
      
      // Set the votes in our local state
      setUserVotes(typedReactions);
      hasRestoredFromGlobal = true;
    }
    
    // Get existing votes
    const existingVotes = currentRoom?.votes || {};
    
    // Map votes to the suggestions - only initialize once per room
    if (user && currentRoom?.id && !hasInitializedVotes) {
      setHasInitializedVotes(true);
      console.log('Initializing votes for room:', currentRoom.id, 'with votes map:', existingVotes);
      
      const userVoteMapping: Record<string, ReactionType> = {};
      const voteMapData: Record<string, string> = {};
      const otherUserVotesData: Record<string, {reaction: ReactionType, name: string}> = { ...otherUserVotes };
      
      // Get all food votes for this room to get reactions
      const fetchVotes = async () => {
        try {
          console.log('Fetching votes for room:', currentRoom.id);
          
          const { data: foodVotes, error } = await supabase
            .from('food_votes')
            .select(`
              id,
              suggestion_id,
              user_id,
              reaction,
              profiles(id, username, avatar_url)
            `)
            .eq('room_id', currentRoom.id);
            
          if (error) throw error;
          
          if (foodVotes && foodVotes.length > 0) {
            console.log('Found food votes:', foodVotes.length, foodVotes);
            
            // Process food votes
            foodVotes.forEach(vote => {
              // Add to vote mapping
              voteMapData[vote.user_id] = vote.suggestion_id;
              
              // Add to other users votes
              otherUserVotesData[vote.user_id] = {
                reaction: vote.reaction as ReactionType,
                name: vote.profiles ? (vote.profiles as any).username || 'User' : 'User'
              };
              
              // If it's the current user's vote, add to userVotes
              if (user && vote.user_id === user.id) {
                userVoteMapping[vote.suggestion_id] = vote.reaction as ReactionType;
              }
            });
            
            console.log('Processed votes:', {
              voteMapping: voteMapData,
              otherUserVotes: otherUserVotesData,
              userVotes: userVoteMapping
            });
            
            // Update states
            setVoteMapping(voteMapData);
            setOtherUserVotes(otherUserVotesData);
            
            // Only update userVotes if we didn't already restore them from global state
            if (!hasRestoredFromGlobal && Object.keys(userVoteMapping).length > 0) {
              setUserVotes(userVoteMapping);
            }
            
            // Save votes to global state to persist across page navigations
            // @ts-ignore - Adding dynamic property to window
            window.__tabletalk_state = {
              ...(window.__tabletalk_state || {}),
              userVotes: hasRestoredFromGlobal ? globalState.userVotes : userVoteMapping,
              votesMap: voteMapData,
              otherUserVotesData: otherUserVotesData
            };
            
            // Force a recalculation of voteCounts
            calculateVoteCounts(voteMapData);
          } else {
            console.log('No food votes found for room:', currentRoom.id);
            
            // If no votes found, ensure we get the votes from the store using getState
            const { fetchVotesForRoom } = useAppStore.getState();
            await fetchVotesForRoom(currentRoom.id);
          }
        } catch (err) {
          console.error('Error fetching votes:', err);
        }
      };
      
      fetchVotes();
    }
  }, [currentRoom?.id, user?.id, hasInitializedVotes]); // Only depend on primitive values
  
  // Reset initialization flag when room changes
  useEffect(() => {
    setHasInitializedVotes(false);
  }, [currentRoom?.id]);
  
  // Calculate vote counts based on vote mappings - separate function for reuse
  const calculateVoteCounts = (voteMap: Record<string, string>) => {
    // Initialize counts for each suggestion
    const counts = suggestions.reduce((acc: Record<string, number>, suggestion) => {
      acc[suggestion.id] = 0;
      return acc;
    }, {});
    
    // Count votes based on the vote mapping
    Object.entries(voteMap).forEach(([userId, suggestionId]) => {
      if (counts[suggestionId] !== undefined) {
        counts[suggestionId]++;
      }
    });
    
    return counts;
  };
  
  // Get the total votes for each suggestion
  const voteCounts = calculateVoteCounts(voteMapping);
  
  // Calculate total votes for percentage
  const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
  
  // Sort suggestions by vote count
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const votesA = voteCounts[a.id] || 0;
    const votesB = voteCounts[b.id] || 0;
    return votesB - votesA;
  });
  
  // Find the winner(s)
  const maxVotes = Math.max(...Object.values(voteCounts), 0);
  const winners = sortedSuggestions.filter(s => (voteCounts[s.id] || 0) === maxVotes && maxVotes > 0);
  
  // Function to handle voting
  const handleVote = async (suggestionId: string, reaction: ReactionType) => {
    if (!user || !suggestionId || roomExpired) {
      if (roomExpired) {
        console.warn('Attempted to vote in an expired room.');
      }
      return;
    }
    
    setSelectedReaction(reaction);
    setPendingVote({
      suggestionId,
      reaction
    });
    setAnimateConfirm(true);
    
    // Save user's vote immediately to lock in the selection in the UI
    setUserVotes(prev => {
      const updatedVotes = {
        ...prev,
        [suggestionId]: reaction
      };
      
      // Save to global state for persistence across navigations
      // @ts-ignore - Accessing dynamic property
      window.__tabletalk_state = {
        ...(window.__tabletalk_state || {}),
        userVotes: updatedVotes
      };
      
      return updatedVotes;
    });
    
    // Properly connect the user's vote to the specific suggestion in the votes mapping
    if (user) {
      // Update vote mapping in the UI
      setVoteMapping(prev => ({
        ...prev,
        [user.id]: suggestionId
      }));
      
      // Update other user votes for display
      setOtherUserVotes(prev => ({
        ...prev,
        [user.id]: { reaction, name: user.username || 'You' }
      }));
    }
    
    // Show vote progress immediately after voting
    setShowVoteProgress(true);
    
    // Save the vote to the database
    try {
      console.log('Saving vote to database:', { suggestionId, reaction });
      const voteSuccess = await voteForSuggestion(suggestionId, reaction);
      
      if (!voteSuccess) {
        console.error('Failed to save vote to database');
        // Could add error feedback here
      } else {
        console.log('Vote saved successfully to database');
        // Don't refresh votes immediately - the UI is already updated optimistically
      }
    } catch (error) {
      console.error('Error saving vote:', error);
    }
    
    // Delay for animation effect before moving to next or showing results
    setTimeout(() => {
      setAnimateConfirm(false);
      setPendingVote(null);
      
      // After a while, hide the vote progress
      setTimeout(() => {
        setShowVoteProgress(false);
        
        // Move to next suggestion if not the last one
        if (currentIndex < suggestions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      }, 2000);
    }, 1000);
  };
  
  // Generate reaction-specific particle effects
  const ReactionParticles = ({ reaction }: { reaction: ReactionType }) => {
    // Number of particles to generate
    const particleCount = 20;
    
    // Different particle types based on reaction
    switch (reaction) {
      case 'love':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(particleCount)].map((_, i) => (
              <motion.div
                key={`heart-${i}`}
                className="absolute text-red-400 opacity-80 z-10"
                style={{
                  top: '50%',
                  left: '50%',
                  x: '-50%',
                  y: '-50%',
                }}
                animate={{
                  x: [`-50%`, `calc(-50% + ${(Math.random() - 0.5) * 300}px)`],
                  y: [`-50%`, `calc(-50% + ${(Math.random() - 0.8) * 300}px)`], // More upward
                  rotate: [0, Math.random() * 360],
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
              >
                <Heart size={Math.floor(Math.random() * 10) + 8} />
              </motion.div>
            ))}
          </div>
        );
      
      case 'like':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(particleCount)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute bg-emerald-400 rounded-full z-10"
                style={{
                  top: '50%',
                  left: '50%',
                  width: `${Math.random() * 5 + 3}px`,
                  height: `${Math.random() * 5 + 3}px`,
                }}
                animate={{
                  x: [`0px`, `${(Math.random() - 0.5) * 300}px`],
                  y: [`0px`, `${(Math.random() - 0.5) * 300}px`],
                  scale: [0, 1, 0],
                  opacity: [0, 0.9, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        );
      
      case 'neutral':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`wave-${i}`}
                className="absolute top-1/2 left-1/2 w-full h-full border-2 border-blue-300 rounded-full z-10"
                style={{
                  x: '-50%',
                  y: '-50%',
                }}
                animate={{
                  scale: [0, 2],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        );
      
      case 'dislike':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(particleCount)].map((_, i) => (
              <motion.div
                key={`dot-${i}`}
                className="absolute bg-gray-400 rounded-full z-10"
                style={{
                  top: '50%',
                  left: '50%',
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                }}
                animate={{
                  x: [`0px`, `${(Math.random() - 0.5) * 200}px`],
                  y: [`0px`, `${(Math.random() * 150) + 50}px`], // More downward
                  opacity: [0.8, 0],
                }}
                transition={{
                  duration: 1,
                  delay: Math.random() * 0.3,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Function to get the proper icon for a reaction
  const getReactionIcon = (type: ReactionType, size = 24) => {
    switch (type) {
      case 'love':
        return <Heart size={size} className="text-red-500" />;
      case 'like':
        return <ThumbsUp size={size} />;
      case 'neutral':
        return <Meh size={size} />;
      case 'dislike':
        return <ThumbsDown size={size} />;
      default:
        return <ThumbsUp size={size} />;
    }
  };
  
  // Function to get the color for a reaction
  const getReactionColor = (type: ReactionType) => {
    switch (type) {
      case 'love':
        return 'from-red-500 to-pink-500 text-white';
      case 'like':
        return 'from-emerald-500 to-teal-500 text-white';
      case 'neutral':
        return 'from-blue-400 to-blue-500 text-white';
      case 'dislike':
        return 'from-gray-500 to-gray-600 text-white';
      default:
        return 'from-emerald-500 to-teal-500 text-white';
    }
  };
  
  // Function to get the text for a reaction
  const getReactionText = (type: ReactionType) => {
    switch (type) {
      case 'love':
        return 'Love it!';
      case 'like':
        return 'Like it';
      case 'neutral':
        return 'It\'s okay';
      case 'dislike':
        return 'Not for me';
      default:
        return 'Like it';
    }
  };
  
  // Calculate reaction counts for the current suggestion
  const getReactionCounts = (suggestionId: string) => {
    // Initialize counts with zeros
    const counts = {
      love: 0,
      like: 0,
      neutral: 0,
      dislike: 0
    };
    
    // Count the user's vote for this suggestion
    if (userVotes[suggestionId]) {
      counts[userVotes[suggestionId]]++;
    }
    
    // Count other users' votes
    Object.entries(otherUserVotes).forEach(([userId, voteData]) => {
      // Skip the current user to avoid double-counting
      if (user && userId === user.id) return;
      
      // Check if this user voted for this suggestion using our vote mapping
      if (voteMapping[userId] === suggestionId) {
        counts[voteData.reaction]++;
      }
    });
    
    return counts;
  };
  
  // Add a new component for the View Results button 
  const ViewResultsButton = ({ onClick }: { onClick: () => void }) => {
    return (
      <motion.button
        onClick={onClick}
        className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl px-6 py-3 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <BarChart4 size={18} />
        <span>View Results</span>
      </motion.button>
    );
  };
  
  // If Olympic Results modal is shown, ensure it gets the right vote data
  useEffect(() => {
    if (showOlympicResults) {
      console.log('Olympic Results shown with:');
      console.log('- Sorted Suggestions:', sortedSuggestions);
      console.log('- Vote Counts:', voteCounts);
      console.log('- Total Votes:', totalVotes);
      console.log('- User Votes:', userVotes);
    }
  }, [showOlympicResults, voteCounts, totalVotes, sortedSuggestions, userVotes]);
  
  // Function to clear a user's vote for a specific suggestion
  const clearVote = async (suggestionId: string) => {
    if (!user || !suggestionId || !currentRoom.id) {
      console.error('Cannot clear vote: missing user, suggestion ID, or room ID');
      return false;
    }
    
    try {
      console.log('Clearing vote for suggestion:', suggestionId);
      
      // Use store method to clear vote
      const { clearVoteForSuggestion } = useAppStore.getState();
      const success = await clearVoteForSuggestion(suggestionId);
      
      if (!success) {
        console.error('Failed to clear vote from database');
        return false;
      }
      
      // Update local state
      setUserVotes(prev => {
        const newVotes = { ...prev };
        delete newVotes[suggestionId];
        
        // Update global state
        // @ts-ignore - Accessing dynamic property
        window.__tabletalk_state = {
          ...(window.__tabletalk_state || {}),
          userVotes: newVotes
        };
        
        return newVotes;
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing vote:', error);
      return false;
    }
  };
  
  // Function to handle reverting all votes and starting over
  const handleRevertVotes = async () => {
    // Only proceed if user has votes
    const userVoteIds = Object.keys(userVotes);
    if (userVoteIds.length === 0) {
      setShowResults(false);
      return;
    }
    
    // Show a loading state
    // Could add a toast notification here
    
    try {
      // Clear each vote one by one
      for (const suggestionId of userVoteIds) {
        await clearVote(suggestionId);
      }
      
      // Reset UI states to clear "Your vote has been recorded" message
      setShowVoteProgress(false);
      setAnimateConfirm(false);
      setPendingVote(null);
      
      // Switch back to voting view
      setShowResults(false);
      
      // Reset to first suggestion
      setCurrentIndex(0);
      
      // Could show a success message here
      
    } catch (error) {
      console.error('Error reverting votes:', error);
      // Could show an error message here
    }
  };
  
  // Set up a effect to check for votes from all users
  useEffect(() => {
    // Use the total number of participants who have voted as a proxy
    // for determining if everyone has voted on all options
    // This is a simplification - in a real app, you would need to track this properly
    const totalParticipants = Object.keys(otherUserVotes).length;
    const participantsWhoVoted = Object.keys(voteMapping).length;
    
    // If 2 or more people have voted and everyone has cast votes, set allMembersVoted to true
    if (totalParticipants >= 2 && participantsWhoVoted === totalParticipants) {
      setAllMembersVoted(true);
    }
  }, [otherUserVotes, voteMapping]);
  
  if (suggestions.length === 0) {
    return null; // Don't show anything if no suggestions
  }
  
  // Show results view if all votes are cast
  if (showResults) {
    return (
      <div className="w-full">
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg mr-3 shadow-sm">
              <BarChart4 className="text-white" size={22} />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Results</span>
              <h2 className="text-lg font-medium text-gray-700">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Voting Results</span>
              </h2>
            </div>
          </div>
      
          <div className="flex items-center bg-indigo-50 rounded-full px-3 py-1 text-sm text-indigo-700 border border-indigo-100">
            <Check size={16} className="mr-1" />
            <span>Room Completed</span>
          </div>
        </motion.div>
        
        {/* Show loading when waiting for modal to appear */}
        {((suggestions.length === 0 && roomExpired) || 
          (totalVotes === 0 && roomExpired && suggestions.length > 0)) ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-8 shadow-md text-center mb-6"
          >
            <Clock size={48} className="text-gray-400 mx-auto mb-3" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">Room Ended</h3>
            <p className="text-gray-500">
              Preparing room summary...
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Olympic Podium is now only displayed in the modal popup */}
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-gray-500 text-sm">
                <BarChart4 size={16} className="mr-1.5" />
                <span>Live Results</span>
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <Users size={16} className="mr-1.5" />
                <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
              </div>
            </div>
            
            {sortedSuggestions.map((suggestion, index) => {
              // Explicitly type as FoodSuggestion to avoid TypeScript errors
              const typedSuggestion = suggestion as FoodSuggestion;
              const voteCount = voteCounts[typedSuggestion.id] || 0;
              const votePercentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const userVoted = userVotes[typedSuggestion.id];
              const isWinner = winners.some(w => w.id === typedSuggestion.id) && maxVotes > 0;
              
              // Different styles based on position and voting status
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;
              
              // Position-specific colors (Olympic themed)
              const positionColors = isFirst 
                ? 'from-amber-500 to-yellow-400' // Gold
                : isSecond 
                  ? 'from-gray-400 to-gray-300' // Silver
                  : isThird 
                    ? 'from-amber-700 to-amber-500' // Bronze
                    : 'from-gray-300 to-gray-200'; // Others
              
              // User vote specific colors
              const userVoteColors = userVoted 
                ? userVoted === 'love' ? 'from-red-400 to-pink-500' 
                  : userVoted === 'like' ? 'from-emerald-400 to-teal-500'
                  : userVoted === 'neutral' ? 'from-blue-400 to-indigo-500'
                  : 'from-gray-400 to-gray-500'
                : positionColors;
              
              // Final gradient colors - prioritize user votes over position
              const gradientColors = userVoted ? userVoteColors : positionColors;
                  
              // Get reaction counts for this food item
              const reactionCounts = getReactionCounts(typedSuggestion.id);
              
              // Calculate total reactions for this food option
              const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
              
              return (
                <motion.div
                  key={typedSuggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`relative overflow-hidden rounded-xl border ${
                    userVoted 
                      ? userVoted === 'love' ? 'border-red-200 bg-red-50' :
                        userVoted === 'like' ? 'border-emerald-200 bg-emerald-50' :
                        userVoted === 'neutral' ? 'border-blue-200 bg-blue-50' : 
                        'border-gray-200 bg-gray-50'
                      : isFirst 
                        ? 'border-amber-200 bg-amber-50'
                        : isSecond
                          ? 'border-gray-200 bg-gray-50'
                          : isThird
                            ? 'border-amber-100 bg-amber-50/50'
                            : 'border-gray-200 bg-white'
                  } shadow-md hover:shadow-lg transition-all duration-300 mb-4`}
                >
                  {/* Position indicator for top 3 - moved to left side */}
                  {(isFirst || isSecond || isThird) && (
                    <div className={`absolute top-2 left-2 rounded-full w-6 h-6 flex items-center justify-center ${
                      isFirst ? 'bg-amber-400' : isSecond ? 'bg-gray-300' : 'bg-amber-600'
                    }`}>
                      <span className="text-white text-xs font-bold">
                        {isFirst ? '1' : isSecond ? '2' : '3'}
                      </span>
                    </div>
                  )}
                  
                  {/* Progress bar in background */}
                  <div 
                    className={`absolute left-0 bottom-0 h-full bg-gradient-to-r ${gradientColors} opacity-10 transition-all duration-700 ease-out`}
                    style={{ width: `${votePercentage}%` }}
                  />
                  
                  <div className="relative p-4">
                    <div className="flex justify-between items-center">
                      {/* Food item info - add left padding when there's a position indicator */}
                      <div className={`flex items-center ${(isFirst || isSecond || isThird) ? 'pl-6' : ''}`}>
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full mr-3 grid place-items-center ${
                          isFirst 
                            ? 'bg-gradient-to-br from-yellow-200 to-amber-300' 
                            : isSecond
                              ? 'bg-gradient-to-br from-gray-200 to-gray-300'
                              : isThird
                                ? 'bg-gradient-to-br from-amber-200 to-amber-300'
                                : userVoted
                                  ? userVoted === 'love' ? 'bg-gradient-to-br from-red-200 to-pink-200' :
                                    userVoted === 'like' ? 'bg-gradient-to-br from-emerald-200 to-teal-200' :
                                    userVoted === 'neutral' ? 'bg-gradient-to-br from-blue-200 to-indigo-200' : 
                                    'bg-gradient-to-br from-gray-200 to-gray-300'
                                  : 'bg-gradient-to-br from-indigo-100 to-purple-200'
                        }`}>
                          <span className="text-2xl">{typedSuggestion.emoji}</span>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className={`font-medium ${
                              isFirst ? 'text-amber-900' : 
                              isSecond ? 'text-gray-700' :
                              isThird ? 'text-amber-800' :
                              userVoted ? userVoted === 'love' ? 'text-red-800' :
                                         userVoted === 'like' ? 'text-emerald-800' :
                                         userVoted === 'neutral' ? 'text-blue-800' : 
                                         'text-gray-800'
                                      : 'text-indigo-800'
                            }`}>
                              {typedSuggestion.name}
                            </h3>
                            {isFirst && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ 
                                  type: "spring", 
                                  stiffness: 500, 
                                  damping: 15 
                                }}
                              >
                                <Crown size={16} className="ml-2 text-amber-500" />
                              </motion.div>
                            )}
                            {isSecond && (
                              <motion.div>
                                <Award size={16} className="ml-2 text-gray-500" />
                              </motion.div>
                            )}
                            {isThird && (
                              <motion.div>
                                <Award size={16} className="ml-2 text-amber-700" />
                              </motion.div>
                            )}
                          </div>
                          {typedSuggestion.description && (
                            <p className="text-xs text-gray-600 line-clamp-1">{typedSuggestion.description}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Replace percentage button with vote indicator */}
                      <div className="flex flex-col items-end">
                        {userVoted && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" 
                            style={{
                              backgroundColor: userVoted === 'love' ? '#FEE2E2' :
                                              userVoted === 'like' ? '#D1FAE5' :
                                              userVoted === 'neutral' ? '#DBEAFE' : '#F3F4F6',
                              color: userVoted === 'love' ? '#B91C1C' :
                                    userVoted === 'like' ? '#065F46' :
                                    userVoted === 'neutral' ? '#1E40AF' : '#4B5563'
                            }}
                          >
                            {getReactionIcon(userVoted, 12)}
                            <span>Your Vote</span>
                          </div>
                        )}
                        
                        {/* Display vote percentage as text */}
                        <div className="text-sm font-medium mt-1 text-gray-600">
                          {votePercentage}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Vote progress bar */}
                    <div className="mt-3 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full rounded-full bg-gradient-to-r ${gradientColors} relative`}
                        initial={{ width: 0 }}
                        animate={{ width: `${votePercentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      >
                        {votePercentage > 15 && (
                          <motion.div 
                            className="absolute right-1 top-0 bottom-0 flex items-center"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <motion.div 
                              className="h-1 w-1 rounded-full bg-white"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                    
                    {/* Reaction distribution - add extra details */}
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(reactionCounts).map(([reaction, count]) => {
                          if (count === 0) return null;
                          const reactionType = reaction as ReactionType;
                          const percentage = totalReactions > 0 ? Math.round((count / totalReactions) * 100) : 0;
                          
                          return (
                            <div 
                              key={reaction} 
                              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                              style={{ 
                                backgroundColor: reactionType === 'love' ? '#FEE2E2' :
                                                reactionType === 'like' ? '#D1FAE5' :
                                                reactionType === 'neutral' ? '#DBEAFE' : '#F3F4F6',
                                color: reactionType === 'love' ? '#B91C1C' :
                                        reactionType === 'like' ? '#065F46' :
                                        reactionType === 'neutral' ? '#1E40AF' : '#4B5563'
                              }}
                            >
                              {getReactionIcon(reactionType, 12)}
                              <span>{count} {percentage > 0 && `(${percentage}%)`}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            <div className="text-center mt-6 flex flex-col justify-center gap-4">
              <motion.button
                onClick={() => setShowWinnersPodiumModal(true)}
                className="py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 w-full"
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Trophy size={18} />
                View Winners Podium
              </motion.button>
              
              <motion.button
                onClick={handleRevertVotes}
                className={`py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg shadow-sm transition-all duration-300 flex items-center justify-center gap-2 w-full group relative ${
                  roomExpired || allMembersVoted || useAppStore.getState().hasVotedOnAll || isNoVotesState ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                }`}
                whileHover={roomExpired || allMembersVoted || useAppStore.getState().hasVotedOnAll || isNoVotesState ? {} : { y: -2, scale: 1.03 }}
                whileTap={roomExpired || allMembersVoted || useAppStore.getState().hasVotedOnAll || isNoVotesState ? {} : { scale: 0.97 }}
                disabled={roomExpired || allMembersVoted || useAppStore.getState().hasVotedOnAll || isNoVotesState}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                Change My Votes
                
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-48 pointer-events-none">
                  {roomExpired || allMembersVoted || useAppStore.getState().hasVotedOnAll || isNoVotesState ? 
                    "Voting has ended - can't change votes now" : 
                    "Clear your current votes and start over with new choices"}
                </div>
              </motion.button>
            </div>
          </div>
        )}
        
        {/* Olympic Results Modal */}
        <AnimatePresence>
          {showOlympicResults && (
            <OlympicResults 
              isOpen={showOlympicResults}
              onClose={() => setShowOlympicResults(false)}
              userVotes={userVotes}
              otherUserVotes={otherUserVotes}
              sortedSuggestions={sortedSuggestions}
              voteCounts={voteCounts}
              totalVotes={totalVotes}
              isNoVotesState={isNoVotesState || totalVotes === 0}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }
  
  // Carousel view for voting
  return (
    <div className="w-full">
      {/* Counter for position */}
      {suggestions.length > 0 && (
        <div className="flex justify-end mb-3">
          <div className="flex items-center text-gray-500">
            <span className="bg-gray-100 rounded-full px-3 py-1 text-sm">
              {currentIndex + 1} of {suggestions.length}
            </span>
          </div>
        </div>
      )}
      
      <div className="relative">
        {/* "Cast Your Vote" title instead of navigation dots */}
        <div className="flex justify-center mb-5">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 inline-block text-transparent bg-clip-text">
            Cast Your Vote!
          </h2>
        </div>
        
        {/* Carousel */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100, rotateY: 5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -100, rotateY: -5 }}
              transition={{ 
                duration: 0.5, 
                type: "spring", 
                stiffness: 150, 
                damping: 20 
              }}
              className="w-full"
            >
              {suggestions[currentIndex] && (
                <motion.div 
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Fancy background gradient */}
                  <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
                      }}
                      animate={{ 
                        backgroundPosition: ['0px 0px', '100px 100px'],
                      }}
                      transition={{ 
                        duration: 60, 
                        ease: "linear", 
                        repeat: Infinity 
                      }}
                    />
                  </div>
                  
                  {/* Food emoji floating animation - moved down for proper centering and visibility */}
                  <div className="flex justify-center -mt-16">
                    <motion.div 
                      className="bg-white rounded-full w-28 h-28 flex items-center justify-center shadow-lg z-10"
                      animate={{ 
                        y: [0, -6, 0], 
                        boxShadow: [
                          '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                          '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
                          '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        ]
                      }}
                      transition={{ 
                        duration: 3, 
                        ease: "easeInOut", 
                        repeat: Infinity 
                      }}
                    >
                      <span className="text-5xl">{(suggestions[currentIndex] as FoodSuggestion).emoji}</span>
                    </motion.div>
                  </div>
                  
                  {/* Food info */}
                  <div className="p-6 flex flex-col items-center">
                    <motion.h3 
                      className="text-xl font-bold text-gray-800 mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {(suggestions[currentIndex] as FoodSuggestion).name}
                    </motion.h3>
                    
                    {(suggestions[currentIndex] as FoodSuggestion).description && (
                      <motion.p 
                        className="text-gray-600 text-center mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {(suggestions[currentIndex] as FoodSuggestion).description}
                      </motion.p>
                    )}
                    
                    {/* User has already voted on this suggestion */}
                    {userVotes[(suggestions[currentIndex] as FoodSuggestion).id] && (
                      <motion.div 
                        className="mt-2 w-full"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <div className={`
                          border rounded-lg p-3 flex items-center
                          ${userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'love' ? 'bg-red-50 border-red-100' : 
                            userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'like' ? 'bg-emerald-50 border-emerald-100' :
                            userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'neutral' ? 'bg-blue-50 border-blue-100' : 
                            'bg-gray-50 border-gray-100'}
                        `}>
                          <div className={`
                            rounded-full p-2 mr-3
                            ${userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'love' ? 'bg-red-100' : 
                              userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'like' ? 'bg-emerald-100' :
                              userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'neutral' ? 'bg-blue-100' : 
                              'bg-gray-100'}
                          `}>
                            <motion.div
                              animate={{ 
                                rotate: userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'love' ? [0, 10, -10, 0] :
                                        userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'like' ? [0, 20, 0] :
                                        userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'dislike' ? [0, -20, 0] : [0, 0, 0],
                                scale: [1, 1.2, 1]
                              }}
                              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                              className={`
                                ${userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'love' ? 'text-red-600' : 
                                  userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'like' ? 'text-emerald-600' :
                                  userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'neutral' ? 'text-blue-600' : 
                                  'text-gray-600'}
                              `}
                            >
                              {getReactionIcon(userVotes[(suggestions[currentIndex] as FoodSuggestion).id], 20)}
                            </motion.div>
                          </div>
                          <div>
                            <p className={`
                              font-medium
                              ${userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'love' ? 'text-red-800' : 
                                userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'like' ? 'text-emerald-800' :
                                userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'neutral' ? 'text-blue-800' : 
                                'text-gray-800'}
                            `}>
                              Your vote has been recorded!
                            </p>
                            <div className={`
                              flex items-center text-sm mt-1
                              ${userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'love' ? 'text-red-700' : 
                                userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'like' ? 'text-emerald-700' :
                                userVotes[(suggestions[currentIndex] as FoodSuggestion).id] === 'neutral' ? 'text-blue-700' : 
                                'text-gray-700'}
                            `}>
                              <span className="mr-1">{getReactionText(userVotes[(suggestions[currentIndex] as FoodSuggestion).id])}</span>
                              
                              {/* Add swipe animation prompting to go to next */}
                              {currentIndex < suggestions.length - 1 && (
                                <motion.div 
                                  className="flex items-center ml-2 text-indigo-600"
                                  animate={{ x: [0, 5, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                                >
                                  <span className="text-xs mr-1">Next</span>
                                  <ChevronRight size={14} />
                                </motion.div>
                              )}
                              
                              {/* Show see results prompt if last item */}
                              {currentIndex === suggestions.length - 1 && (
                                <motion.div 
                                  className="flex items-center ml-2 text-indigo-600"
                                  animate={{ 
                                    scale: [1, 1.05, 1],
                                    opacity: [0.8, 1, 0.8]
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <span className="text-xs">See results</span>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Reaction buttons */}
                  {!userVotes[(suggestions[currentIndex] as FoodSuggestion).id] && (
                    <div className="p-4 border-t border-gray-100">
                      <p className="text-center text-gray-500 mb-3">How do you feel about this option?</p>
                      <div className="grid grid-cols-4 gap-2">
                        {['love', 'like', 'neutral', 'dislike'].map((reaction, index) => (
                          <motion.button
                            key={reaction}
                            whileHover={{ y: -4, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.3, 
                              delay: index * 0.1, 
                              type: "spring", 
                              stiffness: 500 
                            }}
                            onClick={() => handleVote((suggestions[currentIndex] as FoodSuggestion).id, reaction as ReactionType)}
                            className="p-3 rounded-lg flex flex-col items-center justify-center shadow-md relative overflow-hidden"
                            style={{
                              background: reaction === 'love' ? 'linear-gradient(135deg, #f87171, #ec4899)' :
                                         reaction === 'like' ? 'linear-gradient(135deg, #10b981, #14b8a6)' :
                                         reaction === 'neutral' ? 'linear-gradient(135deg, #60a5fa, #3b82f6)' : 
                                         'linear-gradient(135deg, #9ca3af, #6b7280)'
                            }}
                          >
                            <motion.div 
                              className="text-white"
                              animate={{ y: [0, -3, 0] }}
                              transition={{ duration: 1.5, delay: index * 0.2, repeat: Infinity }}
                            >
                              {getReactionIcon(reaction as ReactionType, 24)}
                            </motion.div>
                            <span className="text-xs mt-2 font-medium text-white">
                              {getReactionText(reaction as ReactionType).split(' ')[0]}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Empty state: No suggestions */}
        {suggestions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-gray-400 mb-3">
              <XCircle size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No food suggestions yet</h3>
            <p className="text-gray-500 text-sm">Food suggestions will appear here when added</p>
          </div>
        )}
        
        {/* Add View Results button below the card */}
        {suggestions.length > 0 && (
          <ViewResultsButton onClick={() => setShowResults(true)} />
        )}
        
        {/* Navigation buttons */}
        {suggestions.length > 0 && (
          <div className="flex justify-between mt-4">
            <motion.button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className={`p-2 rounded-lg ${
                currentIndex === 0 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
              whileHover={currentIndex !== 0 ? { scale: 1.1 } : {}}
              whileTap={currentIndex !== 0 ? { scale: 0.9 } : {}}
            >
              <ChevronLeft size={24} />
            </motion.button>
            
            <motion.button
              onClick={() => setCurrentIndex(prev => Math.min(suggestions.length - 1, prev + 1))}
              disabled={currentIndex === suggestions.length - 1}
              className={`p-2 rounded-lg ${
                currentIndex === suggestions.length - 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
              whileHover={currentIndex !== suggestions.length - 1 ? { scale: 1.1 } : {}}
              whileTap={currentIndex !== suggestions.length - 1 ? { scale: 0.9 } : {}}
            >
              <ChevronRight size={24} />
            </motion.button>
          </div>
        )}
      </div>

      {/* Olympic Results Modal */}
      <AnimatePresence>
        {showOlympicResults && (
          <OlympicResults 
            isOpen={showOlympicResults}
            onClose={() => setShowOlympicResults(false)}
            userVotes={userVotes}
            otherUserVotes={otherUserVotes}
            sortedSuggestions={sortedSuggestions}
            voteCounts={voteCounts}
            totalVotes={totalVotes}
            isNoVotesState={isNoVotesState || totalVotes === 0}
          />
        )}
      </AnimatePresence>

      {/* No Votes Expired Modal */}
      <NoVotesExpiredModal
        isOpen={showNoVotesModal}
        onClose={() => setShowNoVotesModal(false)}
        roomName={currentRoom?.name || 'Unknown Room'}
        suggestions={suggestions}
      />

      {/* No Options Expired Modal */}
      <NoOptionsExpiredModal
        isOpen={showNoOptionsModal}
        onClose={() => setShowNoOptionsModal(false)}
        roomName={currentRoom?.name || 'Unknown Room'}
      />

      {/* Winners Podium Modal */}
      <WinnersPodiumModal
        isOpen={showWinnersPodiumModal}
        onClose={() => setShowWinnersPodiumModal(false)}
        roomName={currentRoom?.name || 'Unknown Room'}
        suggestions={sortedSuggestions}
        voteCounts={voteCounts}
        totalVotes={totalVotes}
        userVotes={userVotes}
        otherUserVotes={otherUserVotes}
      />
    </div>
  );
};