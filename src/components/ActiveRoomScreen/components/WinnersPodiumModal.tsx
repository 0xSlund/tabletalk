import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, XCircle, X, Crown, Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../lib/store';

interface FoodSuggestion {
  id: string;
  name: string;
  emoji: string;
  description: string;
  votes?: number;
  author?: string;
  timestamp?: string;
}

interface WinnersPodiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  suggestions: FoodSuggestion[];
  voteCounts: Record<string, number>;
  totalVotes: number;
  userVotes?: Record<string, string>;
  otherUserVotes?: Record<string, {reaction: string, name: string}>;
}

export const WinnersPodiumModal: React.FC<WinnersPodiumModalProps> = ({
  isOpen,
  onClose,
  roomName,
  suggestions = [],
  voteCounts = {},
  totalVotes = 0,
  userVotes = {},
  otherUserVotes = {}
}) => {
  const navigate = useNavigate();
  const [confettiActive, setConfettiActive] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Set up window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Initialize window size
    handleResize();
    
    // Reset confetti active state to true every time the component is opened
    if (isOpen) {
      setConfettiActive(true);
      
      // Disable confetti after 8 seconds for performance
      const timer = setTimeout(() => {
        setConfettiActive(false);
      }, 8000);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timer);
      };
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine what to show
  const hasSuggestions = suggestions && suggestions.length > 0;
  const hasVotes = totalVotes > 0;
  
  // Calculate winners
  const maxVotes = hasSuggestions ? Math.max(...Object.values(voteCounts), 0) : 0;
  const winners = suggestions.filter(s => (voteCounts[s.id] || 0) === maxVotes && maxVotes > 0);
  const hasWinners = winners.length > 0 && maxVotes > 0;
  
  // Sort suggestions by vote count for podium display
  const sortedSuggestions = suggestions
    .map(s => ({ ...s, voteCount: voteCounts[s.id] || 0 }))
    .sort((a, b) => b.voteCount - a.voteCount);

  const handleCreateNewRoom = () => {
    onClose();
    navigate('/create');
  };

  // Confetti configuration
  const confettiConfig = {
    angle: 90,
    spread: 70,
    startVelocity: 45,
    elementCount: 50,
    decay: 0.9,
    colors: ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF', '#9370DB']
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          {/* Confetti for winners */}
          {hasWinners && confettiActive && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1000,
              }}
            >
              {/* Multiple confetti bursts */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${20 + i * 15}%`,
                    top: '10%',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    y: [0, windowSize.height * 0.8],
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.3,
                    ease: "easeOut"
                  }}
                  className="text-4xl"
                >
                  🎉
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ 
              scale: 0.8, 
              y: 40, 
              opacity: 0,
              rotateX: -15
            }}
            animate={{ 
              scale: 1, 
              y: 0, 
              opacity: 1,
              rotateX: 0
            }}
            exit={{ 
              scale: 0.8, 
              y: 40, 
              opacity: 0,
              rotateX: 15,
              transition: { 
                duration: 0.15, 
                ease: [0.4, 0, 1, 1] 
              }
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 500, 
              damping: 35,
              mass: 0.8
            }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <motion.button 
              onClick={onClose} 
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 bg-white/90 backdrop-blur rounded-full p-2.5 shadow-lg border border-gray-200/50"
              whileHover={{ 
                scale: 1.1,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderColor: "rgba(156, 163, 175, 0.3)",
                color: "#374151"
              }}
              whileTap={{ 
                scale: 0.9,
                transition: { duration: 0.1 }
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25
              }}
            >
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <X size={20} />
              </motion.div>
            </motion.button>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-block bg-gradient-to-r from-amber-100 to-yellow-50 px-8 py-3 rounded-xl shadow-sm mb-3">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-500 inline-block text-transparent bg-clip-text">
                    {hasWinners ? 'Winners Podium' : 'Room Results'}
                  </h3>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600 mt-2">
                  <Trophy size={16} className="text-amber-500" />
                  <p>"{roomName}" has ended</p>
                  <Trophy size={16} className="text-amber-500" />
                </div>
              </div>

              {/* NO CHOICES SCENARIO - No suggestions were made */}
              {!hasSuggestions ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-8"
                >
                  <div className="mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full h-20 w-20 flex items-center justify-center shadow-inner mb-6">
                    <XCircle size={48} className="text-gray-400" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">No Food Options Were Added</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    This room ended without any food suggestions being made. Ready to start fresh with new ideas?
                  </p>
                  
                  <div className="space-y-4">
                    <motion.button
                      onClick={handleCreateNewRoom}
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg border border-blue-400/20 backdrop-blur-sm"
                      whileHover={{ 
                        y: -4, 
                        scale: 1.08,
                        boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1)",
                        background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)"
                      }}
                      whileTap={{ 
                        scale: 0.96,
                        y: -2,
                        transition: { duration: 0.1 }
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Plus size={22} />
                      </motion.div>
                      <span className="text-lg">Create New Room</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={onClose}
                      className="block mx-auto px-6 py-2.5 text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg font-medium shadow-sm"
                      whileHover={{ 
                        scale: 1.05,
                        backgroundColor: "#F3F4F6",
                        borderColor: "#D1D5DB"
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                    >
                      Close
                    </motion.button>
                  </div>
                </motion.div>
              ) : 

              /* NO VOTES SCENARIO - Suggestions were made but no votes */
              !hasVotes ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-8"
                >
                  <div className="mx-auto bg-gradient-to-br from-orange-100 to-red-100 rounded-full h-20 w-20 flex items-center justify-center shadow-inner mb-6">
                    <Users size={48} className="text-orange-400" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">No Votes Were Cast</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Food options were suggested, but the room ended before anyone could vote. Here's what was available:
                  </p>
                  
                  {/* Display suggestions that were available */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
                    {suggestions.map((suggestion, index) => (
                      <motion.div 
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3"
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">{suggestion.emoji || '🍽️'}</span>
                        </div>
                        <div className="flex-grow text-left">
                          <p className="font-medium text-gray-800">{suggestion.name}</p>
                          {suggestion.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">{suggestion.description}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <motion.button
                      onClick={handleCreateNewRoom}
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg border border-green-400/20 backdrop-blur-sm"
                      whileHover={{ 
                        y: -4, 
                        scale: 1.08,
                        boxShadow: "0 20px 25px -5px rgba(34, 197, 94, 0.3), 0 10px 10px -5px rgba(34, 197, 94, 0.1)",
                        background: "linear-gradient(135deg, #22C55E 0%, #10B981 50%, #0D9488 100%)"
                      }}
                      whileTap={{ 
                        scale: 0.96,
                        y: -2,
                        transition: { duration: 0.1 }
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Plus size={22} />
                      </motion.div>
                      <span className="text-lg">Create New Room</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={onClose}
                      className="block mx-auto px-6 py-2.5 text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg font-medium shadow-sm"
                      whileHover={{ 
                        scale: 1.05,
                        backgroundColor: "#F3F4F6",
                        borderColor: "#D1D5DB"
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                    >
                      Close
                    </motion.button>
                  </div>
                </motion.div>
              ) : 

              /* WINNERS SCENARIO - We have suggestions and votes */
              (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Winners Announcement */}
                  <motion.div 
                    className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-5 border border-amber-100 shadow-sm mb-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {winners.length > 0 && (
                      <motion.div 
                        className="flex items-center mb-4 bg-amber-100 p-3 rounded-lg border border-amber-200"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-1.5 rounded-full mr-3 shadow-sm">
                          <Crown size={18} className="text-white" />
                        </div>
                        <p className="text-sm text-amber-800 font-medium">
                          {winners.length === 1 
                            ? `"${winners[0].name}" is the winner with ${maxVotes} votes!`
                            : `We have a ${winners.length}-way tie! Each winner got ${maxVotes} votes.`
                          }
                        </p>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Olympic-style Podium */}
                  <motion.div 
                    className="flex justify-center items-end space-x-4 mb-8 max-w-2xl mx-auto"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                  >
                    {/* Silver (2nd place) */}
                    {sortedSuggestions[1] && (
                      <motion.div 
                        className="flex flex-col items-center"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <div className="bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mb-2">
                          2
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-md border border-gray-200 min-w-24 max-w-32 text-center">
                          <div className="text-2xl mb-1">{sortedSuggestions[1].emoji}</div>
                          <p className="font-medium text-xs text-gray-800 truncate">{sortedSuggestions[1].name}</p>
                          <p className="text-xs text-gray-500">{sortedSuggestions[1].voteCount} votes</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-300 to-gray-400 w-24 h-16 rounded-t-lg shadow-md"></div>
                      </motion.div>
                    )}

                    {/* Gold (1st place) */}
                    {sortedSuggestions[0] && (
                      <motion.div 
                        className="flex flex-col items-center"
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <Crown size={24} className="text-yellow-500 mb-2" />
                        <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-yellow-300 min-w-28 max-w-36 text-center relative">
                          <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            1
                          </div>
                          <div className="text-3xl mb-2">{sortedSuggestions[0].emoji}</div>
                          <p className="font-bold text-sm text-gray-800 truncate">{sortedSuggestions[0].name}</p>
                          <p className="text-sm text-yellow-600 font-medium">{sortedSuggestions[0].voteCount} votes</p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 w-28 h-20 rounded-t-lg shadow-lg"></div>
                      </motion.div>
                    )}

                    {/* Bronze (3rd place) */}
                    {sortedSuggestions[2] && (
                      <motion.div 
                        className="flex flex-col items-center"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mb-2">
                          3
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-md border border-gray-200 min-w-24 max-w-32 text-center">
                          <div className="text-2xl mb-1">{sortedSuggestions[2].emoji}</div>
                          <p className="font-medium text-xs text-gray-800 truncate">{sortedSuggestions[2].name}</p>
                          <p className="text-xs text-gray-500">{sortedSuggestions[2].voteCount} votes</p>
                        </div>
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-24 h-12 rounded-t-lg shadow-md"></div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Podium base */}
                  <div className="flex justify-center items-end h-8 relative max-w-2xl mx-auto mb-8">
                    <motion.div 
                      className="w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 h-8 rounded-md shadow-inner"
                      initial={{ scaleX: 0.7, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ duration: 0.7, delay: 0.7 }}
                    >
                      {/* Decorative elements */}
                      <div className="flex justify-around">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <motion.div 
                            key={i}
                            className="w-1 h-2 bg-gray-300 rounded-sm mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.8 + (i * 0.1) }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      onClick={handleCreateNewRoom}
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg border border-blue-400/20 backdrop-blur-sm"
                      whileHover={{ 
                        y: -4, 
                        scale: 1.08,
                        boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1)",
                        background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)"
                      }}
                      whileTap={{ 
                        scale: 0.96,
                        y: -2,
                        transition: { duration: 0.1 }
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Plus size={22} />
                      </motion.div>
                      <span className="text-lg">Create New Room</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={onClose}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg font-medium shadow-sm"
                      whileHover={{ 
                        scale: 1.05,
                        backgroundColor: "#F3F4F6",
                        borderColor: "#D1D5DB"
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                    >
                      Close
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 