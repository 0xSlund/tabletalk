import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, ArrowLeft, History, Trophy, Users, Search, Filter, SortDesc, Loader2 } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { formatTimeRemaining } from '../lib/utils';

export function RoomHistoryScreen() {
  const { setActiveTab, auth: { user }, joinRoom } = useAppStore();
  const [roomHistory, setRoomHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoomHistory();
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

  const isRoomActive = (expiresAt: string) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    return expiration > now;
  };

  const filteredRooms = roomHistory
    .filter(item => 
      item.rooms.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime();
      } else {
        return a.rooms.name.localeCompare(b.rooms.name);
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Profile</span>
            </button>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">Room History</h1>
            </div>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <History className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-semibold">Your Room History</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            View all the rooms you've participated in and your voting history.
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search rooms..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('date')}
                className={`flex items-center gap-1 px-3 py-2 rounded-md border ${
                  sortBy === 'date' 
                    ? 'bg-blue-50 border-blue-200 text-blue-600' 
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                <SortDesc className="w-4 h-4" />
                <span>Date</span>
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`flex items-center gap-1 px-3 py-2 rounded-md border ${
                  sortBy === 'name' 
                    ? 'bg-blue-50 border-blue-200 text-blue-600' 
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Name</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Room List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? 'No rooms match your search.' : 'No room history found.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRooms.map((item) => {
                const isActive = isRoomActive(item.rooms.expires_at);
                const hasResults = item.rooms.voting_results && item.rooms.voting_results.length > 0;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white">
                      <div className="mb-3 sm:mb-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.rooms.name}</h3>
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                            {item.rooms.code}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">Joined: {formatDate(item.joined_at)}</p>
                        
                        {hasResults && (
                          <div className="mt-2 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-gray-700">
                              Winner: {item.rooms.voting_results[0].winning_option.text}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {isActive ? (
                          <motion.button
                            onClick={() => handleViewRoom(item.rooms.code)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium"
                          >
                            <Users className="w-4 h-4" />
                            <span>Join Room</span>
                          </motion.button>
                        ) : (
                          <motion.button
                            onClick={() => handleViewRoom(item.rooms.code)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium"
                          >
                            <Trophy className="w-4 h-4" />
                            <span>View Results</span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                    
                    {/* Status Bar */}
                    <div className={`px-4 py-2 text-sm font-medium ${
                      isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {isActive ? (
                        <div className="flex items-center justify-between">
                          <span>Active Room</span>
                          <span>{formatTimeRemaining(item.rooms.expires_at)}</span>
                        </div>
                      ) : (
                        <span>Voting Ended</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}