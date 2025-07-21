import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Heart, ThumbsUp, ThumbsDown, Compass } from 'lucide-react';
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
        <h3 className="text-2xl font-bold" style={{ color: '#4A3B5C' }}>
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
          className="text-lg font-semibold mb-4 flex items-center justify-center gap-2"
          style={{ color: '#5A9B9B' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-slate-500 bg-slate-100 rounded p-1 text-md">
            <Compass className="w-5 h-5" />
          </div>
          How it works
        </motion.h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: "1",
              icon: <Sparkles className="w-6 h-6 text-emerald-500" />,
              title: "Browse Recipes",
              description: "Swipe through personalized suggestions",
              iconColor: 'text-emerald-500',
              titleColor: 'text-emerald-600',
              iconBg: 'bg-emerald-500/30'
            },
            {
              step: "2", 
              icon: <div className="flex gap-1">
                      <ThumbsUp className="w-3 h-3 text-blue-500" />
                      <ThumbsDown className="w-3 h-3 text-blue-500" />
                    </div>,
              title: "Vote & Swipe",
              description: "Like or pass on each recipe",
              iconColor: 'text-blue-500',
              titleColor: 'text-blue-600',
              iconBg: 'bg-blue-500/30'
            },
            {
              step: "3",
              icon: <Heart className="w-6 h-6 text-pink-500" />,
              title: "Save Favorites",
              description: "Build your personal cookbook",
              iconColor: 'text-pink-500',
              titleColor: 'text-pink-600',
              iconBg: 'bg-pink-500/30'
            }
          ].map((item, index) => (
            <motion.div
              key={item.step}
              className="text-center p-4 rounded-xl shadow-sm border border-gray-200 bg-neutral-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${item.iconBg}`}>
                {item.icon}
              </div>
              <h5 className={`font-semibold mb-1 ${item.titleColor}`}>
                {item.title}
              </h5>
              <p className="text-sm text-gray-600">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

            {/* Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          onClick={handleStart}
          disabled={isStarting}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-shadow duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mx-auto hover:shadow-cyan-300/40"
          whileHover={!isStarting ? { scale: 1.05 } : {}}
          whileTap={!isStarting ? { scale: 0.95 } : {}}
        >
          {isStarting ? 'Starting...' : 'Start Smart Suggestions'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}; 