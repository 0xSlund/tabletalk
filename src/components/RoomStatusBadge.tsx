import { motion } from 'framer-motion';
import { Trophy, Clock, AlertCircle, Calendar } from 'lucide-react';
import { formatTimeRemaining } from '../lib/utils';

export type RoomStatus = 'active' | 'completed' | 'expired';

interface RoomStatusBadgeProps {
  status: RoomStatus;
  expiresAt?: string;
  winningChoice?: string;
  darkMode?: boolean;
  variant?: 'badge' | 'card';
  showDetails?: boolean;
}

export function RoomStatusBadge({ 
  status, 
  expiresAt, 
  winningChoice, 
  darkMode = false, 
  variant = 'badge',
  showDetails = false 
}: RoomStatusBadgeProps) {
  
  // Badge variant - small compact badge
  if (variant === 'badge') {
    return (
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
    );
  }

  // Card variant - detailed status card
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-2 p-2.5 rounded-lg mb-2 ${getCardStyles(status, darkMode)}`}
    >
      <div className={`p-1.5 rounded-full ${getIconBackgroundStyles(status, darkMode)}`}>
        {getStatusIcon(status)}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs uppercase font-medium tracking-wide ${getTextStyles(status, darkMode)}`}>
          {getStatusLabel(status)}
        </div>
        {showDetails && (
          <div className={`text-sm font-semibold mt-0.5 ${getSecondaryTextStyles(status, darkMode)}`}>
            {status === 'active' && expiresAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatTimeRemaining(expiresAt)}</span>
              </div>
            )}
            {status === 'completed' && winningChoice && (
              <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                <span className="line-clamp-1">{winningChoice}</span>
              </div>
            )}
            {status === 'expired' && expiresAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(expiresAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}</span>
              </div>
            )}
          </div>
        )}
        {status === 'expired' && showDetails && (
          <div className={`text-xs font-bold mt-1 ${getSecondaryTextStyles(status, darkMode)}`}>
            No decision reached
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Helper functions for styling
function getCardStyles(status: RoomStatus, darkMode: boolean): string {
  const baseStyles = darkMode ? 'border' : 'border';
  
  switch (status) {
    case 'active':
      return `${baseStyles} ${darkMode 
        ? 'bg-blue-900/30 border-blue-500/20' 
        : 'bg-blue-50 border-blue-200'}`;
    case 'completed':
      return `${baseStyles} ${darkMode 
        ? 'bg-green-900/30 border-green-500/20' 
        : 'bg-green-50 border-green-200'}`;
    case 'expired':
      return `${baseStyles} ${darkMode 
        ? 'bg-red-900/30 border-red-500/20' 
        : 'bg-red-50 border-red-200'}`;
    default:
      return baseStyles;
  }
}

function getIconBackgroundStyles(status: RoomStatus, darkMode: boolean): string {
  switch (status) {
    case 'active':
      return darkMode ? 'bg-blue-500/20' : 'bg-blue-100';
    case 'completed':
      return darkMode ? 'bg-green-500/20' : 'bg-green-100';
    case 'expired':
      return darkMode ? 'bg-red-500/20' : 'bg-red-100';
    default:
      return darkMode ? 'bg-gray-500/20' : 'bg-gray-100';
  }
}

function getTextStyles(status: RoomStatus, darkMode: boolean): string {
  switch (status) {
    case 'active':
      return darkMode ? 'text-blue-400' : 'text-blue-700';
    case 'completed':
      return darkMode ? 'text-green-400' : 'text-green-700';
    case 'expired':
      return darkMode ? 'text-red-400' : 'text-red-600';
    default:
      return darkMode ? 'text-gray-400' : 'text-gray-600';
  }
}

function getSecondaryTextStyles(status: RoomStatus, darkMode: boolean): string {
  switch (status) {
    case 'active':
      return darkMode ? 'text-blue-300' : 'text-blue-800';
    case 'completed':
      return darkMode ? 'text-green-300' : 'text-green-800';
    case 'expired':
      return darkMode ? 'text-red-300' : 'text-red-800';
    default:
      return darkMode ? 'text-gray-300' : 'text-gray-800';
  }
}

function getStatusIcon(status: RoomStatus) {
  switch (status) {
    case 'active':
      return <Clock className="w-4 h-4 text-blue-500" />;
    case 'completed':
      return <Trophy className="w-4 h-4 text-green-500" />;
    case 'expired':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function getStatusLabel(status: RoomStatus): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'expired':
      return 'Expired';
    default:
      return 'Unknown';
  }
}

// Helper function to determine room status (matching history page logic)
export function getRoomStatus(expiresAt: string, hasResults: boolean): RoomStatus {
  const now = new Date();
  const expiration = new Date(expiresAt);
  const isActive = expiration > now;
  
  if (isActive) return 'active';
  return hasResults ? 'completed' : 'expired';
} 