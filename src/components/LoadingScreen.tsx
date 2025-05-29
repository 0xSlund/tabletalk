import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-peach to-background-cream flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6"
      >
        <LoadingSpinner size="lg" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-clash font-medium text-text-heading"
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  );
}