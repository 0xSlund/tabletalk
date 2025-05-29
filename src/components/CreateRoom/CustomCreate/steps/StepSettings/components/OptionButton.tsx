import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../../../../lib/utils';
import { OptionButtonProps } from '../types';

export const OptionButton: React.FC<OptionButtonProps> = ({ 
  isActive, 
  icon, 
  activeIconColor, 
  title, 
  description, 
  onClick,
  gradientFrom,
  gradientTo,
  borderColor
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    type="button"
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
      isActive
        ? `bg-gradient-to-b from-${gradientFrom} to-${gradientTo} border-${borderColor} text-${activeIconColor} shadow-sm`
        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
    )}
  >
    {React.cloneElement(icon as React.ReactElement, { 
      className: cn(
        "w-7 h-7 mb-2",
        isActive ? `text-${activeIconColor}` : "text-gray-400"
      )
    })}
    <span className="font-medium text-base">{title}</span>
    <span className="text-sm text-gray-500 mt-1">{description}</span>
  </motion.button>
); 