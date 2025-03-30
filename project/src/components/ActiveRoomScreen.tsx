import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, ArrowLeft, Timer, MessageCircle, Users, Plus, Crown, ThumbsUp, X, Clock, Copy, Check, RotateCcw, Vote, Shuffle, Scale, AlertCircle } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { CreatePollForm } from './CreatePollForm';
import { PollCard } from './PollCard';
import { cn } from '../lib/utils';
import { fadeVariants, popVariants, staggerContainer, staggerItem } from './PageTransition';

export function ActiveRoomScreen() {
  const { setActiveTab, currentRoom, updateRoom, recordVotingResult } = useAppStore();
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // Will be calculated from expiresAt
  const [newMessage, setNewMessage] = useState('');
  const [pendingVotes, setPendingVotes] = useState<Record<string, string>>({});
  const [completedVotes, setCompletedVotes] = useState<Record<string, string[]>>({});
  const [codeCopied, setCodeCopied] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [hasTie, setHasTie] = useState(false);
  const [tieAnimationStage, setTieAnimationStage] = useState<'initial' | 'detecting' | 'confirmed' | 'transitioning'>('initial');
  const [tiedOptions, setTiedOptions] = useState<{id: string, text: string}[]>([]);
  const [tiedPollId, setTiedPollId] = useState<string | null>(null);
  const [isRoomExpired, setIsRoomExpired] = useState(false);
  const [exitTarget, setExitTarget] = useState<string | null>(null);

  useEffect(() => {
    // Calculate initial time remaining
    const expiresAt = new Date(currentRoom.expiresAt).getTime();
    const now = new Date().getTime();
    const initialTimeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
    setTimeRemaining(initialTimeRemaining);
    
    // Check if room is already expired
    setIsRoomExpired(initialTimeRemaining <= 0 || currentRoom.isActive === false);

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setIsRoomExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRoom.expiresAt, currentRoom.isActive]);

  useEffect(() => {
    // Initialize completed votes from current room data
    const initialCompletedVotes: Record<string, string[]> = {};
    
    currentRoom.suggestions.forEach(suggestion => {
      initialCompletedVotes[suggestion.id] = [];
      
      suggestion.options.forEach(option => {
        if (option.voters) {
          option.voters.forEach(voterId => {
            if (!initialCompletedVotes[suggestion.id].includes(voterId)) {
              initialCompletedVotes[suggestion.id].push(voterId);
            }
          });
        }
      });
    });
    
    setCompletedVotes(initialCompletedVotes);
  }, [currentRoom.suggestions]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCreatePoll = (title: string, options: string[]) => {
    const newPoll = {
      id: Date.now().toString(),
      text: title,
      votes: 0,
      author: 'You',
      timestamp: new Date().toISOString(),
      options: options.map(option => ({
        id: Math.random().toString(36).substr(2, 9),
        text: option,
        votes: 0,
        voters: []
      }))
    };
    
    const updatedRoom = {
      ...currentRoom,
      suggestions: [...currentRoom.suggestions, newPoll]
    };
    
    updateRoom(updatedRoom);
    setShowSuggestionForm(false);
    
    // Initialize completed votes for the new poll
    setCompletedVotes(prev => ({
      ...prev,
      [newPoll.id]: []
    }));
  };

  const handleVote = (suggestionId: string, optionId: string) => {
    if (isRoomExpired) return; // Prevent voting if room is expired
    
    // Store the pending vote
    setPendingVotes(prev => ({
      ...prev,
      '1': optionId // '1' is the current user's ID
    }));
  };

  const handleConfirmVote = async (pollId: string, optionId: string) => {
    if (isRoomExpired) return; // Prevent voting if room is expired
    
    // Remove from pending votes
    setPendingVotes(prev => {
      const newPendingVotes = { ...prev };
      delete newPendingVotes['1'];
      return newPendingVotes;
    });
    
    // Add to completed votes
    setCompletedVotes(prev => ({
      ...prev,
      [pollId]: [...(prev[pollId] || []), '1']
    }));
    
    // Update the room data
    const updatedSuggestions = currentRoom.suggestions.map(suggestion => {
      if (suggestion.id === pollId) {
        return {
          ...suggestion,
          options: suggestion.options.map(option => {
            if (option.id === optionId) {
              return {
                ...option,
                votes: option.votes + 1,
                voters: [...(option.voters || []), '1']
              };
            }
            return option;
          })
        };
      }
      return suggestion;
    });
    
    const updatedRoom = {
      ...currentRoom,
      suggestions: updatedSuggestions
    };
    
    updateRoom(updatedRoom);

    // Check if all participants have voted and if there's a tie
    const suggestion = updatedSuggestions.find(s => s.id === pollId);
    if (suggestion) {
      const allVoted = (completedVotes[pollId]?.length + 1) >= currentRoom.participants.length;
      
      if (allVoted) {
        // Check for a tie
        const voteCounts = new Map<number, string[]>();
        suggestion.options.forEach(option => {
          const voteCount = option.votes;
          if (!voteCounts.has(voteCount)) {
            voteCounts.set(voteCount, []);
          }
          voteCounts.get(voteCount)?.push(option.id);
        });

        // Find the highest vote count
        let maxVotes = 0;
        for (const count of voteCounts.keys()) {
          if (count > maxVotes) {
            maxVotes = count;
          }
        }

        // Check if there's a tie for the highest vote count
        const tiedOptionIds = voteCounts.get(maxVotes) || [];
        
        // Record the voting result in the database
        let winningOptionId = '';
        
        if (tiedOptionIds.length > 1) {
          // We have a tie, start the tie animation sequence
          setHasTie(true);
          setTiedPollId(pollId);
          
          // Get the tied options details
          const tiedOptionDetails = tiedOptionIds.map(optionId => {
            const option = suggestion.options.find(o => o.id === optionId);
            return {
              id: option?.id || '',
              text: option?.text || ''
            };
          });
          
          setTiedOptions(tiedOptionDetails);
          
          // Start the tie detection animation sequence
          setTieAnimationStage('detecting');
          
          // After a delay, confirm the tie
          setTimeout(() => {
            setTieAnimationStage('confirmed');
            
            // After another delay, start the transition to the result screen
            setTimeout(() => {
              setTieAnimationStage('transitioning');
              setIsExiting(true);
              
              // Randomly select a winner from tied options
              const randomIndex = Math.floor(Math.random() * tiedOptionIds.length);
              winningOptionId = tiedOptionIds[randomIndex];
              
              // Record the result
              recordVotingResult(currentRoom.id, pollId, winningOptionId, maxVotes);
              
              // Finally navigate to the result screen
              setTimeout(() => {
                handleNavigate('result');
              }, 1500);
            }, 2000);
          }, 2000);
        } else if (tiedOptionIds.length === 1) {
          // We have a clear winner
          winningOptionId = tiedOptionIds[0];
          
          // Record the result
          recordVotingResult(currentRoom.id, pollId, winningOptionId, maxVotes);
          
          setHasTie(false);
          setIsExiting(true);
          setTimeout(() => {
            handleNavigate('result');
          }, 800);
        }
      }
    }
  };

  const handleCancelVote = (pollId: string) => {
    // Just remove from pending votes
    setPendingVotes(prev => {
      const newPendingVotes = { ...prev };
      delete newPendingVotes['1'];
      return newPendingVotes;
    });
  };

  const handleUndoVote = (pollId: string) => {
    if (isRoomExpired) return; // Prevent voting changes if room is expired
    
    // Find which option the user voted for
    let votedOptionId: string | null = null;
    
    currentRoom.suggestions.forEach(suggestion => {
      if (suggestion.id === pollId) {
        suggestion.options.forEach(option => {
          if (option.voters?.includes('1')) {
            votedOptionId = option.id;
          }
        });
      }
    });
    
    if (!votedOptionId) return;
    
    // Remove from completed votes
    setCompletedVotes(prev => ({
      ...prev,
      [pollId]: prev[pollId].filter(id => id !== '1')
    }));
    
    // Update the room data
    const updatedSuggestions = currentRoom.suggestions.map(suggestion => {
      if (suggestion.id === pollId) {
        return {
          ...suggestion,
          options: suggestion.options.map(option => {
            if (option.id === votedOptionId) {
              return {
                ...option,
                votes: Math.max(0, option.votes - 1),
                voters: (option.voters || []).filter(id => id !== '1')
              };
            }
            return option;
          })
        };
      }
      return suggestion;
    });
    
    const updatedRoom = {
      ...currentRoom,
      suggestions: updatedSuggestions
    };
    
    updateRoom(updatedRoom);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const updatedMessages = [
      ...currentRoom.messages,
      {
        id: Date.now().toString(),
        author: 'You',
        text: newMessage.trim(),
        timestamp: 'Just now'
      }
    ];

    const updatedRoom = {
      ...currentRoom,
      messages: updatedMessages
    };

    updateRoom(updatedRoom);
    setNewMessage('');
  };

  // Check if all participants have voted on a poll
  const allParticipantsVoted = (pollId: string) => {
    return completedVotes[pollId]?.length === currentRoom.participants.length;
  };

  // Check if any poll has all votes completed
  const hasCompletedPolls = currentRoom.suggestions.some(
    suggestion => completedVotes[suggestion.id]?.length === currentRoom.participants.length
  );

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(currentRoom.code || 'XYZ123');
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // Check if a participant has voted on any poll
  const hasParticipantVoted = (participantId: string) => {
    for (const pollId in completedVotes) {
      if (completedVotes[pollId].includes(participantId)) {
        return true;
      }
    }
    return false;
  };

  // Check if a participant has a pending vote
  const hasParticipantPendingVote = (participantId: string) => {
    return pendingVotes[participantId] !== undefined;
  };

  // Check if there's a tie in any completed poll
  const checkForTie = () => {
    for (const suggestion of currentRoom.suggestions) {
      if (completedVotes[suggestion.id]?.length === currentRoom.participants.length) {
        // Count votes for each option
        const voteCounts = new Map<number, number>();
        suggestion.options.forEach(option => {
          if (!voteCounts.has(option.votes)) {
            voteCounts.set(option.votes, 0);
          }
          voteCounts.set(option.votes, (voteCounts.get(option.votes) || 0) + 1);
        });

        // Find the highest vote count
        let maxVotes = 0;
        for (const count of voteCounts.keys()) {
          if (count > maxVotes) {
            maxVotes = count;
          }
        }

        // Check if there's a tie for the highest vote count
        if (voteCounts.get(maxVotes) && voteCounts.get(maxVotes)! > 1) {
          return true;
        }
      }
    }
    return false;
  };

  // Handle viewing results
  const handleViewResults = () => {
    // Check if there's a tie before transitioning
    const isTie = checkForTie();
    setHasTie(isTie);
    setIsExiting(true);
    setTimeout(() => {
      handleNavigate('result');
    }, 800);
  };

  const handleNavigate = (tab: string) => {
    setExitTarget(tab);
    setIsExiting(true);
    setTimeout(() => {
      setActiveTab(tab as any);
    }, 300);
  };

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 1, scale: 1 },
    exit: {
      opacity: 0,
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  // Tie detection animation variants
  const tieDetectionVariants = {
    initial: {
      opacity: 0,
      scale: 0
    },
    detecting: {
      opacity: 1,
      scale: [0.8, 1.1, 1],
      rotate: [0, -5, 5, -3, 3, 0],
      transition: {
        duration: 1.5,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        ease: "easeInOut"
      }
    },
    confirmed: {
      scale: [1, 1.2, 1],
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    },
    transitioning: {
      opacity: [1, 0.8, 1],
      scale: [1, 1.1, 1],
      y: [0, -10, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Tie options animation
  const tieOptionVariants = {
    initial: {
      opacity: 0,
      y: 20
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2 + 0.5,
        duration: 0.5,
        ease: "easeOut"
      }
    }),
    pulse: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50"
      initial="initial"
      animate="initial"
      exit="exit"
      variants={pageVariants}
    >
      {/* Expired Room Banner */}
      {isRoomExpired && (
        <div className="bg-red-500 text-white py-2 px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <p>This room has expired. Voting is now closed.</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setIsExiting(true);
                setTimeout(() => handleNavigate('home'), 300);
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Leave Room</span>
            </button>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">{currentRoom.name}</h1>
            </div>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 grid grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="col-span-8 space-y-6">
          {/* Suggestions Section */}
          <motion.div 
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900">Suggestions</h2>
                {hasCompletedPolls && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                    Voting Complete
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {hasCompletedPolls && (
                  <motion.button
                    onClick={handleViewResults}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    View Results
                  </motion.button>
                )}
                <motion.button
                  onClick={() => setShowSuggestionForm(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isRoomExpired}
                  className={`flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors ${
                    isRoomExpired ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Add Suggestion
                </motion.button>
              </div>
            </div>

            <div className="space-y-4">
              {currentRoom.suggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No suggestions yet. Be the first to suggest something!
                </div>
              ) : (
                currentRoom.suggestions.map((suggestion) => {
                  // Check if this suggestion has a winning option (for expired rooms)
                  const hasWinner = currentRoom.winningOptions && currentRoom.winningOptions[suggestion.id];
                  const winningOption = hasWinner ? currentRoom.winningOptions[suggestion.id] : null;
                  
                  return (
                    <div key={suggestion.id} className="relative">
                      {allParticipantsVoted(suggestion.id) && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10">
                          Voting Complete
                        </div>
                      )}
                      {hasWinner && (
                        <div className="absolute -top-2 -left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full z-10 flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          <span>Winner: {winningOption.text}</span>
                        </div>
                      )}
                      <PollCard
                        title={suggestion.text}
                        options={suggestion.options}
                        onVote={(optionId) => handleVote(suggestion.id, optionId)}
                        currentUserId="1" // Current user ID
                        pollId={suggestion.id}
                        confirmVote={handleConfirmVote}
                        cancelVote={handleCancelVote}
                        undoVote={() => handleUndoVote(suggestion.id)} pendingVotes={pendingVotes}
                        completedVotes={completedVotes[suggestion.id] || []}
                        participants={currentRoom.participants}
                        isExpired={isRoomExpired}
                        winningOptionId={winningOption?.optionId}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Chat Section */}
          <motion.div 
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Discussion</h2>
            <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
              {currentRoom.messages.map((message) => (
                <motion.div 
                  key={message.id} 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <div className="flex-shrink-0">
                    {currentRoom.participants.find(p => p.name === message.author)?.avatar && (
                      <img
                        src={currentRoom.participants.find(p => p.name === message.author)?.avatar}
                        alt={message.author}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{message.author}</span>
                      <span className="text-sm text-gray-500">{message.timestamp}</span>
                    </div>
                    <p className="text-gray-700">{message.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Send
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="col-span-4 space-y-6">
          {/* Participants */}
          <motion.div 
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Participants</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span>{currentRoom.participants.length}</span>
              </div>
            </div>
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {currentRoom.participants.map((participant) => (
                <motion.div 
                  key={participant.id} 
                  variants={staggerItem}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{participant.name}</span>
                      {participant.isHost && (
                        <Crown className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                  <div>
                    {hasParticipantVoted(participant.id) ? (
                      <div className="bg-green-100 p-1 rounded-full">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    ) : hasParticipantPendingVote(participant.id) ? (
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="flex space-x-1"
                      >
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                      </motion.div>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Room Info */}
          <motion.div 
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Info</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>Created {new Date(currentRoom.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MessageCircle className="w-5 h-5" />
                <span>{currentRoom.messages.length} messages</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-600">
                  <span>Room Code:</span>
                  <span className="font-mono font-medium text-orange-500">{currentRoom.code || 'XYZ123'}</span>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopyRoomCode}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Copy room code"
                >
                  {codeCopied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                  )}
                </motion.button>
              </div>
              <div className={`flex items-center justify-between text-gray-600 ${
                isRoomExpired ? 'bg-red-50' : 'bg-orange-50'
              } p-3 rounded-lg`}>
                <div className="flex items-center gap-2">
                  <Timer className={`w-5 h-5 ${isRoomExpired ? 'text-red-500' : 'text-orange-500'}`} />
                  <span>{isRoomExpired ? 'Room Expired:' : 'Time Remaining:'}</span>
                </div>
                <span className={`font-medium ${isRoomExpired ? 'text-red-600' : 'text-orange-600'}`}>
                  {isRoomExpired ? 'Voting Closed' : formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Suggestion Form Modal */}
      <AnimatePresence>
        {showSuggestionForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              variants={popVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSuggestionForm(false)}
                className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
              <CreatePollForm onSubmit={handleCreatePoll} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tie Detection Overlay */}
      <AnimatePresence>
        {tieAnimationStage !== 'initial' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
          >
            <motion.div
              variants={tieDetectionVariants}
              initial="initial"
              animate={tieAnimationStage}
              className="bg-white p-6 rounded-full shadow-2xl mb-6"
            >
              <Scale className="w-16 h-16 text-blue-500" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-center text-gray-900 mb-4"
            >
              {tieAnimationStage === 'detecting' && "Analyzing votes..."}
              {tieAnimationStage === 'confirmed' && "We have a tie!"}
              {tieAnimationStage === 'transitioning' && "Preparing tie breaker..."}
            </motion.h2>
            
            {tieAnimationStage === 'confirmed' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-600 text-center mb-8 max-w-md"
              >
                Multiple options received the same number of votes. 
                Moving to tie breaker to determine the winner.
              </motion.p>
            )}
            
            {/* Show tied options */}
            {tieAnimationStage === 'confirmed' && tiedOptions.length > 0 && (
              <div className="flex gap-4 max-w-2xl">
                {tiedOptions.map((option, index) => (
                  <motion.div
                    key={option.id}
                    custom={index}
                    variants={tieOptionVariants}
                    initial="initial"
                    animate="visible"
                    whileHover="pulse"
                    className="bg-white rounded-xl p-4 shadow-lg"
                  >
                    <p className="font-medium text-gray-900">{option.text}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Animation Overlay */}
      <AnimatePresence>
        {isExiting && tieAnimationStage === 'initial' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-blue-500/20 backdrop-blur-sm z-50 pointer-events-none"
          >
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.1, 1],
                rotate: hasTie ? [0, -10, 10, -5, 5, 0] : [0, 360],
                y: hasTie ? [0, -10, 10, 0] : 0
              }}
              transition={{ 
                duration: hasTie ? 0.8 : 0.6,
                times: hasTie ? [0, 0.2, 0.4, 0.6, 0.8, 1] : [0, 1]
              }}
            >
              <div className="bg-white p-6 rounded-full shadow-2xl">
                {hasTie ? (
                  <Scale className="w-16 h-16 text-blue-500" />
                ) : (
                  <Vote className="w-16 h-16 text-blue-500" />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}