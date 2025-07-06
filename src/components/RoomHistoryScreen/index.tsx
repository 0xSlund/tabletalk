import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, ArrowLeft, History, Loader2, Heart, Trash2, Settings, Check, Users, Calendar, Clock, X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../lib/store';

// Types
import { 
  RoomStatus, ViewMode, SortBy, SortDirection, DateRangeType, PendingAction,
  RoomHistoryItem, DateRange
} from './types';

// Hooks
import { useRoomHistory, useDarkMode } from './hooks';

// Utils
import { filterRooms, sortRooms, getStatusCounts, isRoomOlderThan30Days, isRoomOlderThan90Days } from './utils';
import { cleanupOldExpiredRooms, archiveRoom, unarchiveRoom } from './utils/roomCleanup';

// Constants
import { ROOMS_PER_PAGE_GRID, ROOMS_PER_PAGE_LIST } from './constants';

// Components
import {
  RoomCard,
  SearchBar,
  StatusFilters,
  AdvancedFilters,
  Pagination,
  BulkActionsBar,
  DatePickerModal,
  EmptyState
} from './components';
import SkeletonLoader from '../SkeletonLoader';

export function RoomHistoryScreen() {
  const navigate = useNavigate();
  const { joinRoom, auth } = useAppStore();
  const { roomHistory, isLoading } = useRoomHistory();
  const { darkMode } = useDarkMode();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoomStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' });

  // Removed viewMode - always use grid view
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeType>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);

  // Bulk action states
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [allVisibleSelected, setAllVisibleSelected] = useState(false);
  const [allRoomsSelected, setAllRoomsSelected] = useState(false);
  const [favoriteMode, setFavoriteMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [navigatingToRoom, setNavigatingToRoom] = useState<string | null>(null);

  // Handle room viewing with optimized loading
  const handleViewRoom = async (roomCode: string) => {
    if (!roomCode || navigatingToRoom) return;
    
    try {
      console.log('Attempting to view room:', roomCode);
      
      // Set loading state for this specific room
      setNavigatingToRoom(roomCode);
      
      // Find the room data to determine its status
      const roomItem = legacyFilteredRooms.find(item => item.rooms.code === roomCode);
      
      // Determine the correct route based on room status
      let routePath = `/active-room/${roomCode}`; // default
      
      if (roomItem) {
        const now = new Date();
        const expiresAt = new Date(roomItem.rooms.expires_at);
        const isExpired = expiresAt <= now;
        const hasResults = Boolean(roomItem.rooms.voting_results && roomItem.rooms.voting_results.length > 0);
        
        if (isExpired) {
          if (hasResults) {
            routePath = `/completed-room/${roomCode}`;
          } else {
            routePath = `/expired-room/${roomCode}`;
          }
        }
      }
      
      console.log(`Navigating to: ${routePath}`);
      
      // Pre-load room data for smoother transition
      const preloadPromise = joinRoom(roomCode);
      
      // Set previous page for navigation
      useAppStore.setState(state => ({
        ...state,
        previousPage: 'room-history'
      }));
      
      // Small delay to show loading state, then navigate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to the appropriate route
      navigate(routePath);
      
      // Ensure room data is loaded in background
      await preloadPromise;
    } catch (err) {
      console.error('Error viewing room:', err);
      // Don't show alert for better UX - let ActiveRoomScreen handle errors
    } finally {
      setNavigatingToRoom(null);
    }
  };

  // Handle room archiving
  const handleArchiveRoom = async (roomId: string) => {
    const success = await archiveRoom(roomId);
    if (success) {
      // Refresh room history to show updated state
      window.location.reload(); // Simple refresh for now
    }
  };

  // Handle room unarchiving
  const handleUnarchiveRoom = async (roomId: string) => {
    const success = await unarchiveRoom(roomId);
    if (success) {
      // Refresh room history to show updated state
      window.location.reload(); // Simple refresh for now
    }
  };

  // Filter and sort rooms
  const filteredRooms = filterRooms(roomHistory, searchTerm, dateRange, [statusFilter]);
  const sortedRooms = sortRooms(filteredRooms, sortBy, sortDirection);
  const statusCounts = getStatusCounts(roomHistory);

  // Legacy filter for backward compatibility
  const legacyFilteredRooms = sortedRooms.filter(item => {
    if (statusFilter === 'all') return true;
    const hasResults = item.rooms.voting_results && item.rooms.voting_results.length > 0;
    const status = item.rooms.expires_at < new Date().toISOString() 
      ? (hasResults ? 'completed' : 'expired')
      : 'active';
    return status === statusFilter;
  });

  // Pagination - always use grid view
  const roomsPerPage = ROOMS_PER_PAGE_GRID;
  const totalPages = Math.ceil(legacyFilteredRooms.length / roomsPerPage);
  const currentRooms = legacyFilteredRooms.slice(
    currentPage * roomsPerPage, 
    (currentPage + 1) * roomsPerPage
  );

  // Room selection handlers
  const toggleRoomSelection = (roomId: string) => {
    const newSelected = new Set(selectedRooms);
    if (newSelected.has(roomId)) {
      newSelected.delete(roomId);
    } else {
      newSelected.add(roomId);
    }
    setSelectedRooms(newSelected);
    
    if (favoriteMode || deleteMode || newSelected.size > 0) {
      setShowBulkActions(true);
    } else {
      setShowBulkActions(false);
    }
  };

  const selectAllRooms = () => {
    if (allVisibleSelected) {
      const visibleRoomIds = new Set(currentRooms.map(item => item.id));
      const newSelectedRooms = new Set(selectedRooms);
      visibleRoomIds.forEach(id => newSelectedRooms.delete(id));
      setSelectedRooms(newSelectedRooms);
      setShowBulkActions(newSelectedRooms.size > 0 || favoriteMode || deleteMode);
    } else {
      const currentPageRoomIds = new Set(currentRooms.map(item => item.id));
      setSelectedRooms(prev => new Set([...prev, ...currentPageRoomIds]));
      setShowBulkActions(true);
    }
  };

  const selectAllRoomsTotal = () => {
    if (allRoomsSelected) {
      setSelectedRooms(new Set());
      setAllRoomsSelected(false);
      setAllVisibleSelected(false);
      setShowBulkActions(false);
    } else {
      const allRoomIds = new Set(roomHistory.map(item => item.id));
      setSelectedRooms(allRoomIds);
      setAllRoomsSelected(true);
      setAllVisibleSelected(true);
      setShowBulkActions(true);
    }
  };

  const clearSelection = () => {
    setSelectedRooms(new Set());
    setAllVisibleSelected(false);
    setAllRoomsSelected(false);
    setShowBulkActions(false);
  };

  // Bulk action handlers
  const handleBulkFavorite = async () => {
    setBulkActionLoading(true);
    // Implement bulk favorite logic here
    setTimeout(() => {
      setBulkActionLoading(false);
      clearSelection();
    }, 1000);
  };

  const handleConfirmBulkAction = () => {
    if (pendingAction === 'favorite') {
      handleBulkFavorite();
    } else if (pendingAction === 'delete') {
      // Handle delete action
    }
  };

  const handleCancelBulkAction = () => {
    setFavoriteMode(false);
    setDeleteMode(false);
    setPendingAction(null);
    setShowBulkActions(false);
    clearSelection();
  };

  const hasActiveFilters = () => {
    return (
      searchTerm !== '' ||
      statusFilter !== 'all' ||
      selectedDateRange !== null ||
      favoriteMode ||
      deleteMode ||
      showBulkActions
    );
  };

  const clearAllFilters = () => {
    setDateRange({ start: '', end: '' });
    setStatusFilter('all');
    setSearchTerm('');
    setFavoriteMode(false);
    setDeleteMode(false);
    setPendingAction(null);
    setShowBulkActions(false);
    setSelectedDateRange(null);
    setShowDatePicker(false);
    clearSelection();
  };

  // Pagination handlers
  const goToNextPage = async () => {
    if (currentPage < totalPages - 1) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = async () => {
    if (currentPage > 0) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setCurrentPage(prev => prev - 1);
    }
  };

  // Effects
  useEffect(() => {
    setCurrentPage(0);
  }, [statusFilter, searchTerm, sortBy]);

  useEffect(() => {
    if (currentRooms.length > 0) {
      const currentPageRoomIds = currentRooms.map(item => item.id);
      const allCurrentPageSelected = currentPageRoomIds.every(id => selectedRooms.has(id));
      setAllVisibleSelected(allCurrentPageSelected && currentPageRoomIds.length > 0);
    } else {
      setAllVisibleSelected(false);
    }
  }, [selectedRooms, currentRooms]);

  // Run cleanup when component loads
  useEffect(() => {
    const runCleanup = async () => {
      if (auth.user?.id) {
        try {
          const deletedCount = await cleanupOldExpiredRooms(auth.user.id);
          if (deletedCount > 0) {
            console.log(`Cleaned up ${deletedCount} old expired rooms`);
            // Optionally refresh room history after cleanup
            // This would require exposing a refresh function from useRoomHistory
          }
        } catch (error) {
          console.error('Error during room cleanup:', error);
        }
      }
    };

    runCleanup();
  }, [auth.user?.id]);



  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode 
        ? 'bg-zinc-900' 
        : 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3]'
    }`}>
      {/* Header */}
      <header className={`${
        darkMode ? 'bg-gray-800/80' : 'bg-white/80'
      } backdrop-blur-sm shadow-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-orange-500' : 'bg-orange-500'
              }`}>
                <History className={`w-5 h-5 text-white`} />
              </div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Room History
              </h1>
            </div>
            <div className="w-4" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl shadow-xl p-6 mb-6 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <History className="w-6 h-6 text-blue-500" />
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Your Room History
            </h2>
          </div>
          
          <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage all the rooms you've participated in.
          </p>

          {/* Search Bar */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            darkMode={darkMode}
            filteredCount={legacyFilteredRooms.length}
          />

          {/* Main controls row */}
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                <AdvancedFilters
                  showAdvancedFilters={showAdvancedFilters}
                  onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  darkMode={darkMode}
                />

              <StatusFilters
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                statusCounts={statusCounts}
                darkMode={darkMode}
              />
            </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`rounded-xl border overflow-hidden shadow-lg mb-6 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Bulk Actions Column */}
                    <div className="flex flex-col justify-start h-full">
                      <label className={`text-sm font-medium mb-3 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        <Heart className="w-4 h-4 inline mr-2 text-teal-500" />
                        Bulk Actions
                      </label>
                      
                      <div className="space-y-2">
                        {/* Favorite Button */}
                        <motion.button
                          onClick={() => {
                            const newFavoriteMode = !favoriteMode;
                            setFavoriteMode(newFavoriteMode);
                            setDeleteMode(false);
                            setPendingAction(newFavoriteMode ? 'favorite' : null);
                            setShowBulkActions(newFavoriteMode || selectedRooms.size > 0);
                          }}
                          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            favoriteMode
                              ? darkMode
                                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 border border-teal-400'
                                : 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 border border-teal-400'
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Heart className={`w-4 h-4 ${favoriteMode ? 'fill-current' : ''}`} />
                          <span>Favorite</span>
                          {favoriteMode && selectedRooms.size > 0 && (
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                              {selectedRooms.size}
                            </span>
                          )}
                        </motion.button>
                        
                        {/* Delete Button */}
                        <motion.button
                          onClick={() => {
                            const newDeleteMode = !deleteMode;
                            setDeleteMode(newDeleteMode);
                            setFavoriteMode(false);
                            setPendingAction(newDeleteMode ? 'delete' : null);
                            setShowBulkActions(newDeleteMode || selectedRooms.size > 0);
                          }}
                          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            deleteMode
                              ? darkMode
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 border border-red-400'
                                : 'bg-red-500 text-white shadow-lg shadow-red-500/30 border border-red-400'
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                          {deleteMode && selectedRooms.size > 0 && (
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                              {selectedRooms.size}
                            </span>
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Quick Actions Column */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className={`text-sm font-medium ${
                          darkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          <Settings className="w-4 h-4 inline mr-2 text-blue-500" />
                          Quick Actions
                        </label>
                        {hasActiveFilters() && (
                          <motion.button
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onClick={clearAllFilters}
                            className={`text-xs font-medium transition-all cursor-pointer hover:underline ${
                              darkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Clear all filters
                          </motion.button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <motion.button
                          onClick={selectAllRooms}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            allVisibleSelected
                              ? darkMode
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 border border-blue-400'
                                : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 border border-blue-400'
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                          }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <motion.div
                            key={allVisibleSelected ? 'deselect' : 'select'}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                          >
                            {allVisibleSelected ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </motion.div>
                          {allVisibleSelected ? 'Deselect Visible' : 'Select Visible'}
                        </motion.button>

                        <motion.button
                          onClick={selectAllRoomsTotal}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            allRoomsSelected
                              ? darkMode
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 border border-green-400'
                                : 'bg-green-500 text-white shadow-lg shadow-green-500/30 border border-green-400'
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                          }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <motion.div
                            key={allRoomsSelected ? 'deselect-all' : 'select-all'}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                          >
                            {allRoomsSelected ? <X className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                          </motion.div>
                          {allRoomsSelected ? 'Deselect All' : 'Select All Rooms'}
                        </motion.button>
                      </div>
                    </div>
                    
                    {/* Date Range Column */}
                    <div className="relative">
                      <label className={`block text-sm font-medium mb-3 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        <Calendar className="w-4 h-4 inline mr-2 text-purple-500" />
                        Date Range
                      </label>
                      
                      <div className="space-y-2">
                        {/* Last 7 Days Button */}
                        <motion.button
                          onClick={() => {
                            if (selectedDateRange === 'last7') {
                              // If already selected, deselect it
                              setDateRange({ start: '', end: '' });
                              setSelectedDateRange(null);
                            } else {
                              // If not selected, select it
                              const today = new Date();
                              const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                              setDateRange({
                                start: lastWeek.toISOString().split('T')[0],
                                end: today.toISOString().split('T')[0]
                              });
                              setSelectedDateRange('last7');
                            }
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedDateRange === 'last7'
                              ? darkMode
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 border border-blue-400'
                                : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 border border-blue-400'
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Clock className="w-4 h-4" />
                          <span>Last 7 Days</span>
                          {selectedDateRange === 'last7' && (
                            <motion.button
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDateRange({ start: '', end: '' });
                                setSelectedDateRange(null);
                              }}
                              className="ml-auto p-1 rounded-full hover:bg-white/20 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </motion.button>
                          )}
                        </motion.button>
                        
                        {/* Last 30 Days Button */}
                        <motion.button
                          onClick={() => {
                            if (selectedDateRange === 'last30') {
                              // If already selected, deselect it
                              setDateRange({ start: '', end: '' });
                              setSelectedDateRange(null);
                            } else {
                              // If not selected, select it
                              const today = new Date();
                              const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                              setDateRange({
                                start: lastMonth.toISOString().split('T')[0],
                                end: today.toISOString().split('T')[0]
                              });
                              setSelectedDateRange('last30');
                            }
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedDateRange === 'last30'
                              ? darkMode
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 border border-green-400'
                                : 'bg-green-500 text-white shadow-lg shadow-green-500/30 border border-green-400'
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Last 30 Days</span>
                          {selectedDateRange === 'last30' && (
                            <motion.button
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDateRange({ start: '', end: '' });
                                setSelectedDateRange(null);
                              }}
                              className="ml-auto p-1 rounded-full hover:bg-white/20 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </motion.button>
                          )}
                        </motion.button>

                        {/* Last 3 Months Button */}
                        <motion.button
                          onClick={() => {
                            if (selectedDateRange === 'last3months') {
                              // If already selected, deselect it
                              setDateRange({ start: '', end: '' });
                              setSelectedDateRange(null);
                            } else {
                              // If not selected, select it
                              const today = new Date();
                              const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                              setDateRange({
                                start: threeMonthsAgo.toISOString().split('T')[0],
                                end: today.toISOString().split('T')[0]
                              });
                              setSelectedDateRange('last3months');
                            }
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedDateRange === 'last3months'
                              ? darkMode
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 border border-orange-400'
                                : 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 border border-orange-400'
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Last 3 Months</span>
                          {selectedDateRange === 'last3months' && (
                            <motion.button
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDateRange({ start: '', end: '' });
                                setSelectedDateRange(null);
                              }}
                              className="ml-auto p-1 rounded-full hover:bg-white/20 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </motion.button>
                          )}
                        </motion.button>
                        
                        {/* Custom Date Range Button */}
                        <motion.button
                          onClick={() => {
                            setShowDatePicker(true);
                            setSelectedDateRange('custom');
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedDateRange === 'custom'
                              ? darkMode
                                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 border border-teal-400'
                                : 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 border border-teal-400'
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Custom Range</span>
                          {(dateRange.start || dateRange.end) && selectedDateRange === 'custom' && (
                            <span className="ml-auto bg-white/20 px-2 py-0.5 rounded text-xs">
                              {dateRange.start && dateRange.end 
                                ? `${new Date(dateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(dateRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                : 'Set dates'
                              }
                            </span>
                          )}
                          <motion.div
                            animate={{ rotate: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-auto"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Room List */}
          {isLoading ? (
            <div className="space-y-6">
              <div className={`flex items-center justify-between text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
              <SkeletonLoader variant="grid" count={6} />
            </div>
          ) : legacyFilteredRooms.length === 0 ? (
            <EmptyState
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              darkMode={darkMode}
            />
          ) : (
            <div className="space-y-6">
              {/* Results summary */}
              <div className={`flex items-center justify-between text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <span>{legacyFilteredRooms.length} rooms</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    selectedRooms.size > 0
                      ? darkMode ? 'bg-blue-900/50 text-blue-400 opacity-100' : 'bg-blue-100 text-blue-700 opacity-100'
                      : 'opacity-0 pointer-events-none'
                  }`}>
                    {selectedRooms.size > 0 ? `${selectedRooms.size} selected` : '0 selected'}
                  </span>
                </div>
              </div>

              {/* Room Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentPage}-grid`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {currentRooms.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: index * 0.03, 
                        duration: 0.2,
                        ease: "easeOut"
                      }}
                    >
                      <RoomCard
                        item={item}
                        isSelected={selectedRooms.has(item.id)}
                        showAdvancedFilters={showAdvancedFilters}
                        viewMode="grid"
                        darkMode={darkMode}
                        isNavigating={navigatingToRoom === item.rooms.code}
                        onToggleSelection={toggleRoomSelection}
                        onViewRoom={handleViewRoom}
                        onArchiveRoom={handleArchiveRoom}
                        onUnarchiveRoom={handleUnarchiveRoom}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && legacyFilteredRooms.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onPreviousPage={goToPreviousPage}
              onNextPage={goToNextPage}
              darkMode={darkMode}
            />
          )}

          {/* Bulk Actions Bar */}
          <AnimatePresence mode="wait">
            <BulkActionsBar
              selectedRoomsCount={selectedRooms.size}
              favoriteMode={favoriteMode}
              deleteMode={deleteMode}
              pendingAction={pendingAction}
              bulkActionLoading={bulkActionLoading}
              darkMode={darkMode}
              onConfirmAction={handleConfirmBulkAction}
              onCancelAction={handleCancelBulkAction}
              onClearSelection={() => {
                setShowBulkActions(false);
                clearSelection();
              }}
            />
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Date Picker Modal */}
      <AnimatePresence>
        <DatePickerModal
          show={showDatePicker}
          dateRange={dateRange}
          darkMode={darkMode}
          onClose={() => setShowDatePicker(false)}
          onDateRangeChange={setDateRange}
          onSelectedDateRangeChange={setSelectedDateRange}
          onApply={() => setShowDatePicker(false)}
        />
      </AnimatePresence>
    </div>
  );
} 