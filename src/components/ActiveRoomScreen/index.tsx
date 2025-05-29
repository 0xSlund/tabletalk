import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, ArrowLeft, Plus, Trophy, Loader2 } from 'lucide-react';
import { useAppStore } from '../../lib/store';

// Import components
import { Discussion } from './components/Discussion';
import { FoodSuggestionForm } from './components/FoodSuggestions';
import { TieHandler } from './components/TieHandler';
import { Voting } from './components/Voting';
import { RoomSidebar } from './components/RoomSidebar';

// Import hooks
import { useConfetti } from './hooks/useConfetti';

// Import utilities
import { pageVariants } from './utils/animations';
import { FoodSuggestion } from './utils/types';
import { handleExpiredRoom } from './utils/expiredRoomHandler';

// Import context
import { RoomProvider } from './contexts/RoomContext';

export function ActiveRoomScreen() {
  const navigate = useNavigate();
  const { currentRoom, setActiveTab, updateRoom, recordVotingResult, joinRoom } = useAppStore();
  
  // State variables
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [hasTie, setHasTie] = useState(false);
  const [tiedOptions, setTiedOptions] = useState<FoodSuggestion[]>([]);
  const [roomLoaded, setRoomLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom hooks
  const { confettiCanvasRef, triggerConfetti } = useConfetti();
  
  // Effect to load room from localStorage if needed
  useEffect(() => {
    const loadRoomFromStorage = async () => {
      // If we don't have a currentRoom with an ID or it appears empty, try to load from localStorage
      if (!currentRoom?.id || (!currentRoom?.name && !roomLoaded)) {
        const lastRoomId = localStorage.getItem('tabletalk-last-room-id');
        if (lastRoomId) {
          console.log('No current room detected - attempting to load from localStorage:', lastRoomId);
          setIsLoading(true);
          try {
            // Attempt to join the room using the ID
            const success = await joinRoom(lastRoomId);
            if (success) {
              console.log('Successfully loaded room from localStorage');
              
              // Give a moment for data to load completely
              setTimeout(() => {
                setRoomLoaded(true);
                setIsLoading(false);
              }, 500);
            } else {
              console.error('Failed to load room from localStorage');
              navigate('/');
            }
          } catch (error) {
            console.error('Error loading room from localStorage:', error);
            navigate('/');
          }
        } else {
          console.log('No room ID in localStorage, redirecting to home');
          navigate('/');
        }
      } else {
        console.log('Room already loaded:', currentRoom.id);
        setRoomLoaded(true);
      }
    };
    
    loadRoomFromStorage();
  }, [currentRoom, navigate, joinRoom, roomLoaded]);
  
  // Debug logging for room state
  useEffect(() => {
    if (currentRoom?.id) {
      console.log('ActiveRoomScreen - Current Room:', {
        id: currentRoom.id,
        name: currentRoom.name,
        isActive: currentRoom.isActive,
        participants: currentRoom.participants.length,
        expiresAt: currentRoom.expiresAt
      });
    }
  }, [currentRoom]);
  
  // Effect to handle expired rooms
  useEffect(() => {
    if (currentRoom && currentRoom.id && !roomLoaded) {
      // Check if the room is expired
      const now = new Date();
      const expiresAt = new Date(currentRoom.expiresAt);
      const isExpired = expiresAt <= now;
      
      if (isExpired) {
        console.log('Room is expired, fetching votes and showing results');
        
        // Handle expired room logic
        handleExpiredRoom(currentRoom.id)
          .then(success => {
            if (success) {
              console.log('Successfully handled expired room');
              // Ensure isViewingCompletedRoom is set to true
              useAppStore.setState(state => ({
                ...state,
                isViewingCompletedRoom: true
              }));
            } else {
              console.error('Failed to handle expired room properly');
            }
            setRoomLoaded(true);
          })
          .catch(error => {
            console.error('Error handling expired room:', error);
            setRoomLoaded(true);
          });
      } else {
        setRoomLoaded(true);
      }
    }
  }, [currentRoom, roomLoaded]);
  
  // Function to handle creation of a food suggestion
  const handleCreateSuggestion = (foodName: string, emoji: string, description: string) => {
    if (!currentRoom) return;
  
    // Create new suggestion with upvote/downvote options
    const newSuggestion = {
      id: Date.now().toString(),
      text: foodName, // Use the food name as the text field
      votes: 0,
      author: 'You',
      timestamp: new Date().toISOString(),
      options: [
        {
          id: Math.random().toString(36).substr(2, 9),
          text: 'Upvote',
          votes: 0,
          voters: []
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          text: 'Downvote',
          votes: 0,
          voters: []
        }
      ],
      // Add custom properties for display
      name: foodName,
      emoji: emoji,
      description: description
    };
    
    // Update the room with the new suggestion
    updateRoom({
      ...currentRoom,
      suggestions: [...currentRoom.suggestions, newSuggestion]
    });
    
    setShowSuggestionForm(false);
    triggerConfetti(); // Trigger confetti animation for fun feedback
  };
  
  // Function to handle navigation
  const navigateToHome = () => {
    setIsExiting(true);
    
    setTimeout(() => {
      navigate('/');
    }, 300);
  };
  
  // Handle tie resolution
  const handleResolveTie = (winnerId: string) => {
    if (!currentRoom) return;
    
    // Record the result with metadata
    recordVotingResult(
      currentRoom.id, 
      winnerId,
      '', // Option ID is not needed in this simplified version 
      0   // Vote count is not needed in this simplified version
    );
    
    setHasTie(false);
    
    // Check if room is expired - if so, stay on the active room screen
    const now = new Date();
    const expiresAt = new Date(currentRoom.expiresAt);
    const isExpired = expiresAt <= now;
    
    // Always stay on active room screen and show results there
    console.log('Showing results in active room screen');
    // Update the isViewingCompletedRoom flag to trigger the voting results display
    useAppStore.setState(state => ({
      ...state,
      isViewingCompletedRoom: true
    }));
    
    // Use the handleExpiredRoom utility to load and display votes correctly
    if (currentRoom.id) {
      import('./utils/expiredRoomHandler').then(module => {
        module.handleExpiredRoom(currentRoom.id);
      });
    }
  };
  
  // If room data is not available yet, show loading state
  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <UtensilsCrossed className="w-16 h-16 text-orange-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-700">Loading room...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <RoomProvider>
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 relative overflow-hidden"
        initial="initial"
        animate="initial"
        exit="exit"
        variants={pageVariants}
      >
        {/* Confetti Canvas */}
        <canvas 
          ref={confettiCanvasRef}
          className="fixed inset-0 pointer-events-none z-50"
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
                onClick={navigateToHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
            </button>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-6 h-6 text-orange-500" />
                <h1 className="text-2xl font-bold text-gray-900">{currentRoom.name}</h1>
                
                {/* Show proper room status badges */}
                {!currentRoom.isActive && (
                  <div className="ml-2 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Trophy size={14} />
                    <span>Completed</span>
                  </div>
                )}
                
                {isLoading && (
                  <div className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Loading</span>
                  </div>
                )}
              </div>
              <div className="w-20" /> {/* Spacer for centering */}
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 grid grid-cols-12 gap-6">
          {/* Main Content Area */}
          <div className="col-span-12 md:col-span-8 space-y-6">
            {/* Food Suggestions Section with Voting */}
            <div className="bg-white rounded-2xl shadow-lg p-6 relative">
              {hasTie ? (
                <TieHandler 
                  tiedSuggestions={tiedOptions} 
                  onResolveTie={handleResolveTie} 
                />
              ) : (
                <>
                  {/* Food Suggestions Header Only */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-2 rounded-lg mr-3 shadow-sm">
                        <UtensilsCrossed className="text-white" size={22} />
                      </div>
                      <h2 className="text-xl font-bold">
                        <span className="bg-gradient-to-r from-orange-600 to-amber-600 inline-block text-transparent bg-clip-text">
                          Food Suggestions
                        </span>
                      </h2>
                    </div>
                    
                    <button
                      onClick={() => setShowSuggestionForm(true)}
                      className={`px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 ${
                        // Disable when all votes have been cast
                        currentRoom.suggestions && currentRoom.suggestions.length > 0 && useAppStore.getState().hasVotedOnAll ? 
                        'opacity-50 cursor-not-allowed hover:from-orange-500 hover:to-amber-500' : 
                        'hover:from-orange-600 hover:to-amber-600'
                      }`}
                      disabled={currentRoom.suggestions && currentRoom.suggestions.length > 0 && useAppStore.getState().hasVotedOnAll}
                    >
                      <Plus size={18} />
                      <span>Add Option</span>
                    </button>
                  </div>
                  
                  {/* Voting component or Empty State */}
                  {currentRoom.suggestions && currentRoom.suggestions.length > 0 ? (
                    <Voting />
                  ) : (
                    <div className="text-center py-12">
                      <UtensilsCrossed className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-700 mb-2">No food options yet</h3>
                      <p className="text-gray-500 mb-6">Add some food options to start voting</p>
                      <button
                        onClick={() => setShowSuggestionForm(true)}
                        className={`px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg transition-all duration-200 shadow-sm flex items-center gap-2 mx-auto ${
                          useAppStore.getState().hasVotedOnAll ? 
                          'opacity-50 cursor-not-allowed hover:from-orange-500 hover:to-amber-500' : 
                          'hover:from-orange-600 hover:to-amber-600'
                        }`}
                        disabled={useAppStore.getState().hasVotedOnAll}
                      >
                        <Plus size={20} />
                        <span>Add First Option</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
                
            {/* Discussion Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <Discussion />
            </div>
          </div>
        
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-4 space-y-6">
            <RoomSidebar />
          </div>
        </main>
        
        {/* Food Suggestion Form Modal with Blurred Background */}
        {showSuggestionForm && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowSuggestionForm(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <FoodSuggestionForm 
                onSubmit={handleCreateSuggestion} 
                onCancel={() => setShowSuggestionForm(false)} 
              />
            </div>
          </div>
        )}
      </motion.div>
    </RoomProvider>
  );
} 