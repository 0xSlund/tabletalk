import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, Users, Zap, Globe, UserPlus, MessageCircle, Clock, Loader2, Trophy, ChevronLeft, ChevronRight, User, LogOut, Settings, History, ChevronDown, Eye } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { staggerContainer, staggerItem, foodCardVariants } from './PageTransition';
import { cn } from '../lib/utils';
import { formatTimeRemaining } from '../lib/utils';

export function HomeScreen() {
  const { setActiveTab, recentRooms, fetchRecentRooms, auth, signOut, joinRoom } = useAppStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const roomsPerPage = 3;
  const [isExiting, setIsExiting] = useState(false);
  const [exitTarget, setExitTarget] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadRooms = async () => {
      if (auth.user) {
        setIsLoading(true);
        await fetchRecentRooms();
        setIsLoading(false);
      }
    };
    
    loadRooms();
  }, [auth.user, fetchRecentRooms]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const mainCards = [
    {
      icon: Users,
      title: "Create a Room",
      subtitle: "Start a new voting session with friends",
      gradient: "bg-gradient-to-br from-[#FCF0E4] to-[#FADEC8]",
      iconColor: "text-[#E76F51]",
      iconGlow: "drop-shadow-[0_1px_1px_rgba(231,111,81,0.3)]",
      iconGradient: "bg-gradient-to-b from-[#E76F51] via-[#E76F51] to-[#D05B3E]",
      iconInnerShadow: "shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]",
      iconBg: "bg-[#E76F51]/15",
      action: () => handleNavigate('create')
    },
    {
      icon: UserPlus,
      title: "Join a Room",
      subtitle: "Enter a room code to join friends",
      gradient: "bg-gradient-to-br from-[#EBF5F7] to-[#D9EDF2]",
      iconColor: "text-[#457B9D]",
      iconGlow: "drop-shadow-[0_1px_1px_rgba(69,123,157,0.3)]",
      iconGradient: "bg-gradient-to-b from-[#457B9D] via-[#457B9D] to-[#3A6A89]",
      iconInnerShadow: "shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]",
      iconBg: "bg-[#457B9D]/15",
      action: () => handleNavigate('join')
    }
  ];

  const featureCards = [
    {
      icon: Zap,
      title: "Quick Decision",
      subtitle: "Get an instant food suggestion",
      gradient: "bg-gradient-to-br from-[#FFF9E6] to-[#FFF0C9]",
      iconColor: "text-[#F3C677]",
      iconGlow: "drop-shadow-[0_1px_1px_rgba(243,198,119,0.3)]",
      iconGradient: "bg-gradient-to-b from-[#F3C677] via-[#F3C677] to-[#E5B35E]",
      iconInnerShadow: "shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]",
      iconBg: "bg-[#F3C677]/15",
      action: () => handleNavigate('quick-decision')
    },
    {
      icon: Globe,
      title: "Explore Cuisines",
      subtitle: "Browse different food categories",
      gradient: "bg-gradient-to-br from-[#EEFAF2] to-[#D8F2E3]",
      iconColor: "text-[#2A9D8F]",
      iconGlow: "drop-shadow-[0_1px_1px_rgba(42,157,143,0.3)]",
      iconGradient: "bg-gradient-to-b from-[#2A9D8F] via-[#2A9D8F] to-[#1F8A7E]",
      iconInnerShadow: "shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]",
      iconBg: "bg-[#2A9D8F]/15",
      action: () => handleNavigate('explore-cuisines')
    }
  ];

  const handleNavigate = (tab: string) => {
    setIsExiting(true);
    setExitTarget(tab);
    setTimeout(() => {
      setActiveTab(tab as any);
    }, 300);
  };

  const totalPages = Math.ceil(recentRooms.length / roomsPerPage);
  const currentRooms = recentRooms.slice(
    currentPage * roomsPerPage, 
    (currentPage + 1) * roomsPerPage
  );

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const pageVariants = {
    initial: { opacity: 1 },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const cardIconVariants = {
    initial: { scale: 1 },
    hover: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const cardTitleVariants = {
    initial: { 
      color: '#32302C'
    },
    hover: { 
      color: '#FF6F61',
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const cardSubtitleVariants = {
    initial: { 
      color: '#666666'
    },
    hover: { 
      color: '#FF6F61',
      opacity: 0.8,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const roomCardVariants = {
    initial: { 
      scale: 1,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
    },
    hover: { 
      scale: 1.05,
      y: -8,
      boxShadow: "0 14px 28px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.12)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    tap: { 
      scale: 0.98,
      boxShadow: "0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)",
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  const menuVariants = {
    hidden: { 
      opacity: 0, 
      y: -20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background-peach to-background-cream"
      initial="initial"
      exit="exit"
      variants={pageVariants}
      animate={isExiting ? "exit" : "initial"}
    >
      {/* User Profile in Top Right */}
      <div className="fixed top-4 right-4 z-50" ref={profileMenuRef}>
        <motion.button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-orange-200">
            <img 
              src={auth.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.user?.id}`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-medium text-text-primary hidden sm:inline-block">
            {auth.user?.username || 'User'}
          </span>
          <ChevronDown className={cn(
            "w-4 h-4 text-text-secondary transition-transform",
            showProfileMenu && "transform rotate-180"
          )} />
        </motion.button>

        <AnimatePresence>
          {showProfileMenu && (
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-200">
                    <img 
                      src={auth.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.user?.id}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{auth.user?.username || 'User'}</p>
                    <p className="text-xs text-text-secondary">{auth.user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="py-1">
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleNavigate('profile');
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-primary/10 transition-colors"
                >
                  <User className="w-4 h-4 text-text-secondary" />
                  <span>Profile</span>
                </button>
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleNavigate('security');
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-primary/10 transition-colors"
                >
                  <Settings className="w-4 h-4 text-text-secondary" />
                  <span>Settings</span>
                </button>
              </div>
              <div className="py-1 border-t border-gray-100">
                <button 
                  onClick={async () => {
                    setShowProfileMenu(false);
                    await signOut();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-12 pb-24 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-white p-4 rounded-full shadow-lg">
              <UtensilsCrossed className="w-12 h-12 text-primary" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-text-primary mb-4"
          >
            TableTalk
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-text-secondary max-w-2xl mx-auto"
          >
            The fun and easy way to decide where to eat with friends
          </motion.p>
        </motion.div>

        {/* Main Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12"
        >
          {mainCards.map((card) => (
            <motion.button
              key={card.title}
              variants={foodCardVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={card.action}
              className={`relative ${card.gradient} rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all text-left group overflow-hidden border border-black/[0.06]`}
            >
              <motion.div
                initial="initial"
                whileHover="hover"
                variants={cardIconVariants}
                className={cn(
                  "relative w-14 h-14 rounded-xl flex items-center justify-center mb-4 z-10",
                  card.iconBg,
                  card.iconInnerShadow
                )}
              >
                <div className={cn(
                  "absolute inset-0 rounded-xl opacity-15",
                  card.iconGradient
                )} />
                <card.icon className={cn(
                  "w-7 h-7 relative z-10",
                  card.iconColor,
                  card.iconGlow
                )} />
              </motion.div>
              <div className="relative z-10">
                <motion.h3
                  variants={cardTitleVariants}
                  initial="initial"
                  whileHover="hover"
                  className="text-2xl font-semibold mb-2 transition-all"
                >
                  {card.title}
                </motion.h3>
                <motion.p
                  variants={cardSubtitleVariants}
                  initial="initial"
                  whileHover="hover"
                  className="transition-all"
                >
                  {card.subtitle}
                </motion.p>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12"
        >
          {featureCards.map((card) => (
            <motion.button
              key={card.title}
              variants={foodCardVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={card.action}
              className={`relative ${card.gradient} rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all text-left group overflow-hidden border border-black/[0.06]`}
            >
              <motion.div
                initial="initial"
                whileHover="hover"
                variants={cardIconVariants}
                className={cn(
                  "relative w-14 h-14 rounded-xl flex items-center justify-center mb-4 z-10",
                  card.iconBg,
                  card.iconInnerShadow
                )}
              >
                <div className={cn(
                  "absolute inset-0 rounded-xl opacity-15",
                  card.iconGradient
                )} />
                <card.icon className={cn(
                  "w-7 h-7 relative z-10",
                  card.iconColor,
                  card.iconGlow,
                  card.title === "Quick Decision" && "animate-quick-decision-rotate"
                )} />
              </motion.div>
              <div className="relative z-10">
                <motion.h3
                  variants={cardTitleVariants}
                  initial="initial"
                  whileHover="hover"
                  className="text-2xl font-semibold mb-2 transition-all"
                >
                  {card.title}
                </motion.h3>
                <motion.p
                  variants={cardSubtitleVariants}
                  initial="initial"
                  whileHover="hover"
                  className="transition-all"
                >
                  {card.subtitle}
                </motion.p>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Recent Rooms Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xl font-semibold text-text-primary">Recent Rooms</h2>
            {isLoading && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading rooms...</span>
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={goToPrevPage}
                  disabled={currentPage === 0}
                  className={`p-1 rounded-full ${currentPage === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-text-secondary hover:bg-gray-100'}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-text-secondary">
                  {currentPage + 1} / {totalPages}
                </span>
                <button 
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages - 1}
                  className={`p-1 rounded-full ${currentPage >= totalPages - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-text-secondary hover:bg-gray-100'}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          
          {isLoading && recentRooms.length === 0 ? (
            <div className="bg-white rounded-xl p-8 flex justify-center items-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : recentRooms.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-text-secondary">
              No recent rooms yet—create one!
            </div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {currentRooms.map((room) => (
                <motion.div
                  key={room.id}
                  variants={roomCardVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleNavigate(room.isActive ? 'active-room' : 'result')}
                  className={`
                    rounded-xl p-4 transition-all text-left relative overflow-hidden cursor-pointer border border-black/[0.06]
                    ${room.isActive 
                      ? 'bg-gradient-to-br from-primary/10 to-primary/5' 
                      : 'bg-white'
                    }
                  `}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-text-primary">{room.name}</h3>
                      {room.isActive ? (
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 15, -15, 0]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="relative"
                        >
                          <MessageCircle className="w-5 h-5 text-primary transition-colors" />
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                        </motion.div>
                      ) : (
                        <Trophy className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <p className="text-sm text-text-secondary mb-1">
                        {room.participants} participants
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-1">
                      <p className="text-sm">
                        {room.isActive ? (
                          <>
                            <span className="text-primary font-medium">Voting Now</span>
                            {room.expiresAt && (
                              <span className="text-text-secondary"> • {formatTimeRemaining(room.expiresAt)}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-text-secondary">Voting ended</span>
                        )}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        {room.isActive ? (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate('active-room');
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1 text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Join Room</span>
                          </motion.button>
                        ) : room.winningChoice ? (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate('result');
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium"
                          >
                            <Trophy className="w-3.5 h-3.5" />
                            <span>View Results</span>
                          </motion.button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity`} />
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-2 h-2 rounded-full ${
                    currentPage === i ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}