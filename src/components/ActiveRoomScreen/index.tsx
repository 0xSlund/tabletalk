import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { getThemeColors } from './utils/themeUtils';

// Import context
import { RoomProvider, useRoomContext } from './contexts/RoomContext';

// This is the new component that will render the actual room content
const ActiveRoomView = () => {
  const navigate = useNavigate();
  const { currentRoom } = useAppStore();
  const { roomExpired } = useRoomContext();

  // Get theme colors based on room's food mode
  const theme = getThemeColors(currentRoom?.foodMode);

  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [hasTie, setHasTie] = useState(false);
  const [tiedOptions, setTiedOptions] = useState<FoodSuggestion[]>([]);
  
  const { confettiCanvasRef, triggerConfetti } = useConfetti();
  
  const handleCreateSuggestion = (foodName: string, emoji: string, description: string) => {
    if (!currentRoom) return;
    const { updateRoom } = useAppStore.getState();
    const newSuggestion = {
      id: Date.now().toString(),
      text: foodName,
      votes: 0,
      author: 'You',
      timestamp: new Date().toISOString(),
      options: [ { id: Math.random().toString(36).substr(2, 9), text: 'Upvote', votes: 0, voters: [] }, { id: Math.random().toString(36).substr(2, 9), text: 'Downvote', votes: 0, voters: [] } ],
      name: foodName,
      emoji: emoji,
      description: description
    };
    updateRoom({ ...currentRoom, suggestions: [...currentRoom.suggestions, newSuggestion] });
    setShowSuggestionForm(false);
    triggerConfetti();
  };
  
  const navigateToHome = () => {
    setIsExiting(true);
    setTimeout(() => navigate('/'), 300);
  };
  
  const handleResolveTie = (winnerId: string) => {
    if (!currentRoom) return;
    const { recordVotingResult } = useAppStore.getState();
    recordVotingResult(currentRoom.id, winnerId, '', 0);
    setHasTie(false);
    useAppStore.setState(state => ({ ...state, isViewingCompletedRoom: true }));
    if (currentRoom.id) {
      import('./utils/expiredRoomHandler').then(module => {
        module.handleExpiredRoom(currentRoom.id);
      });
    }
  };
  
  const { hasVotedOnAll } = useAppStore.getState();

  // If room data is not available yet, this component shouldn't even be rendered,
  // but as a fallback, show a minimal loading state.
  if (!currentRoom) {
    return <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradientFallback}`} />;
  }

  return (
    <motion.div 
      className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} relative overflow-hidden`}
      initial="initial"
      animate="initial"
      exit="exit"
      variants={pageVariants}
    >
      <canvas ref={confettiCanvasRef} className="fixed inset-0 pointer-events-none z-50" style={{ width: '100%', height: '100%' }} />
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button onClick={navigateToHome} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className={`w-6 h-6 ${theme.headerIcon}`} />
              <h1 className="text-2xl font-bold text-gray-900">{currentRoom.name}</h1>
              {!currentRoom.isActive && (
                <div className="ml-2 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Trophy size={14} />
                  <span>Completed</span>
                </div>
              )}
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 relative">
            {hasTie ? (
              <TieHandler tiedSuggestions={tiedOptions} onResolveTie={handleResolveTie} />
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className={`bg-gradient-to-r ${theme.buttonBg} p-2 rounded-lg mr-3 shadow-sm`}>
                      <UtensilsCrossed className="text-white" size={22} />
                    </div>
                    <h2 className="text-xl font-bold">
                      <span className={`bg-gradient-to-r ${theme.titleGradient} inline-block text-transparent bg-clip-text`}>Food Suggestions</span>
                    </h2>
                  </div>
                  <button onClick={() => setShowSuggestionForm(true)} className={`px-4 py-2 bg-gradient-to-r ${theme.buttonBg} text-white rounded-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 ${(hasVotedOnAll || roomExpired) ? `opacity-50 cursor-not-allowed ${theme.buttonBgDisabled}` : theme.buttonBgHover}`} disabled={hasVotedOnAll || roomExpired}>
                    <Plus size={18} />
                    <span>Add Option</span>
                  </button>
                </div>
                {currentRoom.suggestions && currentRoom.suggestions.length > 0 ? (
                  <Voting roomExpired={roomExpired} />
                ) : (
                  <div className="text-center py-12">
                    <UtensilsCrossed className={`w-16 h-16 ${theme.iconColor} mx-auto mb-4`} />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No food options yet</h3>
                    <p className="text-gray-500 mb-6">Add some food options to start voting</p>
                    <button onClick={() => setShowSuggestionForm(true)} className={`px-6 py-3 bg-gradient-to-r ${theme.buttonBg} text-white rounded-lg transition-all duration-200 shadow-sm flex items-center gap-2 mx-auto ${(hasVotedOnAll || roomExpired) ? `opacity-50 cursor-not-allowed ${theme.buttonBgDisabled}` : theme.buttonBgHover}`} disabled={hasVotedOnAll || roomExpired}>
                      <Plus size={20} />
                      <span>Add First Option</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <Discussion roomExpired={roomExpired} />
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 space-y-6">
          <RoomSidebar />
        </div>
      </main>
      {showSuggestionForm && !roomExpired && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowSuggestionForm(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <FoodSuggestionForm onSubmit={handleCreateSuggestion} onCancel={() => setShowSuggestionForm(false)} />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export function ActiveRoomScreen() {
  const { currentRoom } = useAppStore();
  const [roomLoaded, setRoomLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { roomCode } = useParams();

  // This effect handles room loading from URL or storage
  useEffect(() => {
    const loadRoom = async () => {
      // If we have a room code in the URL, use that
      if (roomCode && (!currentRoom?.code || currentRoom.code !== roomCode)) {
        console.log(`Loading room from URL with code: ${roomCode}`);
        setIsLoading(true);
        const { joinRoom } = useAppStore.getState();
        const success = await joinRoom(roomCode);
        if (success) {
          setRoomLoaded(true);
        } else {
          console.error(`Failed to join room with code: ${roomCode}`);
          navigate('/');
        }
        setIsLoading(false);
        return;
      }
      
      // If we don't have a room code in URL but have a current room, we're good
      if (currentRoom?.id) {
        setRoomLoaded(true);
        // Update URL to include room code if it's missing
        if (currentRoom.code && !roomCode) {
          navigate(`/active-room/${currentRoom.code}`, { replace: true });
        }
        return;
      }
      
      // Fallback: try to load from localStorage (for backward compatibility)
      if (!roomLoaded) {
        const lastRoomId = localStorage.getItem('tabletalk-last-room-id');
        if (lastRoomId) {
          setIsLoading(true);
          const { joinRoom } = useAppStore.getState();
          const success = await joinRoom(lastRoomId);
          if (success) {
            setRoomLoaded(true);
            // Get the current room and navigate to its code URL
            const { currentRoom: loadedRoom } = useAppStore.getState();
            if (loadedRoom?.code) {
              navigate(`/active-room/${loadedRoom.code}`, { replace: true });
            }
          } else {
            navigate('/');
          }
          setIsLoading(false);
        } else {
          navigate('/');
        }
      }
    };
    
    loadRoom();
  }, [roomCode, currentRoom?.id, currentRoom?.code, roomLoaded, navigate]);

  if (!currentRoom?.id || isLoading) {
    // Get default theme for loading state since we don't have room data yet
    const loadingTheme = getThemeColors(null);
    return (
      <div className={`min-h-screen bg-gradient-to-br ${loadingTheme.bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <UtensilsCrossed className={`w-16 h-16 ${loadingTheme.loadingIcon} mx-auto mb-4 animate-pulse`} />
          <h2 className="text-2xl font-bold text-gray-700">Loading room...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <RoomProvider>
      <ActiveRoomView />
    </RoomProvider>
  );
} 