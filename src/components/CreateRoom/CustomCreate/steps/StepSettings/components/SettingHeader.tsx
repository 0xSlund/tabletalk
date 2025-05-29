import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { SettingHeaderProps } from '../types';

export const SettingHeader: React.FC<SettingHeaderProps> = ({
  icon,
  iconBgClass,
  iconColor,
  label,
  tooltipId,
  tooltipContent,
  onTooltipHover,
  activeTooltip
}) => (
  <div className="flex items-center justify-between">
    <label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <span className={`${iconBgClass} p-2 rounded-lg`}>
        {icon}
      </span>
      {label}
    </label>
    <button
      type="button"
      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
      onMouseEnter={() => onTooltipHover(tooltipId)}
      onMouseLeave={() => onTooltipHover(null)}
      aria-label={`Help info for ${label}`}
    >
      <HelpCircle className="w-5 h-5" />
      
      {/* Help tooltip */}
      <AnimatePresence>
        {activeTooltip === tooltipId && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-10 bg-gray-900 text-white text-sm rounded-lg py-2 px-4 max-w-xs right-0 mt-2 shadow-lg"
            role="tooltip"
          >
            {tooltipContent}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  </div>
); 