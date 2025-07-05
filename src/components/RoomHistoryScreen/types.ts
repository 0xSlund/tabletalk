export type RoomStatus = 'all' | 'active' | 'completed' | 'expired';

export interface DateRange {
  start: string;
  end: string;
}

export interface RoomHistoryItem {
  id: string;
  joined_at: string;
  room_id: string;
  rooms: {
    id: string;
    name: string;
    code: string;
    created_at: string;
    expires_at: string;
    voting_results?: Array<{
      room_id: string;
      suggestion_id: string;
      winning_option_id: string;
      votes_count: number;
      winning_option: {
        id: string;
        text: string;
      };
    }>;
  };
}

export interface StatusCounts {
  all: number;
  active: number;
  completed: number;
  expired: number;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'date' | 'name';
export type SortDirection = 'asc' | 'desc';
export type DateRangeType = 'last7' | 'last30' | 'last3months' | 'custom' | null;
export type PendingAction = 'favorite' | 'delete' | null;

export interface FilterState {
  searchTerm: string;
  statusFilter: RoomStatus;
  sortBy: SortBy;
  dateRange: DateRange;
  selectedStatuses: RoomStatus[];
  viewMode: ViewMode;
  showAdvancedFilters: boolean;
  selectedDateRange: DateRangeType;
  showDatePicker: boolean;
}

export interface BulkActionState {
  selectedRooms: Set<string>;
  showBulkActions: boolean;
  bulkActionLoading: boolean;
  allVisibleSelected: boolean;
  allRoomsSelected: boolean;
  favoriteMode: boolean;
  deleteMode: boolean;
  pendingAction: PendingAction;
} 