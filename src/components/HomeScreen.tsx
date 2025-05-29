import React, { useState, useEffect, useRef, RefObject } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../lib/store';
import { ProfileHeader } from './ProfileHeader';
import { AppHeader } from './AppHeader';
import { ActionCards } from './ActionCards';
import { RecentRooms } from './RecentRooms';
import { Moon, Sun } from 'lucide-react';

// Define page transition variants
const pageVariants = {
  initial: { opacity: 1 },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

export function HomeScreen() {
  const { recentRooms, fetchRecentRooms, auth, signOut } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const isMounted = useRef(true);
  
  // Custom hook for intersection observer to optimize rendering
  const useOnScreen = (ref: RefObject<HTMLElement>) => {
    const [isIntersecting, setIntersecting] = useState(false);
    
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => setIntersecting(entry.isIntersecting)
      );
      
      if (ref.current) {
        observer.observe(ref.current);
      }
      return () => observer.disconnect();
    }, [ref]);
    
    return isIntersecting;
  };
  
  const recentRoomsRef = useRef<HTMLDivElement>(null);
  const isRecentRoomsVisible = useOnScreen(recentRoomsRef);

  useEffect(() => {
    // Set isMounted to true when the component mounts
    isMounted.current = true;
    
    // Force reload recent rooms when the component mounts
    const loadRecentRooms = async () => {
      if (auth.user) {
        console.log('HomeScreen mounted - forcing reload of recent rooms');
        setIsLoading(true);
        try {
          await fetchRecentRooms();
        } catch (error) {
          console.error('Error loading recent rooms on mount:', error);
        } finally {
          if (isMounted.current) {
            setIsLoading(false);
          }
        }
      }
    };
    
    loadRecentRooms();
    
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
    };
  }, []);

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

  useEffect(() => {
    const loadRooms = async () => {
      if (auth.user && isMounted.current) {
        setIsLoading(true);
        try {
          await fetchRecentRooms();
        } catch (error) {
          console.error('Error loading recent rooms:', error);
        } finally {
          // Only update state if component is still mounted
          if (isMounted.current) {
            setIsLoading(false);
          }
        }
      }
    };
    
    loadRooms();
  }, [auth.user, fetchRecentRooms]);

  const handleNavigate = (tab: string) => {
    // This function is kept for backward compatibility
    // but we now prefer URL-based navigation
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Find active room for the RecentRooms component
  const activeRoom = recentRooms.find(room => room.isActive);
  
  // Debug logging for recent rooms
  useEffect(() => {
    console.log('HomeScreen - Recent Rooms:', {
      totalRooms: recentRooms.length,
      activeRooms: recentRooms.filter(room => room.isActive).length,
      completedRooms: recentRooms.filter(room => !room.isActive).length,
      recentRooms: recentRooms.map(r => ({
        id: r.id,
        name: r.name,
        isActive: r.isActive,
        expiresAt: r.expiresAt
      }))
    });
  }, [recentRooms]);

  return (
    <motion.div 
      className={`min-h-screen transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
          : 'bg-gradient-to-br from-background-peach to-background-cream'
      }`}
      initial="initial"
      exit="exit"
      variants={pageVariants}
    >
      {/* Theme Toggle */}
      <motion.button
        onClick={toggleDarkMode}
        className={`fixed bottom-24 right-4 z-50 p-3 rounded-full shadow-lg ${
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
      


      {/* User Profile in Top Right */}
      <ProfileHeader 
        user={auth.user} 
        onSignOut={signOut}
        onNavigate={handleNavigate}
        darkMode={darkMode}
      />

      <div className="max-w-5xl mx-auto px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        {/* Accessible screen reader announcements */}
        <div aria-live="polite" id="main-announcer" className="sr-only"></div>
        
        {/* App Header */}
        <AppHeader darkMode={darkMode} />
        
        {/* Background pattern for visual interest (only in light mode) */}
        {!darkMode && (
          <div className="absolute inset-0 z-0 overflow-hidden opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-repeat" 
              style={{ 
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                backgroundSize: '60px 60px' 
              }}
            ></div>
          </div>
        )}
        
        {/* Main Content with lazy-loaded component sections */}
        <div className="space-y-12 relative z-10">
          {/* Primary Action Cards */}
          <ActionCards onNavigate={handleNavigate} darkMode={darkMode} />
          
          {/* Recent Rooms Section with lazy loading */}
          <div ref={recentRoomsRef}>
            {isRecentRoomsVisible && (
              <RecentRooms
                rooms={recentRooms}
                activeRoom={activeRoom}
                isLoading={isLoading}
                onNavigate={handleNavigate}
                darkMode={darkMode}
              />
            )}
          </div>
        </div>

        <div 
          className="h-1 w-24 mx-auto rounded-full mb-8"
          style={{
            background: darkMode 
              ? 'linear-gradient(to right, rgba(var(--primary-rgb), 0.6), rgba(var(--primary-rgb), 0.8))'
              : 'linear-gradient(to right, rgba(var(--primary-rgb), 0.8), rgba(var(--primary-rgb), 1))'
          }}
        ></div>
      </div>
    </motion.div>
  );
}