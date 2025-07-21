import React, { useState, useEffect, useRef, RefObject } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../lib/store';
import { ProfileHeader } from './ProfileHeader';
import { ActionCards } from './ActionCards';
import { RecentRooms } from './RecentRooms';
import { Moon, Sun, UtensilsCrossed } from 'lucide-react';

// Define page transition variants
const pageVariants = {
  initial: { opacity: 1 },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

// Greeting variants for different times of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export function HomeScreen() {
  const { recentRooms, auth, signOut } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const isMounted = useRef(true);
  const hasLoadedRooms = useRef(false); // Track if we've already loaded rooms
  
  // Hook to detect when an element is in the viewport for lazy loading
  const useOnScreen = (ref: RefObject<HTMLElement>) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => setIsIntersecting(entry.isIntersecting),
        { threshold: 0.1 }
      );
      
      if (ref.current) {
        observer.observe(ref.current);
      }
      return () => observer.disconnect();
    }, [ref]);
    
    return isIntersecting;
  };
  
  // Removed lazy loading for RecentRooms as it's a critical component

  useEffect(() => {
    // Set isMounted to true when the component mounts
    isMounted.current = true;
    
    // Check for user's preferred color scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    
    // Watch for changes in color scheme preference
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      if (isMounted.current) {
        setDarkMode(e.matches);
      }
    };
    
    darkModeMediaQuery.addEventListener('change', handleColorSchemeChange);
    
    // Load dark mode setting from localStorage if available
    const savedDarkMode = localStorage.getItem('tableTalk-darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
    
    // Set isMounted to false when the component unmounts
    return () => {
      isMounted.current = false;
      darkModeMediaQuery.removeEventListener('change', handleColorSchemeChange);
      
      // Clear global window state to prevent interference with other screens
      if (window && window.__tabletalk_state) {
        delete window.__tabletalk_state;
      }
    };
  }, []); // Remove dependency to prevent reloading on navigation

  // Separate effect for loading recent rooms only when needed
  useEffect(() => {
    const loadRecentRooms = async () => {
      if (auth.user && !hasLoadedRooms.current) { // Only load if we haven't loaded yet
        hasLoadedRooms.current = true; // Mark as loading to prevent multiple calls
        setIsLoading(true);
        try {
          // Use getState to avoid function dependency
          const { fetchRecentRooms } = useAppStore.getState();
          await fetchRecentRooms();
        } catch (error) {
          console.error('Error loading recent rooms on mount:', error);
          hasLoadedRooms.current = false; // Reset on error so we can retry
        } finally {
          // Always reset loading state, even if component unmounted
          if (isMounted.current) {
            setIsLoading(false);
          } else {
            // If component unmounted, still reset loading to prevent stuck state
            setIsLoading(false);
          }
        }
      }
    };
    
    // Clear any global window state that might interfere
    if (window && window.__tabletalk_state) {
      delete window.__tabletalk_state;
    }
    
    // Only load rooms if the user ID exists and we haven't loaded yet
    if (auth.user?.id) {
      loadRecentRooms();
    }
  }, [auth.user?.id]); // Only depend on user ID, not rooms length to prevent loops

  // Force refresh recent rooms when user navigates back to home
  useEffect(() => {
    const handleFocus = () => {
      // If user navigates back to this tab/window, refresh recent rooms
      if (auth.user && isMounted.current) {
        hasLoadedRooms.current = false; // Allow reloading
        const { fetchRecentRooms } = useAppStore.getState();
        fetchRecentRooms();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [auth.user]);

  useEffect(() => {
    // Save dark mode preference to localStorage
    localStorage.setItem('tableTalk-darkMode', darkMode.toString());
    
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Removed handleNavigate function as RecentRooms now handles its own navigation
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Find active room for the RecentRooms component
  const activeRoom = recentRooms.find(room => room.isActive);
  
  // Debug logging for recent rooms (development only) - removed to prevent console spam

  const getFirstName = (username: string) => {
    return username?.split(' ')[0] || username || 'Friend';
  };

  return (
    <motion.div
      className={`min-h-screen transition-all duration-700 ${
        darkMode 
          ? 'bg-zinc-900 text-white' 
          : 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3]'}
      `}
      initial="initial"
      exit="exit"
      variants={pageVariants}
    >
      {/* Theme Toggle */}
      <motion.button
        onClick={toggleDarkMode}
        className={`fixed bottom-6 right-4 z-50 p-3 rounded-full shadow-lg ${
          darkMode 
            ? 'bg-gray-800 text-yellow-300 border border-gray-700' 
            : 'bg-white text-gray-800 border border-gray-200'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </motion.button>

      <div className="max-w-6xl mx-auto px-4 pt-8 pb-8 sm:px-6 lg:px-8">
        {/* Header with TableTalk logo and Profile */}
        <div className="flex justify-between items-center mb-8">
          {/* TableTalk Logo - Top Center Left */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
              darkMode 
                ? 'bg-white' 
                : 'bg-gradient-to-br from-orange-400 to-amber-500'
            }`}>
              <UtensilsCrossed className={`h-6 w-6 ${
                darkMode ? 'text-orange-500' : 'text-white'
              }`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                TableTalk
              </h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Dining decisions made easy
              </p>
            </div>
          </motion.div>

          {/* Profile Dropdown - Top Center Right */}
          <ProfileHeader
            user={auth.user}
            onSignOut={signOut}
            darkMode={darkMode}
          />
        </div>

        {/* Accessible screen reader announcements */}
        <div aria-live="polite" id="main-announcer" className="sr-only"></div>
        
        {/* Personalized Greeting Header */}
        <motion.header 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">

            {/* Personalized greeting */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 pb-2 ${
                darkMode 
                  ? 'bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent' 
                  : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent'
              }`}>
                {getGreeting()}, {getFirstName(auth.user?.username || 'Friend')}!
              </h2>
              <p className={`text-lg sm:text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                Ready to eat together again? Create a room or explore new dining options with friends.
              </p>
            </motion.div>
          </div>

          {/* Decorative divider */}
          <motion.div 
            className="h-1 w-32 mx-auto rounded-full bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600"
            initial={{ width: 0 }}
            animate={{ width: 128 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          />
        </motion.header>

        {/* Main Content with lazy-loaded component sections */}
        <div className="space-y-16 relative z-10">
          {/* Primary Action Cards */}
          <ActionCards darkMode={darkMode} />
          
          {/* Recent Rooms Section */}
              <RecentRooms
                rooms={recentRooms}
                activeRoom={activeRoom}
                isLoading={isLoading}
                darkMode={darkMode}
              />
        </div>
      </div>
    </motion.div>
  );
}