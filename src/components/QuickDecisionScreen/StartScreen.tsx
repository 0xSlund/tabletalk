import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Heart, ThumbsUp, ThumbsDown, Zap } from 'lucide-react';
import { StartScreenProps } from './types';

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [isStarting, setIsStarting] = React.useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await onStart();
    } finally {
      setTimeout(() => setIsStarting(false), 1000);
    }
  };

  return (
    <motion.div 
      className="text-center space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Welcome Section */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-gray-800">
          Ready to discover amazing food?
        </h3>
      </motion.div>

      {/* How it works section */}
      <motion.div 
        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 max-w-2xl mx-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      >
        <motion.h4 
          className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Zap className="w-5 h-5 text-primary" />
          How it works
        </motion.h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: "1",
              icon: <Sparkles className="w-6 h-6 text-primary" />,
              title: "Browse Recipes",
              description: "Swipe through personalized suggestions"
            },
            {
              step: "2", 
              icon: <div className="flex gap-1">
                      <ThumbsUp className="w-3 h-3 text-green-500" />
                      <ThumbsDown className="w-3 h-3 text-red-500" />
                    </div>,
              title: "Vote & Swipe",
              description: "Like or pass on each recipe"
            },
            {
              step: "3",
              icon: <Heart className="w-6 h-6 text-pink-500" />,
              title: "Save Favorites",
              description: "Build your personal cookbook"
            }
          ].map((item, index) => (
            <motion.div
              key={item.step}
              className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                {item.icon}
              </div>
              <h5 className="font-semibold text-gray-800 mb-1">
                {item.title}
              </h5>
              <p className="text-sm text-gray-600">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Start Button - Now positioned before Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          onClick={handleStart}
          disabled={isStarting}
          className="bg-gradient-to-r from-primary to-orange-500 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-primary/90 hover:to-orange-500/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
          whileHover={!isStarting ? { scale: 1.05 } : {}}
          whileTap={!isStarting ? { scale: 0.95 } : {}}
        >
          <motion.div
            animate={isStarting ? { rotate: 360 } : {}}
            transition={isStarting ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
          >
            <Play className="w-6 h-6" />
          </motion.div>
          {isStarting ? 'Starting...' : 'Start Smart Suggestions'}
        </motion.button>
      </motion.div>

      {/* Interaction Tips - Now positioned after Start Button */}
      <motion.div 
        className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h5 className="font-semibold text-blue-800 mb-2">
          💡 Quick Tip
        </h5>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>Swipe right</strong> or <strong>double-tap</strong> to like</p>
          <p>• <strong>Swipe left</strong> to pass</p>
          <p>• Use the ❤️ button to save to favorites</p>
        </div>
      </motion.div>
    </motion.div>
  );
}; 