import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Medal, Trophy, Crown, Check, Users, BarChart4, XCircle } from 'lucide-react';
import Confetti from 'react-confetti';
import { useAppStore } from '../../../../lib/store';
import { useNavigate } from 'react-router-dom';

// Define types
type ReactionType = 'love' | 'like' | 'neutral' | 'dislike';

interface FoodSuggestion {
  id: string;
  name: string;
  emoji: string;
  description: string;
  votes?: number;
}

interface OlympicResultsProps {
  isOpen: boolean;
  onClose: () => void;
  userVotes: Record<string, ReactionType>;
  otherUserVotes: Record<string, {reaction: ReactionType, name: string}>;
  // Add required props for Winners Podium
  sortedSuggestions?: FoodSuggestion[];
  voteCounts?: Record<string, number>;
  totalVotes?: number;
  isNoVotesState?: boolean;
}

const OlympicResults: React.FC<OlympicResultsProps> = ({
  isOpen,
  onClose,
  userVotes,
  otherUserVotes,
  sortedSuggestions = [],
  voteCounts = {},
  totalVotes = 0,
  isNoVotesState = false
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

  // Find the winners
  const hasWinners = sortedSuggestions.length >= 1;
  const maxVotes = hasWinners ? Math.max(...Object.values(voteCounts), 0) : 0;
  const winners = sortedSuggestions.filter(s => (voteCounts[s.id] || 0) === maxVotes && maxVotes > 0);
  
  // Determine if we should show confetti
  const shouldShowConfetti = confettiActive && hasWinners && maxVotes > 0;

  // Debug logging
  console.log('OlympicResults render:', {
    sortedSuggestionsLength: sortedSuggestions.length,
    totalVotes,
    maxVotes,
    winners: winners.length,
    voteCounts,
    windowSize,
    confettiActive,
    shouldShowConfetti,
    isNoVotesState
  });

  // Determine if we have valid results to show
  const hasValidResults = sortedSuggestions.length > 0 && totalVotes > 0 && !isNoVotesState;

  // Determine if we should show the no votes state - ensure we check both isNoVotesState flag and total votes
  const showNoVotesState = isNoVotesState && totalVotes === 0;

  // Check if any votes exist in userVotes
  const hasUserVotes = Object.keys(userVotes).length > 0;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Confetti effect when results are shown - with absolute positioning to ensure full coverage */}
      {shouldShowConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={300}
            gravity={0.2}
            colors={['#f59e0b', '#fbbf24', '#d97706', '#92400e', '#fef3c7', '#ec4899', '#8b5cf6']}
            confettiSource={{
              x: windowSize.width / 2,
              y: 0,
              w: 0,
              h: 0
            }}
          />
        </div>
      )}
      <motion.div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden relative"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-amber-100 to-yellow-100">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-1.5 rounded-full mr-2 shadow-sm">
              <Trophy className="text-white" size={20} />
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-amber-700 to-yellow-600 inline-block text-transparent bg-clip-text">
              Final Results
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-white rounded-full hover:bg-gray-100 text-gray-500 shadow-sm transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-amber-100 to-yellow-50 px-8 py-3 rounded-xl shadow-sm mb-3">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-500 inline-block text-transparent bg-clip-text">
                Winners Podium
              </h3>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-600 mt-2">
              <Trophy size={16} className="text-amber-500" />
              <p>The votes are in! Here are the results.</p>
              <Trophy size={16} className="text-amber-500" />
            </div>
          </div>
          
          {/* Winners Podium Display */}
          {hasValidResults || hasUserVotes ? (
            <motion.div 
              className="mb-10 pt-2 pb-2 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex justify-center items-end h-48 relative max-w-2xl mx-auto">
                {/* Second Place - Silver */}
                {sortedSuggestions.length >= 2 && (
                  <motion.div 
                    className="w-1/3 mx-2 flex flex-col items-center"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="mb-2">
                      <motion.div 
                        className="flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-100 rounded-full w-8 h-8 mb-1 mx-auto shadow-md"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      >
                        <span className="text-lg">🥈</span>
                      </motion.div>
                      <p className="text-xs text-center text-gray-600 font-medium">Silver</p>
                    </div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-gray-200 to-gray-50 rounded-t-lg w-full h-28 flex flex-col items-center justify-center p-2 shadow-md"
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 border-2 border-gray-200">
                        <span className="text-2xl">{sortedSuggestions[1].emoji}</span>
                      </div>
                      <p className="font-bold text-gray-700 text-center text-sm line-clamp-1">{sortedSuggestions[1].name}</p>
                      <p className="text-xs text-gray-500 text-center">
                        {voteCounts[sortedSuggestions[1].id] || 0} votes
                      </p>
                    </motion.div>
                  </motion.div>
                )}
                
                {/* First Place - Gold */}
                {sortedSuggestions.length >= 1 && (
                  <motion.div 
                    className="w-1/3 mx-2 flex flex-col items-center z-10"
                    initial={{ y: 70, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  >
                    <div className="mb-2">
                      <motion.div 
                        className="flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-300 rounded-full w-10 h-10 mb-1 mx-auto shadow-md"
                        animate={{ 
                          y: [0, -5, 0],
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <span className="text-xl">🥇</span>
                      </motion.div>
                      <p className="text-sm text-center text-amber-800 font-bold">Gold</p>
                    </div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-amber-300 to-yellow-100 rounded-t-lg w-full h-36 flex flex-col items-center justify-center p-3 shadow-lg relative overflow-hidden"
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Crown className="absolute top-3 text-amber-500 w-6 h-6" />
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-2 border-4 border-amber-200"
                      >
                        <span className="text-3xl">{sortedSuggestions[0].emoji}</span>
                      </motion.div>
                      <p className="font-bold text-amber-900 text-center line-clamp-1">{sortedSuggestions[0].name}</p>
                      <p className="text-xs text-amber-700 text-center">
                        {voteCounts[sortedSuggestions[0].id] || 0} votes
                      </p>
                    </motion.div>
                  </motion.div>
                )}
                
                {/* Third Place - Bronze */}
                {sortedSuggestions.length >= 3 && (
                  <motion.div 
                    className="w-1/3 mx-2 flex flex-col items-center"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <div className="mb-2">
                      <motion.div 
                        className="flex items-center justify-center bg-gradient-to-br from-amber-700 to-amber-500 rounded-full w-7 h-7 mb-1 mx-auto shadow-md"
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
                      >
                        <span className="text-lg">🥉</span>
                      </motion.div>
                      <p className="text-xs text-center text-gray-600 font-medium">Bronze</p>
                    </div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-t-lg w-full h-20 flex flex-col items-center justify-center p-2 shadow-md"
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-1 border-2 border-amber-100">
                        <span className="text-xl">{sortedSuggestions[2].emoji}</span>
                      </div>
                      <p className="font-bold text-gray-700 text-center text-sm line-clamp-1">{sortedSuggestions[2].name}</p>
                      <p className="text-xs text-gray-500 text-center">
                        {voteCounts[sortedSuggestions[2].id] || 0} votes
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </div>
              
              {/* Podium base */}
              <div className="flex justify-center items-end h-8 relative max-w-2xl mx-auto mt-0">
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
            </motion.div>
          ) : showNoVotesState ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl p-8 shadow-md text-center mb-6"
            >
              <XCircle size={48} className="text-gray-400 mx-auto mb-3" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Votes Were Cast</h3>
              <p className="text-gray-500 mb-6">
                This room expired before any votes were recorded. Next time, make sure to vote before the timer runs out!
              </p>
              
              {/* Display suggestions that were available */}
              {sortedSuggestions.length > 0 ? (
                <div>
                  <h4 className="text-md font-medium text-gray-600 mb-3">Available Options:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sortedSuggestions.map((suggestion, index) => (
                      <div 
                        key={suggestion.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xl">{suggestion.emoji || '🍽️'}</span>
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium text-gray-800">{suggestion.name}</p>
                          {suggestion.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">{suggestion.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No food options were suggested in this room.</p>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-10">
              <motion.div 
                className="mx-auto w-24 h-24 bg-gradient-to-r from-amber-100 to-yellow-50 rounded-full flex items-center justify-center mb-4 shadow-md"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Trophy size={40} className="text-amber-500" />
              </motion.div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">No Results Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {sortedSuggestions.length === 0 
                  ? "No food suggestions have been added yet."
                  : "Waiting for participants to cast their votes. Results will appear here once voting is complete."}
              </p>
            </div>
          )}
          
          {/* Vote summary - only show if we have votes */}
          {totalVotes > 0 && !showNoVotesState && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className="flex items-center text-gray-700 font-medium"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <div className="bg-gradient-to-r from-amber-200 to-yellow-100 p-2 rounded-lg mr-2 shadow-sm">
                    <BarChart4 size={18} className="text-amber-700" />
                  </div>
                  <span className="text-lg">Voting Summary</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center text-gray-700 px-4 py-1.5 bg-amber-50 rounded-full border border-amber-100"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <Users size={16} className="mr-1.5 text-amber-600" />
                  <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
                </motion.div>
              </div>
              
              <motion.div 
                className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-5 border border-amber-100 shadow-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                {winners.length > 0 && (
                  <motion.div 
                    className="flex items-center mb-4 bg-amber-100 p-3 rounded-lg border border-amber-200"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 1 }}
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
                
                {sortedSuggestions.length > 0 && (
                  <div className="space-y-3">
                    {sortedSuggestions.slice(0, 5).map((suggestion, index) => (
                      <motion.div 
                        key={suggestion.id} 
                        className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 1 + (index * 0.1) }}
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center">
                          <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-gray-700 text-sm font-medium mr-2">{index + 1}</span>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 flex items-center justify-center border border-amber-100 mr-3">
                            <span className="text-xl">{suggestion.emoji}</span>
                          </div>
                          <span className="text-gray-800 font-medium">{suggestion.name}</span>
                        </div>
                        <div className="flex items-center">
                          <motion.span 
                            className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full px-3 py-1 text-sm text-amber-800 border border-amber-200"
                            animate={{ 
                              scale: index === 0 ? [1, 1.05, 1] : 1
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: index === 0 ? Infinity : 0,
                              repeatDelay: 1
                            }}
                          >
                            {voteCounts[suggestion.id] || 0} votes
                          </motion.span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          )}
          
          <div className="text-center mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <motion.button
              onClick={() => {
                onClose();
                // Navigate back to dashboard using router navigation
                useAppStore.getState().setActiveTab('home');
                navigate('/');
              }}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
              whileHover={{ y: -3, scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Trophy size={18} className="text-white" />
              <span className="font-medium">Awesome!</span>
            </motion.button>
            
            <motion.button
              onClick={onClose}
              className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
              whileHover={{ y: -3, scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="font-medium">Back to Results</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OlympicResults; 