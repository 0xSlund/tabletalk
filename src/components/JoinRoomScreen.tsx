import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, ArrowLeft, UserPlus, X, Loader2, Check, Clipboard, Link2, Users } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { fadeVariants } from './PageTransition';
import BackButton from './BackButton';

export function JoinRoomScreen() {
  const { setActiveTab, joinRoom } = useAppStore();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [inputType, setInputType] = useState<'code' | 'link'>('code');

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Extract code from link if it's a URL
      const code = inviteCode.includes('tabletalk.app/join/') 
        ? inviteCode.split('/').pop()?.toUpperCase()
        : inviteCode.toUpperCase();

      if (!code || code.length < 4) {
        setError('Please enter a valid room code');
        setIsLoading(false);
        return;
      }

      // Join the room
      const { joined, roomName } = await joinRoom(code);
      
      if (joined) {
        setSuccess(`Successfully joined ${roomName}!`);
        setTimeout(() => {
          handleNavigate('active-room');
         }, 1500);
      } else {
        setError('Invalid code or room not found. Please try again.');
      }
    } catch (err) {
      console.error('Error joining room:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInviteCode(text);
      
      // Auto-detect if it's a link
      if (text.includes('tabletalk.app/join/')) {
        setInputType('link');
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      setError('Unable to read from clipboard. Please paste manually.');
    }
  };

  const handleNavigate = (tab: string) => {
    setIsExiting(true);
    setTimeout(() => {
      setActiveTab(tab as any);
    }, 300);
  };

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 1 },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-[#EBF5F7] to-[#D9EDF2]"
      initial="initial"
      exit="exit"
      variants={pageVariants}
      animate={isExiting ? "exit" : "initial"}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <BackButton />
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">TableTalk</h1>
            </div>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-xl">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Join a Room</h2>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-blue-700 text-sm">
            <p>
              Join a voting room by entering the room code or paste an invite link shared by your friends.
            </p>
          </div>

          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-6">
            <button
              onClick={() => setInputType('code')}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                inputType === 'code' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Room Code
            </button>
            <button
              onClick={() => setInputType('link')}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                inputType === 'link' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Link2 className="w-4 h-4" />
              Invite Link
            </button>
          </div>

          <form onSubmit={handleJoinRoom}>
            <div className="space-y-6">
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                  {inputType === 'code' ? 'Enter Room Code' : 'Paste Invite Link'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="inviteCode"
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value);
                      setError('');
                      setSuccess('');
                      
                      // Auto-switch between input types
                      if (e.target.value.includes('tabletalk.app/join/')) {
                        setInputType('link');
                      } else if (inputType === 'link' && !e.target.value.includes('http')) {
                        setInputType('code');
                      }
                    }}
                    placeholder={inputType === 'code' 
                      ? "Enter 6-digit code (e.g., ABC123)" 
                      : "Paste link (tabletalk.app/join/...)"}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow pr-12"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Paste from clipboard"
                  >
                    <Clipboard className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {inputType === 'code' 
                    ? "Room codes are 6 characters long and case-insensitive" 
                    : "The link should start with tabletalk.app/join/"}
                </p>
              </div>

              {/* Feedback Messages */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    variants={fadeVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-100"
                  >
                    <X className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    variants={fadeVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg border border-green-100"
                  >
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <p>{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={isLoading || !inviteCode.trim()}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className={`w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ${
                  (isLoading || !inviteCode.trim()) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Join Room
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Want to start your own room instead?
            </p>
            <motion.button
              onClick={() => handleNavigate('create')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 w-full bg-white border border-blue-300 text-blue-600 py-3 rounded-xl font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Create a New Room
            </motion.button>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}