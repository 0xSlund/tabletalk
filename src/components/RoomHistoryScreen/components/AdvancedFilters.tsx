import React from 'react';
import { motion } from 'framer-motion';
import { Filter, ChevronDown } from 'lucide-react';

interface AdvancedFiltersProps {
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  darkMode: boolean;
}

export function AdvancedFilters({
  showAdvancedFilters,
  onToggleAdvancedFilters,
  darkMode
}: AdvancedFiltersProps) {
  return (
    <motion.button
      onClick={onToggleAdvancedFilters}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
        showAdvancedFilters
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
      <Filter className="w-4 h-4" />
      <span>Filters</span>
      <motion.div
        animate={{ rotate: showAdvancedFilters ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </motion.button>
  );
} 