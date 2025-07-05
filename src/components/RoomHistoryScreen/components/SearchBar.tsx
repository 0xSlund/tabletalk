import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  darkMode: boolean;
  filteredCount: number;
}

export function SearchBar({ searchTerm, onSearchChange, darkMode, filteredCount }: SearchBarProps) {
  return (
    <div className="relative mb-6 group">
      <motion.div 
        className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-gray-800 to-gray-700 shadow-lg group-focus-within:shadow-blue-500/20' 
            : 'bg-gradient-to-r from-white to-gray-50 shadow-lg group-focus-within:shadow-blue-500/20'
        } group-focus-within:shadow-2xl group-focus-within:scale-[1.02]`}
        whileFocus={{ scale: 1.02 }}
      >
        {/* Animated background gradient */}
        <div className={`absolute inset-0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10' 
            : 'bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5'
        }`} />
        
        {/* Search icon with animation */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <motion.div
            animate={{ 
              rotate: searchTerm ? [0, 15, -15, 0] : 0,
              scale: searchTerm ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 0.3 }}
          >
            <Search className={`h-5 w-5 transition-colors duration-300 ${
              searchTerm 
                ? 'text-blue-500' 
                : darkMode 
                  ? 'text-gray-400 group-focus-within:text-blue-400' 
                  : 'text-gray-400 group-focus-within:text-blue-500'
            }`} />
          </motion.div>
        </div>

        {/* Main input */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search your rooms..."
          className={`relative block w-full pl-12 pr-16 py-4 rounded-2xl border-0 transition-all duration-300 placeholder:transition-all placeholder:duration-300 ${
            darkMode
              ? 'bg-transparent text-white placeholder-gray-400 focus:placeholder-gray-500' 
              : 'bg-transparent text-gray-900 placeholder-gray-500 focus:placeholder-gray-600'
          } focus:outline-none focus:ring-0 text-lg font-medium`}
        />

        {/* Clear button */}
        <AnimatePresence>
          {searchTerm && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => onSearchChange('')}
              className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors duration-200 ${
                darkMode 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <div className={`p-1 rounded-full transition-colors duration-200 ${
                darkMode 
                  ? 'hover:bg-gray-600' 
                  : 'hover:bg-gray-200'
              }`}>
                <X className="h-4 w-4" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Floating accent line */}
        <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
          searchTerm 
            ? 'w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500' 
            : 'w-0 bg-blue-500 group-focus-within:w-full'
        }`} />
      </motion.div>

      {/* Results count indicator */}
      <AnimatePresence>
        {searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.1 }}
            className={`absolute -bottom-6 left-0 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {filteredCount} room{filteredCount !== 1 ? 's' : ''} found
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 