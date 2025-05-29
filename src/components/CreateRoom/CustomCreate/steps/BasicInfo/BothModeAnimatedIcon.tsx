import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Utensils } from 'lucide-react';

// Animated icon for 'both' mode
export function BothModeAnimatedIcon() {
  const [showChefHat, setShowChefHat] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setShowChefHat((prev) => !prev);
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      }, 300);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="w-6 h-6 relative flex items-center justify-center">
      <AnimatePresence mode="wait">
        {showChefHat ? (
          <motion.div
            key="chef-hat-icon"
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              duration: 0.4 
            }}
            className="text-white absolute inset-0 flex items-center justify-center"
          >
            <ChefHat className="w-5 h-5" />
          </motion.div>
        ) : (
          <motion.div
            key="utensils-icon"
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: -10 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              duration: 0.4 
            }}
            className="text-white absolute inset-0 flex items-center justify-center"
          >
            <Utensils className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Animated ring effect during transition */}
      {isAnimating && (
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-white/30"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1.3, opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  );
} 