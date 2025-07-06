import React, { useState, useRef, useEffect } from 'react';
import { Timer, Users, Copy, Check, Share2, Trophy } from 'lucide-react';
import { useAppStore } from '../../../../lib/store';
import { formatTime } from '../../utils/formatters';
import { supabase } from '../../../../lib/supabase';
import { motion } from 'framer-motion';
import { getThemeColors } from '../../utils/themeUtils';
import { WinnersPodiumModal } from '../WinnersPodiumModal';

export const RoomSidebar: React.FC = () => {
  const { currentRoom } = useAppStore();
  const theme = getThemeColors(currentRoom?.foodMode);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isRoomExpired, setIsRoomExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [initialTimeTotal, setInitialTimeTotal] = useState(0);
  const [showWinnersPodium, setShowWinnersPodium] = useState(false);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const shareOptionsRef = useRef<HTMLDivElement>(null);
  
  // Collapsible sections state for mobile
  const [collapsedSections, setCollapsedSections] = useState({
    participants: false,
    roomInfo: false
  });
  
  // Function to refresh participant profiles
  const refreshParticipantProfiles = async () => {
    if (!currentRoom) return;
    
    // Use getState to avoid function dependency
    const { fetchUserProfile } = useAppStore.getState();
    
    // Update each participant's profile
    currentRoom.participants.forEach(participant => {
      fetchUserProfile(participant.id);
    });
  };
  
  // Refresh participant profiles only when room changes - remove polling interval
  useEffect(() => {
    if (!currentRoom) return;
    
    // Refresh immediately on mount or room change
    refreshParticipantProfiles();
    
    // Remove the 30-second polling interval to prevent excessive requests
    // Only refresh when the room actually changes
  }, [currentRoom?.id]); // Only depend on room ID
  
  // Effect to handle time calculation
  useEffect(() => {
    if (!currentRoom || !currentRoom.expiresAt) return;
    
    const expiresAt = new Date(currentRoom.expiresAt).getTime();
    const now = new Date().getTime();
    const timeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
    
    // Calculate and set the initial total time
    const createdAt = new Date(currentRoom.createdAt || Date.now()).getTime();
    const totalDuration = Math.floor((expiresAt - createdAt) / 1000);
    
    // If total time is extremely short or invalid, use a reasonable default
    const validTotalDuration = totalDuration > 60 ? totalDuration : 1800; // Default to 30 minutes
    
    // Only log timer calculation in development and when room first loads
    if (process.env.NODE_ENV === 'development' && timeLeft > 0) {
      console.log(`Timer initialized: ${timeLeft}s remaining`);
    }
    
    setTimeRemaining(timeLeft);
    setInitialTimeTotal(validTotalDuration);
    
    setIsRoomExpired(timeLeft <= 0 || currentRoom.isActive === false);
  }, [currentRoom?.id, currentRoom?.expiresAt, currentRoom?.createdAt, currentRoom?.isActive]);
  
  // Effect to handle clicks outside of share options dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareOptionsRef.current && !shareOptionsRef.current.contains(event.target as Node)) {
        setShowShareOptions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Function to get the timer color based on remaining time
  const getTimerColor = (seconds: number) => {
    // Calculate percentage of time remaining
    const percentageRemaining = (seconds / initialTimeTotal) * 100;
    
    // Remove verbose timer percentage logging
    
    if (percentageRemaining > 50) {
      return '#22C55E'; // Green for > 50% time remaining
    } else if (percentageRemaining > 25) {
      return '#F59E0B'; // Yellow/amber for 26-50% time remaining
    } else if (percentageRemaining > 10) {
      return '#FB923C'; // Orange for 11-25% time remaining
    } else {
      return '#EF4444'; // Red for ≤ 10% time remaining
    }
  };
  
  // Timer update effect
  useEffect(() => {
    if (!currentRoom || !currentRoom.expiresAt || isRoomExpired) return;
    
    const timerInterval = setInterval(() => {
      const expiresAt = new Date(currentRoom.expiresAt).getTime();
      const now = new Date().getTime();
      const timeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
      
      setTimeRemaining(timeLeft);
      
      if (timeLeft <= 0) {
        setIsRoomExpired(true);
        clearInterval(timerInterval);
        
        // Don't call handleExpiredRoom here since it's already being handled in RoomContext
        // This prevents duplicate handling of expired rooms
      }
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [currentRoom?.id, currentRoom?.expiresAt, isRoomExpired]);
  
  // Function to handle copying the room code
  const handleCopyRoomCode = () => {
    if (!currentRoom) return;
    
    navigator.clipboard.writeText(currentRoom.code || '');
    setCodeCopied(true);
    
    setTimeout(() => {
      setCodeCopied(false);
    }, 2000);
  };
  
  // Function to handle room sharing
  const shareRoom = async (platform?: string) => {
    if (!currentRoom) return;
    
    const roomLink = `${window.location.origin}/join/${currentRoom.code}`;
    const shareText = `Join our food discussion in room "${currentRoom.name}" on TableTalk!`;
    
    try {
      if (platform === 'clipboard') {
        await navigator.clipboard.writeText(roomLink);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
        return;
      }
      
      if (platform === 'email') {
        const mailtoLink = `mailto:?subject=${encodeURIComponent(`Join my TableTalk room: ${currentRoom.name}`)}&body=${encodeURIComponent(`${shareText}\n\n${roomLink}`)}`;
        window.open(mailtoLink);
        return;
      }

      if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${roomLink}`)}`);
        return;
      }
      
      if (platform === 'telegram') {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(roomLink)}&text=${encodeURIComponent(shareText)}`);
        return;
      }
      
      if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${roomLink}`)}`);
        return;
      }
      
      // Use Web Share API if available and no specific platform chosen
      if (!platform && navigator.share) {
        await navigator.share({
          title: `Join TableTalk Room: ${currentRoom.name}`,
          text: shareText,
          url: roomLink
        });
        return;
      }
      
      // Fallback to clipboard copy
      await navigator.clipboard.writeText(roomLink);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (error) {
      console.error('Error sharing room:', error);
    } finally {
      setShowShareOptions(false);
    }
  };
  
  // Function to format time without leading zeros
  const formatTimeMinutes = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Calculate vote counts for winners podium
  useEffect(() => {
    if (!currentRoom?.suggestions) {
      setVoteCounts({});
      setTotalVotes(0);
      return;
    }

    // Get vote data from global state or current room
    const globalState = (window as any).__tabletalk_state;
    const voteMapping = globalState?.votesMap || currentRoom?.votes || {};
    
    // Initialize counts for each suggestion
    const counts = currentRoom.suggestions.reduce((acc: Record<string, number>, suggestion) => {
      acc[suggestion.id] = 0;
      return acc;
    }, {});

    // Count votes based on the vote mapping
    Object.entries(voteMapping).forEach(([userId, suggestionId]) => {
      if (counts[suggestionId as string] !== undefined) {
        counts[suggestionId as string]++;
      }
    });

    setVoteCounts(counts);
    setTotalVotes(Object.values(counts).reduce((sum, count) => sum + count, 0));
  }, [currentRoom?.suggestions, currentRoom?.votes, currentRoom?.id]);

  // Function to view the winners podium
  const handleViewWinnersPodium = () => {
    setShowWinnersPodium(true);
  };
  
  if (!currentRoom) return null;
  
  return (
    <>
      {/* Participants Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 group/section">
        <div 
          className="flex items-center justify-between mb-4 cursor-pointer md:cursor-default group relative"
          onClick={() => setCollapsedSections(prev => ({...prev, participants: !prev.participants}))}
        >
          <div className="flex items-center gap-2">
            <Users className={`w-5 h-5 ${theme.headerIcon} transition-colors duration-300 group-hover:${theme.iconColorHover}`} />
            <h2 className={`text-xl font-semibold text-gray-900 transition-colors duration-300 group-hover:${theme.iconColorHover}`}>Participants</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-gray-600">
              <span>{currentRoom.participants?.length || 0}</span>
            </div>
            
            {/* Animated chevron indicator */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-gray-400 transition-all duration-300 group-hover:${theme.headerIcon}`}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`transition-transform duration-300 ${collapsedSections.participants ? 'rotate-180' : 'rotate-0'}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>
        
        {!collapsedSections.participants && (
          <div className="space-y-3">
            {currentRoom.participants?.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {participant.avatar ? (
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = 'none';
                        (target.nextSibling as HTMLElement).style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-8 h-8 rounded-full ${theme.headerIcon.replace('text-', 'bg-')} flex items-center justify-center text-white font-semibold ${participant.avatar ? 'hidden' : ''}`}
                  >
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900">{participant.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                    Online
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Room Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 group/section">
        <div 
          className="flex items-center justify-between mb-4 cursor-pointer md:cursor-default group relative"
          onClick={() => setCollapsedSections(prev => ({...prev, roomInfo: !prev.roomInfo}))}
        >
          <div className="flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-blue-500 transition-colors duration-300 group-hover:text-blue-600"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">Room Info</h2>
          </div>
          
          {/* Animated chevron indicator */}
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 transition-all duration-300 group-hover:text-blue-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${collapsedSections.roomInfo ? 'rotate-180' : 'rotate-0'}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        
        {!collapsedSections.roomInfo && (
          <div className="space-y-4">
            {/* Room Code with One-Click Copy - Enhanced Design */}
            <div className={`relative overflow-hidden bg-gradient-to-r ${theme.bgGradient} p-4 rounded-lg shadow-sm hover:shadow transition-all duration-300 group`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 ${theme.headerIcon.replace('text-', 'bg-')} rounded-lg shadow-sm relative overflow-hidden flex items-center justify-center w-10 h-10`}>
                    <span className="text-white font-bold flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="9" x2="20" y2="9"></line>
                        <line x1="4" y1="15" x2="20" y2="15"></line>
                        <line x1="10" y1="3" x2="8" y2="21"></line>
                        <line x1="16" y1="3" x2="14" y2="21"></line>
                      </svg>
                    </span>
                    {/* Animation elements */}
                    <div className={`absolute inset-0 bg-green-500 transform ${codeCopied ? 'scale-100' : 'scale-0'} transition-transform duration-300 ease-out flex items-center justify-center`}>
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 font-medium">Room Code</span>
                    <p className={`font-mono font-bold text-lg tracking-wide ${theme.headerIcon} transition-all duration-300 group-hover:${theme.iconColorHover}`}>
                      {currentRoom.code || ''}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={handleCopyRoomCode}
                  className={`p-2.5 transition-all duration-300 ease-out rounded-full ${
                    codeCopied 
                      ? 'bg-green-100 text-green-600' 
                      : `${theme.iconColor.replace('text-', 'bg-').replace('-300', '-100')} ${theme.headerIcon} hover:${theme.iconColor.replace('text-', 'bg-').replace('-300', '-200')}`
                  }`}
                  title={codeCopied ? "Copied!" : "Copy room code"}
                >
                  {codeCopied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Copy notification animation */}
              <div className={`absolute inset-0 bg-green-50/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
                codeCopied ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-full text-green-600 font-medium shadow-sm">
                  <Check className="w-4 h-4" />
                  <span>Copied to clipboard!</span>
                </div>
              </div>
              
              {/* Decorative element */}
              <div className={`absolute -bottom-6 -right-6 w-12 h-12 ${
                codeCopied ? 'bg-green-200/50 scale-150' : `${theme.iconColor.replace('text-', 'bg-').replace('-300', '-200')}/50`
              } rounded-full transform transition-all duration-300 ease-in-out group-hover:scale-150`} />
            </div>
            
            {/* Timer Display */}
            <div className={`flex items-center justify-between ${
              isRoomExpired ? 'bg-red-50' : 'bg-slate-50'
            } p-3 rounded-lg relative group`}
            >
              <div className="flex items-center gap-2">
                <Timer className={`w-5 h-5 ${isRoomExpired ? 'text-red-500' : theme.headerIcon}`} />
                <span>{isRoomExpired ? 'Room Expired:' : 'Time Remaining:'}</span>
              </div>
              
              {isRoomExpired ? (
                <span className="font-medium text-red-600">
                  Voting Closed
                </span>
              ) : (
                <div className="flex items-center relative">
                  <div className="w-14 h-14 relative">
                    <svg 
                      className="w-full h-full"
                      viewBox="0 0 100 100"
                      style={{ transform: 'rotate(-90deg)' }}
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#f0f0f0"
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={getTimerColor(timeRemaining)}
                        strokeWidth="10"
                        strokeDasharray="283"
                        strokeDashoffset={
                          initialTimeTotal > 0 
                            ? Math.max(0, Math.min(283, 283 - (283 * (timeRemaining / initialTimeTotal))))
                            : 283
                        }
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 bg-white shadow-sm">
                        <span 
                          className="text-sm font-medium font-mono text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{ color: getTimerColor(timeRemaining) }}
                        >
                          {formatTimeMinutes(timeRemaining)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* View Winners Podium button for expired rooms */}
            {isRoomExpired && (
              <motion.button
                onClick={handleViewWinnersPodium}
                className={`flex items-center justify-center w-full mt-4 px-4 py-2.5 bg-gradient-to-r ${theme.buttonBg} text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Trophy size={16} className="mr-2" />
                <span className="font-medium">View Winners Podium</span>
              </motion.button>
            )}
            
            {/* Share Room Feature - Modern 2025 Design */}
            <div className="relative mt-6">
              <button 
                onClick={() => !isRoomExpired && setShowShareOptions(!showShareOptions)}
                disabled={isRoomExpired}
                className={`w-full py-3.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                  isRoomExpired 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                    : `bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white shadow-lg shadow-blue-200/50 ${
                        showShareOptions ? 'scale-95' : 'scale-100'
                      }`
                }`}
              >
                <Share2 className="w-5 h-5" />
                <span className="text-base">
                  {isRoomExpired ? 'Sharing Disabled' : 'Share Room'}
                </span>
              </button>
              
              {showShareOptions && !isRoomExpired && (
                <div
                  ref={shareOptionsRef}
                  className="absolute -top-4 left-0 transform -translate-y-full w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 transition-all duration-300 animate-fadeSlideDown"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-gray-800">Share Room</h3>
                      <button 
                        onClick={() => setShowShareOptions(false)}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                    
                    {/* Shareable Link Section */}
                    <div className="bg-gray-50 p-3 rounded-xl mb-4 flex items-center">
                      <input 
                        type="text" 
                        value={`${window.location.origin}/join/${currentRoom.code}`} 
                        className="flex-1 bg-transparent border-none text-sm text-gray-600 focus:outline-none truncate pr-2" 
                        readOnly
                      />
                      <button
                        onClick={() => shareRoom('clipboard')}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          codeCopied 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        {codeCopied ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            <span className="text-xs font-medium">Copied</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy className="w-4 h-4" />
                            <span className="text-xs font-medium">Copy</span>
                          </span>
                        )}
                      </button>
                    </div>
                    
                    {/* Share Options Grid */}
                    <div className="grid grid-cols-4 gap-3">
                      {/* Email */}
                      <button
                        onClick={() => shareRoom('email')}
                        className="flex flex-col items-center gap-1 p-3 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-gray-700">Email</span>
                      </button>
                      
                      {/* WhatsApp */}
                      <button
                        onClick={() => shareRoom('whatsapp')}
                        className="flex flex-col items-center gap-1 p-3 hover:bg-green-50 rounded-xl transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.6 6.31999C16.8 5.49999 15.8 4.84999 14.7 4.38999C13.6 3.92999 12.5 3.69999 11.3 3.69999C10.1 3.69999 8.99999 3.92999 7.89999 4.38999C6.79999 4.84999 5.79999 5.49999 5.00002 6.31999C4.20005 7.14 3.55002 8.13999 3.11001 9.28999C2.67001 10.44 2.45001 11.61 2.45001 12.83C2.45001 14.37 2.85001 15.83 3.64001 17.21L2.4 21.6L6.94999 20.37C8.29999 21.09 9.75 21.45 11.3 21.45C12.5 21.45 13.66 21.22 14.76 20.76C15.86 20.3 16.85 19.65 17.65 18.83C18.45 18.01 19.1 17.01 19.55 15.86C20 14.71 20.23 13.54 20.23 12.32C20.23 11.1 20 9.94 19.55 8.79C19.1 7.63999 18.45 6.64 17.6 6.31999V6.31999ZM11.3 19.95C9.99999 19.95 8.7 19.64 7.5 19.02L7.19999 18.84L4.45001 19.59L5.20001 16.92L5 16.61C4.3 15.38 3.95 14.05 3.95 12.62C3.95 11.62 4.13 10.65 4.5 9.71999C4.85 8.78999 5.35 7.96 5.97 7.22C6.6 6.48 7.35 5.9 8.2 5.47C9.05 5.04 9.95 4.83 10.9 4.83C11.85 4.83 12.75 5.04 13.6 5.47C14.45 5.9 15.2 6.48 15.83 7.22C16.45 7.96 16.95 8.78999 17.3 9.71999C17.65 10.65 17.83 11.62 17.83 12.62C17.83 13.62 17.65 14.58 17.3 15.51C16.95 16.44 16.45 17.27 15.83 18.01C15.2 18.75 14.45 19.33 13.6 19.76C12.75 20.19 12.25 20.05 11.3 20.05M15.45 14.05C15.3 13.95 15.16 13.86 15.05 13.83C14.93 13.8 14.65 13.66 14.38 13.53C14.1 13.4 13.96 13.34 13.85 13.32C13.73 13.29 13.58 13.32 13.42 13.47C13.26 13.62 12.96 13.97 12.82 14.13C12.69 14.29 12.54 14.31 12.39 14.24C12.24 14.17 12.01 14.1 11.76 13.97C11.5 13.84 11.13 13.62 10.73 13.2C10.33 12.79 10.12 12.45 10.03 12.23C9.94001 12.03 10.04 11.87 10.14 11.73C10.24 11.58 10.35 11.44 10.46 11.3C10.57 11.16 10.62 11.06 10.67 10.96C10.72 10.85 10.7 10.74 10.66 10.65C10.62 10.56 10.41 10.01 10.27 9.70999C10.13 9.42999 9.98 9.44 9.84 9.43C9.7 9.42 9.57 9.41 9.43 9.41C9.29 9.41 9.07 9.48999 8.85 9.66999C8.63 9.84999 8.27 10.15 8.27 10.7C8.27 11.25 8.62 11.79 8.67 11.88C8.72 11.98 9.27 12.92 10.13 13.71C10.99 14.5 11.84 14.78 12.17 14.87C12.5 14.97 12.95 14.95 13.34 14.86C13.73 14.78 14.21 14.51 14.35 14.17C14.49 13.83 14.49 13.53 14.45 13.47C14.41 13.4 14.26 13.35 14.05 13.25L15.45 14.05Z" fill="#10B981"/>
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-gray-700">WhatsApp</span>
                      </button>
                      
                      {/* Telegram */}
                      <button
                        onClick={() => shareRoom('telegram')}
                        className="flex flex-col items-center gap-1 p-3 hover:bg-sky-50 rounded-xl transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.8 3.27001L1.79995 10.15C0.794966 10.56 0.849962 11.25 1.65997 11.5L6.73994 13.03L18.86 6.27C19.29 5.99 19.67 6.14 19.35 6.44L9.50997 15.33H9.50995L9.50997 15.33L9.15996 20.51C9.53996 20.51 9.70995 20.33 9.92995 20.12L12.22 17.87L17.34 21.69C18.11 22.11 18.66 21.89 18.84 21.02L21.93 4.47001C22.2 3.41001 21.49 2.81001 20.8 3.27001H21.8Z" fill="#0EA5E9"/>
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-gray-700">Telegram</span>
                      </button>
                      
                      {/* Twitter/X */}
                      <button
                        onClick={() => shareRoom('twitter')}
                        className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.1761 4H19.9362L13.9061 10.7774L21 20H15.4456L11.0951 14.4066L6.11723 20H3.35544L9.80517 12.7455L3 4H8.69545L12.6279 9.11258L17.1761 4ZM16.2073 18.3754H17.7368L7.86441 5.53928H6.2232L16.2073 18.3754Z" fill="#111827"/>
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-gray-700">X</span>
                      </button>
                    </div>
                    
                    {/* QR Code */}
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="flex justify-center">
                        <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center">
                          <div className="text-xs text-center text-gray-500">
                            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="20" y="20" width="20" height="20" rx="2" fill="black" />
                              <rect x="60" y="20" width="20" height="20" rx="2" fill="black" />
                              <rect x="20" y="60" width="20" height="20" rx="2" fill="black" />
                              <rect x="45" y="30" width="10" height="10" rx="1" fill="black" />
                              <rect x="45" y="45" width="10" height="10" rx="1" fill="black" />
                              <rect x="45" y="60" width="10" height="10" rx="1" fill="black" />
                              <rect x="60" y="45" width="10" height="10" rx="1" fill="black" />
                              <rect x="60" y="60" width="10" height="10" rx="1" fill="black" />
                              <rect x="60" y="75" width="10" height="10" rx="1" fill="black" />
                              <rect x="75" y="45" width="10" height="10" rx="1" fill="black" />
                              <rect x="75" y="60" width="10" height="10" rx="1" fill="black" />
                              <rect x="30" y="45" width="10" height="10" rx="1" fill="black" />
                            </svg>
                            <p className="mt-1">Scan to join</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Winners Podium Modal */}
      <WinnersPodiumModal
        isOpen={showWinnersPodium}
        onClose={() => setShowWinnersPodium(false)}
        roomName={currentRoom?.name || 'Unknown Room'}
        suggestions={currentRoom?.suggestions || []}
        voteCounts={voteCounts}
        totalVotes={totalVotes}
        userVotes={(window as any).__tabletalk_state?.userVotes || {}}
        otherUserVotes={(window as any).__tabletalk_state?.otherUserVotesData || {}}
      />
    </>
  );
};