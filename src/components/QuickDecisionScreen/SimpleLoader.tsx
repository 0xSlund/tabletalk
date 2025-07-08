import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

interface SimpleLoaderProps {
  progress: number;
}

export default function SimpleLoader({ progress }: SimpleLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-16 space-y-8"
    >
      {/* Animated Robot Icon */}
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg"
      >
        <Bot className="h-12 w-12 text-white" />
      </motion.div>

      {/* Loading Text with Typing Animation */}
      <div className="text-center space-y-3">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold text-gray-800"
        >
          Finding Perfect Recipes
        </motion.h3>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600"
        >
          Analyzing your preferences...
        </motion.p>
      </div>

      {/* Smooth Progress Bar */}
      <div className="w-full max-w-md space-y-3">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ 
              duration: 0.6,
              ease: "easeOut"
            }}
          />
        </div>
        
        {/* Progress Percentage */}
        <motion.div
          className="text-center"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progress)}%
          </span>
        </motion.div>
      </div>

      {/* Animated Dots */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-blue-500 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </motion.div>
  );
} 