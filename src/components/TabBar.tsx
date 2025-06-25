import React from 'react';
import { Home, PlusCircle, UserPlus, Globe, User } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

export function TabBar() {
  const { activeTab } = useAppStore();
  const location = useLocation();
  const path = location.pathname.substring(1) || 'home';
  
  // Check if dark mode is enabled
  const isDarkMode = document.documentElement.classList.contains('dark-mode');

  const tabs = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'create', icon: PlusCircle, label: 'Create', path: '/create' },
    { id: 'join', icon: UserPlus, label: 'Join', path: '/join' },
    { id: 'explore-cuisines', icon: Globe, label: 'Explore', path: '/explore' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ] as const;

  return (
    <div className="fixed inset-x-0 bottom-0 p-4 pointer-events-none z-50">
      <nav className={`max-w-xl mx-auto backdrop-blur-lg rounded-3xl shadow-nav pointer-events-auto ${
        isDarkMode 
          ? 'bg-gray-800/90 border border-gray-700' 
          : 'bg-white/90'
      }`}>
        <div className="flex justify-around p-2">
          {tabs.map(({ id, icon: Icon, label, path }) => {
            const isActive = (id === 'home' && location.pathname === '/') || 
                          (id === 'explore-cuisines' && location.pathname === '/explore') ||
                          location.pathname === path;
            
            return (
                              <motion.div
                key={id}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-4 py-3 rounded-full transition-all duration-320",
                  isDarkMode 
                    ? "hover:bg-gray-700/50" 
                    : "hover:bg-background-cream/50",
                  isActive && (id === 'join' ? "text-blue-500" : "text-primary")
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 rounded-full ${
                      id === 'join'
                        ? isDarkMode ? 'bg-blue-500/10' : 'bg-blue-500/5'
                        : isDarkMode ? 'bg-primary/10' : 'bg-primary/5'
                    }`}
                    initial={false}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 30,
                      duration: 0.32
                    }}
                  />
                )}
                <Link to={path} className="relative flex flex-col items-center">
                  <div className="relative">
                    <Icon 
                      className={cn(
                        "w-6 h-6 transition-all duration-320 stroke-[2px]",
                        isActive 
                          ? id === 'join' 
                            ? "drop-shadow-glow text-blue-500 fill-blue-100/20" 
                            : "drop-shadow-glow text-primary fill-accent-mint/20"
                          : "fill-none"
                      )} 
                    />
                    {isActive && (
                      <motion.div
                        className={`absolute inset-0 blur-lg rounded-full ${
                          id === 'join' ? 'bg-blue-500/8' : 'bg-primary/8'
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.32 }}
                      />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-inter font-semibold transition-all duration-320",
                    isActive 
                      ? id === 'join' 
                        ? "text-blue-500" 
                        : "text-primary"
                      : isDarkMode 
                        ? "text-gray-300" 
                        : "text-text-body"
                  )}>
                    {label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}