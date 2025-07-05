import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, List, ArrowUpDown, ArrowDown, ArrowUp, ChevronDown } from 'lucide-react';
import { ViewMode, SortBy, SortDirection } from '../types';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  sortBy: SortBy;
  sortDirection: SortDirection;
  darkMode: boolean;
  onViewModeChange: (mode: ViewMode) => void;
  onSortByChange: (sortBy: SortBy) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
}

export function ViewModeToggle({ 
  viewMode, 
  sortBy, 
  sortDirection,
  darkMode, 
  onViewModeChange, 
  onSortByChange,
  onSortDirectionChange
}: ViewModeToggleProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const getSortLabel = () => {
    const directionLabel = sortDirection === 'desc' ? 'Descending' : 'Ascending';
    const byLabel = sortBy === 'date' ? 'Date' : 'Name';
    return `${byLabel} (${directionLabel})`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortMenu]);

  return (
    <div className="flex items-center gap-3">
      {/* View mode toggle */}
      <div className={`flex rounded-lg p-1 ${
        darkMode ? 'bg-gray-700' : 'bg-gray-100'
      }`}>
        <motion.button
          onClick={() => onViewModeChange('grid')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            viewMode === 'grid'
              ? darkMode
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-white text-gray-900 shadow-sm'
              : darkMode
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Grid3X3 className="w-4 h-4" />
          <span>Grid</span>
        </motion.button>
        <motion.button
          onClick={() => onViewModeChange('list')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            viewMode === 'list'
              ? darkMode
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-white text-gray-900 shadow-sm'
              : darkMode
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <List className="w-4 h-4" />
          <span>List</span>
        </motion.button>
      </div>

      {/* Sort dropdown */}
      <div className="relative" ref={sortMenuRef}>
        <motion.button
          onClick={() => setShowSortMenu(!showSortMenu)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            showSortMenu
              ? darkMode
                ? 'bg-blue-900/50 text-blue-400 border border-blue-500/30'
                : 'bg-blue-50 text-blue-600 border border-blue-200'
              : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {sortDirection === 'desc' ? (
            <ArrowDown className="w-4 h-4" />
          ) : (
            <ArrowUp className="w-4 h-4" />
          )}
          <span>{sortBy === 'date' ? 'Date' : 'Name'}</span>
          <motion.div
            animate={{ rotate: showSortMenu ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {showSortMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg overflow-hidden z-50 ${
                darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
              }`}
            >
              <div className="p-1">
                {/* Date options */}
                <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Sort by Date
                </div>
                <button
                  onClick={() => {
                    onSortByChange('date');
                    onSortDirectionChange('desc');
                    setShowSortMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-all ${
                    sortBy === 'date' && sortDirection === 'desc'
                      ? darkMode
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ArrowDown className="w-4 h-4" />
                  Date (Newest First)
                </button>
                <button
                  onClick={() => {
                    onSortByChange('date');
                    onSortDirectionChange('asc');
                    setShowSortMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-all ${
                    sortBy === 'date' && sortDirection === 'asc'
                      ? darkMode
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                  Date (Oldest First)
                </button>

                {/* Name options */}
                <div className={`px-3 py-2 mt-2 text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Sort by Name
                </div>
                <button
                  onClick={() => {
                    onSortByChange('name');
                    onSortDirectionChange('asc');
                    setShowSortMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-all ${
                    sortBy === 'name' && sortDirection === 'asc'
                      ? darkMode
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                  Name (A to Z)
                </button>
                <button
                  onClick={() => {
                    onSortByChange('name');
                    onSortDirectionChange('desc');
                    setShowSortMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-all ${
                    sortBy === 'name' && sortDirection === 'desc'
                      ? darkMode
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ArrowDown className="w-4 h-4" />
                  Name (Z to A)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 