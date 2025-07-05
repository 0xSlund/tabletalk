import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Clock, Calendar, AlertCircle, Check, Archive, Eye, Play
} from 'lucide-react';
import { formatTimeRemaining } from '../../../lib/utils';
import { RoomHistoryItem, ViewMode } from '../types';
import { getRoomStatus, isRoomOlderThan30Days } from '../utils';
import { CARD_STYLES } from '../constants';

interface RoomCardProps {
  item: RoomHistoryItem;
  isSelected: boolean;
  showAdvancedFilters: boolean;
  viewMode: ViewMode;
  darkMode: boolean;
  onToggleSelection: (roomId: string) => void;
  onViewRoom: (roomCode: string) => void;
  onArchiveRoom?: (roomId: string) => void;
  onUnarchiveRoom?: (roomId: string) => void;
}

export function RoomCard({
  item,
  isSelected,
  showAdvancedFilters,
  viewMode,
  darkMode,
  onToggleSelection,
  onViewRoom,
  onArchiveRoom,
  onUnarchiveRoom
}: RoomCardProps) {
  const hasResults = item.rooms.voting_results && item.rooms.voting_results.length > 0;
  const status = getRoomStatus(item.rooms.expires_at, hasResults);
  const isActive = status === 'active';
  const isExpired = status === 'expired';
  const isOlderThan30Days = isRoomOlderThan30Days(item.rooms.created_at);
  const isArchived = (item.rooms as any).is_archived || false;
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't handle card click if user clicked on an input or button
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement) return;
    
    console.log('Card clicked:', item.rooms.name, 'Code:', item.rooms.code, 'showAdvancedFilters:', showAdvancedFilters);
    
    if (showAdvancedFilters) {
      onToggleSelection(item.id);
    } else {
      onViewRoom(item.rooms.code);
    }
  };

  const styles = CARD_STYLES[viewMode];

  return (
    <div className="relative">
      {/* Checkbox for bulk selection */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute -top-2 -left-2 z-20"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelection(item.id);
            }}
          >
            <div
              className={`w-5 h-5 border cursor-pointer transition-all duration-200 shadow-sm rounded-sm flex items-center justify-center
                ${isSelected 
                  ? 'bg-blue-500 border-blue-300' 
                  : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
              aria-checked={isSelected}
              tabIndex={0}
              role="checkbox"
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <Check className="w-4 h-4 text-white stroke-2" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main card */}
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          boxShadow: isSelected 
            ? darkMode
              ? '0 8px 32px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.2)'
              : '0 8px 32px rgba(59, 130, 246, 0.12), 0 0 0 1px rgba(59, 130, 246, 0.15)'
            : undefined
        }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ 
          scale: showAdvancedFilters ? 1 : 1.03, 
          y: showAdvancedFilters ? 0 : -4,
          transition: { duration: 0.2, ease: "easeOut" }
        }}
        className={`relative rounded-2xl transition-all duration-300 group ring-2 border cursor-pointer shadow-lg hover:shadow-2xl ${
          styles.container
        } ${
          isSelected
            ? darkMode
              ? 'ring-blue-400/60 border-blue-500/40'
              : 'ring-blue-400/60 border-blue-300/60'
            : 'ring-transparent border-transparent'
        } ${
          showAdvancedFilters && !isSelected ? 'hover:ring-blue-300/40' : ''
        } ${
          isOlderThan30Days 
            ? darkMode ? 'bg-gray-800/50 !border-gray-700' : 'bg-gray-50 !border-gray-200'
            : darkMode
              ? isActive 
                ? 'bg-gradient-to-br from-blue-900/40 via-gray-800 to-gray-800 !border-blue-500/30' 
                : status === 'completed'
                  ? 'bg-gradient-to-br from-green-900/40 via-gray-800 to-gray-800 !border-green-500/30'
                  : 'bg-gradient-to-br from-gray-800 to-gray-900 !border-gray-600'
              : isActive 
                ? 'bg-gradient-to-br from-blue-50 via-white to-blue-50 !border-blue-200' 
                : status === 'completed'
                  ? 'bg-gradient-to-br from-green-50 via-white to-green-50 !border-green-200'
                  : 'bg-gradient-to-br from-white to-gray-50 !border-gray-200'
        }`}
        onClick={handleCardClick}
      >
        {/* Selection Overlay */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`absolute inset-0 rounded-2xl pointer-events-none ${
                darkMode ? 'bg-blue-900/20' : 'bg-blue-50/60'
              }`}
            />
          )}
        </AnimatePresence>

        {/* Status badge */}
        <div className="absolute top-3 right-3 z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
              status === 'active' 
                ? 'bg-green-500 text-white animate-pulse'
                : status === 'completed'
                  ? 'bg-orange-500 text-white'
                  : 'bg-red-500 text-white'
            }`}
          >
            {status === 'active' && (
              <>
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>LIVE</span>
              </>
            )}
            {status === 'completed' && (
              <>
                <Trophy className="w-3 h-3" />
                <span>DONE</span>
              </>
            )}
            {status === 'expired' && (
              <>
                <Clock className="w-3 h-3" />
                <span>EXPIRED</span>
              </>
            )}
          </motion.div>
        </div>

        {/* Card content */}
        <div className={`relative z-10 ${styles.content}`}>
          {/* Header */}
          <div className={styles.header}>
            <motion.h3 
              className={`${styles.title} ${darkMode ? 'text-white' : 'text-gray-900'}`}
              whileHover={{ scale: 1.02 }}
            >
              {item.rooms.name}
            </motion.h3>
            
            {/* Expired status card - only in grid view */}
            {viewMode === 'grid' && status === 'expired' && !hasResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center gap-2 p-1.5 rounded-lg mb-1.5 ${
                  darkMode 
                    ? 'bg-red-900/30 border border-red-500/20' 
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className={`p-1 rounded-full ${
                  darkMode ? 'bg-red-500/20' : 'bg-red-100'
                }`}>
                  <AlertCircle className="w-3 h-3 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs uppercase font-medium tracking-wide ${
                    darkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                    Expired
                  </div>
                  <div className={`text-sm font-semibold flex items-center gap-1 ${
                    darkMode ? 'text-red-300' : 'text-red-700'
                  }`}>
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.rooms.expires_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>
                  <div className={`text-xs font-bold mt-0.5 ${
                    darkMode ? 'text-red-300' : 'text-red-800'
                  }`}>
                    No decision reached
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Dynamic content area */}
          <div className="mb-1.5">
              <AnimatePresence mode="wait">
                {hasResults && status === 'completed' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-center gap-2 p-1.5 rounded-lg ${
                      darkMode 
                        ? 'bg-green-900/30 border border-green-500/20' 
                        : 'bg-green-50 border border-green-200'
                    }`}
                  >
                    <div className={`p-1 rounded-full ${
                      darkMode ? 'bg-green-500/20' : 'bg-green-100'
                    }`}>
                      <Trophy className="w-3 h-3 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium ${
                        darkMode ? 'text-green-400' : 'text-green-700'
                      }`}>
                        Winner
                      </div>
                      <div className={`text-xs font-bold line-clamp-1 ${
                        darkMode ? 'text-green-300' : 'text-green-800'
                      }`}>
                        {item.rooms.voting_results[0]?.winning_option?.text || 'Decision made'}
                      </div>
                    </div>
                  </motion.div>
                )}

                {status === 'active' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-center gap-2 p-1.5 rounded-lg ${
                      darkMode 
                        ? 'bg-blue-900/30 border border-blue-500/20' 
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <div className={`p-1 rounded-full ${
                      darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                    }`}>
                      <Clock className="w-3 h-3 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium ${
                        darkMode ? 'text-blue-400' : 'text-blue-700'
                      }`}>
                        Time Remaining
                      </div>
                      <div className={`text-xs font-bold ${
                        darkMode ? 'text-blue-300' : 'text-blue-800'
                      }`}>
                        {formatTimeRemaining(item.rooms.expires_at)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          {/* Footer */}
          <div className={styles.footer}>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono ${
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              <span className="opacity-60">#</span>
              <span>{item.rooms.code}</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">

              {/* Main action button */}
              <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!(isOlderThan30Days && !isArchived)) {
                      onViewRoom(item.rooms.code);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    status === 'active' 
                      ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'
                      : (isOlderThan30Days && !isArchived)
                        ? darkMode
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileHover={!(isOlderThan30Days && !isArchived) ? { scale: 1.05 } : {}}
                  whileTap={!(isOlderThan30Days && !isArchived) ? { scale: 0.95 } : {}}
                  disabled={isOlderThan30Days && !isArchived}
                >
                  {status === 'active' ? (
                    <>
                      <Play className="w-4 h-4" />
                      <span>JOIN NOW</span>
                    </>
                  ) : (isOlderThan30Days && !isArchived) ? (
                    <>
                      <Archive className="w-3 h-3" />
                      <span>ARCHIVED</span>
                    </>
                  ) : status === 'expired' ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>VIEW DISCUSSION</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>VIEW RESULTS</span>
                    </>
                  )}
                </motion.button>
            </div>
          </div>
        </div>

        {/* Hover overlay */}
        <motion.div
          className={`absolute inset-0 rounded-2xl pointer-events-none ${
            darkMode 
              ? 'bg-gradient-to-br from-white/5 to-transparent' 
              : 'bg-gradient-to-br from-black/5 to-transparent'
          }`}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: isOlderThan30Days ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </div>
  );
} 