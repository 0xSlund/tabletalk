import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Home, UserPlus, ArrowRight, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../lib/store';

interface NoVotesExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  suggestions: Array<{
    id: string;
    name: string;
    emoji?: string;
    description?: string;
  }>;
}

export const NoVotesExpiredModal: React.FC<NoVotesExpiredModalProps> = ({
  isOpen,
  onClose,
  roomName,
  suggestions
}) => {
  const navigate = useNavigate();
  const { setActiveTab } = useAppStore();

  const handleGoToMainMenu = () => {
    onClose();
    setActiveTab('home');
    navigate('/');
  };

  const handleJoinAnotherRoom = () => {
    onClose();
    setActiveTab('join');
    navigate('/join');
  };

  const handleCreateNewRoom = () => {
    onClose();
    setActiveTab('create');
    navigate('/create');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 text-center border-b border-red-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-red-500" />
              </div>
            </motion.div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Room Expired</h3>
            <p className="text-sm text-gray-600">
              "{roomName}" ended without any votes being cast
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-4">
                <XCircle className="w-4 h-4" />
                <span>No votes were recorded</span>
              </div>
              
              <p className="text-gray-600 mb-4">
                Time ran out before anyone could cast their votes. Better luck next time!
              </p>

              {/* Show available options that were missed */}
              {suggestions.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Options that were available:
                  </h4>
                  <div className="space-y-2">
                    {suggestions.slice(0, 3).map((suggestion) => (
                      <div 
                        key={suggestion.id}
                        className="flex items-center gap-3 text-left"
                      >
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200">
                          <span className="text-sm">{suggestion.emoji || '🍽️'}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{suggestion.name}</p>
                        </div>
                      </div>
                    ))}
                    {suggestions.length > 3 && (
                      <p className="text-xs text-gray-500 text-center mt-2">
                        +{suggestions.length - 3} more options
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <motion.button
                onClick={handleJoinAnotherRoom}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <UserPlus className="w-5 h-5" />
                <span className="font-medium">Join Another Room</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                onClick={handleCreateNewRoom}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Create New Room</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                onClick={handleGoToMainMenu}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Back to Main Menu</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 