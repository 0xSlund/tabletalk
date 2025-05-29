import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LimitMessageProps {
  isAtLimit: boolean;
  typedLimitExceeded: boolean;
  isConfirmed: boolean;
  tempUnit: 'minutes' | 'hours';
  isHolding: string | null;
  tempHours: string;
  tempMinutes: string;
}

export const LimitMessage: React.FC<LimitMessageProps> = ({
  isAtLimit,
  typedLimitExceeded,
  isConfirmed,
  tempUnit,
  isHolding,
  tempHours,
  tempMinutes
}) => {
  const getMessage = () => {
    if (tempUnit === 'minutes' && (isAtLimit || typedLimitExceeded)) {
      return 'Maximum 59 minutes';
    }
    
    if (tempUnit === 'hours' && (isAtLimit || typedLimitExceeded)) {
      if (isHolding === 'increment_hours' && parseInt(tempHours) >= 24) {
        return 'Maximum 24 hours';
      }
      if (isHolding === 'increment_minutes' && parseInt(tempHours) >= 24) {
        return 'Cannot add minutes at 24 hours';
      }
      if (isHolding === 'increment_minutes' && parseInt(tempMinutes) >= 59 && parseInt(tempHours) < 24) {
        return 'Maximum 59 minutes';
      }
      if (isHolding === 'decrement_hours' && parseInt(tempHours) <= 0 && parseInt(tempMinutes) <= 1) {
        return 'Minimum 1 minute';
      }
      if (isHolding === 'decrement_minutes' && parseInt(tempHours) <= 0 && parseInt(tempMinutes) <= 1) {
        return 'Minimum 1 minute';
      }
      if (parseInt(tempHours) >= 24) {
        return 'Maximum 24 hours';
      }
      if (parseInt(tempMinutes) >= 59) {
        return 'Maximum 59 minutes';
      }
      return 'Maximum limit reached';
    }
    
    return '';
  };

  return (
    <AnimatePresence>
      {(isAtLimit || typedLimitExceeded) && !isConfirmed && (
        <motion.div 
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 z-50 bg-red-500 text-white text-xs font-semibold whitespace-nowrap px-3 py-1.5 rounded-md shadow-lg"
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: "backOut" } }}
          exit={{ opacity: 0, y: -8, scale: 0.95, transition: { duration: 0.2 } }}
        >
          {getMessage()}
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-1.5 w-3 h-3 bg-red-500 rotate-45"/>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 