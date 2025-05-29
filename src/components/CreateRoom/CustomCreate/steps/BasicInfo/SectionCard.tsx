import React, { useState, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, LockIcon } from 'lucide-react';
import { FoodMode, FOOD_MODE_THEMES } from './constants';

interface SectionCardProps {
  title: string;
  icon: ReactNode;
  foodMode: FoodMode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  highlighted?: boolean;
  completed?: boolean;
  disabled?: boolean;
  onToggle?: (isOpen: boolean) => void;
  titleColor?: string;
}

export function SectionCard({ 
  title, 
  icon, 
  foodMode, 
  children, 
  defaultOpen = true,
  className = '',
  highlighted = false,
  completed = false,
  disabled = false,
  onToggle,
  titleColor
}: SectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  // Check if a food mode is actually selected by the user
  const isFoodModeSelected = (
    foodMode === 'cooking' || 
    foodMode === 'dining-out' || 
    foodMode === 'both'
  );
  
  // Use the appropriate theme - if no valid food mode is selected, use the neutral theme
  const theme = isFoodModeSelected ? FOOD_MODE_THEMES[foodMode] : FOOD_MODE_THEMES['neutral'];
  
  // Notify parent component when section is toggled
  useEffect(() => {
    if (onToggle) {
      onToggle(isOpen);
    }
  }, [isOpen, onToggle]);
  
  // When disabled status changes and the section was open, close it
  useEffect(() => {
    if (disabled && isOpen) {
      setIsOpen(false);
    }
  }, [disabled, isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };
  
  // Determine the background gradient to use for open tabs
  const getBgGradient = () => {
    // For neutral mode (What are you deciding on? tab), use a darker blue for better contrast with white text
    if (foodMode === 'neutral') {
      return 'bg-gradient-to-r from-blue-400 to-blue-500';
    }
    return `bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo}`;
  };

  // Get status badge colors and styles
  const getStatusBadgeClasses = () => {
    if (completed) {
      if (isFoodModeSelected) {
        return `bg-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'orange'}-100 text-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'orange'}-700`;
      }
      return 'bg-blue-100 text-blue-700';
    } else if (highlighted) {
      // Use mode-specific color for "Required" label
      if (isFoodModeSelected) {
        return `bg-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'orange'}-100 text-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'orange'}-700`;
      }
      return 'bg-blue-100 text-blue-700';
    } else if (disabled) {
      return 'bg-gray-100 text-gray-500';
    }
    return '';
  };
  
  // Get background gradient for completed state
  const getCompletedBgGradient = () => {
    return `bg-gradient-to-r from-${foodMode === 'neutral' ? 'blue' : foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'orange'}-50 to-${foodMode === 'neutral' ? 'blue' : foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'orange'}-100/30`;
  };
  
  // Get proper border styling based on current state
  const getBorderStyles = () => {
    if (isOpen) {
      // Use gray border for all tabs, including neutral/What are you deciding on? tab and open tabs
      return 'border-gray-200 shadow-md';
    } else if (highlighted) {
      // Use soft border for highlighted tabs
      return 'border-gray-200 shadow-sm ring-1 ring-gray-200';
    } else if (completed) {
      // Use very subtle border for completed but unopened tabs
      return 'border-gray-200 shadow-sm';
    } else if (disabled) {
      return 'border-gray-200 opacity-70';
    } else {
      // Normal unopened tabs - use gray border for all tabs
      return 'border-gray-200 shadow-sm';
    }
  };
  
  // Get hover color for unopened tabs
  const getHoverColor = () => {
    if (isOpen || disabled) return undefined;
    if (foodMode === 'neutral') return '#e6f0fe'; // blue-50
    if (foodMode === 'dining-out') return '#f5f3ff'; // violet-50
    if (foodMode === 'cooking') return '#f0fdfa'; // teal-50
    if (foodMode === 'both') return '#fff7ed'; // orange-50
    return '#e6f0fe'; // fallback to blue-50
  };
  
  return (
    <div className={`overflow-hidden rounded-xl border transition-all ${getBorderStyles()} ${className}`}>
      {/* Header */}
      <motion.button
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full flex items-center justify-between p-4 transition-colors ${
          disabled
            ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
            : isOpen 
              ? getBgGradient() + ' text-white cursor-pointer'
              : completed 
                ? getCompletedBgGradient() + ' text-gray-900 cursor-pointer'
                : 'bg-white text-gray-900 cursor-pointer hover:bg-gray-50'
        }`}
        whileHover={disabled ? {} : { 
          backgroundColor: getHoverColor()
        }}
      >
        <div className="flex items-center gap-3">
          <span className={`p-2 rounded-lg ${
            disabled
              ? 'bg-gray-100' 
              : isOpen 
                ? 'bg-white/20'
                : completed 
                  ? `bg-${foodMode === 'neutral' ? 'blue' : foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'orange'}-100`  
                  : `bg-${foodMode === 'neutral' ? 'blue' : foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : foodMode === 'both' ? 'orange' : 'orange'}-100`
          }`}>
            {disabled 
              ? <LockIcon className="w-5 h-5 text-gray-400" />
              : React.cloneElement(icon as React.ReactElement, { 
                  className: `w-5 h-5 ${
                    isOpen 
                      ? 'text-white'
                      : `text-${foodMode === 'neutral' ? 'blue' : foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : foodMode === 'both' ? 'orange' : 'orange'}-600` 
                  }` 
                })
            }
          </span>
          <h3 className={`text-lg font-semibold ${
            isOpen
              ? (titleColor ? titleColor : 'text-white')
              : 'text-gray-900' 
          }`}>{title}</h3>
          
          {/* Status indicators next to title */}
          {disabled && (
            <span className="ml-2 flex items-center text-gray-500 text-sm">
              <LockIcon className="w-4 h-4 mr-1" /> 
              Complete previous steps first
            </span>
          )}
          {completed && !isOpen && !highlighted && !disabled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                isFoodModeSelected 
                  ? `bg-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'both' ? 'orange' : 'orange'}-100 text-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'both' ? 'orange' : 'orange'}-700`
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              Completed
            </motion.div>
          )}
        </div>
        
        <div className="flex items-center">
          {/* Alert icon for required and uncompleted sections */}
          {!completed && !disabled && !isOpen && (
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={`flex items-center justify-center mr-2 ${
                foodMode === 'dining-out'
                  ? 'bg-violet-100'
                  : foodMode === 'cooking'
                    ? 'bg-teal-100'
                    : foodMode === 'both'
                      ? 'bg-orange-100'
                      : 'bg-blue-100'
              } rounded-full p-1`}
            >
              <AlertCircle className={`w-4 h-4 text-${foodMode === 'neutral' ? 'blue' : foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : foodMode === 'both' ? 'orange' : 'orange'}-600`} />
            </motion.div>
          )}
          
          {/* Completion checkmark */}
          {completed && !disabled && (
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={`flex items-center justify-center mr-2 ${
                isOpen 
                  ? 'bg-white/20'
                  : `bg-${foodMode === 'neutral' ? 'blue' : foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : foodMode === 'both' ? 'orange' : 'orange'}-100`  
              } rounded-full p-1`}
            >
              <CheckCircle className={`w-4 h-4 ${
                isOpen 
                  ? 'text-white'
                  : `text-${foodMode === 'neutral' ? 'blue' : foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : foodMode === 'both' ? 'orange' : 'orange'}-600`
              }`} />
            </motion.div>
          )}

          {/* Expand/collapse indicator */}
          {!disabled && (
            <span>
              {isOpen ? (
                <ChevronUp className={`w-5 h-5 ${isOpen ? 'text-white' : 'text-blue-600'}`} />
              ) : (
                <ChevronDown className={`w-5 h-5 text-${foodMode === 'neutral' ? 'blue' : foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : foodMode === 'both' ? 'orange' : 'orange'}-600`} />
              )}
            </span>
          )}
        </div>
      </motion.button>
      
      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && !disabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-5 bg-white">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 