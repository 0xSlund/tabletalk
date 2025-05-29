import React from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      {/* Plate */}
      <motion.div
        className="absolute inset-0 bg-white rounded-full shadow-lg"
        animate={{
          scale: [0.95, 1, 0.95],
          rotate: [0, 360]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Utensils */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-primary"
        animate={{
          rotate: [0, 360]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <UtensilsCrossed className={sizes[size]} />
      </motion.div>
      
      {/* Decorative ring */}
      <motion.div
        className="absolute inset-2 border-4 border-primary/20 rounded-full"
        animate={{
          scale: [1, 0.9, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}