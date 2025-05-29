import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { itemVariants } from '../types';
import { formatTimeDisplay } from '../constants';

interface TimeSliderProps {
  time: number;
  setTime: (time: number) => void;
  isCreating: boolean;
  selectedTheme: number;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({
  time,
  setTime,
  isCreating,
  selectedTheme
}) => {
  const getThemeGradient = (themeIndex: number) => {
    switch (themeIndex) {
      case 0: return 'from-orange-400 to-red-400';
      case 1: return 'from-blue-400 to-purple-400';
      case 2: return 'from-green-400 to-teal-400';
      default: return 'from-orange-400 to-red-400';
    }
  };

  const getThemeBorderColor = (themeIndex: number) => {
    switch (themeIndex) {
      case 0: return 'border-orange-500';
      case 1: return 'border-blue-500';
      case 2: return 'border-green-500';
      default: return 'border-orange-500';
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          <span className="text-lg font-bold text-gray-800">Decision Time</span>
        </div>
        <div 
          className="text-lg font-bold bg-orange-100 px-3 py-1 rounded-full text-gray-800 min-w-[5rem] text-center"
        >
          {formatTimeDisplay(time)}
        </div>
      </div>
      <div className="relative mt-3 h-8 time-slider-container">
        <div className="absolute h-3 inset-x-3 top-1/2 transform -translate-y-1/2 rounded-full overflow-hidden bg-gray-200 z-10">
          <div 
            className={`absolute h-full left-0 top-0 bg-gradient-to-r ${getThemeGradient(selectedTheme)} rounded-full`}
            style={{ width: `${(time - 5) / 55 * 100}%` }}
          ></div>
        </div>
        <input
          type="range"
          min="5"
          max="60"
          step="5"
          value={time}
          onChange={(e) => {
            const newTime = Number(e.target.value);
            setTime(newTime);
          }}
          disabled={isCreating}
          className="absolute inset-0 w-full h-full cursor-pointer"
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
            background: 'transparent',
            outline: 'none',
            opacity: 0,
            zIndex: 20
          }}
        />
        <motion.div 
          className={`absolute top-1/2 w-6 h-6 bg-white rounded-full shadow-md border-2 ${getThemeBorderColor(selectedTheme)} pointer-events-none transform -translate-y-1/2 -translate-x-1/2`}
          style={{ 
            left: `calc(${(time - 5) / 55} * (100% - 24px) + 12px)`,
            zIndex: 50
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs font-medium">
        <span className="text-gray-500">Quick (5 min)</span>
        <span className="text-orange-500">Thoughtful (60 min)</span>
      </div>
    </motion.div>
  );
}; 