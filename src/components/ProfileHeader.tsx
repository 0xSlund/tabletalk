import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export interface ProfileHeaderProps {
  user: any;
  onSignOut: () => void;
  darkMode?: boolean;
}

export function ProfileHeader({ user, onSignOut, darkMode = false }: ProfileHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuVariants = {
    hidden: { 
      opacity: 0, 
      y: -20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="relative z-50" ref={profileMenuRef}>
      <motion.button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all focus:ring-2 focus:ring-offset-2 ${
          darkMode 
            ? 'bg-gray-800 text-white border border-gray-700 focus:ring-gray-500' 
            : 'bg-white text-gray-700 border border-gray-200 focus:ring-orange-500'
        }`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        aria-expanded={showProfileMenu}
        aria-haspopup="menu"
        aria-controls="profile-menu"
      >
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-orange-200">
          <img 
            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
        <span className={`font-medium hidden sm:inline-block ${
          darkMode ? 'text-white' : 'text-gray-700'
        }`}>
          {user?.username || 'User'}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          darkMode ? 'text-gray-400' : 'text-gray-500',
          showProfileMenu && "transform rotate-180"
        )} />
      </motion.button>

      <AnimatePresence>
        {showProfileMenu && (
          <motion.div
            id="profile-menu"
            role="menu"
            aria-orientation="vertical"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl overflow-hidden border ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-200">
                  <img 
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {user?.username || 'User'}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user?.email || ''}
                  </p>
                </div>
              </div>
            </div>
            <div className="py-1">
              <Link
                to="/profile"
                onClick={() => setShowProfileMenu(false)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm transition-colors rounded-lg mx-2 ${
                  darkMode 
                    ? 'text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-orange-50'
                }`}
                role="menuitem"
              >
                <User className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span>View Profile</span>
              </Link>
              <Link
                to="/security"
                onClick={() => setShowProfileMenu(false)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm transition-colors rounded-lg mx-2 ${
                  darkMode 
                    ? 'text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-orange-50'
                }`}
                role="menuitem"
              >
                <Settings className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span>Edit Info</span>
              </Link>
            </div>
            <div className={`py-1 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <button 
                onClick={async () => {
                  setShowProfileMenu(false);
                  await onSignOut();
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm transition-colors rounded-lg mx-2 ${
                  darkMode 
                    ? 'text-red-400 hover:bg-red-900/20' 
                    : 'text-red-600 hover:bg-red-50'
                }`}
                role="menuitem"
              >
                <LogOut className={`w-4 h-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 