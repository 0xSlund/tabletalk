import React from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RemindersSectionProps } from '../types';
import { cn } from '../../../../../../lib/utils';

export const RemindersSection: React.FC<RemindersSectionProps> = ({
  reminders,
  setReminders,
  deadline,
  showHelpTooltip,
  setShowHelpTooltip
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">Automatic Reminders</span>
          <p className="text-sm text-gray-500">Send a notification before deadline</p>
        </div>
        
        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={reminders}
            onChange={() => setReminders(!reminders)}
            disabled={!deadline}
          />
          <div className={cn(
            "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600",
            !deadline && "opacity-50 cursor-not-allowed"
          )}></div>
        </label>
      </div>
      
      <AnimatePresence mode="wait">
        {reminders && deadline && (
          <motion.div 
            className="bg-emerald-50 rounded-lg border border-emerald-200 p-2.5 text-sm text-emerald-800 flex items-center gap-2 overflow-hidden"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ 
              opacity: 1, 
              height: "auto", 
              y: 0,
              transition: {
                height: { type: "spring", bounce: 0.3, duration: 0.4 },
                opacity: { duration: 0.3 },
                y: { type: "spring", stiffness: 100 }
              }
            }}
            exit={{ 
              opacity: 0, 
              height: 0, 
              y: -10,
              transition: {
                height: { duration: 0.3 },
                opacity: { duration: 0.2 }
              }
            }}
          >
            <Bell className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p>Reminders will be sent 30 minutes before the deadline</p>
          </motion.div>
        )}
        
        {!deadline && (
          <motion.p 
            className="text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            Set a deadline to enable automatic reminders
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}; 