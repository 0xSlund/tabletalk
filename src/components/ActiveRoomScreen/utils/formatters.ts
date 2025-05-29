/**
 * Utility functions for formatting time and data in the ActiveRoomScreen
 */

/**
 * Formats seconds into MM:SS display format
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 0) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formats a timestamp into a readable "time ago" format
 */
export const formatTimeAgo = (timestamp: string): string => {
  try {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return 'unknown time';
  }
}; 