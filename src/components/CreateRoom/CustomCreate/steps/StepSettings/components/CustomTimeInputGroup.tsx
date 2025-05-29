import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../../../../lib/utils';

interface CustomTimeInputGroupProps {
  label: string;
  value: string;
  onIncrement: () => void;
  onDecrement: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  startHolding: (action: 'increment' | 'decrement' | 'increment_hours' | 'decrement_hours' | 'increment_minutes' | 'decrement_minutes') => void;
  stopHolding: () => void;
  isAtLimit?: boolean;
  typedLimitExceeded?: boolean;
  maxLength?: number;
  isHours?: boolean;
  hoursValue?: string;
  minutesValue?: string;
  isConfirmed?: boolean;
}

export const CustomTimeInputGroup: React.FC<CustomTimeInputGroupProps> = ({ 
  label, value, onIncrement, onDecrement, onChange, onBlur, 
  startHolding, stopHolding, isAtLimit, typedLimitExceeded, maxLength = 2,
  isHours = false, hoursValue = '0', minutesValue = '0', isConfirmed = false
}) => {
  
  // Only show red styling when actively hitting limits, not when at limit values
  const isShowingLimitWarning = isAtLimit || typedLimitExceeded;
  
  return (
    <div className="flex flex-col items-center space-y-2">
      {!isConfirmed && (
        <span className="text-xs font-medium text-purple-600">{label}</span>
      )}
      <div className="flex items-center space-x-2">
        {!isConfirmed && (
          <motion.button
            type="button"
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 select-none",
              "bg-purple-100 hover:bg-purple-200 text-purple-600 focus:ring-2 focus:ring-purple-400 focus:outline-none",
              "cursor-pointer z-10 relative"
            )}
            whileTap={{ scale: 0.90 }}
            onMouseDown={(e) => { 
              e.stopPropagation();
              startHolding('decrement'); 
            }}
            onMouseUp={(e) => { 
              e.stopPropagation();
              stopHolding(); 
            }}
            onMouseLeave={(e) => { 
              e.stopPropagation();
              stopHolding(); 
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              startHolding('decrement');
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              stopHolding();
            }}
            onClick={(e) => { 
              e.stopPropagation();
              console.log('Decrement button onClick fired');
              onDecrement(); 
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
          </motion.button>
        )}
        <motion.div
          className={cn(
            "text-3xl font-bold p-2 rounded-lg border text-center transition-all duration-300",
            isConfirmed ? "w-24" : "w-20",
            isShowingLimitWarning 
              ? "text-red-700 bg-red-50 border-red-300 shadow-red-200/50" 
              : "text-purple-800 bg-white border-purple-200 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-300"
          )}
          animate={
            isShowingLimitWarning 
              ? { 
                  x: [0, -8, 8, -8, 8, -4, 4, -2, 2, 0], 
                  boxShadow: [
                    "0 0 0 0 rgba(239, 68, 68, 0.4)",
                    "0 0 0 8px rgba(239, 68, 68, 0.1)",
                    "0 0 0 0 rgba(239, 68, 68, 0.4)"
                  ],
                  transition: { 
                    x: { duration: 0.6, ease: "easeInOut" },
                    boxShadow: { duration: 1.5, repeat: 2, ease: "easeInOut" }
                  } 
                } 
              : {}
          }
        >
          <input 
            type="text" 
            value={value} 
            onChange={onChange} 
            onBlur={onBlur} 
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className={cn(
              "w-full h-full bg-transparent text-center outline-none p-0 m-0 border-none",
              isShowingLimitWarning 
                ? "text-red-700 placeholder-red-400" 
                : "text-purple-800 placeholder-purple-400"
            )} 
            style={{ fontSize: 'inherit', fontWeight: 'inherit' }} 
            maxLength={maxLength}
            disabled={isConfirmed}
          />
        </motion.div>
        {!isConfirmed && (
          <motion.button
            type="button"
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 select-none",
              "bg-purple-100 hover:bg-purple-200 text-purple-600 focus:ring-2 focus:ring-purple-400 focus:outline-none",
              "cursor-pointer z-10 relative"
            )}
            whileTap={{ scale: 0.90 }}
            onMouseDown={(e) => { 
              e.stopPropagation();
              startHolding('increment'); 
            }}
            onMouseUp={(e) => { 
              e.stopPropagation();
              stopHolding(); 
            }}
            onMouseLeave={(e) => { 
              e.stopPropagation();
              stopHolding(); 
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              startHolding('increment');
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              stopHolding();
            }}
            onClick={(e) => { 
              e.stopPropagation();
              console.log('Increment button onClick fired');
              onIncrement(); 
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </motion.button>
        )}
      </div>
    </div>
  );
}; 