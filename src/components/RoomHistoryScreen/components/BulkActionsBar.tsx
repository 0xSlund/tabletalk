import { motion } from 'framer-motion';
import { Check, X, Heart, Trash2, Loader2 } from 'lucide-react';
import { PendingAction } from '../types';

interface BulkActionsBarProps {
  selectedRoomsCount: number;
  favoriteMode: boolean;
  deleteMode: boolean;
  pendingAction: PendingAction;
  bulkActionLoading: boolean;
  darkMode: boolean;
  onConfirmAction: () => void;
  onCancelAction: () => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedRoomsCount,
  favoriteMode,
  deleteMode,
  pendingAction,
  bulkActionLoading,
  darkMode,
  onConfirmAction,
  onCancelAction,
  onClearSelection
}: BulkActionsBarProps) {
  if (selectedRoomsCount === 0) return null;

  return (
    <div className="fixed left-0 right-0 bottom-4 flex justify-center pointer-events-none z-50">
      <motion.div
        key={favoriteMode || deleteMode ? 'bulk-actions' : 'selection-count'}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative max-w-6xl w-full pointer-events-auto px-4"
      >
        <div className={`w-full rounded-2xl shadow-2xl border backdrop-blur-sm ${
          darkMode
            ? 'bg-gray-800/95 border-gray-600'
            : 'bg-white/95 border-gray-200'
        }`}>
          {(favoriteMode || deleteMode) ? (
            // Bulk Action Mode
            <div className="flex items-center justify-between px-8 py-5">
              <div className={`flex items-center gap-4 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <div className={`p-3 rounded-xl ${
                  pendingAction === 'favorite'
                    ? darkMode
                      ? 'bg-teal-900/50'
                      : 'bg-teal-100'
                    : darkMode
                      ? 'bg-red-900/50'
                      : 'bg-red-100'
                }`}>
                  {pendingAction === 'favorite' ? (
                    <Heart className={`w-5 h-5 ${
                      darkMode ? 'text-teal-400' : 'text-teal-600'
                    }`} />
                  ) : (
                    <Trash2 className={`w-5 h-5 ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`} />
                  )}
                </div>
                <div>
                  <span className="font-semibold text-base">
                    {pendingAction === 'favorite' ? 'Add to Favorites' : 'Delete Rooms'}
                  </span>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {selectedRoomsCount} room{selectedRoomsCount !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={onConfirmAction}
                  disabled={bulkActionLoading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    bulkActionLoading
                      ? darkMode
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : pendingAction === 'favorite'
                        ? darkMode
                          ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-500/30'
                          : 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-500/30'
                        : darkMode
                          ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30'
                          : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30'
                  }`}
                  whileHover={!bulkActionLoading ? { scale: 1.02 } : {}}
                  whileTap={!bulkActionLoading ? { scale: 0.98 } : {}}
                >
                  {bulkActionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Confirm</span>
                </motion.button>
                
                <motion.button
                  onClick={onCancelAction}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </motion.button>
              </div>
            </div>
          ) : (
            // Selection Count Mode
            <div className="flex items-center justify-between px-8 py-5">
              <div className={`flex items-center gap-4 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <div className={`p-3 rounded-xl ${
                  darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                }`}>
                  <Check className={`w-5 h-5 ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <span className="font-semibold text-base">
                    {selectedRoomsCount} Room{selectedRoomsCount !== 1 ? 's' : ''} Selected
                  </span>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Choose an action to perform on selected rooms
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={onClearSelection}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X className="w-5 h-5" />
                  <span>Clear Selection</span>
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 