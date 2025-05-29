import React from 'react';
import { motion } from 'framer-motion';

export const TimeDivider: React.FC = () => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center flex-shrink-0"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <motion.div 
        className="relative flex flex-col items-center justify-center h-12 w-4"
        animate={{ 
          scale: [1, 1.02, 1]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut"
        }}
      >
        {/* Top chevron pointing down */}
        <motion.div 
          className="absolute top-0"
          animate={{ 
            y: [0, 1, 0],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut"
          }}
        >
          <svg 
            width="10" 
            height="6" 
            viewBox="0 0 10 6" 
            className="text-purple-500"
          >
            <path 
              d="M1 1L5 5L9 1" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill="none"
            />
          </svg>
        </motion.div>
        
        {/* Central flowing lines */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="w-px bg-gradient-to-b from-transparent via-purple-400 to-transparent"
              style={{ height: '6px' }}
              animate={{
                opacity: [0, 1, 0],
                scaleY: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3
              }}
            />
          ))}
        </div>
        
        {/* Bottom chevron pointing down */}
        <motion.div 
          className="absolute bottom-0"
          animate={{ 
            y: [0, 1, 0],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <svg 
            width="10" 
            height="6" 
            viewBox="0 0 10 6" 
            className="text-purple-500"
          >
            <path 
              d="M1 1L5 5L9 1" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill="none"
            />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}; 