import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, ArrowLeft, UserPlus, X, Loader2, Check } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { fadeVariants } from './PageTransition';

export function JoinRoomScreen() {
  const { setActiveTab, joinRoom } = useAppStore();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

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
      const joined = await joinRoom(code);
      
      if (joined) {
        const { currentRoom } = useAppStore.getState();
        setSuccess(`Successfully joined ${currentRoom.name}!`);
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
      className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50"
      initial="initial"
      exit="exit"
      variants={pageVariants}
      animate={isExiting ? "exit" : "initial"}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-orange-500" />
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
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-xl">
              <UserPlus className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Join a Room</h2>
          </div>

          <form onSubmit={handleJoinRoom}>
            <div className="space-y-6">
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Code or Invite Link
                </label>
                <input
                  type="text"
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  placeholder="Enter code (e.g., XYZ123) or paste invite link"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Feedback Messages */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    variants={fadeVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                    <p>{error}</p>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    variants={fadeVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg"
                  >
                    <Check className="w-5 h-5" />
                    <p>{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={isLoading || !inviteCode.trim()}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className={`w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 ${
                  (isLoading || !inviteCode.trim()) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Room'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </main>
    </motion.div>
  );
}