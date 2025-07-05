import { RoomStatus, RoomHistoryItem } from './types';

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatExpiryDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getRoomStatus = (expiresAt: string, hasResults: boolean): 'active' | 'completed' | 'expired' => {
  const now = new Date();
  const expiration = new Date(expiresAt);
  const isActive = expiration > now;
  
  if (isActive) return 'active';
  return hasResults ? 'completed' : 'expired';
};

export const getStatusCounts = (roomHistory: RoomHistoryItem[]) => {
  const counts = { all: roomHistory.length, active: 0, completed: 0, expired: 0 };
  
  roomHistory.forEach(item => {
    const hasResults = item.rooms.voting_results && item.rooms.voting_results.length > 0;
    const status = getRoomStatus(item.rooms.expires_at, hasResults);
    counts[status]++;
  });
  
  return counts;
};

export const isRoomOlderThan30Days = (createdAt: string): boolean => {
  const roomDate = new Date(createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return roomDate < thirtyDaysAgo;
};

export const isRoomOlderThan90Days = (createdAt: string): boolean => {
  const roomDate = new Date(createdAt);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  return roomDate < ninetyDaysAgo;
};

export const filterRooms = (
  roomHistory: RoomHistoryItem[],
  searchTerm: string,
  dateRange: { start: string; end: string },
  selectedStatuses: RoomStatus[]
): RoomHistoryItem[] => {
  return roomHistory.filter(item => {
    // Search filter
    const matchesSearch = item.rooms.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.rooms.code.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    // Date range filter
    if (dateRange.start || dateRange.end) {
      const itemDate = new Date(item.rooms.created_at);
      if (dateRange.start && itemDate < new Date(dateRange.start)) return false;
      if (dateRange.end && itemDate > new Date(dateRange.end)) return false;
    }
    
    // Status filter
    if (selectedStatuses.includes('all')) return true;
    
    const hasResults = item.rooms.voting_results && item.rooms.voting_results.length > 0;
    const status = getRoomStatus(item.rooms.expires_at, hasResults);
    return selectedStatuses.includes(status);
  });
};

export const sortRooms = (
  rooms: RoomHistoryItem[], 
  sortBy: 'date' | 'name',
  sortDirection: 'asc' | 'desc' = 'desc'
): RoomHistoryItem[] => {
  return [...rooms].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'name') {
      comparison = a.rooms.name.localeCompare(b.rooms.name);
    } else {
      comparison = new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime();
    }
    
    // Reverse comparison if ascending
    return sortDirection === 'asc' ? -comparison : comparison;
  });
}; 