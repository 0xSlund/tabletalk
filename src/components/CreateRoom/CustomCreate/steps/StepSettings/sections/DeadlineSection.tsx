import React from 'react';
import { CalendarClock, AlertTriangle } from 'lucide-react';
import { DeadlineSectionProps } from '../types';

export const DeadlineSection: React.FC<DeadlineSectionProps> = ({
  deadline,
  setDeadline,
  minDate,
  showHelpTooltip,
  setShowHelpTooltip
}) => {
  // Quick selection options
  const handleTonight = () => {
    const tonight = new Date();
    tonight.setHours(21, 0, 0, 0); // Set to 9:00 PM
    setDeadline(tonight.toISOString().slice(0, 16));
  };

  const handleTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0); // Set to 7:00 PM
    setDeadline(tomorrow.toISOString().slice(0, 16));
  };

  const handleWeekend = () => {
    const today = new Date();
    const daysUntilSaturday = 6 - today.getDay(); // Calculate days until Saturday
    const weekend = new Date();
    weekend.setDate(today.getDate() + daysUntilSaturday);
    weekend.setHours(12, 0, 0, 0); // Set to 12:00 PM
    setDeadline(weekend.toISOString().slice(0, 16));
  };

  return (
    <div className="space-y-4">
      <label className="text-base font-medium text-gray-700 block">Set Deadline</label>
      
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleTonight}
          className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
        >
          Tonight
        </button>
        <button
          type="button"
          onClick={handleTomorrow}
          className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
        >
          Tomorrow
        </button>
        <button
          type="button"
          onClick={handleWeekend}
          className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
        >
          This Weekend
        </button>
        <button
          type="button"
          className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-1"
          onClick={() => document.getElementById('deadline-picker')?.click()}
        >
          <CalendarClock className="w-4 h-4 text-gray-500" />
          Pick Date
        </button>
      </div>

      <div className="hidden">
            <input
              type="datetime-local"
          id="deadline-picker"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={minDate}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-rose-500 focus:border-rose-500"
              aria-label="Select a deadline date and time"
            />
          </div>
      
      {deadline ? (
        <div className="text-sm text-gray-700">
          Decision deadline set for: <span className="font-medium">{new Date(deadline).toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-500" role="alert">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span className="text-sm">No deadline set yet</span>
          </div>
        )}
      </div>
  );
}; 