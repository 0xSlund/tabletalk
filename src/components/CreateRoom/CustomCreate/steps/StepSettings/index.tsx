import React, { useState, useEffect } from 'react';
import { Users, CalendarClock, Clock, BellRing, Info, AlertCircle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepSettingsProps } from './types';
import {
  ParticipantLimitSection,
  TimerSettingsSection,
  DeadlineSection,
  RemindersSection
} from './sections';

export function StepSettings({
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
  isLoading,
  accessControl,
  setAccessControl,
  selectedMeals,
  setSelectedMeals,
  onSectionsCompletionChange
}: StepSettingsProps) {
  const [showHelpTooltip, setShowHelpTooltip] = useState<'participants' | 'timer' | 'deadline' | 'reminders' | null>(null);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  
  // Track completion status for each section
  const [completedSections, setCompletedSections] = useState({
    participantAccess: false,
    decisionTimer: false,
    deadlineNotifications: false
  });
  
  // Local access control state if not provided by parent
  const [localAccessControl, setLocalAccessControl] = useState<boolean | null>(null);
  
  // Use provided access control or local state
  const currentAccessControl = accessControl !== undefined ? accessControl : localAccessControl;
  const setCurrentAccessControl = setAccessControl || setLocalAccessControl;
  
  // Initialize minimum date for deadline (now + 10 minutes)
  const [minDate, setMinDate] = useState<string>("");
  
  useEffect(() => {
    // Set min date to current time + 10 minutes
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    setMinDate(`${year}-${month}-${day}T${hours}:${mins}`);
  }, []);

  // Update completion status when participant limit or access control changes
  useEffect(() => {
    // Require both participant limit > 0 AND access control to be selected
    const isParticipantAccessComplete = 
      participantLimit !== null && 
      participantLimit > 0 && 
      currentAccessControl !== null;
    setCompletedSections(prev => ({
      ...prev,
      participantAccess: isParticipantAccessComplete
    }));
  }, [participantLimit, currentAccessControl]);

  // Update completion status when timer settings change
  useEffect(() => {
    const isTimerComplete = Boolean(timerOption !== '' && (
      timerOption !== 'custom' || 
      (customDuration && parseInt(customDuration) > 0)
    ));
    setCompletedSections(prev => ({
      ...prev,
      decisionTimer: isTimerComplete
    }));
  }, [timerOption, customDuration]);

  // Update completion status when deadline/reminders change
  useEffect(() => {
    // Consider this section complete when:
    // - A deadline is set (regardless of reminders setting), OR  
    // - No deadline is set AND reminders are explicitly disabled
    const isDeadlineComplete = deadline !== '' || (deadline === '' && reminders === false);
    setCompletedSections(prev => ({
      ...prev,
      deadlineNotifications: isDeadlineComplete
    }));
  }, [deadline, reminders]);

  // Notify parent component when completion status changes
  useEffect(() => {
    if (onSectionsCompletionChange) {
      onSectionsCompletionChange(completedSections);
    }
  }, [completedSections, onSectionsCompletionChange]);

  // Format deadline for display if it exists
  const formattedDeadline = deadline ? new Date(deadline).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }) : 'No deadline set';

  // Calculate timer display text
  const getTimerText = () => {
    if (timerOption === 'custom') {
      return `${customDuration} ${durationUnit} per decision`;
    } 
    return `${timerOption === '60' ? '1 hour' : `${timerOption} min`} per decision`;
  };

  return (
    <div className="max-w-5xl mx-auto relative">
        <div className="space-y-6">
        {/* Participant Access & Limits Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Participant Access & Limits
            </h2>
              
              {/* Status indicator */}
              <div className="flex items-center">
                {completedSections.participantAccess ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center bg-green-100 rounded-full p-1"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center bg-orange-100 rounded-full p-1"
                  >
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  </motion.div>
                )}
                
                {/* Status badge */}
                {completedSections.participantAccess && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700"
                  >
                    Completed
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          <div className="p-5">
          <ParticipantLimitSection
            participantLimit={participantLimit}
            setParticipantLimit={setParticipantLimit}
            showHelpTooltip={showHelpTooltip}
            setShowHelpTooltip={setShowHelpTooltip}
            accessControl={currentAccessControl}
            setAccessControl={setCurrentAccessControl}
          />
          
          {/* Help Button - Inside the card at bottom */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <motion.button 
              onClick={() => setShowHelpMenu(true)}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors hover:bg-gray-50 px-3 py-2 rounded-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-1 rounded-full bg-gray-100">
                <Info className="w-4 h-4" />
              </div>
              Need help choosing settings?
            </motion.button>
          </div>
          </div>
        </div>

        {/* Decision Timer Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Decision Timer
            </h2>
              
              {/* Status indicator */}
              <div className="flex items-center">
                {completedSections.decisionTimer ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center bg-green-100 rounded-full p-1"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center bg-orange-100 rounded-full p-1"
                  >
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  </motion.div>
                )}
                
                {/* Status badge */}
                {completedSections.decisionTimer && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700"
                  >
                    Completed
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          <div className="p-5">
          <TimerSettingsSection
            timerOption={timerOption}
            handleTimerOptionChange={handleTimerOptionChange}
            customDuration={customDuration}
            setCustomDuration={setCustomDuration}
            durationUnit={durationUnit}
            setDurationUnit={setDurationUnit}
            showHelpTooltip={showHelpTooltip}
            setShowHelpTooltip={setShowHelpTooltip}
          />
          </div>
        </div>

        {/* Deadline & Notifications Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-emerald-600" />
              Deadline & Notifications
            </h2>
              
              {/* Status indicator */}
              <div className="flex items-center">
                {completedSections.deadlineNotifications ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center bg-green-100 rounded-full p-1"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center bg-orange-100 rounded-full p-1"
                  >
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  </motion.div>
                )}
                
                {/* Status badge */}
                {completedSections.deadlineNotifications && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700"
                  >
                    Completed
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          <div className="p-5 space-y-6">
          <DeadlineSection
            deadline={deadline}
            setDeadline={setDeadline}
            minDate={minDate}
            showHelpTooltip={showHelpTooltip}
            setShowHelpTooltip={setShowHelpTooltip}
            selectedMeals={selectedMeals}
            setSelectedMeals={setSelectedMeals}
          />
            
            <div className="border-t border-gray-100 pt-5">
          <RemindersSection
            reminders={reminders}
            setReminders={setReminders}
            deadline={deadline}
            showHelpTooltip={showHelpTooltip}
            setShowHelpTooltip={setShowHelpTooltip}
          />
        </div>
          </div>
        </div>
      </div>

      {/* Help Side Menu */}
      <AnimatePresence>
        {showHelpMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelpMenu(false)}
            />
            
            {/* Side Menu */}
            <motion.div
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Setting Up Your Room</h3>
                  <button
                    onClick={() => setShowHelpMenu(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Help Content */}
                <div className="space-y-6">
                  <p className="text-gray-600">Tips for configuring the perfect decision-making space</p>
                  
                  {/* Small Groups */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Small Groups (2-6 people)</h4>
                    </div>
                    <p className="text-blue-800 text-sm">
                      Ideal for close friends and immediate team. Use shorter timers (15-30 min) to keep energy high.
                    </p>
                  </div>

                  {/* Medium Groups */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">Medium Groups (7-12 people)</h4>
                    </div>
                    <p className="text-green-800 text-sm">
                      Good for extended teams. Set deadlines within 48 hours and enable reminders to ensure participation.
                    </p>
                  </div>

                  {/* Large Groups */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-900">Large Groups (12+)</h4>
                    </div>
                    <p className="text-purple-800 text-sm">
                      For departments or communities. Consider longer timers (1 hour) and multi-day deadlines to accommodate schedules.
                    </p>
                  </div>

                  {/* Popular Combinations */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Most Popular Combinations:</h4>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <strong>Quick Decision:</strong> 6 people, 15 min timer, same-day deadline
                      </div>
                      <div className="text-sm">
                        <strong>Team Planning:</strong> 10 people, 30 min timer, 1-day deadline with reminders
                      </div>
                      <div className="text-sm">
                        <strong>Group Event:</strong> 15 people, 1 hour timer, weekend deadline with reminders
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 