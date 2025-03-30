import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, ArrowLeft, Trophy, Star, RefreshCw, Home, Share2, Users, Shuffle, Scale } from 'lucide-react';
import { useAppStore } from '../lib/store';
import Confetti from 'react-confetti';
import { fadeVariants, popVariants } from './PageTransition';

interface ResultScreenProps {
  onRestart?: () => void;
}

export function ResultScreen({ onRestart }: ResultScreenProps) {
  const { setActiveTab, currentRoom } = useAppStore();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showTieBreaker, setShowTieBreaker] = useState(false);
  const [tieOptions, setTieOptions] = useState<{ name: string; image: string }[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [tieBreakingStarted, setTieBreakingStarted] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(150); // ms between animations
  const [animationProgress, setAnimationProgress] = useState(0);
  const [pageTransition, setPageTransition] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const [winningDish, setWinningDish] = useState<any>(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Set entering animation
    setIsEntering(true);
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 800);
    
    // Determine the winning dish from the current room
    determineWinningDish();
    
    return () => { 
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Function to determine the winning dish from the current room
  const determineWinningDish = () => {
    if (!currentRoom || !currentRoom.suggestions || currentRoom.suggestions.length === 0) {
      // Fallback if no suggestions
      setWinningDish({
        name: "Sushi Paradise",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80",
        votes: 8,
        totalVotes: 12,
        description: "Experience the finest Japanese cuisine with our fresh sushi selection.",
        location: "123 Sushi Lane",
        rating: 4.8,
        priceRange: "$$",
        participants: [
          { name: "Alice", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" },
          { name: "Bob", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80" },
          { name: "Carol", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80" },
        ]
      });
      return;
    }

    // Find the suggestion with the most votes
    let winningPoll = currentRoom.suggestions[0];
    let maxVotes = 0;
    
    currentRoom.suggestions.forEach(suggestion => {
      const totalVotes = suggestion.options.reduce((sum, option) => sum + option.votes, 0);
      if (totalVotes > maxVotes) {
        maxVotes = totalVotes;
        winningPoll = suggestion;
      }
    });
    
    // Find the winning option in this poll
    let winningOption = winningPoll.options[0];
    let maxOptionVotes = 0;
    
    // Check if we have a recorded winner in the winningOptions
    if (currentRoom.winningOptions && currentRoom.winningOptions[winningPoll.id]) {
      const recordedWinner = currentRoom.winningOptions[winningPoll.id];
      winningOption = winningPoll.options.find(o => o.id === recordedWinner.optionId) || winningOption;
    } else {
      // Otherwise find the option with most votes
      winningPoll.options.forEach(option => {
        if (option.votes > maxOptionVotes) {
          maxOptionVotes = option.votes;
          winningOption = option;
        }
      });
    }
    
    // Create the winning dish object
    setWinningDish({
      name: winningOption.text,
      image: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?auto=format&fit=crop&w=1200&q=80`,
      votes: winningOption.votes,
      totalVotes: winningPoll.options.reduce((sum, option) => sum + option.votes, 0),
      description: `The group has chosen ${winningOption.text} as the winner!`,
      location: "As voted by the group",
      rating: (4 + Math.random()).toFixed(1),
      priceRange: "$".repeat(Math.floor(Math.random() * 3) + 1),
      participants: currentRoom.participants.map(p => ({
        name: p.name,
        avatar: p.avatar
      }))
    });
    
    // Check if there was a tie that needed to be broken
    const tiedOptions = winningPoll.options.filter(o => o.votes === winningOption.votes);
    if (tiedOptions.length > 1) {
      setTieOptions(tiedOptions.map(o => ({
        name: o.text,
        image: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?auto=format&fit=crop&w=1200&q=80`
      })));
      setShowTieBreaker(true);
      
      // Auto-start tie breaker animation after a delay
      setTimeout(() => {
        handleTieBreaker();
      }, 1000);
    }
  };

  // Function to handle the tie-breaker animation
  const handleTieBreaker = () => {
    if (tieBreakingStarted) return; // Prevent multiple clicks
    
    setTieBreakingStarted(true);
    setAnimationComplete(false);
    setSelectedOption(null);
    setAnimationProgress(0);
    
    // Start with fast switching
    let counter = 0;
    const totalIterations = 20;
    const maxProgress = 100;
    
    const interval = setInterval(() => {
      counter++;
      setSelectedOption(counter % 2);
      
      // Update progress
      const progress = Math.min(Math.round((counter / totalIterations) * maxProgress), maxProgress);
      setAnimationProgress(progress);
      
      // Gradually slow down the animation
      if (counter > totalIterations * 0.5) {
        setAnimationSpeed(prev => Math.min(prev + 20, 500));
      }
      
      if (counter >= totalIterations) {
        clearInterval(interval);
        
        // Final selection (random)
        const winner = Math.floor(Math.random() * 2);
        setSelectedOption(winner);
        
        // Short pause before showing the result
        setTimeout(() => {
          setAnimationComplete(true);
        }, 800);
      }
    }, animationSpeed);
  };

  // Handle transition between tie breaker and result
  useEffect(() => {
    if (animationComplete && showTieBreaker) {
      setPageTransition(true);
      
      const timer = setTimeout(() => {
        setShowTieBreaker(false);
        
        // Update the winning dish with the tie breaker winner
        if (selectedOption !== null && tieOptions.length > selectedOption) {
          setWinningDish(prev => ({
            ...prev,
            name: tieOptions[selectedOption].name,
            image: tieOptions[selectedOption].image
          }));
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [animationComplete, showTieBreaker, selectedOption, tieOptions]);

  const handleNavigate = (tab: string) => {
    setIsExiting(true);
    setTimeout(() => {
      setActiveTab(tab as any);
    }, 300);
  };

  // Page transition variants
  const pageVariants = {
    initial: {
      scale: 1,
      opacity: 1
    },
    enter: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: { 
      scale: 1.05,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  // Card flip animation for tie breaker options
  const cardVariants = {
    initial: { rotateY: 0 },
    flip: (i: number) => ({
      rotateY: [0, 180, 0],
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.6,
        delay: i * 0.2,
        ease: "easeInOut"
      }
    }),
    selected: {
      scale: 1.05,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.3
      }
    },
    unselected: {
      scale: 0.95,
      opacity: 0.7,
      transition: {
        duration: 0.3
      }
    }
  };

  if (!winningDish) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50"
      initial="initial"
      animate={isExiting ? "exit" : "enter"}
      exit="exit"
      variants={pageVariants}
    >
      {(!showTieBreaker || animationComplete) && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#f97316', '#7A9B76', '#0ea5e9', '#8b5cf6']}
        />
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                handleNavigate('home');
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
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {showTieBreaker ? (
            <motion.div
              key="tiebreaker"
              initial="initial"
              animate="enter"
              exit="exit"
              variants={pageVariants}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Tie Breaker Banner */}
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white text-center relative"
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ 
                  duration: 10, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: 0.3
                  }}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <motion.div
                    animate={{ 
                      rotate: tieBreakingStarted ? [0, 360] : 0
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: tieBreakingStarted ? Infinity : 0,
                      ease: "linear"
                    }}
                  >
                    <Scale className="w-8 h-8 text-blue-500" />
                  </motion.div>
                </motion.div>
                <motion.h2 
                  className="text-3xl font-bold mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Breaking the Tie
                </motion.h2>
                <motion.p 
                  className="text-blue-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Randomly selecting a winner between the tied options
                </motion.p>
              </motion.div>

              {/* Tie Breaker Content */}
              <div className="p-8">
                <div className="grid grid-cols-2 gap-6 mb-8 perspective-1000">
                  {tieOptions.map((option, index) => (
                    <motion.div
                      key={index}
                      custom={index}
                      variants={cardVariants}
                      initial="initial"
                      animate={
                        tieBreakingStarted 
                          ? selectedOption === index 
                            ? "selected" 
                            : selectedOption !== null 
                              ? "unselected" 
                              : "flip"
                          : "initial"
                      }
                      whileHover={!tieBreakingStarted ? { scale: 1.03 } : {}}
                      className={`relative rounded-xl overflow-hidden border-4 shadow-lg transform transition-all duration-300 ${
                        selectedOption === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <img
                        src={option.image}
                        alt={option.name}
                        className="w-full h-[200px] object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-xl font-bold text-white">{option.name}</h3>
                      </div>
                      
                      {/* Highlight overlay when selected */}
                      {selectedOption === index && tieBreakingStarted && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: [0.2, 0.4, 0.2],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="absolute inset-0 bg-blue-500 mix-blend-overlay"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Progress bar for animation */}
                {tieBreakingStarted && !animationComplete && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 overflow-hidden">
                    <motion.div 
                      className="bg-blue-500 h-2.5 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${animationProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}

                {!tieBreakingStarted ? (
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTieBreaker}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                  >
                    <Scale className="w-5 h-5" />
                    Break the Tie
                  </motion.button>
                ) : !animationComplete ? (
                  <div className="text-center text-gray-600">
                    <motion.p 
                      className="text-lg"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        color: ["#4B5563", "#2563EB", "#4B5563"]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      Selecting a winner...
                    </motion.p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <motion.p 
                      className="text-xl font-bold text-green-600"
                      animate={{ 
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 0.5,
                        times: [0, 0.5, 1]
                      }}
                    >
                      Winner Selected!
                    </motion.p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial="initial"
              animate="enter"
              exit="exit"
              variants={pageVariants}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Winner Banner */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white text-center relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 15, -15, 0] }}
                  transition={{ 
                    scale: { delay: 0.2, type: "spring" },
                    rotate: { delay: 0.5, duration: 0.6 }
                  }}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Trophy className="w-8 h-8 text-orange-500" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold mb-2"
                >
                  We Have a Winner!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-orange-100"
                >
                  The votes are in and the decision has been made
                </motion.p>
              </div>

              {/* Winner Details */}
              <div className="p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative rounded-xl overflow-hidden mb-6"
                >
                  <img
                    src={winningDish.image}
                    alt={winningDish.name}
                    className="w-full h-[300px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-3xl font-bold text-white mb-2"
                    >
                      {winningDish.name}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="text-white/90"
                    >
                      {winningDish.description}
                    </motion.p>
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-orange-50 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                      <Star className="w-5 h-5" />
                      <span className="font-semibold">Rating</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{winningDish.rating}/5.0</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-orange-50 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">Votes</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {winningDish.votes}/{winningDish.totalVotes}
                    </p>
                  </motion.div>
                </div>

                {/* Participants */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mb-8"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Participants</h4>
                  <div className="flex -space-x-2 overflow-hidden">
                    {winningDish.participants.map((participant: any, index: number) => (
                      <motion.img
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        src={participant.avatar}
                        alt={participant.name}
                        className="w-10 h-10 rounded-full border-2 border-white"
                        title={participant.name}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleNavigate('create');
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Start New Vote
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigate('home')}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    Return Home
                  </motion.button>
                </motion.div>

                {/* Share Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Share Result
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}