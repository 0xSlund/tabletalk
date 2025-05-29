import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export interface ProfileHeaderProps {
  user: any;
  onSignOut: () => void;
  onNavigate: (tab: string) => void;
  darkMode?: boolean;
}

export function ProfileHeader({ user, onSignOut, onNavigate, darkMode = false }: ProfileHeaderProps) {
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
    <div className="fixed top-4 right-4 z-50" ref={profileMenuRef}>
      <motion.button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        aria-expanded={showProfileMenu}
        aria-haspopup="menu"
        aria-controls="profile-menu"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-orange-200">
          <img 
            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
        <span className="font-medium text-gray-700 hidden sm:inline-block">
          {user?.username || 'User'}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-500 transition-transform",
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
            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-200">
                  <img 
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user?.username || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || ''}</p>
                </div>
              </div>
            </div>
            <div className="py-1">
              <Link
                to="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-primary/10 transition-colors"
                role="menuitem"
              >
                <User className="w-4 h-4 text-gray-500" />
                <span>Profile</span>
              </Link>
              <Link
                to="/security"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-primary/10 transition-colors"
                role="menuitem"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span>Settings</span>
              </Link>
            </div>
            <div className="py-1 border-t border-gray-100">
              <button 
                onClick={async () => {
                  setShowProfileMenu(false);
                  await onSignOut();
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                role="menuitem"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 