import React, { useState, useEffect } from 'react';
import { Users, CalendarClock, Clock, BellRing, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
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
  setAccessControl
}: StepSettingsProps) {
  const [showHelpTooltip, setShowHelpTooltip] = useState<'participants' | 'timer' | 'deadline' | 'reminders' | null>(null);
  
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
    const isTimerComplete = timerOption !== '' && (
      timerOption !== 'custom' || 
      (customDuration && parseInt(customDuration) > 0)
    );
    setCompletedSections(prev => ({
      ...prev,
      decisionTimer: isTimerComplete
    }));
  }, [timerOption, customDuration]);

  // Update completion status when deadline/reminders change
  useEffect(() => {
    // Deadline is optional, so this section is always considered complete
    // But we can mark it as complete if user has set a deadline
    const isDeadlineComplete = deadline !== '' || reminders === false;
    setCompletedSections(prev => ({
      ...prev,
      deadlineNotifications: isDeadlineComplete
    }));
  }, [deadline, reminders]);

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
    <div className="max-w-5xl mx-auto">
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
              <CalendarClock className="w-5 h-5 text-rose-600" />
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
        
        {/* Help Button */}
        <button 
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <div className="p-1 rounded-full bg-gray-100">
            <Info className="w-4 h-4" />
          </div>
          Need help choosing settings?
        </button>
      </div>
    </div>
  );
} 