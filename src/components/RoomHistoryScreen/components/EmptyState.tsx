import React from 'react';
import { motion } from 'framer-motion';
import { Search, History, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RoomStatus } from '../types';

interface EmptyStateProps {
  searchTerm: string;
  statusFilter: RoomStatus;
  darkMode: boolean;
}

export function EmptyState({ searchTerm, statusFilter, darkMode }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-16 ${
        darkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'
      } rounded-2xl border-2 border-dashed ${
        darkMode ? 'border-gray-600' : 'border-gray-300'
      }`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}
      >
        {searchTerm ? (
          <Search className={`w-8 h-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        ) : (
          <History className={`w-8 h-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        )}
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`text-xl font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
      >
        {searchTerm ? 'No rooms found' : statusFilter === 'all' ? 'No room history yet' : `No ${statusFilter} rooms`}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={`text-sm mb-6 max-w-md mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
      >
        {searchTerm 
          ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
          : statusFilter === 'all' 
            ? 'Start by creating or joining your first room to see your history here.'
            : `You don't have any ${statusFilter} rooms yet. Try a different filter or create a new room.`
        }
      </motion.p>
      
      {!searchTerm && statusFilter === 'all' && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/')}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            darkMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span>Create Your First Room</span>
        </motion.button>
      )}
    </motion.div>
  );
} 