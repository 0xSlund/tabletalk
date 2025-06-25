import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, ArrowLeft, History, Trophy, Users, Search, Filter, SortDesc, Loader2, Clock, MessageCircle, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { formatTimeRemaining } from '../lib/utils';

type RoomStatus = 'all' | 'active' | 'completed' | 'expired';

export function RoomHistoryScreen() {
  const navigate = useNavigate();
  const { setActiveTab, auth: { user }, joinRoom } = useAppStore();
  const [roomHistory, setRoomHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoomStatus>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadRoomHistory();
  }, []);

  useEffect(() => {
    // Check for user's preferred color scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    
    // Load dark mode setting from localStorage if available
    const savedDarkMode = localStorage.getItem('tableTalk-darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  const loadRoomHistory = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('room_history')
        .select(`
          id, joined_at,
          rooms:rooms(
            id, name, code, created_at, expires_at,
            voting_results:voting_results(
              suggestion_id, winning_option_id, votes_count,
              winning_option:suggestion_options(id, text)
            )
          )
        `)
        .eq('profile_id', user.id)
        .order('joined_at', { ascending: false });
        
      if (error) throw error;
      
      setRoomHistory(data || []);
    } catch (err) {
      console.error('Error loading room history:', err);
      setError('Failed to load room history. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRoom = async (roomCode: string) => {
    if (!roomCode) return;
    
    try {
      // Check if room is expired
      const now = new Date();
      const room = roomHistory.find(item => item.rooms.code === roomCode);
      const expiresAt = room ? new Date(room.rooms.expires_at) : null;
      const isExpired = expiresAt && expiresAt <= now;
      
      // Try to join the room
      const success = await joinRoom(roomCode);
      if (success) {
        // Update app store to indicate this is a completed room view
        if (isExpired) {
          // This will be used by the Voting component to know to show results immediately
          useAppStore.setState(state => ({
            ...state,
            isViewingCompletedRoom: true
          }));
          setActiveTab('active-room');
        } else {
          setActiveTab('active-room');
        }
      } else {
        setError('Could not join this room. It may have been deleted or expired.');
      }
    } catch (err) {
      console.error('Error joining room:', err);
      setError('An error occurred while trying to join the room.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoomStatus = (expiresAt: string, hasResults: boolean): 'active' | 'completed' | 'expired' => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const isActive = expiration > now;
    
    if (isActive) return 'active';
    return hasResults ? 'completed' : 'expired';
  };

  const getStatusCounts = () => {
    const counts = { all: roomHistory.length, active: 0, completed: 0, expired: 0 };
    
    roomHistory.forEach(item => {
      const hasResults = item.rooms.voting_results && item.rooms.voting_results.length > 0;
      const status = getRoomStatus(item.rooms.expires_at, hasResults);
      counts[status]++;
    });
    
    return counts;
  };

  const filteredRooms = roomHistory
    .filter(item => {
      const matchesSearch = item.rooms.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      
      if (statusFilter === 'all') return true;
      
      const hasResults = item.rooms.voting_results && item.rooms.voting_results.length > 0;
      const status = getRoomStatus(item.rooms.expires_at, hasResults);
      return status === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime();
      } else {
        return a.rooms.name.localeCompare(b.rooms.name);
      }
    });

  const statusCounts = getStatusCounts();

  const renderRoomCard = (item: any) => {
    const hasResults = item.rooms.voting_results && item.rooms.voting_results.length > 0;
    const status = getRoomStatus(item.rooms.expires_at, hasResults);
    const isActive = status === 'active';
    
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className={`relative rounded-xl p-4 transition-all duration-200 group cursor-pointer ${
          darkMode
            ? `border border-gray-700 ${
                isActive 
                  ? 'bg-gradient-to-br from-primary/15 to-primary/5 border-primary/20' 
                  : 'bg-gray-800'
              }`
            : `border border-gray-200 ${
                isActive 
                  ? 'bg-gradient-to-br from-primary/15 to-primary/5 border-primary/20' 
                  : 'bg-white'
              }`
        }`}
        onClick={() => handleViewRoom(item.rooms.code)}
      >
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {status === 'active' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Active
            </div>
          )}
          {status === 'completed' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
              <Trophy className="w-3 h-3" />
              Completed
            </div>
          )}
          {status === 'expired' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              <Clock className="w-3 h-3" />
              Expired
            </div>
          )}
        </div>

        <div className="pr-20">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {item.rooms.name}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full font-mono ${
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {item.rooms.code}
            </span>
          </div>

          <div className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Joined {formatDate(item.joined_at)}
          </div>

          {hasResults && status === 'completed' && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Trophy className="w-4 h-4 text-orange-500" />
              <span className={`text-sm font-medium ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                Winner: {item.rooms.voting_results[0].winning_option.text}
              </span>
            </div>
          )}

          {status === 'active' && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <Clock className="w-4 h-4" />
              <span>Expires {formatTimeRemaining(item.rooms.expires_at)}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="absolute bottom-3 right-3">
          {status === 'active' ? (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium">
              <MessageCircle className="w-4 h-4" />
              Join Room
            </div>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
              <Trophy className="w-4 h-4" />
              View Results
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-background-peach to-background-cream'
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
                darkMode ? 'bg-white' : 'bg-primary'
              }`}>
                <UtensilsCrossed className={`w-5 h-5 ${
                  darkMode ? 'text-primary' : 'text-white'
                }`} />
              </div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                All Rooms
              </h1>
            </div>
            
            {/* Sort Options moved to header */}
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('date')}
                className={`flex items-center gap-1 px-3 py-2 rounded-md border transition-colors ${
                  sortBy === 'date' 
                    ? darkMode
                      ? 'bg-blue-900/50 border-blue-500 text-blue-400'
                      : 'bg-blue-50 border-blue-200 text-blue-600'
                    : darkMode
                      ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <SortDesc className="w-4 h-4" />
                <span>Date</span>
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`flex items-center gap-1 px-3 py-2 rounded-md border transition-colors ${
                  sortBy === 'name' 
                    ? darkMode
                      ? 'bg-blue-900/50 border-blue-500 text-blue-400'
                      : 'bg-blue-50 border-blue-200 text-blue-600'
                    : darkMode
                      ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Name</span>
              </button>
            </div>
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
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search rooms..."
              className={`block w-full pl-10 pr-3 py-3 rounded-xl shadow-sm transition-colors ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'all', label: 'All Rooms', count: statusCounts.all },
              { key: 'active', label: 'Active', count: statusCounts.active },
              { key: 'completed', label: 'Completed', count: statusCounts.completed },
              { key: 'expired', label: 'Expired', count: statusCounts.expired }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key as RoomStatus)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === key
                    ? 'bg-primary text-white'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  statusFilter === key
                    ? 'bg-white/20'
                    : darkMode
                      ? 'bg-gray-600'
                      : 'bg-gray-200'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>



          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* Room List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm ? 'No rooms match your search.' : statusFilter === 'all' ? 'No room history found.' : `No ${statusFilter} rooms found.`}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map(renderRoomCard)}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}