import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Clock, Trophy, MessageCircle, ChevronLeft, ChevronRight, 
  Loader2, UserPlus, Utensils, Coffee, Pizza, Sandwich, IceCream,
  Apple, Beef, Cake, Cherry, Cookie, Croissant, Egg, Fish, Grape,
  Popcorn, Soup, Wine
} from 'lucide-react';
import { formatTimeRemaining } from '../lib/utils';
import { LoadingDots, EmptyState } from './SkeletonLoader';
import { Link } from 'react-router-dom';

interface RecentRoomsProps {
  rooms: any[];
  activeRoom?: any; // New prop for the active room
  isLoading: boolean;
  onNavigate: (tab: string) => void;
  darkMode?: boolean;
}

export function RecentRooms({ rooms, activeRoom, isLoading, onNavigate, darkMode = false }: RecentRoomsProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [currentIcon, setCurrentIcon] = useState(0);
  const foodIcons = [
    Pizza, Utensils, Coffee, IceCream, Sandwich, 
    Apple, Cake, Cherry, Cookie, Croissant, 
    Egg, Fish, Grape, Popcorn, Soup, Wine
  ];
  const roomsPerPage = 3;
  
  // Filter out the active room from the rooms list if it exists and was passed separately
  // Only filter it out if we're going to show it separately at the top
  const filteredRooms = activeRoom 
    ? rooms.filter(room => room.id !== activeRoom.id) 
    : rooms;
  
  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / roomsPerPage));
  
  // Ensure currentPage is within bounds
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);
  
  // Get current page of rooms
  const currentRooms = filteredRooms.slice(
    currentPage * roomsPerPage, 
    (currentPage + 1) * roomsPerPage
  );
  
  // Ref for the section to track visibility
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnnounced, setHasAnnounced] = useState(false);
  
  // Optimized room card variants with reduced animation
  const roomCardVariants = {
    initial: { 
      scale: 1,
      y: 0,
    },
    hover: { 
      scale: 1.03,
      y: -4,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    tap: { 
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  // Active room card variants with a slightly distinct animation
  const activeRoomCardVariants = {
    initial: { 
      scale: 1,
      y: 0,
    },
    hover: { 
      scale: 1.02,
      y: -4,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    tap: { 
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };
  
  // Container for staggered animations
  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Screen reader announcements
  useEffect(() => {
    if (!isLoading && rooms.length > 0 && !hasAnnounced) {
      const announcement = `${rooms.length} recent rooms loaded, showing page ${currentPage + 1} of ${totalPages}`;
      document.getElementById('sr-announcement')?.setAttribute('aria-label', announcement);
      setHasAnnounced(true);
    }
  }, [isLoading, rooms.length, currentPage, totalPages, hasAnnounced]);

  // Rotate through food icons with variable timing
  useEffect(() => {
    // Randomize the initial icon
    setCurrentIcon(Math.floor(Math.random() * foodIcons.length));
    
    let iconIntervalId = null;
    
    const setRandomIconChange = () => {
      // Get a new random icon that's different from the current one
      let newIcon;
      do {
        newIcon = Math.floor(Math.random() * foodIcons.length);
      } while (newIcon === currentIcon);
      
      setCurrentIcon(newIcon);
      
      // Randomize the next interval between 2-4 seconds
      const nextInterval = Math.floor(Math.random() * 2000) + 2000; // 2-4 seconds
      
      // Clear previous interval and set a new one
      if (iconIntervalId) clearTimeout(iconIntervalId);
      iconIntervalId = setTimeout(setRandomIconChange, nextInterval);
    };
    
    // Start the first interval
    iconIntervalId = setTimeout(setRandomIconChange, 3000);
    
    return () => {
      if (iconIntervalId) clearTimeout(iconIntervalId);
    };
  }, []);

  // Debug log the rooms
  useEffect(() => {
    console.log('RecentRooms received:', { 
      roomsLength: rooms.length, 
      rooms: rooms.map(r => ({ id: r.id, name: r.name, isActive: r.isActive })),
      activeRoom: activeRoom?.id
    });
  }, [rooms, activeRoom]);

  // Debug logging
  useEffect(() => {
    console.log('RecentRooms Component:', {
      receivedRooms: rooms.length,
      filteredRooms: filteredRooms.length,
      currentPage,
      totalPages,
      roomsPerPage,
      displayedRooms: currentRooms.length,
      hasActiveRoom: !!activeRoom
    });
  }, [rooms, filteredRooms, currentPage, totalPages, currentRooms, activeRoom]);

  // Function to render a room card - extracted to avoid code duplication
  const renderRoomCard = (room, isActiveHighlighted = false) => (
    <Link 
      key={room.id} 
      to="/active-room"
      className="block"
      aria-label={`${room.name}, ${room.isActive ? 'Active room' : 'Completed room'}`}
      onClick={() => {
        // Store the room ID in localStorage to help with navigation
        localStorage.setItem('tabletalk-last-room-id', room.id);
        console.log('Setting last room ID:', room.id);
      }}
    >
      <motion.div
        variants={isActiveHighlighted ? activeRoomCardVariants : roomCardVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className={`
          rounded-xl p-4 sm:p-5 transition-all text-left relative overflow-hidden cursor-pointer border border-black border-opacity-[0.06] shadow-md
          ${isActiveHighlighted
            ? 'bg-gradient-to-br from-primary/15 to-primary/5 border-primary/20'
            : room.isActive 
              ? 'bg-gradient-to-br from-primary to-primary bg-opacity-10 from-opacity-10 to-opacity-5' 
              : 'bg-white'
          }
        `}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.href = '/active-room';
          }
        }}
      >
        {/* Border accent */}
        <div className={`absolute inset-0 rounded-xl border-2 ${room.isActive ? 'border-primary border-opacity-30' : 'border-blue-300 border-opacity-30'} opacity-0 group-hover:opacity-100 transition-opacity`} />
        
        {/* "Continue where you left off" label */}
        {isActiveHighlighted && (
          <div className="absolute top-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg font-medium">
            Continue where you left off
          </div>
        )}
        
        <div className="flex flex-col h-full relative z-10">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-800 line-clamp-1">{room.name}</h3>
            {room.isActive ? (
              <div className="relative">
                <MessageCircle className="w-5 h-5 text-primary" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
              </div>
            ) : (
              <Trophy className="w-5 h-5 text-primary" />
            )}
          </div>
          
          <div className="flex-grow">
            <div className="inline-flex items-center bg-black bg-opacity-5 px-2 py-1 rounded-full text-xs text-gray-600 mb-2">
              <Users className="w-3 h-3 mr-1" />
              <span>{room.participants} participant{room.participants !== 1 ? 's' : ''}</span>
            </div>
            
            {room.winningChoice && !room.isActive && (
              <div className="bg-primary bg-opacity-10 text-primary rounded-md px-3 py-1.5 mb-2 text-sm flex items-center">
                <Trophy className="w-3.5 h-3.5 mr-1.5" />
                <p className="line-clamp-1">{room.winningChoice}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 mt-1">
            <p className="text-sm">
              {room.isActive ? (
                <span className="text-primary flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {room.expiresAt 
                    ? `Expires in ${formatTimeRemaining(room.expiresAt)}`
                    : 'Voting in progress'
                  }
                </span>
              ) : (
                <span className="text-gray-500">
                  Created {room.createdAt}
                </span>
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );

  return (
    <section ref={sectionRef} aria-labelledby="recent-rooms" className="border-t border-gray-100 pt-8">
      <div aria-live="polite" id="sr-announcement" className="sr-only"></div>
      
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 id="recent-rooms" className="text-xl font-semibold text-gray-800 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-primary" />
          Recent Rooms
          {rooms.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({rooms.length})
            </span>
          )}
        </h2>
        
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading rooms...</span>
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button 
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className={`p-2 rounded-full ${currentPage === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500" aria-live="polite">
              {currentPage + 1} / {totalPages}
            </span>
            <button 
              onClick={goToNextPage}
              disabled={currentPage >= totalPages - 1}
              className={`p-2 rounded-full ${currentPage >= totalPages - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      
      {isLoading && rooms.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-md">
          <div className="flex flex-col items-center space-y-4">
            <LoadingDots />
            <p className="text-gray-500">Loading your recent rooms...</p>
          </div>
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={foodIcons[currentIcon]}
          title="Ready to start deciding together?"
          description="Create a new room to start voting with friends, or join an existing room using a room code."
          theme={darkMode ? 'dark' : 'light'}
        />
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* First render the active room at the top if it exists */}
          {activeRoom && renderRoomCard(activeRoom, true)}
          
          {/* Then render all other rooms */}
          {currentRooms.map(room => renderRoomCard(room))}
          
          {/* If no rooms are displayed after filtering, show a message */}
          {filteredRooms.length === 0 && !activeRoom && (
            <div className="col-span-full p-6 bg-white rounded-xl shadow-sm text-center">
              <p className="text-gray-500">No additional rooms to display.</p>
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}