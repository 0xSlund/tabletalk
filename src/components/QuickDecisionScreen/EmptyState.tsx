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
          {[...Array(3)].map((_, i) => {
            const sparkleTransform = `translate(-50%, -50%) rotate(${i * 120}deg) translateY(-20px)`;
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: 'rgba(184, 169, 209, 0.6)',
                  top: '20%',
                  left: '20%',
                  transform: sparkleTransform
                }}
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
              />
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-xl font-semibold" style={{ color: '#4A3B5C' }}>
          No recipes to show yet
        </h3>
        
        <p className="max-w-md mx-auto" style={{ color: '#4A4A4A' }}>
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
          className="text-white py-3 px-8 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
          style={{ 
            background: 'linear-gradient(to right, #B8A9D1, #7D6B8A)',
            boxShadow: '0 10px 15px -3px rgba(184, 169, 209, 0.3)'
          }}
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
          className="text-sm"
          style={{ color: '#4A4A4A' }}
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
            <div className="mb-2 flex justify-center" style={{ color: '#B8A9D1' }}>
              {feature.icon}
            </div>
            <h4 className="font-medium mb-1" style={{ color: '#7D6B8A' }}>
              {feature.title}
            </h4>
            <p className="text-xs" style={{ color: '#4A4A4A' }}>
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}; 