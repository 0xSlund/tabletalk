import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../../../../lib/utils';

interface UnitSelectorProps {
  tempUnit: 'minutes' | 'hours';
  handleUnitChange: (unit: 'minutes' | 'hours') => void;
  isConfirmed: boolean;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({ 
  tempUnit, 
  handleUnitChange, 
  isConfirmed 
}) => {
  if (isConfirmed) return null;

  return (
    <div className="relative bg-purple-100 rounded-xl p-1 flex w-full max-w-xs shadow mx-auto overflow-hidden">
      <motion.div 
        className="absolute inset-y-1 bg-white rounded-lg shadow-md"
        style={{
          left: '4px',
          width: 'calc(50% - 8px)',
        }}
        animate={{ 
          x: tempUnit === 'minutes' ? 0 : 'calc(100% + 8px)' 
        }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
      />
      <button 
        type="button" 
        className={cn(
          "flex-1 py-2.5 px-2 text-sm font-semibold rounded-lg transition-colors duration-300 relative z-10 cursor-pointer text-center min-w-0",
          tempUnit === 'minutes' ? "text-purple-700" : "text-purple-500 hover:text-purple-600"
        )}
        onClick={(e) => { 
          e.stopPropagation(); 
          console.log('Minutes button clicked');
          handleUnitChange('minutes'); 
        }}
      >
        <span className="block truncate">Minutes</span>
      </button>
      <button 
        type="button" 
        className={cn(
          "flex-1 py-2.5 px-2 text-sm font-semibold rounded-lg transition-colors duration-300 relative z-10 cursor-pointer text-center min-w-0",
          tempUnit === 'hours' ? "text-purple-700" : "text-purple-500 hover:text-purple-600"
        )}
        onClick={(e) => { 
          e.stopPropagation(); 
          console.log('Hours button clicked');
          handleUnitChange('hours'); 
        }}
      >
        <span className="block truncate">Hours</span>
      </button>
    </div>
  );
}; 