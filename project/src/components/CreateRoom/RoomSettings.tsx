import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

const timeOptions = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 'custom', label: 'Custom' },
];

interface RoomSettingsProps {
  participantLimit: number | null;
  setParticipantLimit: (limit: number | null) => void;
  timerOption: string;
  handleTimerOptionChange: (value: string) => void;
  customDuration: string;
  setCustomDuration: (duration: string) => void;
  durationUnit: 'minutes' | 'hours';
  setDurationUnit: (unit: 'minutes' | 'hours') => void;
  deadline: string;
  setDeadline: (deadline: string) => void;
  reminders: boolean;
  setReminders: (enabled: boolean) => void;
  isLoading: boolean;
}

export function RoomSettings({
  participantLimit,
  setParticipantLimit,
  timerOption,
  handleTimerOptionChange,
  customDuration,
  setCustomDuration,
  durationUnit,
  setDurationUnit,
  deadline,
  setDeadline,
  reminders,
  setReminders,
  isLoading
}: RoomSettingsProps) {
  return (
    <div className="space-y-8">
      {/* Participant Limit */}
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-4">
          Participant Limit
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setParticipantLimit(null)}
            className={cn(
              "flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors",
              !participantLimit
                ? "bg-blue-100 border-blue-300 text-blue-800"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
          >
            Open Invitation
          </button>
          <button
            type="button"
            onClick={() => setParticipantLimit(10)}
            className={cn(
              "flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors",
              participantLimit
                ? "bg-blue-100 border-blue-300 text-blue-800"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
          >
            Limited ({participantLimit || 10} people)
          </button>
        </div>
      </div>

      {/* Timer Settings */}
      <div className="space-y-4">
        <label className="block text-lg font-medium text-gray-900">
          Timer Settings
        </label>
        
        {/* Duration Options */}
        <div className="grid grid-cols-4 gap-3">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleTimerOptionChange(option.value.toString())}
              className={cn(
                "px-4 py-3 rounded-lg border text-sm font-medium transition-colors",
                timerOption === option.value.toString()
                  ? "bg-purple-100 border-purple-300 text-purple-800"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Custom Duration */}
        <AnimatePresence>
          {timerOption === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-purple-50 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <select
                    value={durationUnit}
                    onChange={(e) => {
                      setDurationUnit(e.target.value as 'minutes' | 'hours');
                      setCustomDuration(e.target.value === 'minutes' ? '30' : '12');
                    }}
                    disabled={isLoading}
                    className="px-4 py-2 border border-purple-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                  </select>
                  <span className="font-medium text-gray-900">
                    {customDuration} {durationUnit}
                  </span>
                </div>

                <div className="relative pt-1">
                  <input
                    type="range"
                    min="1"
                    max={durationUnit === 'minutes' ? '60' : '24'}
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    disabled={isLoading}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-2 px-1 text-xs text-gray-500">
                    <span>1 {durationUnit === 'minutes' ? 'min' : 'hr'}</span>
                    <span>{durationUnit === 'minutes' ? '60 min' : '24 hr'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decision Deadline */}
        <div className="flex items-center gap-4">
          <Clock className="w-5 h-5 text-gray-500" />
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Reminders */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="text-gray-900">Enable Reminders</span>
          </div>
          <button
            type="button"
            onClick={() => setReminders(!reminders)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              reminders ? 'bg-purple-500' : 'bg-gray-200'
            }`}
          >
            <span className="sr-only">Enable reminders</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                reminders ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Decision Rules */}
      <div className="space-y-4">
        <label className="block text-lg font-medium text-gray-900">
          Decision Rules
        </label>
        
        {/* Voting Style */}
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 px-4 py-3 rounded-lg border text-sm font-medium bg-blue-100 border-blue-300 text-blue-800"
          >
            Majority Vote
          </button>
          <button
            type="button"
            className="flex-1 px-4 py-3 rounded-lg border text-sm font-medium bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Ranked Choice
          </button>
        </div>

        {/* Anonymous Voting */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <span className="text-gray-900">Anonymous Voting</span>
          <button
            type="button"
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
          >
            <span className="sr-only">Enable anonymous voting</span>
            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
          </button>
        </div>

        {/* Veto Power */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <span className="text-gray-900">Veto Power</span>
          <button
            type="button"
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
          >
            <span className="sr-only">Enable veto power</span>
            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}