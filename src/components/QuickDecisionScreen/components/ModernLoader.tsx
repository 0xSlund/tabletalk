import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Sparkles, Clock, Users } from 'lucide-react';

interface ModernLoaderProps {
  progress: number;
}

export default function ModernLoader({ progress }: ModernLoaderProps) {
  // Define the processing steps with their progress ranges
  const steps = [
    { range: [0, 30], text: 'Analyzing your taste preferences...', icon: Sparkles },
    { range: [30, 60], text: 'Searching through recipe database...', icon: ChefHat },
    { range: [60, 75], text: 'Filtering recipes for your dietary needs...', icon: Clock },
    { range: [75, 90], text: 'Fetching personalized recipes...', icon: Users },
    { range: [90, 95], text: 'Preparing suggestions for you...', icon: Sparkles },
    { range: [95, 100], text: 'Almost ready...', icon: Sparkles }
  ];

  // Get the current active step based on progress
  const getCurrentStep = () => {
    return steps.find(step => progress >= step.range[0] && progress < step.range[1]) || 
           (progress >= 100 ? steps[steps.length - 1] : steps[0]);
  };

  const currentStep = getCurrentStep();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8 max-w-md mx-auto"
    >
      {/* Main Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
          <span className="font-semibold">AI Chef Working</span>
        </motion.div>
        
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-gray-800"
        >
          Crafting Perfect Recipes
        </motion.h3>
      </div>

      {/* Progress Bar Section */}
      <div className="space-y-6">
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Animated shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
          
          {/* Floating progress text */}
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-white px-3 py-1 rounded-full shadow-lg border">
              <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {Math.round(progress)}%
              </span>
            </div>
          </motion.div>
        </div>

        {/* Game-style Processing Step Display */}
        <div className="text-center min-h-[80px] flex items-center justify-center">
          <motion.div
            key={currentStep.text} // This ensures re-mount when step changes
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ 
              duration: 0.5,
              ease: "easeOut"
            }}
            className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-md border border-gray-100"
          >
            {/* Animated Icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"
            >
                              <currentStep.icon className="w-4 h-4 text-purple-500" />
            </motion.div>

            {/* Processing Text with Typing Effect */}
            <motion.div className="text-left">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-medium text-gray-700"
              >
                {currentStep.text}
              </motion.p>
              
              {/* Animated dots */}
              <motion.div className="flex space-x-1 mt-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 bg-blue-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
} 