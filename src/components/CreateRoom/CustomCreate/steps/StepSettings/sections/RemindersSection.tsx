import React from 'react';
import { Bell } from 'lucide-react';
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
      
      {reminders && deadline && (
        <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-2.5 text-sm text-emerald-800 flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p>Reminders will be sent 24 hours and 1 hour before the deadline</p>
        </div>
      )}
      
      {!deadline && (
        <p className="text-xs text-gray-500">Set a deadline to enable automatic reminders</p>
      )}
    </div>
  );
}; 