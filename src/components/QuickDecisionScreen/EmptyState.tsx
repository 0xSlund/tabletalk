import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, RefreshCw, Settings, Sparkles } from 'lucide-react';
import { EmptyStateProps } from './types';

export const EmptyState: React.FC<EmptyStateProps> = ({ onLoad }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLoad = async () => {
    setIsLoading(true);
    try {
      await onLoad();
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  return (
    <motion.div 
      className="text-center space-y-6 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Empty State Illustration */}
      <motion.div 
        className="flex justify-center mb-6"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <ChefHat className="w-12 h-12 text-gray-400" />
          </div>
          
          {/* Floating sparkles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/60 rounded-full"
              animate={{
                x: [0, 15, -15, 0],
                y: [0, -10, 10, 0],
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut"
              }}
              style={{
                top: '20%',
                left: '20%',
                transform: `translate(-50%, -50%) rotate(${i * 120}deg) translateY(-20px)`
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-xl font-semibold text-gray-800">
          No recipes to show yet
        </h3>
        
        <p className="text-gray-600 max-w-md mx-auto">
          We're ready to find amazing food suggestions for you! Click below to start discovering personalized recipes.
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Primary Load Button */}
        <motion.button
          onClick={handleLoad}
          disabled={isLoading}
          className="bg-gradient-to-r from-primary to-orange-500 text-white py-3 px-8 rounded-xl font-semibold hover:from-primary/90 hover:to-orange-500/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
          whileHover={!isLoading ? { scale: 1.05 } : {}}
          whileTap={!isLoading ? { scale: 0.95 } : {}}
        >
          <motion.div
            animate={isLoading ? { rotate: 360 } : {}}
            transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </motion.div>
          {isLoading ? 'Loading Suggestions...' : 'Find Recipes'}
        </motion.button>

        {/* Helper Text */}
        <motion.p 
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          💡 Tip: Use the filter button above to narrow down your preferences
        </motion.p>
      </motion.div>

      {/* Feature Highlights */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {[
          {
            icon: <ChefHat className="w-6 h-6" />,
            title: "Personalized",
            description: "Recipes tailored to your taste"
          },
          {
            icon: <Sparkles className="w-6 h-6" />,
            title: "Smart Suggestions",
            description: "AI-powered recipe matching"
          },
          {
            icon: <Settings className="w-6 h-6" />,
            title: "Customizable",
            description: "Filter by meal type & more"
          }
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            className="text-center p-4 bg-gray-50 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-primary mb-2 flex justify-center">
              {feature.icon}
            </div>
            <h4 className="font-medium text-gray-800 mb-1">
              {feature.title}
            </h4>
            <p className="text-xs text-gray-600">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}; 