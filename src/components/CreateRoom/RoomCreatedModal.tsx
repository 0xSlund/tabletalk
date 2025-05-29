import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, X, Home, ArrowRight } from 'lucide-react';
import { popVariants } from '../PageTransition';
import { Link } from 'react-router-dom';

interface RoomCreatedModalProps {
  roomName: string;
  roomCode: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToRoom: () => void;
  autoNavigateDelay?: number;
  theme?: number; // Add theme parameter (0: Food Fiesta, 1: Cozy Gathering, 2: Surprise Me)
}

const RoomCreatedModal: React.FC<RoomCreatedModalProps> = ({
  roomName,
  roomCode,
  isOpen,
  onClose,
  onNavigateToRoom,
  autoNavigateDelay,
  theme = 0, // Default to Food Fiesta theme
}) => {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(autoNavigateDelay ? Math.floor(autoNavigateDelay / 1000) : 0);
  const roomUrl = `/active-room`;
  
  // Cozy Gathering star elements
  const [cozyElements, setCozyElements] = useState<Array<{ id: number; top: number; left: number; size: number; delay: number; rotation: number }>>([]);
  
  // Surprise Me food elements
  const [surpriseElements, setSurpriseElements] = useState<Array<{ id: number; top: number; left: number; size: number; delay: number; type: string }>>([]);
  
  // Generate theme elements
  useEffect(() => {
    if (!isOpen) return;
    
    // For Cozy Gathering (theme 1) - create stars/snowflakes around the modal
    if (theme === 1) {
      const elements = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        top: Math.random() * 110 - 5, // Position focused more around the modal
        left: Math.random() * 110 - 5,
        size: Math.random() * 35 + 15, // Size between 15-50px
        delay: Math.random() * 3, // More varied animation delay
        rotation: Math.random() * 360 // Initial rotation
      }));
      setCozyElements(elements);
    } else {
      setCozyElements([]);
    }
    
    // For Surprise Me (theme 2) - create food elements around the modal
    if (theme === 2) {
      // More varied food emojis
      const foodTypes = ['🍕', '🍔', '🍦', '🥗', '🍱', '🍣', '🥪', '🍜', '🍩', '🍓', '🍎', '🥞', '🍲', '🌮', '🥪', '🍰'];
      const elements = Array.from({ length: 18 }, (_, i) => ({
        id: i,
        top: Math.random() * 110 - 5, // Position focused more around the modal
        left: Math.random() * 110 - 5,
        size: Math.random() * 30 + 15, // Size between 15-45px
        delay: Math.random() * 4, // More varied animation delay
        type: foodTypes[Math.floor(Math.random() * foodTypes.length)]
      }));
      setSurpriseElements(elements);
    } else {
      setSurpriseElements([]);
    }
  }, [isOpen, theme]);
  
  // Get theme-based colors
  const getHeaderBgColor = () => {
    switch (theme) {
      case 1: return 'bg-blue-500'; // Cozy Gathering
      case 2: return 'bg-green-500'; // Surprise Me
      default: return 'bg-orange-500'; // Food Fiesta
    }
  };
  
  const getHeaderTextColor = () => {
    switch (theme) {
      case 1: return 'text-blue-100'; // Cozy Gathering
      case 2: return 'text-green-100'; // Surprise Me
      default: return 'text-orange-100'; // Food Fiesta
    }
  };
  
  const getIconColor = () => {
    switch (theme) {
      case 1: return 'text-blue-500'; // Cozy Gathering
      case 2: return 'text-green-500'; // Surprise Me
      default: return 'text-orange-500'; // Food Fiesta
    }
  };
  
  const getButtonGradient = () => {
    switch (theme) {
      case 1: return 'from-blue-500 to-purple-500'; // Cozy Gathering
      case 2: return 'from-green-500 to-teal-500'; // Surprise Me
      default: return 'from-orange-500 to-red-500'; // Food Fiesta
    }
  };
  
  const getCountdownTextColor = () => {
    switch (theme) {
      case 1: return 'text-blue-500'; // Cozy Gathering
      case 2: return 'text-green-500'; // Surprise Me
      default: return 'text-orange-500'; // Food Fiesta
    }
  };
  
  const getCopyButtonBg = () => {
    switch (theme) {
      case 1: return 'bg-blue-500'; // Cozy Gathering
      case 2: return 'bg-green-500'; // Surprise Me
      default: return 'bg-orange-500'; // Food Fiesta
    }
  };
  
  // Get theme-based glow effect for the modal
  const getModalGlow = () => {
    switch (theme) {
      case 1: return 'shadow-[0_0_30px_rgba(59,130,246,0.3)]'; // Blue glow for Cozy Gathering
      case 2: return 'shadow-[0_0_30px_rgba(16,185,129,0.3)]'; // Green glow for Surprise Me
      default: return 'shadow-[0_0_30px_rgba(249,115,22,0.3)]'; // Orange glow for Food Fiesta
    }
  };
  
  // Auto-navigation countdown if autoNavigateDelay is set
  useEffect(() => {
    if (!isOpen || !autoNavigateDelay) return;
    
    setCountdown(Math.floor(autoNavigateDelay / 1000));
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (roomCode) {
            console.log(`Auto-navigating to room ${roomCode}`);
            onNavigateToRoom();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen, autoNavigateDelay, onNavigateToRoom, roomCode]);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://tabletalk.app/join/${roomCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Theme-specific decorative elements
  const renderThemeDecorations = () => {
    switch (theme) {
      case 1: // Cozy Gathering
        return (
          <>
            <motion.div 
              className="absolute -top-8 -right-5 w-24 h-24 text-blue-300 opacity-50 z-0"
              animate={{ 
                rotate: [0, 10, 0, -10, 0],
                scale: [1, 1.05, 1, 0.95, 1]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path d="M50 0 L52 48 L100 50 L52 52 L50 100 L48 52 L0 50 L48 48 Z" />
              </svg>
            </motion.div>
            <motion.div 
              className="absolute -bottom-5 -left-5 w-16 h-16 text-purple-300 opacity-50 z-0"
              animate={{ 
                rotate: [0, -10, 0, 10, 0],
                scale: [1, 0.95, 1, 1.05, 1]
              }}
              transition={{ 
                duration: 7, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path d="M50 0 L65 35 L100 50 L65 65 L50 100 L35 65 L0 50 L35 35 Z" />
              </svg>
            </motion.div>
          </>
        );
      case 2: // Surprise Me
        return (
          <>
            <motion.div 
              className="absolute top-10 -right-8 w-20 h-20 text-green-400 opacity-40 z-0"
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 30, 0]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <circle cx="50" cy="38" r="38" />
                <rect x="44" y="70" width="12" height="30" />
              </svg>
            </motion.div>
            <motion.div 
              className="absolute -bottom-8 -left-5 w-16 h-16 text-teal-400 opacity-40 z-0"
              animate={{ 
                y: [0, 15, 0],
                rotate: [0, -20, 0]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <circle cx="50" cy="62" r="38" />
                <rect x="44" y="0" width="12" height="30" />
              </svg>
            </motion.div>
          </>
        );
      default: // Food Fiesta
        return (
          <>
            <motion.div 
              className="absolute -top-5 -right-5 w-24 h-24 text-orange-300 opacity-40 z-0"
              animate={{ 
                rotate: 360
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity,
                ease: "linear" 
              }}
            >
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <circle cx="50" cy="50" r="50" />
              </svg>
            </motion.div>
            <motion.div 
              className="absolute -bottom-5 -left-5 w-16 h-16 text-red-300 opacity-40 z-0"
              animate={{ 
                rotate: -360
              }}
              transition={{ 
                duration: 15, 
                repeat: Infinity,
                ease: "linear" 
              }}
            >
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <circle cx="50" cy="50" r="50" />
              </svg>
            </motion.div>
          </>
        );
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm ${
          theme === 0 
            ? 'bg-orange-950/30' 
            : theme === 1 
              ? 'bg-blue-950/30' 
              : 'bg-green-950/30'
        }`}
      >
        {/* Theme-specific backdrop effect */}
        <div className="absolute inset-0 pointer-events-none">
          {theme === 1 && (
            <motion.div 
              className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.5, 0.8, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          )}
          {theme === 2 && (
            <motion.div 
              className="absolute inset-0 bg-gradient-radial from-green-500/5 via-transparent to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0.4, 0.7, 0] }}
              transition={{ duration: 7, repeat: Infinity }}
            />
          )}
        </div>
        
        {/* Cozy Gathering Theme Elements */}
        {theme === 1 && cozyElements.map(element => (
          <motion.div
            key={`cozy-${element.id}`}
            className="absolute pointer-events-none"
            style={{ 
              top: `${element.top}%`, 
              left: `${element.left}%`,
              width: element.size,
              height: element.size
            }}
            initial={{ 
              opacity: 0, 
              rotate: element.rotation,
              scale: 0,
              filter: 'blur(2px)'
            }}
            animate={{ 
              opacity: [0, 0.7, 0.9, 0.7, 0],
              rotate: element.rotation + 360,
              scale: [0, 1, 1.2, 1, 0],
              filter: ['blur(3px)', 'blur(0px)', 'blur(0px)', 'blur(1px)', 'blur(3px)']
            }}
            transition={{
              duration: 8,
              delay: element.delay,
              repeat: Infinity,
              repeatDelay: Math.random() * 2,
              ease: "easeInOut"
            }}
          >
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-full h-full text-blue-300 drop-shadow-lg">
              <path d="M50 0 L60 35 L95 50 L60 65 L50 100 L40 65 L5 50 L40 35 Z" />
            </svg>
          </motion.div>
        ))}
        
        {/* Surprise Me Theme Elements */}
        {theme === 2 && surpriseElements.map(element => (
          <motion.div
            key={`surprise-${element.id}`}
            className="absolute pointer-events-none flex items-center justify-center text-4xl"
            style={{ 
              top: `${element.top}%`, 
              left: `${element.left}%`,
              fontSize: element.size
            }}
            initial={{ 
              opacity: 0,
              scale: 0,
              rotate: -30,
              filter: 'blur(2px)'
            }}
            animate={{ 
              opacity: [0, 1, 1, 0.5, 0],
              scale: [0, 1.2, 1, 1.1, 0],
              rotate: [-30, 15, 0, -15, -30],
              y: [20, -20, -40, -30, 20],
              x: [0, 10, 0, -10, 0],
              filter: ['blur(2px)', 'blur(0px)', 'blur(0px)', 'blur(1px)', 'blur(2px)']
            }}
            transition={{
              duration: 6,
              delay: element.delay,
              repeat: Infinity,
              repeatDelay: Math.random() * 3,
              ease: "easeInOut"
            }}
          >
            {element.type}
          </motion.div>
        ))}
        
        <motion.div
          variants={popVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`bg-white rounded-2xl p-6 max-w-md w-full relative overflow-hidden ${getModalGlow()}`}
        >
          {/* Theme-specific decorative elements */}
          {renderThemeDecorations()}
          
          {/* Success Header */}
          <div className={`${getHeaderBgColor()} text-white -mt-6 -mx-6 px-6 py-4 rounded-t-2xl mb-6 relative z-10`}>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Room Created!</h2>
                <p className={`${getHeaderTextColor()}`}>"{roomName}" is ready for your friends to join</p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Share2 className={`w-5 h-5 ${getIconColor()}`} />
                <h3 className="text-xl font-semibold">Share Room</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600">
              Share this link with your friends to invite them to the room:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={`https://tabletalk.app/join/${roomCode}`}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-50 rounded-lg text-gray-800 font-mono text-sm"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyLink}
                className={`flex items-center gap-2 px-4 py-2 ${getCopyButtonBg()} text-white rounded-lg font-medium`}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </motion.button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                Room Code: <span className="font-mono font-bold">{roomCode}</span>
              </p>
              {countdown > 0 && (
                <p className={`text-xs ${getCountdownTextColor()}`}>
                  Auto-continuing to room in {countdown} seconds...
                </p>
              )}
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Back to Main Menu
              </button>
              <Link
                to="/active-room"
                onClick={(e) => {
                  e.preventDefault();
                  console.log(`Manually navigating to room ${roomCode}`);
                  onNavigateToRoom();
                }}
                className={`flex-1 py-2 bg-gradient-to-r ${getButtonGradient()} text-white rounded-lg font-medium hover:shadow-md transition-all flex items-center justify-center gap-2`}
              >
                <ArrowRight className="w-4 h-4" />
                Continue to Room
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoomCreatedModal; 