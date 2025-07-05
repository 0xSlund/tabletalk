import React from 'react';
import { motion } from 'framer-motion';
import { RoomStatus, StatusCounts } from '../types';
import { STATUS_FILTERS, GLOW_EFFECTS } from '../constants';

interface StatusFiltersProps {
  statusFilter: RoomStatus;
  onStatusChange: (status: RoomStatus) => void;
  statusCounts: StatusCounts;
  darkMode: boolean;
}

export function StatusFilters({ statusFilter, onStatusChange, statusCounts, darkMode }: StatusFiltersProps) {
  return (
    <div className="flex gap-3">
      {STATUS_FILTERS.map(({ key, label, icon: Icon, colors }) => (
        <motion.button
          key={key}
          onClick={() => onStatusChange(key)}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            statusFilter === key 
              ? colors.active 
              : darkMode ? colors.inactiveDark : colors.inactiveLight
          }`}
          whileHover={{ 
            scale: 1.05, 
            y: -2,
            transition: { duration: 0.2, ease: "easeOut" }
          }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Animated background for selected state */}
          {statusFilter === key && (
            <motion.div
              layoutId="activeStatusFilter"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-white/5"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          
          <motion.div
            animate={{ 
              rotate: statusFilter === key ? [0, 10, -10, 0] : 0,
              scale: statusFilter === key ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 0.3 }}
          >
            <Icon className="w-4 h-4 relative z-10" />
          </motion.div>
          
          <span className="relative z-10">{label}</span>
          
          <motion.span 
            className={`relative z-10 px-2 py-0.5 rounded-full text-xs font-black ${
              statusFilter === key
                ? 'bg-white/20 backdrop-blur-sm'
                : darkMode
                  ? 'bg-gray-800 text-gray-400'
                  : 'bg-gray-100 text-gray-500'
            }`}
            animate={{ 
              scale: statusFilter === key ? [1, 1.15, 1] : 1
            }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {statusCounts[key]}
          </motion.span>
          
          {/* Glow effect for active state */}
          {statusFilter === key && (
            <motion.div
              className="absolute inset-0 rounded-xl opacity-20 blur-sm"
              style={{
                background: GLOW_EFFECTS[key]
              }}
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
} 