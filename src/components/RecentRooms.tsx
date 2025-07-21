import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Clock, Trophy, MessageCircle, AlertCircle,
  Loader2, UserPlus, Utensils, Coffee, Pizza, Sandwich, IceCream,
  Apple, Beef, Cake, Cherry, Cookie, Croissant, Egg, Fish, Grape,
  Popcorn, Soup, Wine, ChevronLeft, ChevronRight, History
} from 'lucide-react';
import { formatTimeRemaining } from '../lib/utils';
import { LoadingDots, EmptyState } from './SkeletonLoader';
import { useNavigate } from 'react-router-dom';
import { RoomStatusBadge, getRoomStatus, type RoomStatus } from './RoomStatusBadge';
import { useAppStore } from '../lib/store';

interface RecentRoomsProps {
  rooms: any[];
  activeRoom?: any; // New prop for the active room
  isLoading: boolean;
  darkMode?: boolean;
}

export function RecentRooms({ rooms, activeRoom, isLoading, darkMode = false }: RecentRoomsProps) {
  const navigate = useNavigate();
  const [currentIcon, setCurrentIcon] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Persist some state to localStorage to prevent button flickering during navigation
  const [persistedRoomCount, setPersistedRoomCount] = useState(() => {
    const saved = localStorage.getItem('tabletalk-room-count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const foodIcons = [
    Pizza, Utensils, Coffee, IceCream, Sandwich, 
    Apple, Cake, Cherry, Cookie, Croissant, 
    Egg, Fish, Grape, Popcorn, Soup, Wine
  ];
  const roomsPerPage = 3;
  const maxRooms = 12; // Show last 12 rooms total
  
  // Filter out the active room from the rooms list if it exists and was passed separately
  // Only filter it out if we're going to show it separately at the top
  const filteredRooms = activeRoom 
    ? rooms.filter(room => room.id !== activeRoom.id) 
    : rooms;
  
  // Take only the last 12 rooms and paginate them
  const recentRooms = filteredRooms.slice(0, maxRooms);
  const totalPages = Math.ceil(recentRooms.length / roomsPerPage);
  const currentRooms = recentRooms.slice(currentPage * roomsPerPage, (currentPage + 1) * roomsPerPage);
  
  // Calculate total rooms for UI conditions - use consistent source
  const totalRoomsCount = rooms.length;
  const hasMoreThanOnePage = totalPages > 1;
  
  // Update persisted room count when we have real data
  useEffect(() => {
    if (!isLoading && totalRoomsCount > 0) {
      setPersistedRoomCount(totalRoomsCount);
      localStorage.setItem('tabletalk-room-count', totalRoomsCount.toString());
    }
  }, [isLoading, totalRoomsCount]);
  
  // Use the higher of current or persisted count to prevent flickering
  const effectiveRoomCount = Math.max(totalRoomsCount, persistedRoomCount);
  
  // Persist button visibility state to prevent flickering during navigation
  const shouldShowViewAllButton = effectiveRoomCount > 3;
  const shouldShowPagination = !isLoading && hasMoreThanOnePage;
  
  // Navigation functions
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };
  
  // Ref for the section to track visibility
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnnounced, setHasAnnounced] = useState(false);
  
  // Enhanced animation variants for smooth transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3, // Reduced from 0.6
        ease: "easeOut",
        staggerChildren: 0.05, // Reduced from 0.1
        delayChildren: 0.1 // Reduced from 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 10, // Reduced from 20
      scale: 0.98 // Reduced from 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3, // Reduced from 0.5
        ease: "easeOut"
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -5 }, // Reduced from -10
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.2, // Reduced from 0.4
        ease: "easeOut"
      }
    }
  };
  
  // Screen reader announcements
  useEffect(() => {
    if (!isLoading && rooms.length > 0 && !hasAnnounced) {
      const announcement = `${rooms.length} recent rooms loaded, showing ${Math.min(rooms.length, 3)} rooms`;
      document.getElementById('sr-announcement')?.setAttribute('aria-label', announcement);
      setHasAnnounced(true);
    }
  }, [isLoading, rooms.length, hasAnnounced]);

  // Rotate through food icons with variable timing - OPTIMIZED
  useEffect(() => {
    // Randomize the initial icon
    setCurrentIcon(Math.floor(Math.random() * foodIcons.length));
    
    let iconIntervalId: NodeJS.Timeout | null = null;
    
    const setRandomIconChange = () => {
      // Get a new random icon that's different from the current one
      let newIcon;
      do {
        newIcon = Math.floor(Math.random() * foodIcons.length);
      } while (newIcon === currentIcon);
      
      setCurrentIcon(newIcon);
      
      // Increased interval for better performance: 8-12 seconds instead of 2-4
      const nextInterval = Math.floor(Math.random() * 4000) + 8000; // 8-12 seconds
      
      // Clear previous interval and set a new one
      if (iconIntervalId) clearTimeout(iconIntervalId);
      iconIntervalId = setTimeout(setRandomIconChange, nextInterval);
    };
    
    // Start the first interval - increased delay
    iconIntervalId = setTimeout(setRandomIconChange, 10000); // 10 seconds instead of 3
    
    return () => {
      if (iconIntervalId) clearTimeout(iconIntervalId);
    };
  }, []); // Removed currentIcon dependency to prevent excessive re-renders

  // Reset current page when rooms change to prevent being stuck on non-existent pages
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(0);
    }
  }, [totalPages, currentPage]);

  // Debug log the rooms (only in development) - removed to prevent console spam
  // Debug: console.log('RecentRooms: Rendering with data:', { totalRooms: rooms.length, activeRoom, currentRooms, isLoading });

  // Function to render a room card - extracted to avoid code duplication
  const renderRoomCard = (room: any, isActiveHighlighted = false) => {
    // Determine room status
    const hasResults = Boolean(room.winningChoice);
    const roomStatus = getRoomStatus(room.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), hasResults);
    
    // Use room code for navigation instead of ID to ensure consistency with routing
    const roomCode = room.code || room.id; // Fallback to ID if code is missing
    let roomRoute = `/active-room/${roomCode}`;
    if (roomStatus === 'completed') {
      roomRoute = `/completed-room/${roomCode}`;
    } else if (roomStatus === 'expired') {
      roomRoute = `/expired-room/${roomCode}`;
    }
    
    // Handle navigation with proper previousPage setting and error handling
    const handleRoomClick = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log(`Room card clicked:`, { 
        roomName: room.name, 
        roomId: room.id, 
        roomCode: room.code, 
        roomStatus,
        isActiveHighlighted 
      });
      
      // Basic validation that should not fail since fetchRecentRooms filters these out
      if (!room.id || (!room.code && room.id.length <= 10)) {
        console.error('Room is missing required navigation data:', { id: room.id, code: room.code });
        return;
      }
      
      try {
        // Set previous page for navigation
        useAppStore.setState(state => ({
          ...state,
          previousPage: 'home'
        }));
        
        // Store the room ID in localStorage to help with navigation
        localStorage.setItem('tabletalk-last-room-id', room.id);
        
        // For recent rooms, prefer using room code for navigation if available
        const navigationIdentifier = room.code || room.id;
        
        // Pre-load the room data to prevent infinite loading
        console.log(`Pre-loading room data for: ${navigationIdentifier}`);
        const { joinRoom } = useAppStore.getState();
        const joinSuccess = await joinRoom(navigationIdentifier);
        
        if (joinSuccess) {
          // Navigate to the room after successful join
          console.log(`Successfully joined room, navigating to: ${roomRoute}`);
          navigate(roomRoute);
        } else {
          console.error(`Failed to join room: ${navigationIdentifier}`);
          // Still try to navigate in case the room exists but join failed
          navigate(roomRoute);
        }
      } catch (error) {
        console.error('Error during room navigation:', error);
        // Still try to navigate as a fallback
        navigate(roomRoute);
      }
    };
    
    return (
    <motion.div 
      className="block"
      aria-label={`${room.name}, ${roomStatus} room`}
      onClick={handleRoomClick}
      variants={cardVariants}
      whileHover={{ 
        scale: 1.02, 
        y: -4,
        transition: { duration: 0.15, ease: "easeOut" } // Reduced from 0.2
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.05, ease: "easeOut" } // Reduced from 0.1
      }}
    >
      <div
        className={`
          rounded-xl p-4 sm:p-5 transition-all duration-300 ease-out text-left relative overflow-hidden cursor-pointer shadow-md hover:shadow-xl
          ${darkMode 
            ? `border border-gray-700 ${
                isActiveHighlighted
                  ? 'bg-gradient-to-br from-primary/15 to-primary/5 border-primary/20'
                    : roomStatus === 'active'
                      ? 'bg-gradient-to-br from-blue-900/40 via-gray-800 to-gray-800 border-blue-500/30' 
                      : roomStatus === 'completed'
                        ? 'bg-gradient-to-br from-green-900/40 via-gray-800 to-gray-800 border-green-500/30'
                    : 'bg-gray-800'
              }`
            : `border border-black border-opacity-[0.06] ${
                isActiveHighlighted
            ? 'bg-gradient-to-br from-primary/15 to-primary/5 border-primary/20'
              : roomStatus === 'active'
                ? 'bg-gradient-to-br from-blue-50 via-white to-blue-50 border-blue-200' 
                : roomStatus === 'completed'
                  ? 'bg-gradient-to-br from-green-50 via-white to-green-50 border-green-200'
              : 'bg-white'
              }`
          }
        `}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleRoomClick(e as any);
          }
        }}
      >
        {/* Border accent */}
          <div className={`absolute inset-0 rounded-xl border-2 ${roomStatus === 'active' ? 'border-blue-300 border-opacity-30' : 'border-blue-300 border-opacity-30'} opacity-0 group-hover:opacity-100 transition-opacity`} />
          
          {/* Status badge - positioned based on status */}
          {!isActiveHighlighted && (
            <div className={`absolute z-10 ${
              roomStatus === 'expired' 
                ? 'bottom-3 right-3' 
                : 'top-3 right-3'
            }`}>
              <RoomStatusBadge 
                status={roomStatus}
                expiresAt={room.expiresAt}
                darkMode={darkMode}
                variant="badge"
              />
            </div>
          )}
        
        {/* "Continue where you left off" label */}
        {isActiveHighlighted && (
          <div className="absolute top-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg font-medium">
            Continue where you left off
          </div>
        )}
        
        <div className="flex flex-col h-full relative z-10">
          <div className="flex justify-between items-start mb-2">
              <h3 className={`font-semibold line-clamp-1 pr-16 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>{room.name}</h3>
              {/* Icon moved to left side since status badge is on right */}
              <div className="shrink-0">
                {roomStatus === 'active' ? (
              <div className="relative">
                <MessageCircle className="w-5 h-5 text-primary" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
              </div>
                ) : roomStatus === 'completed' ? (
              <Trophy className="w-5 h-5 text-primary" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
            )}
          </div>
            </div>
            
            {/* Detailed status card for important statuses */}
            {(roomStatus === 'active' || (roomStatus === 'completed' && hasResults)) && (
              <div className="mb-3">
                <RoomStatusBadge 
                  status={roomStatus}
                  expiresAt={room.expiresAt}
                  winningChoice={room.winningChoice}
                  darkMode={darkMode}
                  variant="card"
                  showDetails={true}
                />
              </div>
            )}
          
          <div className="flex-grow">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs mb-2 ${
              darkMode 
                ? 'bg-gray-700 text-gray-300' 
                : 'bg-black bg-opacity-5 text-gray-600'
            }`}>
              <Users className="w-3 h-3 mr-1" />
              <span>{room.participants} participant{room.participants !== 1 ? 's' : ''}</span>
            </div>
            
            {room.winningChoice && roomStatus === 'completed' && (
              <div className="bg-primary bg-opacity-10 text-primary rounded-md px-3 py-1.5 mb-2 text-sm flex items-center">
                <Trophy className="w-3.5 h-3.5 mr-1.5" />
                <p className="line-clamp-1">{room.winningChoice}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 mt-1">
            <p className="text-sm">
              {roomStatus === 'active' ? (
                <span className="text-primary flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {room.expiresAt 
                    ? `Expires in ${formatTimeRemaining(room.expiresAt)}`
                    : 'Voting in progress'
                  }
                </span>
              ) : (
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Created {room.createdAt}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
  };

  return (
    <motion.section 
      ref={sectionRef} 
      aria-labelledby="recent-rooms" 
      className={`pt-8 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-100'}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div aria-live="polite" id="sr-announcement" className="sr-only"></div>
      
      <motion.div 
        className="flex items-center justify-between mb-6 px-1"
        variants={headerVariants}
      >
        <h2 id="recent-rooms" className={`text-xl font-semibold flex items-center ${darkMode ? 'text-white' : 'text-slate-600'}`}>
          <Clock className="w-5 h-5 mr-2 text-orange-400 bg-orange-50 rounded-lg p-1" />
          Recent Rooms
          {shouldShowViewAllButton && (
            <motion.button
              onClick={() => navigate('/history')}
              className={`ml-4 flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                darkMode 
                  ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-800' 
                  : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <History className="w-4 h-4" />
              View all rooms
            </motion.button>
          )}
        </h2>
        
        {shouldShowPagination && (
          <motion.div 
            className="flex items-center gap-2"
            variants={headerVariants}
          >
            <motion.button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className={`p-2 rounded-lg transition-all ${
                currentPage === 0
                  ? darkMode 
                    ? 'text-gray-600 cursor-not-allowed' 
                    : 'text-gray-300 cursor-not-allowed'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              whileHover={currentPage > 0 ? { scale: 1.05 } : {}}
              whileTap={currentPage > 0 ? { scale: 0.95 } : {}}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            
            <span className={`text-sm px-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {currentPage + 1} of {totalPages}
            </span>
            
            <motion.button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className={`p-2 rounded-lg transition-all ${
                currentPage === totalPages - 1
                  ? darkMode 
                    ? 'text-gray-600 cursor-not-allowed' 
                    : 'text-gray-300 cursor-not-allowed'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              whileHover={currentPage < totalPages - 1 ? { scale: 1.05 } : {}}
              whileTap={currentPage < totalPages - 1 ? { scale: 0.95 } : {}}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
        
        {isLoading && rooms.length === 0 && (
          <motion.div 
            className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            variants={headerVariants}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading rooms...</span>
          </motion.div>
        )}
      </motion.div>
      
      {isLoading && rooms.length === 0 ? (
        <motion.div 
          className={`rounded-xl p-8 shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          initial={{ opacity: 0, y: 10 }} // Reduced from y: 20
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }} // Reduced from y: -20
          transition={{ duration: 0.2, ease: "easeOut" }} // Reduced from 0.4
        >
          <div className="flex flex-col items-center space-y-4">
            <LoadingDots />
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading your recent rooms...</p>
          </div>
        </motion.div>
      ) : rooms.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} // Reduced from 0.95
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }} // Reduced from 0.5
        >
          <EmptyState
            icon={foodIcons[currentIcon]}
            title="Ready to start deciding together?"
            description="Create a new room to start voting with friends, or join an existing room using a room code."
            theme={darkMode ? 'dark' : 'light'}
          />
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* First render the active room at the top if it exists */}
          {activeRoom && (
            <motion.div 
              key={`active-room-${activeRoom.id}`}
              variants={cardVariants}
            >
              {renderRoomCard(activeRoom, true)}
            </motion.div>
          )}
          
          {/* Then render all other rooms from current page */}
          {currentRooms.map(room => (
            <motion.div 
              key={`room-${room.id}`}
              variants={cardVariants}
            >
              {renderRoomCard(room)}
            </motion.div>
          ))}
          
          {/* If no rooms are displayed after filtering, show a message */}
          {recentRooms.length === 0 && !activeRoom && (
            <motion.div 
              className={`col-span-full p-6 rounded-xl shadow-sm text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
              variants={cardVariants}
            >
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No additional rooms to display.</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.section>
  );
}