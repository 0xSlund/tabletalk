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

  const tabs = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'create', icon: PlusCircle, label: 'Create', path: '/create' },
    { id: 'join', icon: UserPlus, label: 'Join', path: '/join' },
    { id: 'explore-cuisines', icon: Globe, label: 'Explore', path: '/explore' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ] as const;

  return (
    <div className="fixed inset-x-0 bottom-0 p-4 pointer-events-none z-50">
      <nav className="max-w-xl mx-auto bg-white/90 backdrop-blur-lg rounded-3xl shadow-nav pointer-events-auto">
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
                  "hover:bg-background-cream/50",
                  isActive && "text-primary"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/5 rounded-full"
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
                        isActive ? "drop-shadow-glow text-primary fill-accent-mint/20" : "fill-none"
                      )} 
                    />
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-primary/8 blur-lg rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.32 }}
                      />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-inter font-semibold transition-all duration-320",
                    isActive ? "text-primary" : "text-text-body"
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